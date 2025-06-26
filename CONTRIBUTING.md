# Contributing to MeUnique AI CEO System

Thank you for your interest in contributing to MeUnique AI CEO System! We welcome contributions from the community.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:
- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Respect differing viewpoints and experiences

## 🚀 Getting Started

1. **Fork the Repository**
   - Click the "Fork" button on GitHub
   - Clone your fork locally

2. **Set Up Development Environment**
   ```bash
   # Clone your fork
   git clone https://github.com/YOUR_USERNAME/meunique-ai-ceo.git
   cd meunique-ai-ceo
   
   # Install dependencies
   npm install
   
   # Set up environment variables
   cp 👑_CEO-System/📁_Documents/deployment/env.example .env.local
   # Edit .env.local with your API keys
   
   # Run development server
   npm run dev
   ```

3. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📝 Development Guidelines

### Code Style
- We use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write meaningful variable and function names
- Add comments for complex logic

### Agent Development
When creating or modifying agents:
1. Follow the existing agent structure
2. Update both `config.json` and `implementation.ts`
3. Add cost tracking to all API calls
4. Include error handling and logging
5. Write tests for new functionality

### File Structure
```
🤖_Agents/
└── 📁_YourAgent/
    ├── config.json      # Agent configuration
    ├── implementation.ts # Agent logic
    └── README.md        # Agent documentation
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test
npm test -- agent-name

# Run with coverage
npm run test:coverage
```

## 📊 Pull Request Process

1. **Before Submitting**
   - Ensure all tests pass
   - Update documentation
   - Add yourself to CONTRIBUTORS.md
   - Write clear commit messages

2. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   - [ ] Unit tests pass
   - [ ] Manual testing completed
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   ```

3. **Review Process**
   - PRs require at least one review
   - Address all feedback
   - Squash commits before merging

## 🐛 Reporting Issues

### Bug Reports
Include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots if applicable

### Feature Requests
Include:
- Use case description
- Proposed solution
- Alternative solutions considered
- Impact on existing features

## 💡 Areas for Contribution

### High Priority
- [ ] Complete Management Agents (CFO, CTO, CMO)
- [ ] Implement Support Agents
- [ ] Add comprehensive testing
- [ ] Improve documentation
- [ ] Add Hebrew localization

### Good First Issues
- Documentation improvements
- Bug fixes in existing agents
- Add unit tests
- Improve error messages
- UI/UX enhancements

## 🏗️ Architecture Decisions

### Key Principles
1. **Modularity**: Each agent is independent
2. **Cost Awareness**: Track all API costs
3. **Event-Driven**: Use EventBus for communication
4. **Type Safety**: Leverage TypeScript
5. **Performance**: Optimize for speed

### Technology Choices
- **Next.js 14**: For SSR and API routes
- **TypeScript**: For type safety
- **Tailwind CSS**: For styling
- **EventBus**: For agent communication

## 📚 Resources

- [System Architecture](./👑_CEO-System/📁_Documents/analysis/SYSTEM_ARCHITECTURE.md)
- [Agent Development Guide](./👑_CEO-System/📁_Documents/guides/SYSTEM_DOCUMENTATION.md)
- [API Documentation](./API_DOCS.md)

## 🙏 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Given credit in documentation

## 📧 Contact

- GitHub Issues: For bugs and features
- Email: contribute@meunique.ai
- Discord: [Join our community](https://discord.gg/meunique)

---

**Thank you for contributing to MeUnique AI CEO System!** 🚀 