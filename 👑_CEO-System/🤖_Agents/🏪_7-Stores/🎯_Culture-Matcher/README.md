# 🎯 Culture Matcher Agent

## Overview
The Culture Matcher is a sophisticated AI agent that analyzes cultural fit between candidates and companies with 85% accuracy.

## Core Functionality

### What It Does
- Analyzes company culture from multiple sources
- Evaluates candidate values and work style
- Predicts team dynamics and cultural alignment
- Generates culture fit scores and recommendations

### Integration Points

#### Inputs From:
1. **💾 Smart Database** - Company culture data
2. **🔬 Profile Analyzer** - Candidate personality insights
3. **🏗️ Ideal Profiler** - Target culture requirements

#### Outputs To:
1. **📝 Message Crafter** - Culture-specific messaging angles
2. **⚡ Auto Recruiter** - Cultural fit scores
3. **👑 CEO** - Strategic culture insights

## Technical Implementation

### Data Sources
```javascript
const cultureSources = {
  company: [
    "Glassdoor reviews",
    "LinkedIn company culture",
    "Company blog/values page",
    "Employee testimonials",
    "News articles"
  ],
  candidate: [
    "LinkedIn activity",
    "Writing style analysis",
    "Project choices",
    "Career transitions",
    "Recommendations"
  ]
};
```

### Analysis Dimensions
```javascript
const cultureAnalysis = {
  workStyle: {
    autonomy: "Independent vs Collaborative",
    pace: "Fast-paced vs Steady",
    structure: "Flexible vs Structured",
    innovation: "Creative vs Process-driven"
  },
  
  values: {
    mission: "Purpose-driven alignment",
    growth: "Learning opportunities",
    balance: "Work-life integration",
    diversity: "Inclusion practices"
  },
  
  communication: {
    style: "Formal vs Casual",
    transparency: "Open vs Need-to-know",
    feedback: "Direct vs Diplomatic",
    language: "Technical vs Business"
  }
};
```

## Success Metrics

### Performance KPIs
- **Accuracy Rate**: 85% culture fit prediction
- **Processing Time**: < 3 seconds per analysis
- **Cost**: $0.08 per candidate analysis
- **False Positive Rate**: < 10%

### Hebrew Market Optimization
```javascript
const israeliCultureFactors = {
  directness: "High - straight talk valued",
  hierarchy: "Flat - accessible leadership",
  innovation: "Risk-taking encouraged",
  workLife: "Family-oriented flexibility",
  military: "Shared service experience",
  languages: ["Hebrew", "English", "Russian"]
};
```

## Usage Examples

### Basic Culture Match
```javascript
const result = await cultureMatcher.analyze({
  candidate: candidateProfile,
  company: companyData,
  role: jobRequirements
});

// Returns:
{
  overallScore: 0.87,
  strengths: ["Innovation mindset", "Team collaboration"],
  concerns: ["Pace adjustment needed"],
  recommendation: "Strong fit with onboarding support"
}
```

### Message Personalization
```javascript
const cultureHooks = cultureMatcher.getMessageAngles({
  candidate: profile,
  company: "Wand"
});

// Returns:
{
  primary: "Your startup experience at X aligns with our fast pace",
  values: "I saw your post about work-life balance - we share that",
  team: "You'd work with ex-Googlers who value innovation"
}
```

## Configuration

### Environment Variables
```env
CULTURE_ANALYSIS_DEPTH=deep
CULTURE_CACHE_TTL=604800  # 7 days
CULTURE_MIN_CONFIDENCE=0.7
GLASSDOOR_API_KEY=your_key
```

### Cost Optimization
- Cache company culture data for 7 days
- Batch analyze similar candidates
- Use lightweight model for initial screening
- Deep analysis only for shortlisted candidates

## Troubleshooting

### Common Issues
1. **Low confidence scores** - Need more data sources
2. **Slow analysis** - Check cache configuration
3. **Cultural bias** - Review training data diversity

### Debug Mode
```javascript
cultureMatcher.enableDebug();
// Shows detailed analysis steps and scoring
```

## Best Practices

### For Israeli Market
1. Emphasize directness and authenticity
2. Highlight flat hierarchy and accessibility
3. Reference shared military/cultural experiences
4. Use Hebrew phrases naturally in messages

### For Global Companies
1. Focus on diversity and inclusion
2. Emphasize remote work culture
3. Highlight international team dynamics
4. Address timezone collaboration

---

**Integration Priority**: High (Level 3 in Smart Loop)
**Dependencies**: Smart Database, Profile Analyzer
**Output Format**: JSON culture fit report 