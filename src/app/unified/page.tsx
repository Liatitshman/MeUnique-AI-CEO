'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Users, 
  Brain, 
  MessageSquare, 
  BookOpen, 
  UserCheck, 
  Target,
  Sparkles,
  Database,
  Zap,
  ChevronRight,
  Settings,
  BarChart3,
  Globe,
  Shield,
  Rocket,
  Crown
} from 'lucide-react';

// Tool definitions with updated order and descriptions - THE SMART LOOP
const tools = [
  {
    id: 'smart-database',
    name: '💾 Smart Database',
    icon: Database,
    description: 'ממפה משאבים וקהלי יעד, מתייג חכם ומכין תשתית לכל הסוכנים',
    color: 'from-indigo-500 to-purple-500',
    features: ['מיפוי משאבים', 'תיוג חכם', 'Keywords & Buzzwords', 'הכוונת סוכנים'],
    apiEndpoint: '/api/ai/smart/smart-database'
  },
  {
    id: 'auto-recruiter',
    name: '⚡ Auto Recruiter',
    icon: Zap,
    description: 'מרחיב משאבים עם סקריפטינג חכם ופיקוח CFO על עלויות',
    color: 'from-yellow-500 to-orange-500',
    features: ['Web Scraping', 'Boolean Search', 'פיקוח תקציב', 'Real-time AI'],
    apiEndpoint: '/api/ai/smart/auto-recruiter'
  },
  {
    id: 'culture-matcher',
    name: '🎯 Culture Matcher',
    icon: Target,
    description: 'מנתח מאפיינים אישיותיים ותרבותיים, מבצע הצלבות חכמות',
    color: 'from-pink-500 to-rose-500',
    features: ['מחקר חברות', 'ניתוח אישיות', 'Market Intelligence', 'הצלבות חכמות'],
    apiEndpoint: '/api/ai/smart/culture-matcher'
  },
  {
    id: 'ideal-profiler',
    name: '🏗️ Ideal Profiler',
    icon: Users,
    description: 'בונה פרופיל אידיאלי של מועמד וחברה מכל המידע שנאסף',
    color: 'from-purple-500 to-indigo-500',
    features: ['בניית פרופיל', 'איסוף insights', 'וידוא מידע', 'Fact-checking'],
    apiEndpoint: '/api/ai/smart/ideal-profiler'
  },
  {
    id: 'profile-analyzer',
    name: '🔬 Profile Analyzer',
    icon: Brain,
    description: 'משווה מועמדים לפרופיל האידיאלי ומספק ניתוח מעמיק',
    color: 'from-blue-500 to-cyan-500',
    features: ['ניתוח השוואתי', 'ניקוד התאמה', 'טיפול בגנריות', 'דוחות SWOT'],
    apiEndpoint: '/api/ai/smart/profile-analyzer'
  },
  {
    id: 'message-crafter',
    name: '📝 Message Crafter',
    icon: MessageSquare,
    description: 'יוצר הודעות פרסונליות עם 45%+ response rate',
    color: 'from-orange-500 to-red-500',
    features: ['פרסונליזציה מתקדמת', 'A/B Testing', 'עברית מלאה', 'No AI mistakes'],
    apiEndpoint: '/api/ai/smart/message-crafter'
  },
  {
    id: 'talent-sourcer',
    name: '🕵️ Talent Sourcer',
    icon: Search,
    description: 'מבצע חיפושים ממוקדים על בסיס הנתונים שהוכנו',
    color: 'from-purple-500 to-pink-500',
    features: ['LinkedIn Navigator', 'GitHub Search', 'X-ray Search', 'Multi-platform'],
    apiEndpoint: '/api/ai/smart/talent-sourcer'
  },
  {
    id: 'ceo',
    name: '👑 CEO',
    icon: Crown,
    description: 'מנהל ומתאם את כל המערכת והסוכנים',
    color: 'from-purple-600 to-indigo-600',
    features: ['ניהול כולל', 'קבלת החלטות', 'אסטרטגיה'],
    apiEndpoint: '/api/ai/smart/ceo'
  },
  {
    id: 'cfo',
    name: '💰 CFO',
    icon: BarChart3,
    description: 'מנהל תקציבים ועלויות גיוס',
    color: 'from-green-600 to-teal-600',
    features: ['ניתוח עלויות', 'תקציב גיוס', 'ROI'],
    apiEndpoint: '/api/ai/smart/cfo'
  },
  {
    id: 'cto',
    name: '💻 CTO',
    icon: Settings,
    description: 'מנהל טכנולוגיה ואינטגרציות',
    color: 'from-blue-600 to-indigo-600',
    features: ['אינטגרציות', 'אבטחה', 'ביצועים'],
    apiEndpoint: '/api/ai/smart/cto'
  },
  {
    id: 'cmo',
    name: '📣 CMO',
    icon: Rocket,
    description: 'מנהל שיווק ומיתוג מעסיק',
    color: 'from-pink-600 to-purple-600',
    features: ['מיתוג מעסיק', 'קמפיינים', 'נוכחות דיגיטלית'],
    apiEndpoint: '/api/ai/smart/cmo'
  }
];

export default function UnifiedDashboard() {
  const [selectedTool, setSelectedTool] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleToolClick = (tool) => {
    setSelectedTool(tool);
  };

  const handleToolAction = async (action) => {
    setIsLoading(true);
    try {
      const response = await fetch(selectedTool.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await response.json();
      console.log('Tool action result:', data);
    } catch (error) {
      console.error('Error executing tool action:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            🚀 MeUnique AI CEO System
          </h1>
          <p className="text-xl text-gray-300">
            מערכת גיוס חכמה עם 11 סוכני AI מתקדמים
          </p>
        </motion.div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => handleToolClick(tool)}
              className="cursor-pointer"
            >
              <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${tool.color} p-6 shadow-xl`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <tool.icon className="w-10 h-10 text-white" />
                    <Sparkles className="w-6 h-6 text-white opacity-60" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{tool.name}</h3>
                  <p className="text-white opacity-90 text-sm mb-4">{tool.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {tool.features.map((feature, idx) => (
                      <span key={idx} className="text-xs bg-white bg-opacity-20 text-white px-2 py-1 rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tool Detail Modal */}
        <AnimatePresence>
          {selectedTool && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedTool(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`flex items-center gap-4 mb-6 p-4 rounded-xl bg-gradient-to-r ${selectedTool.color}`}>
                  <selectedTool.icon className="w-12 h-12 text-white" />
                  <div>
                    <h2 className="text-3xl font-bold text-white">{selectedTool.name}</h2>
                    <p className="text-white opacity-90">{selectedTool.description}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white mb-4">יכולות מרכזיות</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTool.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-gray-800 p-4 rounded-lg">
                        <ChevronRight className="w-5 h-5 text-purple-400" />
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      onClick={() => handleToolAction('start')}
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                    >
                      {isLoading ? 'מעבד...' : 'הפעל כלי'}
                    </button>
                    <button
                      onClick={() => setSelectedTool(null)}
                      className="flex-1 bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-600 transition"
                    >
                      סגור
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* System Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800 rounded-2xl p-8 shadow-xl"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-purple-400" />
            סטטיסטיקות מערכת
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-3xl font-bold text-purple-400 mb-2">11</div>
              <div className="text-gray-300">סוכני AI פעילים</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-400 mb-2">24/7</div>
              <div className="text-gray-300">זמינות מערכת</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-400 mb-2">∞</div>
              <div className="text-gray-300">יכולת עיבוד</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-3xl font-bold text-orange-400 mb-2">100%</div>
              <div className="text-gray-300">אוטומציה</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 