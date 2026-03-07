"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode4 = __toESM(require("vscode"));

// src/classifier.ts
var PromptClassifier = class {
  constructor() {
    this.typePatterns = /* @__PURE__ */ new Map();
    this.typeKeywords = /* @__PURE__ */ new Map();
    this.initializePatterns();
  }
  initializePatterns() {
    this.typeKeywords.set("generation", [
      "create",
      "write",
      "generate",
      "make",
      "build",
      "implement",
      "function",
      "class",
      "component",
      "hook",
      "method",
      "api",
      "snippet",
      "template",
      "scaffold",
      "boilerplate"
    ]);
    this.typePatterns.set("generation", [
      /^(create|write|generate|make|build|implement)\s+a?\s*(function|class|component|hook|method|api|snippet)/i,
      /write\s+code\s+for/i,
      /generate.*function/i,
      /new\s+(function|class|component)/i
    ]);
    this.typeKeywords.set("explanation", [
      "explain",
      "understand",
      "what",
      "how",
      "why",
      "what does",
      "break down",
      "describe",
      "clarify",
      "elaborate",
      "walk through",
      "complexity",
      "algorithm",
      "step by step"
    ]);
    this.typePatterns.set("explanation", [
      /(explain|understand|clarify|break down|describe).*code/i,
      /how (does|do).*work/i,
      /what.*does.*do/i,
      /(step by step|walk through|break down).*\w+/i,
      /complexity.*analysis/i
    ]);
    this.typeKeywords.set("refactor", [
      "refactor",
      "improve",
      "optimize",
      "clean",
      "simplify",
      "restructure",
      "performance",
      "efficiency",
      "readability",
      "maintainability",
      "pattern",
      "best practice",
      "modern",
      "async",
      "concurrent"
    ]);
    this.typePatterns.set("refactor", [
      /refactor\s+.+\s+(for|to)/i,
      /(optimize|improve|clean|simplify).*code/i,
      /better\s+(performance|efficiency|readability)/i,
      /(async|concurrent|parallel).*pattern/i,
      /use.*best practice/i
    ]);
    this.typeKeywords.set("test", [
      "test",
      "unit test",
      "integration",
      "e2e",
      "coverage",
      "mock",
      "test case",
      "test suite",
      "edge case",
      "scenario",
      "jest",
      "mocha",
      "testing",
      "qa",
      "quality assurance"
    ]);
    this.typePatterns.set("test", [
      /write.*test.*for/i,
      /generate.*test/i,
      /unit test/i,
      /(test|coverage|mock).*\w+/i,
      /edge case/i
    ]);
    this.typeKeywords.set("debug", [
      "debug",
      "fix",
      "issue",
      "bug",
      "error",
      "fail",
      "not working",
      "crash",
      "exception",
      "trace",
      "problem",
      "troubleshoot",
      "wrong",
      "why",
      "doesn't work",
      "broken"
    ]);
    this.typePatterns.set("debug", [
      /(debug|fix|troubleshoot)\s+.+/i,
      /why.*fail/i,
      /(not working|broken|crash|error)/i,
      /why.*wrong/i,
      /stack trace/i
    ]);
    this.typeKeywords.set("docs", [
      "document",
      "doc",
      "documentation",
      "comment",
      "jsdoc",
      "readme",
      "explain",
      "describe",
      "usage",
      "example",
      "api docs",
      "specification",
      "markdown",
      "javadoc",
      "docstring"
    ]);
    this.typePatterns.set("docs", [
      /document.*\w+/i,
      /write.*doc/i,
      /generate.*documentation/i,
      /jsdoc.*for/i,
      /api.*doc/i
    ]);
  }
  classify(input) {
    const lowerInput = input.toLowerCase();
    const tokens = this.tokenize(input);
    const scores = /* @__PURE__ */ new Map();
    for (const type of this.typePatterns.keys()) {
      scores.set(type, 0);
    }
    for (const [type, patterns] of this.typePatterns) {
      for (const pattern of patterns) {
        if (pattern.test(input)) {
          scores.set(type, (scores.get(type) || 0) + 3);
        }
      }
    }
    for (const [type, keywords] of this.typeKeywords) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          scores.set(type, (scores.get(type) || 0) + 1);
        }
      }
    }
    let maxType = "generation";
    let maxScore = 0;
    for (const [type, score] of scores) {
      if (score > maxScore) {
        maxScore = score;
        maxType = type;
      }
    }
    const totalScore = Array.from(scores.values()).reduce((a, b) => a + b, 0);
    const confidence = totalScore > 0 ? maxScore / totalScore : 0.5;
    const foundKeywords = this.extractMatchingKeywords(input);
    return {
      type: maxType,
      confidence: Math.min(confidence, 0.99),
      keywords: foundKeywords
    };
  }
  tokenize(input) {
    return input.toLowerCase().split(/\s+/).map((token) => token.replace(/[^\w]/g, "")).filter((token) => token.length > 0);
  }
  extractMatchingKeywords(input) {
    const lowerInput = input.toLowerCase();
    const matched = [];
    const seen = /* @__PURE__ */ new Set();
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
};

// src/templates.ts
var TemplateEngine = class {
  constructor(configManager2) {
    this.configManager = configManager2;
  }
  expandTemplate(promptType, context) {
    const template = this.configManager.getTemplate(promptType);
    if (!template) {
      return this.buildFallbackPrompt(promptType, context);
    }
    return this.interpolateTemplate(template, context);
  }
  interpolateTemplate(template, context) {
    let result = template;
    result = result.replace(/#selection/g, context.selection || "[no selection]");
    result = result.replace(/#file/g, this.extractFileName(context.fileName));
    result = result.replace(/#fileType/g, this.getLanguageName(context.fileType));
    result = result.replace(/#fileName/g, this.extractFileName(context.fileName));
    result = result.replace(/\[language\]/g, this.getLanguageName(context.fileType));
    result = this.insertUserInput(result, context.userInput);
    return result.trim();
  }
  insertUserInput(template, userInput) {
    if (template.includes("[description]")) {
      return template.replace(/\[description\]/g, userInput);
    }
    if (template.includes("[goal]")) {
      return template.replace(/\[goal\]/g, userInput);
    }
    if (userInput && !template.includes(userInput)) {
      return `${userInput}.

${template}`;
    }
    return template;
  }
  extractFileName(filePath) {
    return filePath.split(/[\\/]/).pop() || filePath;
  }
  getLanguageName(languageId) {
    const languageMap = {
      "javascript": "JavaScript",
      "typescript": "TypeScript",
      "python": "Python",
      "java": "Java",
      "csharp": "C#",
      "cpp": "C++",
      "c": "C",
      "go": "Go",
      "rust": "Rust",
      "php": "PHP",
      "ruby": "Ruby",
      "swift": "Swift",
      "kotlin": "Kotlin",
      "html": "HTML",
      "css": "CSS",
      "sql": "SQL",
      "json": "JSON",
      "xml": "XML",
      "yaml": "YAML",
      "markdown": "Markdown"
    };
    return languageMap[languageId.toLowerCase()] || languageId;
  }
  buildFallbackPrompt(promptType, context) {
    const selection = context.selection ? `\`\`\`${context.fileType}
${context.selection}
\`\`\`` : "";
    const fallbacks = {
      generation: (ctx) => `Create a ${this.getLanguageName(ctx.fileType)} function that ${ctx.userInput}.

Match the coding style from ${this.extractFileName(ctx.fileName)}.

Provide 2-3 concrete usage examples.`,
      explanation: (ctx) => `Explain the following ${this.getLanguageName(ctx.fileType)} code in detail:

${selection}

Break it down line-by-line and discuss time/space complexity and alternatives.`,
      refactor: (ctx) => `Refactor this code to ${ctx.userInput}.

${selection}

Use best practices from ${this.extractFileName(ctx.fileName)} and provide 2 alternative implementations.`,
      test: (ctx) => `Generate comprehensive unit tests for the following code using modern testing practices:

${selection}

Cover edge cases, error scenarios, and async operations. Use Jest/Vitest style.`,
      debug: (ctx) => `Analyze and fix the issue in this code:

${selection}

Problem: ${ctx.userInput}

Explain the root cause and provide 2 solutions with pros/cons.`,
      docs: (ctx) => `Generate comprehensive documentation for:

${selection}

Include: purpose, parameters, return values, examples, edge cases, and error handling.`
    };
    return fallbacks[promptType]?.(context) || `${context.userInput}

${selection}`;
  }
};

// src/chat.ts
var vscode = __toESM(require("vscode"));
var ChatIntegration = class {
  async sendToCopilotChat(prompt) {
    try {
      await vscode.commands.executeCommand("workbench.action.chat.open", {
        query: prompt
      });
    } catch (error) {
      console.error("Error sending to Copilot Chat:", error);
      await vscode.env.clipboard.writeText(prompt);
      vscode.window.showInformationMessage("\u2705 Prompt copied to clipboard! Please paste into Copilot Chat.");
    }
  }
  async showPromptInWebview(prompt) {
    const panel = vscode.window.createWebviewPanel(
      "promptmindPreview",
      "PromptMind: Expanded Prompt",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true
      }
    );
    panel.webview.html = this.getPromptPreviewHtml(prompt);
    panel.webview.onDidReceiveMessage(
      async (message) => {
        if (message.command === "copyToClipboard") {
          await vscode.env.clipboard.writeText(prompt);
          vscode.window.showInformationMessage("\u2705 Prompt copied to clipboard! Paste in Copilot Chat.");
        } else if (message.command === "openChat") {
          await vscode.commands.executeCommand("vscode.open", vscode.Uri.parse("vscode://copilot/"));
        }
      },
      void 0
    );
  }
  getPromptPreviewHtml(prompt) {
    const escapedPrompt = prompt.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
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
		<h1>\u2728 PromptMind: Expanded Prompt</h1>
		
		<div class="info">
			Your prompt has been generated and is ready to send to Copilot Chat.
		</div>

		<h2>Generated Prompt:</h2>
		<div class="prompt-box">${escapedPrompt}</div>

		<div class="buttons">
			<button onclick="copyToClipboard()">\u{1F4CB} Copy to Clipboard</button>
			<button class="secondary" onclick="openChat()">\u{1F4AC} Open Copilot Chat</button>
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
};

// src/analytics.ts
var AnalyticsTracker = class {
  constructor(context) {
    this.STATS_KEY = "promptmind.usageStats";
    this.ACCEPTANCE_KEY = "promptmind.acceptance";
    this.context = context;
    this.initializeStats();
  }
  initializeStats() {
    const stats = this.context.globalState.get(this.STATS_KEY);
    if (!stats) {
      const defaultStats = {
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
  trackTemplateUsage(templateType) {
    const stats = this.getStats();
    stats.totalPrompts++;
    if (stats.byType[templateType] !== void 0) {
      stats.byType[templateType]++;
    }
    stats.lastUpdated = Date.now();
    let maxCount = 0;
    let topType = null;
    for (const [type, count] of Object.entries(stats.byType)) {
      if (count > maxCount) {
        maxCount = count;
        topType = type;
      }
    }
    stats.topTemplate = topType;
    this.context.globalState.update(this.STATS_KEY, stats);
  }
  recordAcceptance(accepted) {
    const stats = this.getStats();
    const currentRate = stats.acceptanceRate;
    const newCount = stats.totalPrompts;
    if (newCount === 0) {
      return;
    }
    const acceptedCount = Math.round(currentRate / 100 * (newCount - 1));
    const totalAccepted = accepted ? acceptedCount + 1 : acceptedCount;
    stats.acceptanceRate = Math.round(totalAccepted / newCount * 100);
    this.context.globalState.update(this.STATS_KEY, stats);
  }
  getStats() {
    const stats = this.context.globalState.get(this.STATS_KEY);
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
  resetStats() {
    const defaultStats = {
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
  getTypeStats(type) {
    const stats = this.getStats();
    return stats.byType[type] || 0;
  }
  getUsagePercentage(type) {
    const stats = this.getStats();
    if (stats.totalPrompts === 0) {
      return 0;
    }
    return Math.round(stats.byType[type] / stats.totalPrompts * 100);
  }
  /**
   * Get recommended templates based on usage patterns
   */
  getRecommendedTemplates() {
    const stats = this.getStats();
    const recommendations = [];
    for (const [type, count] of Object.entries(stats.byType)) {
      if (count > 0) {
        recommendations.push([type, count]);
      }
    }
    recommendations.sort((a, b) => b[1] - a[1]);
    return recommendations.slice(0, 3).map(([type]) => type);
  }
  exportStats() {
    const stats = this.getStats();
    const exportData = {
      ...stats,
      exportDate: (/* @__PURE__ */ new Date()).toISOString(),
      recommendations: this.getRecommendedTemplates()
    };
    return JSON.stringify(exportData, null, 2);
  }
};

// src/config.ts
var vscode2 = __toESM(require("vscode"));
var ConfigManager = class {
  constructor(context) {
    this.context = context;
    this.config = vscode2.workspace.getConfiguration("promptmind");
  }
  getExtensionContext() {
    return this.context;
  }
  getTemplate(type) {
    const configKey = `${type}Template`;
    const template = this.config.get(configKey);
    if (template) {
      return template;
    }
    return this.getDefaultTemplate(type);
  }
  getAllTemplates() {
    const types = ["generation", "explanation", "refactor", "test", "debug", "docs"];
    const templates = {};
    for (const type of types) {
      templates[type] = this.getTemplate(type);
    }
    return templates;
  }
  async updateTemplate(type, template) {
    const configKey = `${type}Template`;
    await this.config.update(
      configKey,
      template,
      vscode2.ConfigurationTarget.Global
    );
    this.config = vscode2.workspace.getConfiguration("promptmind");
  }
  getDefaultTemplate(type) {
    const defaults = {
      generation: "Create [language] function for [description]. Examples: 2 inline cases. Match style of #file.",
      explanation: "Break down #selection line-by-line. Explain complexity, alternatives, and best practices.",
      refactor: "Refactor #selection for [goal]. Use async patterns from #file. Include 3 examples.",
      test: "Generate unit tests for #function covering edge cases, mocks, async. Use xUnit style.",
      debug: "/fix Explain why #selection fails. Show stack trace analysis and 2 fixes with pros/cons.",
      docs: "Generate comprehensive documentation for #selection. Include examples, edge cases, usage patterns."
    };
    return defaults[type] || "";
  }
  isAnalyticsEnabled() {
    return this.config.get("enableAnalytics", true);
  }
  getDefaultLanguage() {
    return this.config.get("defaultLanguage", "javascript");
  }
  shouldAutoInsertSelection() {
    return this.config.get("autoInsertSelection", true);
  }
  // Store workspace state
  saveState(key, value) {
    this.context.workspaceState.update(`promptmind.${key}`, value);
  }
  loadState(key) {
    return this.context.workspaceState.get(`promptmind.${key}`);
  }
  // Store global state
  saveGlobalState(key, value) {
    this.context.globalState.update(`promptmind.${key}`, value);
  }
  loadGlobalState(key) {
    return this.context.globalState.get(`promptmind.${key}`);
  }
};

// src/ui.ts
var vscode3 = __toESM(require("vscode"));

// src/promptGenerator.ts
var PROMPT_TECHNIQUES = [
  "Expert Prompt",
  "Emotion Prompt",
  "Thread of Thought Prompt",
  "Chain of Verification Prompt",
  "Zero-Shot Prompt",
  "Role-Based Prompt",
  "Instructional Prompt",
  "Code Generation Prompt",
  "Formatting Prompt",
  "Analytical Prompt",
  "Test Case Prompt"
];
var _PromptGenerator = class _PromptGenerator {
  constructor(configManager2) {
    this.configManager = configManager2;
  }
  /**
   * Generate 4 dynamic variations of the same technique
   */
  async generateVariations(technique, userInput, context) {
    const variations = [];
    for (let i = 0; i < 4; i++) {
      const randomOffset = Math.random() * 100;
      const variation = await this.generatePrompt(
        technique,
        userInput,
        context,
        i
        // seed for randomization (0, 1, 2, 3)
      );
      variations.push(variation);
    }
    return variations;
  }
  /**
   * Generate a dynamic prompt based on technique and user input
   */
  async generatePrompt(technique, userInput, context, variationSeed = 0) {
    const _template = PROMPT_TECHNIQUES.includes(technique) ? technique : PROMPT_TECHNIQUES[0];
    let baseTemplate = _PromptGenerator.TECHNIQUE_TEMPLATES[_template];
    const domain = context?.domain || this.inferDomain(userInput, context);
    const role = context?.role || this.inferRole(_template);
    const fileType = context?.fileType || "code";
    const variationInstructions = this.generateVariationInstructions(_template, variationSeed);
    function seededShuffle(array, seed) {
      let arr = array.slice();
      let m = arr.length, t, i;
      let s = seed + 1;
      while (m) {
        i = Math.floor(Math.abs(Math.sin(s++) * 1e4) % m--);
        t = arr[m];
        arr[m] = arr[i];
        arr[i] = t;
      }
      return arr;
    }
    let generatedPrompt = "";
    const promptBlueprints = {
      "Expert Prompt": [
        (input, domain2, role2, fileType2, seed) => `As a ${role2} in ${domain2}, analyze: "${input}"

\u2713 List 3 best practices
\u2713 Identify a common pitfall
\u2713 Suggest a novel approach`,
        (input, domain2, role2, fileType2, seed) => `You are a ${role2}. For the following challenge in ${domain2}: "${input}"

Provide:
1. A step-by-step solution
2. A checklist for review
3. A warning about what to avoid`,
        (input, domain2, role2, fileType2, seed) => `Given the task: "${input}"

Write as a ${role2}:
- A summary of the problem
- 2+ alternative solutions
- A clarifying question about requirements`,
        (input, domain2, role2, fileType2, seed) => `Imagine you are mentoring a junior ${role2} in ${domain2}. For: "${input}"

Explain:
- The reasoning behind your approach
- A real-world example
- A tip for long-term maintainability`
      ],
      "Emotion Prompt": [
        (input, domain2, role2, fileType2, seed) => `Describe how users might feel about: "${input}"

- List 2 positive emotions and 2 negative emotions
- Suggest a way to improve user satisfaction
- What would delight the user?`,
        (input, domain2, role2, fileType2, seed) => `For the scenario: "${input}"

Analyze:
- Emotional impact on each stakeholder
- A possible emotional conflict
- How to resolve it with empathy`,
        (input, domain2, role2, fileType2, seed) => `Imagine a user is frustrated by: "${input}"

- What could cause this frustration?
- How would you redesign for delight?
- What feedback would validate your solution?`,
        (input, domain2, role2, fileType2, seed) => `Consider the emotional journey for: "${input}"

- Map the highs and lows
- What moments are critical?
- Suggest a feature to boost positive feelings`
      ],
      "Thread of Thought Prompt": [
        (input, domain2, role2, fileType2, seed) => `Think aloud about: "${input}"

1. First consideration
2. Next logical step
3. Potential obstacles
4. How to overcome them
5. Final conclusion`,
        (input, domain2, role2, fileType2, seed) => `For the problem: "${input}"

Break it into logical steps:
- List each step
- State one assumption per step
- Note dependencies`,
        (input, domain2, role2, fileType2, seed) => `Given: "${input}", what are 3 possible approaches?

For each:
- Pros and cons
- Resource requirements
- Risk assessment`,
        (input, domain2, role2, fileType2, seed) => `Explain your thought process for: "${input}"

Show your work:
- What you considered first
- How thinking evolved
- What question remains unanswered`
      ],
      "Chain of Verification Prompt": [
        (input, domain2, role2, fileType2, seed) => `Verify the following: "${input}"

- List each assumption
- For each, state how you would test it
- What would disprove it?`,
        (input, domain2, role2, fileType2, seed) => `For: "${input}"

Create a verification checklist:
- At each step, what must be true?
- How would you confirm?
- What's your confidence level?`,
        (input, domain2, role2, fileType2, seed) => `Given: "${input}"

What evidence would prove success?
- At least 3 types of evidence
- How to measure each
- What would constitute failure?`,
        (input, domain2, role2, fileType2, seed) => `Imagine a failure scenario in: "${input}"

- What would you check first?
- How to isolate the root cause?
- How to prevent recurrence?`
      ],
      "Zero-Shot Prompt": [
        (input, domain2, role2, fileType2, seed) => `Without examples, answer: "${input}"

- Your answer
- Your justification
- Why this is the best approach`,
        (input, domain2, role2, fileType2, seed) => `For: "${input}"

Use only general knowledge:
- The solution
- Core principles applied
- Why these principles work here`,
        (input, domain2, role2, fileType2, seed) => `Given: "${input}"

What is the most logical approach?
- Explain your reasoning
- What assumptions are you making?
- How would you validate them?`,
        (input, domain2, role2, fileType2, seed) => `Solve: "${input}"

Without reference cases:
- Your solution
- State your key assumptions
- What would change your answer?`
      ],
      "Role-Based Prompt": [
        (input, domain2, role2, fileType2, seed) => `As a ${role2}, how would you approach: "${input}"?

- Your priorities
- Key constraints you'd consider
- Recommended solution`,
        (input, domain2, role2, fileType2, seed) => `For the role of ${role2}, analyze: "${input}"

- What constraints are unique to this role?
- Best practices from your field
- How this differs from other perspectives`,
        (input, domain2, role2, fileType2, seed) => `Imagine you are a ${role2} in ${domain2}.

For: "${input}"
- How would you solve this?
- What best practice would you apply?
- What would you warn about?`,
        (input, domain2, role2, fileType2, seed) => `Given: "${input}"

What would a ${role2} do differently from a generalist?
- Specialized approach
- Industry-specific practices
- Advanced techniques only a ${role2} would know`
      ],
      "Instructional Prompt": [
        (input, domain2, role2, fileType2, seed) => `Write step-by-step instructions for: "${input}"

1. Prerequisites/Setup
2. Steps
3. Expected result
4. Troubleshooting tip`,
        (input, domain2, role2, fileType2, seed) => `For: "${input}"

Create a completion checklist:
- Items to prepare
- Actions to take
- Success criteria
- Common mistakes to avoid`,
        (input, domain2, role2, fileType2, seed) => `Describe how to accomplish: "${input}"

- Begin with overview
- Detailed process
- List common mistakes
- Summary of expected results`,
        (input, domain2, role2, fileType2, seed) => `Explain the process for: "${input}"

- Prerequisites
- Step-by-step walkthrough
- Decision points
- How to verify success`
      ],
      "Code Generation Prompt": [
        (input, domain2, role2, fileType2, seed) => `Write code in ${fileType2} to: "${input}"

Requirements:
- Add comments for each major step
- Include error handling
- Optimize for readability`,
        (input, domain2, role2, fileType2, seed) => `For: "${input}"

Generate a function in ${fileType2}:
- Clear function signature
- Comprehensive comments
- Error handling
- Example usage`,
        (input, domain2, role2, fileType2, seed) => `Create a code snippet for: "${input}" in ${fileType2}.

- Optimize for readability
- Include edge case handling
- Add type hints/annotations if applicable`,
        (input, domain2, role2, fileType2, seed) => `Develop a reusable module for: "${input}"

- Well-documented API
- Production-ready quality
- Examples of how to use
- Testing considerations`
      ],
      "Formatting Prompt": [
        (input, domain2, role2, fileType2, seed) => `Format the following for clarity: "${input}"

- Use bullet points
- Hierarchical structure
- Emphasis on key items`,
        (input, domain2, role2, fileType2, seed) => `For: "${input}"

Create a structured summary:
- Use a table or list
- Highlight key points
- Add a summary sentence`,
        (input, domain2, role2, fileType2, seed) => `Rewrite: "${input}"

- Emphasize structure and hierarchy
- Use formatting for clarity
- Make it scannable`,
        (input, domain2, role2, fileType2, seed) => `Organize: "${input}"

- Add headings and subheadings
- Use consistent formatting
- Group related information`
      ],
      "Analytical Prompt": [
        (input, domain2, role2, fileType2, seed) => `Analyze: "${input}"

- Identify the root cause
- What patterns emerge?
- What data supports your conclusion?`,
        (input, domain2, role2, fileType2, seed) => `For: "${input}"

Provide deep analysis:
- List 3 key data points
- What does each reveal?
- What's the bigger picture?`,
        (input, domain2, role2, fileType2, seed) => `Given: "${input}"

What trends can you infer?
- Support with reasoning
- What's predictable?
- What's uncertain?`,
        (input, domain2, role2, fileType2, seed) => `Break down: "${input}"

Analyze thoroughly:
- Root causes
- Contributing factors
- Evidence for each claim`
      ],
      "Test Case Prompt": [
        (input, domain2, role2, fileType2, seed) => `Write 3 test cases for: "${input}"

- A happy path scenario
- An edge case
- An error condition`,
        (input, domain2, role2, fileType2, seed) => `For: "${input}"

Design a test plan:
- Normal conditions
- Error conditions
- Boundary values`,
        (input, domain2, role2, fileType2, seed) => `Given: "${input}"

What boundary values should be tested?
- Min/max values
- Empty/null cases
- Large/complex data`,
        (input, domain2, role2, fileType2, seed) => `Create tests for: "${input}"

- Unit tests
- Integration tests
- Expected outputs for each`
      ]
    };
    const blueprints = promptBlueprints[_template] || [
      (input, domain2, role2, fileType2, seed) => baseTemplate.replace(/{INPUT}/g, input).replace(/\[DOMAIN\]/g, domain2).replace(/\[ROLE\]/g, role2).replace(/\[FILE_TYPE\]/g, fileType2)
    ];
    const randomSeed = Math.floor(Math.random() * blueprints.length);
    const selectedBlueprintIndex = (variationSeed + randomSeed) % blueprints.length;
    const blueprint = blueprints[selectedBlueprintIndex];
    generatedPrompt = blueprint(userInput, domain, role, fileType, variationSeed);
    generatedPrompt = this.addDynamicEnhancements(generatedPrompt, _template, variationSeed);
    generatedPrompt = this.addVariationFraming(generatedPrompt, _template, variationSeed);
    if (context?.selectedCode) {
      generatedPrompt += `

Context (${fileType}):

${context.selectedCode}

`;
    }
    return {
      technique: _template,
      original: userInput,
      generated: generatedPrompt,
      instructions: variationInstructions,
      confidence: Math.min(this.calculateConfidence(_template, userInput, context) + variationSeed * 0.02, 0.99)
    };
  }
  /**
   * Generate multiple technique variations
   */
  async generateMultipleTechniques(userInput, context, techniques) {
    const techniquesToUse = techniques || PROMPT_TECHNIQUES;
    const results = await Promise.all(
      techniquesToUse.map(
        (technique) => this.generatePrompt(technique, userInput, context)
      )
    );
    return results;
  }
  /**
   * Recommend best technique for input
   */
  recommendTechnique(userInput, fileType) {
    const lower = userInput.toLowerCase();
    if (lower.includes("test") || lower.includes("verify") || lower.includes("check")) {
      return "Chain of Verification Prompt";
    }
    if (lower.includes("step") || lower.includes("how") || lower.includes("process")) {
      return "Instructional Prompt";
    }
    if (lower.includes("explain") || lower.includes("understand")) {
      return "Analytical Prompt";
    }
    if (lower.includes("generate") || lower.includes("write") || lower.includes("create")) {
      if (fileType?.includes("code") || fileType?.includes("js")) {
        return "Code Generation Prompt";
      }
      return "Expert Prompt";
    }
    if (lower.includes("think") || lower.includes("reason")) {
      return "Thread of Thought Prompt";
    }
    if (lower.includes("test") || lower.includes("case") || lower.includes("scenario")) {
      return "Test Case Prompt";
    }
    if (lower.includes("format") || lower.includes("structure")) {
      return "Formatting Prompt";
    }
    return "Expert Prompt";
  }
  /**
   * Get technique-specific instructions
   */
  getInstructions(technique) {
    const instructions = {
      "Expert Prompt": "Leverage deep expertise and industry best practices for authoritative solutions",
      "Emotion Prompt": "Consider emotional intelligence and user experience perspectives",
      "Thread of Thought Prompt": "Work through reasoning step-by-step for clarity",
      "Chain of Verification Prompt": "Verify each step with evidence and confidence levels",
      "Zero-Shot Prompt": "Use general knowledge without relying on examples",
      "Role-Based Prompt": "Adopt a specific professional role for perspective",
      "Instructional Prompt": "Create clear, actionable step-by-step instructions",
      "Code Generation Prompt": "Produce production-ready, well-documented code",
      "Formatting Prompt": "Organize and structure information for clarity",
      "Analytical Prompt": "Provide data-driven insights and root cause analysis",
      "Test Case Prompt": "Generate comprehensive test scenarios including edge cases"
    };
    return instructions[technique] || "Generate a prompt using this technique";
  }
  /**
   * Infer domain from user input and context
   */
  inferDomain(userInput, context) {
    const lower = userInput.toLowerCase();
    if (lower.includes("react") || lower.includes("javascript"))
      return "Frontend Development";
    if (lower.includes("python") || lower.includes("django"))
      return "Python Development";
    if (lower.includes("database") || lower.includes("sql"))
      return "Database Design";
    if (lower.includes("api") || lower.includes("rest"))
      return "API Development";
    if (lower.includes("security") || lower.includes("auth"))
      return "Security Engineering";
    if (context?.fileType)
      return `${context.fileType} Development`;
    return "Software Development";
  }
  /**
   * Infer role from technique
   */
  inferRole(technique) {
    const roles = {
      "Expert Prompt": [
        "Senior Software Architect",
        "Principal Engineer",
        "Staff Engineer",
        "Technical Lead",
        "Industry Consultant",
        "Distinguished Engineer",
        "CTO Advisor",
        "Solution Architect",
        "Engineering Manager",
        "Technology Evangelist",
        "R&D Lead",
        "Platform Architect"
      ],
      "Emotion Prompt": [
        "UX Designer",
        "Product Designer",
        "Empathy Coach",
        "Psychology-Informed Writer",
        "Customer Experience Strategist",
        "Behavioral Researcher",
        "Wellbeing Coach",
        "Human-Centered Designer",
        "User Researcher",
        "Community Manager",
        "Brand Storyteller",
        "Therapeutic Communication Coach"
      ],
      "Thread of Thought Prompt": [
        "Analytical Thinker",
        "Philosophy Professor",
        "Strategy Consultant",
        "Mathematical Problem Solver",
        "Logic Coach",
        "Debate Champion",
        "Critical Thinking Trainer",
        "Systems Thinker",
        "Theoretical Researcher",
        "Cognitive Scientist",
        "Puzzle Solver",
        "Reasoning Specialist"
      ],
      "Chain of Verification Prompt": [
        "QA Engineer",
        "Security Auditor",
        "Code Reviewer",
        "Compliance Analyst",
        "Fact Checker",
        "Risk Analyst",
        "Internal Auditor",
        "Penetration Tester",
        "Governance Specialist",
        "Process Inspector",
        "Quality Manager",
        "Trust & Safety Analyst"
      ],
      "Zero-Shot Prompt": [
        "Generalist Developer",
        "Startup Engineer",
        "Fast Prototyper",
        "Problem Solver",
        "Technical Generalist",
        "Indie Hacker",
        "Product Builder",
        "No-Code Hacker",
        "Rapid Innovator",
        "MVP Specialist",
        "Creative Technologist",
        "Growth Engineer"
      ],
      "Role-Based Prompt": [
        "Domain Specialist",
        "Healthcare Expert",
        "FinTech Consultant",
        "Legal Advisor",
        "Education Specialist",
        "E-commerce Strategist",
        "Marketing Consultant",
        "Supply Chain Analyst",
        "HR Business Partner",
        "Climate Tech Expert",
        "Gaming Industry Expert",
        "Travel Industry Consultant"
      ],
      "Instructional Prompt": [
        "Technical Writer",
        "Documentation Specialist",
        "Course Instructor",
        "Developer Advocate",
        "Curriculum Designer",
        "Online Tutor",
        "Workshop Facilitator",
        "Knowledge Base Manager",
        "Learning Experience Designer",
        "EdTech Content Creator",
        "Training Specialist",
        "Mentor Coach"
      ],
      "Code Generation Prompt": [
        "Senior Software Engineer",
        "Backend Engineer",
        "Frontend Engineer",
        "Full-Stack Developer",
        "Open Source Contributor",
        "API Developer",
        "Mobile App Developer",
        "Cloud Engineer",
        "DevOps Engineer",
        "Game Developer",
        "AI Engineer",
        "Automation Engineer"
      ],
      "Formatting Prompt": [
        "Data Organizer",
        "Information Architect",
        "Technical Editor",
        "Content Strategist",
        "Knowledge Manager",
        "Notion Consultant",
        "Workflow Designer",
        "Digital Librarian",
        "Process Documenter",
        "Operations Manager",
        "Documentation Architect",
        "Content Curator"
      ],
      "Analytical Prompt": [
        "Data Analyst",
        "Data Scientist",
        "Business Analyst",
        "Research Analyst",
        "ML Engineer",
        "Quantitative Analyst",
        "Market Researcher",
        "Product Analyst",
        "Decision Scientist",
        "BI Engineer",
        "Growth Analyst",
        "Statistician"
      ],
      "Test Case Prompt": [
        "Test Engineer",
        "Automation Engineer",
        "SDET",
        "QA Lead",
        "Performance Tester",
        "Load Tester",
        "Reliability Engineer",
        "Bug Hunter",
        "Chaos Engineer",
        "Test Architect",
        "CI/CD Quality Engineer",
        "Release Validator"
      ]
    };
    const roleArray = roles[technique] || ["Expert Developer"];
    return roleArray[Math.floor(Math.random() * roleArray.length)];
  }
  /**
   * Calculate confidence score
   */
  calculateConfidence(technique, userInput, context) {
    let confidence = 0.7;
    if (context?.selectedCode)
      confidence += 0.1;
    if (context?.fileType)
      confidence += 0.05;
    if (context?.domain)
      confidence += 0.05;
    if (userInput.length > 50)
      confidence += 0.05;
    if (userInput.includes("?"))
      confidence += 0.03;
    if (technique === "Expert Prompt")
      confidence += 0.05;
    if (technique === "Code Generation Prompt" && context?.fileType?.includes("code")) {
      confidence += 0.1;
    }
    return Math.min(confidence, 0.99);
  }
  /**
   * Create custom template for new technique
   */
  createCustomTemplate(technique) {
    return `Apply the "${technique}" technique to:
"{INPUT}"

Follow the principles of this approach and provide a comprehensive response.`;
  }
  /**
   * Validate generated prompt
   */
  validatePrompt(prompt) {
    const issues = [];
    if (!prompt.generated || prompt.generated.trim().length === 0) {
      issues.push("Generated prompt is empty");
    }
    if (prompt.generated.length < 20) {
      issues.push("Generated prompt is too short");
    }
    if (prompt.confidence < 0.5) {
      issues.push("Low confidence in generation");
    }
    return {
      valid: issues.length === 0,
      issues
    };
  }
  /**
   * Generate variation-specific instructions for each of the 4 variations
   */
  generateVariationInstructions(technique, seed) {
    const baseInstructions = {
      "Expert Prompt": [
        "V1: Leverage deep expertise and industry best practices for authoritative solutions",
        "V2: Draw on specialized knowledge and proven methodologies for robust implementation",
        "V3: Apply expert-level analysis with cutting-edge practices and patterns",
        "V4: Use authoritative experience and gold-standard approaches"
      ],
      "Emotion Prompt": [
        "V1: Consider emotional intelligence and user experience perspectives",
        "V2: Evaluate human factors and psychological impact on users",
        "V3: Assess emotional context and stakeholder feelings",
        "V4: Reflect on emotional outcomes and satisfaction drivers"
      ],
      "Thread of Thought Prompt": [
        "V1: Work through reasoning step-by-step for clarity",
        "V2: Trace logic sequentially with explicit reasoning",
        "V3: Build argument progressively with justifications",
        "V4: Connect thoughts linearly for transparent thinking"
      ],
      "Chain of Verification Prompt": [
        "V1: Verify each step with evidence and confidence levels",
        "V2: Validate assumptions with proof points at each stage",
        "V3: Confirm conclusions with supporting evidence throughout",
        "V4: Check validity at every step with certainty metrics"
      ],
      "Zero-Shot Prompt": [
        "V1: Use general knowledge without relying on examples",
        "V2: Apply foundational understanding without reference cases",
        "V3: Leverage inherent knowledge minus demonstrations",
        "V4: Draw from intrinsic expertise without precedents"
      ],
      "Role-Based Prompt": [
        "V1: Adopt a specific professional role for perspective",
        "V2: Take on specialized role identity for viewpoint",
        "V3: Assume professional stance for unique angle",
        "V4: Embody expert persona for specialized insight"
      ],
      "Instructional Prompt": [
        "V1: Create clear, actionable step-by-step instructions",
        "V2: Write explicit, sequential procedural guidance",
        "V3: Develop detailed, comprehensive how-to format",
        "V4: Provide unambiguous, methodical process steps"
      ],
      "Code Generation Prompt": [
        "V1: Produce production-ready, well-documented code",
        "V2: Generate robust code with comprehensive comments",
        "V3: Create optimized, maintainable implementation",
        "V4: Write clean, thoroughly annotated code"
      ],
      "Formatting Prompt": [
        "V1: Organize and structure information for clarity",
        "V2: Format and arrange content for readability",
        "V3: Restructure and layout data logically",
        "V4: Standardize and compose information effectively"
      ],
      "Analytical Prompt": [
        "V1: Provide data-driven insights and root cause analysis",
        "V2: Deliver evidence-based findings and deep investigation",
        "V3: Offer statistical insights with causal analysis",
        "V4: Present fact-based conclusions and origin analysis"
      ],
      "Test Case Prompt": [
        "V1: Generate comprehensive test scenarios including edge cases",
        "V2: Create thorough test coverage with boundary conditions",
        "V3: Develop extensive test plans with corner cases",
        "V4: Design complete test suite with exception handling"
      ]
    };
    const instructions = baseInstructions[technique] || [
      "V1: Generate a prompt using this technique",
      "V2: Generate a prompt using this technique",
      "V3: Generate a prompt using this technique",
      "V4: Generate a prompt using this technique"
    ];
    return instructions[seed % 4];
  }
  /**
   * Add variation-specific framing to the prompt
   */
  addVariationFraming(generatedPrompt, technique, seed) {
    const framings = {
      0: "\n\n---\n[Variation 1]",
      1: "\n\n---\n[Variation 2 - Alternative Approach]",
      2: "\n\n---\n[Variation 3 - Enhanced Detail]",
      3: "\n\n---\n[Variation 4 - Comprehensive Format]"
    };
    let framedPrompt = generatedPrompt;
    if (seed === 1) {
      framedPrompt += "\n\nProvide alternative viewpoints or approaches beyond the initial solution.";
    } else if (seed === 2) {
      framedPrompt += "\n\nInclude more detailed explanations and deeper analysis.";
    } else if (seed === 3) {
      framedPrompt += "\n\nProvide a comprehensive, well-structured response with all relevant sections.";
    }
    return framedPrompt;
  }
  /**
   * Add dynamic enhancements to make each prompt generation unique
   */
  addDynamicEnhancements(generatedPrompt, technique, seed) {
    const enhancements = [
      (p) => p + "\n\n\u{1F4A1} Tip: Focus on actionable insights.",
      (p) => p + "\n\n\u26A1 Speed Priority: Provide quick, decisive answers.",
      (p) => p + "\n\n\u{1F3AF} Precision Focus: Be specific and avoid generalizations.",
      (p) => p + "\n\n\u{1F50D} Deep Dive: Provide comprehensive, thorough analysis.",
      (p) => p + "\n\n\u{1F4CA} Data-Driven: Support answers with evidence and metrics.",
      (p) => p + "\n\n\u{1F680} Innovation Mode: Suggest creative and novel approaches.",
      (p) => p + "\n\n\u2705 Quality Assurance: Include validation and verification steps.",
      (p) => p + "\n\n\u{1F9E0} Critical Thinking: Challenge assumptions and explore edge cases.",
      (p) => p + "\n\n\u{1F393} Educational: Explain underlying concepts and principles.",
      (p) => p + "\n\n\u2699\uFE0F Practical: Focus on implementation and real-world application."
    ];
    const enhancementIndex = Math.floor(Math.random() * enhancements.length);
    return enhancements[enhancementIndex](generatedPrompt);
  }
};
_PromptGenerator.TECHNIQUE_TEMPLATES = {
  "Expert Prompt": `You are an expert developer with deep knowledge in [DOMAIN]. 
Analyze the following request and provide a detailed, professional response based on industry best practices:
"{INPUT}"

Provide:
- Expert analysis and insights
- Best practices and patterns
- Potential edge cases to consider
- Implementation recommendations`,
  "Emotion Prompt": `Imagine you are passionate about solving this problem. 
Consider the emotional context and user experience implications:
"{INPUT}"

Analyze:
- How might users feel about this solution?
- What emotional intelligence is needed?
- How does this impact user satisfaction?`,
  "Thread of Thought Prompt": `Let me think through this step-by-step:
1. First, consider: "{INPUT}"
2. Break down the problem into components
3. Trace through the logic path
4. Verify each assumption
5. Draw conclusions

Please work through this reasoning process:`,
  "Chain of Verification Prompt": `Verify this step-by-step:
"{INPUT}"

For each step:
1. Is this assumption valid?
2. Can this be proven?
3. What evidence supports this?
4. What could invalidate this?
5. What's the confidence level?

Provide verification chain:`,
  "Zero-Shot Prompt": `Without any prior examples, solve this:
"{INPUT}"

Use only:
- Your general knowledge
- Logical reasoning
- Domain understanding
- No reference examples

Direct answer:`,
  "Role-Based Prompt": `You are a [ROLE] tasked with addressing this:
"{INPUT}"

As a [ROLE], your perspective is:
- Priorities and constraints
- Expertise and knowledge
- Best practices in your field
- Potential solutions from your viewpoint`,
  "Instructional Prompt": `Create clear, step-by-step instructions for:
"{INPUT}"

Format as:
1. Prerequisites/Setup
2. Step-by-step process
3. Expected outcomes
4. Troubleshooting tips
5. Best practices

Instructions:`,
  "Code Generation Prompt": `Generate production-ready code that:
"{INPUT}"

Requirements:
- Follow best practices
- Include error handling
- Add comprehensive comments
- Consider performance
- Ensure readability

Code:`,
  "Formatting Prompt": `Format and structure the following into:
"{INPUT}"

Apply:
- Clear hierarchy
- Consistent styling
- Proper organization
- Readability improvements
- Standard conventions

Formatted output:`,
  "Analytical Prompt": `Analyze this thoroughly:
"{INPUT}"

Provide:
- Root cause analysis
- Pattern identification
- Data-driven insights
- Trend analysis
- Key findings with evidence`,
  "Test Case Prompt": `Generate comprehensive test cases for:
"{INPUT}"

Include:
- Happy path scenarios
- Edge cases
- Error conditions
- Boundary values
- Integration tests

Test cases:`
};
var PromptGenerator = _PromptGenerator;
var TECHNIQUE_TEMPLATES = PromptGenerator.TECHNIQUE_TEMPLATES;

// src/ui.ts
var PromptMindUI = class {
  constructor(classifier2, templateEngine2, configManager2, analyticsTracker2) {
    this.classifier = classifier2;
    this.templateEngine = templateEngine2;
    this.configManager = configManager2;
    this.analyticsTracker = analyticsTracker2;
    this.promptGenerator = new PromptGenerator(configManager2);
  }
  resolveWebviewView(webviewView, context, _token) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      enableCommandUris: true,
      localResourceRoots: [
        vscode3.Uri.joinPath(this.configManager.getExtensionContext().extensionUri, "assets")
      ]
    };
    webviewView.webview.html = this.getWebviewContent();
    webviewView.webview.onDidReceiveMessage((data) => {
      this.handleMessage(data);
    });
    webviewView.onDidDispose(() => {
      this._view = void 0;
    });
  }
  showUI() {
    if (this._view) {
      this._view.show(true);
    } else {
      vscode3.commands.executeCommand("promptmindView.focus");
    }
  }
  async handleMessage(message) {
    switch (message.command) {
      case "generatePrompt":
        await this.handleGeneratePrompt(message);
        break;
      case "classify":
        this.handleClassifyMessage(message);
        break;
      case "sendToChat":
        this.handleSendToChat(message);
        break;
      case "getStats":
        this.sendStatsToUI();
        break;
      case "updateTemplate":
        this.handleUpdateTemplate(message);
        break;
      case "copyPrompt":
        await vscode3.env.clipboard.writeText(message.prompt);
        vscode3.window.showInformationMessage("\u2705 Prompt copied to clipboard!");
        break;
    }
  }
  async handleGeneratePrompt(message) {
    const { input, selectedTechnique } = message;
    if (!input) {
      this._view?.webview.postMessage({
        command: "error",
        message: "Please enter a prompt"
      });
      return;
    }
    try {
      const editor = vscode3.window.activeTextEditor;
      const selectedCode = editor?.document.getText(editor.selection) || "";
      const fileName = editor?.document.fileName || "";
      const fileType = editor?.document.languageId || "text";
      const technique = selectedTechnique || this.promptGenerator.recommendTechnique(input, fileType);
      const generatedPrompts = await this.promptGenerator.generateVariations(
        technique,
        input,
        {
          selectedCode,
          fileType,
          fileName
        }
      );
      generatedPrompts.forEach((prompt) => {
        const validation = this.promptGenerator.validatePrompt(prompt);
        if (!validation.valid) {
          console.warn("Generated prompt validation issues:", validation.issues);
        }
      });
      this.analyticsTracker.trackTemplateUsage(technique);
      this._view?.webview.postMessage({
        command: "generatePromptResult",
        technique,
        variations: generatedPrompts.map((p) => ({
          original: p.original,
          generated: p.generated,
          instructions: p.instructions,
          confidence: p.confidence
        }))
      });
    } catch (error) {
      this._view?.webview.postMessage({
        command: "error",
        message: `Error generating prompt: ${error instanceof Error ? error.message : "Unknown error"}`
      });
    }
  }
  handleClassifyMessage(message) {
    const { input, selectedType } = message;
    if (!input) {
      this._view?.webview.postMessage({
        command: "error",
        message: "Please enter a prompt"
      });
      return;
    }
    const classification = this.classifier.classify(input);
    const promptType = selectedType || classification.type;
    const editor = vscode3.window.activeTextEditor;
    const selection = editor?.document.getText(editor.selection) || "";
    const fileName = editor?.document.fileName || "";
    const fileType = editor?.document.languageId || "text";
    const expandedPrompt = this.templateEngine.expandTemplate(promptType, {
      userInput: input,
      selection,
      fileName,
      fileType
    });
    this.analyticsTracker.trackTemplateUsage(promptType);
    this._view?.webview.postMessage({
      command: "classifyResult",
      type: promptType,
      confidence: classification.confidence,
      expandedPrompt,
      keywords: classification.keywords
    });
  }
  handleSendToChat(message) {
    const { prompt } = message;
    this.analyticsTracker.trackTemplateUsage("sent_to_chat");
    const openChat = async () => {
      try {
        await vscode3.commands.executeCommand("workbench.action.chat.open", {
          query: prompt
        });
      } catch (error) {
        await vscode3.env.clipboard.writeText(prompt);
        vscode3.window.showInformationMessage("\u2705 Prompt copied to clipboard! Paste it into Copilot Chat.");
      }
    };
    openChat();
  }
  sendStatsToUI() {
    const stats = this.analyticsTracker.getStats();
    this._view?.webview.postMessage({
      command: "statsUpdate",
      stats
    });
  }
  handleUpdateTemplate(message) {
    const { type, template } = message;
    this.configManager.updateTemplate(type, template).then(() => {
      this._view?.webview.postMessage({
        command: "templateUpdated",
        type,
        message: `Template for "${type}" updated!`
      });
    });
  }
  getWebviewContent() {
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
				<div><img src="${this._view?.webview.asWebviewUri(vscode3.Uri.joinPath(this.configManager.getExtensionContext().extensionUri, "assets", "promptmindicon.png"))}" class="emoji" alt="PromptMind"> PromptMind</div>
				<div class="tagline">Prompt Engineering Made Easy</div>
			</h1>
		</header>

		<main>
			<!-- Input Section -->
			<div class="section">
				<div class="section-title">\u{1F4DD} Your Request</div>
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
				<div class="section-title">\u{1F3AF} Prompt Technique \u2013 Choose a prompt type to automatically generate optimized prompts. </div>
				<div class="type-selector">
					<button class="type-button" data-technique="Expert Prompt"><span>\u{1F393}</span><span>Expert Prompt</span></button>
					<button class="type-button" data-technique="Emotion Prompt"><span>\u{1FAF6}</span><span>Emotion Prompt</span></button>
					<button class="type-button" data-technique="Thread of Thought Prompt"><span>\u{1F9E0}</span><span>Reasoning Prompt</span></button>
					<button class="type-button" data-technique="Chain of Verification Prompt"><span>\u{1F517}</span><span>Chain of verification Prompt</span></button>
					<button class="type-button" data-technique="Zero-Shot Prompt"><span>\u26A1</span><span>Zero-Shot Prompt</span></button>
					<button class="type-button" data-technique="Role-Based Prompt"><span>\u{1F3AD}</span><span>Role Based Prompt</span></button>
					<button class="type-button" data-technique="Code Generation Prompt"><span>\u{1F4BB}</span><span>Code Prompt</span></button>
					<button class="type-button" data-technique="Formatting Prompt"><span>\u{1F9E9}</span><span>Format Prompt</span></button>
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
			PromptMind v0.1.0 \u2022 Published by Creative Visual Studio Extensions Company
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
						'<button class="copy-variation-btn" data-variation="' + idx + '">\u{1F4CB} Copy</button>' +
						'<button class="send-variation-btn" data-variation="' + idx + '">\u{1F4AC} Send to Copilot</button>' +
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

			showMessage('\u2705 Generated 4 dynamic prompt variations!', 'success');
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
};

// src/extension.ts
var classifier;
var templateEngine;
var chatIntegration;
var analyticsTracker;
var configManager;
var promptMindUI;
function activate(context) {
  console.log("PromptMind extension activated");
  classifier = new PromptClassifier();
  configManager = new ConfigManager(context);
  templateEngine = new TemplateEngine(configManager);
  chatIntegration = new ChatIntegration();
  analyticsTracker = new AnalyticsTracker(context);
  promptMindUI = new PromptMindUI(classifier, templateEngine, configManager, analyticsTracker);
  context.subscriptions.push(
    vscode4.window.registerWebviewViewProvider("promptmindView", promptMindUI)
  );
  registerCommands(context);
  console.log("PromptMind services initialized");
}
function registerCommands(context) {
  context.subscriptions.push(
    vscode4.commands.registerCommand("promptmind.classifyPrompt", async () => {
      await handleClassifyPrompt();
    })
  );
  context.subscriptions.push(
    vscode4.commands.registerCommand("promptmind.generateRefactorPrompt", async () => {
      await handleGeneratePrompt("refactor");
    })
  );
  context.subscriptions.push(
    vscode4.commands.registerCommand("promptmind.generateCodePrompt", async () => {
      await handleGeneratePrompt("generation");
    })
  );
  context.subscriptions.push(
    vscode4.commands.registerCommand("promptmind.generateExplanationPrompt", async () => {
      await handleGeneratePrompt("explanation");
    })
  );
  context.subscriptions.push(
    vscode4.commands.registerCommand("promptmind.showUsageStats", async () => {
      await handleShowStats();
    })
  );
  context.subscriptions.push(
    vscode4.commands.registerCommand("promptmind.showUI", async () => {
      promptMindUI.showUI();
    })
  );
}
async function handleClassifyPrompt() {
  const input = await vscode4.window.showInputBox({
    placeHolder: 'Type a natural phrase (e.g., "fix this loop", "write tests", "explain this function")',
    prompt: "PromptMind: Natural phrase classification"
  });
  if (!input) {
    return;
  }
  const classification = classifier.classify(input);
  const selectedType = await vscode4.window.showQuickPick(
    [
      { label: classification.type.toUpperCase(), description: `Confidence: ${(classification.confidence * 100).toFixed(0)}%`, picked: true },
      { label: "generation", description: "Code Generation" },
      { label: "explanation", description: "Code Explanation" },
      { label: "refactor", description: "Code Refactoring" },
      { label: "test", description: "Test Generation" },
      { label: "debug", description: "Debugging" },
      { label: "docs", description: "Documentation" }
    ],
    {
      placeHolder: "Select prompt type"
    }
  );
  if (!selectedType) {
    return;
  }
  const promptType = selectedType.label.toLowerCase();
  await generateAndSendPrompt(input, promptType);
}
async function handleGeneratePrompt(promptType) {
  const input = await vscode4.window.showInputBox({
    placeHolder: `Describe what you need... (e.g., "fix this loop", "add error handling")`,
    prompt: `PromptMind: ${promptType.charAt(0).toUpperCase() + promptType.slice(1)} Prompt`
  });
  if (!input) {
    return;
  }
  await generateAndSendPrompt(input, promptType);
}
async function generateAndSendPrompt(userInput, promptType) {
  const editor = vscode4.window.activeTextEditor;
  if (!editor) {
    vscode4.window.showErrorMessage("No active editor. Please open a file first.");
    return;
  }
  const selection = editor.document.getText(editor.selection);
  const fileName = editor.document.fileName;
  const fileType = editor.document.languageId;
  const expandedPrompt = templateEngine.expandTemplate(promptType, {
    userInput,
    selection,
    fileName,
    fileType
  });
  analyticsTracker.trackTemplateUsage(promptType);
  await chatIntegration.sendToCopilotChat(expandedPrompt);
  vscode4.window.showInformationMessage(`\u2728 Prompt sent to Copilot Chat (${promptType})`);
}
async function handleShowStats() {
  const stats = analyticsTracker.getStats();
  const message = `\u{1F4CA} **PromptMind Usage Statistics**

**Total Prompts Generated:** ${stats.totalPrompts}

**By Type:**
${Object.entries(stats.byType).map(([type, count]) => `\u2022 ${type.toUpperCase()}: ${count} prompts`).join("\n")}

**Top Template:** ${stats.topTemplate ? stats.topTemplate.toUpperCase() : "None yet"}

**Acceptance Rate:** ${stats.acceptanceRate}%`;
  const panel = vscode4.window.createWebviewPanel(
    "promptmindStats",
    "PromptMind Statistics",
    vscode4.ViewColumn.One,
    {}
  );
  panel.webview.html = getStatsHtml(stats);
}
function getStatsHtml(stats) {
  const chartData = Object.entries(stats.byType).map(([type, count]) => `
			<div style="margin: 10px 0;">
				<div style="display: flex; align-items: center;">
					<span style="width: 100px;">${type.toUpperCase()}</span>
					<div style="background: #0078d4; width: ${count * 20}px; height: 20px; border-radius: 3px;"></div>
					<span style="margin-left: 10px;">${count}</span>
				</div>
			</div>
		`).join("");
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
			<h1>\u{1F4CA} PromptMind Statistics</h1>
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
				<div class="stat-value">${stats.topTemplate ? stats.topTemplate.toUpperCase() : "None yet"}</div>
			</div>
			<div class="stat">
				<div class="stat-label">Acceptance Rate</div>
				<div class="stat-value">${stats.acceptanceRate}%</div>
			</div>
		</body>
		</html>
	`;
}
function deactivate() {
  console.log("PromptMind extension deactivated");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
