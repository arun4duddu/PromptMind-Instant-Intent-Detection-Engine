import * as vscode from 'vscode';

/**
 * AnalyticsTracker - Tracks template usage and acceptance rates
 * Stores metrics locally in VS Code's global state
 */

export interface UsageStats {
	totalPrompts: number;
	byType: Record<string, number>;
	topTemplate: string | null;
	acceptanceRate: number;
	lastUpdated: number;
}

export class AnalyticsTracker {
	private context: vscode.ExtensionContext;
	private readonly STATS_KEY = 'promptmind.usageStats';
	private readonly ACCEPTANCE_KEY = 'promptmind.acceptance';

	constructor(context: vscode.ExtensionContext) {
		this.context = context;
		this.initializeStats();
	}

	private initializeStats(): void {
		const stats = this.context.globalState.get<UsageStats>(this.STATS_KEY);

		if (!stats) {
			const defaultStats: UsageStats = {
				totalPrompts: 0,
				byType: {
					generation: 0,
					explanation: 0,
					refactor: 0,
					test: 0,
					debug: 0,
					docs: 0
				},
				topTemplate: null,
				acceptanceRate: 0,
				lastUpdated: Date.now()
			};

			this.context.globalState.update(this.STATS_KEY, defaultStats);
		}
	}

	trackTemplateUsage(templateType: string): void {
		const stats = this.getStats();

		stats.totalPrompts++;

		if (stats.byType[templateType] !== undefined) {
			stats.byType[templateType]++;
		}

		stats.lastUpdated = Date.now();

		// Update top template
		let maxCount = 0;
		let topType: string | null = null;

		for (const [type, count] of Object.entries(stats.byType)) {
			if (count > maxCount) {
				maxCount = count;
				topType = type;
			}
		}

		stats.topTemplate = topType;

		this.context.globalState.update(this.STATS_KEY, stats);
	}

	recordAcceptance(accepted: boolean): void {
		const stats = this.getStats();
		const currentRate = stats.acceptanceRate;
		const newCount = stats.totalPrompts;

		if (newCount === 0) {
			return;
		}

		// Calculate weighted average
		const acceptedCount = Math.round((currentRate / 100) * (newCount - 1));
		const totalAccepted = accepted ? acceptedCount + 1 : acceptedCount;
		stats.acceptanceRate = Math.round((totalAccepted / newCount) * 100);

		this.context.globalState.update(this.STATS_KEY, stats);
	}

	getStats(): UsageStats {
		const stats = this.context.globalState.get<UsageStats>(this.STATS_KEY);

		if (!stats) {
			return {
				totalPrompts: 0,
				byType: {
					generation: 0,
					explanation: 0,
					refactor: 0,
					test: 0,
					debug: 0,
					docs: 0
				},
				topTemplate: null,
				acceptanceRate: 0,
				lastUpdated: Date.now()
			};
		}

		return stats;
	}

	resetStats(): void {
		const defaultStats: UsageStats = {
			totalPrompts: 0,
			byType: {
				generation: 0,
				explanation: 0,
				refactor: 0,
				test: 0,
				debug: 0,
				docs: 0
			},
			topTemplate: null,
			acceptanceRate: 0,
			lastUpdated: Date.now()
		};

		this.context.globalState.update(this.STATS_KEY, defaultStats);
	}

	getTypeStats(type: string): number {
		const stats = this.getStats();
		return stats.byType[type] || 0;
	}

	getUsagePercentage(type: string): number {
		const stats = this.getStats();

		if (stats.totalPrompts === 0) {
			return 0;
		}

		return Math.round((stats.byType[type] / stats.totalPrompts) * 100);
	}

	/**
	 * Get recommended templates based on usage patterns
	 */
	getRecommendedTemplates(): string[] {
		const stats = this.getStats();
		const recommendations: Array<[string, number]> = [];

		for (const [type, count] of Object.entries(stats.byType)) {
			if (count > 0) {
				recommendations.push([type, count]);
			}
		}

		// Sort by count descending
		recommendations.sort((a, b) => b[1] - a[1]);

		// Return top 3 templates
		return recommendations.slice(0, 3).map(([type]) => type);
	}

	exportStats(): string {
		const stats = this.getStats();
		const exportData = {
			...stats,
			exportDate: new Date().toISOString(),
			recommendations: this.getRecommendedTemplates()
		};

		return JSON.stringify(exportData, null, 2);
	}
}
