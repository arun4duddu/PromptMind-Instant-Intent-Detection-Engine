# Architecture

## Overview

PromptMind - Prompt Engineering Made Easy is a modular VS Code extension that classifies natural language prompts and expands them into optimized Copilot Chat prompts.

## Core Components

### 1. **PromptClassifier** (`src/classifier.ts`)
Handles NLP-based intent classification using pattern matching and keyword analysis.

**Key Features:**
- Multi-pattern regex matching for robust classification
- Confidence scoring (0.0-1.0)
- Keyword extraction and matching
- Supports 6 prompt types: generation, explanation, refactor, test, debug, docs

**How it works:**
1. Tokenizes user input
2. Matches against type-specific patterns (3x weight)
3. Checks for type-specific keywords (1x weight)
4. Calculates confidence based on score distribution
5. Returns type with highest score + keywords

### 2. **TemplateEngine** (`src/templates.ts`)
Expands templates with context variables and user input.

**Variables Supported:**
- `#selection` - Currently selected code
- `#file` - Current file name
- `#fileType` - Programming language
- `#fileName` - File name only
- `[language]` - Language name (auto-detected)
- `[description]` - User input placeholder

**Process:**
1. Loads template from config
2. Interpolates variables
3. Inserts user input
4. Returns expanded prompt

### 3. **ConfigManager** (`src/config.ts`)
Manages configuration from VS Code settings and persists state.

**Functionality:**
- Reads/writes configuration from `settings.json`
- Manages workspace and global state
- Provides default templates
- Handles setting updates

### 4. **ChatIntegration** (`src/chat.ts`)
Sends prompts to Copilot Chat with fallbacks.

**Methods:**
- Primary: Direct Copilot Chat command execution
- Fallback: Clipboard copy + webview preview
- Shows prompt in webview with copy/open buttons

### 5. **AnalyticsTracker** (`src/analytics.ts`)
Tracks template usage and acceptance rates.

**Metrics:**
- Total prompts generated
- Count per type
- Top template identification
- Acceptance rate calculation
- Recommendations based on usage

### 6. **Extension** (`src/extension.ts`)
Main extension entry point. Orchestrates all components.

**Responsibilities:**
- Initializes services on activation
- Registers commands
- Handles command execution
- Manages UI (webviews, quick picks, input boxes)
- Coordinates between components

## Data Flow

```
User Input
    ↓
Classifier.classify(input) → ClassificationResult
    ↓
User selects/confirms type
    ↓
TemplateEngine.expandTemplate(type, context) → Expanded Prompt
    ↓
AnalyticsTracker.trackTemplateUsage(type)
    ↓
ChatIntegration.sendToCopilotChat(prompt)
    ↓
Webview display + send to Copilot Chat
```

## Extension Lifecycle

1. **Activation**: `onStartupFinished` event
2. **Initialization**: Create service instances
3. **Registration**: Register command handlers
4. **Execution**: User triggers command
5. **Processing**: Classify → Expand → Track → Send
6. **Feedback**: Show confirmation message

## Configuration

All settings are scoped to `promptmind.*`:

```json
{
  "promptmind.enableAnalytics": boolean,
  "promptmind.defaultLanguage": string,
  "promptmind.autoInsertSelection": boolean,
  "promptmind.codeGenerationTemplate": string,
  "promptmind.debugTemplate": string,
  "promptmind.testTemplate": string,
  "promptmind.refactorTemplate": string,
  "promptmind.explanationTemplate": string,
  "promptmind.docsTemplate": string,
  "promptmind.generationTemplate": string
}
```

## State Management

### Workspace State
- Per-workspace data using `context.workspaceState`
- Useful for workspace-specific settings

### Global State
- User-level data using `context.globalState`
- Usage statistics, preferences

## Error Handling

- Try-catch blocks in async operations
- Fallback templates if config fails
- Webview preview as fallback for Chat integration
- Error messages via `vscode.window.showErrorMessage()`

## Performance Considerations

- Lightweight pattern matching (no external NLP)
- Template interpolation is O(n) string operations
- Analytics stored locally (no network calls)
- Lazy initialization of services
- Efficient regex patterns compiled once

## Security

- No external API calls beyond Copilot
- All data processed locally
- Prompt content remains in user's editor
- No telemetry by default (respects user settings)

## Testing Strategy

1. **Unit Tests**: Classifier, TemplateEngine
2. **Integration Tests**: Full workflow
3. **Manual Tests**: Command execution, UI flows
4. **Performance**: Large selection handling

## Future Enhancements

1. Machine Learning-based classification
2. User feedback loop for classifier improvement
3. Custom template creation UI
4. Prompt history and versioning
5. Team template sharing
6. Analytics dashboard
7. Integration with other AI platforms
