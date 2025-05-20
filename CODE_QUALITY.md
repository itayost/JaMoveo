# JaMoveo Code Quality Standards

This document outlines the code quality standards and practices for the JaMoveo project.

## Commit Message Format

We follow the Conventional Commits specification:
<type>(<scope>): <subject>
<body>
<footer>
```
Types

feat: A new feature
fix: A bug fix
docs: Documentation changes
style: Changes that don't affect code functionality
refactor: Code changes that neither fix a bug nor add a feature
perf: Performance improvements
test: Adding or fixing tests
chore: Changes to build process or tools
ci: Changes to CI configuration
revert: Reverting a previous commit

Example: feat(auth): implement user registration
JavaScript/React Coding Standards

Use functional components with hooks for React
Document complex functions with JSDoc comments
Use descriptive variable and function names
Keep components small and focused
Avoid unnecessary re-renders
Use destructuring for props and state
Prefer async/await over promise chains

CSS/Styling Standards

Use Tailwind utility classes for most styling
Organize custom CSS with component-scoped classes
Follow mobile-first responsive design
Maintain high contrast for accessibility
Support RTL layouts for Hebrew content

Code Review Checklist
Before submitting a PR, ensure:

 Code follows project style guidelines
 All tests pass
 No unnecessary console logs
 No hardcoded values that should be configurable
 Code is accessible and responsive
 Proper error handling is implemented
 Documentation is updated as needed