import { ConfigManager } from './config';

/**
 * TemplateEngine - Expands prompt templates with variables and context
 * Interpolates #selection, #file, #fileType, and user input
 */

export interface TemplateContext {
	userInput: string;
	selection: string;
	fileName: string;
	fileType: string;
}

export class TemplateEngine {
	private configManager: ConfigManager;

	constructor(configManager: ConfigManager) {
		this.configManager = configManager;
	}

	expandTemplate(promptType: string, context: TemplateContext): string {
		const template = this.configManager.getTemplate(promptType);

		if (!template) {
			return this.buildFallbackPrompt(promptType, context);
		}

		return this.interpolateTemplate(template, context);
	}

	private interpolateTemplate(template: string, context: TemplateContext): string {
		let result = template;

		// Replace variables
		result = result.replace(/#selection/g, context.selection || '[no selection]');
		result = result.replace(/#file/g, this.extractFileName(context.fileName));
		result = result.replace(/#fileType/g, this.getLanguageName(context.fileType));
		result = result.replace(/#fileName/g, this.extractFileName(context.fileName));

		// Replace language placeholders
		result = result.replace(/\[language\]/g, this.getLanguageName(context.fileType));

		// Insert user input where appropriate
		result = this.insertUserInput(result, context.userInput);

		return result.trim();
	}

	private insertUserInput(template: string, userInput: string): string {
		// Check if template has placeholders for user input
		if (template.includes('[description]')) {
			return template.replace(/\[description\]/g, userInput);
		}
		if (template.includes('[goal]')) {
			return template.replace(/\[goal\]/g, userInput);
		}

		// Append user input if no placeholder exists
		if (userInput && !template.includes(userInput)) {
			return `${userInput}.\n\n${template}`;
		}

		return template;
	}

	private extractFileName(filePath: string): string {
		return filePath.split(/[\\/]/).pop() || filePath;
	}

	private getLanguageName(languageId: string): string {
		const languageMap: Record<string, string> = {
			'javascript': 'JavaScript',
			'typescript': 'TypeScript',
			'python': 'Python',
			'java': 'Java',
			'csharp': 'C#',
			'cpp': 'C++',
			'c': 'C',
			'go': 'Go',
			'rust': 'Rust',
			'php': 'PHP',
			'ruby': 'Ruby',
			'swift': 'Swift',
			'kotlin': 'Kotlin',
			'html': 'HTML',
			'css': 'CSS',
			'sql': 'SQL',
			'json': 'JSON',
			'xml': 'XML',
			'yaml': 'YAML',
			'markdown': 'Markdown'
		};

		return languageMap[languageId.toLowerCase()] || languageId;
	}

	private buildFallbackPrompt(promptType: string, context: TemplateContext): string {
		const selection = context.selection ? `\`\`\`${context.fileType}\n${context.selection}\n\`\`\`` : '';

		const fallbacks: Record<string, (ctx: TemplateContext) => string> = {
			generation: (ctx) =>
				`Create a ${this.getLanguageName(ctx.fileType)} function that ${ctx.userInput}.\n\nMatch the coding style from ${this.extractFileName(ctx.fileName)}.\n\nProvide 2-3 concrete usage examples.`,

			explanation: (ctx) =>
				`Explain the following ${this.getLanguageName(ctx.fileType)} code in detail:\n\n${selection}\n\nBreak it down line-by-line and discuss time/space complexity and alternatives.`,

			refactor: (ctx) =>
				`Refactor this code to ${ctx.userInput}.\n\n${selection}\n\nUse best practices from ${this.extractFileName(ctx.fileName)} and provide 2 alternative implementations.`,

			test: (ctx) =>
				`Generate comprehensive unit tests for the following code using modern testing practices:\n\n${selection}\n\nCover edge cases, error scenarios, and async operations. Use Jest/Vitest style.`,

			debug: (ctx) =>
				`Analyze and fix the issue in this code:\n\n${selection}\n\nProblem: ${ctx.userInput}\n\nExplain the root cause and provide 2 solutions with pros/cons.`,

			docs: (ctx) =>
				`Generate comprehensive documentation for:\n\n${selection}\n\nInclude: purpose, parameters, return values, examples, edge cases, and error handling.`
		};

		return fallbacks[promptType]?.(context) || `${context.userInput}\n\n${selection}`;
	}
}
