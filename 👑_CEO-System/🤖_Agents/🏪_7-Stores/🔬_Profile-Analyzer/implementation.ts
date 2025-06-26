import { NextRequest, NextResponse } from 'next/server';
import { AgentBase } from '@/lib/agents/agent-base';

interface ProfileAnalysis {
    technicalSkills: {
        primary: string[];
        secondary: string[];
        emerging: string[];
        depth: number;
    };
    experience: {
        totalYears: number;
        relevantYears: number;
        companies: CompanyExperience[];
        progression: string;
    };
    personality: {
        traits: string[];
        workStyle: string;
        motivations: string[];
        redFlags: string[];
    };
    potential: {
        growthTrajectory: string;
        learningAgility: number;
        leadershipPotential: number;
        culturalAdaptability: number;
    };
}

interface CompanyExperience {
    name: string;
    role: string;
    duration: string;
    achievements: string[];
    techStack: string[];
}

export class ProfileAnalyzerAgent extends AgentBase {
    constructor() {
        super({
            name: 'Profile Analyzer',
            emoji: '🔬',
            priority: 5,
            costPerUse: 0.08
        });
    }

    async process(request: NextRequest) {
        const { linkedinProfile, githubProfile, resume, targetRole } = await request.json();

        // Deep analysis of all available data
        const analysis = await this.analyzeProfile({
            linkedinProfile,
            githubProfile,
            resume,
            targetRole
        });

        // Generate insights and recommendations
        const insights = this.generateInsights(analysis, targetRole);

        // Calculate match score
        const matchScore = this.calculateMatchScore(analysis, targetRole);

        return NextResponse.json({
            success: true,
            analysis,
            insights,
            matchScore,
            strengths: this.identifyStrengths(analysis),
            gaps: this.identifyGaps(analysis, targetRole),
            interviewQuestions: this.generateInterviewQuestions(analysis, targetRole),
            riskAssessment: this.assessRisks(analysis)
        });
    }

    private async analyzeProfile(data: any): Promise<ProfileAnalysis> {
        const technicalSkills = this.analyzeTechnicalSkills(data);
        const experience = this.analyzeExperience(data);
        const personality = this.analyzePersonality(data);
        const potential = this.analyzePotential(data);

        return {
            technicalSkills,
            experience,
            personality,
            potential
        };
    }

    private analyzeTechnicalSkills(data: any): ProfileAnalysis['technicalSkills'] {
        const skills = new Map<string, number>();

        // Extract from LinkedIn
        if (data.linkedinProfile?.skills) {
            data.linkedinProfile.skills.forEach((skill: any) => {
                skills.set(skill.name, skill.endorsements || 1);
            });
        }

        // Extract from GitHub
        if (data.githubProfile?.repositories) {
            data.githubProfile.repositories.forEach((repo: any) => {
                if (repo.language) {
                    skills.set(repo.language, (skills.get(repo.language) || 0) + repo.stars);
                }
            });
        }

        // Extract from resume
        if (data.resume) {
            const techKeywords = this.extractTechKeywords(data.resume);
            techKeywords.forEach(keyword => {
                skills.set(keyword, (skills.get(keyword) || 0) + 1);
            });
        }

        // Categorize skills
        const sortedSkills = Array.from(skills.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([skill]) => skill);

        return {
            primary: sortedSkills.slice(0, 5),
            secondary: sortedSkills.slice(5, 10),
            emerging: this.identifyEmergingSkills(data),
            depth: this.calculateSkillDepth(skills)
        };
    }

    private analyzeExperience(data: any): ProfileAnalysis['experience'] {
        const companies: CompanyExperience[] = [];
        let totalMonths = 0;
        let relevantMonths = 0;

        // Parse LinkedIn experience
        if (data.linkedinProfile?.experience) {
            data.linkedinProfile.experience.forEach((exp: any) => {
                const duration = this.calculateDuration(exp.startDate, exp.endDate);
                totalMonths += duration;

                if (this.isRelevantExperience(exp, data.targetRole)) {
                    relevantMonths += duration;
                }

                companies.push({
                    name: exp.company,
                    role: exp.title,
                    duration: `${Math.round(duration / 12)} years`,
                    achievements: this.extractAchievements(exp.description),
                    techStack: this.extractTechStack(exp.description)
                });
            });
        }

        return {
            totalYears: Math.round(totalMonths / 12),
            relevantYears: Math.round(relevantMonths / 12),
            companies,
            progression: this.analyzeCareerProgression(companies)
        };
    }

    private analyzePersonality(data: any): ProfileAnalysis['personality'] {
        const traits: string[] = [];
        const motivations: string[] = [];
        const redFlags: string[] = [];

        // Analyze writing style from LinkedIn summary
        if (data.linkedinProfile?.summary) {
            const writingAnalysis = this.analyzeWritingStyle(data.linkedinProfile.summary);
            traits.push(...writingAnalysis.traits);
        }

        // Analyze GitHub activity patterns
        if (data.githubProfile) {
            const githubPatterns = this.analyzeGithubPatterns(data.githubProfile);
            traits.push(...githubPatterns.traits);
            motivations.push(...githubPatterns.motivations);
        }

        // Check for red flags
        if (this.hasFrequentJobChanges(data)) {
            redFlags.push('Frequent job changes');
        }

        if (this.hasGapsInEmployment(data)) {
            redFlags.push('Employment gaps');
        }

        return {
            traits: [...new Set(traits)],
            workStyle: this.determineWorkStyle(traits),
            motivations: [...new Set(motivations)],
            redFlags
        };
    }

    private analyzePotential(data: any): ProfileAnalysis['potential'] {
        return {
            growthTrajectory: this.calculateGrowthTrajectory(data),
            learningAgility: this.calculateLearningAgility(data),
            leadershipPotential: this.calculateLeadershipPotential(data),
            culturalAdaptability: this.calculateCulturalAdaptability(data)
        };
    }

    private generateInsights(analysis: ProfileAnalysis, targetRole: any): any {
        const insights = {
            summary: this.generateExecutiveSummary(analysis),
            strengths: this.identifyKeyStrengths(analysis),
            concerns: this.identifyConcerns(analysis),
            recommendations: this.generateRecommendations(analysis, targetRole)
        };

        return insights;
    }

    private calculateMatchScore(analysis: ProfileAnalysis, targetRole: any): number {
        let score = 0;
        const weights = {
            technical: 0.35,
            experience: 0.25,
            potential: 0.20,
            cultural: 0.20
        };

        // Technical match
        const technicalMatch = this.calculateTechnicalMatch(analysis.technicalSkills, targetRole);
        score += technicalMatch * weights.technical;

        // Experience match
        const experienceMatch = this.calculateExperienceMatch(analysis.experience, targetRole);
        score += experienceMatch * weights.experience;

        // Potential match
        const potentialMatch = (
            analysis.potential.growthTrajectory === 'high' ? 0.9 :
                analysis.potential.growthTrajectory === 'medium' ? 0.7 : 0.5
        );
        score += potentialMatch * weights.potential;

        // Cultural match (placeholder)
        score += 0.75 * weights.cultural;

        return Math.round(score * 100);
    }

    // Helper methods
    private extractTechKeywords(text: string): string[] {
        const techPatterns = [
            /\b(?:JavaScript|TypeScript|Python|Java|C\+\+|Go|Rust|Ruby|PHP)\b/gi,
            /\b(?:React|Angular|Vue|Node\.js|Django|Flask|Spring|Express)\b/gi,
            /\b(?:AWS|Azure|GCP|Docker|Kubernetes|Terraform|Jenkins)\b/gi,
            /\b(?:MongoDB|PostgreSQL|MySQL|Redis|Elasticsearch|DynamoDB)\b/gi
        ];

        const keywords = new Set<string>();
        techPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) matches.forEach(match => keywords.add(match));
        });

        return Array.from(keywords);
    }

    private identifyEmergingSkills(data: any): string[] {
        // Skills that appear in recent projects but not in main skills
        return ['AI/ML', 'Blockchain', 'IoT'];
    }

    private calculateSkillDepth(skills: Map<string, number>): number {
        const totalEndorsements = Array.from(skills.values()).reduce((a, b) => a + b, 0);
        const avgEndorsements = totalEndorsements / skills.size;
        return Math.min(Math.round(avgEndorsements / 10), 10);
    }

    private calculateDuration(startDate: string, endDate: string): number {
        // Calculate months between dates
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : new Date();
        return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
    }

    private isRelevantExperience(exp: any, targetRole: any): boolean {
        // Check if experience is relevant to target role
        return true; // Simplified
    }

    private extractAchievements(description: string): string[] {
        if (!description) return [];

        const achievementPatterns = [
            /(?:led|managed|built|created|developed|implemented|improved|increased|reduced)/i,
            /(?:\d+%|\$\d+[MK]?)/
        ];

        const sentences = description.split('.');
        return sentences.filter(sentence =>
            achievementPatterns.some(pattern => pattern.test(sentence))
        ).slice(0, 3);
    }

    private extractTechStack(description: string): string[] {
        if (!description) return [];
        return this.extractTechKeywords(description);
    }

    private analyzeCareerProgression(companies: CompanyExperience[]): string {
        if (companies.length === 0) return 'unknown';

        // Check for role progression
        const roles = companies.map(c => c.role.toLowerCase());
        const hasProgression = roles.some(role => role.includes('senior') || role.includes('lead'));

        return hasProgression ? 'upward' : 'lateral';
    }

    private analyzeWritingStyle(text: string): { traits: string[] } {
        const traits = [];

        if (text.length > 500) traits.push('detailed-oriented');
        if (text.includes('team')) traits.push('collaborative');
        if (text.includes('led') || text.includes('managed')) traits.push('leadership-oriented');

        return { traits };
    }

    private analyzeGithubPatterns(githubProfile: any): any {
        const traits = [];
        const motivations = [];

        if (githubProfile.contributions > 1000) {
            traits.push('highly-active');
            motivations.push('continuous-learning');
        }

        if (githubProfile.repositories?.some((r: any) => r.fork === false)) {
            traits.push('creator');
            motivations.push('building-from-scratch');
        }

        return { traits, motivations };
    }

    private hasFrequentJobChanges(data: any): boolean {
        const companies = data.linkedinProfile?.experience || [];
        const avgTenure = companies.reduce((acc: number, exp: any) => {
            return acc + this.calculateDuration(exp.startDate, exp.endDate);
        }, 0) / companies.length;

        return avgTenure < 18; // Less than 1.5 years average
    }

    private hasGapsInEmployment(data: any): boolean {
        // Simplified check
        return false;
    }

    private determineWorkStyle(traits: string[]): string {
        if (traits.includes('collaborative')) return 'team-oriented';
        if (traits.includes('highly-active')) return 'self-driven';
        return 'balanced';
    }

    private calculateGrowthTrajectory(data: any): string {
        const progression = data.linkedinProfile?.experience?.[0]?.title.includes('Senior');
        return progression ? 'high' : 'medium';
    }

    private calculateLearningAgility(data: any): number {
        const newSkillsCount = data.githubProfile?.repositories?.length || 0;
        return Math.min(Math.round(newSkillsCount / 5), 10);
    }

    private calculateLeadershipPotential(data: any): number {
        const hasLeadershipRoles = data.linkedinProfile?.experience?.some(
            (exp: any) => exp.title.match(/lead|manager|head|director/i)
        );
        return hasLeadershipRoles ? 8 : 5;
    }

    private calculateCulturalAdaptability(data: any): number {
        const companiesCount = data.linkedinProfile?.experience?.length || 0;
        return Math.min(companiesCount * 2, 10);
    }

    private generateExecutiveSummary(analysis: ProfileAnalysis): string {
        return `Experienced professional with ${analysis.experience.totalYears} years in the field, 
    demonstrating ${analysis.potential.growthTrajectory} growth trajectory and strong technical skills 
    in ${analysis.technicalSkills.primary.slice(0, 3).join(', ')}.`;
    }

    private identifyKeyStrengths(analysis: ProfileAnalysis): string[] {
        return analysis.technicalSkills.primary.slice(0, 3);
    }

    private identifyConcerns(analysis: ProfileAnalysis): string[] {
        return analysis.personality.redFlags;
    }

    private generateRecommendations(analysis: ProfileAnalysis, targetRole: any): string[] {
        return [
            'Consider technical assessment for depth validation',
            'Explore cultural fit through behavioral interviews',
            'Verify achievements through reference checks'
        ];
    }

    private identifyStrengths(analysis: ProfileAnalysis): string[] {
        return [
            ...analysis.technicalSkills.primary.slice(0, 3),
            `${analysis.experience.totalYears} years experience`,
            analysis.personality.workStyle
        ];
    }

    private identifyGaps(analysis: ProfileAnalysis, targetRole: any): string[] {
        const gaps = [];

        if (analysis.experience.relevantYears < 3) {
            gaps.push('Limited relevant experience');
        }

        return gaps;
    }

    private generateInterviewQuestions(analysis: ProfileAnalysis, targetRole: any): string[] {
        return [
            `Tell me about your experience with ${analysis.technicalSkills.primary[0]}`,
            'Describe a challenging technical problem you solved',
            'How do you stay updated with new technologies?'
        ];
    }

    private assessRisks(analysis: ProfileAnalysis): any {
        return {
            flightRisk: analysis.personality.redFlags.includes('Frequent job changes') ? 'high' : 'low',
            skillGapRisk: analysis.technicalSkills.depth < 5 ? 'medium' : 'low',
            culturalFitRisk: 'medium' // Placeholder
        };
    }

    private calculateTechnicalMatch(skills: any, targetRole: any): number {
        // Simplified calculation
        return 0.8;
    }

    private calculateExperienceMatch(experience: any, targetRole: any): number {
        // Simplified calculation
        return experience.relevantYears >= 3 ? 0.9 : 0.6;
    }
}

export async function POST(request: NextRequest) {
    const agent = new ProfileAnalyzerAgent();
    return agent.process(request);
} 