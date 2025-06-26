import { NextRequest, NextResponse } from 'next/server';
import { eventBus } from '@/lib/agents/agent-communication';

interface QAConfig {
    name: string;
    emoji: string;
    priority: number;
    costPerUse: number;
    capabilities: string[];
    qualityMetrics: {
        minMatchScore: number;
        minResponseRate: number;
        maxErrorRate: number;
        minDataCompleteness: number;
    };
}

interface QualityCheck {
    checkId: string;
    type: 'candidate' | 'message' | 'process' | 'data';
    status: 'pass' | 'fail' | 'warning';
    score: number;
    issues: string[];
    recommendations: string[];
    timestamp: Date;
}

interface QualityReport {
    overallScore: number;
    checks: QualityCheck[];
    trends: {
        improving: string[];
        declining: string[];
        stable: string[];
    };
    actionItems: string[];
}

export class QualityAssuranceAgent {
    private config: QAConfig;
    private qualityHistory: QualityCheck[] = [];
    private processMetrics: Map<string, number[]> = new Map();

    constructor() {
        this.config = {
            name: 'Quality Assurance',
            emoji: '✅',
            priority: 12,
            costPerUse: 0.04,
            capabilities: [
                'quality-validation',
                'process-monitoring',
                'data-integrity',
                'performance-testing',
                'compliance-checking',
                'automated-testing'
            ],
            qualityMetrics: {
                minMatchScore: 0.7,
                minResponseRate: 0.35,
                maxErrorRate: 0.05,
                minDataCompleteness: 0.9
            }
        };

        this.initializeQAMonitoring();
    }

    private initializeQAMonitoring() {
        // Monitor candidate quality
        eventBus.on('candidate:analyzed', (data: any) => {
            this.checkCandidateQuality(data);
        });

        // Monitor message quality
        eventBus.on('message:created', (data: any) => {
            this.checkMessageQuality(data);
        });

        // Monitor process quality
        eventBus.on('process:completed', (data: any) => {
            this.checkProcessQuality(data);
        });

        // Regular quality audits
        setInterval(() => {
            this.performQualityAudit();
        }, 24 * 60 * 60 * 1000); // Daily
    }

    private async checkCandidateQuality(candidateData: any): Promise<QualityCheck> {
        const issues: string[] = [];
        const recommendations: string[] = [];
        let score = 100;

        // Check data completeness
        const requiredFields = ['name', 'email', 'skills', 'experience', 'location'];
        const missingFields = requiredFields.filter(field => !candidateData[field]);

        if (missingFields.length > 0) {
            score -= missingFields.length * 10;
            issues.push(`Missing fields: ${missingFields.join(', ')}`);
            recommendations.push('Ensure all candidate data is collected');
        }

        // Check match score
        if (candidateData.matchScore < this.config.qualityMetrics.minMatchScore) {
            score -= 20;
            issues.push(`Low match score: ${candidateData.matchScore}`);
            recommendations.push('Review matching criteria or expand search parameters');
        }

        // Check data freshness
        if (candidateData.lastUpdated) {
            const daysSinceUpdate = (Date.now() - new Date(candidateData.lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceUpdate > 90) {
                score -= 15;
                issues.push('Candidate data is stale (>90 days)');
                recommendations.push('Refresh candidate information from sources');
            }
        }

        const check: QualityCheck = {
            checkId: `qa-candidate-${Date.now()}`,
            type: 'candidate',
            status: score >= 80 ? 'pass' : score >= 60 ? 'warning' : 'fail',
            score,
            issues,
            recommendations,
            timestamp: new Date()
        };

        this.qualityHistory.push(check);
        this.updateProcessMetrics('candidate-quality', score);

        return check;
    }

    private async checkMessageQuality(messageData: any): Promise<QualityCheck> {
        const issues: string[] = [];
        const recommendations: string[] = [];
        let score = 100;

        // Check message length
        if (messageData.content.length > 300) {
            score -= 10;
            issues.push('Message too long (>300 characters)');
            recommendations.push('Shorten message for better engagement');
        } else if (messageData.content.length < 50) {
            score -= 15;
            issues.push('Message too short (<50 characters)');
            recommendations.push('Add more personalization and context');
        }

        // Check personalization
        const personalElements = ['name', 'company', 'skill', 'achievement'];
        const personalizedCount = personalElements.filter(elem =>
            messageData.content.includes(`{${elem}}`)
        ).length;

        if (personalizedCount < 2) {
            score -= 20;
            issues.push('Insufficient personalization');
            recommendations.push('Add more personalized elements');
        }

        // Check for spam triggers
        const spamWords = ['guarantee', 'free', 'urgent', 'act now', 'limited time'];
        const hasSpamWords = spamWords.some(word =>
            messageData.content.toLowerCase().includes(word)
        );

        if (hasSpamWords) {
            score -= 25;
            issues.push('Contains spam trigger words');
            recommendations.push('Remove promotional language');
        }

        const check: QualityCheck = {
            checkId: `qa-message-${Date.now()}`,
            type: 'message',
            status: score >= 80 ? 'pass' : score >= 60 ? 'warning' : 'fail',
            score,
            issues,
            recommendations,
            timestamp: new Date()
        };

        this.qualityHistory.push(check);
        this.updateProcessMetrics('message-quality', score);

        return check;
    }

    private async checkProcessQuality(processData: any): Promise<QualityCheck> {
        const issues: string[] = [];
        const recommendations: string[] = [];
        let score = 100;

        // Check process duration
        if (processData.duration > 5000) { // 5 seconds
            score -= 15;
            issues.push('Process took too long (>5s)');
            recommendations.push('Optimize slow operations or add caching');
        }

        // Check error rate
        if (processData.errors && processData.errors.length > 0) {
            const errorRate = processData.errors.length / processData.totalOperations;
            if (errorRate > this.config.qualityMetrics.maxErrorRate) {
                score -= 30;
                issues.push(`High error rate: ${(errorRate * 100).toFixed(1)}%`);
                recommendations.push('Investigate and fix recurring errors');
            }
        }

        // Check resource usage
        if (processData.apiCalls > 10) {
            score -= 10;
            issues.push('Excessive API calls');
            recommendations.push('Batch operations to reduce API usage');
        }

        const check: QualityCheck = {
            checkId: `qa-process-${Date.now()}`,
            type: 'process',
            status: score >= 80 ? 'pass' : score >= 60 ? 'warning' : 'fail',
            score,
            issues,
            recommendations,
            timestamp: new Date()
        };

        this.qualityHistory.push(check);
        this.updateProcessMetrics('process-quality', score);

        return check;
    }

    private updateProcessMetrics(metric: string, value: number) {
        if (!this.processMetrics.has(metric)) {
            this.processMetrics.set(metric, []);
        }

        const values = this.processMetrics.get(metric)!;
        values.push(value);

        // Keep only last 100 values
        if (values.length > 100) {
            values.shift();
        }
    }

    private async performQualityAudit(): Promise<QualityReport> {
        // Analyze recent quality checks
        const recentChecks = this.qualityHistory.filter(
            check => check.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );

        // Calculate overall score
        const overallScore = recentChecks.length > 0
            ? recentChecks.reduce((sum, check) => sum + check.score, 0) / recentChecks.length
            : 100;

        // Identify trends
        const trends = this.analyzeTrends();

        // Generate action items
        const actionItems = this.generateActionItems(recentChecks, trends);

        const report: QualityReport = {
            overallScore,
            checks: recentChecks,
            trends,
            actionItems
        };

        // Emit report
        eventBus.emit('qa:audit:complete', report);

        return report;
    }

    private analyzeTrends(): { improving: string[]; declining: string[]; stable: string[] } {
        const trends = {
            improving: [] as string[],
            declining: [] as string[],
            stable: [] as string[]
        };

        for (const [metric, values] of this.processMetrics.entries()) {
            if (values.length < 10) continue;

            const recent = values.slice(-10);
            const previous = values.slice(-20, -10);

            const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
            const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length;

            const change = ((recentAvg - previousAvg) / previousAvg) * 100;

            if (change > 5) {
                trends.improving.push(metric);
            } else if (change < -5) {
                trends.declining.push(metric);
            } else {
                trends.stable.push(metric);
            }
        }

        return trends;
    }

    private generateActionItems(checks: QualityCheck[], trends: any): string[] {
        const actionItems: string[] = [];

        // Based on failing checks
        const failingChecks = checks.filter(c => c.status === 'fail');
        if (failingChecks.length > 0) {
            actionItems.push(`Address ${failingChecks.length} failing quality checks immediately`);

            // Group by type
            const byType = failingChecks.reduce((acc, check) => {
                acc[check.type] = (acc[check.type] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            for (const [type, count] of Object.entries(byType)) {
                actionItems.push(`Fix ${count} ${type} quality issues`);
            }
        }

        // Based on trends
        if (trends.declining.length > 0) {
            actionItems.push(`Investigate declining metrics: ${trends.declining.join(', ')}`);
        }

        // Based on common issues
        const allIssues = checks.flatMap(c => c.issues);
        const issueCounts = allIssues.reduce((acc, issue) => {
            acc[issue] = (acc[issue] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const topIssues = Object.entries(issueCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3);

        for (const [issue, count] of topIssues) {
            if (count > 5) {
                actionItems.push(`Recurring issue (${count}x): ${issue}`);
            }
        }

        return actionItems;
    }

    async validateDataIntegrity(data: any): Promise<{
        isValid: boolean;
        issues: string[];
        score: number;
    }> {
        const issues: string[] = [];
        let score = 100;

        // Check for required fields
        if (!data || typeof data !== 'object') {
            return { isValid: false, issues: ['Invalid data format'], score: 0 };
        }

        // Type validation
        const typeChecks = [
            { field: 'id', type: 'string' },
            { field: 'timestamp', type: 'string' },
            { field: 'score', type: 'number' }
        ];

        for (const check of typeChecks) {
            if (data[check.field] && typeof data[check.field] !== check.type) {
                issues.push(`${check.field} should be ${check.type}`);
                score -= 20;
            }
        }

        // Range validation
        if (data.score !== undefined && (data.score < 0 || data.score > 100)) {
            issues.push('Score out of valid range (0-100)');
            score -= 30;
        }

        // Completeness check
        const completeness = Object.keys(data).filter(key =>
            data[key] !== null && data[key] !== undefined && data[key] !== ''
        ).length / Object.keys(data).length;

        if (completeness < this.config.qualityMetrics.minDataCompleteness) {
            issues.push(`Data completeness below threshold: ${(completeness * 100).toFixed(1)}%`);
            score -= 25;
        }

        return {
            isValid: issues.length === 0,
            issues,
            score: Math.max(0, score)
        };
    }

    async process(request: NextRequest): Promise<NextResponse> {
        try {
            const { action, data } = await request.json();

            let result;
            switch (action) {
                case 'check-candidate':
                    result = await this.checkCandidateQuality(data);
                    break;
                case 'check-message':
                    result = await this.checkMessageQuality(data);
                    break;
                case 'check-process':
                    result = await this.checkProcessQuality(data);
                    break;
                case 'audit':
                    result = await this.performQualityAudit();
                    break;
                case 'validate':
                    result = await this.validateDataIntegrity(data);
                    break;
                default:
                    result = {
                        status: 'operational',
                        recentChecks: this.qualityHistory.slice(-10),
                        metrics: Object.fromEntries(
                            Array.from(this.processMetrics.entries()).map(([key, values]) => [
                                key,
                                values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
                            ])
                        )
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
            console.error('QA Agent Error:', error);
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
export const qaAgent = new QualityAssuranceAgent(); 