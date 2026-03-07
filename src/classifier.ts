/**
 * PromptClassifier - NLP-based intent detection for natural language prompts
 * Classifies user input into prompt types: generation, explanation, refactor, test, debug, docs
 */

export interface ClassificationResult {
	type: string;
	confidence: number;
	keywords: string[];
}

export class PromptClassifier {
	private typePatterns: Map<string, RegExp[]>;
	private typeKeywords: Map<string, string[]>;

	constructor() {
		this.typePatterns = new Map();
		this.typeKeywords = new Map();
		this.initializePatterns();
	}

	private initializePatterns() {
		// Code Generation patterns
		this.typeKeywords.set('generation', [
			'create', 'write', 'generate', 'make', 'build', 'implement',
			'function', 'class', 'component', 'hook', 'method', 'api',
			'snippet', 'template', 'scaffold', 'boilerplate'
		]);

		this.typePatterns.set('generation', [
			/^(create|write|generate|make|build|implement)\s+a?\s*(function|class|component|hook|method|api|snippet)/i,
			/write\s+code\s+for/i,
			/generate.*function/i,
			/new\s+(function|class|component)/i
		]);

		// Explanation patterns
		this.typeKeywords.set('explanation', [
			'explain', 'understand', 'what', 'how', 'why', 'what does',
			'break down', 'describe', 'clarify', 'elaborate', 'walk through',
			'complexity', 'algorithm', 'step by step'
		]);

		this.typePatterns.set('explanation', [
			/(explain|understand|clarify|break down|describe).*code/i,
			/how (does|do).*work/i,
			/what.*does.*do/i,
			/(step by step|walk through|break down).*\w+/i,
			/complexity.*analysis/i
		]);

		// Refactor patterns
		this.typeKeywords.set('refactor', [
			'refactor', 'improve', 'optimize', 'clean', 'simplify', 'restructure',
			'performance', 'efficiency', 'readability', 'maintainability', 'pattern',
			'best practice', 'modern', 'async', 'concurrent'
		]);

		this.typePatterns.set('refactor', [
			/refactor\s+.+\s+(for|to)/i,
			/(optimize|improve|clean|simplify).*code/i,
			/better\s+(performance|efficiency|readability)/i,
			/(async|concurrent|parallel).*pattern/i,
			/use.*best practice/i
		]);

		// Test patterns
		this.typeKeywords.set('test', [
			'test', 'unit test', 'integration', 'e2e', 'coverage', 'mock',
			'test case', 'test suite', 'edge case', 'scenario', 'jest', 'mocha',
			'testing', 'qa', 'quality assurance'
		]);

		this.typePatterns.set('test', [
			/write.*test.*for/i,
			/generate.*test/i,
			/unit test/i,
			/(test|coverage|mock).*\w+/i,
			/edge case/i
		]);

		// Debug patterns
		this.typeKeywords.set('debug', [
			'debug', 'fix', 'issue', 'bug', 'error', 'fail', 'not working',
			'crash', 'exception', 'trace', 'problem', 'troubleshoot', 'wrong',
			'why', 'doesn\'t work', 'broken'
		]);

		this.typePatterns.set('debug', [
			/(debug|fix|troubleshoot)\s+.+/i,
			/why.*fail/i,
			/(not working|broken|crash|error)/i,
			/why.*wrong/i,
			/stack trace/i
		]);

		// Documentation patterns
		this.typeKeywords.set('docs', [
			'document', 'doc', 'documentation', 'comment', 'jsdoc', 'readme',
			'explain', 'describe', 'usage', 'example', 'api docs', 'specification',
			'markdown', 'javadoc', 'docstring'
		]);

		this.typePatterns.set('docs', [
			/document.*\w+/i,
			/write.*doc/i,
			/generate.*documentation/i,
			/jsdoc.*for/i,
			/api.*doc/i
		]);
	}

	classify(input: string): ClassificationResult {
		const lowerInput = input.toLowerCase();
		const tokens = this.tokenize(input);

		const scores: Map<string, number> = new Map();

		// Initialize scores for all types
		for (const type of this.typePatterns.keys()) {
			scores.set(type, 0);
		}

		// Pattern matching (high weight)
		for (const [type, patterns] of this.typePatterns) {
			for (const pattern of patterns) {
				if (pattern.test(input)) {
					scores.set(type, (scores.get(type) || 0) + 3);
				}
			}
		}

		// Keyword matching (medium weight)
		for (const [type, keywords] of this.typeKeywords) {
			for (const keyword of keywords) {
				if (lowerInput.includes(keyword)) {
					scores.set(type, (scores.get(type) || 0) + 1);
				}
			}
		}

		// Find highest score
		let maxType = 'generation';
		let maxScore = 0;

		for (const [type, score] of scores) {
			if (score > maxScore) {
				maxScore = score;
				maxType = type;
			}
		}

		// Calculate confidence (0.0 - 1.0)
		const totalScore = Array.from(scores.values()).reduce((a, b) => a + b, 0);
		const confidence = totalScore > 0 ? maxScore / totalScore : 0.5;

		const foundKeywords = this.extractMatchingKeywords(input);

		return {
			type: maxType,
			confidence: Math.min(confidence, 0.99),
			keywords: foundKeywords
		};
	}

	private tokenize(input: string): string[] {
		return input
			.toLowerCase()
			.split(/\s+/)
			.map(token => token.replace(/[^\w]/g, ''))
			.filter(token => token.length > 0);
	}

	private extractMatchingKeywords(input: string): string[] {
		const lowerInput = input.toLowerCase();
		const matched: string[] = [];
		const seen = new Set<string>();

		for (const keywords of this.typeKeywords.values()) {
			for (const keyword of keywords) {
				if (!seen.has(keyword) && lowerInput.includes(keyword)) {
					matched.push(keyword);
					seen.add(keyword);
				}
			}
		}

		return matched.slice(0, 5);
	}
}
