'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    ShoppingCart, X, Plus, Minus, Trash2, CreditCard,
    CheckCircle, AlertCircle, ArrowLeft, Sparkles,
    DollarSign, TrendingUp, Clock, Zap
} from 'lucide-react';

export default function CartPage() {
    const router = useRouter();
    const [cart, setCart] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        // Load cart from localStorage
        const savedCart = localStorage.getItem('meunique-cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    const updateCart = (newCart) => {
        setCart(newCart);
        localStorage.setItem('meunique-cart', JSON.stringify(newCart));
    };

    const removeItem = (index) => {
        const newCart = cart.filter((_, i) => i !== index);
        updateCart(newCart);
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + (parseFloat(item.price) || 0), 0);
    };

    const calculateROI = () => {
        const total = calculateTotal();
        return total * 3.2; // 320% ROI
    };

    const handleCheckout = async () => {
        setIsProcessing(true);

        // Simulate processing
        setTimeout(() => {
            setIsProcessing(false);
            setShowSuccess(true);

            // Clear cart after success
            setTimeout(() => {
                updateCart([]);
                router.push('/mall');
            }, 3000);
        }, 2000);
    };

    if (cart.length === 0 && !showSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
                    <p className="text-gray-600 mb-6">Add some AI agents to get started!</p>
                    <button
                        onClick={() => router.push('/mall')}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium"
                    >
                        Back to Mall
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/mall')}
                                className="p-2 rounded-lg hover:bg-gray-100"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-xl font-bold">Shopping Cart</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5" />
                            <span className="font-medium">{cart.length} items</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold mb-6">Your Services</h2>
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {cart.map((item, index) => (
                                        <motion.div
                                            key={`${item.id}-${index}`}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-100"
                                        >
                                            <div className="flex-1">
                                                <h3 className="font-medium">{item.name}</h3>
                                                <p className="text-sm text-gray-600">{item.storeName}</p>
                                                <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-lg font-bold">
                                                        ${item.price || '0.00'}
                                                    </p>
                                                    <p className="text-xs text-green-600">
                                                        ROI: ${(parseFloat(item.price || 0) * 3.2).toFixed(2)}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(index)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">${calculateTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Processing Fee</span>
                                    <span className="font-medium">$0.00</span>
                                </div>
                                <div className="border-t pt-4">
                                    <div className="flex justify-between">
                                        <span className="font-medium">Total Cost</span>
                                        <span className="text-xl font-bold">${calculateTotal().toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* ROI Calculator */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                    <h3 className="font-medium">Expected ROI</h3>
                                </div>
                                <p className="text-2xl font-bold text-green-600">
                                    ${calculateROI().toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Average 320% return in 3 months
                                </p>
                            </div>

                            {/* Checkout Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCheckout}
                                disabled={isProcessing || cart.length === 0}
                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium disabled:opacity-50"
                            >
                                {isProcessing ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        >
                                            <Zap className="w-5 h-5" />
                                        </motion.div>
                                        Processing...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <CreditCard className="w-5 h-5" />
                                        Activate Services
                                    </div>
                                )}
                            </motion.button>

                            <p className="text-xs text-center text-gray-500 mt-4">
                                By activating, you agree to our terms of service
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-white rounded-xl p-8 max-w-md w-full text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200 }}
                            >
                                <CheckCircle className="w-20 h-20 mx-auto mb-4 text-green-500" />
                            </motion.div>
                            <h2 className="text-2xl font-bold mb-2">Success!</h2>
                            <p className="text-gray-600 mb-6">
                                Your AI agents are now active and ready to work for you!
                            </p>
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                Redirecting to mall...
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
} 