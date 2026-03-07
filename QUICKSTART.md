# Quick Start Guide

Get started with PromptMind in 2 minutes!

## Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "PromptMind"
4. Click Install

Or install from command line:
```bash
code --install-extension promptmind-intent-detection
```

## Your First Prompt

### Method 1: Command Palette (Quickest)

1. Press **Ctrl+Shift+M** (Cmd+Shift+M on Mac)
2. Type a natural phrase:
   - "fix this loop"
   - "write unit tests"
   - "explain this function"
3. PromptMind auto-classifies your intent
4. Adjust the type if needed
5. Prompt is expanded and sent to Copilot Chat ✨

### Method 2: From Selection

1. Select code in your editor
2. Right-click → **PromptMind: Classify Selection**
3. Type your request
4. Watch the magic happen!

### Method 3: Type-Specific Commands

Prefer a specific type? Use targeted commands:

- **Ctrl+Shift+P** → "PromptMind: Generate Debug Prompt"
- **Ctrl+Shift+P** → "PromptMind: Generate Test Prompt"
- **Ctrl+Shift+P** → "PromptMind: Generate Refactor Prompt"

## Understanding Prompt Types

PromptMind automatically detects what you want to do:

| Type | Examples | Best For |
|------|----------|----------|
| **Generation** | "create a function", "write a component" | New code |
| **Explanation** | "explain this", "how does it work?" | Understanding code |
| **Refactor** | "make this faster", "clean this up" | Improving code |
| **Test** | "write tests", "coverage for this" | Testing |
| **Debug** | "why is this failing?", "fix this" | Troubleshooting |
| **Docs** | "document this", "add comments" | Documentation |

## Customizing Templates

Don't like how PromptMind expands prompts? Customize!

### Edit Templates

1. **Ctrl+Shift+P** → "PromptMind: Open Template Manager"
2. Select a template type
3. Edit the template
4. Changes apply immediately

### Reset to Defaults

Edit your VS Code settings and remove your custom `promptmind.*Template` settings.

## Template Variables

Use these in custom templates:

| Variable | Replaced With |
|----------|---------------|
| `#selection` | Currently selected code |
| `#file` | Current file name |
| `#fileType` | Programming language (JavaScript, Python, etc.) |
| `[language]` | Same as `#fileType` |
| `[description]` | Your typed request |

### Example Template

```
Create a #fileType function to [description].
Follow the patterns in #file.
Include 2 examples.
```

## Viewing Statistics

Curious about your prompting patterns?

1. **Ctrl+Shift+P** → "PromptMind: Show Usage Statistics"
2. See your top templates and usage breakdown
3. PromptMind learns which types work best for you

## Tips & Tricks

### 💡 Be Natural
Type how you'd talk to a colleague:
- ✅ "fix this infinite loop"
- ✅ "write tests for this function"
- ❌ "generation type with refactoring"

### 💡 Provide Context
Select relevant code before commanding:
1. Highlight the code you want help with
2. Run a PromptMind command
3. `#selection` automatically includes your code

### 💡 Batch Operations
Need multiple prompts? Run commands in sequence:
1. Get an explanation
2. Get tests
3. Get a refactor
4. Compare all approaches in Copilot Chat

### 💡 Template Chaining
Create powerful templates by combining variables:
```
Refactor #selection to use #fileType async/await patterns.
Test with this #file style.
Include before/after examples.
```

## Common Workflows

### "Make This Faster" Workflow

```
1. Select slow function
2. Run "PromptMind: Generate Refactor Prompt"
3. Type "optimize for performance"
4. Review Copilot's suggestions
5. Copy best solution back
```

### "I'm Stuck" Workflow

```
1. Select error or problematic code
2. Run "PromptMind: Generate Debug Prompt"
3. Type error message or behavior
4. Get root cause analysis + fixes
```

### "Add Tests" Workflow

```
1. Select function to test
2. Run "PromptMind: Generate Test Prompt"
3. Specify test framework preference (jest, pytest, etc.)
4. Accept or refine generated tests
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+Shift+M | Quick classification |
| Ctrl+Shift+P | Full command palette |
| Right-click | Context menu options |

(Mac: Replace Ctrl with Cmd)

## Troubleshooting

### "Copilot Chat didn't open"
- Ensure GitHub Copilot extension is installed
- Your prompt is copied to clipboard - paste in Copilot Chat manually
- Check that you have Copilot access

### "Variables like #selection aren't working"
- Make sure you have text selected before running the command
- For some templates, selection is optional
- Check the Settings to view your active template

### "I want different templates"
- Open Template Manager (Ctrl+Shift+P → "Template Manager")
- Edit the template for your type
- Save - changes apply immediately!

## Next Steps

- Explore all [template types](README.md#template-library)
- Check out [advanced configuration](ARCHITECTURE.md)
- Join the community and [contribute](CONTRIBUTING.md)

---

**Need help?** Open an issue on GitHub or check the [full documentation](README.md).

Happy prompting! 🚀
