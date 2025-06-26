# 🔧 System Settings

This directory contains all configuration files for the MeUnique AI CEO System.

## 📁 Configuration Files

### 1. `system-config.json`
Main system configuration including:
- System settings (version, environment, language)
- Agent configuration (concurrency, timeouts, retries)
- Database settings (connection pool, sync intervals)
- Integration settings (LinkedIn, GitHub, OpenAI)
- Monitoring configuration
- Security settings
- Performance optimization
- Cost control parameters

### 2. `cost-tracking.json`
Detailed cost tracking configuration:
- Model pricing (GPT-4, GPT-3.5, Claude, Ollama)
- API costs per operation
- Agent operation costs
- Budget alerts and thresholds
- Cost optimization strategies
- Reporting configuration

### 3. `agent-priorities.json`
Agent execution priorities and dependencies:
- Execution order
- Dependencies between agents
- Priority levels
- Resource allocation

### 4. `environment.json`
Environment-specific settings:
- Development vs Production configs
- API endpoints
- Debug settings
- Feature flags

## 🔐 Security Notes

- Never commit actual API keys to these files
- Use environment variables for sensitive data
- Rotate API keys according to security policy
- Enable audit logging for compliance

## 💰 Cost Management

The system implements multiple cost control mechanisms:
1. **Real-time tracking** - Monitor costs as they occur
2. **Budget alerts** - Progressive warnings at 50%, 80%, 95%
3. **Automatic fallbacks** - Switch to cheaper models when needed
4. **Smart caching** - Reduce redundant API calls
5. **Batch operations** - Optimize API usage

## 🔄 Configuration Updates

When updating configurations:
1. Test changes in development first
2. Validate JSON syntax
3. Check for breaking changes
4. Update documentation
5. Notify team of changes

## 📊 Monitoring

The system monitors:
- Agent health and performance
- API rate limits
- Cost accumulation
- Error rates
- Response times

## 🚀 Deployment

Configuration changes require:
- System restart for most settings
- Some settings support hot-reload
- Database migrations for schema changes
- Cache invalidation for cached configs

---

*Last Updated: December 2024*
*Version: 1.0.0* 