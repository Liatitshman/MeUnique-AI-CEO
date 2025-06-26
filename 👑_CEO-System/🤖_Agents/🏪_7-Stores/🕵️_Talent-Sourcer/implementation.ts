import { NextRequest, NextResponse } from 'next/server';
import { AgentBase } from '@/lib/agents/agent-base';

interface SearchCriteria {
    skills: string[];
    experience: { min: number; max: number };
    location: string[];
    companies: string[];
    education: string[];
    keywords: string[];
}

interface SearchResult {
    candidates: Candidate[];
    totalFound: number;
    searchQuality: number;
    sources: string[];
    nextSteps: string[];
}

interface Candidate {
    id: string;
    name: string;
    title: string;
    company: string;
    location: string;
    matchScore: number;
    profileUrl: string;
    highlights: string[];
    contactInfo?: ContactInfo;
}

interface ContactInfo {
    email?: string;
    linkedin?: string;
    github?: string;
    phone?: string;
}

export class TalentSourcerAgent extends AgentBase {
    private searchStrategies: Map<string, SearchStrategy>;

    constructor() {
        super({
            name: 'Talent Sourcer',
            emoji: '🕵️',
            priority: 7,
            costPerUse: 0.10
        });

        this.initializeStrategies();
    }

    private initializeStrategies() {
        this.searchStrategies = new Map([
            ['linkedin', {
                name: 'LinkedIn Search',
                buildQuery: this.buildLinkedInQuery,
                parseResults: this.parseLinkedInResults,
                cost: 0.05
            }],
            ['github', {
                name: 'GitHub Search',
                buildQuery: this.buildGitHubQuery,
                parseResults: this.parseGitHubResults,
                cost: 0.02
            }],
            ['internal', {
                name: 'Internal Database',
                buildQuery: this.buildInternalQuery,
                parseResults: this.parseInternalResults,
                cost: 0.00
            }]
        ]);
    }

    async process(request: NextRequest) {
        const { searchCriteria, targetRole, companyContext, searchDepth = 'standard' } = await request.json();

        // Execute multi-source search
        const searchResults = await this.executeSearch({
            searchCriteria,
            targetRole,
            companyContext,
            searchDepth
        });

        // Rank and filter candidates
        const rankedCandidates = this.rankCandidates(searchResults, searchCriteria);

        // Enrich candidate data
        const enrichedCandidates = await this.enrichCandidates(rankedCandidates);

        // Generate search insights
        const insights = this.generateSearchInsights(enrichedCandidates, searchCriteria);

        return NextResponse.json({
            success: true,
            results: {
                candidates: enrichedCandidates,
                totalFound: searchResults.totalFound,
                searchQuality: this.assessSearchQuality(enrichedCandidates, searchCriteria),
                sources: searchResults.sources,
                nextSteps: this.suggestNextSteps(enrichedCandidates, searchCriteria)
            },
            insights,
            recommendations: this.generateRecommendations(insights),
            alternativeSearches: this.suggestAlternativeSearches(searchCriteria, enrichedCandidates)
        });
    }

    private async executeSearch(params: any): Promise<any> {
        const { searchCriteria, targetRole, companyContext, searchDepth } = params;
        const results: Candidate[] = [];
        const sources: string[] = [];

        // Determine which sources to use based on search depth
        const sourcesToUse = this.selectSources(searchDepth);

        // Execute searches in parallel
        const searchPromises = sourcesToUse.map(async (source) => {
            const strategy = this.searchStrategies.get(source);
            if (!strategy) return null;

            try {
                const query = strategy.buildQuery.call(this, searchCriteria, targetRole);
                const sourceResults = await this.performSearch(source, query);
                const parsed = strategy.parseResults.call(this, sourceResults);

                sources.push(source);
                return parsed;
            } catch (error) {
                console.error(`Search failed for ${source}:`, error);
                return null;
            }
        });

        const allResults = await Promise.all(searchPromises);

        // Combine and deduplicate results
        allResults.forEach(sourceResults => {
            if (sourceResults) {
                results.push(...sourceResults);
            }
        });

        const deduplicatedResults = this.deduplicateCandidates(results);

        return {
            candidates: deduplicatedResults,
            totalFound: deduplicatedResults.length,
            sources
        };
    }

    private selectSources(searchDepth: string): string[] {
        switch (searchDepth) {
            case 'quick':
                return ['internal'];
            case 'standard':
                return ['internal', 'linkedin'];
            case 'deep':
                return ['internal', 'linkedin', 'github'];
            default:
                return ['internal', 'linkedin'];
        }
    }

    private buildLinkedInQuery(criteria: SearchCriteria, targetRole: any): string {
        const parts = [];

        // Title variations
        if (targetRole.title) {
            const titleVariations = this.generateTitleVariations(targetRole.title);
            parts.push(`(${titleVariations.join(' OR ')})`);
        }

        // Skills
        if (criteria.skills.length > 0) {
            const primarySkills = criteria.skills.slice(0, 3);
            parts.push(`(${primarySkills.join(' AND ')})`);
        }

        // Companies
        if (criteria.companies.length > 0) {
            parts.push(`(${criteria.companies.map(c => `company:"${c}"`).join(' OR ')})`);
        }

        // Location
        if (criteria.location.length > 0) {
            parts.push(`(${criteria.location.map(l => `location:"${l}"`).join(' OR ')})`);
        }

        return parts.join(' AND ');
    }

    private buildGitHubQuery(criteria: SearchCriteria, targetRole: any): string {
        const parts = [];

        // Programming languages
        const languages = criteria.skills.filter(skill =>
            ['JavaScript', 'Python', 'Java', 'Go', 'Rust', 'TypeScript'].includes(skill)
        );

        if (languages.length > 0) {
            parts.push(`language:${languages[0]}`);
        }

        // Keywords
        if (criteria.keywords.length > 0) {
            parts.push(criteria.keywords.slice(0, 3).join(' '));
        }

        // Location
        if (criteria.location.length > 0) {
            parts.push(`location:"${criteria.location[0]}"`);
        }

        return parts.join(' ');
    }

    private buildInternalQuery(criteria: SearchCriteria, targetRole: any): any {
        return {
            skills: criteria.skills,
            experienceRange: criteria.experience,
            locations: criteria.location,
            keywords: criteria.keywords
        };
    }

    private async performSearch(source: string, query: any): Promise<any> {
        // In production, this would call actual APIs
        // For now, return mock data
        return {
            source,
            query,
            results: this.generateMockResults(source, query)
        };
    }

    private generateMockResults(source: string, query: any): any[] {
        // Generate realistic mock candidates
        const mockCandidates = [
            {
                id: `${source}-001`,
                name: 'Sarah Chen',
                title: 'Senior Software Engineer',
                company: 'TechCorp',
                location: 'San Francisco, CA',
                skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
                experience: 6,
                profileUrl: `https://${source}.com/sarahchen`,
                summary: 'Full-stack engineer with expertise in building scalable web applications'
            },
            {
                id: `${source}-002`,
                name: 'Michael Rodriguez',
                title: 'Lead Developer',
                company: 'StartupXYZ',
                location: 'New York, NY',
                skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
                experience: 8,
                profileUrl: `https://${source}.com/mrodriguez`,
                summary: 'Backend specialist with strong DevOps experience'
            }
        ];

        return mockCandidates;
    }

    private parseLinkedInResults(results: any): Candidate[] {
        return results.results.map((result: any) => ({
            id: result.id,
            name: result.name,
            title: result.title,
            company: result.company,
            location: result.location,
            matchScore: 0, // Will be calculated later
            profileUrl: result.profileUrl,
            highlights: this.extractHighlights(result),
            contactInfo: {
                linkedin: result.profileUrl
            }
        }));
    }

    private parseGitHubResults(results: any): Candidate[] {
        return results.results.map((result: any) => ({
            id: result.id,
            name: result.name || 'GitHub User',
            title: 'Software Developer', // Default title
            company: result.company || 'Independent',
            location: result.location || 'Remote',
            matchScore: 0,
            profileUrl: `https://github.com/${result.username}`,
            highlights: [`${result.repositories} repositories`, `${result.followers} followers`],
            contactInfo: {
                github: result.profileUrl
            }
        }));
    }

    private parseInternalResults(results: any): Candidate[] {
        return results.results.map((result: any) => ({
            id: result.id,
            name: result.name,
            title: result.title,
            company: result.company,
            location: result.location,
            matchScore: 0,
            profileUrl: result.profileUrl || '#',
            highlights: this.extractHighlights(result),
            contactInfo: result.contactInfo || {}
        }));
    }

    private extractHighlights(candidate: any): string[] {
        const highlights = [];

        if (candidate.skills?.length > 0) {
            highlights.push(`Skills: ${candidate.skills.slice(0, 3).join(', ')}`);
        }

        if (candidate.experience) {
            highlights.push(`${candidate.experience} years experience`);
        }

        if (candidate.summary) {
            highlights.push(candidate.summary.substring(0, 100) + '...');
        }

        return highlights;
    }

    private deduplicateCandidates(candidates: Candidate[]): Candidate[] {
        const seen = new Map<string, Candidate>();

        candidates.forEach(candidate => {
            const key = `${candidate.name}-${candidate.company}`.toLowerCase();
            if (!seen.has(key) || candidate.matchScore > seen.get(key)!.matchScore) {
                seen.set(key, candidate);
            }
        });

        return Array.from(seen.values());
    }

    private rankCandidates(searchResults: any, criteria: SearchCriteria): Candidate[] {
        return searchResults.candidates
            .map((candidate: Candidate) => ({
                ...candidate,
                matchScore: this.calculateMatchScore(candidate, criteria)
            }))
            .sort((a, b) => b.matchScore - a.matchScore);
    }

    private calculateMatchScore(candidate: Candidate, criteria: SearchCriteria): number {
        let score = 0;
        const weights = {
            skills: 0.35,
            experience: 0.25,
            location: 0.20,
            company: 0.20
        };

        // Skills match
        const skillMatches = candidate.highlights
            .join(' ')
            .toLowerCase()
            .split(' ')
            .filter(word => criteria.skills.some(skill =>
                skill.toLowerCase().includes(word) || word.includes(skill.toLowerCase())
            )).length;

        score += (skillMatches / criteria.skills.length) * weights.skills * 100;

        // Location match
        if (criteria.location.some(loc => candidate.location.includes(loc))) {
            score += weights.location * 100;
        }

        // Company type match
        if (criteria.companies.some(company => candidate.company.includes(company))) {
            score += weights.company * 100;
        }

        // Experience match (simplified)
        score += weights.experience * 75; // Placeholder

        return Math.round(score);
    }

    private async enrichCandidates(candidates: Candidate[]): Promise<Candidate[]> {
        // In production, would fetch additional data
        // For now, add some enrichment
        return candidates.map(candidate => ({
            ...candidate,
            highlights: [
                ...candidate.highlights,
                `Match Score: ${candidate.matchScore}%`
            ]
        }));
    }

    private generateSearchInsights(candidates: Candidate[], criteria: SearchCriteria): any {
        return {
            totalCandidates: candidates.length,
            averageMatchScore: Math.round(
                candidates.reduce((sum, c) => sum + c.matchScore, 0) / candidates.length
            ),
            topLocations: this.getTopLocations(candidates),
            topCompanies: this.getTopCompanies(candidates),
            skillsDistribution: this.analyzeSkillsDistribution(candidates, criteria)
        };
    }

    private assessSearchQuality(candidates: Candidate[], criteria: SearchCriteria): number {
        if (candidates.length === 0) return 0;

        const avgMatchScore = candidates.reduce((sum, c) => sum + c.matchScore, 0) / candidates.length;
        const hasHighMatches = candidates.filter(c => c.matchScore > 70).length;

        let quality = avgMatchScore;
        if (hasHighMatches >= 5) quality += 10;
        if (candidates.length >= 10) quality += 10;

        return Math.min(Math.round(quality), 100);
    }

    private suggestNextSteps(candidates: Candidate[], criteria: SearchCriteria): string[] {
        const steps = [];

        if (candidates.length < 5) {
            steps.push('Broaden search criteria to find more candidates');
        }

        if (candidates.filter(c => c.matchScore > 80).length > 0) {
            steps.push('Review top candidates and initiate outreach');
        }

        steps.push('Run profile analysis on top 10 candidates');
        steps.push('Craft personalized messages for high-match candidates');

        return steps;
    }

    private generateRecommendations(insights: any): string[] {
        const recommendations = [];

        if (insights.averageMatchScore < 60) {
            recommendations.push('Consider relaxing some search criteria');
        }

        if (insights.totalCandidates < 10) {
            recommendations.push('Expand search to additional sources');
        }

        recommendations.push(`Focus on candidates from ${insights.topCompanies[0]} - high concentration of matches`);

        return recommendations;
    }

    private suggestAlternativeSearches(criteria: SearchCriteria, candidates: Candidate[]): any[] {
        return [
            {
                name: 'Broaden Skills',
                changes: 'Include related technologies',
                expectedIncrease: '+40% candidates'
            },
            {
                name: 'Expand Location',
                changes: 'Include remote candidates',
                expectedIncrease: '+60% candidates'
            },
            {
                name: 'Similar Companies',
                changes: 'Target competitors and similar startups',
                expectedIncrease: '+30% candidates'
            }
        ];
    }

    private generateTitleVariations(title: string): string[] {
        const variations = [title];

        // Common variations
        if (title.includes('Engineer')) {
            variations.push(title.replace('Engineer', 'Developer'));
        }
        if (title.includes('Senior')) {
            variations.push(title.replace('Senior', 'Lead'));
            variations.push(title.replace('Senior', 'Sr.'));
        }

        return variations;
    }

    private getTopLocations(candidates: Candidate[]): string[] {
        const locationCounts = new Map<string, number>();

        candidates.forEach(c => {
            const location = c.location.split(',')[0]; // City only
            locationCounts.set(location, (locationCounts.get(location) || 0) + 1);
        });

        return Array.from(locationCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([location]) => location);
    }

    private getTopCompanies(candidates: Candidate[]): string[] {
        const companyCounts = new Map<string, number>();

        candidates.forEach(c => {
            companyCounts.set(c.company, (companyCounts.get(c.company) || 0) + 1);
        });

        return Array.from(companyCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([company]) => company);
    }

    private analyzeSkillsDistribution(candidates: Candidate[], criteria: SearchCriteria): any {
        const skillCounts = new Map<string, number>();

        // Count skill mentions in highlights
        candidates.forEach(c => {
            criteria.skills.forEach(skill => {
                if (c.highlights.some(h => h.toLowerCase().includes(skill.toLowerCase()))) {
                    skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
                }
            });
        });

        return Object.fromEntries(skillCounts);
    }
}

interface SearchStrategy {
    name: string;
    buildQuery: (criteria: SearchCriteria, targetRole: any) => any;
    parseResults: (results: any) => Candidate[];
    cost: number;
}

export async function POST(request: NextRequest) {
    const agent = new TalentSourcerAgent();
    return agent.process(request);
} 