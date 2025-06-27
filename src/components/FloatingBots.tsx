'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot, Sparkles, MessageSquare, Heart, Star,
    Zap, Brain, Target, Shield, Gift, Crown
} from 'lucide-react';

const botPersonalities = [
    {
        id: 'recruiter-bot',
        name: 'רונית המגייסת',
        icon: Crown,
        color: 'purple',
        gradient: 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)',
        messages: [
            'נמאס לך לחפש מועמדים? אני כאן! 🎯',
            'מצאתי 50 מועמדים מעולים בזמן שאכלת ארוחת צהריים 🍕',
            'עוד CV אחד ואני מתפוצצת... אה רגע, אני בוט! 🤖',
            'האם ידעת? 87% מהמועמדים שלי עוברים ראיון ראשון! 📊'
        ]
    },
    {
        id: 'culture-bot',
        name: 'דני התרבותי',
        icon: Heart,
        color: 'pink',
        gradient: 'linear-gradient(135deg, #ec4899 0%, #f9a8d4 100%)',
        messages: [
            'התאמה תרבותית = שמירה על עובדים! ❤️',
            'מצאתי מישהו שאוהב פינג פונג כמו הצוות שלכם! 🏓',
            'Warning: המועמד הזה אוהב לעבוד בשקט... 🤫',
            'Match תרבותי של 94%! זה כמו Tinder לעבודה! 💘'
        ]
    },
    {
        id: 'analyzer-bot',
        name: 'שירה האנליטית',
        icon: Brain,
        color: 'teal',
        gradient: 'linear-gradient(135deg, #14b8a6 0%, #5eead4 100%)',
        messages: [
            'זיהיתי פוטנציאל נסתר ב-73% מהמועמדים! 🔍',
            'Red flag alert: 3 שנים, 5 עבודות 🚩',
            'המועמד הזה? Overqualified אבל motivated! ⭐',
            'ניתוח עומק ב-0.3 שניות. כן, אני מהירה! ⚡'
        ]
    }
];

export default function FloatingBots() {
    const [activeBots, setActiveBots] = useState([]);
    const [messages, setMessages] = useState({});

    useEffect(() => {
        // Randomly activate bots
        const interval = setInterval(() => {
            const randomBot = botPersonalities[Math.floor(Math.random() * botPersonalities.length)];
            const randomMessage = randomBot.messages[Math.floor(Math.random() * randomBot.messages.length)];

            const botInstance = {
                ...randomBot,
                instanceId: Date.now(),
                message: randomMessage,
                position: {
                    x: Math.random() > 0.5 ? 'right' : 'left',
                    y: 20 + Math.random() * 60
                }
            };

            setActiveBots(prev => [...prev.slice(-2), botInstance]);

            // Remove bot after 5 seconds
            setTimeout(() => {
                setActiveBots(prev => prev.filter(b => b.instanceId !== botInstance.instanceId));
            }, 5000);
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    return (
        <AnimatePresence>
            {activeBots.map((bot) => (
                <motion.div
                    key={bot.instanceId}
                    initial={{
                        opacity: 0,
                        scale: 0,
                        x: bot.position.x === 'right' ? 100 : -100
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        x: 0
                    }}
                    exit={{
                        opacity: 0,
                        scale: 0,
                        y: -50
                    }}
                    className={`fixed z-50 ${bot.position.x === 'right' ? 'right-4' : 'left-4'
                        }`}
                    style={{
                        bottom: `${bot.position.y}%`,
                        maxWidth: '300px'
                    }}
                >
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-white rounded-2xl shadow-2xl p-4 cursor-pointer"
                        style={{
                            border: `2px solid transparent`,
                            backgroundImage: `linear-gradient(white, white), ${bot.gradient}`,
                            backgroundOrigin: 'border-box',
                            backgroundClip: 'padding-box, border-box'
                        }}
                    >
                        <div className="flex items-start gap-3">
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{ background: bot.gradient }}
                            >
                                <bot.icon className="w-6 h-6 text-white" />
                            </motion.div>
                            <div className="flex-1">
                                <p className="font-bold text-sm mb-1">{bot.name}</p>
                                <p className="text-sm text-gray-700">{bot.message}</p>
                            </div>
                        </div>
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="absolute -top-2 -right-2"
                        >
                            <Sparkles className="w-5 h-5 text-yellow-400" />
                        </motion.div>
                    </motion.div>
                </motion.div>
            ))}
        </AnimatePresence>
    );
} 