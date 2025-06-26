import { NextRequest, NextResponse } from 'next/server';
import { eventBus } from '@/lib/agents/agent-communication';

interface DataAnalystConfig {
    name: string;
    emoji: string;
    priority: number;
    costPerUse: number;
    capabilities: string[];
    analysisTypes: string[];
    reportingSchedule: {
        daily: string[];
        weekly: string[];
        monthly: string[];
    };
}

interface AnalysisResult {
    type: string;
    data: any;
    insights: string[];
    recommendations: string[];
    visualizations?: any[];
    confidence: number;
}

interface PerformanceMetrics {
    responseRate: number;
    conversionRate: number;
    timeToHire: number;
    costPerHire: number;
    candidateQuality: number;
    sourcingEfficiency: number;
}

interface TrendAnalysis {
    metric: string;
    current: number;
    previous: number;
    change: number;
    trend: 'improving' | 'declining' | 'stable';
    forecast: number;
}

export class DataAnalystAgent {
    private config: DataAnalystConfig;
    private metricsHistory: Map<string, any[]> = new Map();
    private analysisCache: Map<string, AnalysisResult> = new Map();
    private benchmarks: Map<string, number> = new Map();

    constructor() {
        this.config = {
            name: 'Data Analyst',
            emoji: '📊',
            priority: 13,
            costPerUse: 0.07,
            capabilities: [
                'data-analysis',
                'trend-detection',
                'reporting',
                'visualization',
                'predictive-analytics',
                'benchmarking'
            ],
            analysisTypes: [
                'performance-metrics',
                'source-effectiveness',
                'message-optimization',
                'cost-analysis',
                'quality-metrics',
                'pipeline-analytics'
            ],
            reportingSchedule: {
                daily: ['performance-summary', 'cost-tracking'],
                weekly: ['source-analysis', 'quality-report'],
                monthly: ['comprehensive-review', 'trend-analysis']
            }
        };

        this.initializeAnalytics();
        this.setupBenchmarks();
    }

    private initializeAnalytics() {
        // Collect metrics from all agents
        eventBus.on('agent:task:complete', (data: any) => {
            this.collectMetric(data);
        });

        // Track candidate journey
        eventBus.on('candidate:status:changed', (data: any) => {
            this.trackCandidateJourney(data);
        });

        // Monitor costs
        eventBus.on('agent:cost:incurred', (data: any) => {
            this.trackCost(data);
        });

        // Schedule reports
        this.scheduleReports();
    }

    private setupBenchmarks() {
        // Industry benchmarks
        this.benchmarks.set('responseRate', 0.15); // 15% industry average
        this.benchmarks.set('conversionRate', 0.10); // 10% industry average
        this.benchmarks.set('timeToHire', 42); // 42 days industry average
        this.benchmarks.set('costPerHire', 4000); // $4000 industry average
        this.benchmarks.set('candidateQuality', 0.60); // 60% quality score
        this.benchmarks.set('sourcingEfficiency', 0.25); // 25% efficiency
    }

    private collectMetric(data: any) {
        const key = `${data.agent}:${data.metric || 'general'}`;

        if (!this.metricsHistory.has(key)) {
            this.metricsHistory.set(key, []);
        }

        const history = this.metricsHistory.get(key)!;
        history.push({
            value: data.value || data.result,
            timestamp: new Date(),
            metadata: data
        });

        // Keep only last 1000 entries
        if (history.length > 1000) {
            history.shift();
        }
    }

    private trackCandidateJourney(data: any) {
        const journey = this.metricsHistory.get('candidate-journeys') || [];
        journey.push({
            candidateId: data.candidateId,
            status: data.status,
            timestamp: new Date(),
            source: data.source,
            touchpoints: data.touchpoints || 1
        });
        this.metricsHistory.set('candidate-journeys', journey);
    }

    private trackCost(data: any) {
        const costs = this.metricsHistory.get('costs') || [];
        costs.push({
            agent: data.agent,
            cost: data.cost,
            timestamp: new Date(),
            operation: data.operation
        });
        this.metricsHistory.set('costs', costs);
    }

    private scheduleReports() {
        // Daily reports
        setInterval(() => {
            this.generateScheduledReports('daily');
        }, 24 * 60 * 60 * 1000);

        // Weekly reports
        setInterval(() => {
            this.generateScheduledReports('weekly');
        }, 7 * 24 * 60 * 60 * 1000);

        // Monthly reports
        setInterval(() => {
            this.generateScheduledReports('monthly');
        }, 30 * 24 * 60 * 60 * 1000);
    }

    private async generateScheduledReports(frequency: 'daily' | 'weekly' | 'monthly') {
        const reports = this.config.reportingSchedule[frequency];

        for (const reportType of reports) {
            const report = await this.generateReport(reportType);
            eventBus.emit('analyst:report:ready', {
                type: reportType,
                frequency,
                report
            });
        }
    }

    async analyzePerformance(): Promise<PerformanceMetrics> {
        const now = Date.now();
        const dayAgo = now - 24 * 60 * 60 * 1000;

        // Calculate response rate
        const messages = this.metricsHistory.get('message-sent') || [];
        const responses = this.metricsHistory.get('message-responded') || [];
        const recentMessages = messages.filter(m => m.timestamp > dayAgo).length;
        const recentResponses = responses.filter(r => r.timestamp > dayAgo).length;
        const responseRate = recentMessages > 0 ? recentResponses / recentMessages : 0;

        // Calculate conversion rate
        const interviews = this.metricsHistory.get('interview-scheduled') || [];
        const hires = this.metricsHistory.get('candidate-hired') || [];
        const conversionRate = interviews.length > 0 ? hires.length / interviews.length : 0;

        // Calculate time to hire
        const hiredCandidates = this.metricsHistory.get('candidate-journeys')?.filter(
            j => j.status === 'hired'
        ) || [];
        const timeToHire = this.calculateAverageTimeToHire(hiredCandidates);

        // Calculate cost per hire
        const totalCosts = this.calculateTotalCosts();
        const costPerHire = hires.length > 0 ? totalCosts / hires.length : 0;

        // Calculate candidate quality
        const qualityScores = this.metricsHistory.get('candidate-quality') || [];
        const candidateQuality = this.calculateAverageQuality(qualityScores);

        // Calculate sourcing efficiency
        const sourcingEfficiency = this.calculateSourcingEfficiency();

        return {
            responseRate,
            conversionRate,
            timeToHire,
            costPerHire,
            candidateQuality,
            sourcingEfficiency
        };
    }

    private calculateAverageTimeToHire(hiredCandidates: any[]): number {
        if (hiredCandidates.length === 0) return 0;

        const times = hiredCandidates.map(candidate => {
            const start = candidate.firstContact || candidate.timestamp;
            const end = candidate.hiredDate || candidate.timestamp;
            return (end - start) / (1000 * 60 * 60 * 24); // Days
        });

        return times.reduce((a, b) => a + b, 0) / times.length;
    }

    private calculateTotalCosts(): number {
        const costs = this.metricsHistory.get('costs') || [];
        return costs.reduce((total, cost) => total + cost.cost, 0);
    }

    private calculateAverageQuality(scores: any[]): number {
        if (scores.length === 0) return 0;
        const sum = scores.reduce((total, score) => total + score.value, 0);
        return sum / scores.length;
    }

    private calculateSourcingEfficiency(): number {
        const searches = this.metricsHistory.get('search-performed') || [];
        const qualifiedCandidates = this.metricsHistory.get('candidate-qualified') || [];
        return searches.length > 0 ? qualifiedCandidates.length / searches.length : 0;
    }

    async analyzeTrends(metric: string, period: number = 30): Promise<TrendAnalysis> {
        const history = this.metricsHistory.get(metric) || [];
        const now = Date.now();
        const periodMs = period * 24 * 60 * 60 * 1000;

        // Current period
        const currentData = history.filter(h =>
            h.timestamp > now - periodMs
        );
        const current = this.calculateAverage(currentData);

        // Previous period
        const previousData = history.filter(h =>
            h.timestamp > now - 2 * periodMs && h.timestamp <= now - periodMs
        );
        const previous = this.calculateAverage(previousData);

        // Calculate change
        const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;

        // Determine trend
        let trend: 'improving' | 'declining' | 'stable';
        if (Math.abs(change) < 5) {
            trend = 'stable';
        } else if (change > 0) {
            trend = metric.includes('cost') ? 'declining' : 'improving';
        } else {
            trend = metric.includes('cost') ? 'improving' : 'declining';
        }

        // Simple forecast (linear projection)
        const forecast = current + (current - previous);

        return {
            metric,
            current,
            previous,
            change,
            trend,
            forecast
        };
    }

    private calculateAverage(data: any[]): number {
        if (data.length === 0) return 0;
        const sum = data.reduce((total, item) => total + (item.value || 0), 0);
        return sum / data.length;
    }

    async generateReport(reportType: string): Promise<AnalysisResult> {
        // Check cache
        const cacheKey = `${reportType}-${new Date().toDateString()}`;
        if (this.analysisCache.has(cacheKey)) {
            return this.analysisCache.get(cacheKey)!;
        }

        let result: AnalysisResult;

        switch (reportType) {
            case 'performance-summary':
                result = await this.generatePerformanceSummary();
                break;
            case 'source-analysis':
                result = await this.analyzeSourceEffectiveness();
                break;
            case 'cost-analysis':
                result = await this.analyzeCosts();
                break;
            case 'quality-report':
                result = await this.analyzeQuality();
                break;
            default:
                result = await this.generateComprehensiveReport();
        }

        // Cache result
        this.analysisCache.set(cacheKey, result);

        return result;
    }

    private async generatePerformanceSummary(): Promise<AnalysisResult> {
        const metrics = await this.analyzePerformance();
        const insights: string[] = [];
        const recommendations: string[] = [];

        // Compare with benchmarks
        for (const [key, value] of Object.entries(metrics)) {
            const benchmark = this.benchmarks.get(key) || 0;
            const performance = value / benchmark;

            if (performance > 1.2) {
                insights.push(`${key} is ${((performance - 1) * 100).toFixed(0)}% above industry average`);
            } else if (performance < 0.8) {
                insights.push(`${key} is ${((1 - performance) * 100).toFixed(0)}% below industry average`);
                recommendations.push(`Focus on improving ${key}`);
            }
        }

        // Overall insights
        if (metrics.responseRate > 0.4) {
            insights.push('Exceptional response rate indicates strong messaging');
        }
        if (metrics.costPerHire < 3000) {
            insights.push('Cost-efficient hiring process');
        }

        return {
            type: 'performance-summary',
            data: metrics,
            insights,
            recommendations,
            confidence: 0.85
        };
    }

    private async analyzeSourceEffectiveness(): Promise<AnalysisResult> {
        const sources = new Map<string, { candidates: number; quality: number; hires: number }>();

        // Aggregate by source
        const journeys = this.metricsHistory.get('candidate-journeys') || [];
        for (const journey of journeys) {
            const source = journey.source || 'unknown';
            if (!sources.has(source)) {
                sources.set(source, { candidates: 0, quality: 0, hires: 0 });
            }

            const data = sources.get(source)!;
            data.candidates++;
            if (journey.status === 'hired') data.hires++;
            data.quality += journey.qualityScore || 0;
        }

        // Calculate effectiveness
        const effectiveness = Array.from(sources.entries()).map(([source, data]) => ({
            source,
            candidates: data.candidates,
            hireRate: data.candidates > 0 ? data.hires / data.candidates : 0,
            avgQuality: data.candidates > 0 ? data.quality / data.candidates : 0,
            roi: data.hires * 50000 / (data.candidates * 50) // Simplified ROI
        }));

        const insights = [
            `Top performing source: ${effectiveness[0]?.source || 'N/A'}`,
            `${effectiveness.filter(e => e.hireRate > 0.1).length} sources with >10% hire rate`
        ];

        const recommendations = effectiveness
            .filter(e => e.roi < 1)
            .map(e => `Consider reducing investment in ${e.source}`);

        return {
            type: 'source-analysis',
            data: effectiveness,
            insights,
            recommendations,
            confidence: 0.75
        };
    }

    private async analyzeCosts(): Promise<AnalysisResult> {
        const costs = this.metricsHistory.get('costs') || [];
        const costByAgent = new Map<string, number>();

        // Aggregate costs by agent
        for (const cost of costs) {
            const current = costByAgent.get(cost.agent) || 0;
            costByAgent.set(cost.agent, current + cost.cost);
        }

        // Calculate daily average
        const totalCost = Array.from(costByAgent.values()).reduce((a, b) => a + b, 0);
        const days = costs.length > 0 ?
            (costs[costs.length - 1].timestamp - costs[0].timestamp) / (1000 * 60 * 60 * 24) : 1;
        const dailyAverage = totalCost / days;

        const insights = [
            `Total spend: $${totalCost.toFixed(2)}`,
            `Daily average: $${dailyAverage.toFixed(2)}`,
            `Highest cost agent: ${Array.from(costByAgent.entries()).sort((a, b) => b[1] - a[1])[0]?.[0]}`
        ];

        const recommendations = [];
        if (dailyAverage > 100) {
            recommendations.push('Consider optimizing high-frequency operations');
        }

        return {
            type: 'cost-analysis',
            data: {
                total: totalCost,
                byAgent: Object.fromEntries(costByAgent),
                dailyAverage,
                projection: dailyAverage * 30
            },
            insights,
            recommendations,
            confidence: 0.9
        };
    }

    private async analyzeQuality(): Promise<AnalysisResult> {
        const qualityScores = this.metricsHistory.get('candidate-quality') || [];
        const recent = qualityScores.slice(-100);

        const avgQuality = this.calculateAverage(recent);
        const trend = await this.analyzeTrends('candidate-quality', 7);

        const insights = [
            `Average candidate quality: ${(avgQuality * 100).toFixed(0)}%`,
            `Quality trend: ${trend.trend}`,
            `${recent.filter(q => q.value > 0.8).length}% high-quality candidates`
        ];

        const recommendations = [];
        if (avgQuality < 0.7) {
            recommendations.push('Refine sourcing criteria for better matches');
            recommendations.push('Consider expanding search to new platforms');
        }

        return {
            type: 'quality-report',
            data: {
                average: avgQuality,
                trend: trend,
                distribution: this.calculateDistribution(recent)
            },
            insights,
            recommendations,
            confidence: 0.8
        };
    }

    private async generateComprehensiveReport(): Promise<AnalysisResult> {
        const performance = await this.generatePerformanceSummary();
        const sources = await this.analyzeSourceEffectiveness();
        const costs = await this.analyzeCosts();
        const quality = await this.analyzeQuality();

        return {
            type: 'comprehensive-report',
            data: {
                performance: performance.data,
                sources: sources.data,
                costs: costs.data,
                quality: quality.data
            },
            insights: [
                ...performance.insights,
                ...sources.insights,
                ...costs.insights,
                ...quality.insights
            ],
            recommendations: [
                ...performance.recommendations,
                ...sources.recommendations,
                ...costs.recommendations,
                ...quality.recommendations
            ],
            confidence: 0.85
        };
    }

    private calculateDistribution(data: any[]): Record<string, number> {
        const distribution: Record<string, number> = {
            'excellent': 0,
            'good': 0,
            'average': 0,
            'poor': 0
        };

        for (const item of data) {
            const value = item.value || 0;
            if (value >= 0.9) distribution.excellent++;
            else if (value >= 0.7) distribution.good++;
            else if (value >= 0.5) distribution.average++;
            else distribution.poor++;
        }

        return distribution;
    }

    async process(request: NextRequest): Promise<NextResponse> {
        try {
            const { action, data } = await request.json();

            let result;
            switch (action) {
                case 'analyze-performance':
                    result = await this.analyzePerformance();
                    break;
                case 'analyze-trends':
                    result = await this.analyzeTrends(data.metric, data.period);
                    break;
                case 'generate-report':
                    result = await this.generateReport(data.reportType);
                    break;
                case 'get-benchmarks':
                    result = Object.fromEntries(this.benchmarks);
                    break;
                default:
                    result = {
                        status: 'operational',
                        metricsTracked: this.metricsHistory.size,
                        reportsAvailable: [
                            'performance-summary',
                            'source-analysis',
                            'cost-analysis',
                            'quality-report',
                            'comprehensive-report'
                        ]
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
            console.error('Data Analyst Error:', error);
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
export const dataAnalystAgent = new DataAnalystAgent(); 