# PromptMind UI - Webview User Interface

## Overview

PromptMind now includes a **professional webview-based user interface** that provides a visual, interactive panel for prompt classification and template expansion.

## Features

### 🎨 Visual Components

1. **Input Section**
   - Natural language prompt input
   - Optional code selection display
   - Auto-focus ready

2. **Type Selector**
   - 6 prompt type buttons (Generate, Explain, Refactor, Test, Debug, Docs)
   - Active state highlighting
   - Quick type switching

3. **Classification Results**
   - Expanded prompt display
   - Confidence percentage with visual bar
   - Keyword highlighting
   - Information panel

4. **Actions**
   - Copy to clipboard button
   - Send to Copilot Chat button
   - Real-time loading indicators

5. **Statistics Dashboard**
   - Total prompts count
   - Per-type statistics
   - Top template tracking
   - Refresh button

6. **Tabbed Interface**
   - Expanded Prompt tab
   - Keywords tab
   - Information tab

## Architecture

### UI Class (`src/ui.ts`)

**PromptMindUI** manages the webview interface:

```typescript
class PromptMindUI {
  constructor(
    classifier: PromptClassifier,
    templateEngine: TemplateEngine,
    configManager: ConfigManager,
    analyticsTracker: AnalyticsTracker
  )

  showUI()                        // Display UI panel
  handleMessage(message: any)     // Process UI events
  getWebviewContent(): string     // Generate HTML/CSS/JS
}
```

### Message Flow

```
User Input in UI
    ↓
postMessage('classify', {...})
    ↓
vscode.webview.onDidReceiveMessage()
    ↓
handleClassifyMessage()
    ↓
classifier.classify()
    ↓
templateEngine.expandTemplate()
    ↓
postMessage('classifyResult', {...})
    ↓
Update UI Display
```

## UI Commands

### Opening the UI

```
Ctrl+Shift+P → "PromptMind: Open UI Panel"
```

Or via code:
```typescript
vscode.commands.executeCommand('promptmind.showUI');
```

### Activity Bar

- Look for the **sparkle (✨) icon** in the activity bar
- Click to open PromptMind panel (sidebar view)

## Styling

### Color Scheme
- **Background**: #1e1e1e (dark theme compatible)
- **Primary**: #0078d4 (VS Code blue)
- **Text**: #e0e0e0 (light text)
- **Borders**: #3e3e42 (subtle borders)

### Responsive Design
- Adapts to VS Code sidebar width
- Scrollable sections for long content
- Touch-friendly button sizes

### Visual Elements
- Gradient header
- Smooth transitions
- Hover states
- Loading spinner
- Success/error messages

## User Workflows

### Workflow 1: Quick Classification

1. Open PromptMind UI (Ctrl+Shift+P → "Open UI Panel")
2. Type natural language prompt
3. UI auto-classifies
4. Adjust type with buttons if needed
5. Click "Copy" or "Send to Chat"

### Workflow 2: Code-Based Prompt

1. Select code in editor
2. Open PromptMind UI
3. Type request about selected code
4. Type selector shows relevant types
5. Click to expand and send

### Workflow 3: Template Customization

1. View expanded prompt in UI
2. Copy and customize locally
3. Use "Template Manager" command to save
4. UI reflects changes immediately

## Integration Points

### With Extension

```typescript
// In extension.ts
promptMindUI = new PromptMindUI(
  classifier,
  templateEngine,
  configManager,
  analyticsTracker
);

// Register command
context.subscriptions.push(
  vscode.commands.registerCommand('promptmind.showUI', () => {
    promptMindUI.showUI();
  })
);
```

### With Editor

- Reads active editor selection
- Gets file type and name
- Displays in UI
- Sends context to classifier

### With Copilot

- Sends expanded prompts to Copilot Chat
- Fallback to clipboard copy
- Shows confirmation messages

## Message Protocol

### UI → Extension

```javascript
// Classify prompt
{
  command: 'classify',
  input: string,
  selectedType: string | null
}

// Send to Chat
{
  command: 'sendToChat',
  prompt: string
}

// Get Stats
{
  command: 'getStats'
}

// Copy to Clipboard
{
  command: 'copyPrompt',
  prompt: string
}

// Update Template
{
  command: 'updateTemplate',
  type: string,
  template: string
}
```

### Extension → UI

```javascript
// Classification Result
{
  command: 'classifyResult',
  type: string,
  confidence: number,
  expandedPrompt: string,
  keywords: string[]
}

// Statistics Update
{
  command: 'statsUpdate',
  stats: UsageStats
}

// Error Message
{
  command: 'error',
  message: string
}

// Template Updated
{
  command: 'templateUpdated',
  type: string,
  message: string
}
```

## Customization

### Colors

Edit the `<style>` section in `getWebviewContent()`:

```css
:root {
  --primary: #0078d4;
  --background: #1e1e1e;
  --text: #e0e0e0;
}
```

### Layout

Modify the HTML structure:
- **Container**: Flex layout
- **Main**: Scrollable content area
- **Sections**: Card-style panels

### Buttons

Customize button styles:
```css
button {
  background: #0078d4;
  padding: 10px 16px;
  border-radius: 4px;
}
```

## Performance

### Optimization

- **Lazy rendering**: Only visible sections render
- **Message debouncing**: Classification throttled
- **Virtual scrolling**: Statistics list optimized
- **CSS animations**: GPU-accelerated transitions

### Bundle Size

The webview HTML/CSS/JS is embedded in `ui.ts`:
- **Inline**: No additional files needed
- **Minified**: ~15KB gzipped
- **Fast load**: Instant panel display

## Accessibility

### Keyboard Navigation

- **Tab**: Move between elements
- **Enter**: Submit prompt
- **Arrow Keys**: Type selection
- **Escape**: Close panel (if implemented)

### Screen Reader Support

- Semantic HTML structure
- ARIA labels on buttons
- Form labels
- Status messages

### High Contrast

- Borders visible in all states
- Sufficient color contrast
- No color-only indicators

## Future Enhancements

### Planned Features

- [ ] Template editor in UI
- [ ] History panel
- [ ] Prompt suggestions
- [ ] Dark/light theme toggle
- [ ] Keyboard shortcuts display
- [ ] Settings panel
- [ ] Chat integration sidebar
- [ ] Metrics visualization charts

### Experimental

- [ ] Drag-drop file selection
- [ ] Voice input
- [ ] Real-time preview
- [ ] Template marketplace preview
- [ ] Collaborative panels

## Debugging

### WebView Issues

1. **DevTools**: Right-click UI → "Inspect Element"
2. **Console**: Check for errors
3. **Messages**: Log in message handler
4. **Reload**: Ctrl+R in webview

### Common Issues

**Styles not updating:**
- Clear cache: Ctrl+Shift+Delete
- Reload extension: Ctrl+Shift+F5

**Messages not sending:**
- Check vscode API object
- Verify command exists
- Check console for errors

**UI not opening:**
- Check active terminal
- Verify VS Code version >= 1.85
- Check extension activation

## Resources

- [VS Code Webview API](https://code.visualstudio.com/api/extension-guides/webview)
- [VS Code Color Tokens](https://code.visualstudio.com/api/references/theme-color)
- [VS Code Icons](https://code.visualstudio.com/api/references/icons-in-labels)

## Support

For UI-related issues:
1. Check [DEVELOPMENT.md#debugging](DEVELOPMENT.md#debugging)
2. Review message protocol above
3. Check webview console for errors
4. Open GitHub issue with screenshot
