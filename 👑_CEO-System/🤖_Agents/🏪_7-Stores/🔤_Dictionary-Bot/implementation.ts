import { NextRequest, NextResponse } from 'next/server';
import { AgentBase } from '@/lib/agents/agent-base';

interface TechTerm {
    term: string;
    definition: string;
    context: string;
    examples: string[];
    relatedTerms: string[];
}

export class DictionaryBotAgent extends AgentBase {
    private techDictionary: Map<string, TechTerm>;

    constructor() {
        super({
            name: 'Dictionary Bot',
            emoji: '🔤',
            priority: 4.5,
            costPerUse: 0.02
        });

        this.initializeDictionary();
    }

    private initializeDictionary() {
        this.techDictionary = new Map([
            ['react', {
                term: 'React',
                definition: 'A JavaScript library for building user interfaces, developed by Facebook',
                context: 'Frontend development',
                examples: ['React components', 'React hooks', 'React state management'],
                relatedTerms: ['JSX', 'Virtual DOM', 'Component lifecycle']
            }],
            ['kubernetes', {
                term: 'Kubernetes',
                definition: 'An open-source container orchestration platform for automating deployment, scaling, and management',
                context: 'DevOps/Infrastructure',
                examples: ['K8s clusters', 'Pod management', 'Service mesh'],
                relatedTerms: ['Docker', 'Containers', 'Microservices']
            }],
            ['ci/cd', {
                term: 'CI/CD',
                definition: 'Continuous Integration/Continuous Deployment - practices for automating software delivery',
                context: 'DevOps',
                examples: ['Jenkins pipelines', 'GitHub Actions', 'GitLab CI'],
                relatedTerms: ['DevOps', 'Automation', 'Pipeline']
            }]
        ]);
    }

    async process(request: NextRequest) {
        const { text, candidateProfile, companyContext } = await request.json();

        // Extract and explain technical terms
        const explanations = await this.explainTerms(text, candidateProfile);

        // Personalize explanations based on candidate background
        const personalizedExplanations = this.personalizeExplanations(
            explanations,
            candidateProfile,
            companyContext
        );

        return NextResponse.json({
            success: true,
            originalText: text,
            technicalTerms: explanations,
            personalizedExplanations,
            simplicityScore: this.calculateSimplicityScore(personalizedExplanations),
            recommendations: this.generateRecommendations(explanations, candidateProfile)
        });
    }

    private async explainTerms(text: string, profile: any): Promise<any[]> {
        const terms = this.extractTechnicalTerms(text);
        const explanations = [];

        for (const term of terms) {
            const explanation = this.techDictionary.get(term.toLowerCase()) ||
                await this.generateExplanation(term);

            explanations.push({
                term,
                explanation,
                complexity: this.assessComplexity(term),
                audienceLevel: this.determineAudienceLevel(profile)
            });
        }

        return explanations;
    }

    private extractTechnicalTerms(text: string): string[] {
        // Simple extraction - in production, use NLP
        const techPatterns = [
            /\b(?:API|SDK|CI\/CD|ML|AI|IoT|SaaS|PaaS|IaaS)\b/gi,
            /\b(?:React|Angular|Vue|Node\.js|Python|Java|Go)\b/gi,
            /\b(?:Docker|Kubernetes|AWS|Azure|GCP)\b/gi,
            /\b(?:Agile|Scrum|DevOps|Microservices)\b/gi
        ];

        const terms = new Set<string>();
        techPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) matches.forEach(match => terms.add(match));
        });

        return Array.from(terms);
    }

    private async generateExplanation(term: string): Promise<TechTerm> {
        // In production, use AI to generate explanations
        return {
            term,
            definition: `Technical term in software development`,
            context: 'Technology',
            examples: [`Using ${term} in production`],
            relatedTerms: []
        };
    }

    private personalizeExplanations(explanations: any[], profile: any, context: any): any[] {
        return explanations.map(exp => ({
            ...exp,
            personalizedDefinition: this.adaptToAudience(exp.explanation.definition, profile),
            relevanceToRole: this.assessRelevanceToRole(exp.term, context),
            learningResources: this.suggestLearningResources(exp.term, profile.experienceLevel)
        }));
    }

    private adaptToAudience(definition: string, profile: any): string {
        const level = profile.experienceLevel || 'intermediate';

        if (level === 'junior') {
            return `In simple terms: ${definition}. Think of it as...`;
        } else if (level === 'senior') {
            return definition; // Keep technical
        }

        return definition;
    }

    private assessComplexity(term: string): string {
        const complexTerms = ['Kubernetes', 'Microservices', 'ML/AI'];
        if (complexTerms.some(t => term.includes(t))) return 'high';
        return 'medium';
    }

    private determineAudienceLevel(profile: any): string {
        const years = profile.yearsOfExperience || 3;
        if (years < 2) return 'beginner';
        if (years < 5) return 'intermediate';
        return 'advanced';
    }

    private assessRelevanceToRole(term: string, context: any): string {
        // Check if term is relevant to the job
        if (context.jobDescription?.includes(term)) return 'critical';
        if (context.techStack?.includes(term)) return 'important';
        return 'nice-to-know';
    }

    private suggestLearningResources(term: string, level: string): string[] {
        const resources = {
            beginner: ['Official documentation', 'YouTube tutorials', 'Codecademy'],
            intermediate: ['Advanced tutorials', 'Best practices guides', 'Open source projects'],
            advanced: ['Architecture patterns', 'Performance optimization', 'Conference talks']
        };

        return resources[level as keyof typeof resources] || resources.intermediate;
    }

    private calculateSimplicityScore(explanations: any[]): number {
        // Score how simple and clear the explanations are
        const avgComplexity = explanations.reduce((acc, exp) => {
            return acc + (exp.complexity === 'high' ? 1 : exp.complexity === 'medium' ? 0.5 : 0);
        }, 0) / explanations.length;

        return Math.round((1 - avgComplexity) * 100);
    }

    private generateRecommendations(explanations: any[], profile: any): string[] {
        const recommendations = [];

        const highComplexityTerms = explanations.filter(e => e.complexity === 'high');
        if (highComplexityTerms.length > 3) {
            recommendations.push('Consider simplifying technical language for broader appeal');
        }

        if (profile.experienceLevel === 'junior' && highComplexityTerms.length > 0) {
            recommendations.push('Add analogies or real-world examples for complex concepts');
        }

        return recommendations;
    }
}

export async function POST(request: NextRequest) {
    const agent = new DictionaryBotAgent();
    return agent.process(request);
} 