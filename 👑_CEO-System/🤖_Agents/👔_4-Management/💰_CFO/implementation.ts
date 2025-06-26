import { NextRequest, NextResponse } from 'next/server';
import { eventBus } from '@/lib/agents/agent-communication';

interface CFOConfig {
    name: string;
    emoji: string;
    priority: number;
    costPerUse: number;
    dailyBudgetLimit: number;
    monthlyBudgetLimit: number;
    alertThreshold: number;
    capabilities: string[];
}

interface CostAnalysis {
    totalCost: number;
    breakdown: {
        agent: string;
        operations: number;
        cost: number;
        percentage: number;
    }[];
    projections: {
        daily: number;
        weekly: number;
        monthly: number;
    };
    recommendations: string[];
    alerts: string[];
}

export class CFOAgent {
    private config: CFOConfig;
    private dailySpend: number = 0;
    private monthlySpend: number = 0;
    private operationCosts: Map<string, number> = new Map();
    private lastResetDate: Date = new Date();

    constructor() {
        this.config = {
            name: 'CFO',
            emoji: '💰',
            priority: 9,
            costPerUse: 0.05,
            dailyBudgetLimit: parseFloat(process.env.DAILY_BUDGET_LIMIT || '100'),
            monthlyBudgetLimit: parseFloat(process.env.MONTHLY_BUDGET_LIMIT || '2500'),
            alertThreshold: 0.8, // Alert at 80% of budget
            capabilities: [
                'cost-tracking',
                'budget-management',
                'roi-optimization',
                'spend-analysis',
                'cost-forecasting',
                'approval-workflows'
            ]
        };

        this.initializeCostTracking();
    }

    private initializeCostTracking() {
        // Listen for cost events from all agents
        eventBus.on('agent:cost:incurred', (data: any) => {
            this.trackCost(data.agent, data.cost);
        });

        // Daily reset
        setInterval(() => {
            const now = new Date();
            if (now.getDate() !== this.lastResetDate.getDate()) {
                this.dailySpend = 0;
                this.lastResetDate = now;
            }
            // Monthly reset
            if (now.getMonth() !== this.lastResetDate.getMonth()) {
                this.monthlySpend = 0;
                this.operationCosts.clear();
            }
        }, 60000); // Check every minute
    }

    private trackCost(agent: string, cost: number) {
        this.dailySpend += cost;
        this.monthlySpend += cost;

        const currentCost = this.operationCosts.get(agent) || 0;
        this.operationCosts.set(agent, currentCost + cost);

        // Check budget limits
        if (this.dailySpend >= this.config.dailyBudgetLimit * this.config.alertThreshold) {
            eventBus.emit('cfo:budget:alert', {
                type: 'daily',
                spent: this.dailySpend,
                limit: this.config.dailyBudgetLimit,
                percentage: (this.dailySpend / this.config.dailyBudgetLimit) * 100
            });
        }

        if (this.monthlySpend >= this.config.monthlyBudgetLimit * this.config.alertThreshold) {
            eventBus.emit('cfo:budget:alert', {
                type: 'monthly',
                spent: this.monthlySpend,
                limit: this.config.monthlyBudgetLimit,
                percentage: (this.monthlySpend / this.config.monthlyBudgetLimit) * 100
            });
        }
    }

    async analyzeCosts(): Promise<CostAnalysis> {
        const breakdown = Array.from(this.operationCosts.entries())
            .map(([agent, cost]) => ({
                agent,
                operations: Math.round(cost / this.getAgentAverageCost(agent)),
                cost,
                percentage: (cost / this.monthlySpend) * 100
            }))
            .sort((a, b) => b.cost - a.cost);

        const dailyAverage = this.monthlySpend / 30;
        const projections = {
            daily: this.dailySpend,
            weekly: dailyAverage * 7,
            monthly: dailyAverage * 30
        };

        const recommendations = this.generateRecommendations(breakdown, projections);
        const alerts = this.generateAlerts();

        return {
            totalCost: this.monthlySpend,
            breakdown,
            projections,
            recommendations,
            alerts
        };
    }

    private getAgentAverageCost(agent: string): number {
        const agentCosts: Record<string, number> = {
            'Smart Database': 0.03,
            'Auto Recruiter': 0.15,
            'Culture Matcher': 0.08,
            'Ideal Profiler': 0.10,
            'Dictionary Bot': 0.02,
            'Profile Analyzer': 0.12,
            'Message Crafter': 0.05,
            'Talent Sourcer': 0.20,
            'CEO': 0.15,
            'CFO': 0.05,
            'CTO': 0.08,
            'CMO': 0.06
        };
        return agentCosts[agent] || 0.10;
    }

    private generateRecommendations(breakdown: any[], projections: any): string[] {
        const recommendations: string[] = [];

        // High-cost agent optimization
        const highCostAgents = breakdown.filter(b => b.percentage > 25);
        if (highCostAgents.length > 0) {
            recommendations.push(
                `Consider optimizing ${highCostAgents[0].agent} - it accounts for ${highCostAgents[0].percentage.toFixed(1)}% of costs`
            );
        }

        // Budget optimization
        if (projections.monthly > this.config.monthlyBudgetLimit * 0.9) {
            recommendations.push('Implement stricter approval workflows for high-cost operations');
            recommendations.push('Consider batching operations to reduce API calls');
        }

        // Efficiency suggestions
        if (this.dailySpend < this.config.dailyBudgetLimit * 0.5) {
            recommendations.push('Budget allows for more aggressive candidate sourcing');
        }

        // ROI optimization
        const costPerHire = this.monthlySpend / 10; // Assuming 10 hires per month
        if (costPerHire > 350) {
            recommendations.push(`Cost per hire ($${costPerHire.toFixed(0)}) is above target - focus on conversion optimization`);
        }

        return recommendations;
    }

    private generateAlerts(): string[] {
        const alerts: string[] = [];

        if (this.dailySpend > this.config.dailyBudgetLimit) {
            alerts.push(`⚠️ Daily budget exceeded: $${this.dailySpend.toFixed(2)} / $${this.config.dailyBudgetLimit}`);
        }

        if (this.monthlySpend > this.config.monthlyBudgetLimit * 0.8) {
            alerts.push(`⚠️ Approaching monthly budget limit: ${((this.monthlySpend / this.config.monthlyBudgetLimit) * 100).toFixed(1)}% used`);
        }

        // Anomaly detection
        const dailyAverage = this.monthlySpend / 30;
        if (this.dailySpend > dailyAverage * 2) {
            alerts.push(`📊 Unusual spike in spending: ${((this.dailySpend / dailyAverage - 1) * 100).toFixed(0)}% above average`);
        }

        return alerts;
    }

    async approveExpense(agent: string, estimatedCost: number): Promise<boolean> {
        // Check if expense would exceed limits
        if (this.dailySpend + estimatedCost > this.config.dailyBudgetLimit) {
            eventBus.emit('cfo:expense:rejected', {
                agent,
                cost: estimatedCost,
                reason: 'Would exceed daily budget limit'
            });
            return false;
        }

        if (this.monthlySpend + estimatedCost > this.config.monthlyBudgetLimit) {
            eventBus.emit('cfo:expense:rejected', {
                agent,
                cost: estimatedCost,
                reason: 'Would exceed monthly budget limit'
            });
            return false;
        }

        // Approve and track
        this.trackCost(agent, estimatedCost);
        eventBus.emit('cfo:expense:approved', {
            agent,
            cost: estimatedCost,
            remainingDaily: this.config.dailyBudgetLimit - this.dailySpend,
            remainingMonthly: this.config.monthlyBudgetLimit - this.monthlySpend
        });

        return true;
    }

    async generateFinancialReport(): Promise<any> {
        const analysis = await this.analyzeCosts();

        return {
            executive_summary: {
                total_spend: `$${this.monthlySpend.toFixed(2)}`,
                daily_average: `$${(this.monthlySpend / 30).toFixed(2)}`,
                budget_utilization: `${((this.monthlySpend / this.config.monthlyBudgetLimit) * 100).toFixed(1)}%`,
                cost_per_hire: `$${(this.monthlySpend / 10).toFixed(0)}`, // Estimated
                roi: '3.5x' // Placeholder - would calculate based on hire values
            },
            cost_breakdown: analysis.breakdown,
            projections: analysis.projections,
            recommendations: analysis.recommendations,
            alerts: analysis.alerts,
            optimization_opportunities: [
                {
                    opportunity: 'Batch API calls',
                    potential_savings: '$500/month',
                    implementation: 'Group similar operations'
                },
                {
                    opportunity: 'Cache frequent searches',
                    potential_savings: '$300/month',
                    implementation: 'Implement Redis caching'
                }
            ]
        };
    }

    async process(request: NextRequest): Promise<NextResponse> {
        try {
            const { action, data } = await request.json();

            let result;
            switch (action) {
                case 'analyze':
                    result = await this.analyzeCosts();
                    break;
                case 'approve':
                    result = await this.approveExpense(data.agent, data.cost);
                    break;
                case 'report':
                    result = await this.generateFinancialReport();
                    break;
                default:
                    result = {
                        current_spend: {
                            daily: this.dailySpend,
                            monthly: this.monthlySpend
                        },
                        limits: {
                            daily: this.config.dailyBudgetLimit,
                            monthly: this.config.monthlyBudgetLimit
                        },
                        status: 'operational'
                    };
            }

            // Track our own cost
            this.trackCost('CFO', this.config.costPerUse);

            return NextResponse.json({
                success: true,
                agent: this.config.name,
                result,
                cost: this.config.costPerUse,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('CFO Agent Error:', error);
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
export const cfoAgent = new CFOAgent(); 