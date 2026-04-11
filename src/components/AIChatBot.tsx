import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, User, Bot, Phone, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';

interface Message {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_SUPPORT_NUMBER || "+15551234567";

export const WhatsAppBot = () => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar' || language === 'darija';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: t('aiBotGreeting'),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        console.error("CRITICAL ERROR: VITE_GEMINI_API_KEY is missing or using placeholder in Production.");
        setMessages(prev => [...prev, {
          role: 'bot',
          content: t('apiKeyMissing'),
          timestamp: new Date(),
        }]);
        setIsLoading(false);
        return;
      }

      console.log("Gemini API initialized with key:", apiKey.substring(0, 4) + "...");
      const ai = new GoogleGenAI({ apiKey });
      const model = "gemini-3-flash-preview";
      
      const systemInstruction = `
        You are the official PetsBird.com AI Assistant, a "Pro Bird Breeding Expert".
        
        Personality:
        - Helpful, professional, and friendly.
        - You are an expert in avian care, genetics, nutrition, and breeding cycles.
        
        Context:
        - You represent PetsBird.com, the leading platform for bird breeders.
        - You help users with bird breeding advice and guide them on platform features.
        
        Supported Species:
        - Canary, Goldfinch (Hassoun), Budgie (Perruche), Cockatiel (Calopsitte), Lovebird (Inseparable), Zebra Finch (Mandarin), Grey Parrot (Gris du Gabon), Amazon Parrot, Conure, Diamond Dove.
        
        Platform Features:
        - Dashboard: Overview of aviary stats.
        - Your Birds: Management of bird inventory.
        - Nests: Tracking breeding pairs and egg progress.
        - Pedigree: Visual bird lineage.
        - Marketplace: Buying and selling birds.
        - Digital Passport: QR codes for bird profiles.
        
        Language Support (CRITICAL):
        - Your primary language support includes Moroccan Darija (dialect), Arabic, French, and English.
        - When a user speaks in Moroccan Darija (e.g., using words like "فريخات", "بغيت نسجل", "شنو ندير", "خدم هد زمر"), you MUST respond naturally in Darija using the same script (Arabic or Latin/Arabizi) the user used.
        - Use local Moroccan breeding terminology when speaking Darija (e.g., "الولاعة", "التزاوج", "البيض", "الفراخ").
        - Be warm and welcoming, like a fellow breeder sharing expertise.
        
        If you cannot answer a specific technical question or if the user wants to talk to a human, suggest they contact ${WHATSAPP_NUMBER} on WhatsApp.
      `;

      // Include conversation history (last 5 messages)
      // CRITICAL: Gemini requires the first message in 'contents' to be from 'user'
      const history = messages
        .filter((msg, index) => index > 0 || msg.role === 'user') // Skip initial bot greeting if it's the first message
        .slice(-5)
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }));

      const response = await ai.models.generateContent({
        model,
        contents: [
          ...history.map(h => ({ role: h.role as any, parts: h.parts })),
          { role: 'user', parts: [{ text: input }] }
        ],
        config: {
          systemInstruction,
        }
      });

      const botMessage: Message = {
        role: 'bot',
        content: response.text || t('aiBotError'),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages(prev => [...prev, {
        role: 'bot',
        content: t('aiChatConnectionError'),
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const openWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}`, '_blank');
  };

  return (
    <div className={cn(
      "fixed bottom-24 z-[100] flex flex-col",
      isRTL ? "left-6 items-start" : "right-6 items-end"
    )}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[350px] sm:w-[400px] bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col h-[500px]"
          >
            {/* Header */}
            <div className="bg-[#25D366] p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-bold">{t('aiBotName')}</h3>
                  <p className="text-xs text-white/80">{t('aiBotStatus')}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 custom-scrollbar"
            >
              {messages.map((msg, i) => (
                <div 
                  key={i}
                  className={cn(
                    "flex gap-3 max-w-[85%]",
                    msg.role === 'user' ? (isRTL ? "mr-auto flex-row-reverse" : "ml-auto flex-row-reverse") : ""
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    msg.role === 'user' ? "bg-indigo-100 text-indigo-600" : "bg-[#25D366]/10 text-[#25D366]"
                  )}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={cn(
                    "p-4 rounded-2xl text-sm shadow-sm",
                    msg.role === 'user' 
                      ? (isRTL ? "bg-indigo-600 text-white rounded-tl-none" : "bg-indigo-600 text-white rounded-tr-none")
                      : (isRTL ? "bg-white text-slate-700 rounded-tr-none border border-slate-100" : "bg-white text-slate-700 rounded-tl-none border border-slate-100")
                  )}>
                    {msg.content}
                    <p className={cn(
                      "text-[10px] mt-2 opacity-50",
                      msg.role === 'user' ? (isRTL ? "text-left" : "text-right") : ""
                    )}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100 space-y-3">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={t('typeMessage')}
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366] transition-all"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  className="p-2 bg-[#25D366] text-white rounded-xl hover:bg-[#128C7E] transition-all disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </div>
              <button 
                onClick={openWhatsApp}
                className="w-full py-2 bg-slate-50 text-[#25D366] border border-[#25D366]/20 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#25D366]/5 transition-all"
              >
                <Phone size={14} />
                {t('talkToHuman')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-white transition-all",
          isOpen ? "bg-slate-800 rotate-90" : "bg-[#25D366] hover:bg-[#128C7E]"
        )}
      >
        {isOpen ? <X size={32} /> : <MessageCircle size={32} />}
      </motion.button>
    </div>
  );
};
