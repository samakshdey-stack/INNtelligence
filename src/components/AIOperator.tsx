import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  Clock,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Building,
  Shield,
  Layers,
} from 'lucide-react';
import { AIQueryResponse } from '../types';
import { api } from '../lib/api';

interface AIOperatorProps {
  onSelectRoom?: (roomId: string) => void;
  onSelectGuest?: (guestId: string) => void;
  onSelectReservation?: (reservationId: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  responseObj?: AIQueryResponse;
  timestamp: string;
}

export const AIOperator: React.FC<AIOperatorProps> = ({
  onSelectRoom,
  onSelectGuest,
  onSelectReservation,
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'ai',
      text: 'Good day. I am INNtelligence, the operational intelligence engine for The Meridian Kolkata. You can ask me factual queries about rooms, guest stays, today\'s arrivals, housekeeping statuses, or financial estimates in English, हिन्दी, or Hinglish.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setLoading(true);

    try {
      const aiResponse = await api.queryAI(textToSend);
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponse.answer,
        responseObj: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        text: 'I apologize, but I encountered an error accessing the live database. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    { text: 'How many rooms are vacant?', lang: 'English' },
    { text: 'Who is staying in room 204?', lang: 'English' },
    { text: 'Who checked in today?', lang: 'English' },
    { text: 'Which rooms are under maintenance?', lang: 'English' },
    { text: 'Show me today\'s arrivals.', lang: 'English' },
    { text: 'आज कितने कमरे खाली हैं?', lang: 'हिन्दी' },
    { text: 'Aaj kitne rooms vacant hain?', lang: 'Hinglish' },
    { text: 'Room 105 mein kaun hai?', lang: 'Hinglish' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Header Card */}
      <div className="rounded-3xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-2xl sm:text-3xl font-serif italic text-white/95 tracking-tight">
                INNtelligence AI Operator
              </h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(34,197,94,0.8)] animate-pulse" />
                Live Operational Snapshot Grounding
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/40">
              Query hotel occupancy, guest stays, housekeeping, and front desk operations in real time.
            </p>
          </div>

          <button
            onClick={() =>
              setMessages([
                {
                  id: 'welcome-msg',
                  sender: 'ai',
                  text: 'Good day. I am INNtelligence, the operational intelligence engine for The Meridian Kolkata. How may I assist you with your hotel operations?',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ])
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/60 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Session</span>
          </button>
        </div>

        {/* Prompt Suggestions Grid */}
        <div className="space-y-2.5 pt-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> Suggested Realtime Queries
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.text)}
                className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 text-left transition-all group space-y-1.5 backdrop-blur-md"
              >
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-amber-300 border border-amber-500/20">
                  {p.lang}
                </span>
                <p className="text-xs text-white/70 group-hover:text-white transition-colors line-clamp-2">
                  {p.text}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Chat Terminal Window */}
      <div className="rounded-3xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col min-h-[480px]">
        {/* Messages Stream */}
        <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto max-h-[600px]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 text-xs sm:text-sm ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                    : 'bg-white/10 border border-amber-500/30 text-amber-400'
                }`}
              >
                {msg.sender === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-400" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-5 space-y-2.5 shadow-lg ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-black font-medium'
                    : 'bg-white/[0.04] border border-white/10 text-white/90 backdrop-blur-md'
                }`}
              >
                <div className="flex items-center justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-2">
                  <span className="font-semibold text-xs opacity-90">
                    {msg.sender === 'user' ? 'You (Staff / GM)' : 'INNtelligence Engine'}
                  </span>
                  <div className="flex items-center gap-2">
                    {msg.responseObj && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-black/20 text-amber-300 border border-amber-400/20">
                        {msg.responseObj.languageDetected}
                      </span>
                    )}
                    <span className="text-[10px] font-mono opacity-50">{msg.timestamp}</span>
                  </div>
                </div>

                <p className="leading-relaxed whitespace-pre-wrap font-sans text-sm">{msg.text}</p>

                {/* Entity Navigation Buttons */}
                {msg.responseObj?.relatedEntities && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/10 text-xs">
                    <span className="text-white/40 text-[10px] uppercase tracking-wider">Direct Shortcuts:</span>
                    {msg.responseObj.relatedEntities.rooms?.map((rNum) => (
                      <button
                        key={rNum}
                        onClick={() => onSelectRoom?.(`room-${rNum}`)}
                        className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-amber-300 border border-amber-500/20 font-mono text-[11px] transition-colors"
                      >
                        Room {rNum} &rarr;
                      </button>
                    ))}
                    {msg.responseObj.relatedEntities.reservations?.map((resId) => (
                      <button
                        key={resId}
                        onClick={() => onSelectReservation?.(resId)}
                        className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-emerald-300 border border-emerald-500/20 font-mono text-[11px] transition-colors"
                      >
                        {resId} &rarr;
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-xs text-white/50 p-4 bg-white/5 rounded-2xl border border-white/10 w-fit">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Analyzing live database snapshot & verifying factual records...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-white/[0.02]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask INNtelligence anything about current operations..."
              className="w-full bg-white/5 border border-white/15 focus:border-amber-500/60 rounded-2xl pl-5 pr-28 py-4 text-sm sm:text-base text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all font-sans"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-black text-xs font-bold transition-all shadow-md shadow-amber-500/20"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Send</span>}
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
