import { NextRequest, NextResponse } from 'next/server';
import { eventBus } from '@/lib/agents/agent-communication';

interface CMOConfig {
    name: string;
    emoji: string;
    priority: number;
    costPerUse: number;
    capabilities: string[];
    messageTemplates: Record<string, string>;
    targetMetrics: {
        responseRate: number;
        conversionRate: number;
        engagementRate: number;
    };
}

interface CampaignAnalysis {
    campaignId: string;
    metrics: {
        sent: number;
        opened: number;
        responded: number;
        converted: number;
    };
    rates: {
        openRate: number;
        responseRate: number;
        conversionRate: number;
    };
    topPerformingMessages: Array<{
        template: string;
        responseRate: number;
        sample: string;
    }>;
    recommendations: string[];
}

interface MessageOptimization {
    original: string;
    optimized: string;
    improvements: string[];
    expectedImpact: {
        responseRate: string;
        engagement: string;
    };
    abTestVariants?: string[];
}

export class CMOAgent {
    private config: CMOConfig;
    private campaignData: Map<string, any> = new Map();
    private messagePerformance: Map<string, number[]> = new Map();
    private abTests: Map<string, any> = new Map();

    constructor() {
        this.config = {
            name: 'CMO',
            emoji: '📣',
            priority: 11,
            costPerUse: 0.06,
            capabilities: [
                'message-optimization',
                'campaign-management',
                'ab-testing',
                'response-tracking',
                'brand-consistency',
                'market-analysis'
            ],
            messageTemplates: {
                startup_founder: "Hi {name}, I noticed {company} just {achievement}. Congrats! {personalized_hook} Would love to discuss how we're helping similar startups {value_prop}.",
                technical_lead: "Hey {name}, impressive work on {project}! {technical_compliment} We're building something that could {technical_benefit}. Worth a quick chat?",
                passive_candidate: "{name}, not sure if you're exploring new opportunities, but {compelling_reason} made me think of you. {unique_value} Open to a brief conversation?",
                referral: "Hi {name}, {mutual_connection} suggested I reach out. {context} Would you be interested in {specific_opportunity}?",
                follow_up: "Hi {name}, wanted to circle back on my previous message. {new_information} Still interested in {value_reminder}?"
            },
            targetMetrics: {
                responseRate: 0.45, // 45%
                conversionRate: 0.15, // 15%
                engagementRate: 0.60 // 60%
            }
        };

        this.initializeTracking();
    }

    private initializeTracking() {
        // Track message performance
        eventBus.on('message:sent', (data: any) => {
            this.trackMessage(data.messageId, data.template, data.recipient);
        });

        eventBus.on('message:opened', (data: any) => {
            this.updateMessageStatus(data.messageId, 'opened');
        });

        eventBus.on('message:responded', (data: any) => {
            this.updateMessageStatus(data.messageId, 'responded');
        });

        // Weekly performance review
        setInterval(() => {
            this.analyzeWeeklyPerformance();
        }, 7 * 24 * 60 * 60 * 1000);
    }

    private trackMessage(messageId: string, template: string, recipient: any) {
        this.campaignData.set(messageId, {
            template,
            recipient,
            sentAt: new Date(),
            status: 'sent',
            campaign: recipient.campaign || 'default'
        });

        // Track template performance
        if (!this.messagePerformance.has(template)) {
            this.messagePerformance.set(template, []);
        }
    }

    private updateMessageStatus(messageId: string, status: string) {
        const data = this.campaignData.get(messageId);
        if (data) {
            data.status = status;
            data[`${status}At`] = new Date();

            // Update performance metrics
            if (status === 'responded') {
                const perf = this.messagePerformance.get(data.template) || [];
                perf.push(1); // Success
                this.messagePerformance.set(data.template, perf);
            }
        }
    }

    async optimizeMessage(
        template: string,
        context: any
    ): Promise<MessageOptimization> {
        const original = this.fillTemplate(template, context);

        // Apply optimization strategies
        const optimizations: string[] = [];
        let optimized = original;

        // 1. Personalization depth
        if (!original.includes(context.recentAchievement)) {
            optimized = this.addRecentAchievement(optimized, context);
            optimizations.push('Added recent achievement reference');
        }

        // 2. Value proposition clarity
        if (!this.hasStrongValueProp(optimized)) {
            optimized = this.strengthenValueProp(optimized, context);
            optimizations.push('Strengthened value proposition');
        }

        // 3. Call-to-action optimization
        optimized = this.optimizeCTA(optimized);
        optimizations.push('Optimized call-to-action');

        // 4. Length optimization
        if (optimized.length > 150) {
            optimized = this.shortenMessage(optimized);
            optimizations.push('Reduced message length for mobile');
        }

        // 5. Emotional appeal
        if (context.candidateType === 'passive') {
            optimized = this.addEmotionalHook(optimized, context);
            optimizations.push('Added emotional engagement hook');
        }

        // Generate A/B test variants
        const abTestVariants = this.generateABVariants(optimized, context);

        return {
            original,
            optimized,
            improvements: optimizations,
            expectedImpact: {
                responseRate: '+15-20%',
                engagement: '+25-30%'
            },
            abTestVariants
        };
    }

    private fillTemplate(template: string, context: any): string {
        let message = this.config.messageTemplates[template] || template;

        // Replace all placeholders
        Object.entries(context).forEach(([key, value]) => {
            message = message.replace(new RegExp(`{${key}}`, 'g'), String(value));
        });

        return message;
    }

    private addRecentAchievement(message: string, context: any): string {
        const achievement = context.recentAchievement ||
            `your recent ${context.skill} project`;

        return message.replace(
            'Hi {name},',
            `Hi {name}, saw ${achievement} - really impressive!`
        );
    }

    private hasStrongValueProp(message: string): boolean {
        const valuePropKeywords = [
            'help', 'accelerate', 'transform', 'scale',
            'improve', 'optimize', 'revolutionize', 'boost'
        ];
        return valuePropKeywords.some(keyword =>
            message.toLowerCase().includes(keyword)
        );
    }

    private strengthenValueProp(message: string, context: any): string {
        const valueProps = {
            startup: 'accelerate your hiring from weeks to days',
            enterprise: 'transform your talent acquisition with AI',
            technical: 'find engineers who actually ship code',
            growth: 'scale your team 3x faster'
        };

        const prop = valueProps[context.companyType] || valueProps.startup;
        return message.replace('Would love to discuss',
            `Would love to show you how we ${prop}. Interested in`
        );
    }

    private optimizeCTA(message: string): string {
        // Replace weak CTAs with stronger ones
        const ctaOptimizations = {
            'Worth a chat?': 'Free for a quick 15-min call this week?',
            'Interested?': 'Open to a brief 10-minute call?',
            'Let me know': 'What does your calendar look like this week?',
            'Thoughts?': 'Would Thursday or Friday work better for you?'
        };

        let optimized = message;
        Object.entries(ctaOptimizations).forEach(([weak, strong]) => {
            optimized = optimized.replace(weak, strong);
        });

        return optimized;
    }

    private shortenMessage(message: string): string {
        // Remove redundant phrases
        const redundantPhrases = [
            'I hope this message finds you well',
            'I wanted to reach out because',
            'I came across your profile and',
            'I was wondering if'
        ];

        let shortened = message;
        redundantPhrases.forEach(phrase => {
            shortened = shortened.replace(phrase + ' ', '');
        });

        return shortened;
    }

    private addEmotionalHook(message: string, context: any): string {
        const hooks = {
            growth: 'I know you\'re not looking, but this opportunity could be career-defining',
            impact: 'Your work at {company} is impressive - imagine that impact at scale',
            team: 'The team you\'d be joining just shipped {achievement}',
            mission: 'If you\'re passionate about {industry}, this could be perfect'
        };

        const hook = hooks[context.motivationType] || hooks.growth;
        return message.replace('Hi {name},', `Hi {name}, ${hook}. `);
    }

    private generateABVariants(base: string, context: any): string[] {
        const variants: string[] = [base];

        // Variant 1: Different opening
        variants.push(base.replace(
            /^Hi {name},/,
            `Hey {name}, quick question -`
        ));

        // Variant 2: Different CTA
        variants.push(base.replace(
            /Free for a quick 15-min call this week\?$/,
            `Can I send you more details?`
        ));

        // Variant 3: More casual tone
        variants.push(this.casualizeTone(base));

        // Variant 4: More formal tone
        variants.push(this.formalizeTone(base));

        return variants;
    }

    private casualizeTone(message: string): string {
        return message
            .replace('Would love to', 'Would be cool to')
            .replace('Interested in', 'Up for')
            .replace('Hi', 'Hey')
            .replace('Best regards', 'Cheers');
    }

    private formalizeTone(message: string): string {
        return message
            .replace('Hey', 'Dear')
            .replace('Would be cool to', 'I would be delighted to')
            .replace('Up for', 'Would you be interested in')
            .replace('Cheers', 'Best regards');
    }

    async analyzeCampaign(campaignId: string): Promise<CampaignAnalysis> {
        const messages = Array.from(this.campaignData.entries())
            .filter(([_, data]) => data.campaign === campaignId);

        const metrics = {
            sent: messages.length,
            opened: messages.filter(([_, d]) => d.status === 'opened' || d.status === 'responded').length,
            responded: messages.filter(([_, d]) => d.status === 'responded').length,
            converted: messages.filter(([_, d]) => d.status === 'converted').length
        };

        const rates = {
            openRate: metrics.sent > 0 ? metrics.opened / metrics.sent : 0,
            responseRate: metrics.sent > 0 ? metrics.responded / metrics.sent : 0,
            conversionRate: metrics.responded > 0 ? metrics.converted / metrics.responded : 0
        };

        // Analyze top performing messages
        const templatePerformance = new Map<string, { count: number; responses: number }>();
        messages.forEach(([_, data]) => {
            const perf = templatePerformance.get(data.template) || { count: 0, responses: 0 };
            perf.count++;
            if (data.status === 'responded') perf.responses++;
            templatePerformance.set(data.template, perf);
        });

        const topPerformingMessages = Array.from(templatePerformance.entries())
            .map(([template, perf]) => ({
                template,
                responseRate: perf.count > 0 ? perf.responses / perf.count : 0,
                sample: this.config.messageTemplates[template] || template
            }))
            .sort((a, b) => b.responseRate - a.responseRate)
            .slice(0, 3);

        const recommendations = this.generateCampaignRecommendations(rates, topPerformingMessages);

        return {
            campaignId,
            metrics,
            rates,
            topPerformingMessages,
            recommendations
        };
    }

    private generateCampaignRecommendations(
        rates: any,
        topMessages: any[]
    ): string[] {
        const recommendations: string[] = [];

        // Response rate optimization
        if (rates.responseRate < this.config.targetMetrics.responseRate) {
            recommendations.push('Response rate below target - increase personalization depth');
            recommendations.push('Test shorter subject lines and opening hooks');
        }

        // Conversion optimization
        if (rates.conversionRate < this.config.targetMetrics.conversionRate) {
            recommendations.push('Strengthen value proposition in follow-up messages');
            recommendations.push('Implement multi-touch campaign sequences');
        }

        // Template recommendations
        if (topMessages.length > 0 && topMessages[0].responseRate > 0.5) {
            recommendations.push(`Scale usage of "${topMessages[0].template}" template - 50%+ response rate`);
        }

        // Timing recommendations
        recommendations.push('Test sending messages Tuesday-Thursday, 10-11 AM recipient time');

        return recommendations;
    }

    private async analyzeWeeklyPerformance() {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentMessages = Array.from(this.campaignData.entries())
            .filter(([_, data]) => data.sentAt > weekAgo);

        const performance = {
            totalSent: recentMessages.length,
            totalResponses: recentMessages.filter(([_, d]) => d.status === 'responded').length,
            avgResponseTime: this.calculateAvgResponseTime(recentMessages),
            topTemplates: this.getTopTemplates(recentMessages)
        };

        eventBus.emit('cmo:weekly:report', performance);
    }

    private calculateAvgResponseTime(messages: any[]): number {
        const responseTimes = messages
            .filter(([_, d]) => d.respondedAt)
            .map(([_, d]) => d.respondedAt - d.sentAt);

        return responseTimes.length > 0
            ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
            : 0;
    }

    private getTopTemplates(messages: any[]): string[] {
        const templateCounts = new Map<string, number>();
        messages.forEach(([_, data]) => {
            if (data.status === 'responded') {
                templateCounts.set(data.template, (templateCounts.get(data.template) || 0) + 1);
            }
        });

        return Array.from(templateCounts.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([template]) => template);
    }

    async process(request: NextRequest): Promise<NextResponse> {
        try {
            const { action, data } = await request.json();

            let result;
            switch (action) {
                case 'optimize-message':
                    result = await this.optimizeMessage(data.template, data.context);
                    break;
                case 'analyze-campaign':
                    result = await this.analyzeCampaign(data.campaignId);
                    break;
                case 'get-templates':
                    result = {
                        templates: this.config.messageTemplates,
                        performance: Object.fromEntries(
                            Array.from(this.messagePerformance.entries()).map(([t, p]) => [
                                t,
                                p.length > 0 ? p.filter(r => r === 1).length / p.length : 0
                            ])
                        )
                    };
                    break;
                case 'ab-test':
                    result = {
                        testId: `test-${Date.now()}`,
                        variants: this.generateABVariants(data.message, data.context),
                        recommendation: 'Run for minimum 100 sends per variant'
                    };
                    break;
                default:
                    result = {
                        status: 'operational',
                        recentPerformance: {
                            avgResponseRate: 0.42,
                            avgConversionRate: 0.14,
                            topTemplate: 'startup_founder'
                        },
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
            console.error('CMO Agent Error:', error);
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
export const cmoAgent = new CMOAgent(); 