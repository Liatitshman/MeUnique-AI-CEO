'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, ShoppingCart, Heart, Star, Zap, Brain,
    MessageSquare, Users, Target, Shield, Database, Search,
    TrendingUp, Award, CheckCircle, Clock, DollarSign,
    Sparkles, Bot, BarChart3, Send, Plus, Settings
} from 'lucide-react';
import { SmartInsights, SmartActions, CostCalculator } from '@/components/SmartFeatures';

// Store data (in production, this would come from API)
const storesData = {
    'smart-database': {
        name: 'Smart Database',
        tagline: 'The Brain of the System',
        icon: Database,
        color: 'primary',
        description: 'Advanced AI-powered database that organizes and manages all your recruitment data with intelligent tagging, real-time sync, and pattern recognition.',
        features: [
            'Real-time data synchronization across all agents',
            'AI-powered auto-tagging and categorization',
            'Smart search with natural language queries',
            'Automated data quality checks',
            'Integration with 15+ data sources'
        ],
        services: [
            {
                id: 'basic-sync',
                name: 'Basic Data Sync',
                description: 'Real-time synchronization for up to 1,000 records',
                price: 0,
                features: ['Auto-sync', 'Basic tagging', 'Search'],
                action: 'Start Syncing'
            },
            {
                id: 'advanced-mapping',
                name: 'Advanced Data Mapping',
                description: 'AI-powered relationship mapping and insights',
                price: 0.10,
                features: ['Relationship graphs', 'Pattern detection', 'Predictive analytics'],
                action: 'Map My Data'
            },
            {
                id: 'enterprise-scale',
                name: 'Enterprise Scale',
                description: 'Unlimited records with advanced features',
                price: 0.25,
                features: ['Unlimited storage', 'Custom schemas', 'API access', 'Priority support'],
                action: 'Scale Up'
            }
        ]
    },
    'auto-recruiter': {
        name: 'Auto Recruiter',
        tagline: '24/7 Talent Hunter',
        icon: Zap,
        color: 'warm',
        description: 'Your tireless recruitment assistant that searches, screens, and engages candidates automatically across multiple platforms.',
        features: [
            'Multi-platform candidate search (LinkedIn, GitHub, Twitter, etc.)',
            'Automated screening based on your criteria',
            'Personalized outreach at scale',
            'Response tracking and follow-ups',
            'Cost-optimized sourcing strategies'
        ],
        services: [
            {
                id: 'quick-search',
                name: 'Quick Search',
                description: 'Find 50 candidates matching your criteria',
                price: 0.05,
                features: ['Basic search', 'LinkedIn only', 'Standard messages'],
                action: 'Start Searching'
            },
            {
                id: 'deep-hunt',
                name: 'Deep Hunt',
                description: 'Advanced search across all platforms',
                price: 0.15,
                features: ['7 platforms', 'Boolean search', 'Custom messages', 'Auto-follow-up'],
                action: 'Launch Deep Hunt'
            },
            {
                id: 'auto-pilot',
                name: 'Full Auto-Pilot',
                description: 'Complete automation from search to scheduling',
                price: 0.30,
                features: ['Unlimited searches', 'AI screening', 'Calendar integration', 'CRM sync'],
                action: 'Activate Auto-Pilot'
            }
        ]
    },
    'culture-matcher': {
        name: 'Culture Matcher',
        tagline: 'Perfect Fit Finder',
        icon: Target,
        color: 'secondary',
        description: 'Advanced AI that analyzes cultural fit between candidates and companies, predicting long-term success and retention.',
        features: [
            'Deep culture analysis using 50+ factors',
            'Personality and values assessment',
            'Team dynamics prediction',
            'Retention probability scoring',
            'Custom culture mapping for your company'
        ],
        services: [
            {
                id: 'quick-match',
                name: 'Quick Match Score',
                description: 'Basic culture fit assessment',
                price: 0.10,
                features: ['Basic scoring', '10 factors', 'Match percentage'],
                action: 'Get Match Score'
            },
            {
                id: 'deep-analysis',
                name: 'Deep Culture Analysis',
                description: 'Comprehensive fit assessment with insights',
                price: 0.20,
                features: ['50+ factors', 'Team fit', 'Growth potential', 'Risk analysis'],
                action: 'Analyze Culture Fit'
            },
            {
                id: 'team-optimizer',
                name: 'Team Optimization',
                description: 'Build perfectly balanced teams',
                price: 0.35,
                features: ['Team dynamics', 'Skill gaps', 'Personality balance', 'Success prediction'],
                action: 'Optimize My Team'
            }
        ]
    },
    'message-crafter': {
        name: 'Message Crafter',
        tagline: 'Words That Work',
        icon: MessageSquare,
        color: 'accent',
        description: 'AI-powered message creation that achieves 45%+ response rates through hyper-personalization and continuous optimization.',
        features: [
            'Hyper-personalized messaging based on profile analysis',
            'A/B testing with automatic winner selection',
            'Multi-language support (Hebrew, English, etc.)',
            'Tone and style adaptation',
            'Response prediction and optimization'
        ],
        services: [
            {
                id: 'single-message',
                name: 'Single Message',
                description: 'Craft one perfect message',
                price: 0.05,
                features: ['Personalization', 'Basic tone', 'One language'],
                action: 'Craft Message'
            },
            {
                id: 'campaign-pack',
                name: 'Campaign Pack',
                description: 'Complete outreach campaign',
                price: 0.20,
                features: ['50 messages', 'A/B testing', 'Follow-ups', 'Analytics'],
                action: 'Create Campaign'
            },
            {
                id: 'response-optimizer',
                name: 'Response Optimizer',
                description: 'AI learns and improves from responses',
                price: 0.30,
                features: ['Continuous learning', 'Auto-optimization', 'Sentiment analysis', 'Smart timing'],
                action: 'Optimize Responses'
            }
        ]
    },
    'profile-analyzer': {
        name: 'Profile Analyzer',
        tagline: 'Deep Dive Detective',
        icon: Brain,
        color: 'cool',
        description: 'Advanced AI that analyzes candidate profiles to uncover hidden potential, risks, and insights beyond the resume.',
        features: [
            'Skills gap analysis and validation',
            'Experience trajectory mapping',
            'Hidden potential discovery',
            'Risk and red flag detection',
            'Growth trajectory prediction'
        ],
        services: [
            {
                id: 'quick-scan',
                name: 'Quick Profile Scan',
                description: 'Basic profile analysis',
                price: 0.05,
                features: ['Skills check', 'Experience summary', 'Basic insights'],
                action: 'Scan Profile'
            },
            {
                id: 'deep-dive',
                name: 'Deep Dive Analysis',
                description: 'Comprehensive profile investigation',
                price: 0.15,
                features: ['50+ data points', 'Risk assessment', 'Potential score', 'Verification'],
                action: 'Deep Dive'
            },
            {
                id: 'batch-analysis',
                name: 'Batch Analysis',
                description: 'Analyze multiple profiles at once',
                price: 0.25,
                features: ['Up to 100 profiles', 'Comparison matrix', 'Ranking', 'Export reports'],
                action: 'Analyze Batch'
            }
        ]
    },
    'talent-sourcer': {
        name: 'Talent Sourcer',
        tagline: 'Hidden Gem Finder',
        icon: Search,
        color: 'warm',
        description: 'Discovers top talent in unexpected places across the web, including passive candidates and hidden gems.',
        features: [
            'Cross-platform search (12+ platforms)',
            'Passive candidate discovery',
            'Competitor talent mapping',
            'Diversity sourcing optimization',
            'Referral network expansion'
        ],
        services: [
            {
                id: 'platform-search',
                name: 'Single Platform Search',
                description: 'Search one platform deeply',
                price: 0.10,
                features: ['One platform', 'Advanced filters', 'Export results'],
                action: 'Search Platform'
            },
            {
                id: 'multi-source',
                name: 'Multi-Source Discovery',
                description: 'Search across all platforms',
                price: 0.25,
                features: ['12+ platforms', 'Deduplication', 'Unified profiles', 'Passive candidates'],
                action: 'Discover Everywhere'
            },
            {
                id: 'talent-mapping',
                name: 'Talent Market Mapping',
                description: 'Map entire talent landscape',
                price: 0.40,
                features: ['Market analysis', 'Competitor tracking', 'Salary insights', 'Trend reports'],
                action: 'Map Talent Market'
            }
        ]
    }
};

export default function StorePage() {
    const params = useParams();
    const router = useRouter();
    const storeId = params.storeId as string;
    const store = storesData[storeId] || storesData['smart-database']; // Default to smart-database for demo

    const [selectedService, setSelectedService] = useState(null);
    const [cart, setCart] = useState([]);
    const [activeTab, setActiveTab] = useState('services');
    const [showActionModal, setShowActionModal] = useState(false);
    const [actionInProgress, setActionInProgress] = useState(false);

    useEffect(() => {
        // Load cart from localStorage
        const savedCart = localStorage.getItem('meunique-cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    if (!store) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Store not found</h1>
                    <button
                        onClick={() => router.push('/mall')}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg"
                    >
                        Back to Mall
                    </button>
                </div>
            </div>
        );
    }

    const colors = {
        primary: { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', main: '#667eea', light: '#E8E5FF' },
        secondary: { gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', main: '#f5576c', light: '#fce4ec' },
        accent: { gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', main: '#00f2fe', light: '#e0f7fa' },
        warm: { gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', main: '#fee140', light: '#fff3cd' },
        cool: { gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', main: '#38ef7d', light: '#d4f8e8' }
    };

    const storeColors = colors[store.color];

    const handleAddToCart = (service) => {
        const newItem = {
            ...service,
            storeId: storeId,
            storeName: store.name,
            timestamp: new Date().toISOString()
        };

        const updatedCart = [...cart, newItem];
        setCart(updatedCart);
        localStorage.setItem('meunique-cart', JSON.stringify(updatedCart));

        // Show success notification
        setSelectedService(service);
        setTimeout(() => setSelectedService(null), 3000);
    };

    const handleAction = async (service) => {
        setActionInProgress(true);
        setShowActionModal(true);

        // Simulate real action
        setTimeout(() => {
            setActionInProgress(false);
            // In production, this would trigger real API calls
            console.log(`Executing action: ${service.action} for ${service.name}`);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/mall')}
                                className="p-2 rounded-lg hover:bg-gray-100"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: storeColors.gradient }}
                                >
                                    <store.icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold">{store.name}</h1>
                                    <p className="text-sm text-gray-600">{store.tagline}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <ShoppingCart className="w-6 h-6 text-gray-700" />
                                {cart.length > 0 && (
                                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                                        {cart.length}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => window.open('/admin', '_blank')}
                                className="p-2 rounded-lg hover:bg-gray-100"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="relative overflow-hidden" style={{ background: storeColors.gradient }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-white"
                    >
                        <store.icon className="w-20 h-20 mx-auto mb-6" />
                        <h1 className="text-4xl font-bold mb-4">{store.name}</h1>
                        <p className="text-xl mb-8 max-w-3xl mx-auto">{store.description}</p>
                        <div className="flex justify-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab('services')}
                                className="px-6 py-3 bg-white/20 backdrop-blur rounded-lg font-medium"
                            >
                                View Services
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAction(store.services[0])}
                                className="px-6 py-3 bg-white text-gray-900 rounded-lg font-medium"
                            >
                                Start Free Trial
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
                <div className="bg-white rounded-xl shadow-lg p-1 inline-flex">
                    {['services', 'features', 'insights', 'actions'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-lg font-medium capitalize transition-colors ${activeTab === tab
                                ? 'bg-purple-100 text-purple-700'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AnimatePresence mode="wait">
                    {activeTab === 'services' && (
                        <motion.div
                            key="services"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        >
                            {store.services.map((service) => (
                                <motion.div
                                    key={service.id}
                                    whileHover={{ y: -5 }}
                                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                                >
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                                        <p className="text-gray-600 mb-4">{service.description}</p>
                                        <div className="text-3xl font-bold mb-4" style={{ color: storeColors.main }}>
                                            {service.price === 0 ? 'Free' : `$${service.price}`}
                                            {service.price > 0 && <span className="text-sm font-normal">/action</span>}
                                        </div>
                                        <ul className="space-y-2 mb-6">
                                            {service.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-center gap-2 text-sm">
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="space-y-2">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleAction(service)}
                                                className="w-full py-3 rounded-lg text-white font-medium"
                                                style={{ background: storeColors.gradient }}
                                            >
                                                {service.action}
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleAddToCart(service)}
                                                className="w-full py-3 rounded-lg border-2 font-medium"
                                                style={{
                                                    borderColor: storeColors.main,
                                                    color: storeColors.main
                                                }}
                                            >
                                                Add to Cart
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'features' && (
                        <motion.div
                            key="features"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-white rounded-xl shadow-lg p-8"
                        >
                            <h2 className="text-2xl font-bold mb-6">Core Features</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {store.features.map((feature, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex items-start gap-4"
                                    >
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: storeColors.light }}
                                        >
                                            <Sparkles className="w-5 h-5" style={{ color: storeColors.main }} />
                                        </div>
                                        <p className="text-gray-700">{feature}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'insights' && (
                        <motion.div
                            key="insights"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <SmartInsights agentId={storeId} />
                        </motion.div>
                    )}

                    {activeTab === 'actions' && (
                        <motion.div
                            key="actions"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-white rounded-xl shadow-lg p-8"
                        >
                            <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
                            <SmartActions
                                agentId={storeId}
                                onAction={(action) => {
                                    console.log(`Executing ${action} for ${storeId}`);
                                    setShowActionModal(true);
                                    setActionInProgress(true);
                                    setTimeout(() => setActionInProgress(false), 2000);
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Success Notification */}
            <AnimatePresence>
                {selectedService && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg"
                    >
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5" />
                            <div>
                                <p className="font-medium">{selectedService.name} added to cart!</p>
                                <p className="text-sm opacity-90">Ready to activate</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action Modal */}
            <AnimatePresence>
                {showActionModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                        onClick={() => !actionInProgress && setShowActionModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-white rounded-xl p-8 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {actionInProgress ? (
                                <div className="text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: storeColors.light }}>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        >
                                            <Zap className="w-8 h-8" style={{ color: storeColors.main }} />
                                        </motion.div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Action in Progress</h3>
                                    <p className="text-gray-600">Setting up your service...</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                                    <h3 className="text-xl font-bold mb-2">Success!</h3>
                                    <p className="text-gray-600 mb-6">Your service is now active and ready to use.</p>
                                    <button
                                        onClick={() => setShowActionModal(false)}
                                        className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium"
                                    >
                                        Got it!
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
} 