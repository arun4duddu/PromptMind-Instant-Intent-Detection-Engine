# Contributing to PromptMind

We love your input! We want to make contributing to PromptMind as easy and transparent as possible.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing opinions, viewpoints, and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Enforcement

Project maintainers are responsible for clarifying the standards of acceptable behavior and are expected to take appropriate and fair corrective action in response to any instances of unacceptable behavior.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs if possible**
- **Include your environment details**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and expected behavior**
- **Explain why this enhancement would be useful**

### Pull Requests

- Fill in the required template
- Follow the TypeScript styleguides
- Include appropriate test cases
- Update documentation as needed
- End all files with a newline
- Avoid platform-specific code

## Development Setup

1. Fork and clone the repository
2. Run `npm install`
3. Create your feature branch (`git checkout -b feature/AmazingFeature`)
4. Make your changes
5. Commit with clear messages (`git commit -m 'Add AmazingFeature'`)
6. Push to the branch (`git push origin feature/AmazingFeature`)
7. Open a Pull Request

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line
- Example:
  ```
  Add intent classification for test generation
  
  - Implement pattern matching for test keywords
  - Add test template expansion
  - Fixes #123
  ```

### TypeScript Styleguide

- Use 2 spaces for indentation
- Use `const` by default, `let` when needed, avoid `var`
- Use meaningful variable names
- Add JSDoc comments for public methods
- Example:
  ```typescript
  /**
   * Classify user input into prompt type
   * @param input The user's natural language input
   * @returns Classification result with type and confidence
   */
  classify(input: string): ClassificationResult {
    // Implementation
  }
  ```

### Documentation Styleguide

- Use Markdown
- Reference examples and code blocks appropriately
- Include clear section headers
- Provide examples for features

## Additional Notes

### Issue and Pull Request Labels

This section lists the labels we use to help us track and manage issues and pull requests.

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- MAJOR version for incompatible API changes
- MINOR version for backwards-compatible functionality additions
- PATCH version for backwards-compatible bug fixes

## Recognition

Contributors will be recognized in the README.md and CHANGELOG.md for their efforts!

## Questions?

Feel free to open an issue with the `question` label or contact the maintainers directly.

---

Thank you for helping make PromptMind better! 🎉
