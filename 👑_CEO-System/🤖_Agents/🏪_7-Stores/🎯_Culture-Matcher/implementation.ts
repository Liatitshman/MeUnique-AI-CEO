// Culture Matcher Implementation
// Priority: 3
// Type: Store Agent

import { agentBus } from '@/lib/agents/agent-communication';
import { supabase } from '@/lib/supabase';

export class CultureMatcherAgent {
    private name = 'culture-matcher';
    private priority = 3;

    constructor() {
        this.registerListeners();
    }

    private registerListeners() {
        agentBus.on(`${this.name}:request`, this.handleRequest.bind(this));
    }

    async handleRequest(message: any) {
        const { type, data } = message;

        switch (type) {
            case 'analyze_culture':
                return await this.analyzeCulture(data);
            case 'match_candidate':
                return await this.matchCandidate(data);
            case 'cultural_fit_score':
                return await this.calculateCulturalFit(data);
            default:
                throw new Error(`Unknown request type: ${type}`);
        }
    }

    /**
     * Analyze company culture from various sources
     */
    async analyzeCulture(companyData: any) {
        const analysis = {
            values: this.extractValues(companyData),
            workStyle: this.analyzeWorkStyle(companyData),
            teamDynamics: this.analyzeTeamDynamics(companyData),
            communication: this.analyzeCommunication(companyData),
            growthCulture: this.analyzeGrowthCulture(companyData)
        };

        // Store in database
        await this.storeCultureAnalysis(companyData.id, analysis);

        return analysis;
    }

    /**
     * Match candidate personality to company culture
     */
    async matchCandidate(params: {
        candidateId: string;
        companyId: string;
        jobId: string;
    }) {
        // Get candidate personality from Profile Analyzer
        const candidateProfile = await agentBus.request({
            to: 'profile-analyzer',
            type: 'get_personality',
            data: { candidateId: params.candidateId }
        });

        // Get company culture
        const companyCulture = await this.getCompanyCulture(params.companyId);

        // Calculate match
        const match = {
            overallScore: 0,
            dimensions: {
                values: this.matchValues(candidateProfile, companyCulture),
                workStyle: this.matchWorkStyle(candidateProfile, companyCulture),
                communication: this.matchCommunication(candidateProfile, companyCulture),
                growth: this.matchGrowthAlignment(candidateProfile, companyCulture)
            },
            insights: [],
            recommendations: []
        };

        // Calculate overall score
        match.overallScore = this.calculateOverallScore(match.dimensions);

        // Generate insights
        match.insights = this.generateInsights(match.dimensions);

        // Generate recommendations
        match.recommendations = this.generateRecommendations(match);

        return match;
    }

    /**
     * Calculate cultural fit score
     */
    async calculateCulturalFit(params: any) {
        const match = await this.matchCandidate(params);

        return {
            score: match.overallScore,
            status: this.getStatus(match.overallScore),
            topStrengths: this.getTopStrengths(match),
            potentialChallenges: this.getPotentialChallenges(match),
            adaptationTips: this.getAdaptationTips(match)
        };
    }

    // Helper methods
    private extractValues(data: any) {
        // Extract company values from various sources
        return {
            stated: data.statedValues || [],
            observed: this.analyzeObservedValues(data),
            employee: data.employeeFeedback?.values || []
        };
    }

    private analyzeWorkStyle(data: any) {
        return {
            pace: data.pace || 'moderate',
            structure: data.structure || 'flexible',
            collaboration: data.collaboration || 'balanced',
            autonomy: data.autonomy || 'moderate'
        };
    }

    private analyzeTeamDynamics(data: any) {
        return {
            size: data.teamSize || 'small',
            hierarchy: data.hierarchy || 'flat',
            diversity: data.diversity || 'moderate',
            turnover: data.turnover || 'low'
        };
    }

    private analyzeCommunication(data: any) {
        return {
            style: data.communicationStyle || 'direct',
            frequency: data.meetingFrequency || 'regular',
            channels: data.communicationChannels || ['slack', 'email'],
            transparency: data.transparency || 'high'
        };
    }

    private analyzeGrowthCulture(data: any) {
        return {
            learning: data.learningOpportunities || 'high',
            mentorship: data.mentorshipProgram || true,
            promotion: data.promotionRate || 'moderate',
            innovation: data.innovationFocus || 'high'
        };
    }

    private calculateOverallScore(dimensions: any): number {
        const weights = {
            values: 0.3,
            workStyle: 0.25,
            communication: 0.25,
            growth: 0.2
        };

        let score = 0;
        for (const [key, weight] of Object.entries(weights)) {
            score += dimensions[key] * weight;
        }

        return Math.round(score * 100) / 100;
    }

    private getStatus(score: number): string {
        if (score >= 0.8) return 'excellent_fit';
        if (score >= 0.6) return 'good_fit';
        if (score >= 0.4) return 'moderate_fit';
        return 'poor_fit';
    }

    // Database operations
    private async storeCultureAnalysis(companyId: string, analysis: any) {
        const { error } = await supabase
            .from('company_cultures')
            .upsert({
                company_id: companyId,
                analysis,
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error('Error storing culture analysis:', error);
        }
    }

    private async getCompanyCulture(companyId: string) {
        const { data, error } = await supabase
            .from('company_cultures')
            .select('analysis')
            .eq('company_id', companyId)
            .single();

        if (error) {
            console.error('Error fetching company culture:', error);
            return null;
        }

        return data?.analysis;
    }

    // Additional helper methods...
    private matchValues(candidate: any, company: any): number {
        // Complex matching logic
        return 0.75; // Placeholder
    }

    private matchWorkStyle(candidate: any, company: any): number {
        return 0.80; // Placeholder
    }

    private matchCommunication(candidate: any, company: any): number {
        return 0.70; // Placeholder
    }

    private matchGrowthAlignment(candidate: any, company: any): number {
        return 0.85; // Placeholder
    }

    private generateInsights(dimensions: any): string[] {
        const insights = [];

        if (dimensions.values > 0.8) {
            insights.push('Strong alignment with company values');
        }

        if (dimensions.workStyle < 0.5) {
            insights.push('May need adjustment to work pace');
        }

        return insights;
    }

    private generateRecommendations(match: any): string[] {
        const recommendations = [];

        if (match.overallScore > 0.7) {
            recommendations.push('Highlight cultural alignment in outreach');
        }

        return recommendations;
    }

    private getTopStrengths(match: any): string[] {
        return ['Value alignment', 'Communication style match'];
    }

    private getPotentialChallenges(match: any): string[] {
        return ['Pace adjustment needed'];
    }

    private getAdaptationTips(match: any): string[] {
        return ['Start with structured onboarding'];
    }

    private analyzeObservedValues(data: any): string[] {
        // Analyze from employee posts, reviews, etc.
        return ['innovation', 'collaboration'];
    }
}

// Export singleton instance
export const cultureMatcher = new CultureMatcherAgent(); 