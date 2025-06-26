// Database Schema for Smart Database Agent
// Defines the structure for candidates, companies, and data sources

export interface Candidate {
    id: string;
    personalInfo: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        location: {
            city: string;
            country: string;
            timezone?: string;
            remoteOk?: boolean;
        };
        profilePicture?: string;
    };

    professionalInfo: {
        currentTitle: string;
        yearsOfExperience: number;
        currentCompany?: string;
        previousCompanies: CompanyHistory[];
        skills: Skill[];
        education: Education[];
        certifications: Certification[];
    };

    sourceInfo: {
        primarySource: DataSource;
        additionalSources: DataSource[];
        firstContactDate: Date;
        lastUpdated: Date;
    };

    socialProfiles: {
        linkedin?: string;
        github?: string;
        twitter?: string;
        personalWebsite?: string;
        portfolio?: string;
    };

    recruitmentData: {
        status: CandidateStatus;
        matchScore: number;
        cultureFitScore?: number;
        technicalScore?: number;
        communicationScore?: number;
        notes: Note[];
        interactions: Interaction[];
        appliedPositions: string[]; // Position IDs
    };

    preferences: {
        desiredSalary?: {
            min: number;
            max: number;
            currency: string;
        };
        desiredRoles: string[];
        workType: 'remote' | 'hybrid' | 'onsite';
        availability: 'immediate' | 'weeks' | 'months';
        openToRelocation: boolean;
    };

    metadata: {
        tags: string[];
        customFields: Record<string, any>;
        aiInsights: AIInsight[];
        lastAnalyzed: Date;
    };
}

export interface Company {
    id: string;
    basicInfo: {
        name: string;
        website: string;
        industry: string[];
        size: CompanySize;
        founded: number;
        headquarters: {
            city: string;
            country: string;
        };
        offices?: Location[];
    };

    culture: {
        values: string[];
        workStyle: string;
        benefits: string[];
        techStack: string[];
        methodology: string[];
        diversity: DiversityMetrics;
    };

    hiringInfo: {
        activePositions: Position[];
        hiringManager: ContactPerson[];
        preferredSkills: string[];
        hiringProcess: HiringStep[];
        averageTimeToHire: number;
        salaryRanges: SalaryRange[];
    };

    requirements: {
        mustHaveSkills: string[];
        niceToHaveSkills: string[];
        experienceLevel: ExperienceLevel[];
        educationPreference: string;
        certificationRequirements: string[];
    };

    history: {
        previousHires: HireRecord[];
        successRate: number;
        retentionRate: number;
        feedbackScore: number;
    };

    integration: {
        atsSystem?: string;
        apiEndpoints?: APIEndpoint[];
        webhooks?: Webhook[];
        customIntegrations?: CustomIntegration[];
    };
}

export interface DataSource {
    type: 'linkedin' | 'github' | 'indeed' | 'angellist' | 'custom' | 'referral' | 'direct';
    url?: string;
    lastScraped?: Date;
    reliability: number; // 0-1
    dataPoints: string[]; // What data we got from this source
}

export interface Position {
    id: string;
    title: string;
    department: string;
    level: ExperienceLevel;
    description: string;
    requirements: string[];
    niceToHave: string[];
    salary?: SalaryRange;
    benefits: string[];
    status: 'open' | 'paused' | 'filled' | 'cancelled';
    urgency: 'low' | 'medium' | 'high' | 'critical';
    createdDate: Date;
    targetFillDate?: Date;
    assignedRecruiter?: string;
}

export interface Skill {
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    yearsOfExperience: number;
    verified: boolean;
    endorsements?: number;
    lastUsed?: Date;
    projects?: string[];
}

export interface Education {
    institution: string;
    degree: string;
    field: string;
    startDate: Date;
    endDate?: Date;
    gpa?: number;
    achievements?: string[];
}

export interface Certification {
    name: string;
    issuer: string;
    issueDate: Date;
    expiryDate?: Date;
    credentialId?: string;
    url?: string;
}

export interface CompanyHistory {
    companyName: string;
    position: string;
    startDate: Date;
    endDate?: Date;
    achievements: string[];
    technologies: string[];
    teamSize?: number;
}

export interface Note {
    id: string;
    author: string;
    content: string;
    timestamp: Date;
    type: 'general' | 'interview' | 'reference' | 'concern' | 'highlight';
    visibility: 'private' | 'team' | 'public';
}

export interface Interaction {
    id: string;
    type: 'email' | 'call' | 'interview' | 'message' | 'meeting';
    date: Date;
    duration?: number;
    participants: string[];
    outcome?: string;
    nextSteps?: string;
    sentiment: 'positive' | 'neutral' | 'negative';
}

export interface AIInsight {
    type: 'strength' | 'concern' | 'opportunity' | 'recommendation';
    content: string;
    confidence: number;
    generatedBy: string;
    timestamp: Date;
}

export interface HireRecord {
    candidateId: string;
    positionId: string;
    hireDate: Date;
    startDate: Date;
    endDate?: Date;
    performance?: number;
    stillEmployed: boolean;
}

export interface ContactPerson {
    name: string;
    title: string;
    email: string;
    phone?: string;
    linkedIn?: string;
    preferredContact: 'email' | 'phone' | 'linkedin';
}

export interface HiringStep {
    name: string;
    order: number;
    duration: string;
    description: string;
    eliminationRate?: number;
}

export interface SalaryRange {
    role: string;
    level: ExperienceLevel;
    min: number;
    max: number;
    currency: string;
    includesEquity: boolean;
}

export interface DiversityMetrics {
    genderRatio?: Record<string, number>;
    ethnicDiversity?: Record<string, number>;
    ageRange?: { min: number; max: number; average: number };
    internationalStaff?: number;
}

export interface APIEndpoint {
    name: string;
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    authentication: string;
    rateLimit?: number;
}

export interface Webhook {
    event: string;
    url: string;
    secret?: string;
    active: boolean;
}

export interface CustomIntegration {
    name: string;
    type: string;
    config: Record<string, any>;
}

export interface Location {
    city: string;
    country: string;
    address?: string;
    timezone: string;
}

export type CandidateStatus =
    | 'new'
    | 'screening'
    | 'interviewing'
    | 'reference_check'
    | 'offer_pending'
    | 'hired'
    | 'rejected'
    | 'withdrawn'
    | 'on_hold';

export type CompanySize =
    | 'startup' // 1-10
    | 'small' // 11-50
    | 'medium' // 51-200
    | 'large' // 201-1000
    | 'enterprise'; // 1000+

export type ExperienceLevel =
    | 'intern'
    | 'junior'
    | 'mid'
    | 'senior'
    | 'lead'
    | 'principal'
    | 'executive';

// Database Operations Interface
export interface DatabaseOperations {
    // Candidate operations
    createCandidate(candidate: Omit<Candidate, 'id'>): Promise<Candidate>;
    updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate>;
    getCandidate(id: string): Promise<Candidate | null>;
    searchCandidates(criteria: SearchCriteria): Promise<Candidate[]>;
    bulkImportCandidates(candidates: Omit<Candidate, 'id'>[]): Promise<ImportResult>;

    // Company operations
    createCompany(company: Omit<Company, 'id'>): Promise<Company>;
    updateCompany(id: string, updates: Partial<Company>): Promise<Company>;
    getCompany(id: string): Promise<Company | null>;
    searchCompanies(criteria: CompanySearchCriteria): Promise<Company[]>;

    // Position operations
    createPosition(companyId: string, position: Omit<Position, 'id'>): Promise<Position>;
    updatePosition(id: string, updates: Partial<Position>): Promise<Position>;
    matchCandidatesToPosition(positionId: string): Promise<CandidateMatch[]>;

    // Analytics operations
    getSourceEffectiveness(): Promise<SourceAnalytics>;
    getCandidatePipeline(): Promise<PipelineAnalytics>;
    getHiringMetrics(companyId?: string): Promise<HiringMetrics>;
}

export interface SearchCriteria {
    skills?: string[];
    location?: string;
    experience?: { min: number; max: number };
    availability?: string;
    status?: CandidateStatus[];
    tags?: string[];
    lastUpdated?: { after: Date };
    matchScore?: { min: number };
}

export interface CompanySearchCriteria {
    industry?: string[];
    size?: CompanySize[];
    location?: string;
    hiringActive?: boolean;
    techStack?: string[];
}

export interface CandidateMatch {
    candidate: Candidate;
    matchScore: number;
    matchReasons: string[];
    gaps: string[];
}

export interface ImportResult {
    success: number;
    failed: number;
    duplicates: number;
    errors: ImportError[];
}

export interface ImportError {
    row: number;
    field: string;
    error: string;
    data: any;
}

export interface SourceAnalytics {
    sourceBreakdown: Record<string, {
        total: number;
        quality: number;
        hireRate: number;
        avgTimeToHire: number;
    }>;
    trends: {
        improving: string[];
        declining: string[];
    };
    recommendations: string[];
}

export interface PipelineAnalytics {
    stages: Record<CandidateStatus, {
        count: number;
        avgDuration: number;
        conversionRate: number;
    }>;
    bottlenecks: string[];
    velocity: number;
}

export interface HiringMetrics {
    totalHires: number;
    avgTimeToHire: number;
    costPerHire: number;
    qualityOfHire: number;
    retentionRate: number;
    diversityMetrics: DiversityMetrics;
} 