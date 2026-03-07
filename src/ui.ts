import * as vscode from 'vscode';
import { PromptClassifier } from './classifier';
import { TemplateEngine } from './templates';
import { ConfigManager } from './config';
import { AnalyticsTracker } from './analytics';
import { PromptGenerator, PROMPT_TECHNIQUES } from './promptGenerator';

/**
 * PromptMindUI - Manages the webview-based user interface
 * Provides a visual panel for prompt classification and template expansion
 */

export class PromptMindUI implements vscode.WebviewViewProvider {
	private classifier: PromptClassifier;
	private templateEngine: TemplateEngine;
	private configManager: ConfigManager;
	private analyticsTracker: AnalyticsTracker;
	private promptGenerator: PromptGenerator;
	private _view?: vscode.WebviewView;

	constructor(
		classifier: PromptClassifier,
		templateEngine: TemplateEngine,
		configManager: ConfigManager,
		analyticsTracker: AnalyticsTracker
	) {
		this.classifier = classifier;
		this.templateEngine = templateEngine;
		this.configManager = configManager;
		this.analyticsTracker = analyticsTracker;
		this.promptGenerator = new PromptGenerator(configManager);
	}

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			enableCommandUris: true,
			localResourceRoots: [
				vscode.Uri.joinPath(this.configManager.getExtensionContext().extensionUri, 'assets')
			]
		};

		webviewView.webview.html = this.getWebviewContent();

		webviewView.webview.onDidReceiveMessage(data => {
			this.handleMessage(data);
		});

		webviewView.onDidDispose(() => {
			this._view = undefined;
		});
	}

	showUI() {
		if (this._view) {
			this._view.show(true);
		} else {
			vscode.commands.executeCommand('promptmindView.focus');
		}
	}

	private async handleMessage(message: any) {
		switch (message.command) {
			case 'generatePrompt':
				await this.handleGeneratePrompt(message);
				break;
			case 'classify':
				this.handleClassifyMessage(message);
				break;
			case 'sendToChat':
				this.handleSendToChat(message);
				break;
			case 'getStats':
				this.sendStatsToUI();
				break;
			case 'updateTemplate':
				this.handleUpdateTemplate(message);
				break;
			case 'copyPrompt':
				await vscode.env.clipboard.writeText(message.prompt);
				vscode.window.showInformationMessage('✅ Prompt copied to clipboard!');
				break;
		}
	}

	private async handleGeneratePrompt(message: any) {
		const { input, selectedTechnique } = message;

		if (!input) {
			this._view?.webview.postMessage({
				command: 'error',
				message: 'Please enter a prompt'
			});
			return;
		}

		try {
			// Get editor context
			const editor = vscode.window.activeTextEditor;
			const selectedCode = editor?.document.getText(editor.selection) || '';
			const fileName = editor?.document.fileName || '';
			const fileType = editor?.document.languageId || 'text';

			// Generate dynamic prompt using the selected technique
			const technique = selectedTechnique || this.promptGenerator.recommendTechnique(input, fileType);
			
			// Generate 4 variations
			const generatedPrompts = await this.promptGenerator.generateVariations(
				technique,
				input,
				{
					selectedCode,
					fileType,
					fileName
				}
			);

			// Validate prompts
			generatedPrompts.forEach(prompt => {
				const validation = this.promptGenerator.validatePrompt(prompt);
				if (!validation.valid) {
					console.warn('Generated prompt validation issues:', validation.issues);
				}
			});

			// Track usage
			this.analyticsTracker.trackTemplateUsage(technique);

			// Send all 4 variations to UI
			this._view?.webview.postMessage({
				command: 'generatePromptResult',
				technique: technique,
				variations: generatedPrompts.map(p => ({
					original: p.original,
					generated: p.generated,
					instructions: p.instructions,
					confidence: p.confidence
				}))
			});
		} catch (error) {
			this._view?.webview.postMessage({
				command: 'error',
				message: `Error generating prompt: ${error instanceof Error ? error.message : 'Unknown error'}`
			});
		}
	}

	private handleClassifyMessage(message: any) {
		const { input, selectedType } = message;

		if (!input) {
			this._view?.webview.postMessage({
				command: 'error',
				message: 'Please enter a prompt'
			});
			return;
		}

		// Classify the input
		const classification = this.classifier.classify(input);

		// Use selected type or classification result
		const promptType = selectedType || classification.type;

		// Get editor context
		const editor = vscode.window.activeTextEditor;
		const selection = editor?.document.getText(editor.selection) || '';
		const fileName = editor?.document.fileName || '';
		const fileType = editor?.document.languageId || 'text';

		// Expand template
		const expandedPrompt = this.templateEngine.expandTemplate(promptType, {
			userInput: input,
			selection,
			fileName,
			fileType
		});

		// Track usage
		this.analyticsTracker.trackTemplateUsage(promptType);

		// Send result to UI
		this._view?.webview.postMessage({
			command: 'classifyResult',
			type: promptType,
			confidence: classification.confidence,
			expandedPrompt: expandedPrompt,
			keywords: classification.keywords
		});
	}

	private handleSendToChat(message: any) {
		const { prompt } = message;

		// Track usage but pass to the centralized chat integration service
		this.analyticsTracker.trackTemplateUsage('sent_to_chat');

		// Send to Copilot Chat using the primary command
		// In newer versions of VS Code, the command is 'workbench.action.chat.open' or 'workbench.panel.chat'
		// but 'github.copilot.chat.query' is the most direct for older SDKs.
		// Let's use the one that is most reliable.
		const openChat = async () => {
			try {
				await vscode.commands.executeCommand('workbench.action.chat.open', {
					query: prompt
				});
			} catch (error) {
				// Fallback if the command fails
				await vscode.env.clipboard.writeText(prompt);
				vscode.window.showInformationMessage('✅ Prompt copied to clipboard! Paste it into Copilot Chat.');
			}
		};
		openChat();
	}

	private sendStatsToUI() {
		const stats = this.analyticsTracker.getStats();

		this._view?.webview.postMessage({
			command: 'statsUpdate',
			stats: stats
		});
	}

	private handleUpdateTemplate(message: any) {
		const { type, template } = message;

		this.configManager.updateTemplate(type, template).then(() => {
			this._view?.webview.postMessage({
				command: 'templateUpdated',
				type: type,
				message: `Template for "${type}" updated!`
			});
		});
	}

	private getWebviewContent(): string {
		return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>PromptMind - Intent Detection Engine</title>
	<style>
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}

		body {
			background: #1c1c1e;
			color: #f5f5f7;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
			font-size: 13px;
			letter-spacing: -0.01em;
			line-height: 1.47;
		}

		.container {
			min-height: 100vh;
			height: auto;
			overflow: auto;
			background: #1c1c1e;
			display: flex;
			flex-direction: column;
		}

		header {
			background: rgba(28, 28, 30, 0.8);
			backdrop-filter: blur(20px);
			padding: 16px;
			border-bottom: 1px solid rgba(255, 255, 255, 0.1);
			position: sticky;
			top: 0;
			z-index: 100;
		}

		header h1 {
			font-size: 20px;
			font-weight: 600;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: 2px;
			color: #ffffff;
			letter-spacing: -0.02em;
		}

		header h1 > div {
			display: flex;
			align-items: center;
			gap: 8px;
		}

		.tagline {
			font-size: 11px;
			font-weight: 400;
			color: #8e8e93;
			letter-spacing: 0;
			text-transform: none;
			margin-left: 30px;
		}

		.emoji {
			width: 24px;
			height: 24px;
			object-fit: contain;
			filter: drop-shadow(0 0 8px rgba(0, 122, 255, 0.4));
		}

		main {
			flex: 1;
			padding: 20px 16px;
		}

		.section {
			margin-bottom: 24px;
		}

		.section-title {
			font-size: 11px;
			font-weight: 600;
			color: #8e8e93;
			margin-bottom: 10px;
			text-transform: uppercase;
			letter-spacing: 0.05em;
		}

		input[type="text"],
		textarea {
			background: #2c2c2e;
			border: 1px solid rgba(255, 255, 255, 0.1);
			color: #ffffff;
			padding: 12px 14px;
			border-radius: 10px;
			font-family: inherit;
			font-size: 14px;
			resize: none;
			transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
			width: 100%;
			margin-bottom: 12px;
			box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
		}

		input[type="text"]:focus,
		textarea:focus {
			outline: none;
			border-color: #007aff;
			background: #3a3a3c;
			box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.15);
		}

		.type-selector {
			display: flex;
			flex-wrap: wrap;
			gap: 10px;
			margin-bottom: 20px;
		}

		.type-button {
			padding: 8px 4px;
			background: #2c2c2e;
			border: 1px solid rgba(255, 255, 255, 0.1);
			color: #f5f5f7;
			border-radius: 12px;
			cursor: pointer;
			font-size: 10px;
			font-weight: 500;
			transition: all 0.2s ease;
			text-align: center;
			flex: 1 1 calc(25% - 8px);
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 4px;
			min-width: 0;
		}

		.type-button span:first-child {
			font-size: 16px;
		}

		.type-button span:last-child {
			font-size: 10px;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			width: 100%;
		}

		.type-button:hover {
			background: #3a3a3c;
			transform: translateY(-1px);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		}

		.type-button.active {
			background: #007aff;
			border-color: #007aff;
			color: #ffffff;
			box-shadow: 0 4px 15px rgba(0, 122, 255, 0.3);
		}

		.buttons {
			display: flex;
			gap: 10px;
			margin-top: 10px;
		}

		button {
			flex: 1;
			padding: 12px 20px;
			background: #007aff;
			color: white;
			border: none;
			border-radius: 12px;
			cursor: pointer;
			font-weight: 600;
			font-size: 14px;
			transition: all 0.2s ease;
			box-shadow: 0 4px 12px rgba(0, 122, 255, 0.2);
		}

		button:hover {
			background: #0071e3;
			transform: translateY(-1px);
			box-shadow: 0 6px 16px rgba(0, 122, 255, 0.3);
		}

		button:active {
			background: #0062c3;
			transform: translateY(0);
		}

		.result-box {
			background: #1c1c1e;
			border: 1px solid rgba(255, 255, 255, 0.1);
			border-radius: 12px;
			padding: 16px;
			font-size: 14px;
			line-height: 1.6;
			max-height: 300px;
			overflow-y: auto;
			font-family: "SF Mono", "Menlo", "Monaco", "Courier New", monospace;
			word-break: break-word;
			color: #f5f5f7;
			margin-bottom: 12px;
			transition: all 0.2s ease;
		}

		.variation-block {
			margin-bottom: 20px;
			padding: 16px;
			background: #2c2c2e;
			border-radius: 14px;
			box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
			border: 1px solid rgba(255, 255, 255, 0.05);
			transition: transform 0.2s ease;
		}

		.variation-block:hover {
			transform: scale(1.01);
		}

		.variation-block > div:first-child {
			font-size: 11px;
			color: #007aff;
			font-weight: 700;
			margin-bottom: 6px;
			text-transform: uppercase;
			letter-spacing: 0.05em;
		}

		.copy-variation-btn,
		.send-variation-btn {
			padding: 8px 16px;
			font-size: 12px;
			border-radius: 18px;
			font-weight: 600;
			letter-spacing: -0.01em;
		}

		.copy-variation-btn {
			background: rgba(255, 255, 255, 0.08);
			color: #ffffff;
			border: 1px solid rgba(255, 255, 255, 0.1);
		}

		.copy-variation-btn:hover {
			background: rgba(255, 255, 255, 0.15);
			color: #ffffff;
		}

		.send-variation-btn {
			background: #007aff;
			color: white;
		}

		footer {
			padding: 24px 16px;
			text-align: center;
			font-size: 11px;
			color: #8e8e93;
			border-top: 1px solid rgba(255, 255, 255, 0.05);
		}

		.loading {
			display: none;
			text-align: center;
			padding: 40px;
		}

		.spinner {
			width: 24px;
			height: 24px;
			border: 3px solid rgba(0, 122, 255, 0.1);
			border-top: 3px solid #007aff;
			border-radius: 50%;
			animation: spin 1s linear infinite;
			margin: 0 auto;
		}

		@keyframes spin {
			0% { transform: rotate(0deg); }
			100% { transform: rotate(360deg); }
		}

		.buttons {
			display: flex;
			gap: 6px;
			margin-top: 4px;
		}

		.copy-variation-btn, .send-variation-btn {
				   min-width: 32px;
				   min-height: 28px;
				   padding: 4px 10px;
				   font-size: 12px;
				   border-radius: 6px;
				   border: none;
				   font-weight: 500;
				   cursor: pointer;
				   transition: background 0.18s, color 0.18s;
				   box-shadow: 0 1px 3px 0 rgba(30,34,43,0.04);
			   }
		.copy-variation-btn {
			background: #f4f6fb;
			color: #22223b;
			border: 1px solid #d1d5db;
		}

		.copy-variation-btn:hover {
			background: #e0e7ef;
			color: #0078d4;
			border-color: #b6c2d9;
		}

		.send-variation-btn {
			background: #0078d4;
			color: #fff;
			border: 1px solid #0078d4;
		}

		.send-variation-btn:hover {
			background: #005fa3;
			color: #fff;
			border-color: #005fa3;
		}

		::-webkit-scrollbar-thumb:hover {
			background: #4e4e52;
		}
	</style>
</head>
<body>
	<div class="container">
		<header>
			<h1>
				<div><img src="${this._view?.webview.asWebviewUri(vscode.Uri.joinPath(this.configManager.getExtensionContext().extensionUri, 'assets', 'promptmindicon.png'))}" class="emoji" alt="PromptMind"> PromptMind</div>
				<div class="tagline">Prompt Engineering Made Easy</div>
			</h1>
		</header>

		<main>
			<!-- Input Section -->
			<div class="section">
				<div class="section-title">📝 Your Request</div>
				<input 
					type="text" 
					id="promptInput" 
					placeholder="e.g., 'write a function to sort arrays', 'fix this bug', 'explain this code'..."
					autocomplete="off"
				/>
				<textarea id="selectedCode" placeholder="Optional: selected code will appear here..."></textarea>
			</div>

			<!-- Type Selection Section -->
			<div class="section">
				<div class="section-title">🎯 Prompt Technique – Choose a prompt type to automatically generate optimized prompts. </div>
				<div class="type-selector">
					<button class="type-button" data-technique="Expert Prompt"><span>🎓</span><span>Expert Prompt</span></button>
					<button class="type-button" data-technique="Emotion Prompt"><span>🫶</span><span>Emotion Prompt</span></button>
					<button class="type-button" data-technique="Thread of Thought Prompt"><span>🧠</span><span>Reasoning Prompt</span></button>
					<button class="type-button" data-technique="Chain of Verification Prompt"><span>🔗</span><span>Chain of verification Prompt</span></button>
					<button class="type-button" data-technique="Zero-Shot Prompt"><span>⚡</span><span>Zero-Shot Prompt</span></button>
					<button class="type-button" data-technique="Role-Based Prompt"><span>🎭</span><span>Role Based Prompt</span></button>
					<button class="type-button" data-technique="Code Generation Prompt"><span>💻</span><span>Code Prompt</span></button>
					<button class="type-button" data-technique="Formatting Prompt"><span>🧩</span><span>Format Prompt</span></button>
				</div>
				<div class="confidence hidden">
					<div>Confidence:</div>
					<div class="confidence-bar">
						<div class="confidence-fill"></div>
					</div>
					<div class="confidence-percent">0%</div>
				</div>
			</div>

			<!-- Messages -->
			<div id="messages"></div>

			<!-- Loading -->
			<div id="loading" class="loading">
				<div class="spinner"></div>
				<div style="margin-top: 8px; font-size: 12px;">Processing...</div>
			</div>

			<!-- Results Section -->
			<div class="section hidden" id="resultsSection">
				<div id="expanded" class="tab-content active">
					<!-- Dynamic variation content will be injected here -->
				</div>
			</div>


		</main>

		<footer>
			PromptMind v0.1.0 • Published by Creative Visual Studio Extensions Company
		</footer>
	</div>

	<script>
		const vscode = acquireVsCodeApi();

		let selectedTechnique = null;
		let currentPrompt = null;

		// Get selected code if available
		function updateSelectedCode() {
			// This is a placeholder - actual selection would come from editor
			document.getElementById('selectedCode').value = '[Selected code will appear here]';
		}

		// Type button selection - now for techniques
		document.querySelectorAll('.type-button').forEach(btn => {
			btn.addEventListener('click', () => {
				document.querySelectorAll('.type-button').forEach(b => b.classList.remove('active'));
				btn.classList.add('active');
				selectedTechnique = btn.dataset.technique;
				// Auto-classify when technique button is clicked and input exists
				const input = document.getElementById('promptInput').value.trim();
				if (input) {
					classifyPrompt();
				}
			});
		});

		// Classify on Enter
		document.getElementById('promptInput').addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				classifyPrompt();
			}
		});

		// Classify prompt
		function classifyPrompt() {
			const input = document.getElementById('promptInput').value.trim();
			
			if (!input) {
				showMessage('Please enter a prompt', 'error');
				return;
			}

			showLoading(true);
			
			vscode.postMessage({
				command: 'generatePrompt',
				input: input,
				selectedTechnique: selectedTechnique
			});
		}

		// Handle generation result
		window.addEventListener('message', (event) => {
			const message = event.data;

			switch (message.command) {
				case 'generatePromptResult':
					handleGenerateResult(message);
					break;
				case 'statsUpdate':
					updateStats(message.stats);
					break;
				case 'error':
					showMessage(message.message, 'error');
					showLoading(false);
					break;
				case 'templateUpdated':
					showMessage(message.message, 'success');
					break;
			}
		});

		function handleGenerateResult(result) {
			showLoading(false);
			
			// Set current prompt to first variation
			currentPrompt = result.variations[0].generated;

			// Show results section
			const resultsSection = document.getElementById('resultsSection');
			resultsSection.classList.remove('hidden');

			const tabContents = document.querySelector('#expanded');
			tabContents.innerHTML = result.variations.map(function(variation, idx) {
				return '<div class="variation-block" style="margin-bottom: 24px;">' +
					'<div style="font-size: 13px; color: #007aff; font-weight: bold; margin-bottom: 4px;">Variation ' + (idx + 1) + '</div>' +
					'<div style="margin-bottom: 8px; font-size: 11px; color: #8e8e93; font-weight: 600;">' + variation.instructions + '</div>' +
					'<div style="font-size: 12px; color: #007aff; margin-bottom: 8px;">Confidence: ' + (variation.confidence * 100).toFixed(0) + '%</div>' +
					'<div class="result-box" tabindex="0" readonly>' +
						'<pre style="margin:0; background:none; border:none; font-family:inherit; font-size:inherit; color:inherit; white-space:pre-wrap;">' +
						variation.generated.replace(/</g, '&lt;').replace(/>/g, '&gt;') +
						'</pre>' +
					'</div>' +
					'<div class="buttons">' +
						'<button class="copy-variation-btn" data-variation="' + idx + '">📋 Copy</button>' +
						'<button class="send-variation-btn" data-variation="' + idx + '">💬 Send to Copilot</button>' +
					'</div>' +
				'</div>';
			}).join('');

			// Attach copy buttons
			document.querySelectorAll('.copy-variation-btn').forEach(btn => {
				btn.addEventListener('click', () => {
					const variation = parseInt(btn.dataset.variation);
					const prompt = result.variations[variation].generated;
					vscode.postMessage({
						command: 'copyPrompt',
						prompt: prompt
					});
				});
			});

			// Attach send buttons
			document.querySelectorAll('.send-variation-btn').forEach(btn => {
				btn.addEventListener('click', () => {
					const variation = parseInt(btn.dataset.variation);
					const prompt = result.variations[variation].generated;
					vscode.postMessage({
						command: 'sendToChat',
						prompt: prompt
					});
				});
			});

			showMessage('✅ Generated 4 dynamic prompt variations!', 'success');
		}

		// Show/hide loading
		function showLoading(show) {
			document.getElementById('loading').classList.toggle('show', show);
		}

		// Show message
		function showMessage(text, type = 'info') {
			const messagesEl = document.getElementById('messages');
			const msgEl = document.createElement('div');
			msgEl.className = \`message \${type}\`;
			msgEl.textContent = text;
			messagesEl.appendChild(msgEl);

			setTimeout(() => msgEl.remove(), 4000);
		}

		// Initialize
		updateSelectedCode();
	</script>
</body>
</html>`;
	}
}
