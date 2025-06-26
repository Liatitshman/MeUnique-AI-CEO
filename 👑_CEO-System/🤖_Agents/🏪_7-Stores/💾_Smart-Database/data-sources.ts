// Data Sources Configuration and Integration
// Manages connections to various recruitment platforms and data sources

import { DataSource } from './database-schema';

export interface SourceConfig {
    name: string;
    type: DataSource['type'];
    enabled: boolean;
    apiKey?: string;
    credentials?: {
        username?: string;
        password?: string;
        clientId?: string;
        clientSecret?: string;
    };
    rateLimit: {
        requests: number;
        period: 'second' | 'minute' | 'hour' | 'day';
    };
    dataMapping: DataFieldMapping;
    searchCapabilities: SearchCapability[];
    syncSchedule?: SyncSchedule;
}

export interface DataFieldMapping {
    candidateFields: Record<string, string>; // Our field -> Source field
    companyFields: Record<string, string>;
    customTransformers?: Record<string, (value: any) => any>;
}

export interface SearchCapability {
    type: 'boolean' | 'keyword' | 'location' | 'experience' | 'skills';
    supported: boolean;
    limitations?: string[];
}

export interface SyncSchedule {
    frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
    lastSync?: Date;
    nextSync?: Date;
}

// LinkedIn Integration
export const linkedInSource: SourceConfig = {
    name: 'LinkedIn Recruiter',
    type: 'linkedin',
    enabled: true,
    rateLimit: {
        requests: 100,
        period: 'hour'
    },
    dataMapping: {
        candidateFields: {
            'personalInfo.firstName': 'firstName',
            'personalInfo.lastName': 'lastName',
            'personalInfo.email': 'emailAddress',
            'personalInfo.location.city': 'location.city',
            'personalInfo.location.country': 'location.country',
            'professionalInfo.currentTitle': 'headline',
            'professionalInfo.yearsOfExperience': 'yearsOfExperience',
            'professionalInfo.currentCompany': 'currentCompany.name',
            'socialProfiles.linkedin': 'publicProfileUrl',
            'professionalInfo.skills': 'skills',
            'professionalInfo.education': 'educations'
        },
        companyFields: {
            'basicInfo.name': 'name',
            'basicInfo.website': 'websiteUrl',
            'basicInfo.industry': 'industries',
            'basicInfo.size': 'staffCountRange',
            'basicInfo.headquarters.city': 'headquarters.city',
            'basicInfo.headquarters.country': 'headquarters.country'
        },
        customTransformers: {
            'professionalInfo.skills': (skills: any[]) =>
                skills.map(s => ({ name: s.name, level: 'intermediate', verified: true })),
            'basicInfo.size': (range: string) => {
                const sizes: Record<string, string> = {
                    '1-10': 'startup',
                    '11-50': 'small',
                    '51-200': 'medium',
                    '201-1000': 'large',
                    '1001+': 'enterprise'
                };
                return sizes[range] || 'medium';
            }
        }
    },
    searchCapabilities: [
        { type: 'boolean', supported: true },
        { type: 'keyword', supported: true },
        { type: 'location', supported: true },
        { type: 'experience', supported: true },
        { type: 'skills', supported: true }
    ],
    syncSchedule: {
        frequency: 'daily'
    }
};

// GitHub Integration
export const githubSource: SourceConfig = {
    name: 'GitHub',
    type: 'github',
    enabled: true,
    rateLimit: {
        requests: 5000,
        period: 'hour'
    },
    dataMapping: {
        candidateFields: {
            'personalInfo.firstName': 'name.split(" ")[0]',
            'personalInfo.lastName': 'name.split(" ")[1]',
            'personalInfo.email': 'email',
            'personalInfo.location.city': 'location',
            'socialProfiles.github': 'html_url',
            'personalInfo.profilePicture': 'avatar_url',
            'professionalInfo.currentCompany': 'company',
            'metadata.customFields.bio': 'bio',
            'metadata.customFields.followers': 'followers',
            'metadata.customFields.publicRepos': 'public_repos',
            'metadata.customFields.contributions': 'contributions'
        },
        companyFields: {
            'basicInfo.name': 'name',
            'basicInfo.website': 'blog',
            'metadata.customFields.repos': 'public_repos',
            'metadata.customFields.members': 'members_count'
        },
        customTransformers: {
            'professionalInfo.skills': (repos: any[]) => {
                // Extract skills from repository languages
                const skills = new Set<string>();
                repos.forEach(repo => {
                    if (repo.language) skills.add(repo.language);
                });
                return Array.from(skills).map(skill => ({
                    name: skill,
                    level: 'intermediate',
                    verified: true
                }));
            }
        }
    },
    searchCapabilities: [
        { type: 'keyword', supported: true },
        { type: 'location', supported: true },
        { type: 'skills', supported: true, limitations: ['Language-based only'] }
    ],
    syncSchedule: {
        frequency: 'realtime'
    }
};

// Indeed Integration
export const indeedSource: SourceConfig = {
    name: 'Indeed',
    type: 'indeed',
    enabled: true,
    rateLimit: {
        requests: 1000,
        period: 'day'
    },
    dataMapping: {
        candidateFields: {
            'personalInfo.firstName': 'name.first',
            'personalInfo.lastName': 'name.last',
            'personalInfo.email': 'contact.email',
            'personalInfo.phone': 'contact.phone',
            'personalInfo.location.city': 'location.city',
            'personalInfo.location.country': 'location.country',
            'professionalInfo.currentTitle': 'currentJobTitle',
            'professionalInfo.yearsOfExperience': 'totalExperience',
            'metadata.customFields.resumeUrl': 'resumeUrl'
        },
        companyFields: {
            'basicInfo.name': 'companyName',
            'basicInfo.industry': 'industry',
            'hiringInfo.activePositions': 'openJobs'
        }
    },
    searchCapabilities: [
        { type: 'keyword', supported: true },
        { type: 'location', supported: true },
        { type: 'experience', supported: true }
    ],
    syncSchedule: {
        frequency: 'daily'
    }
};

// AngelList Integration
export const angelListSource: SourceConfig = {
    name: 'AngelList',
    type: 'angellist',
    enabled: true,
    rateLimit: {
        requests: 500,
        period: 'hour'
    },
    dataMapping: {
        candidateFields: {
            'personalInfo.firstName': 'user.name.split(" ")[0]',
            'personalInfo.lastName': 'user.name.split(" ")[1]',
            'personalInfo.email': 'user.email',
            'personalInfo.location.city': 'user.location.name',
            'professionalInfo.currentTitle': 'user.headline',
            'socialProfiles.twitter': 'user.twitter_url',
            'socialProfiles.personalWebsite': 'user.website_url',
            'metadata.customFields.angelListProfile': 'user.angellist_url',
            'preferences.desiredRoles': 'user.roles',
            'metadata.tags': 'user.skills'
        },
        companyFields: {
            'basicInfo.name': 'startup.name',
            'basicInfo.website': 'startup.company_url',
            'basicInfo.size': 'startup.company_size',
            'culture.values': 'startup.markets',
            'metadata.customFields.funding': 'startup.total_raised'
        }
    },
    searchCapabilities: [
        { type: 'keyword', supported: true },
        { type: 'location', supported: true },
        { type: 'skills', supported: true }
    ],
    syncSchedule: {
        frequency: 'weekly'
    }
};

// Source Manager Class
export class SourceManager {
    private sources: Map<string, SourceConfig> = new Map();
    private connectionStatus: Map<string, ConnectionStatus> = new Map();

    constructor() {
        // Initialize default sources
        this.sources.set('linkedin', linkedInSource);
        this.sources.set('github', githubSource);
        this.sources.set('indeed', indeedSource);
        this.sources.set('angellist', angelListSource);
    }

    async connectSource(sourceType: string, credentials?: any): Promise<boolean> {
        const source = this.sources.get(sourceType);
        if (!source) return false;

        try {
            // Test connection
            const isConnected = await this.testConnection(source, credentials);

            this.connectionStatus.set(sourceType, {
                connected: isConnected,
                lastChecked: new Date(),
                error: isConnected ? undefined : 'Connection failed'
            });

            return isConnected;
        } catch (error) {
            this.connectionStatus.set(sourceType, {
                connected: false,
                lastChecked: new Date(),
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            return false;
        }
    }

    private async testConnection(source: SourceConfig, credentials?: any): Promise<boolean> {
        // Implement actual connection testing logic
        // This would make a test API call to verify credentials
        return true; // Placeholder
    }

    async searchCandidates(
        query: string,
        sources: string[] = ['all'],
        options?: SearchOptions
    ): Promise<SearchResult[]> {
        const results: SearchResult[] = [];
        const activeSources = sources[0] === 'all'
            ? Array.from(this.sources.keys())
            : sources;

        for (const sourceType of activeSources) {
            const source = this.sources.get(sourceType);
            if (!source || !source.enabled) continue;

            try {
                const sourceResults = await this.searchInSource(source, query, options);
                results.push(...sourceResults);
            } catch (error) {
                console.error(`Search failed for ${sourceType}:`, error);
            }
        }

        return this.deduplicateResults(results);
    }

    private async searchInSource(
        source: SourceConfig,
        query: string,
        options?: SearchOptions
    ): Promise<SearchResult[]> {
        // Implement actual search logic for each source
        // This would call the appropriate API
        return []; // Placeholder
    }

    private deduplicateResults(results: SearchResult[]): SearchResult[] {
        const seen = new Map<string, SearchResult>();

        for (const result of results) {
            const key = `${result.email || result.name}`;
            const existing = seen.get(key);

            if (!existing || result.confidence > existing.confidence) {
                seen.set(key, result);
            }
        }

        return Array.from(seen.values());
    }

    getSourceRecommendations(
        targetRole: string,
        requirements: string[]
    ): SourceRecommendation[] {
        const recommendations: SourceRecommendation[] = [];

        // LinkedIn - Best for professional profiles
        if (requirements.some(r => r.includes('experience') || r.includes('professional'))) {
            recommendations.push({
                source: 'linkedin',
                reason: 'Best for finding experienced professionals with verified work history',
                confidence: 0.9
            });
        }

        // GitHub - Best for technical roles
        if (requirements.some(r => r.includes('developer') || r.includes('engineer'))) {
            recommendations.push({
                source: 'github',
                reason: 'Ideal for evaluating technical skills through code contributions',
                confidence: 0.95
            });
        }

        // AngelList - Best for startup roles
        if (targetRole.includes('startup') || requirements.some(r => r.includes('equity'))) {
            recommendations.push({
                source: 'angellist',
                reason: 'Perfect for candidates interested in startup environment',
                confidence: 0.85
            });
        }

        // Indeed - Best for volume
        recommendations.push({
            source: 'indeed',
            reason: 'Large candidate pool for broader reach',
            confidence: 0.7
        });

        return recommendations.sort((a, b) => b.confidence - a.confidence);
    }

    async syncSource(sourceType: string): Promise<SyncResult> {
        const source = this.sources.get(sourceType);
        if (!source) {
            return { success: false, error: 'Source not found' };
        }

        try {
            // Implement sync logic
            const startTime = Date.now();

            // Fetch updates since last sync
            const lastSync = source.syncSchedule?.lastSync || new Date(0);
            const updates = await this.fetchUpdates(source, lastSync);

            // Process updates
            const processed = await this.processUpdates(source, updates);

            // Update sync schedule
            if (source.syncSchedule) {
                source.syncSchedule.lastSync = new Date();
                source.syncSchedule.nextSync = this.calculateNextSync(source.syncSchedule.frequency);
            }

            return {
                success: true,
                duration: Date.now() - startTime,
                recordsProcessed: processed.count,
                errors: processed.errors
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Sync failed'
            };
        }
    }

    private async fetchUpdates(source: SourceConfig, since: Date): Promise<any[]> {
        // Implement fetching logic
        return [];
    }

    private async processUpdates(source: SourceConfig, updates: any[]): Promise<ProcessResult> {
        // Implement processing logic
        return { count: 0, errors: [] };
    }

    private calculateNextSync(frequency: SyncSchedule['frequency']): Date {
        const now = new Date();
        switch (frequency) {
            case 'realtime':
                return new Date(now.getTime() + 60 * 1000); // 1 minute
            case 'hourly':
                return new Date(now.getTime() + 60 * 60 * 1000);
            case 'daily':
                return new Date(now.getTime() + 24 * 60 * 60 * 1000);
            case 'weekly':
                return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        }
    }
}

// Type definitions
interface ConnectionStatus {
    connected: boolean;
    lastChecked: Date;
    error?: string;
}

interface SearchOptions {
    limit?: number;
    offset?: number;
    filters?: Record<string, any>;
    sortBy?: string;
}

interface SearchResult {
    source: string;
    name: string;
    email?: string;
    profileUrl: string;
    matchScore: number;
    confidence: number;
    data: any;
}

interface SourceRecommendation {
    source: string;
    reason: string;
    confidence: number;
}

interface SyncResult {
    success: boolean;
    duration?: number;
    recordsProcessed?: number;
    errors?: string[];
    error?: string;
}

interface ProcessResult {
    count: number;
    errors: string[];
}

// Export singleton instance
export const sourceManager = new SourceManager(); 