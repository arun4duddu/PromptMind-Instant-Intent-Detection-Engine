# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-01-21

### Added
- Initial release of PromptMind
- **Prompt Classification**: Natural language intent detection
  - 6 prompt types: generation, explanation, refactor, test, debug, docs
  - Pattern-based and keyword-based classification
  - Confidence scoring
- **Template Library**: Pre-built, customizable templates per type
  - Variable interpolation (#selection, #file, #fileType)
  - Fallback templates for robust behavior
  - User-editable via VS Code settings
- **Command Palette Integration**: Full command coverage
  - `promptmind.classifyPrompt` - Interactive classification
  - Type-specific generation commands
  - Template manager
  - Usage statistics viewer
- **Copilot Chat Integration**: 
  - Direct chat sending
  - Webview preview fallback
  - Copy-to-clipboard support
- **Usage Analytics**:
  - Local tracking of template usage
  - Acceptance rate calculation
  - Top template identification
  - Recommendation engine
- **Keyboard Shortcuts**:
  - `Ctrl+Shift+M` (or `Cmd+Shift+M` on Mac) for quick classification
- **Context Menu Integration**:
  - Right-click options in editor
  - Selection-aware commands
- **Configuration Management**:
  - Template customization via settings
  - Analytics toggle
  - Language defaults

### Features
- Zero-effort prompt expansion using Copilot best practices
- Automatic context extraction (file type, selection, filename)
- Visual statistics dashboard
- Template optimization based on usage patterns

## [Unreleased]

### Planned
- Machine learning-based classifier improvement
- User feedback collection from Chat interactions
- Team template sharing and collaboration
- Prompt history and versioning
- Custom template creation UI
- Integration with GitHub Copilot X
- Analytics export functionality
- Template marketplace

---

## Template Type Details

### v0.1.0 Templates

#### Code Generation
```
Create [language] function for [description]. Examples: [2 inline cases]. Match style of #file.
```

#### Explanation
```
Break down #selection line-by-line. Explain complexity, alternatives, and best practices.
```

#### Refactor
```
Refactor #selection for better performance. Use async patterns from #file. Include 3 examples.
```

#### Test Generation
```
Generate unit tests for #function covering edge cases, mocks, async. Use xUnit style.
```

#### Debug
```
/fix Explain why #selection fails. Show stack trace analysis and 2 fixes with pros/cons.
```

#### Documentation
```
Generate comprehensive documentation for #selection. Include examples, edge cases, and usage patterns.
```
