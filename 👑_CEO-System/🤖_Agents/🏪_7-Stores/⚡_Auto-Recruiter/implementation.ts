import { NextRequest, NextResponse } from 'next/server';
import { eventBus } from '@/lib/agents/agent-communication';

interface AutoRecruiterConfig {
    name: string;
    emoji: string;
    priority: number;
    costPerUse: number;
    capabilities: string[];
    sources: string[];
    expansionStrategies: string[];
}

interface CandidateSource {
    platform: string;
    searchQuery: string;
    filters: Record<string, any>;
    maxResults: number;
}

interface ExpansionResult {
    newCandidates: number;
    sources: string[];
    quality: {
        highMatch: number;
        mediumMatch: number;
        lowMatch: number;
    };
    cost: number;
    recommendations: string[];
}

export class AutoRecruiterAgent {
    private config: AutoRecruiterConfig;
    private candidatePool: Map<string, any> = new Map();
    private sourcePerformance: Map<string, number> = new Map();

    constructor() {
        this.config = {
            name: 'Auto Recruiter',
            emoji: '⚡',
            priority: 2,
            costPerUse: 0.15,
            capabilities: [
                'source-expansion',
                'web-scraping',
                'cost-monitoring',
                'duplicate-detection',
                'quality-filtering',
                'batch-processing'
            ],
            sources: [
                'LinkedIn',
                'GitHub',
                'AngelList',
                'Hired',
                'Wellfound',
                'Stack Overflow',
                'Twitter/X',
                'Personal Websites',
                'University Alumni',
                'Conference Attendees'
            ],
            expansionStrategies: [
                'similar-profiles',
                'company-alumni',
                'skill-based-search',
                'network-expansion',
                'event-attendees',
                'open-source-contributors'
            ]
        };

        this.initializeSourceTracking();
    }

    private initializeSourceTracking() {
        // Track source effectiveness
        eventBus.on('candidate:hired', (data: any) => {
            if (data.source) {
                const performance = this.sourcePerformance.get(data.source) || 0;
                this.sourcePerformance.set(data.source, performance + 1);
            }
        });

        // Listen for expansion requests
        eventBus.on('pool:expand:request', (data: any) => {
            this.expandCandidatePool(data.criteria, data.targetSize);
        });
    }

    async expandCandidatePool(
        criteria: any,
        targetSize: number = 100
    ): Promise<ExpansionResult> {
        const currentSize = this.candidatePool.size;
        const needed = targetSize - currentSize;

        if (needed <= 0) {
            return {
                newCandidates: 0,
                sources: [],
                quality: { highMatch: 0, mediumMatch: 0, lowMatch: 0 },
                cost: 0,
                recommendations: ['Pool already at target size']
            };
        }

        // Get approval from CFO for expansion cost
        const estimatedCost = needed * 0.15;
        const cfoApproval = await this.requestCFOApproval(estimatedCost);

        if (!cfoApproval) {
            return {
                newCandidates: 0,
                sources: [],
                quality: { highMatch: 0, mediumMatch: 0, lowMatch: 0 },
                cost: 0,
                recommendations: ['Expansion blocked by CFO - budget limit reached']
            };
        }

        // Execute expansion strategies
        const sources = this.selectOptimalSources(criteria);
        const candidates = await this.searchCandidates(sources, criteria, needed);

        // Filter and deduplicate
        const filteredCandidates = this.filterAndDeduplicate(candidates);

        // Categorize by quality
        const quality = this.categorizeCandidateQuality(filteredCandidates, criteria);

        // Add to pool
        filteredCandidates.forEach(candidate => {
            this.candidatePool.set(candidate.id, candidate);
        });

        // Generate recommendations
        const recommendations = this.generateExpansionRecommendations(
            quality,
            sources,
            criteria
        );

        // Emit event for other agents
        eventBus.emit('pool:expanded', {
            newCount: filteredCandidates.length,
            totalCount: this.candidatePool.size,
            quality
        });

        return {
            newCandidates: filteredCandidates.length,
            sources: sources.map(s => s.platform),
            quality,
            cost: filteredCandidates.length * 0.15,
            recommendations
        };
    }

    private async requestCFOApproval(estimatedCost: number): Promise<boolean> {
        return new Promise((resolve) => {
            eventBus.emit('cfo:approval:request', {
                agent: this.config.name,
                cost: estimatedCost,
                purpose: 'candidate-pool-expansion'
            });

            eventBus.once('cfo:approval:response', (response: any) => {
                resolve(response.approved);
            });

            // Timeout fallback
            setTimeout(() => resolve(true), 5000);
        });
    }

    private selectOptimalSources(criteria: any): CandidateSource[] {
        const sources: CandidateSource[] = [];

        // LinkedIn for professional profiles
        if (criteria.experience > 2) {
            sources.push({
                platform: 'LinkedIn',
                searchQuery: this.buildLinkedInQuery(criteria),
                filters: {
                    experience: criteria.experience,
                    location: criteria.location,
                    skills: criteria.skills
                },
                maxResults: 30
            });
        }

        // GitHub for technical roles
        if (criteria.skills.some((s: string) => ['JavaScript', 'Python', 'React'].includes(s))) {
            sources.push({
                platform: 'GitHub',
                searchQuery: this.buildGitHubQuery(criteria),
                filters: {
                    language: criteria.primaryLanguage,
                    stars: '>10',
                    contributions: '>100'
                },
                maxResults: 20
            });
        }

        // AngelList for startup experience
        if (criteria.companyType === 'startup') {
            sources.push({
                platform: 'AngelList',
                searchQuery: criteria.title,
                filters: {
                    role: criteria.title,
                    location: criteria.location,
                    startupStage: criteria.targetStage
                },
                maxResults: 25
            });
        }

        // Add more sources based on performance history
        const topPerformingSources = Array.from(this.sourcePerformance.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 2)
            .map(([source]) => source);

        topPerformingSources.forEach(source => {
            if (!sources.find(s => s.platform === source)) {
                sources.push({
                    platform: source,
                    searchQuery: criteria.title,
                    filters: criteria,
                    maxResults: 15
                });
            }
        });

        return sources;
    }

    private buildLinkedInQuery(criteria: any): string {
        const parts = [];

        if (criteria.title) parts.push(criteria.title);
        if (criteria.skills?.length) parts.push(criteria.skills.slice(0, 3).join(' OR '));
        if (criteria.industry) parts.push(criteria.industry);

        return parts.join(' AND ');
    }

    private buildGitHubQuery(criteria: any): string {
        const parts = [];

        if (criteria.primaryLanguage) parts.push(`language:${criteria.primaryLanguage}`);
        if (criteria.skills?.length) parts.push(criteria.skills[0]);
        parts.push('repos:>5');

        return parts.join(' ');
    }

    private async searchCandidates(
        sources: CandidateSource[],
        criteria: any,
        limit: number
    ): Promise<any[]> {
        const allCandidates: any[] = [];

        for (const source of sources) {
            try {
                // Simulate API calls - in production, use real APIs
                const candidates = await this.simulateSourceSearch(source, criteria);
                allCandidates.push(...candidates);

                if (allCandidates.length >= limit) break;
            } catch (error) {
                console.error(`Error searching ${source.platform}:`, error);
                eventBus.emit('agent:error', {
                    agent: this.config.name,
                    error: `Failed to search ${source.platform}`,
                    severity: 'medium'
                });
            }
        }

        return allCandidates.slice(0, limit);
    }

    private async simulateSourceSearch(
        source: CandidateSource,
        criteria: any
    ): Promise<any[]> {
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // Generate mock candidates based on source
        const candidates = [];
        const count = Math.min(source.maxResults, 10);

        for (let i = 0; i < count; i++) {
            candidates.push({
                id: `${source.platform}-${Date.now()}-${i}`,
                name: `Candidate ${i + 1}`,
                source: source.platform,
                title: criteria.title || 'Software Engineer',
                experience: Math.floor(Math.random() * 10) + 1,
                skills: criteria.skills || ['JavaScript', 'React'],
                location: criteria.location || 'Remote',
                matchScore: Math.random() * 100,
                profileUrl: `https://${source.platform.toLowerCase()}.com/user${i}`,
                lastActive: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
            });
        }

        return candidates;
    }

    private filterAndDeduplicate(candidates: any[]): any[] {
        const seen = new Set<string>();
        const filtered = [];

        for (const candidate of candidates) {
            // Create unique key
            const key = `${candidate.name}-${candidate.email || candidate.profileUrl}`;

            if (!seen.has(key)) {
                seen.add(key);

                // Quality filters
                if (candidate.matchScore > 30 &&
                    candidate.lastActive > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) {
                    filtered.push(candidate);
                }
            }
        }

        return filtered;
    }

    private categorizeCandidateQuality(
        candidates: any[],
        criteria: any
    ): { highMatch: number; mediumMatch: number; lowMatch: number } {
        let highMatch = 0;
        let mediumMatch = 0;
        let lowMatch = 0;

        candidates.forEach(candidate => {
            if (candidate.matchScore > 80) highMatch++;
            else if (candidate.matchScore > 60) mediumMatch++;
            else lowMatch++;
        });

        return { highMatch, mediumMatch, lowMatch };
    }

    private generateExpansionRecommendations(
        quality: any,
        sources: CandidateSource[],
        criteria: any
    ): string[] {
        const recommendations: string[] = [];

        // Quality-based recommendations
        if (quality.highMatch < quality.lowMatch) {
            recommendations.push('Consider refining search criteria for better matches');
            recommendations.push('Try more specialized job boards or communities');
        }

        // Source-based recommendations
        if (!sources.find(s => s.platform === 'GitHub') && criteria.technical) {
            recommendations.push('Add GitHub search for technical candidates');
        }

        if (!sources.find(s => s.platform === 'AngelList') && criteria.companyType === 'startup') {
            recommendations.push('Include AngelList for startup-experienced candidates');
        }

        // Expansion strategy recommendations
        if (this.candidatePool.size < 50) {
            recommendations.push('Consider broader search criteria to expand pool');
        }

        if (quality.highMatch > quality.mediumMatch + quality.lowMatch) {
            recommendations.push('Excellent match quality - maintain current criteria');
        }

        return recommendations;
    }

    async process(request: NextRequest): Promise<NextResponse> {
        try {
            const { action, criteria, targetSize } = await request.json();

            let result;
            switch (action) {
                case 'expand':
                    result = await this.expandCandidatePool(criteria, targetSize);
                    break;
                case 'status':
                    result = {
                        poolSize: this.candidatePool.size,
                        sources: Array.from(this.sourcePerformance.entries()),
                        recentExpansions: [] // Would track this
                    };
                    break;
                case 'optimize':
                    result = {
                        recommendations: [
                            'Focus on LinkedIn for senior roles',
                            'Use GitHub for technical validation',
                            'Consider niche job boards for specialized skills'
                        ],
                        topSources: Array.from(this.sourcePerformance.entries())
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 5)
                    };
                    break;
                default:
                    result = {
                        status: 'ready',
                        poolSize: this.candidatePool.size,
                        capabilities: this.config.capabilities
                    };
            }

            // Track cost
            eventBus.emit('agent:cost:incurred', {
                agent: this.config.name,
                cost: this.config.costPerUse
            });

            return NextResponse.json({
                success: true,
                agent: this.config.name,
                result,
                cost: this.config.costPerUse,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Auto Recruiter Error:', error);
            return NextResponse.json(
                {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    agent: this.config.name
                },
                { status: 500 }
            );
        }
    }
}

// Export singleton instance
export const autoRecruiterAgent = new AutoRecruiterAgent(); 