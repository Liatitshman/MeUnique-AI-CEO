# 💾 Smart Database Agent

## Overview
The Smart Database is the foundation agent of the MeUnique AI CEO System. It manages all resources, maintains historical data, and provides intelligent mapping of candidates to opportunities.

## Key Features
- 🗺️ **Resource Mapping** - Maps all available resources and data sources
- 🎯 **Audience Segmentation** - Intelligent grouping of candidates
- 📚 **Historical Learning** - Learns from past successes and failures
- 🔍 **Pattern Recognition** - Identifies trends and opportunities
- ❤️ **Emotional Mapping** - Maps emotional profiles and cultural fit
- 🏷️ **Cultural Tagging** - Tags candidates by cultural alignment

## Integration Points
- **Internal Database** - Core data storage
- **LinkedIn** - Professional profiles
- **GitHub** - Technical contributions
- **GuysBox** - Israeli market data

## Usage Example
```typescript
const smartDB = new SmartDatabaseAgent();

// Map resources for a new job
const resources = await smartDB.mapResources({
  jobId: "conntour-founding-engineer",
  requirements: ["Python", "C++", "Computer Vision"],
  culture: "fast-paced startup"
});

// Get historical insights
const insights = await smartDB.getHistoricalInsights({
  company: "Conntour",
  role: "Founding Engineer"
});
```

## Configuration
See `config.json` for detailed configuration options.

## Cost
- Internal queries: Free
- External API calls: ~$0.01/query
- AI enhancement: ~$0.05/query 