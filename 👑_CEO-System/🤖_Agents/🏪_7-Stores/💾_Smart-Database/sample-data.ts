// Sample Data for Smart Database
// Example candidates and companies for testing and demonstration

import { Candidate, Company } from './database-schema';

export const sampleCandidates: Omit<Candidate, 'id'>[] = [
    {
        personalInfo: {
            firstName: 'Sarah',
            lastName: 'Chen',
            email: 'sarah.chen@email.com',
            phone: '+1-415-555-0123',
            location: {
                city: 'San Francisco',
                country: 'USA',
                timezone: 'PST',
                remoteOk: true
            },
            profilePicture: 'https://example.com/sarah-chen.jpg'
        },
        professionalInfo: {
            currentTitle: 'Senior Full Stack Engineer',
            yearsOfExperience: 7,
            currentCompany: 'TechCorp',
            previousCompanies: [
                {
                    companyName: 'StartupXYZ',
                    position: 'Full Stack Developer',
                    startDate: new Date('2019-03-01'),
                    endDate: new Date('2021-08-31'),
                    achievements: [
                        'Led migration to microservices architecture',
                        'Reduced API response time by 40%',
                        'Mentored 3 junior developers'
                    ],
                    technologies: ['React', 'Node.js', 'AWS', 'MongoDB'],
                    teamSize: 12
                }
            ],
            skills: [
                { name: 'JavaScript', level: 'expert', yearsOfExperience: 7, verified: true },
                { name: 'React', level: 'expert', yearsOfExperience: 5, verified: true },
                { name: 'Node.js', level: 'advanced', yearsOfExperience: 6, verified: true },
                { name: 'Python', level: 'intermediate', yearsOfExperience: 3, verified: false },
                { name: 'AWS', level: 'advanced', yearsOfExperience: 4, verified: true }
            ],
            education: [
                {
                    institution: 'UC Berkeley',
                    degree: 'BS',
                    field: 'Computer Science',
                    startDate: new Date('2013-09-01'),
                    endDate: new Date('2017-05-31'),
                    gpa: 3.8,
                    achievements: ['Dean\'s List', 'ACM Programming Competition Winner']
                }
            ],
            certifications: [
                {
                    name: 'AWS Certified Solutions Architect',
                    issuer: 'Amazon Web Services',
                    issueDate: new Date('2021-06-15'),
                    expiryDate: new Date('2024-06-15'),
                    credentialId: 'AWS-123456',
                    url: 'https://aws.amazon.com/verification/123456'
                }
            ]
        },
        sourceInfo: {
            primarySource: {
                type: 'linkedin',
                url: 'https://linkedin.com/in/sarahchen',
                lastScraped: new Date('2024-01-15'),
                reliability: 0.95,
                dataPoints: ['experience', 'education', 'skills', 'recommendations']
            },
            additionalSources: [
                {
                    type: 'github',
                    url: 'https://github.com/sarahchen',
                    lastScraped: new Date('2024-01-16'),
                    reliability: 0.9,
                    dataPoints: ['repositories', 'contributions', 'languages']
                }
            ],
            firstContactDate: new Date('2024-01-10'),
            lastUpdated: new Date('2024-01-16')
        },
        socialProfiles: {
            linkedin: 'https://linkedin.com/in/sarahchen',
            github: 'https://github.com/sarahchen',
            twitter: 'https://twitter.com/sarahchen_dev',
            personalWebsite: 'https://sarahchen.dev',
            portfolio: 'https://portfolio.sarahchen.dev'
        },
        recruitmentData: {
            status: 'interviewing',
            matchScore: 0.92,
            cultureFitScore: 0.88,
            technicalScore: 0.95,
            communicationScore: 0.90,
            notes: [
                {
                    id: 'note-1',
                    author: 'recruiter@company.com',
                    content: 'Strong technical background, excellent communication skills',
                    timestamp: new Date('2024-01-12'),
                    type: 'highlight',
                    visibility: 'team'
                }
            ],
            interactions: [
                {
                    id: 'int-1',
                    type: 'email',
                    date: new Date('2024-01-10'),
                    participants: ['recruiter@company.com', 'sarah.chen@email.com'],
                    outcome: 'Positive response, scheduled call',
                    sentiment: 'positive'
                }
            ],
            appliedPositions: ['pos-123', 'pos-456']
        },
        preferences: {
            desiredSalary: {
                min: 150000,
                max: 180000,
                currency: 'USD'
            },
            desiredRoles: ['Senior Engineer', 'Tech Lead', 'Staff Engineer'],
            workType: 'hybrid',
            availability: 'weeks',
            openToRelocation: false
        },
        metadata: {
            tags: ['full-stack', 'react-expert', 'aws-certified', 'senior'],
            customFields: {
                githubStars: 245,
                stackOverflowRep: 3420,
                blogPosts: 12
            },
            aiInsights: [
                {
                    type: 'strength',
                    content: 'Strong open source contributions indicate passion for coding',
                    confidence: 0.9,
                    generatedBy: 'profile-analyzer',
                    timestamp: new Date('2024-01-15')
                }
            ],
            lastAnalyzed: new Date('2024-01-15')
        }
    },
    {
        personalInfo: {
            firstName: 'David',
            lastName: 'Kumar',
            email: 'david.kumar@email.com',
            phone: '+1-650-555-0456',
            location: {
                city: 'Bangalore',
                country: 'India',
                timezone: 'IST',
                remoteOk: true
            }
        },
        professionalInfo: {
            currentTitle: 'Machine Learning Engineer',
            yearsOfExperience: 5,
            currentCompany: 'AI Innovations',
            previousCompanies: [
                {
                    companyName: 'DataTech Solutions',
                    position: 'Data Scientist',
                    startDate: new Date('2020-01-01'),
                    endDate: new Date('2022-12-31'),
                    achievements: [
                        'Built recommendation system serving 1M+ users',
                        'Improved model accuracy by 25%',
                        'Published 2 research papers'
                    ],
                    technologies: ['Python', 'TensorFlow', 'PyTorch', 'Kubernetes'],
                    teamSize: 8
                }
            ],
            skills: [
                { name: 'Python', level: 'expert', yearsOfExperience: 5, verified: true },
                { name: 'Machine Learning', level: 'advanced', yearsOfExperience: 5, verified: true },
                { name: 'TensorFlow', level: 'advanced', yearsOfExperience: 4, verified: true },
                { name: 'Deep Learning', level: 'advanced', yearsOfExperience: 3, verified: true }
            ],
            education: [
                {
                    institution: 'IIT Delhi',
                    degree: 'M.Tech',
                    field: 'Computer Science - ML Specialization',
                    startDate: new Date('2017-07-01'),
                    endDate: new Date('2019-06-30'),
                    gpa: 3.9
                }
            ],
            certifications: []
        },
        sourceInfo: {
            primarySource: {
                type: 'linkedin',
                url: 'https://linkedin.com/in/davidkumar',
                lastScraped: new Date('2024-01-14'),
                reliability: 0.92,
                dataPoints: ['experience', 'education', 'skills']
            },
            additionalSources: [],
            firstContactDate: new Date('2024-01-14'),
            lastUpdated: new Date('2024-01-14')
        },
        socialProfiles: {
            linkedin: 'https://linkedin.com/in/davidkumar',
            github: 'https://github.com/dkumar-ml'
        },
        recruitmentData: {
            status: 'new',
            matchScore: 0.88,
            notes: [],
            interactions: [],
            appliedPositions: []
        },
        preferences: {
            desiredSalary: {
                min: 120000,
                max: 150000,
                currency: 'USD'
            },
            desiredRoles: ['ML Engineer', 'Senior Data Scientist'],
            workType: 'remote',
            availability: 'immediate',
            openToRelocation: true
        },
        metadata: {
            tags: ['ml-engineer', 'python-expert', 'remote-ready'],
            customFields: {
                publications: 2,
                kaggleRank: 'Expert'
            },
            aiInsights: [],
            lastAnalyzed: new Date('2024-01-14')
        }
    },
    {
        personalInfo: {
            firstName: 'Emily',
            lastName: 'Rodriguez',
            email: 'emily.rodriguez@email.com',
            location: {
                city: 'Austin',
                country: 'USA',
                timezone: 'CST',
                remoteOk: false
            }
        },
        professionalInfo: {
            currentTitle: 'DevOps Lead',
            yearsOfExperience: 9,
            currentCompany: 'CloudScale Inc',
            previousCompanies: [],
            skills: [
                { name: 'Kubernetes', level: 'expert', yearsOfExperience: 6, verified: true },
                { name: 'Docker', level: 'expert', yearsOfExperience: 7, verified: true },
                { name: 'Terraform', level: 'expert', yearsOfExperience: 5, verified: true },
                { name: 'CI/CD', level: 'expert', yearsOfExperience: 8, verified: true }
            ],
            education: [
                {
                    institution: 'UT Austin',
                    degree: 'BS',
                    field: 'Computer Engineering',
                    startDate: new Date('2011-09-01'),
                    endDate: new Date('2015-05-31')
                }
            ],
            certifications: [
                {
                    name: 'Certified Kubernetes Administrator',
                    issuer: 'CNCF',
                    issueDate: new Date('2022-03-01'),
                    expiryDate: new Date('2025-03-01')
                }
            ]
        },
        sourceInfo: {
            primarySource: {
                type: 'referral',
                reliability: 1.0,
                dataPoints: ['all']
            },
            additionalSources: [],
            firstContactDate: new Date('2024-01-16'),
            lastUpdated: new Date('2024-01-16')
        },
        socialProfiles: {
            linkedin: 'https://linkedin.com/in/emilyrodriguez'
        },
        recruitmentData: {
            status: 'screening',
            matchScore: 0.94,
            notes: [],
            interactions: [],
            appliedPositions: ['pos-789']
        },
        preferences: {
            desiredSalary: {
                min: 170000,
                max: 200000,
                currency: 'USD'
            },
            desiredRoles: ['DevOps Manager', 'Infrastructure Lead'],
            workType: 'onsite',
            availability: 'months',
            openToRelocation: false
        },
        metadata: {
            tags: ['devops', 'kubernetes-expert', 'leadership'],
            customFields: {},
            aiInsights: [],
            lastAnalyzed: new Date('2024-01-16')
        }
    }
];

export const sampleCompanies: Omit<Company, 'id'>[] = [
    {
        basicInfo: {
            name: 'TechVentures Inc',
            website: 'https://techventures.com',
            industry: ['Software', 'AI/ML', 'Cloud Computing'],
            size: 'medium',
            founded: 2018,
            headquarters: {
                city: 'San Francisco',
                country: 'USA'
            },
            offices: [
                { city: 'New York', country: 'USA', timezone: 'EST' },
                { city: 'London', country: 'UK', timezone: 'GMT' },
                { city: 'Tel Aviv', country: 'Israel', timezone: 'IST' }
            ]
        },
        culture: {
            values: ['Innovation', 'Collaboration', 'Customer First', 'Continuous Learning'],
            workStyle: 'Hybrid - 3 days office, 2 days remote',
            benefits: [
                'Comprehensive health insurance',
                'Unlimited PTO',
                'Stock options',
                'Learning budget $2000/year',
                'Home office stipend',
                'Parental leave 16 weeks'
            ],
            techStack: ['React', 'Node.js', 'Python', 'AWS', 'Kubernetes', 'PostgreSQL'],
            methodology: ['Agile', 'Scrum', 'CI/CD', 'Test-Driven Development'],
            diversity: {
                genderRatio: { male: 0.6, female: 0.35, other: 0.05 },
                internationalStaff: 0.4
            }
        },
        hiringInfo: {
            activePositions: [
                {
                    id: 'pos-123',
                    title: 'Senior Full Stack Engineer',
                    department: 'Engineering',
                    level: 'senior',
                    description: 'Looking for experienced full stack engineer to lead new product development',
                    requirements: [
                        '5+ years full stack experience',
                        'Expert in React and Node.js',
                        'Experience with AWS',
                        'Strong communication skills'
                    ],
                    niceToHave: [
                        'Experience with ML/AI',
                        'Open source contributions',
                        'Startup experience'
                    ],
                    salary: {
                        role: 'Senior Full Stack Engineer',
                        level: 'senior',
                        min: 140000,
                        max: 180000,
                        currency: 'USD',
                        includesEquity: true
                    },
                    benefits: ['Health', 'Dental', 'Vision', 'Stock Options'],
                    status: 'open',
                    urgency: 'high',
                    createdDate: new Date('2024-01-01'),
                    targetFillDate: new Date('2024-02-15')
                }
            ],
            hiringManager: [
                {
                    name: 'John Smith',
                    title: 'VP of Engineering',
                    email: 'john.smith@techventures.com',
                    linkedIn: 'https://linkedin.com/in/johnsmith',
                    preferredContact: 'email'
                }
            ],
            preferredSkills: ['React', 'Node.js', 'AWS', 'Python', 'Kubernetes'],
            hiringProcess: [
                { name: 'Initial Screen', order: 1, duration: '30 min', description: 'Phone screen with recruiter' },
                { name: 'Technical Screen', order: 2, duration: '1 hour', description: 'Coding challenge with engineer' },
                { name: 'Onsite Interview', order: 3, duration: '4 hours', description: 'System design, coding, behavioral' },
                { name: 'Final Interview', order: 4, duration: '1 hour', description: 'Culture fit with leadership' }
            ],
            averageTimeToHire: 28,
            salaryRanges: [
                {
                    role: 'Junior Engineer',
                    level: 'junior',
                    min: 80000,
                    max: 110000,
                    currency: 'USD',
                    includesEquity: true
                },
                {
                    role: 'Senior Engineer',
                    level: 'senior',
                    min: 140000,
                    max: 180000,
                    currency: 'USD',
                    includesEquity: true
                }
            ]
        },
        requirements: {
            mustHaveSkills: ['JavaScript', 'React or Vue', 'RESTful APIs'],
            niceToHaveSkills: ['TypeScript', 'GraphQL', 'Docker'],
            experienceLevel: ['mid', 'senior', 'lead'],
            educationPreference: 'Bachelor\'s in CS or equivalent experience',
            certificationRequirements: []
        },
        history: {
            previousHires: [
                {
                    candidateId: 'cand-001',
                    positionId: 'pos-100',
                    hireDate: new Date('2023-06-01'),
                    startDate: new Date('2023-07-01'),
                    performance: 4.5,
                    stillEmployed: true
                }
            ],
            successRate: 0.85,
            retentionRate: 0.90,
            feedbackScore: 4.3
        },
        integration: {
            atsSystem: 'Greenhouse',
            apiEndpoints: [
                {
                    name: 'Candidate Submission',
                    url: 'https://api.techventures.com/candidates',
                    method: 'POST',
                    authentication: 'Bearer Token',
                    rateLimit: 100
                }
            ]
        }
    },
    {
        basicInfo: {
            name: 'AI Innovations Corp',
            website: 'https://aiinnovations.ai',
            industry: ['Artificial Intelligence', 'Machine Learning', 'Data Science'],
            size: 'small',
            founded: 2020,
            headquarters: {
                city: 'Boston',
                country: 'USA'
            }
        },
        culture: {
            values: ['Research First', 'Ethical AI', 'Open Source', 'Diversity'],
            workStyle: 'Fully Remote',
            benefits: [
                'Top-tier health coverage',
                'Conference attendance budget',
                'Publication bonuses',
                'Sabbatical after 3 years'
            ],
            techStack: ['Python', 'TensorFlow', 'PyTorch', 'Kubernetes', 'GCP'],
            methodology: ['Research-driven', 'Peer Review', 'Open Source'],
            diversity: {
                genderRatio: { male: 0.5, female: 0.45, other: 0.05 },
                internationalStaff: 0.6
            }
        },
        hiringInfo: {
            activePositions: [
                {
                    id: 'pos-456',
                    title: 'Machine Learning Engineer',
                    department: 'Research',
                    level: 'mid',
                    description: 'Join our team working on cutting-edge NLP models',
                    requirements: [
                        '3+ years ML experience',
                        'Published research papers',
                        'Strong Python skills',
                        'Experience with transformers'
                    ],
                    niceToHave: ['PhD in ML/AI', 'Open source ML contributions'],
                    status: 'open',
                    urgency: 'medium',
                    createdDate: new Date('2024-01-05')
                }
            ],
            hiringManager: [],
            preferredSkills: ['Deep Learning', 'NLP', 'Computer Vision', 'Python'],
            hiringProcess: [
                { name: 'Initial Chat', order: 1, duration: '45 min', description: 'Research discussion' },
                { name: 'Technical Deep Dive', order: 2, duration: '2 hours', description: 'ML concepts and coding' },
                { name: 'Research Presentation', order: 3, duration: '1 hour', description: 'Present past work' }
            ],
            averageTimeToHire: 35,
            salaryRanges: []
        },
        requirements: {
            mustHaveSkills: ['Python', 'Machine Learning', 'Deep Learning'],
            niceToHaveSkills: ['Research Publications', 'CUDA Programming'],
            experienceLevel: ['mid', 'senior', 'principal'],
            educationPreference: 'MS or PhD in ML/AI preferred',
            certificationRequirements: []
        },
        history: {
            previousHires: [],
            successRate: 0.8,
            retentionRate: 0.95,
            feedbackScore: 4.6
        },
        integration: {}
    },
    {
        basicInfo: {
            name: 'CloudScale Inc',
            website: 'https://cloudscale.io',
            industry: ['Cloud Infrastructure', 'DevOps', 'Platform Engineering'],
            size: 'large',
            founded: 2015,
            headquarters: {
                city: 'Seattle',
                country: 'USA'
            },
            offices: [
                { city: 'Austin', country: 'USA', timezone: 'CST' },
                { city: 'Dublin', country: 'Ireland', timezone: 'GMT' }
            ]
        },
        culture: {
            values: ['Reliability', 'Scale', 'Developer Experience', 'Innovation'],
            workStyle: 'Flexible - Remote or Office',
            benefits: [
                'Premium health plans',
                'RSUs',
                '401k matching',
                'On-site gym',
                'Catered meals'
            ],
            techStack: ['Kubernetes', 'Go', 'Terraform', 'AWS', 'GCP', 'Prometheus'],
            methodology: ['DevOps', 'SRE', 'Infrastructure as Code'],
            diversity: {
                genderRatio: { male: 0.7, female: 0.25, other: 0.05 },
                internationalStaff: 0.3
            }
        },
        hiringInfo: {
            activePositions: [
                {
                    id: 'pos-789',
                    title: 'Senior DevOps Engineer',
                    department: 'Infrastructure',
                    level: 'senior',
                    description: 'Help us scale our platform to millions of users',
                    requirements: [
                        '7+ years DevOps experience',
                        'Expert in Kubernetes',
                        'Infrastructure as Code',
                        'Cloud architecture (AWS/GCP)'
                    ],
                    niceToHave: ['Go programming', 'Service mesh experience'],
                    salary: {
                        role: 'Senior DevOps Engineer',
                        level: 'senior',
                        min: 160000,
                        max: 200000,
                        currency: 'USD',
                        includesEquity: true
                    },
                    benefits: ['Health', 'RSUs', '401k', 'Gym'],
                    status: 'open',
                    urgency: 'critical',
                    createdDate: new Date('2023-12-15'),
                    targetFillDate: new Date('2024-01-31')
                }
            ],
            hiringManager: [
                {
                    name: 'Sarah Johnson',
                    title: 'Director of Infrastructure',
                    email: 'sarah.j@cloudscale.io',
                    preferredContact: 'email'
                }
            ],
            preferredSkills: ['Kubernetes', 'Terraform', 'Go', 'AWS', 'Monitoring'],
            hiringProcess: [
                { name: 'Recruiter Screen', order: 1, duration: '30 min', description: 'Initial fit assessment' },
                { name: 'Technical Phone', order: 2, duration: '1 hour', description: 'Infrastructure design' },
                { name: 'Take-home', order: 3, duration: '4 hours', description: 'Infrastructure challenge' },
                { name: 'Virtual Onsite', order: 4, duration: '5 hours', description: 'Multiple technical rounds' }
            ],
            averageTimeToHire: 21,
            salaryRanges: []
        },
        requirements: {
            mustHaveSkills: ['Kubernetes', 'Cloud Platforms', 'IaC', 'CI/CD'],
            niceToHaveSkills: ['Go', 'Service Mesh', 'Observability'],
            experienceLevel: ['senior', 'lead', 'principal'],
            educationPreference: 'BS in CS or equivalent experience',
            certificationRequirements: ['CKA preferred']
        },
        history: {
            previousHires: [],
            successRate: 0.9,
            retentionRate: 0.88,
            feedbackScore: 4.4
        },
        integration: {
            atsSystem: 'Lever'
        }
    }
];

// Helper functions for data generation
export function generateMockCandidate(overrides?: Partial<Candidate>): Omit<Candidate, 'id'> {
    const baseCandidate = sampleCandidates[0];
    return {
        ...baseCandidate,
        ...overrides,
        personalInfo: {
            ...baseCandidate.personalInfo,
            ...overrides?.personalInfo
        },
        professionalInfo: {
            ...baseCandidate.professionalInfo,
            ...overrides?.professionalInfo
        }
    };
}

export function generateMockCompany(overrides?: Partial<Company>): Omit<Company, 'id'> {
    const baseCompany = sampleCompanies[0];
    return {
        ...baseCompany,
        ...overrides,
        basicInfo: {
            ...baseCompany.basicInfo,
            ...overrides?.basicInfo
        }
    };
}

// Search helpers
export function searchCandidatesBySkills(skills: string[]): Omit<Candidate, 'id'>[] {
    return sampleCandidates.filter(candidate =>
        skills.some(skill =>
            candidate.professionalInfo.skills.some(s =>
                s.name.toLowerCase().includes(skill.toLowerCase())
            )
        )
    );
}

export function searchCompaniesByIndustry(industries: string[]): Omit<Company, 'id'>[] {
    return sampleCompanies.filter(company =>
        industries.some(industry =>
            company.basicInfo.industry.some(i =>
                i.toLowerCase().includes(industry.toLowerCase())
            )
        )
    );
}

// Data export for testing
export const mockDatabase = {
    candidates: sampleCandidates,
    companies: sampleCompanies,
    totalCandidates: sampleCandidates.length,
    totalCompanies: sampleCompanies.length,

    // Statistics
    stats: {
        candidatesByStatus: {
            new: sampleCandidates.filter(c => c.recruitmentData.status === 'new').length,
            screening: sampleCandidates.filter(c => c.recruitmentData.status === 'screening').length,
            interviewing: sampleCandidates.filter(c => c.recruitmentData.status === 'interviewing').length
        },
        averageMatchScore: sampleCandidates.reduce((sum, c) => sum + c.recruitmentData.matchScore, 0) / sampleCandidates.length,
        topSkills: ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Kubernetes'],
        locations: ['San Francisco', 'Bangalore', 'Austin', 'New York', 'London']
    }
}; 