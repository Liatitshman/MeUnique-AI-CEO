'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Sparkles, Heart, Star, ChevronRight, Globe, Palette,
    Briefcase, MessageSquare, Brain, Zap, Gift, Crown
} from 'lucide-react';

// Onboarding flow with personalization
export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [userData, setUserData] = useState({
        name: '',
        role: '',
        experience: 'intermediate',
        tone: 'friendly',
        language: 'en',
        interests: []
    });

    const steps = [
        {
            title: "Welcome to MeUnique! 🎉",
            subtitle: "Let's personalize your experience",
            icon: Sparkles,
            color: '#E8E5FF'
        },
        {
            title: "Tell us about yourself",
            subtitle: "This helps us tailor the experience",
            icon: Heart,
            color: '#FFE5F1'
        },
        {
            title: "Choose your style",
            subtitle: "How would you like us to communicate?",
            icon: Palette,
            color: '#E5FFF5'
        },
        {
            title: "You're all set!",
            subtitle: "Let's find amazing talent together",
            icon: Crown,
            color: '#FFF5E5'
        }
    ];

    const currentStep = steps[step];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            // Save preferences and redirect
            localStorage.setItem('userPreferences', JSON.stringify(userData));
            router.push('/mall');
        }
    };

    const handleSkip = () => {
        router.push('/mall');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{ backgroundColor: currentStep.color }}>

            <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8"
            >
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        {steps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-2 flex-1 mx-1 rounded-full transition-colors ${idx <= step ? 'bg-purple-500' : 'bg-gray-200'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: currentStep.color }}
                >
                    <currentStep.icon className="w-12 h-12 text-white" />
                </motion.div>

                {/* Content */}
                <h1 className="text-3xl font-bold text-center mb-2">
                    {currentStep.title}
                </h1>
                <p className="text-gray-600 text-center mb-8">
                    {currentStep.subtitle}
                </p>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    {step === 0 && <WelcomeStep />}
                    {step === 1 && <PersonalInfoStep userData={userData} setUserData={setUserData} />}
                    {step === 2 && <PreferencesStep userData={userData} setUserData={setUserData} />}
                    {step === 3 && <CompletionStep userData={userData} />}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex justify-between mt-8">
                    <button
                        onClick={handleSkip}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        Skip for now
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleNext}
                        className="px-6 py-3 bg-purple-500 text-white rounded-xl font-medium flex items-center gap-2"
                    >
                        {step === steps.length - 1 ? 'Get Started' : 'Continue'}
                        <ChevronRight className="w-4 h-4" />
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}

// Step Components
function WelcomeStep() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4"
        >
            <p className="text-lg text-gray-700">
                MeUnique is your AI-powered recruitment assistant that helps you find
                the perfect candidates with <span className="font-bold text-purple-600">45%+ response rates</span>!
            </p>
            <div className="flex justify-center gap-4 py-4">
                <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">15</div>
                    <div className="text-sm text-gray-600">AI Agents</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">70%</div>
                    <div className="text-sm text-gray-600">Cost Savings</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">24/7</div>
                    <div className="text-sm text-gray-600">Always Active</div>
                </div>
            </div>
        </motion.div>
    );
}

function PersonalInfoStep({ userData, setUserData }) {
    const roles = [
        { id: 'recruiter', label: 'Recruiter', icon: Briefcase },
        { id: 'hr_manager', label: 'HR Manager', icon: Crown },
        { id: 'founder', label: 'Founder/CEO', icon: Zap },
        { id: 'team_lead', label: 'Team Lead', icon: Brain }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    What's your name?
                </label>
                <input
                    type="text"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    placeholder="Enter your name"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    What's your role?
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {roles.map((role) => (
                        <motion.button
                            key={role.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setUserData({ ...userData, role: role.id })}
                            className={`p-4 rounded-xl border-2 transition-colors ${userData.role === role.id
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <role.icon className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                            <div className="text-sm font-medium">{role.label}</div>
                        </motion.button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

function PreferencesStep({ userData, setUserData }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Language Preference */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Language
                </label>
                <div className="flex gap-3">
                    <button
                        onClick={() => setUserData({ ...userData, language: 'en' })}
                        className={`flex-1 py-2 px-4 rounded-xl border-2 ${userData.language === 'en'
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200'
                            }`}
                    >
                        English
                    </button>
                    <button
                        onClick={() => setUserData({ ...userData, language: 'he' })}
                        className={`flex-1 py-2 px-4 rounded-xl border-2 ${userData.language === 'he'
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200'
                            }`}
                    >
                        עברית
                    </button>
                </div>
            </div>

            {/* Communication Tone */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Communication Style
                </label>
                <div className="space-y-2">
                    {[
                        { id: 'professional', label: 'Professional & Formal', emoji: '👔' },
                        { id: 'friendly', label: 'Friendly & Casual', emoji: '😊' },
                        { id: 'humorous', label: 'Fun with Recruiter Humor', emoji: '😄' }
                    ].map((tone) => (
                        <button
                            key={tone.id}
                            onClick={() => setUserData({ ...userData, tone: tone.id })}
                            className={`w-full p-3 rounded-xl border-2 text-left flex items-center gap-3 ${userData.tone === tone.id
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-200'
                                }`}
                        >
                            <span className="text-2xl">{tone.emoji}</span>
                            <span className="font-medium">{tone.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Experience Level */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Technical Understanding
                </label>
                <select
                    value={userData.experience}
                    onChange={(e) => setUserData({ ...userData, experience: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                >
                    <option value="beginner">Beginner - Keep it simple</option>
                    <option value="intermediate">Intermediate - Some technical terms OK</option>
                    <option value="expert">Expert - Bring on the details</option>
                </select>
            </div>
        </motion.div>
    );
}

function CompletionStep({ userData }) {
    const memes = [
        "When the perfect candidate ghosts you 👻",
        "CV says: 10 years experience in a 3-year-old technology 🤔",
        "Candidate cancels interview 1 minute before 😭",
        "When they actually show up to the interview 🎉"
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-6"
        >
            <div className="text-6xl mb-4">🎊</div>

            <h2 className="text-2xl font-bold">
                Welcome aboard, {userData.name || 'Recruiter'}!
            </h2>

            <p className="text-gray-600">
                Your personalized recruitment experience is ready.
                {userData.tone === 'humorous' && " Get ready for some recruiter humor along the way!"}
            </p>

            {userData.tone === 'humorous' && (
                <div className="bg-purple-50 rounded-xl p-4">
                    <p className="text-sm font-medium text-purple-700 mb-2">
                        Here's a meme to start your day:
                    </p>
                    <p className="text-lg">
                        {memes[Math.floor(Math.random() * memes.length)]}
                    </p>
                </div>
            )}

            <div className="flex justify-center gap-8 pt-4">
                <div className="text-center">
                    <Gift className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                    <div className="text-sm text-gray-600">Personalized UI</div>
                </div>
                <div className="text-center">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <div className="text-sm text-gray-600">Custom Messages</div>
                </div>
                <div className="text-center">
                    <Brain className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-sm text-gray-600">Smart Insights</div>
                </div>
            </div>
        </motion.div>
    );
} 