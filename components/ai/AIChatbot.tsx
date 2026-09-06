'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MessageSquare, X, Send, Bot, User, Loader2, Zap } from 'lucide-react';
import { useStore } from '@/lib/data/store';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

const QUICK_QUESTIONS = [
  'How does warehouse split allocation work?',
  'How do I setup recurring subscription billing?',
  'What discounts require Sales Manager approval?',
  'How do I accept & confirm a quotation?',
];

// Clean helper function to strip literal asterisks and render clean, structured output
function renderStructuredContent(rawText: string) {
  // Strip all asterisks (*)
  const cleanText = rawText.replace(/\*/g, '');
  const lines = cleanText.split('\n');

  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        // Bullet point detection (- or •)
        if (/^[-–•]\s+/.test(trimmed)) {
          const content = trimmed.replace(/^[-–•]\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1 my-1">
              <span className="text-purple-600 font-bold text-xs select-none">•</span>
              <span className="flex-1 font-medium">{content}</span>
            </div>
          );
        }

        // Numbered list detection (1. or 1))
        const numberedMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)/);
        if (numberedMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5 my-1">
              <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 font-black text-[10px] font-mono shrink-0">
                {numberedMatch[1]}
              </span>
              <span className="flex-1 font-semibold text-slate-800">{numberedMatch[2]}</span>
            </div>
          );
        }

        // Section header detection (e.g. "Key Details:")
        if (trimmed.endsWith(':') && trimmed.length < 60) {
          return (
            <div key={idx} className="font-extrabold text-purple-900 mt-2 mb-1 border-b border-purple-100 pb-0.5">
              {trimmed}
            </div>
          );
        }

        // Regular paragraph
        return (
          <p key={idx} className="leading-relaxed">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

export function AIChatbot() {
  const { currentUser } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hello! I am your DealFlow Copilot. How can I help you with quotations, deal health, warehouse splits, or billing today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Authorization check: only internal staff roles (ADMIN, SALES_REP, SALES_MANAGER, FINANCE) can access
  if (!currentUser || currentUser.role === 'CUSTOMER') {
    return null;
  }

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.text,
        }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: query, 
          history,
          role: currentUser.role,
          userName: currentUser.name,
        }),
      });

      const data = await res.json();
      const botReplyText = data.reply || "I'm DealFlow Copilot. I can help with all your quotes, warehouse allocations, and billing!";

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: 'Apologies, I encountered a temporary connection issue. Please feel free to re-ask your question!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none">
      {/* Expanded Chat Dialog Window */}
      {isOpen && (
        <div className="mb-4 w-96 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[520px] animate-in zoom-in-95 duration-200 text-slate-900">
          {/* Top Header */}
          <div className="p-4 bg-purple-700 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white font-black shadow-inner">
                <Bot className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-white">DealFlow Copilot</h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-400 text-slate-950 uppercase">
                    Copilot Active
                  </span>
                </div>
                <p className="text-[11px] text-purple-100 font-medium">B2B CPQ, Warehouse Splits & Billing Intelligence</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[88%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    msg.sender === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-purple-700 border border-slate-200 shadow-sm'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-purple-600" />}
                </div>

                <div>
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-purple-600 text-white rounded-tr-none font-medium shadow-sm'
                        : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none font-normal shadow-sm'
                    }`}
                  >
                    {msg.sender === 'user' ? msg.text : renderStructuredContent(msg.text)}
                  </div>
                  <div
                    className={`text-[9px] text-slate-400 mt-1 font-mono ${
                      msg.sender === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 max-w-[88%] mr-auto items-center text-xs text-purple-900 font-bold bg-purple-50 p-3 rounded-2xl border border-purple-200 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span>DealFlow Copilot is generating answer...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="p-2 bg-white border-t border-slate-200 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 shrink-0 transition-all cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI about quotes, fulfillment, billing..."
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white transition-all shadow-md cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Launcher Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-purple-700 hover:bg-purple-600 text-white shadow-2xl flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 border-2 border-white/30 cursor-pointer relative group"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-purple-900 flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-purple-950" />
            </span>
          </>
        )}
      </button>
    </div>
  );
}
