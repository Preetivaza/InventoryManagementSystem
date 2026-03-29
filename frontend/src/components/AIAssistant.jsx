import { useState } from 'react';
import { MessageCircle, Send, X, Sparkles, TrendingUp, Package, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: '👋 Hello! I\'m your AI Inventory Assistant. I can help you with:\n\n• Stock recommendations\n• Sales forecasts\n• Inventory insights\n• Anomaly detection\n\nWhat would you like to know?',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [quickActions] = useState([
        { icon: TrendingUp, label: 'Sales Forecast', query: 'What are the sales predictions for the next week?' },
        { icon: Package, label: 'Reorder Now?', query: 'Which products should I reorder immediately?' },
        { icon: AlertCircle, label: 'Find Issues', query: 'Detect any anomalies in my sales data' },
        { icon: Sparkles, label: 'AI Insights', query: 'Give me comprehensive AI insights about my inventory' }
    ]);

    const handleSend = async (question = input) => {
        if (!question.trim()) return;

        const userMessage = {
            role: 'user',
            content: question,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await api.post('/ai/ask', { question });

            const assistantMessage = {
                role: 'assistant',
                content: response.data.answer,
                confidence: response.data.confidence,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage = {
                role: 'assistant',
                content: '❌ Sorry, I encountered an error. Please try again or contact support.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAction = (query) => {
        setInput(query);
        handleSend(query);
    };

    return (
        <>
            {/* Floating AI Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 bg-gradient-to-r from-[#163932] to-[#235347] text-white p-4 rounded-full shadow-2xl hover:shadow-[#163932]/50 transition-all z-50 flex items-center gap-2"
                    >
                        <Sparkles size={24} className="animate-pulse" />
                        <span className="font-semibold pr-2">AI Assistant</span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* AI Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-6 right-6 w-96 h-[600px] bg-white border-2 border-[#9FD2A7] rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#163932] to-[#235347] text-white p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles size={20} className="animate-pulse" />
                                <div>
                                    <h3 className="font-bold">AI Assistant</h3>
                                    <p className="text-xs opacity-90">Powered by GPT-4</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-white/20 p-1 rounded transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Quick Actions */}
                        <div className="p-3 bg-[#DAF1DE] border-b border-[#9FD2A7]">
                            <p className="text-xs text-slate-600 mb-2 font-medium">Quick Actions:</p>
                            <div className="grid grid-cols-2 gap-2">
                                {quickActions.map((action, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleQuickAction(action.query)}
                                        className="flex items-center gap-2 p-2 bg-white border border-[#9FD2A7] rounded-lg hover:bg-[#C8E8CE] transition-all text-xs font-medium text-[#163932]"
                                    >
                                        <action.icon size={14} />
                                        <span>{action.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#DAF1DE]/20">
                            {messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] p-3 rounded-lg ${message.role === 'user'
                                            ? 'bg-[#163932] text-white'
                                            : 'bg-white border border-[#9FD2A7] text-[#051F20]'
                                        }`}>
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        {message.confidence && (
                                            <p className="text-xs mt-2 opacity-70">
                                                Confidence: {(message.confidence * 100).toFixed(0)}%
                                            </p>
                                        )}
                                        <p className="text-xs mt-1 opacity-60">
                                            {new Date(message.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-white border border-[#9FD2A7] p-3 rounded-lg">
                                        <div className="flex gap-2">
                                            <div className="w-2 h-2 bg-[#163932] rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-[#163932] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-2 h-2 bg-[#163932] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-3 bg-white border-t border-[#9FD2A7]">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask me anything about your inventory..."
                                    className="flex-1 px-3 py-2 border border-[#9FD2A7] rounded-lg focus:outline-none focus:border-[#163932] focus:ring-2 focus:ring-[#163932]/20 text-sm"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={isLoading || !input.trim()}
                                    className="bg-[#163932] text-white p-2 rounded-lg hover:bg-[#235347] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIAssistant;
