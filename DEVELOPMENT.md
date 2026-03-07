# Development Guide

## Setup

### Prerequisites
- Node.js 14+ and npm
- VS Code 1.85+
- TypeScript knowledge

### Installation

```bash
cd "c:\AI\PromptMind"
npm install
```

## Development Workflow

### Compilation
```bash
npm run compile        # One-time build
npm run watch         # Watch mode for development
```

### Running the Extension

1. Press `F5` in VS Code or go to Run & Debug
2. Select "Launch Extension"
3. A new VS Code window opens with the extension loaded
4. Test commands via Command Palette (`Ctrl+Shift+P`)

### Debugging

- Set breakpoints in any TypeScript file
- Use VS Code's Debug Console
- Check output in "PromptMind Extension" channel

### Code Structure

```
src/
├── extension.ts       # Main entry point
├── classifier.ts      # Intent classification logic
├── templates.ts       # Template expansion
├── config.ts          # Configuration management
├── chat.ts           # Copilot Chat integration
└── analytics.ts      # Usage tracking
```

## Adding a New Template Type

1. **Update Classifier** (`classifier.ts`):
   ```typescript
   this.typeKeywords.set('newtype', ['keyword1', 'keyword2']);
   this.typePatterns.set('newtype', [/pattern1/i, /pattern2/i]);
   ```

2. **Add to TemplateEngine** (`templates.ts`):
   ```typescript
   private getDefaultTemplate(type: string): string {
     const defaults: Record<string, string> = {
       // ... existing types
       newtype: 'Your template here with #selection and #file'
     };
   }
   ```

3. **Update package.json** (`contributes.configuration`):
   ```json
   "promptmind.newtypeTemplate": {
     "type": "string",
     "default": "...",
     "description": "Template for newtype prompts"
   }
   ```

4. **Add Command** in `extension.ts`:
   ```typescript
   context.subscriptions.push(
     vscode.commands.registerCommand('promptmind.generateNewtypePrompt', async () => {
       await handleGeneratePrompt('newtype');
     })
   );
   ```

## Testing

### Manual Testing Checklist

- [ ] Extension activates without errors
- [ ] All commands appear in Command Palette
- [ ] Classifier correctly identifies prompt types
- [ ] Templates expand with proper variables
- [ ] Selected text is included in prompts
- [ ] Copilot Chat opens or shows preview
- [ ] Template Manager loads and saves updates
- [ ] Usage Statistics display correctly
- [ ] Settings changes apply immediately

### Debugging Tips

1. **Check Extension Output**: View → Output → PromptMind Extension
2. **Use `console.log()`**: Visible in Debug Console
3. **Inspect Configuration**: Run `Developer: Inspect Configuration`
4. **Test Classifier**: Add debug output in `classifier.ts`

## Building for Distribution

```bash
npm run vscode:prepublish
```

This creates a minified bundle in `dist/extension.js`.

## Creating VSIX Package

```bash
npm install -g vsce
vsce package
```

Generates `promptmind-intent-detection-0.1.0.vsix`.

## Code Style

- Use TypeScript strict mode
- Follow VS Code naming conventions
- Document public methods with JSDoc
- Use consistent 2-space indentation
- Prefer const over let/var

## Performance Tips

1. Avoid blocking the UI thread
2. Use async/await for operations
3. Cache regex patterns (already done)
4. Minimize DOM operations in webviews
5. Profile with Chrome DevTools

## Useful VS Code APIs

- `vscode.window.showInputBox()` - User input
- `vscode.window.showQuickPick()` - Selection menu
- `vscode.window.createWebviewPanel()` - Custom UI
- `vscode.commands.registerCommand()` - Register command
- `vscode.workspace.getConfiguration()` - Read settings
- `vscode.env.clipboard.writeText()` - Copy to clipboard

## Troubleshooting

### Extension not loading
- Check console for errors
- Verify `src/extension.ts` exports `activate()`
- Run `npm run compile`

### Commands not appearing
- Check `package.json` contributes.commands
- Reload VS Code window (F1 → Reload Window)
- Verify command IDs match exactly

### Template variables not expanding
- Check variable format: `#selection`, `#file`, etc.
- Verify context is passed to TemplateEngine
- Test with `console.log()` in `interpolateTemplate()`

### Analytics not tracking
- Verify `enableAnalytics` setting is true
- Check global state in Debug Console
- Call `analyticsTracker.getStats()` manually

## Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [VS Code Extension Examples](https://github.com/microsoft/vscode-extension-samples)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Copilot Chat Documentation](https://github.com/features/copilot/chat)

## Contributing

1. Create feature branch: `git checkout -b feature/amazing`
2. Implement feature with tests
3. Run `npm run lint`
4. Submit Pull Request

## Release Checklist

- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md`
- [ ] Run full test suite
- [ ] Build and test VSIX package
- [ ] Create Git tag
- [ ] Publish to Marketplace
