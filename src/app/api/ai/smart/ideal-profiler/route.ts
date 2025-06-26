import { NextRequest, NextResponse } from 'next/server';

interface IdealProfileRequest {
  jobDescription: string;
  companyContext: {
    name: string;
    stage: string;
    culture: string[];
    team: any;
  };
  marketData?: {
    salaryRange: string;
    availability: string;
    competition: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: IdealProfileRequest = await request.json();

    // Build the ideal candidate profile
    const idealProfile = {
      technical: {
        mustHave: extractMustHaveSkills(body.jobDescription),
        niceToHave: extractNiceToHaveSkills(body.jobDescription),
        canLearn: identifyLearnableSkills(body.jobDescription)
      },
      cultural: {
        values: body.companyContext.culture,
        workStyle: determineWorkStyle(body.companyContext),
        communication: determineCommunicationStyle(body.companyContext)
      },
      experience: {
        minYears: extractYearsRequired(body.jobDescription),
        industries: extractRelevantIndustries(body.jobDescription),
        companyStages: [body.companyContext.stage]
      }
    };

    // Perform reality check
    const realityCheck = {
      marketAvailability: assessAvailability(idealProfile, body.marketData),
      competitionAnalysis: analyzeCompetition(body.marketData),
      suggestedAdjustments: generateAdjustments(idealProfile, body.marketData)
    };

    // Generate search criteria
    const searchCriteria = {
      primaryKeywords: generatePrimaryKeywords(idealProfile),
      alternativeKeywords: generateAlternativeKeywords(idealProfile),
      booleanSearch: createBooleanSearch(idealProfile),
      filters: createSearchFilters(idealProfile)
    };

    return NextResponse.json({
      success: true,
      idealProfile,
      realityCheck,
      searchCriteria,
      scoringRubric: generateScoringRubric(idealProfile),
      outreachStrategy: generateOutreachStrategy(idealProfile, body.companyContext)
    });

  } catch (error) {
    console.error('Ideal Profiler error:', error);
    return NextResponse.json(
      { error: 'Failed to generate ideal profile' },
      { status: 500 }
    );
  }
}

// Helper functions
function extractMustHaveSkills(jobDescription: string): string[] {
  // Extract critical skills from job description
  const patterns = [
    /must have|required|essential|critical/gi,
    /\d\+?\s*years?\s*(?:of\s*)?experience/gi
  ];

  // Simplified extraction logic
  return ['React', 'Node.js', 'TypeScript'];
}

function extractNiceToHaveSkills(jobDescription: string): string[] {
  return ['GraphQL', 'AWS', 'Docker'];
}

function identifyLearnableSkills(jobDescription: string): string[] {
  return ['Internal tools', 'Company processes'];
}

function determineWorkStyle(companyContext: any): string {
  if (companyContext.stage === 'startup') {
    return 'fast-paced, autonomous, wear-many-hats';
  }
  return 'structured, collaborative, specialized';
}

function determineCommunicationStyle(companyContext: any): string {
  return 'direct, transparent, proactive';
}

function extractYearsRequired(jobDescription: string): number {
  const match = jobDescription.match(/(\d+)\+?\s*years?/i);
  return match ? parseInt(match[1]) : 3;
}

function extractRelevantIndustries(jobDescription: string): string[] {
  return ['SaaS', 'B2B', 'Enterprise'];
}

function assessAvailability(profile: any, marketData: any): string {
  // Assess how available such candidates are
  const skillCount = profile.technical.mustHave.length;
  const yearsRequired = profile.experience.minYears;

  if (skillCount > 5 || yearsRequired > 7) {
    return 'scarce';
  } else if (skillCount > 3 || yearsRequired > 5) {
    return 'competitive';
  }
  return 'available';
}

function analyzeCompetition(marketData: any): any {
  return {
    topCompetitors: marketData?.competition || ['FAANG', 'Hot startups'],
    salaryPressure: 'high',
    benefitsExpectations: ['equity', 'remote', 'growth']
  };
}

function generateAdjustments(profile: any, marketData: any): string[] {
  const adjustments = [];

  if (assessAvailability(profile, marketData) === 'scarce') {
    adjustments.push('Consider reducing must-have requirements');
    adjustments.push('Focus on growth potential over current skills');
    adjustments.push('Expand geographic search to remote');
  }

  return adjustments;
}

function generatePrimaryKeywords(profile: any): string[] {
  return profile.technical.mustHave;
}

function generateAlternativeKeywords(profile: any): string[] {
  // Generate alternatives for each skill
  const alternatives: Record<string, string[]> = {
    'React': ['Vue', 'Angular', 'Frontend'],
    'Node.js': ['Python', 'Ruby', 'Backend'],
    'TypeScript': ['JavaScript', 'ES6+']
  };

  return profile.technical.mustHave.flatMap((skill: string) =>
    alternatives[skill as keyof typeof alternatives] || []
  );
}

function createBooleanSearch(profile: any): string {
  const must = profile.technical.mustHave.join(' AND ');
  const nice = profile.technical.niceToHave.join(' OR ');
  return `(${must}) AND (${nice})`;
}

function createSearchFilters(profile: any): any {
  return {
    experience: `${profile.experience.minYears}+ years`,
    location: 'Remote OR San Francisco',
    education: 'CS degree OR bootcamp OR self-taught',
    currentTitle: ['Senior Engineer', 'Lead Developer', 'Tech Lead']
  };
}

function generateScoringRubric(profile: any): any {
  return {
    technical: { weight: 40, threshold: 70 },
    cultural: { weight: 30, threshold: 60 },
    experience: { weight: 20, threshold: 50 },
    potential: { weight: 10, threshold: 40 }
  };
}

function generateOutreachStrategy(profile: any, companyContext: any): any {
  return {
    hooks: [
      `Working on ${profile.technical.mustHave[0]} at scale`,
      `${companyContext.stage} with strong engineering culture`,
      'Opportunity to lead and mentor'
    ],
    valueProps: [
      'Technical challenges',
      'Growth opportunity',
      'Impact and ownership'
    ],
    concerns: [
      'Compensation competitiveness',
      'Work-life balance',
      'Career progression'
    ]
  };
} 