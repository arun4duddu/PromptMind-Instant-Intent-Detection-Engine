import * as vscode from 'vscode';

/**
 * ConfigManager - Manages extension configuration and templates
 * Persists settings to VS Code workspace configuration
 */

export class ConfigManager {
	private context: vscode.ExtensionContext;
	private config: vscode.WorkspaceConfiguration;

	constructor(context: vscode.ExtensionContext) {
		this.context = context;
		this.config = vscode.workspace.getConfiguration('promptmind');
	}

	public getExtensionContext(): vscode.ExtensionContext {
		return this.context;
	}

	getTemplate(type: string): string {
		const configKey = `${type}Template`;
		const template = this.config.get<string>(configKey);

		if (template) {
			return template;
		}

		return this.getDefaultTemplate(type);
	}

	getAllTemplates(): Record<string, string> {
		const types = ['generation', 'explanation', 'refactor', 'test', 'debug', 'docs'];
		const templates: Record<string, string> = {};

		for (const type of types) {
			templates[type] = this.getTemplate(type);
		}

		return templates;
	}

	async updateTemplate(type: string, template: string): Promise<void> {
		const configKey = `${type}Template`;
		await this.config.update(
			configKey,
			template,
			vscode.ConfigurationTarget.Global
		);
		// Refresh config after update
		this.config = vscode.workspace.getConfiguration('promptmind');
	}

	private getDefaultTemplate(type: string): string {
		const defaults: Record<string, string> = {
			generation:
				'Create [language] function for [description]. Examples: 2 inline cases. Match style of #file.',
			explanation:
				'Break down #selection line-by-line. Explain complexity, alternatives, and best practices.',
			refactor:
				'Refactor #selection for [goal]. Use async patterns from #file. Include 3 examples.',
			test:
				'Generate unit tests for #function covering edge cases, mocks, async. Use xUnit style.',
			debug:
				'/fix Explain why #selection fails. Show stack trace analysis and 2 fixes with pros/cons.',
			docs:
				'Generate comprehensive documentation for #selection. Include examples, edge cases, usage patterns.'
		};

		return defaults[type] || '';
	}

	isAnalyticsEnabled(): boolean {
		return this.config.get<boolean>('enableAnalytics', true);
	}

	getDefaultLanguage(): string {
		return this.config.get<string>('defaultLanguage', 'javascript');
	}

	shouldAutoInsertSelection(): boolean {
		return this.config.get<boolean>('autoInsertSelection', true);
	}

	// Store workspace state
	saveState(key: string, value: any): void {
		this.context.workspaceState.update(`promptmind.${key}`, value);
	}

	loadState(key: string): any {
		return this.context.workspaceState.get(`promptmind.${key}`);
	}

	// Store global state
	saveGlobalState(key: string, value: any): void {
		this.context.globalState.update(`promptmind.${key}`, value);
	}

	loadGlobalState(key: string): any {
		return this.context.globalState.get(`promptmind.${key}`);
	}
}
