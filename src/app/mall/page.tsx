'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag, Heart, Star, Search, Filter, ChevronRight,
    Sparkles, Gift, Crown, Zap, Target, Brain, MessageSquare,
    Users, Database, Shield, Settings, BarChart3, Rocket,
    ShoppingCart, X, Plus, Minus, Check, Info, HelpCircle,
    Accessibility, Volume2, Eye, EyeOff, Sun, Moon, Globe,
    Clock, DollarSign, TrendingUp, Award, Briefcase, Code,
    Palette, FileText, UserCheck, Bot, Cpu, Layers
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import FloatingBots from '@/components/FloatingBots';

// Vibrant engaging color palette
const vibrantPalette = {
    primary: {
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        light: '#E8E5FF',
        main: '#667eea',
        dark: '#5a67d8',
        glow: '0 0 30px rgba(102, 126, 234, 0.5)'
    },
    secondary: {
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        light: '#fce4ec',
        main: '#f5576c',
        dark: '#e91e63',
        glow: '0 0 30px rgba(245, 87, 108, 0.5)'
    },
    accent: {
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        light: '#e0f7fa',
        main: '#00f2fe',
        dark: '#0097a7',
        glow: '0 0 30px rgba(0, 242, 254, 0.5)'
    },
    warm: {
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        light: '#fff3cd',
        main: '#fee140',
        dark: '#fa709a',
        glow: '0 0 30px rgba(254, 225, 64, 0.5)'
    },
    cool: {
        gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        light: '#d4f8e8',
        main: '#38ef7d',
        dark: '#11998e',
        glow: '0 0 30px rgba(56, 239, 125, 0.5)'
    },
    neutral: {
        light: '#F8F9FA',
        main: '#E9ECEF',
        dark: '#DEE2E6'
    }
};

// Enhanced store definitions with full capabilities
const stores = [
    {
        id: 'smart-database',
        name: 'Smart Database',
        tagline: 'The Brain of the System',
        icon: Database,
        category: 'Infrastructure',
        floor: 1,
        color: 'primary',
        capabilities: [
            'Resource mapping & organization',
            'Smart tagging & categorization',
            'Real-time data synchronization',
            'Pattern recognition & insights',
            'Multi-source data integration'
        ],
        background: 'Manages all candidate and company data with AI-powered organization',
        products: [
            { id: 1, name: 'Data Mapping', price: 'Free', rating: 5, description: 'Intelligent resource organization' },
            { id: 2, name: 'Auto Tagging', price: 'Free', rating: 4.8, description: 'AI-powered categorization' },
            { id: 3, name: 'Trend Analysis', price: 'Premium', rating: 4.9, description: 'Predictive insights' }
        ],
        stats: {
            'Processing Speed': '10,000 records/sec',
            'Accuracy': '99.5%',
            'Data Sources': '15+'
        }
    },
    {
        id: 'auto-recruiter',
        name: 'Auto Recruiter',
        tagline: '24/7 Talent Hunter',
        icon: Zap,
        category: 'Recruitment',
        floor: 2,
        color: 'warm',
        capabilities: [
            'Multi-platform candidate search',
            'Boolean search optimization',
            'Real-time candidate scoring',
            'Automated outreach sequences',
            'Cost-optimized sourcing'
        ],
        background: 'Continuously searches and engages top talent across all platforms',
        products: [
            { id: 4, name: 'LinkedIn Scanner', price: '$0.10', rating: 4.7, description: 'Deep profile analysis' },
            { id: 5, name: 'Boolean Master', price: '$0.05', rating: 4.9, description: 'Advanced search queries' },
            { id: 6, name: 'Smart Scraper', price: '$0.15', rating: 4.6, description: 'Multi-platform extraction' }
        ],
        stats: {
            'Candidates/Day': '500+',
            'Response Rate': '45%+',
            'Cost Saving': '70%'
        }
    },
    {
        id: 'culture-matcher',
        name: 'Culture Matcher',
        tagline: 'Perfect Fit Finder',
        icon: Target,
        category: 'Matching',
        floor: 2,
        color: 'secondary',
        capabilities: [
            'Deep culture analysis',
            'Personality profiling',
            'Team dynamics prediction',
            'Value alignment scoring',
            'Retention probability'
        ],
        background: 'Matches candidates with companies based on deep cultural alignment',
        products: [
            { id: 7, name: 'Culture Analysis', price: '$0.20', rating: 5, description: 'Company DNA mapping' },
            { id: 8, name: 'Personality Profile', price: '$0.15', rating: 4.8, description: 'Behavioral insights' },
            { id: 9, name: 'Match Score', price: '$0.25', rating: 4.9, description: 'Precision matching' }
        ],
        stats: {
            'Match Accuracy': '87%',
            'Retention Rate': '92%',
            'Time to Fit': '3 min'
        }
    },
    {
        id: 'message-crafter',
        name: 'Message Crafter',
        tagline: 'Words That Work',
        icon: MessageSquare,
        category: 'Communication',
        floor: 3,
        color: 'accent',
        capabilities: [
            'Hyper-personalized messaging',
            'A/B testing optimization',
            'Multi-language support',
            'Tone & style adaptation',
            'Response prediction'
        ],
        background: 'Creates messages that achieve 45%+ response rates through deep personalization',
        products: [
            { id: 10, name: 'Personal Touch', price: '$0.30', rating: 4.9, description: 'Custom messages' },
            { id: 11, name: 'A/B Testing', price: '$0.20', rating: 4.7, description: 'Message optimization' },
            { id: 12, name: 'Hebrew Magic', price: '$0.10', rating: 5, description: 'Native language touch' }
        ],
        stats: {
            'Response Rate': '45%+',
            'Open Rate': '78%',
            'Languages': '5+'
        }
    },
    {
        id: 'profile-analyzer',
        name: 'Profile Analyzer',
        tagline: 'Deep Dive Detective',
        icon: Brain,
        category: 'Analysis',
        floor: 3,
        color: 'cool',
        capabilities: [
            'Skills gap analysis',
            'Experience validation',
            'Potential assessment',
            'Risk evaluation',
            'Growth trajectory prediction'
        ],
        background: 'Analyzes profiles to uncover hidden potential and red flags',
        products: [
            { id: 13, name: 'Skill Scanner', price: '$0.15', rating: 4.8, description: 'Technical validation' },
            { id: 14, name: 'Risk Detector', price: '$0.20', rating: 4.7, description: 'Red flag identification' },
            { id: 15, name: 'Potential Finder', price: '$0.25', rating: 4.9, description: 'Hidden talent discovery' }
        ],
        stats: {
            'Analysis Depth': '50+ factors',
            'Accuracy': '94%',
            'Time': '< 30 sec'
        }
    },
    {
        id: 'talent-sourcer',
        name: 'Talent Sourcer',
        tagline: 'Hidden Gem Finder',
        icon: Search,
        category: 'Discovery',
        floor: 1,
        color: 'warm',
        capabilities: [
            'Cross-platform search',
            'Passive candidate discovery',
            'Competitor talent mapping',
            'Diversity sourcing',
            'Referral network expansion'
        ],
        background: 'Discovers top talent in unexpected places across the web',
        products: [
            { id: 16, name: 'Deep Search', price: '$0.25', rating: 4.9, description: 'Find anyone, anywhere' },
            { id: 17, name: 'Passive Hunter', price: '$0.30', rating: 4.8, description: 'Engage the unengaged' },
            { id: 18, name: 'Network Map', price: '$0.20', rating: 4.7, description: 'Connection insights' }
        ],
        stats: {
            'Platforms': '12+',
            'Hidden Talent': '65%',
            'Reach': 'Global'
        }
    }
];

// Interactive Store Component with improved responsiveness
const InteractiveStore = ({ store, onAddToCart, onViewDetails, onAddToWishlist, isInWishlist }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showCapabilities, setShowCapabilities] = useState(false);
    const colors = vibrantPalette[store.color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="relative overflow-hidden rounded-3xl shadow-2xl cursor-pointer transform transition-all duration-300 w-full"
            style={{
                background: colors.gradient || `linear-gradient(135deg, ${colors.light} 0%, ${colors.main} 100%)`,
                border: `2px solid ${colors.main}`,
                boxShadow: isHovered ? colors.glow : 'none'
            }}
            onClick={() => onViewDetails(store)}
        >
            {/* Store Header */}
            <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <motion.div
                            animate={{ rotate: isHovered ? 360 : 0 }}
                            transition={{ duration: 0.5 }}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: colors.dark }}
                        >
                            <store.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </motion.div>
                        <div className="min-w-0">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate">{store.name}</h3>
                            <p className="text-xs sm:text-sm text-gray-600">{store.tagline}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <motion.div
                            animate={{ scale: isHovered ? 1.1 : 1 }}
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: colors.main, color: 'white' }}
                        >
                            Floor {store.floor}
                        </motion.div>
                        <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToWishlist(store);
                            }}
                            className="p-1.5 rounded-full bg-white/80 backdrop-blur"
                        >
                            <Heart
                                className={`w-4 h-4 transition-colors ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'
                                    }`}
                            />
                        </motion.button>
                    </div>
                </div>

                {/* Background Info */}
                <p className="text-xs sm:text-sm text-gray-700 mb-4 line-clamp-2">
                    {store.background}
                </p>

                {/* Quick Stats - Responsive Grid */}
                <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-4">
                    {Object.entries(store.stats).slice(0, 3).map(([key, value]) => (
                        <div key={key} className="text-center p-1.5 sm:p-2 rounded-lg" style={{ backgroundColor: colors.light }}>
                            <div className="text-xs text-gray-600 truncate">{key}</div>
                            <div className="text-xs sm:text-sm font-bold" style={{ color: colors.dark }}>{value}</div>
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(store.products[0], store);
                        }}
                        className="flex-1 py-2 rounded-lg text-xs sm:text-sm font-medium text-white transition-colors"
                        style={{ backgroundColor: colors.dark }}
                    >
                        הוסף לעגלה
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(store);
                        }}
                        className="flex-1 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                        style={{
                            backgroundColor: colors.light,
                            color: colors.dark
                        }}
                    >
                        פרטים מלאים
                    </motion.button>
                </div>

                {/* Capabilities Toggle */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowCapabilities(!showCapabilities);
                    }}
                    className="w-full py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                        backgroundColor: showCapabilities ? colors.dark : colors.main,
                        color: showCapabilities ? 'white' : colors.dark
                    }}
                >
                    {showCapabilities ? 'Hide' : 'Show'} Capabilities
                </motion.button>

                {/* Capabilities List */}
                <AnimatePresence>
                    {showCapabilities && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-3 overflow-hidden"
                        >
                            <ul className="space-y-1">
                                {store.capabilities.map((capability, idx) => (
                                    <motion.li
                                        key={idx}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="flex items-center gap-2 text-sm text-gray-700"
                                    >
                                        <Check className="w-4 h-4" style={{ color: colors.dark }} />
                                        {capability}
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Interactive Hover Effect */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 pointer-events-none"
                        >
                            <Sparkles className="absolute top-4 right-4 w-6 h-6 text-yellow-400" />
                            <Sparkles className="absolute bottom-4 left-4 w-4 h-4 text-yellow-300" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

// Store Modal with Products
const StoreModal = ({ store, isOpen, onClose, onAddToCart }) => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const colors = vibrantPalette[store?.color || 'primary'];

    if (!store || !isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Modal Header */}
                    <div className="p-6" style={{ backgroundColor: colors.light }}>
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                    style={{ backgroundColor: colors.main }}>
                                    <store.icon className="w-8 h-8" style={{ color: colors.dark }} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{store.name}</h2>
                                    <p className="text-gray-600">{store.tagline}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* Modal Content */}
                    <div className="p-6 overflow-y-auto" style={{ maxHeight: '60vh' }}>
                        {/* About Section */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-3">About This Agent</h3>
                            <p className="text-gray-700 mb-4">{store.background}</p>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                {Object.entries(store.stats).map(([key, value]) => (
                                    <div key={key} className="p-4 rounded-xl text-center"
                                        style={{ backgroundColor: colors.light }}>
                                        <div className="text-2xl font-bold mb-1" style={{ color: colors.dark }}>
                                            {value}
                                        </div>
                                        <div className="text-sm text-gray-600">{key}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Capabilities */}
                            <h4 className="font-semibold mb-3">Core Capabilities</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {store.capabilities.map((capability, idx) => (
                                    <div key={idx} className="flex items-start gap-2">
                                        <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: colors.dark }} />
                                        <span className="text-sm text-gray-700">{capability}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Products Section */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Available Services</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {store.products.map((product) => (
                                    <motion.div
                                        key={product.id}
                                        whileHover={{ scale: 1.02 }}
                                        className="p-4 rounded-xl border-2 cursor-pointer"
                                        style={{
                                            borderColor: colors.main,
                                            backgroundColor: selectedProduct?.id === product.id ? colors.light : 'white'
                                        }}
                                        onClick={() => setSelectedProduct(product)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium text-gray-800">{product.name}</h4>
                                            <span className="font-bold" style={{ color: colors.dark }}>
                                                {product.price}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < Math.floor(product.rating)
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                                <span className="text-xs text-gray-500 ml-1">
                                                    ({product.rating})
                                                </span>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onAddToCart(product, store);
                                                }}
                                                className="px-3 py-1 rounded-lg text-sm font-medium text-white"
                                                style={{ backgroundColor: colors.dark }}
                                            >
                                                Add
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// Main Mall Component
export default function DigitalMall() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedFloor, setSelectedFloor] = useState('all');
    const [cart, setCart] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [showCart, setShowCart] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const router = useRouter();

    // Real-time notifications
    const addNotification = (message, type = 'success') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3000);
    };

    // Cart functions
    const addToCart = (product, store) => {
        setCart(prev => [...prev, { ...product, store: store.name, id: Date.now() }]);
        addNotification(`Added ${product.name} to cart!`, 'success');
    };

    // Filter stores
    const filteredStores = stores.filter(store => {
        const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            store.tagline.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || store.category === selectedCategory;
        const matchesFloor = selectedFloor === 'all' || store.floor === parseInt(selectedFloor);
        return matchesSearch && matchesCategory && matchesFloor;
    });

    // Categories
    const categories = ['all', ...new Set(stores.map(s => s.category))];

    const handleViewStore = (store) => {
        // Open store in new tab with unique URL
        const storeUrl = `/store/${store.id}`;
        window.open(storeUrl, '_blank');

        // Add notification
        addNotification(`Opening ${store.name} in new tab!`, 'info');
    };

    const toggleWishlist = (store) => {
        if (isInWishlist(store.id)) {
            setWishlist(prev => prev.filter(s => s.id !== store.id));
            addNotification(`Removed ${store.name} from wishlist!`, 'success');
        } else {
            setWishlist(prev => [...prev, store]);
            addNotification(`Added ${store.name} to wishlist!`, 'success');
        }
    };

    const isInWishlist = (id) => {
        return wishlist.some(store => store.id === id);
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: vibrantPalette.neutral.light }}>
            <FloatingBots />

            {/* Header - Responsive */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14 sm:h-16">
                        <div className="flex items-center gap-2 sm:gap-4">
                            <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
                                style={{ background: vibrantPalette.primary.gradient }}
                            >
                                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </motion.div>
                            <div>
                                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    MeUnique Mall
                                </h1>
                                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                                    {filteredStores.length} AI Agents Available
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4">
                            {/* Wishlist Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative p-2 sm:p-3 rounded-xl bg-pink-100"
                            >
                                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
                                {wishlist.length > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs font-bold"
                                    >
                                        {wishlist.length}
                                    </motion.span>
                                )}
                            </motion.button>

                            {/* Cart Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => router.push('/cart')}
                                className="relative p-2 sm:p-3 rounded-xl"
                                style={{ backgroundColor: vibrantPalette.accent.light }}
                            >
                                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: vibrantPalette.accent.dark }} />
                                <AnimatePresence>
                                    {cart.length > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                            style={{ backgroundColor: vibrantPalette.secondary.dark }}
                                        >
                                            {cart.length}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => window.open('/admin', '_blank')}
                                className="hidden sm:flex px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium text-sm"
                            >
                                Admin Mode
                            </motion.button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content - Responsive Padding */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {/* Search Bar - Responsive */}
                <div className="mb-6 sm:mb-8">
                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="חפש סוכן AI..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 sm:py-3 rounded-xl border-2 focus:outline-none transition-colors text-sm sm:text-base"
                            style={{
                                borderColor: vibrantPalette.primary.light,
                                backgroundColor: 'white'
                            }}
                        />
                    </div>
                </div>

                {/* Filters - Responsive */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6 sm:mb-8">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">קטגוריה</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 focus:outline-none text-sm sm:text-base"
                            style={{ borderColor: vibrantPalette.secondary.light }}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'all' ? 'All Categories' : cat}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">קומה</label>
                        <select
                            value={selectedFloor}
                            onChange={(e) => setSelectedFloor(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 focus:outline-none text-sm sm:text-base"
                            style={{ borderColor: vibrantPalette.accent.light }}
                        >
                            <option value="all">All Floors</option>
                            {[1, 2, 3].map(floor => (
                                <option key={floor} value={floor.toString()}>Floor {floor}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Stores Grid - Responsive */}
                <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                >
                    {filteredStores.map((store, index) => (
                        <InteractiveStore
                            key={store.id}
                            store={store}
                            onAddToCart={addToCart}
                            onViewDetails={handleViewStore}
                            onAddToWishlist={toggleWishlist}
                            isInWishlist={isInWishlist(store.id)}
                        />
                    ))}
                </motion.div>

                {/* Store Modal */}
                <StoreModal
                    store={selectedStore}
                    isOpen={!!selectedStore}
                    onClose={() => setSelectedStore(null)}
                    onAddToCart={addToCart}
                />

                {/* Cart Sidebar */}
                <AnimatePresence>
                    {showCart && (
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold">Your Cart</h2>
                                    <button
                                        onClick={() => setShowCart(false)}
                                        className="p-2 rounded-lg hover:bg-gray-100"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {cart.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                                ) : (
                                    <div className="space-y-4">
                                        {cart.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4 rounded-xl"
                                                style={{ backgroundColor: vibrantPalette.neutral.light }}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-medium">{item.name}</h4>
                                                        <p className="text-sm text-gray-600">{item.store}</p>
                                                    </div>
                                                    <span className="font-bold">{item.price}</span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Notifications */}
                <div className="fixed bottom-4 right-4 z-50 space-y-2">
                    <AnimatePresence>
                        {notifications.map((notification) => (
                            <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 100 }}
                                className="px-4 py-3 rounded-lg shadow-lg text-white"
                                style={{
                                    backgroundColor: notification.type === 'success'
                                        ? vibrantPalette.accent.dark
                                        : vibrantPalette.secondary.dark
                                }}
                            >
                                {notification.message}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
} 