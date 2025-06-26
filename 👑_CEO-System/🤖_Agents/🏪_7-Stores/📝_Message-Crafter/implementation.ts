import { NextRequest, NextResponse } from 'next/server';
import { AgentBase } from '@/lib/agents/agent-base';

interface MessageTemplate {
    hook: string;
    body: string;
    cta: string;
    personalization: string[];
}

interface CraftedMessage {
    subject: string;
    message: string;
    personalizationScore: number;
    expectedResponseRate: number;
    alternativeVersions: MessageVersion[];
}

interface MessageVersion {
    type: 'shorter' | 'formal' | 'casual' | 'technical';
    message: string;
}

export class MessageCrafterAgent extends AgentBase {
    private messageTemplates: Map<string, MessageTemplate>;

    constructor() {
        super({
            name: 'Message Crafter',
            emoji: '📝',
            priority: 6,
            costPerUse: 0.05
        });

        this.initializeTemplates();
    }

    private initializeTemplates() {
        this.messageTemplates = new Map([
            ['tech_leader', {
                hook: 'I noticed your impressive work on {project} at {company}',
                body: 'Your experience with {skills} aligns perfectly with what we\'re building. We\'re tackling {challenge} and need someone who can {impact}.',
                cta: 'Would you be open to a brief chat about how you could lead our {team} team?',
                personalization: ['project', 'company', 'skills', 'challenge', 'impact', 'team']
            }],
            ['startup_builder', {
                hook: 'Your journey from {previous} to {current} caught my attention',
                body: 'We\'re at an exciting inflection point - {milestone}. Your background in {expertise} could be game-changing for our {goal}.',
                cta: 'Interested in building something impactful together?',
                personalization: ['previous', 'current', 'milestone', 'expertise', 'goal']
            }]
        ]);
    }

    async process(request: NextRequest) {
        const {
            candidateProfile,
            jobDescription,
            companyContext,
            messageStyle = 'balanced'
        } = await request.json();

        // Craft personalized message
        const craftedMessage = await this.craftMessage({
            candidateProfile,
            jobDescription,
            companyContext,
            messageStyle
        });

        // Generate alternative versions
        const alternatives = this.generateAlternatives(craftedMessage, messageStyle);

        // Calculate effectiveness metrics
        const metrics = this.calculateMetrics(craftedMessage, candidateProfile);

        return NextResponse.json({
            success: true,
            message: craftedMessage,
            alternatives,
            metrics,
            tips: this.generateOptimizationTips(metrics),
            bestTimeToSend: this.calculateBestSendTime(candidateProfile)
        });
    }

    private async craftMessage(params: any): Promise<CraftedMessage> {
        const { candidateProfile, jobDescription, companyContext, messageStyle } = params;

        // Select appropriate template
        const template = this.selectTemplate(candidateProfile, jobDescription);

        // Extract personalization points
        const personalizationData = this.extractPersonalizationData(
            candidateProfile,
            jobDescription,
            companyContext
        );

        // Build message components
        const subject = this.craftSubjectLine(candidateProfile, companyContext);
        const hook = this.personalizeTemplate(template.hook, personalizationData);
        const body = this.personalizeTemplate(template.body, personalizationData);
        const cta = this.personalizeTemplate(template.cta, personalizationData);

        // Combine and optimize
        const message = this.combineAndOptimize(hook, body, cta, messageStyle);

        return {
            subject,
            message,
            personalizationScore: this.calculatePersonalizationScore(message, candidateProfile),
            expectedResponseRate: this.predictResponseRate(message, candidateProfile),
            alternativeVersions: []
        };
    }

    private selectTemplate(profile: any, job: any): MessageTemplate {
        // Logic to select best template based on profile and job
        if (profile.seniorityLevel === 'senior' || profile.seniorityLevel === 'lead') {
            return this.messageTemplates.get('tech_leader')!;
        }
        return this.messageTemplates.get('startup_builder')!;
    }

    private extractPersonalizationData(profile: any, job: any, company: any): any {
        return {
            // From profile
            name: profile.name,
            currentCompany: profile.currentCompany,
            currentRole: profile.currentRole,
            topSkills: profile.skills?.slice(0, 3).join(', '),
            recentProject: profile.recentProjects?.[0]?.name || 'recent work',

            // From job
            role: job.title,
            team: job.team || 'engineering',
            keyChallenge: job.challenges?.[0] || 'scaling our platform',
            requiredSkills: job.requiredSkills?.slice(0, 2).join(' and '),

            // From company
            companyName: company.name,
            companyStage: company.stage,
            companyMission: company.mission,
            recentMilestone: company.recentNews || 'Series B funding',

            // Calculated
            commonConnections: this.findCommonConnections(profile, company),
            sharedInterests: this.findSharedInterests(profile, company),
            impactOpportunity: this.defineImpactOpportunity(job, company)
        };
    }

    private craftSubjectLine(profile: any, company: any): string {
        const templates = [
            `${profile.name}, your ${profile.topSkills?.[0]} expertise + ${company.name}`,
            `Quick question about your work at ${profile.currentCompany}`,
            `${company.name} <> ${profile.name} - ${profile.currentRole} opportunity`,
            `Impressed by your ${profile.recentAchievement || 'recent work'}`,
            `${profile.name} - building the future of ${company.industry}`
        ];

        // Select based on profile characteristics
        if (profile.recentAchievement) {
            return templates[3];
        } else if (profile.openToOpportunities) {
            return templates[2];
        }

        return templates[0];
    }

    private personalizeTemplate(template: string, data: any): string {
        let personalized = template;

        // Replace placeholders with actual data
        Object.keys(data).forEach(key => {
            const placeholder = `{${key}}`;
            if (personalized.includes(placeholder)) {
                personalized = personalized.replace(
                    new RegExp(placeholder, 'g'),
                    data[key]
                );
            }
        });

        return personalized;
    }

    private combineAndOptimize(hook: string, body: string, cta: string, style: string): string {
        let message = `${hook}\n\n${body}\n\n${cta}`;

        // Apply style adjustments
        switch (style) {
            case 'casual':
                message = this.makeCasual(message);
                break;
            case 'formal':
                message = this.makeFormal(message);
                break;
            case 'technical':
                message = this.makeTechnical(message);
                break;
            case 'brief':
                message = this.makeBrief(message);
                break;
        }

        // Ensure optimal length (150-250 words)
        message = this.optimizeLength(message);

        return message;
    }

    private generateAlternatives(original: CraftedMessage, baseStyle: string): MessageVersion[] {
        const alternatives: MessageVersion[] = [];

        // Shorter version
        alternatives.push({
            type: 'shorter',
            message: this.createShorterVersion(original.message)
        });

        // More formal version
        if (baseStyle !== 'formal') {
            alternatives.push({
                type: 'formal',
                message: this.makeFormal(original.message)
            });
        }

        // More casual version
        if (baseStyle !== 'casual') {
            alternatives.push({
                type: 'casual',
                message: this.makeCasual(original.message)
            });
        }

        // More technical version
        alternatives.push({
            type: 'technical',
            message: this.makeTechnical(original.message)
        });

        return alternatives;
    }

    private calculateMetrics(message: CraftedMessage, profile: any): any {
        const wordCount = message.message.split(' ').length;
        const hasPersonalDetails = this.checkPersonalization(message.message, profile);
        const readabilityScore = this.calculateReadability(message.message);

        return {
            wordCount,
            readabilityScore,
            personalizationPoints: hasPersonalDetails,
            estimatedReadTime: Math.ceil(wordCount / 200), // minutes
            mobileOptimized: wordCount < 150,
            expectedResponseRate: message.expectedResponseRate
        };
    }

    private calculatePersonalizationScore(message: string, profile: any): number {
        let score = 0;
        const maxScore = 100;

        // Check for name usage (20 points)
        if (message.includes(profile.name)) score += 20;

        // Check for company mention (15 points)
        if (message.includes(profile.currentCompany)) score += 15;

        // Check for skill mentions (15 points)
        const skillMentions = profile.skills?.filter((skill: string) =>
            message.toLowerCase().includes(skill.toLowerCase())
        ).length || 0;
        score += Math.min(skillMentions * 5, 15);

        // Check for specific achievements (20 points)
        if (profile.achievements?.some((achievement: string) =>
            message.includes(achievement)
        )) {
            score += 20;
        }

        // Check for role relevance (15 points)
        if (message.includes(profile.currentRole)) score += 15;

        // Check for personal interests (15 points)
        if (profile.interests?.some((interest: string) =>
            message.toLowerCase().includes(interest.toLowerCase())
        )) {
            score += 15;
        }

        return Math.min(score, maxScore);
    }

    private predictResponseRate(message: string, profile: any): number {
        let baseRate = 25; // Industry average

        // Factors that increase response rate
        if (message.length < 150) baseRate += 10; // Brevity
        if (this.calculatePersonalizationScore(message, profile) > 70) baseRate += 15;
        if (profile.openToOpportunities) baseRate += 20;
        if (message.includes('mutual connection')) baseRate += 10;

        // Factors that decrease response rate
        if (message.length > 300) baseRate -= 10; // Too long
        if (!message.includes(profile.name)) baseRate -= 15; // Not personalized
        if (profile.seniorityLevel === 'executive') baseRate -= 10; // Harder to reach

        return Math.max(5, Math.min(75, baseRate));
    }

    // Helper methods
    private findCommonConnections(profile: any, company: any): string {
        // In production, would check actual connections
        return 'John from your MIT network';
    }

    private findSharedInterests(profile: any, company: any): string {
        // Match interests with company culture
        return 'open source contributions';
    }

    private defineImpactOpportunity(job: any, company: any): string {
        return `shape the technical direction of our ${job.team || 'engineering'} team`;
    }

    private makeCasual(message: string): string {
        return message
            .replace(/I noticed/g, 'Hey, I saw')
            .replace(/Would you be open to/g, 'Interested in')
            .replace(/brief chat/g, 'quick chat');
    }

    private makeFormal(message: string): string {
        return message
            .replace(/Hey,/g, 'Hello,')
            .replace(/Interested in/g, 'Would you be interested in')
            .replace(/quick chat/g, 'brief conversation');
    }

    private makeTechnical(message: string): string {
        // Add more technical details
        return message + '\n\nTech stack: Kubernetes, Go, gRPC, PostgreSQL';
    }

    private makeBrief(message: string): string {
        // Keep only essential parts
        const sentences = message.split('. ');
        return sentences.slice(0, Math.ceil(sentences.length / 2)).join('. ') + '.';
    }

    private createShorterVersion(message: string): string {
        const sentences = message.split('. ');
        if (sentences.length <= 3) return message;

        // Keep hook and CTA, compress body
        return `${sentences[0]}. ${sentences[sentences.length - 1]}`;
    }

    private optimizeLength(message: string): string {
        const words = message.split(' ');
        if (words.length > 250) {
            // Trim to ~250 words
            return words.slice(0, 250).join(' ') + '...';
        }
        return message;
    }

    private checkPersonalization(message: string, profile: any): number {
        let points = 0;

        if (message.includes(profile.name)) points++;
        if (message.includes(profile.currentCompany)) points++;
        if (profile.skills?.some((skill: string) => message.includes(skill))) points++;

        return points;
    }

    private calculateReadability(message: string): number {
        // Simple readability score based on sentence and word length
        const sentences = message.split(/[.!?]+/).filter(s => s.trim());
        const words = message.split(/\s+/);
        const avgWordsPerSentence = words.length / sentences.length;

        // Lower is better (8-12 is ideal)
        if (avgWordsPerSentence < 8) return 90;
        if (avgWordsPerSentence < 12) return 100;
        if (avgWordsPerSentence < 16) return 80;
        return 60;
    }

    private generateOptimizationTips(metrics: any): string[] {
        const tips = [];

        if (metrics.wordCount > 200) {
            tips.push('Consider shortening the message for better engagement');
        }

        if (metrics.personalizationPoints < 3) {
            tips.push('Add more personal details about the candidate');
        }

        if (metrics.readabilityScore < 80) {
            tips.push('Simplify sentence structure for better readability');
        }

        if (!metrics.mobileOptimized) {
            tips.push('Optimize for mobile reading (under 150 words)');
        }

        return tips;
    }

    private calculateBestSendTime(profile: any): any {
        // Based on profile timezone and activity patterns
        return {
            day: 'Tuesday',
            time: '10:00 AM',
            timezone: profile.timezone || 'PST',
            reasoning: 'Highest open rates for tech professionals'
        };
    }
}

export async function POST(request: NextRequest) {
    const agent = new MessageCrafterAgent();
    return agent.process(request);
} 