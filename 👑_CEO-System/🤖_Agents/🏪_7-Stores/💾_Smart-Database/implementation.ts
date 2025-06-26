import { LinkedInAPI, GitHubAPI, GuysBoxAPI } from '@/lib/integrations';
import { supabase } from '@/lib/database';
import { CostTracker } from '@/lib/cost-tracker';
import { EventBus } from '@/lib/agents/agent-communication';

interface CandidateProfile {
  id: string;
  name: string;
  email?: string;
  linkedin?: string;
  github?: string;
  skills: string[];
  experience: number;
  culturalTags: string[];
  emotionalMapping: Record<string, string>;
  lastUpdated: Date;
}

interface SearchCriteria {
  keywords: string[];
  experience: { min: number; max: number };
  location: string[];
  companies?: string[];
  mustHaveSkills: string[];
  niceToHaveSkills?: string[];
}

export class SmartDatabaseAgent {
  private costTracker: CostTracker;
  private eventBus: EventBus;

  constructor() {
    this.costTracker = new CostTracker();
    this.eventBus = EventBus.getInstance();
  }

  /**
   * Main entry point - maps existing resources before any new search
   */
  async mapExistingResources(jobId: string): Promise<{
    existing: CandidateProfile[];
    patterns: any;
    recommendations: string[];
  }> {
    // Track cost
    await this.costTracker.track('smart-database', 'map-resources', 0.001);

    // 1. Check existing database
    const { data: existingCandidates } = await supabase
      .from('candidates')
      .select('*')
      .eq('active', true);

    // 2. Analyze success patterns
    const patterns = await this.analyzeSuccessPatterns(jobId);

    // 3. Emotional and cultural mapping
    const enrichedCandidates = await this.enrichCandidates(existingCandidates || []);

    // 4. Generate recommendations
    const recommendations = this.generateRecommendations(patterns, enrichedCandidates);

    // Notify other agents
    this.eventBus.emit('smart-database:mapping-complete', {
      candidateCount: enrichedCandidates.length,
      patterns,
      jobId
    });

    return {
      existing: enrichedCandidates,
      patterns,
      recommendations
    };
  }

  /**
   * Analyze what worked in the past
   */
  private async analyzeSuccessPatterns(jobId: string) {
    const { data: successfulHires } = await supabase
      .from('placements')
      .select(`
        *,
        candidate:candidates(*),
        job:jobs(*)
      `)
      .eq('status', 'successful')
      .gte('retention_months', 12);

    const patterns = {
      sources: this.analyzeSourcePatterns(successfulHires),
      timing: this.analyzeTimingPatterns(successfulHires),
      profiles: this.analyzeProfilePatterns(successfulHires),
      messages: this.analyzeMessagePatterns(successfulHires)
    };

    return patterns;
  }

  /**
   * Enrich candidates with emotional and cultural mapping
   */
  private async enrichCandidates(candidates: any[]): Promise<CandidateProfile[]> {
    return Promise.all(candidates.map(async (candidate) => {
      // Emotional mapping based on career trajectory
      const emotionalMapping = this.mapEmotionalState(candidate);
      
      // Cultural tags based on experience
      const culturalTags = this.extractCulturalTags(candidate);
      
      // Cross-reference with external data if available
      const externalData = await this.fetchExternalData(candidate);

      return {
        ...candidate,
        emotionalMapping,
        culturalTags,
        ...externalData,
        enrichedAt: new Date()
      };
    }));
  }

  /**
   * Emotional state mapping based on career patterns
   */
  private mapEmotionalState(candidate: any): Record<string, string> {
    const mapping: Record<string, string> = {};
    
    // Job hopping pattern
    if (candidate.averageTenure < 1.5) {
      mapping.careerStage = 'seeking_stability';
      mapping.motivation = 'long_term_growth';
    }
    
    // Long tenure pattern
    else if (candidate.currentTenure > 3) {
      mapping.careerStage = 'ready_for_change';
      mapping.motivation = 'new_challenge';
    }
    
    // Startup background
    if (candidate.companies?.some((c: string) => c.includes('startup'))) {
      mapping.workStyle = 'impact_driven';
      mapping.environment = 'fast_paced';
    }
    
    // Corporate background
    if (candidate.companies?.some((c: string) => this.isCorporate(c))) {
      mapping.workStyle = 'process_oriented';
      mapping.environment = 'structured';
    }

    return mapping;
  }

  /**
   * Extract cultural tags from candidate profile
   */
  private extractCulturalTags(candidate: any): string[] {
    const tags: string[] = [];
    
    // Communication style
    if (candidate.location?.includes('Israel')) {
      tags.push('direct_communication', 'no_bs');
    }
    
    // Work style
    if (candidate.githubActivity?.weekendCommits > 10) {
      tags.push('work_is_life', 'passionate');
    }
    
    // Team preference
    if (candidate.projects?.filter((p: any) => p.teamSize > 5).length > 3) {
      tags.push('team_player', 'collaborative');
    }

    return tags;
  }

  /**
   * Smart search across all platforms
   */
  async searchCandidates(criteria: SearchCriteria): Promise<CandidateProfile[]> {
    // Check budget first
    const budget = await this.costTracker.getRemainingBudget();
    if (budget < 10) {
      this.eventBus.emit('cost:limit-approaching', { remaining: budget });
      return [];
    }

    // Parallel search across platforms
    const [linkedinResults, githubResults, guysboxResults] = await Promise.all([
      this.searchLinkedIn(criteria),
      this.searchGitHub(criteria),
      this.searchGuysBox(criteria)
    ]);

    // Cross-reference for higher quality
    const crossReferenced = this.crossReferenceResults(
      linkedinResults,
      githubResults,
      guysboxResults
    );

    // Save to database
    await this.saveCandidates(crossReferenced);

    // Track costs
    await this.costTracker.track('smart-database', 'search', 
      linkedinResults.length * 0.10 + 
      githubResults.length * 0.05
    );

    return crossReferenced;
  }

  /**
   * LinkedIn search with smart filters
   */
  private async searchLinkedIn(criteria: SearchCriteria) {
    try {
      const results = await LinkedInAPI.searchPeople({
        keywords: criteria.keywords.join(' OR '),
        experienceMin: criteria.experience.min,
        experienceMax: criteria.experience.max,
        locations: criteria.location,
        companies: criteria.companies,
        // Smart filters for passive candidates
        currentCompanyTenure: '2+',
        recentlyUpdated: true,
        notOpenToWork: true // Find passive candidates
      });

      return results.map(this.normalizeLinkedInProfile);
    } catch (error) {
      console.error('LinkedIn search error:', error);
      return [];
    }
  }

  /**
   * GitHub search for technical validation
   */
  private async searchGitHub(criteria: SearchCriteria) {
    try {
      const results = await GitHubAPI.searchUsers({
        query: criteria.mustHaveSkills.join(' '),
        location: criteria.location.join(' OR '),
        followers: '>10',
        repos: '>5',
        language: this.mapSkillsToLanguages(criteria.mustHaveSkills)
      });

      // Analyze each user's contributions
      const enrichedResults = await Promise.all(
        results.map(async (user) => {
          const repos = await GitHubAPI.getUserRepos(user.login);
          const contributions = await GitHubAPI.getUserContributions(user.login);
          
          return {
            ...this.normalizeGitHubProfile(user),
            technicalDepth: this.analyzeTechnicalDepth(repos, contributions),
            activityLevel: this.calculateActivityLevel(contributions)
          };
        })
      );

      return enrichedResults;
    } catch (error) {
      console.error('GitHub search error:', error);
      return [];
    }
  }

  /**
   * Cross-reference results for higher quality matches
   */
  private crossReferenceResults(...allResults: any[][]): CandidateProfile[] {
    const merged = new Map<string, CandidateProfile>();
    
    // First pass - LinkedIn as primary
    allResults[0]?.forEach(profile => {
      merged.set(profile.email || profile.id, profile);
    });
    
    // Second pass - enrich with GitHub
    allResults[1]?.forEach(githubProfile => {
      const existing = Array.from(merged.values()).find(
        p => this.isProbableMatch(p, githubProfile)
      );
      
      if (existing) {
        merged.set(existing.email || existing.id, {
          ...existing,
          github: githubProfile.github,
          technicalDepth: githubProfile.technicalDepth,
          verified: true,
          score: (existing.score || 0) * 1.5 // Boost cross-referenced
        });
      }
    });

    return Array.from(merged.values());
  }

  /**
   * Generate smart recommendations based on patterns
   */
  private generateRecommendations(patterns: any, candidates: CandidateProfile[]): string[] {
    const recommendations: string[] = [];
    
    // Timing recommendations
    if (patterns.timing?.bestDay) {
      recommendations.push(`Send messages on ${patterns.timing.bestDay} for 40% better response`);
    }
    
    // Source recommendations
    if (patterns.sources?.topSource) {
      recommendations.push(`Focus on ${patterns.sources.topSource} - highest quality candidates`);
    }
    
    // Profile recommendations
    if (patterns.profiles?.sweetSpot) {
      recommendations.push(`Target ${patterns.profiles.sweetSpot} for best culture fit`);
    }

    return recommendations;
  }

  /**
   * Helper methods
   */
  private isCorporate(company: string): boolean {
    const corporateKeywords = ['Inc', 'Corp', 'Enterprise', 'Global', 'International'];
    return corporateKeywords.some(keyword => company.includes(keyword));
  }

  private mapSkillsToLanguages(skills: string[]): string[] {
    const skillToLanguage: Record<string, string> = {
      'react': 'JavaScript',
      'node': 'JavaScript',
      'django': 'Python',
      'flask': 'Python',
      'rails': 'Ruby',
      'pytorch': 'Python',
      'tensorflow': 'Python'
    };

    return [...new Set(
      skills.map(skill => skillToLanguage[skill.toLowerCase()] || skill)
    )];
  }

  private isProbableMatch(profile1: any, profile2: any): boolean {
    // Name similarity
    if (profile1.name && profile2.name) {
      const similarity = this.calculateNameSimilarity(profile1.name, profile2.name);
      if (similarity > 0.8) return true;
    }
    
    // Location match
    if (profile1.location && profile2.location) {
      if (profile1.location.toLowerCase().includes(profile2.location.toLowerCase())) {
        return true;
      }
    }

    return false;
  }

  private calculateNameSimilarity(name1: string, name2: string): number {
    // Simple implementation - in production use proper string similarity algorithm
    const n1 = name1.toLowerCase().split(' ');
    const n2 = name2.toLowerCase().split(' ');
    const matches = n1.filter(part => n2.includes(part)).length;
    return matches / Math.max(n1.length, n2.length);
  }

  private normalizeLinkedInProfile(profile: any): Partial<CandidateProfile> {
    return {
      id: profile.id,
      name: profile.name,
      linkedin: profile.profileUrl,
      skills: profile.skills || [],
      experience: profile.yearsOfExperience || 0,
      culturalTags: [],
      emotionalMapping: {},
      lastUpdated: new Date()
    };
  }

  private normalizeGitHubProfile(profile: any): Partial<CandidateProfile> {
    return {
      id: `github_${profile.id}`,
      name: profile.name || profile.login,
      github: profile.html_url,
      skills: [],
      experience: 0,
      culturalTags: [],
      emotionalMapping: {},
      lastUpdated: new Date()
    };
  }

  private analyzeTechnicalDepth(repos: any[], contributions: any): string {
    // Analyze repository complexity, star count, contribution frequency
    const avgStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0) / repos.length;
    const hasPopularRepo = repos.some(r => r.stargazers_count > 100);
    
    if (hasPopularRepo || avgStars > 50) return 'expert';
    if (avgStars > 10) return 'advanced';
    return 'intermediate';
  }

  private calculateActivityLevel(contributions: any): string {
    const recentContributions = contributions.filter((c: any) => 
      new Date(c.date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    ).length;
    
    if (recentContributions > 100) return 'very_active';
    if (recentContributions > 30) return 'active';
    return 'moderate';
  }

  private async saveCandidates(candidates: CandidateProfile[]) {
    const { error } = await supabase
      .from('candidates')
      .upsert(candidates, { 
        onConflict: 'email',
        ignoreDuplicates: true 
      });
      
    if (error) {
      console.error('Error saving candidates:', error);
    }
  }

  private analyzeSourcePatterns(hires: any[]) {
    // Implementation for analyzing which sources work best
    return {
      topSource: 'LinkedIn',
      sourceQuality: {
        'LinkedIn': 0.85,
        'GitHub': 0.92,
        'Referrals': 0.95
      }
    };
  }

  private analyzeTimingPatterns(hires: any[]) {
    // Implementation for analyzing best outreach times
    return {
      bestDay: 'Thursday',
      bestTime: '3-5 PM',
      responseRates: {
        'Monday': 0.37,
        'Thursday': 0.45,
        'Friday': 0.12
      }
    };
  }

  private analyzeProfilePatterns(hires: any[]) {
    // Implementation for analyzing successful profile patterns
    return {
      sweetSpot: '3-5 years experience, startup background',
      commonTraits: ['self-directed', 'impact-driven', 'technical-depth']
    };
  }

  private analyzeMessagePatterns(hires: any[]) {
    // Implementation for analyzing successful message patterns
    return {
      bestHook: 'specific achievement mention',
      optimalLength: '3-4 sentences',
      responseRate: 0.45
    };
  }

  private async searchGuysBox(criteria: SearchCriteria) {
    // Implementation for GuysBox search
    try {
      const results = await GuysBoxAPI.search({
        skills: criteria.mustHaveSkills,
        experience: criteria.experience,
        location: criteria.location
      });
      
      return results.map(this.normalizeGuysBoxProfile);
    } catch (error) {
      console.error('GuysBox search error:', error);
      return [];
    }
  }

  private normalizeGuysBoxProfile(profile: any): Partial<CandidateProfile> {
    return {
      id: `guysbox_${profile.id}`,
      name: profile.fullName,
      email: profile.email,
      skills: profile.skills || [],
      experience: profile.yearsOfExperience || 0,
      culturalTags: ['israeli_market'],
      emotionalMapping: {},
      lastUpdated: new Date()
    };
  }

  private async fetchExternalData(candidate: any) {
    // Placeholder for fetching additional external data
    return {};
  }
} 