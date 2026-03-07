import * as vscode from 'vscode';
import { PromptClassifier } from './classifier';
import { TemplateEngine } from './templates';
import { ChatIntegration } from './chat';
import { AnalyticsTracker } from './analytics';
import { ConfigManager } from './config';
import { PromptMindUI } from './ui';

let classifier: PromptClassifier;
let templateEngine: TemplateEngine;
let chatIntegration: ChatIntegration;
let analyticsTracker: AnalyticsTracker;
let configManager: ConfigManager;
let promptMindUI: PromptMindUI;

export function activate(context: vscode.ExtensionContext) {
	console.log('PromptMind extension activated');

	// Initialize services
	classifier = new PromptClassifier();
	configManager = new ConfigManager(context);
	templateEngine = new TemplateEngine(configManager);
	chatIntegration = new ChatIntegration();
	analyticsTracker = new AnalyticsTracker(context);
	promptMindUI = new PromptMindUI(classifier, templateEngine, configManager, analyticsTracker);

	// Register View Provider
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider('promptmindView', promptMindUI)
	);

	// Register commands
	registerCommands(context);

	console.log('PromptMind services initialized');
}

function registerCommands(context: vscode.ExtensionContext) {
	// Main classification command
	context.subscriptions.push(
		vscode.commands.registerCommand('promptmind.classifyPrompt', async () => {
			await handleClassifyPrompt();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('promptmind.generateRefactorPrompt', async () => {
			await handleGeneratePrompt('refactor');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('promptmind.generateCodePrompt', async () => {
			await handleGeneratePrompt('generation');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('promptmind.generateExplanationPrompt', async () => {
			await handleGeneratePrompt('explanation');
		})
	);

	// Usage statistics
	context.subscriptions.push(
		vscode.commands.registerCommand('promptmind.showUsageStats', async () => {
			await handleShowStats();
		})
	);

	// UI Panel
	context.subscriptions.push(
		vscode.commands.registerCommand('promptmind.showUI', async () => {
			promptMindUI.showUI();
		})
	);
}

async function handleClassifyPrompt() {
	const input = await vscode.window.showInputBox({
		placeHolder: 'Type a natural phrase (e.g., "fix this loop", "write tests", "explain this function")',
		prompt: 'PromptMind: Natural phrase classification'
	});

	if (!input) {
		return;
	}

	const classification = classifier.classify(input);
	
	const selectedType = await vscode.window.showQuickPick(
		[
			{ label: classification.type.toUpperCase(), description: `Confidence: ${(classification.confidence * 100).toFixed(0)}%`, picked: true },
			{ label: 'generation', description: 'Code Generation' },
			{ label: 'explanation', description: 'Code Explanation' },
			{ label: 'refactor', description: 'Code Refactoring' },
			{ label: 'test', description: 'Test Generation' },
			{ label: 'debug', description: 'Debugging' },
			{ label: 'docs', description: 'Documentation' }
		],
		{
			placeHolder: 'Select prompt type'
		}
	);

	if (!selectedType) {
		return;
	}

	const promptType = selectedType.label.toLowerCase() as any;
	await generateAndSendPrompt(input, promptType);
}

async function handleGeneratePrompt(promptType: string) {
	const input = await vscode.window.showInputBox({
		placeHolder: `Describe what you need... (e.g., "fix this loop", "add error handling")`,
		prompt: `PromptMind: ${promptType.charAt(0).toUpperCase() + promptType.slice(1)} Prompt`
	});

	if (!input) {
		return;
	}

	await generateAndSendPrompt(input, promptType);
}

async function generateAndSendPrompt(userInput: string, promptType: string) {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage('No active editor. Please open a file first.');
		return;
	}

	// Get context from editor
	const selection = editor.document.getText(editor.selection);
	const fileName = editor.document.fileName;
	const fileType = editor.document.languageId;

	// Generate expanded prompt
	const expandedPrompt = templateEngine.expandTemplate(promptType, {
		userInput,
		selection,
		fileName,
		fileType
	});

	// Track usage
	analyticsTracker.trackTemplateUsage(promptType);

	// Send to Copilot Chat
	await chatIntegration.sendToCopilotChat(expandedPrompt);

	// Show confirmation
	vscode.window.showInformationMessage(`✨ Prompt sent to Copilot Chat (${promptType})`);
}

async function handleShowStats() {
	const stats = analyticsTracker.getStats();
	
	const message = `📊 **PromptMind Usage Statistics**

**Total Prompts Generated:** ${stats.totalPrompts}

**By Type:**
${Object.entries(stats.byType)
	.map(([type, count]) => `• ${type.toUpperCase()}: ${count} prompts`)
	.join('\n')}

**Top Template:** ${stats.topTemplate ? stats.topTemplate.toUpperCase() : 'None yet'}

**Acceptance Rate:** ${stats.acceptanceRate}%`;

	const panel = vscode.window.createWebviewPanel(
		'promptmindStats',
		'PromptMind Statistics',
		vscode.ViewColumn.One,
		{}
	);

	panel.webview.html = getStatsHtml(stats);
}

function getStatsHtml(stats: any): string {
	const chartData = Object.entries(stats.byType)
		.map(([type, count]) => `
			<div style="margin: 10px 0;">
				<div style="display: flex; align-items: center;">
					<span style="width: 100px;">${type.toUpperCase()}</span>
					<div style="background: #0078d4; width: ${(count as number * 20)}px; height: 20px; border-radius: 3px;"></div>
					<span style="margin-left: 10px;">${count}</span>
				</div>
			</div>
		`)
		.join('');

	return `
		<!DOCTYPE html>
		<html>
		<head>
			<style>
				body { font-family: Arial, sans-serif; margin: 20px; color: #e0e0e0; background: #1e1e1e; }
				h1 { color: #0078d4; }
				.stat { margin: 15px 0; }
				.stat-label { font-weight: bold; }
				.stat-value { font-size: 24px; color: #0078d4; }
			</style>
		</head>
		<body>
			<h1>📊 PromptMind Statistics</h1>
			<div class="stat">
				<div class="stat-label">Total Prompts Generated</div>
				<div class="stat-value">${stats.totalPrompts}</div>
			</div>
			<div class="stat">
				<div class="stat-label">Prompts by Type</div>
				${chartData}
			</div>
			<div class="stat">
				<div class="stat-label">Top Template</div>
				<div class="stat-value">${stats.topTemplate ? stats.topTemplate.toUpperCase() : 'None yet'}</div>
			</div>
			<div class="stat">
				<div class="stat-label">Acceptance Rate</div>
				<div class="stat-value">${stats.acceptanceRate}%</div>
			</div>
		</body>
		</html>
	`;
}

export function deactivate() {
	console.log('PromptMind extension deactivated');
}
