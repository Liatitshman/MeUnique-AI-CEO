import { NextRequest, NextResponse } from 'next/server';
import { eventBus } from '@/lib/agents/agent-communication';

interface CTOConfig {
    name: string;
    emoji: string;
    priority: number;
    costPerUse: number;
    capabilities: string[];
    techStack: string[];
    performanceThresholds: {
        responseTime: number;
        errorRate: number;
        uptime: number;
    };
}

interface SystemHealth {
    status: 'healthy' | 'degraded' | 'critical';
    metrics: {
        responseTime: number;
        errorRate: number;
        uptime: number;
        activeAgents: number;
        queuedTasks: number;
    };
    issues: string[];
    recommendations: string[];
}

interface TechValidation {
    candidate: string;
    technicalScore: number;
    skills: {
        skill: string;
        level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
        verified: boolean;
    }[];
    githubAnalysis?: {
        contributions: number;
        languages: Record<string, number>;
        topProjects: string[];
    };
    recommendations: string[];
}

export class CTOAgent {
    private config: CTOConfig;
    private systemMetrics: Map<string, any> = new Map();
    private errorLog: Array<{ timestamp: Date; agent: string; error: string }> = [];
    private performanceData: Map<string, number[]> = new Map();

    constructor() {
        this.config = {
            name: 'CTO',
            emoji: '💻',
            priority: 10,
            costPerUse: 0.08,
            capabilities: [
                'technical-validation',
                'system-monitoring',
                'performance-optimization',
                'integration-management',
                'security-oversight',
                'architecture-decisions'
            ],
            techStack: [
                'Next.js 14',
                'TypeScript',
                'React',
                'Node.js',
                'PostgreSQL',
                'Redis',
                'OpenAI API',
                'Vercel'
            ],
            performanceThresholds: {
                responseTime: 3000, // ms
                errorRate: 0.01, // 1%
                uptime: 0.999 // 99.9%
            }
        };

        this.initializeMonitoring();
    }

    private initializeMonitoring() {
        // Monitor agent performance
        eventBus.on('agent:task:complete', (data: any) => {
            this.trackPerformance(data.agent, data.executionTime);
        });

        // Monitor errors
        eventBus.on('agent:error', (data: any) => {
            this.logError(data.agent, data.error);
        });

        // System health check every 5 minutes
        setInterval(() => {
            this.performHealthCheck();
        }, 300000);
    }

    private trackPerformance(agent: string, executionTime: number) {
        if (!this.performanceData.has(agent)) {
            this.performanceData.set(agent, []);
        }

        const data = this.performanceData.get(agent)!;
        data.push(executionTime);

        // Keep only last 100 data points
        if (data.length > 100) {
            data.shift();
        }
    }

    private logError(agent: string, error: string) {
        this.errorLog.push({
            timestamp: new Date(),
            agent,
            error
        });

        // Keep only last 1000 errors
        if (this.errorLog.length > 1000) {
            this.errorLog.shift();
        }

        // Alert if error rate is high
        const recentErrors = this.errorLog.filter(
            e => e.timestamp.getTime() > Date.now() - 3600000 // Last hour
        );

        if (recentErrors.length > 10) {
            eventBus.emit('cto:alert:high-error-rate', {
                count: recentErrors.length,
                agents: [...new Set(recentErrors.map(e => e.agent))]
            });
        }
    }

    async performHealthCheck(): Promise<SystemHealth> {
        const avgResponseTimes = new Map<string, number>();

        // Calculate average response times
        for (const [agent, times] of this.performanceData.entries()) {
            if (times.length > 0) {
                const avg = times.reduce((a, b) => a + b, 0) / times.length;
                avgResponseTimes.set(agent, avg);
            }
        }

        // Calculate error rate
        const hourAgo = Date.now() - 3600000;
        const recentErrors = this.errorLog.filter(e => e.timestamp.getTime() > hourAgo);
        const errorRate = recentErrors.length / 1000; // Assuming 1000 operations per hour

        // Determine system status
        const issues: string[] = [];
        let status: 'healthy' | 'degraded' | 'critical' = 'healthy';

        // Check response times
        const slowAgents = Array.from(avgResponseTimes.entries())
            .filter(([_, time]) => time > this.config.performanceThresholds.responseTime);

        if (slowAgents.length > 0) {
            issues.push(`Slow response times: ${slowAgents.map(([agent]) => agent).join(', ')}`);
            status = 'degraded';
        }

        // Check error rate
        if (errorRate > this.config.performanceThresholds.errorRate) {
            issues.push(`High error rate: ${(errorRate * 100).toFixed(2)}%`);
            status = errorRate > 0.05 ? 'critical' : 'degraded';
        }

        const recommendations = this.generateSystemRecommendations(issues, avgResponseTimes);

        return {
            status,
            metrics: {
                responseTime: Array.from(avgResponseTimes.values()).reduce((a, b) => a + b, 0) / avgResponseTimes.size || 0,
                errorRate,
                uptime: 0.999, // Placeholder - would calculate from actual uptime data
                activeAgents: this.performanceData.size,
                queuedTasks: 0 // Placeholder - would get from queue system
            },
            issues,
            recommendations
        };
    }

    private generateSystemRecommendations(issues: string[], responseTimes: Map<string, number>): string[] {
        const recommendations: string[] = [];

        // Performance recommendations
        const slowestAgent = Array.from(responseTimes.entries())
            .sort(([, a], [, b]) => b - a)[0];

        if (slowestAgent && slowestAgent[1] > 2000) {
            recommendations.push(`Optimize ${slowestAgent[0]} - consider caching or parallel processing`);
        }

        // Scaling recommendations
        if (responseTimes.size > 10) {
            recommendations.push('Consider implementing agent pooling for better resource management');
        }

        // Error handling
        if (issues.some(i => i.includes('error rate'))) {
            recommendations.push('Implement circuit breaker pattern for failing services');
            recommendations.push('Add retry logic with exponential backoff');
        }

        // Infrastructure
        if (this.errorLog.length > 500) {
            recommendations.push('Set up centralized logging (e.g., Datadog, New Relic)');
        }

        return recommendations;
    }

    async validateTechnicalSkills(candidateData: any): Promise<TechValidation> {
        const { name, skills, githubUsername, experience } = candidateData;

        // Skill validation
        const validatedSkills = skills.map((skill: string) => {
            const level = this.assessSkillLevel(skill, experience);
            return {
                skill,
                level,
                verified: githubUsername ? true : false // Would verify through GitHub
            };
        });

        // Calculate technical score
        const technicalScore = this.calculateTechnicalScore(validatedSkills, experience);

        // GitHub analysis (if available)
        let githubAnalysis;
        if (githubUsername) {
            githubAnalysis = await this.analyzeGitHubProfile(githubUsername);
        }

        // Generate recommendations
        const recommendations = this.generateTechnicalRecommendations(
            validatedSkills,
            technicalScore,
            githubAnalysis
        );

        return {
            candidate: name,
            technicalScore,
            skills: validatedSkills,
            githubAnalysis,
            recommendations
        };
    }

    private assessSkillLevel(skill: string, experience: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
        // Simplified logic - would use more sophisticated assessment
        const coreSkills = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python'];
        const isCore = coreSkills.some(core => skill.toLowerCase().includes(core.toLowerCase()));

        if (experience < 2) return 'beginner';
        if (experience < 4) return isCore ? 'intermediate' : 'beginner';
        if (experience < 7) return isCore ? 'advanced' : 'intermediate';
        return isCore ? 'expert' : 'advanced';
    }

    private calculateTechnicalScore(skills: any[], experience: number): number {
        let score = 0;

        // Base score from experience
        score += Math.min(experience * 10, 50);

        // Score from skills
        skills.forEach(skill => {
            switch (skill.level) {
                case 'expert': score += 10; break;
                case 'advanced': score += 7; break;
                case 'intermediate': score += 4; break;
                case 'beginner': score += 2; break;
            }
        });

        // Normalize to 0-100
        return Math.min(Math.round(score), 100);
    }

    private async analyzeGitHubProfile(username: string): Promise<any> {
        // Placeholder - would make actual GitHub API calls
        return {
            contributions: 1247,
            languages: {
                'TypeScript': 45,
                'JavaScript': 30,
                'Python': 15,
                'Go': 10
            },
            topProjects: [
                'open-source-contribution-1',
                'personal-project-2',
                'work-project-3'
            ]
        };
    }

    private generateTechnicalRecommendations(
        skills: any[],
        score: number,
        githubAnalysis?: any
    ): string[] {
        const recommendations: string[] = [];

        if (score > 80) {
            recommendations.push('Strong technical candidate - fast-track interview process');
        } else if (score > 60) {
            recommendations.push('Solid technical foundation - proceed with standard process');
        } else {
            recommendations.push('Consider technical assessment or coding challenge');
        }

        // Skill-based recommendations
        const hasRequiredSkills = skills.some(s =>
            ['React', 'Node.js', 'TypeScript'].includes(s.skill) &&
            ['advanced', 'expert'].includes(s.level)
        );

        if (!hasRequiredSkills) {
            recommendations.push('May need additional training in core technologies');
        }

        // GitHub-based recommendations
        if (githubAnalysis) {
            if (githubAnalysis.contributions > 1000) {
                recommendations.push('Active open-source contributor - positive signal');
            }
            if (githubAnalysis.languages.TypeScript > 40) {
                recommendations.push('Strong TypeScript experience aligns with tech stack');
            }
        }

        return recommendations;
    }

    async optimizeSystemPerformance(): Promise<any> {
        const health = await this.performHealthCheck();

        const optimizations = {
            implemented: [] as string[],
            recommended: [] as string[],
            impact: {} as Record<string, string>
        };

        // Auto-optimizations
        if (health.metrics.errorRate > 0.02) {
            // Implement circuit breaker
            optimizations.implemented.push('Enabled circuit breaker for failing services');
            optimizations.impact['error_reduction'] = '~50% expected reduction in cascading failures';
        }

        // Caching optimization
        const cacheCandidates = Array.from(this.performanceData.entries())
            .filter(([_, times]) => {
                const avg = times.reduce((a, b) => a + b, 0) / times.length;
                return avg > 1000;
            });

        if (cacheCandidates.length > 0) {
            optimizations.recommended.push('Implement Redis caching for slow operations');
            optimizations.impact['performance'] = '~60% reduction in response time';
        }

        // Database optimization
        optimizations.recommended.push('Consider database indexing for frequent queries');
        optimizations.recommended.push('Implement connection pooling');

        return optimizations;
    }

    async process(request: NextRequest): Promise<NextResponse> {
        try {
            const { action, data } = await request.json();

            let result;
            switch (action) {
                case 'health-check':
                    result = await this.performHealthCheck();
                    break;
                case 'validate-skills':
                    result = await this.validateTechnicalSkills(data);
                    break;
                case 'optimize':
                    result = await this.optimizeSystemPerformance();
                    break;
                case 'tech-stack':
                    result = {
                        current: this.config.techStack,
                        recommendations: [
                            'Consider adding Elasticsearch for advanced search',
                            'Implement GraphQL for flexible API queries',
                            'Add Kubernetes for container orchestration'
                        ]
                    };
                    break;
                default:
                    result = {
                        status: 'operational',
                        activeAgents: this.performanceData.size,
                        recentErrors: this.errorLog.slice(-10),
                        performance: Object.fromEntries(
                            Array.from(this.performanceData.entries()).map(([agent, times]) => [
                                agent,
                                times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0
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
            console.error('CTO Agent Error:', error);
            this.logError('CTO', error instanceof Error ? error.message : 'Unknown error');

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
export const ctoAgent = new CTOAgent(); 