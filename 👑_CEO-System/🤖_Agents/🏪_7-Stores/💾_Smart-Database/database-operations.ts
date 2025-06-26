// Database Operations and Agent Interface
// Provides database functionality and recommendations to other agents

import {
    Candidate,
    Company,
    Position,
    DatabaseOperations,
    SearchCriteria,
    CompanySearchCriteria,
    CandidateMatch,
    ImportResult,
    SourceAnalytics,
    PipelineAnalytics,
    HiringMetrics,
    CandidateStatus
} from './database-schema';
import { sourceManager } from './data-sources';
import { sampleCandidates, sampleCompanies } from './sample-data';
import { eventBus } from '@/lib/agents/agent-communication';

export class SmartDatabaseOperations implements DatabaseOperations {
    private candidates: Map<string, Candidate> = new Map();
    private companies: Map<string, Company> = new Map();
    private positions: Map<string, Position> = new Map();
    private searchHistory: Map<string, SearchHistory> = new Map();
    private recommendations: Map<string, Recommendation[]> = new Map();

    constructor() {
        this.initializeWithSampleData();
        this.setupAgentListeners();
    }

    private initializeWithSampleData() {
        // Load sample candidates
        sampleCandidates.forEach((candidate, index) => {
            const id = `cand-${index + 1}`;
            this.candidates.set(id, { ...candidate, id });
        });

        // Load sample companies
        sampleCompanies.forEach((company, index) => {
            const id = `comp-${index + 1}`;
            this.companies.set(id, { ...company, id });

            // Extract positions
            company.hiringInfo.activePositions.forEach(position => {
                this.positions.set(position.id, position);
            });
        });
    }

    private setupAgentListeners() {
        // Listen for sourcing requests
        eventBus.on('sourcing:request', async (data: any) => {
            const recommendations = await this.getSourceRecommendations(data);
            eventBus.emit('database:recommendations', {
                type: 'sourcing',
                agentId: data.agentId,
                recommendations
            });
        });

        // Listen for candidate updates
        eventBus.on('candidate:updated', async (data: any) => {
            await this.updateCandidate(data.candidateId, data.updates);
        });

        // Listen for search requests
        eventBus.on('search:candidates', async (data: any) => {
            const results = await this.searchCandidates(data.criteria);
            eventBus.emit('database:search:results', {
                requestId: data.requestId,
                results
            });
        });
    }

    // Candidate Operations
    async createCandidate(candidate: Omit<Candidate, 'id'>): Promise<Candidate> {
        const id = `cand-${Date.now()}`;
        const newCandidate: Candidate = { ...candidate, id };

        this.candidates.set(id, newCandidate);

        // Notify other agents
        eventBus.emit('database:candidate:created', {
            candidateId: id,
            candidate: newCandidate
        });

        // Generate recommendations for this candidate
        await this.generateCandidateRecommendations(id);

        return newCandidate;
    }

    async updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate> {
        const existing = this.candidates.get(id);
        if (!existing) throw new Error('Candidate not found');

        const updated = this.deepMerge(existing, updates) as Candidate;
        this.candidates.set(id, updated);

        // Notify other agents
        eventBus.emit('database:candidate:updated', {
            candidateId: id,
            updates,
            candidate: updated
        });

        // Update recommendations
        await this.generateCandidateRecommendations(id);

        return updated;
    }

    async getCandidate(id: string): Promise<Candidate | null> {
        return this.candidates.get(id) || null;
    }

    async searchCandidates(criteria: SearchCriteria): Promise<Candidate[]> {
        let results = Array.from(this.candidates.values());

        // Apply filters
        if (criteria.skills && criteria.skills.length > 0) {
            results = results.filter(candidate =>
                criteria.skills!.some(skill =>
                    candidate.professionalInfo.skills.some(s =>
                        s.name.toLowerCase().includes(skill.toLowerCase())
                    )
                )
            );
        }

        if (criteria.location) {
            results = results.filter(candidate =>
                candidate.personalInfo.location.city.toLowerCase().includes(criteria.location!.toLowerCase()) ||
                candidate.personalInfo.location.country.toLowerCase().includes(criteria.location!.toLowerCase())
            );
        }

        if (criteria.experience) {
            results = results.filter(candidate =>
                candidate.professionalInfo.yearsOfExperience >= criteria.experience!.min &&
                candidate.professionalInfo.yearsOfExperience <= criteria.experience!.max
            );
        }

        if (criteria.status && criteria.status.length > 0) {
            results = results.filter(candidate =>
                criteria.status!.includes(candidate.recruitmentData.status)
            );
        }

        if (criteria.matchScore) {
            results = results.filter(candidate =>
                candidate.recruitmentData.matchScore >= criteria.matchScore!.min
            );
        }

        // Track search for learning
        this.trackSearch(criteria, results);

        return results;
    }

    async bulkImportCandidates(candidates: Omit<Candidate, 'id'>[]): Promise<ImportResult> {
        const result: ImportResult = {
            success: 0,
            failed: 0,
            duplicates: 0,
            errors: []
        };

        for (let i = 0; i < candidates.length; i++) {
            try {
                // Check for duplicates
                const duplicate = this.findDuplicateCandidate(candidates[i]);
                if (duplicate) {
                    result.duplicates++;
                    continue;
                }

                await this.createCandidate(candidates[i]);
                result.success++;
            } catch (error) {
                result.failed++;
                result.errors.push({
                    row: i + 1,
                    field: 'general',
                    error: error instanceof Error ? error.message : 'Unknown error',
                    data: candidates[i]
                });
            }
        }

        return result;
    }

    // Company Operations
    async createCompany(company: Omit<Company, 'id'>): Promise<Company> {
        const id = `comp-${Date.now()}`;
        const newCompany: Company = { ...company, id };

        this.companies.set(id, newCompany);

        // Extract positions
        company.hiringInfo.activePositions.forEach(position => {
            this.positions.set(position.id, position);
        });

        eventBus.emit('database:company:created', {
            companyId: id,
            company: newCompany
        });

        return newCompany;
    }

    async updateCompany(id: string, updates: Partial<Company>): Promise<Company> {
        const existing = this.companies.get(id);
        if (!existing) throw new Error('Company not found');

        const updated = this.deepMerge(existing, updates) as Company;
        this.companies.set(id, updated);

        eventBus.emit('database:company:updated', {
            companyId: id,
            updates,
            company: updated
        });

        return updated;
    }

    async getCompany(id: string): Promise<Company | null> {
        return this.companies.get(id) || null;
    }

    async searchCompanies(criteria: CompanySearchCriteria): Promise<Company[]> {
        let results = Array.from(this.companies.values());

        if (criteria.industry && criteria.industry.length > 0) {
            results = results.filter(company =>
                criteria.industry!.some(ind =>
                    company.basicInfo.industry.some(i =>
                        i.toLowerCase().includes(ind.toLowerCase())
                    )
                )
            );
        }

        if (criteria.size && criteria.size.length > 0) {
            results = results.filter(company =>
                criteria.size!.includes(company.basicInfo.size)
            );
        }

        if (criteria.location) {
            results = results.filter(company =>
                company.basicInfo.headquarters.city.toLowerCase().includes(criteria.location!.toLowerCase()) ||
                company.basicInfo.headquarters.country.toLowerCase().includes(criteria.location!.toLowerCase())
            );
        }

        if (criteria.hiringActive !== undefined) {
            results = results.filter(company =>
                criteria.hiringActive ?
                    company.hiringInfo.activePositions.length > 0 :
                    company.hiringInfo.activePositions.length === 0
            );
        }

        return results;
    }

    // Position Operations
    async createPosition(companyId: string, position: Omit<Position, 'id'>): Promise<Position> {
        const id = `pos-${Date.now()}`;
        const newPosition: Position = { ...position, id };

        this.positions.set(id, newPosition);

        // Update company
        const company = this.companies.get(companyId);
        if (company) {
            company.hiringInfo.activePositions.push(newPosition);
            await this.updateCompany(companyId, { hiringInfo: company.hiringInfo });
        }

        eventBus.emit('database:position:created', {
            positionId: id,
            companyId,
            position: newPosition
        });

        return newPosition;
    }

    async updatePosition(id: string, updates: Partial<Position>): Promise<Position> {
        const existing = this.positions.get(id);
        if (!existing) throw new Error('Position not found');

        const updated = { ...existing, ...updates };
        this.positions.set(id, updated);

        return updated;
    }

    async matchCandidatesToPosition(positionId: string): Promise<CandidateMatch[]> {
        const position = this.positions.get(positionId);
        if (!position) return [];

        const candidates = Array.from(this.candidates.values());
        const matches: CandidateMatch[] = [];

        for (const candidate of candidates) {
            const matchResult = this.calculateMatch(candidate, position);
            if (matchResult.matchScore > 0.6) {
                matches.push(matchResult);
            }
        }

        // Sort by match score
        matches.sort((a, b) => b.matchScore - a.matchScore);

        // Notify agents about matches
        eventBus.emit('database:matches:found', {
            positionId,
            matches: matches.slice(0, 10) // Top 10 matches
        });

        return matches;
    }

    // Analytics Operations
    async getSourceEffectiveness(): Promise<SourceAnalytics> {
        const sourceStats = new Map<string, any>();

        // Analyze candidates by source
        for (const candidate of this.candidates.values()) {
            const source = candidate.sourceInfo.primarySource.type;

            if (!sourceStats.has(source)) {
                sourceStats.set(source, {
                    total: 0,
                    quality: 0,
                    hired: 0,
                    totalQuality: 0
                });
            }

            const stats = sourceStats.get(source);
            stats.total++;
            stats.totalQuality += candidate.recruitmentData.matchScore;

            if (candidate.recruitmentData.status === 'hired') {
                stats.hired++;
            }
        }

        // Calculate metrics
        const sourceBreakdown: Record<string, any> = {};
        for (const [source, stats] of sourceStats.entries()) {
            sourceBreakdown[source] = {
                total: stats.total,
                quality: stats.totalQuality / stats.total,
                hireRate: stats.hired / stats.total,
                avgTimeToHire: 21 // Placeholder
            };
        }

        return {
            sourceBreakdown,
            trends: {
                improving: ['linkedin', 'github'],
                declining: ['indeed']
            },
            recommendations: [
                'Focus on LinkedIn for senior roles',
                'Increase GitHub sourcing for technical positions',
                'Consider reducing Indeed usage due to low quality'
            ]
        };
    }

    async getCandidatePipeline(): Promise<PipelineAnalytics> {
        const stages: Record<CandidateStatus, any> = {
            new: { count: 0, totalDuration: 0 },
            screening: { count: 0, totalDuration: 0 },
            interviewing: { count: 0, totalDuration: 0 },
            reference_check: { count: 0, totalDuration: 0 },
            offer_pending: { count: 0, totalDuration: 0 },
            hired: { count: 0, totalDuration: 0 },
            rejected: { count: 0, totalDuration: 0 },
            withdrawn: { count: 0, totalDuration: 0 },
            on_hold: { count: 0, totalDuration: 0 }
        };

        // Count candidates by stage
        for (const candidate of this.candidates.values()) {
            stages[candidate.recruitmentData.status].count++;
        }

        // Calculate conversion rates
        const pipeline: any = {};
        const statusOrder: CandidateStatus[] = ['new', 'screening', 'interviewing', 'reference_check', 'offer_pending', 'hired'];

        for (let i = 0; i < statusOrder.length; i++) {
            const status = statusOrder[i];
            const nextStatus = statusOrder[i + 1];

            pipeline[status] = {
                count: stages[status].count,
                avgDuration: 3, // Placeholder days
                conversionRate: nextStatus ? stages[nextStatus].count / stages[status].count : 1
            };
        }

        return {
            stages: pipeline,
            bottlenecks: ['interviewing'], // Example
            velocity: 0.75
        };
    }

    async getHiringMetrics(companyId?: string): Promise<HiringMetrics> {
        let hiredCandidates = Array.from(this.candidates.values())
            .filter(c => c.recruitmentData.status === 'hired');

        if (companyId) {
            // Filter by company if specified
            const company = this.companies.get(companyId);
            if (company) {
                const positionIds = company.hiringInfo.activePositions.map(p => p.id);
                hiredCandidates = hiredCandidates.filter(c =>
                    c.recruitmentData.appliedPositions.some(p => positionIds.includes(p))
                );
            }
        }

        return {
            totalHires: hiredCandidates.length,
            avgTimeToHire: 21,
            costPerHire: 3500,
            qualityOfHire: 0.85,
            retentionRate: 0.9,
            diversityMetrics: {
                genderRatio: { male: 0.6, female: 0.35, other: 0.05 },
                internationalStaff: 0.3
            }
        };
    }

    // Recommendation Engine
    private async generateCandidateRecommendations(candidateId: string) {
        const candidate = this.candidates.get(candidateId);
        if (!candidate) return;

        const recommendations: Recommendation[] = [];

        // Skill recommendations
        const relatedSkills = this.getRelatedSkills(candidate.professionalInfo.skills);
        if (relatedSkills.length > 0) {
            recommendations.push({
                type: 'skills',
                title: 'Consider candidates with these related skills',
                items: relatedSkills,
                confidence: 0.85
            });
        }

        // Source recommendations
        const sourceRecs = await this.getSourceRecommendationsForCandidate(candidate);
        recommendations.push(...sourceRecs);

        // Position recommendations
        const positionMatches = await this.findMatchingPositions(candidate);
        if (positionMatches.length > 0) {
            recommendations.push({
                type: 'positions',
                title: 'Matching open positions',
                items: positionMatches.map(p => ({
                    id: p.id,
                    title: p.title,
                    matchScore: this.calculateMatch(candidate, p).matchScore
                })),
                confidence: 0.9
            });
        }

        this.recommendations.set(candidateId, recommendations);

        // Notify agents
        eventBus.emit('database:recommendations:updated', {
            candidateId,
            recommendations
        });
    }

    private async getSourceRecommendations(data: any): Promise<SourceRecommendation[]> {
        const { role, requirements, skills } = data;

        // Use source manager to get recommendations
        const recommendations = sourceManager.getSourceRecommendations(role, requirements);

        // Enhance with our data
        const enhanced = recommendations.map(rec => ({
            ...rec,
            historicalSuccess: this.getHistoricalSuccessRate(rec.source, skills),
            estimatedCandidates: this.estimateCandidatePool(rec.source, skills)
        }));

        return enhanced;
    }

    private async getSourceRecommendationsForCandidate(candidate: Candidate): Promise<Recommendation[]> {
        const skills = candidate.professionalInfo.skills.map(s => s.name);
        const recommendations = sourceManager.getSourceRecommendations(
            candidate.professionalInfo.currentTitle,
            skills
        );

        return [{
            type: 'sources',
            title: 'Recommended sources for similar candidates',
            items: recommendations,
            confidence: 0.8
        }];
    }

    private calculateMatch(candidate: Candidate, position: Position): CandidateMatch {
        let matchScore = 0;
        const matchReasons: string[] = [];
        const gaps: string[] = [];

        // Skill matching
        const requiredSkills = position.requirements;
        const candidateSkills = candidate.professionalInfo.skills.map(s => s.name.toLowerCase());

        let skillMatches = 0;
        for (const required of requiredSkills) {
            if (candidateSkills.some(skill => skill.includes(required.toLowerCase()))) {
                skillMatches++;
                matchReasons.push(`Has ${required}`);
            } else {
                gaps.push(`Missing ${required}`);
            }
        }

        matchScore = skillMatches / requiredSkills.length;

        // Experience matching
        if (candidate.professionalInfo.yearsOfExperience >= 5 && position.level === 'senior') {
            matchScore += 0.2;
            matchReasons.push('Appropriate experience level');
        }

        // Location matching
        if (candidate.personalInfo.location.remoteOk ||
            candidate.personalInfo.location.city === 'San Francisco') {
            matchScore += 0.1;
            matchReasons.push('Location match');
        }

        // Normalize score
        matchScore = Math.min(1, matchScore);

        return {
            candidate,
            matchScore,
            matchReasons,
            gaps
        };
    }

    private findDuplicateCandidate(candidate: Omit<Candidate, 'id'>): Candidate | null {
        for (const existing of this.candidates.values()) {
            if (existing.personalInfo.email === candidate.personalInfo.email) {
                return existing;
            }
        }
        return null;
    }

    private trackSearch(criteria: SearchCriteria, results: Candidate[]) {
        const key = JSON.stringify(criteria);
        const history = this.searchHistory.get(key) || {
            count: 0,
            totalResults: 0,
            avgMatchScore: 0
        };

        history.count++;
        history.totalResults += results.length;
        history.avgMatchScore = results.reduce((sum, c) => sum + c.recruitmentData.matchScore, 0) / results.length;

        this.searchHistory.set(key, history);
    }

    private getRelatedSkills(skills: any[]): string[] {
        const skillMap: Record<string, string[]> = {
            'React': ['Vue', 'Angular', 'Next.js'],
            'Node.js': ['Express', 'NestJS', 'Fastify'],
            'Python': ['Django', 'Flask', 'FastAPI'],
            'AWS': ['GCP', 'Azure', 'Cloud Architecture'],
            'Kubernetes': ['Docker', 'Helm', 'Istio']
        };

        const related = new Set<string>();
        for (const skill of skills) {
            const relatives = skillMap[skill.name] || [];
            relatives.forEach(r => related.add(r));
        }

        return Array.from(related);
    }

    private async findMatchingPositions(candidate: Candidate): Promise<Position[]> {
        const matches: Position[] = [];

        for (const position of this.positions.values()) {
            const match = this.calculateMatch(candidate, position);
            if (match.matchScore > 0.7) {
                matches.push(position);
            }
        }

        return matches;
    }

    private getHistoricalSuccessRate(source: string, skills: string[]): number {
        // Placeholder - would calculate from historical data
        const rates: Record<string, number> = {
            'linkedin': 0.85,
            'github': 0.92,
            'indeed': 0.65,
            'angellist': 0.78
        };
        return rates[source] || 0.7;
    }

    private estimateCandidatePool(source: string, skills: string[]): number {
        // Placeholder - would estimate from data
        const pools: Record<string, number> = {
            'linkedin': 10000,
            'github': 5000,
            'indeed': 15000,
            'angellist': 3000
        };
        return pools[source] || 1000;
    }

    private deepMerge(target: any, source: any): any {
        const output = Object.assign({}, target);
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target))
                        Object.assign(output, { [key]: source[key] });
                    else
                        output[key] = this.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }

    private isObject(item: any): boolean {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    // Public interface for other agents
    async provideRecommendations(agentId: string, context: any): Promise<AgentRecommendation> {
        const recommendations: AgentRecommendation = {
            agentId,
            timestamp: new Date(),
            recommendations: []
        };

        switch (agentId) {
            case 'talent-sourcer':
                recommendations.recommendations = await this.getSourcerRecommendations(context);
                break;
            case 'profile-analyzer':
                recommendations.recommendations = await this.getAnalyzerRecommendations(context);
                break;
            case 'culture-matcher':
                recommendations.recommendations = await this.getCultureRecommendations(context);
                break;
            default:
                recommendations.recommendations = [{
                    action: 'search',
                    priority: 'medium',
                    data: { message: 'Use searchCandidates method for finding candidates' }
                }];
        }

        return recommendations;
    }

    private async getSourcerRecommendations(context: any): Promise<any[]> {
        const { skills, location, level } = context;

        // Analyze which sources have been most effective
        const sourceAnalytics = await this.getSourceEffectiveness();

        return [
            {
                action: 'focus-source',
                priority: 'high',
                data: {
                    source: 'linkedin',
                    reason: 'Highest quality candidates for senior roles',
                    expectedYield: 50
                }
            },
            {
                action: 'expand-search',
                priority: 'medium',
                data: {
                    locations: ['Remote', 'San Francisco', 'New York'],
                    reason: 'These locations have high concentration of target skills'
                }
            },
            {
                action: 'use-boolean',
                priority: 'high',
                data: {
                    query: `("${skills.join('" OR "')}") AND ("${level}" OR "staff" OR "principal")`,
                    platforms: ['linkedin', 'github']
                }
            }
        ];
    }

    private async getAnalyzerRecommendations(context: any): Promise<any[]> {
        const { candidateId } = context;
        const candidate = await this.getCandidate(candidateId);

        if (!candidate) return [];

        return [
            {
                action: 'analyze-github',
                priority: 'high',
                data: {
                    username: candidate.socialProfiles.github?.split('/').pop(),
                    focus: ['contributions', 'languages', 'activity']
                }
            },
            {
                action: 'verify-skills',
                priority: 'medium',
                data: {
                    skills: candidate.professionalInfo.skills.filter(s => !s.verified).map(s => s.name),
                    methods: ['github-repos', 'linkedin-endorsements']
                }
            }
        ];
    }

    private async getCultureRecommendations(context: any): Promise<any[]> {
        const { candidateId, companyId } = context;
        const candidate = await this.getCandidate(candidateId);
        const company = await this.getCompany(companyId);

        if (!candidate || !company) return [];

        return [
            {
                action: 'assess-values',
                priority: 'high',
                data: {
                    companyValues: company.culture.values,
                    candidateIndicators: ['open-source', 'blog-posts', 'volunteer-work']
                }
            },
            {
                action: 'check-work-style',
                priority: 'medium',
                data: {
                    companyStyle: company.culture.workStyle,
                    candidatePreference: candidate.preferences.workType
                }
            }
        ];
    }
}

// Type definitions
interface SearchHistory {
    count: number;
    totalResults: number;
    avgMatchScore: number;
}

interface Recommendation {
    type: string;
    title: string;
    items: any[];
    confidence: number;
}

interface SourceRecommendation {
    source: string;
    reason: string;
    confidence: number;
    historicalSuccess?: number;
    estimatedCandidates?: number;
}

interface AgentRecommendation {
    agentId: string;
    timestamp: Date;
    recommendations: any[];
}

// Export singleton instance
export const databaseOperations = new SmartDatabaseOperations(); 