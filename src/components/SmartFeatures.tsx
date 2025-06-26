'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, Sparkles, TrendingUp, Target, Zap, Award,
    BarChart3, Users, MessageSquare, Shield, Clock,
    DollarSign, CheckCircle, AlertCircle, Info
} from 'lucide-react';

interface AgentMetrics {
    [key: string]: any;
}

export const SmartInsights = ({ agentId }: { agentId: string }) => {
    const [metrics, setMetrics] = useState<AgentMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAgentMetrics();
    }, [agentId]);

    const fetchAgentMetrics = async () => {
        try {
            const response = await fetch('/api/agents/metrics');
            const data = await response.json();
            setMetrics(data[agentId]);
        } catch (error) {
            console.error('Failed to fetch metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
        );
    }

    if (!metrics) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            {/* Performance Metrics */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    Real-Time Performance
                </h4>
                <div className="grid grid-cols-2 gap-3">
                    {Object.entries(metrics).slice(0, 4).map(([key, value]) => (
                        <div key={key} className="bg-white rounded-lg p-3">
                            <p className="text-xs text-gray-600 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p className="text-lg font-bold text-purple-600">
                                {typeof value === 'number' ? value.toLocaleString() : value}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Learning Insights */}
            {metrics.learningInsights && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-blue-600" />
                        AI Learning Insights
                    </h4>
                    <ul className="space-y-2">
                        {metrics.learningInsights.map((insight: string, idx: number) => (
                            <motion.li
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-start gap-2 text-sm"
                            >
                                <Sparkles className="w-4 h-4 text-yellow-500 mt-0.5" />
                                <span>{insight}</span>
                            </motion.li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Top Sources/Templates */}
            {(metrics.topSources || metrics.topTemplates) && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5 text-green-600" />
                        Top Performers
                    </h4>
                    <div className="space-y-2">
                        {(metrics.topSources || metrics.topTemplates || []).map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-2">
                                <span className="text-sm font-medium">{item.name || item.platform}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">
                                        {item.quality || item.responseRate}%
                                    </span>
                                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500"
                                            style={{ width: `${item.quality || item.responseRate}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export const SmartActions = ({ agentId, onAction }: { agentId: string, onAction: (action: string) => void }) => {
    const actions = {
        'auto-recruiter': [
            { icon: Zap, label: 'Start Auto-Search', action: 'auto-search', color: 'purple' },
            { icon: MessageSquare, label: 'Bulk Outreach', action: 'bulk-outreach', color: 'blue' },
            { icon: Target, label: 'Focus Search', action: 'focus-search', color: 'green' }
        ],
        'talent-sourcer': [
            { icon: Users, label: 'Find Similar', action: 'find-similar', color: 'purple' },
            { icon: Shield, label: 'Verify Profiles', action: 'verify', color: 'blue' },
            { icon: TrendingUp, label: 'Expand Network', action: 'expand', color: 'green' }
        ],
        'culture-matcher': [
            { icon: Brain, label: 'Deep Analysis', action: 'deep-analysis', color: 'purple' },
            { icon: Users, label: 'Team Fit Test', action: 'team-fit', color: 'blue' },
            { icon: Award, label: 'Match Report', action: 'report', color: 'green' }
        ],
        'message-crafter': [
            { icon: Sparkles, label: 'Generate New', action: 'generate', color: 'purple' },
            { icon: BarChart3, label: 'A/B Test', action: 'ab-test', color: 'blue' },
            { icon: MessageSquare, label: 'Personalize', action: 'personalize', color: 'green' }
        ]
    };

    const agentActions = actions[agentId] || [];

    return (
        <div className="grid grid-cols-3 gap-3">
            {agentActions.map((action, idx) => (
                <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onAction(action.action)}
                    className={`p-3 rounded-xl text-white font-medium text-sm
                        ${action.color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-purple-600' : ''}
                        ${action.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : ''}
                        ${action.color === 'green' ? 'bg-gradient-to-r from-green-500 to-green-600' : ''}
                    `}
                >
                    <action.icon className="w-5 h-5 mx-auto mb-1" />
                    {action.label}
                </motion.button>
            ))}
        </div>
    );
};

export const CostCalculator = ({ selections }: { selections: any[] }) => {
    const [showBreakdown, setShowBreakdown] = useState(false);

    const calculateCost = () => {
        let total = 0;
        let breakdown: any[] = [];

        selections.forEach(item => {
            const cost = parseFloat(item.price.replace('$', '')) || 0;
            total += cost;
            breakdown.push({
                name: item.name,
                cost: cost,
                roi: cost > 0 ? Math.floor((cost * 3.2) * 100) / 100 : 0
            });
        });

        return { total, breakdown };
    };

    const { total, breakdown } = calculateCost();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4"
        >
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-orange-600" />
                    Cost & ROI Calculator
                </h4>
                <button
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="text-sm text-orange-600 hover:text-orange-700"
                >
                    {showBreakdown ? 'Hide' : 'Show'} Details
                </button>
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <p className="text-sm text-gray-600">Total Cost</p>
                    <p className="text-2xl font-bold text-orange-600">${total.toFixed(2)}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-600">Expected ROI</p>
                    <p className="text-2xl font-bold text-green-600">
                        ${(total * 3.2).toFixed(2)}
                    </p>
                </div>
            </div>

            <AnimatePresence>
                {showBreakdown && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 space-y-2"
                    >
                        {breakdown.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm bg-white rounded-lg p-2">
                                <span>{item.name}</span>
                                <div className="flex gap-4">
                                    <span className="text-gray-600">${item.cost.toFixed(2)}</span>
                                    <span className="text-green-600">→ ${item.roi.toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-3 p-2 bg-green-100 rounded-lg">
                <p className="text-xs text-green-700 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Average ROI: 320% within 3 months
                </p>
            </div>
        </motion.div>
    );
};

export const AIRecommendations = ({ userData }: { userData: any }) => {
    const recommendations = [
        {
            icon: Target,
            title: 'Recommended for You',
            items: [
                'Auto Recruiter + Message Crafter combo',
                'Culture Matcher for retention',
                'Profile Analyzer for risk assessment'
            ],
            reason: 'Based on your role as ' + (userData?.role || 'Recruiter')
        },
        {
            icon: TrendingUp,
            title: 'Trending Combinations',
            items: [
                'Full Stack Search (All Sourcing Agents)',
                'Quality First (Analyzer + Matcher)',
                'Speed Hiring (Auto + Message)'
            ],
            reason: '85% of users see results in 7 days'
        },
        {
            icon: Award,
            title: 'Best Value Package',
            items: [
                'Complete Recruitment Suite',
                'All 15 agents activated',
                'Unlimited searches & messages'
            ],
            reason: 'Save 70% vs traditional methods'
        }
    ];

    return (
        <div className="space-y-4">
            {recommendations.map((rec, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-xl p-4 border-2 border-purple-100"
                >
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <rec.icon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <h5 className="font-semibold mb-2">{rec.title}</h5>
                            <ul className="space-y-1 mb-2">
                                {rec.items.map((item, i) => (
                                    <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <p className="text-xs text-purple-600 flex items-center gap-1">
                                <Info className="w-3 h-3" />
                                {rec.reason}
                            </p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}; 