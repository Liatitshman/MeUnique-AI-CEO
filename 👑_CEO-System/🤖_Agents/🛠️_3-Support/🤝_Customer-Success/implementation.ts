import { NextRequest, NextResponse } from 'next/server';
import { eventBus } from '@/lib/agents/agent-communication';

interface CustomerSuccessConfig {
    name: string;
    emoji: string;
    priority: number;
    costPerUse: number;
    capabilities: string[];
    satisfactionTargets: {
        nps: number;
        csat: number;
        responseTime: number;
        resolutionRate: number;
    };
}

interface CustomerInteraction {
    customerId: string;
    type: 'support' | 'feedback' | 'complaint' | 'feature-request' | 'success-story';
    status: 'open' | 'in-progress' | 'resolved' | 'escalated';
    priority: 'low' | 'medium' | 'high' | 'critical';
    sentiment: 'positive' | 'neutral' | 'negative';
    timestamp: Date;
    resolution?: string;
    satisfactionScore?: number;
}

interface CustomerHealth {
    customerId: string;
    healthScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    engagementLevel: number;
    lastContact: Date;
    lifetime: number;
    recommendations: string[];
}

interface SuccessMetrics {
    nps: number;
    csat: number;
    churnRate: number;
    expansionRate: number;
    averageResponseTime: number;
    resolutionRate: number;
    activeCustomers: number;
}

export class CustomerSuccessAgent {
    private config: CustomerSuccessConfig;
    private customerInteractions: Map<string, CustomerInteraction[]> = new Map();
    private customerHealth: Map<string, CustomerHealth> = new Map();
    private successStories: any[] = [];

    constructor() {
        this.config = {
            name: 'Customer Success',
            emoji: '🤝',
            priority: 14,
            costPerUse: 0.05,
            capabilities: [
                'customer-support',
                'satisfaction-tracking',
                'health-monitoring',
                'churn-prevention',
                'upsell-identification',
                'success-stories'
            ],
            satisfactionTargets: {
                nps: 50, // Net Promoter Score
                csat: 4.5, // Customer Satisfaction (out of 5)
                responseTime: 2, // hours
                resolutionRate: 0.95 // 95%
            }
        };

        this.initializeCustomerSuccess();
    }

    private initializeCustomerSuccess() {
        // Monitor customer interactions
        eventBus.on('customer:interaction', (data: any) => {
            this.trackInteraction(data);
        });

        // Monitor hiring success
        eventBus.on('hire:completed', (data: any) => {
            this.trackHireSuccess(data);
        });

        // Monitor system usage
        eventBus.on('system:usage', (data: any) => {
            this.updateCustomerEngagement(data);
        });

        // Regular health checks
        setInterval(() => {
            this.performHealthChecks();
        }, 24 * 60 * 60 * 1000); // Daily
    }

    private trackInteraction(data: any) {
        const { customerId, type, content, priority } = data;

        if (!this.customerInteractions.has(customerId)) {
            this.customerInteractions.set(customerId, []);
        }

        const interaction: CustomerInteraction = {
            customerId,
            type: type || 'support',
            status: 'open',
            priority: priority || 'medium',
            sentiment: this.analyzeSentiment(content),
            timestamp: new Date()
        };

        this.customerInteractions.get(customerId)!.push(interaction);

        // Auto-respond based on type and priority
        this.handleInteraction(interaction);
    }

    private analyzeSentiment(content: string): 'positive' | 'neutral' | 'negative' {
        const positiveWords = ['great', 'excellent', 'love', 'amazing', 'fantastic', 'thank'];
        const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'disappointed', 'frustrated'];

        const lowerContent = content.toLowerCase();
        const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
        const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }

    private async handleInteraction(interaction: CustomerInteraction) {
        // Priority-based handling
        if (interaction.priority === 'critical' || interaction.sentiment === 'negative') {
            eventBus.emit('customer:escalation', {
                interaction,
                reason: 'High priority or negative sentiment'
            });
        }

        // Auto-acknowledge
        eventBus.emit('customer:response', {
            customerId: interaction.customerId,
            message: this.generateAutoResponse(interaction),
            responseTime: Date.now() - interaction.timestamp.getTime()
        });

        // Update customer health
        this.updateCustomerHealth(interaction.customerId);
    }

    private generateAutoResponse(interaction: CustomerInteraction): string {
        const responses = {
            support: "Thank you for reaching out! We're looking into your request and will get back to you within 2 hours.",
            feedback: "We appreciate your feedback! Your input helps us improve our service.",
            complaint: "We're sorry to hear about your experience. Our team is prioritizing your issue and will resolve it as soon as possible.",
            'feature-request': "Great suggestion! We've logged your feature request and will consider it for our roadmap.",
            'success-story': "That's wonderful to hear! We're thrilled about your success and would love to share your story."
        };

        return responses[interaction.type] || responses.support;
    }

    private trackHireSuccess(data: any) {
        const { customerId, candidateName, timeToHire, satisfaction } = data;

        this.successStories.push({
            customerId,
            candidateName,
            timeToHire,
            satisfaction,
            timestamp: new Date(),
            story: `Successfully hired ${candidateName} in ${timeToHire} days!`
        });

        // Update customer health positively
        const health = this.customerHealth.get(customerId);
        if (health) {
            health.healthScore = Math.min(100, health.healthScore + 10);
            health.engagementLevel = Math.min(100, health.engagementLevel + 5);
        }
    }

    private updateCustomerEngagement(data: any) {
        const { customerId, action, duration } = data;

        const health = this.customerHealth.get(customerId) || this.createCustomerHealth(customerId);
        health.lastContact = new Date();
        health.engagementLevel = this.calculateEngagementLevel(customerId);

        this.customerHealth.set(customerId, health);
    }

    private createCustomerHealth(customerId: string): CustomerHealth {
        return {
            customerId,
            healthScore: 70,
            riskLevel: 'low',
            engagementLevel: 50,
            lastContact: new Date(),
            lifetime: 0,
            recommendations: []
        };
    }

    private calculateEngagementLevel(customerId: string): number {
        const interactions = this.customerInteractions.get(customerId) || [];
        const recentInteractions = interactions.filter(
            i => i.timestamp > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );

        // Base engagement on frequency and recency
        const frequency = recentInteractions.length;
        const recency = recentInteractions.length > 0
            ? (Date.now() - recentInteractions[recentInteractions.length - 1].timestamp.getTime()) / (1000 * 60 * 60 * 24)
            : 30;

        let engagement = 50;
        engagement += Math.min(30, frequency * 5); // Up to 30 points for frequency
        engagement -= Math.min(20, recency); // Lose up to 20 points for inactivity

        return Math.max(0, Math.min(100, engagement));
    }

    private async performHealthChecks() {
        for (const [customerId, health] of this.customerHealth.entries()) {
            const updated = await this.assessCustomerHealth(customerId);
            this.customerHealth.set(customerId, updated);

            // Alert on at-risk customers
            if (updated.riskLevel === 'high') {
                eventBus.emit('customer:at-risk', {
                    customerId,
                    health: updated,
                    recommendations: updated.recommendations
                });
            }
        }
    }

    private async assessCustomerHealth(customerId: string): Promise<CustomerHealth> {
        const health = this.customerHealth.get(customerId) || this.createCustomerHealth(customerId);
        const interactions = this.customerInteractions.get(customerId) || [];

        // Calculate health score based on multiple factors
        let score = 70; // Base score

        // Engagement factor
        const engagementLevel = this.calculateEngagementLevel(customerId);
        score += (engagementLevel - 50) * 0.3;

        // Satisfaction factor
        const satisfaction = this.calculateCustomerSatisfaction(interactions);
        score += (satisfaction - 3) * 10;

        // Support ticket factor
        const unresolvedIssues = interactions.filter(i => i.status !== 'resolved').length;
        score -= unresolvedIssues * 5;

        // Sentiment factor
        const negativeSentiment = interactions.filter(i => i.sentiment === 'negative').length;
        score -= negativeSentiment * 3;

        // Success stories factor
        const successCount = this.successStories.filter(s => s.customerId === customerId).length;
        score += successCount * 5;

        // Normalize score
        health.healthScore = Math.max(0, Math.min(100, score));

        // Determine risk level
        if (health.healthScore < 40) {
            health.riskLevel = 'high';
        } else if (health.healthScore < 60) {
            health.riskLevel = 'medium';
        } else {
            health.riskLevel = 'low';
        }

        // Generate recommendations
        health.recommendations = this.generateHealthRecommendations(health, interactions);

        return health;
    }

    private calculateCustomerSatisfaction(interactions: CustomerInteraction[]): number {
        const scoredInteractions = interactions.filter(i => i.satisfactionScore !== undefined);
        if (scoredInteractions.length === 0) return 3; // Neutral default

        const totalScore = scoredInteractions.reduce((sum, i) => sum + (i.satisfactionScore || 0), 0);
        return totalScore / scoredInteractions.length;
    }

    private generateHealthRecommendations(health: CustomerHealth, interactions: CustomerInteraction[]): string[] {
        const recommendations: string[] = [];

        if (health.healthScore < 60) {
            recommendations.push('Schedule a check-in call with the customer');
        }

        if (health.engagementLevel < 30) {
            recommendations.push('Send engagement campaign or success tips');
        }

        const unresolvedCount = interactions.filter(i => i.status !== 'resolved').length;
        if (unresolvedCount > 2) {
            recommendations.push(`Prioritize resolving ${unresolvedCount} open issues`);
        }

        const daysSinceContact = (Date.now() - health.lastContact.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceContact > 30) {
            recommendations.push('Proactive outreach - customer has been inactive');
        }

        if (health.riskLevel === 'high') {
            recommendations.push('Consider offering incentives or additional support');
            recommendations.push('Escalate to account management team');
        }

        return recommendations;
    }

    async getSuccessMetrics(): Promise<SuccessMetrics> {
        const allCustomers = Array.from(this.customerHealth.keys());
        const activeCustomers = allCustomers.filter(id => {
            const health = this.customerHealth.get(id);
            return health && health.engagementLevel > 20;
        });

        // Calculate NPS
        const npsScores = this.calculateNPS();

        // Calculate CSAT
        const csatScore = this.calculateCSAT();

        // Calculate churn rate
        const churnRate = this.calculateChurnRate();

        // Calculate expansion rate
        const expansionRate = this.calculateExpansionRate();

        // Calculate response metrics
        const responseMetrics = this.calculateResponseMetrics();

        return {
            nps: npsScores,
            csat: csatScore,
            churnRate,
            expansionRate,
            averageResponseTime: responseMetrics.avgResponseTime,
            resolutionRate: responseMetrics.resolutionRate,
            activeCustomers: activeCustomers.length
        };
    }

    private calculateNPS(): number {
        // Simplified NPS calculation
        const scores = Array.from(this.customerHealth.values()).map(h => {
            if (h.healthScore > 80) return 9; // Promoter
            if (h.healthScore > 60) return 7; // Passive
            return 5; // Detractor
        });

        const promoters = scores.filter(s => s >= 9).length;
        const detractors = scores.filter(s => s <= 6).length;
        const total = scores.length;

        return total > 0 ? ((promoters - detractors) / total) * 100 : 0;
    }

    private calculateCSAT(): number {
        let totalScore = 0;
        let count = 0;

        for (const interactions of this.customerInteractions.values()) {
            for (const interaction of interactions) {
                if (interaction.satisfactionScore) {
                    totalScore += interaction.satisfactionScore;
                    count++;
                }
            }
        }

        return count > 0 ? totalScore / count : 4.0;
    }

    private calculateChurnRate(): number {
        const total = this.customerHealth.size;
        const atRisk = Array.from(this.customerHealth.values()).filter(
            h => h.riskLevel === 'high'
        ).length;

        return total > 0 ? (atRisk / total) * 100 : 0;
    }

    private calculateExpansionRate(): number {
        // Simplified - based on high engagement and success stories
        const expanding = Array.from(this.customerHealth.values()).filter(
            h => h.healthScore > 80 && h.engagementLevel > 70
        ).length;

        const total = this.customerHealth.size;
        return total > 0 ? (expanding / total) * 100 : 0;
    }

    private calculateResponseMetrics(): { avgResponseTime: number; resolutionRate: number } {
        let totalResponseTime = 0;
        let responseCount = 0;
        let resolved = 0;
        let total = 0;

        for (const interactions of this.customerInteractions.values()) {
            for (const interaction of interactions) {
                total++;
                if (interaction.status === 'resolved') {
                    resolved++;
                }
                // Simulate response time (would be tracked in real system)
                totalResponseTime += Math.random() * 4; // 0-4 hours
                responseCount++;
            }
        }

        return {
            avgResponseTime: responseCount > 0 ? totalResponseTime / responseCount : 2,
            resolutionRate: total > 0 ? resolved / total : 0.95
        };
    }

    async handleCustomerRequest(customerId: string, request: any): Promise<any> {
        const interaction: CustomerInteraction = {
            customerId,
            type: request.type || 'support',
            status: 'in-progress',
            priority: request.priority || 'medium',
            sentiment: this.analyzeSentiment(request.content || ''),
            timestamp: new Date()
        };

        this.trackInteraction({
            customerId,
            type: interaction.type,
            content: request.content,
            priority: interaction.priority
        });

        // Generate response based on request type
        const response = {
            message: this.generateAutoResponse(interaction),
            estimatedResolutionTime: this.estimateResolutionTime(interaction),
            assignedTo: 'Customer Success Team',
            ticketId: `CS-${Date.now()}`
        };

        return response;
    }

    private estimateResolutionTime(interaction: CustomerInteraction): string {
        const estimates = {
            low: '24-48 hours',
            medium: '4-8 hours',
            high: '2-4 hours',
            critical: '1 hour'
        };

        return estimates[interaction.priority] || estimates.medium;
    }

    async process(request: NextRequest): Promise<NextResponse> {
        try {
            const { action, data } = await request.json();

            let result;
            switch (action) {
                case 'handle-request':
                    result = await this.handleCustomerRequest(data.customerId, data.request);
                    break;
                case 'get-health':
                    result = this.customerHealth.get(data.customerId) ||
                        this.createCustomerHealth(data.customerId);
                    break;
                case 'get-metrics':
                    result = await this.getSuccessMetrics();
                    break;
                case 'get-success-stories':
                    result = this.successStories.filter(s =>
                        !data.customerId || s.customerId === data.customerId
                    );
                    break;
                case 'update-satisfaction':
                    const interactions = this.customerInteractions.get(data.customerId) || [];
                    if (interactions.length > 0) {
                        interactions[interactions.length - 1].satisfactionScore = data.score;
                        interactions[interactions.length - 1].status = 'resolved';
                    }
                    result = { updated: true };
                    break;
                default:
                    result = {
                        status: 'operational',
                        totalCustomers: this.customerHealth.size,
                        atRiskCustomers: Array.from(this.customerHealth.values())
                            .filter(h => h.riskLevel === 'high').length,
                        successStories: this.successStories.length
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
            console.error('Customer Success Error:', error);
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
export const customerSuccessAgent = new CustomerSuccessAgent(); 