// Agent System Types

export interface Agent {
    id: string;
    name: string;
    description: string;
    capabilities: string[];
    dependencies: string[];
    priority: number;
}

export interface AgentConfig {
    id: string;
    name: string;
    endpoint?: string;
    settings?: Record<string, any>;
}

export interface AgentResponse {
    success: boolean;
    data?: any;
    error?: string;
    metadata?: {
        processingTime?: number;
        cost?: number;
        tokensUsed?: number;
    };
}

export interface AgentMessage {
    from: string;
    to: string | string[];
    type: 'request' | 'response' | 'notification' | 'error';
    priority: 'high' | 'medium' | 'low';
    timestamp: Date;
    data: any;
    context: {
        jobId?: string;
        candidateId?: string;
        stage?: 'sourcing' | 'screening' | 'outreach' | 'interview' | 'offer';
        costTracking?: {
            apiCalls?: number;
            tokensUsed?: number;
            estimatedCost?: number;
        };
    };
}

export interface JobProfile {
    id: string;
    title: string;
    company: string;
    requirements: {
        technical: string[];
        experience: number;
        education?: string;
    };
    culture?: {
        values: string[];
        workStyle: string;
    };
}

export interface CandidateProfile {
    id: string;
    name: string;
    email?: string;
    linkedinUrl?: string;
    skills: string[];
    experience: number;
    matchScore?: number;
    cultureFit?: number;
}

export interface TeamMatchResult {
    candidateId: string;
    teamFit: number;
    culturalAlignment: number;
    technicalMatch: number;
    recommendations: string[];
} 