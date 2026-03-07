import * as vscode from 'vscode';

/**
 * ChatIntegration - Handles integration with Copilot Chat
 * Sends expanded prompts to Copilot Chat with proper formatting
 */

export class ChatIntegration {
	async sendToCopilotChat(prompt: string): Promise<void> {
		try {
			// Track usage if needed from here, though extension.ts might handle it
			
			// Main command to open chat panel with a query
			await vscode.commands.executeCommand('workbench.action.chat.open', {
				query: prompt
			});
		} catch (error) {
			console.error('Error sending to Copilot Chat:', error);
			// Fallback: Copy to clipboard
			await vscode.env.clipboard.writeText(prompt);
			vscode.window.showInformationMessage('✅ Prompt copied to clipboard! Please paste into Copilot Chat.');
		}
	}

	private async showPromptInWebview(prompt: string): Promise<void> {
		const panel = vscode.window.createWebviewPanel(
			'promptmindPreview',
			'PromptMind: Expanded Prompt',
			vscode.ViewColumn.Beside,
			{
				enableScripts: true
			}
		);

		panel.webview.html = this.getPromptPreviewHtml(prompt);

		// Handle button clicks
		panel.webview.onDidReceiveMessage(
			async (message) => {
				if (message.command === 'copyToClipboard') {
					await vscode.env.clipboard.writeText(prompt);
					vscode.window.showInformationMessage('✅ Prompt copied to clipboard! Paste in Copilot Chat.');
				} else if (message.command === 'openChat') {
					await vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('vscode://copilot/'));
				}
			},
			undefined
		);
	}

	private getPromptPreviewHtml(prompt: string): string {
		const escapedPrompt = prompt
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');

		return `
<!DOCTYPE html>
<html>
<head>
	<style>
		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
			margin: 0;
			padding: 20px;
			color: #e0e0e0;
			background: #1e1e1e;
		}
		.container {
			max-width: 800px;
			margin: 0 auto;
		}
		h1 {
			color: #0078d4;
			margin-top: 0;
		}
		.prompt-box {
			background: #252526;
			border: 1px solid #3e3e42;
			border-radius: 4px;
			padding: 16px;
			margin: 16px 0;
			white-space: pre-wrap;
			word-wrap: break-word;
			font-family: 'Monaco', 'Courier New', monospace;
			font-size: 13px;
			line-height: 1.5;
			overflow-x: auto;
		}
		.buttons {
			display: flex;
			gap: 12px;
			margin-top: 20px;
		}
		button {
			background: #0078d4;
			color: white;
			border: none;
			padding: 10px 16px;
			border-radius: 4px;
			cursor: pointer;
			font-size: 13px;
			font-weight: 500;
			transition: background 0.2s;
		}
		button:hover {
			background: #006ba6;
		}
		button.secondary {
			background: #3e3e42;
			color: #e0e0e0;
		}
		button.secondary:hover {
			background: #4e4e52;
		}
		.info {
			background: #1e3a1f;
			border-left: 4px solid #89d185;
			padding: 12px;
			border-radius: 2px;
			margin-bottom: 16px;
			color: #89d185;
		}
	</style>
</head>
<body>
	<div class="container">
		<h1>✨ PromptMind: Expanded Prompt</h1>
		
		<div class="info">
			Your prompt has been generated and is ready to send to Copilot Chat.
		</div>

		<h2>Generated Prompt:</h2>
		<div class="prompt-box">${escapedPrompt}</div>

		<div class="buttons">
			<button onclick="copyToClipboard()">📋 Copy to Clipboard</button>
			<button class="secondary" onclick="openChat()">💬 Open Copilot Chat</button>
		</div>
	</div>

	<script>
		const vscode = acquireVsCodeApi();

		function copyToClipboard() {
			vscode.postMessage({ command: 'copyToClipboard' });
		}

		function openChat() {
			vscode.postMessage({ command: 'openChat' });
		}
	</script>
</body>
</html>
		`;
	}
}
