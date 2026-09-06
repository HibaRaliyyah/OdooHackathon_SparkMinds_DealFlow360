'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, Loader2, Heart, MessageCircle } from 'lucide-react';
import { useStore } from '@/lib/data/store';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

const QUICK_QUESTIONS = [
  'What is the status of my quotation?',
  'How do I confirm and pay for my order?',
  'Can I negotiate the price?',
  'How does recurring billing work?',
  'Where can I download my invoice?',
];

function renderStructuredContent(rawText: string) {
  const cleanText = rawText.replace(/\*/g, '');
  const lines = cleanText.split('\n');

  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        if (/^[-–•]\s+/.test(trimmed)) {
          const content = trimmed.replace(/^[-–•]\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1 my-1">
              <span className="text-violet-500 font-bold text-xs select-none">•</span>
              <span className="flex-1 font-medium">{content}</span>
            </div>
          );
        }

        const numberedMatch = trimmed.match(/^(\d+)[\.)] (.+)/);
        if (numberedMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5 my-1">
              <span className="px-1.5 py-0.5 rounded bg-violet-100 text-violet-900 font-black text-[10px] font-mono shrink-0">
                {numberedMatch[1]}
              </span>
              <span className="flex-1 font-semibold text-slate-800">{numberedMatch[2]}</span>
            </div>
          );
        }

        if (trimmed.endsWith(':') && trimmed.length < 60) {
          return (
            <div key={idx} className="font-extrabold text-violet-900 mt-2 mb-1 border-b border-violet-100 pb-0.5">
              {trimmed}
            </div>
          );
        }

        return <p key={idx} className="leading-relaxed">{trimmed}</p>;
      })}
    </div>
  );
}

export function DealFlowCustomerChat() {
  const { currentUser, quotations } = useStore();
  const customerName = currentUser?.name?.split(' ')[0] || 'there';

  const [isOpen, setIsOpen] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const customerQuote = quotations.find(
    (q) =>
      q.customerName?.toLowerCase().includes(currentUser?.company?.toLowerCase() || '') ||
      q.customerName?.includes('Acme')
  );

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hey ${customerName}! 👋 I'm DealFlow, your personal assistant.\n\nI'm here to help you with your quotes, payments, orders, and anything else you need. Just ask me anything — I'm super friendly! 😊`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // Pulse notification after 4s to encourage opening
  useEffect(() => {
    const t = setTimeout(() => setHasGreeted(true), 4000);
    return () => clearTimeout(t);
  }, []);

  // Authorization check: only customer role (CUSTOMER) can access the DealFlow Customer Assistant
  if (!currentUser || currentUser.role !== 'CUSTOMER') {
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
      // Build customer context for the AI
      const contextNote = customerQuote
        ? `The customer's active quotation is ${customerQuote.quoteNumber} (Stage: ${customerQuote.stage}, Total: $${((customerQuote.oneTimeTotal || 0) + (customerQuote.recurringTotal || 0)).toLocaleString()}).`
        : 'No active quotation found for this customer.';

      const systemPrompt = `You are DealFlow, the friendly and warm customer support assistant for DealFlow360 Customer Portal.
Customer Name: ${customerName}
Active Quotation Context: ${contextNote}

STRICT SECURITY & AUTHORIZATION RULES:
1. CUSTOMER PORTAL SCOPE ONLY: You ONLY assist the customer with their own quotations, order approvals, invoices, payment methods, billing frequencies (One-Time / Recurring), and delivery tracking.
2. STRICTLY FORBIDDEN (ADMINISTRATION ACCESS RESTRICTION):
   - You MUST NOT display, explain, or answer ANY administration or internal operational questions.
   - NEVER disclose internal margins, base cost prices, markup rules, or backend financial formulas.
   - NEVER disclose internal multi-warehouse allocation algorithms, stock movements, supplier details, or warehouse reordering rules.
   - NEVER disclose sales manager approval thresholds, discount governance matrices, or internal risk scoring flags.
   - NEVER discuss admin settings, user permission management, audit trails, employee records, or other customers' confidential data.
3. REFUSAL PROTOCOL: If the customer asks about administration, internal management, backend settings, staff approval policies, or internal systems, politely decline: "I can only assist with your quotes, invoices, payment options, and customer portal questions. For administrative or internal inquiries, please contact your account manager directly."
4. TONE & FORMATTING: Always be warm, friendly, concise, and helpful. DO NOT use asterisks (*). Format responses with clean paragraphs, bullet points (•), or numbered steps.`;

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
          systemPrompt,
          role: 'CUSTOMER',
          userName: currentUser.name
        }),
      });

      const data = await res.json();
      const reply =
        data.reply ||
        `I'm here to help, ${customerName}! Could you rephrase your question and I'll do my best to assist you. 😊`;

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'bot',
          text: `Oops, I hit a small snag! 😅 Please try again in a moment, ${customerName}. I'm always here for you!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none flex flex-col items-end gap-3">
      {/* Chat Window */}
      {isOpen && (
        <div
          className="w-[370px] max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-violet-100"
          style={{ height: '530px' }}
        >
          {/* Header */}
          <div
            className="p-4 flex items-center justify-between shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)',
            }}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center shadow-inner">
                  <span className="text-lg font-black text-white leading-none select-none">D</span>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-purple-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-white tracking-tight">DealFlow</h3>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-400 text-emerald-950 uppercase tracking-wide">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-purple-200 font-medium">Your personal portal assistant ✨</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[90%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar icon */}
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    msg.sender === 'user'
                      ? 'bg-violet-600 text-white'
                      : 'bg-white text-violet-600 border border-violet-200 shadow-sm'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <span className="font-black text-sm leading-none">D</span>
                  )}
                </div>

                <div>
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-violet-600 text-white rounded-tr-none font-medium'
                        : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none'
                    }`}
                  >
                    {msg.sender === 'user' ? msg.text : renderStructuredContent(msg.text)}
                  </div>
                  <div className={`text-[9px] text-slate-400 mt-1 font-mono ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 mr-auto items-center text-xs text-violet-800 font-semibold bg-violet-50 px-3.5 py-2.5 rounded-2xl border border-violet-200 shadow-sm max-w-[80%]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-500 shrink-0" />
                <span>DealFlow is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 overflow-x-auto flex gap-1.5 scrollbar-none">
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 shrink-0 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask me anything, ${customerName}...`}
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white transition-all shadow-md cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating launcher button */}
      <button
        onClick={() => { setIsOpen(!isOpen); setHasGreeted(false); }}
        className="relative w-14 h-14 rounded-full text-white shadow-2xl flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 cursor-pointer border-2 border-white/30"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)' }}
        aria-label="Open DealFlow Assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            {/* Pulsing notification dot */}
            {hasGreeted && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-violet-900 flex items-center justify-center animate-bounce">
                <Heart className="w-2 h-2 text-violet-900" />
              </span>
            )}
          </>
        )}
      </button>

      {/* Tooltip bubble (shown before first open) */}
      {hasGreeted && !isOpen && (
        <div
          className="absolute bottom-16 right-0 bg-white border border-violet-200 rounded-2xl px-3.5 py-2.5 shadow-xl text-xs font-semibold text-slate-800 whitespace-nowrap animate-in slide-in-from-bottom-2 duration-300"
          style={{ pointerEvents: 'none' }}
        >
          👋 Hi {customerName}! Need help?
          <span className="absolute bottom-[-6px] right-5 w-3 h-3 bg-white border-b border-r border-violet-200 rotate-45" />
        </div>
      )}
    </div>
  );
}
