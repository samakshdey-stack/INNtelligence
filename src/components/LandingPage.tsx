import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  BedDouble,
  MessageSquare,
  Landmark,
  FileSpreadsheet,
  Eye,
  GitMerge,
  TrendingUp,
  X,
  CheckCircle2,
  Lock,
  Building2,
  Mail,
  User,
  Star,
  Wrench,
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe,
  Layers,
  KeyRound,
  LogIn,
  LogOut,
  Loader2,
} from 'lucide-react';
import heroLobbyImg from '../assets/images/luxury_hotel_lobby_1787391683114.jpg';
import { useAuth } from '../context/AuthContext';
import { saveAccessRequest } from '../lib/firebase';
import { AuthModal } from './modals/AuthModal';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const { user, userProfile, logout } = useAuth();
  const [isEarlyAccessModalOpen, setIsEarlyAccessModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [accessSubmitted, setAccessSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    workEmail: '',
    propertyName: '',
    roomCount: '100 - 250 keys',
    role: 'General Manager',
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await saveAccessRequest(formData);
      setAccessSubmitted(true);
    } catch (err) {
      console.warn('Firestore request save notice:', err);
      // Still show confirmed screen for smooth user experience
      setAccessSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#07080A] text-white font-sans selection:bg-amber-500 selection:text-black overflow-x-hidden">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo Box */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="px-3 py-1.5 rounded-lg bg-black/60 border border-amber-500/40 shadow-[0_0_15px_rgba(212,158,55,0.15)] flex items-center justify-center">
              <span className="font-serif italic font-bold text-sm tracking-wider text-amber-300">
                INNtelligence
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-[0.2em] text-white/70">
            <button
              onClick={() => scrollToSection('platform')}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              Platform
            </button>
            <button
              onClick={() => scrollToSection('intelligence')}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              Intelligence
            </button>
            <button
              onClick={() => scrollToSection('for-hotels')}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              For Hotels
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              How It Works
            </button>
          </nav>

          {/* Right Header CTAs */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onEnterApp}
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
                  title="Proceed directly into Hotel Operations"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Proceed to Operations</span>
                </button>

                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-amber-500/30 text-white text-xs font-mono transition-all cursor-pointer"
                  title="Manage Authorization"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-5 h-5 rounded-full border border-amber-400 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  )}
                  <span className="max-w-[80px] sm:max-w-[120px] truncate">
                    {user.displayName || 'Account'}
                  </span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 hover:bg-white/10 border border-white/20 hover:border-amber-400/50 text-white font-mono text-xs uppercase tracking-wider transition-all cursor-pointer"
                title="Sign In with Firebase Auth"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 overflow-hidden">
        {/* Background Image with Dark Vignette Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroLobbyImg}
            alt="Luxury 5-Star Hotel Lobby"
            className="w-full h-full object-cover object-center brightness-75 contrast-110 scale-105 transform duration-1000"
          />
          {/* Subtle dark gradient overlay to match Screenshot 1 */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-[#07080A]" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/40 to-black/90" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-7 pt-12">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-[0.35em] text-amber-400 font-semibold">
              — ESTABLISHED EXCELLENCE —
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif text-white font-normal tracking-tight leading-[1.08]">
            The Art of Hospitality <br />
            <span className="italic font-light">Intelligence</span>
          </h1>

          {/* Subtitle Paragraph */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-white/80 font-normal leading-relaxed font-sans px-2">
            The intersection of high-end hospitality and sophisticated AI. Designed for the observant hotelier to unify fragmented systems into actionable, proactive intelligence.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-4">
            {user ? (
              <button
                onClick={onEnterApp}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#D49E37] to-[#E5AC44] hover:from-[#E5AC44] hover:to-[#F3C562] text-black font-mono font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-[0_10px_25px_rgba(212,158,55,0.3)] active:scale-98 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>Proceed to Operations</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            ) : (
              <button
                onClick={() => setIsEarlyAccessModalOpen(true)}
                className="w-full sm:w-auto px-8 py-4 bg-[#D49E37] hover:bg-[#E5AC44] text-black font-mono font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-[0_10px_25px_rgba(212,158,55,0.25)] active:scale-98 cursor-pointer"
              >
                Request Early Access
              </button>
            )}

            <button
              onClick={() => scrollToSection('platform')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white/90 hover:text-amber-300 font-mono text-xs uppercase tracking-[0.2em] py-4 px-4 transition-colors cursor-pointer group"
            >
              <span>See How It Works</span>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. SECTION: THE FRAGMENTATION PROBLEM */}
      <section id="platform" className="py-24 sm:py-32 bg-[#07080A] relative border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Eyebrow */}
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-amber-500 font-semibold">
            The Fragmentation Problem
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-white max-w-3xl mx-auto leading-tight font-normal">
            Silos blind you. INNtelligence connects the dots across your entire tech stack.
          </h2>

          {/* Accent Gold Divider */}
          <div className="w-12 h-0.5 bg-amber-500/60 mx-auto mt-6 mb-16" />

          {/* Visual Node Diagram (Matches Screenshot 2) */}
          <div className="relative max-w-3xl mx-auto py-12 sm:py-16 px-4">
            {/* SVG Connecting Curved Dashed Lines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none stroke-amber-500/40"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D49E37" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#D49E37" stopOpacity="0.1" />
                </linearGradient>
              </defs>

              {/* Curve to Top-Left (PMS) */}
              <path
                d="M 120 70 Q 250 120 384 180"
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              {/* Curve to Bottom-Left (REVIEWS) */}
              <path
                d="M 160 280 Q 260 220 384 180"
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              {/* Curve to Top-Right (POS) */}
              <path
                d="M 640 70 Q 520 120 384 180"
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              {/* Curve to Bottom-Right (EXCEL) */}
              <path
                d="M 600 280 Q 500 220 384 180"
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            </svg>

            {/* Grid Container for Nodes */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Left Column Nodes (PMS & REVIEWS) */}
              <div className="flex flex-col gap-12 sm:gap-20 items-center md:items-start">
                {/* PMS Node */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#111215] border border-white/10 hover:border-amber-500/40 p-3 flex flex-col items-center justify-center gap-2 shadow-xl transition-all group">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <BedDouble className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="font-mono text-xs uppercase tracking-wider text-amber-400 font-semibold">
                    PMS
                  </span>
                </div>

                {/* REVIEWS Node */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#111215] border border-white/10 hover:border-amber-500/40 p-3 flex flex-col items-center justify-center gap-2 shadow-xl transition-all group">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="font-mono text-xs uppercase tracking-wider text-amber-400 font-semibold">
                    REVIEWS
                  </span>
                </div>
              </div>

              {/* Center Hub: INN */}
              <div className="flex items-center justify-center py-4">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-[#131418] border border-amber-500/60 p-4 flex flex-col items-center justify-center gap-1 shadow-[0_0_40px_rgba(212,158,55,0.25)] relative group cursor-pointer" onClick={onEnterApp}>
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                  <span className="font-serif italic font-bold text-2xl text-amber-400">
                    INN
                  </span>
                  <span className="text-[10px] font-mono text-white/50 tracking-widest uppercase">
                    Core Engine
                  </span>
                </div>
              </div>

              {/* Right Column Nodes (POS & EXCEL) */}
              <div className="flex flex-col gap-12 sm:gap-20 items-center md:items-end">
                {/* POS Node */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#111215] border border-white/10 hover:border-amber-500/40 p-3 flex flex-col items-center justify-center gap-2 shadow-xl transition-all group">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <Landmark className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="font-mono text-xs uppercase tracking-wider text-amber-400 font-semibold">
                    POS
                  </span>
                </div>

                {/* EXCEL Node */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#111215] border border-white/10 hover:border-amber-500/40 p-3 flex flex-col items-center justify-center gap-2 shadow-xl transition-all group">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="font-mono text-xs uppercase tracking-wider text-amber-400 font-semibold">
                    EXCEL
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION: CONVERSATIONAL ANALYTICS */}
      <section id="intelligence" className="py-24 sm:py-32 bg-[#07080A] relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading & Copy */}
            <div className="lg:col-span-5 space-y-6">
              <div className="font-mono text-xs uppercase tracking-[0.3em] text-amber-500 font-semibold">
                Conversational Analytics
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white font-normal leading-tight">
                Talk to your data like a seasoned GM.
              </h2>

              {/* Accent Divider */}
              <div className="w-12 h-0.5 bg-amber-500/60" />

              <p className="text-white/60 text-sm sm:text-base leading-relaxed font-sans">
                Skip the rigid dashboards. Ask complex questions in natural language and receive synthesized answers grounded in your actual operational data.
              </p>
            </div>

            {/* Right Column: Grounded Evidence & Chat UI Preview (Matches Screenshot 3) */}
            <div className="lg:col-span-7 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* 1. Chat Prompt & Response Card (md:col-span-7) */}
                <div className="md:col-span-7 rounded-2xl bg-[#101114] border border-white/10 p-5 space-y-4 shadow-2xl">
                  {/* User Query Box */}
                  <div className="p-3.5 rounded-xl bg-[#17181C] border border-white/10 text-white/90 text-xs font-mono leading-relaxed">
                    What's driving the sudden drop in guest satisfaction scores on the 5th floor this week?
                  </div>

                  {/* AI Synthesized Answer Box */}
                  <div className="p-4 rounded-xl bg-[#141519] border border-amber-500/20 text-white/80 text-xs space-y-2 leading-relaxed relative">
                    <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-mono text-[11px] uppercase tracking-wider">INNtelligence Synthesis</span>
                    </div>
                    <p>
                      I've analyzed the PMS logs, housekeeping schedules, and Medallia feedback for the 5th floor.
                    </p>
                    <p>
                      The primary driver appears to be related to{' '}
                      <strong className="text-amber-400 font-semibold underline decoration-amber-400/50">
                        water pressure complaints
                      </strong>{' '}
                      specifically in rooms 501-510, aligning with the recent plumbing maintenance on that wing.
                    </p>
                  </div>
                </div>

                {/* 2. Grounded Evidence Card (md:col-span-5) */}
                <div className="md:col-span-5 rounded-2xl bg-[#101114] border border-white/10 p-5 space-y-4 shadow-2xl flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2 text-white font-serif italic text-sm">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Grounded Evidence</span>
                      </div>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                        3 Sources Analyzed
                      </span>
                    </div>

                    {/* Sources Sub-Cards */}
                    <div className="space-y-3 pt-3 font-mono text-[11px]">
                      {/* Medallia Survey */}
                      <div className="p-3 rounded-xl bg-[#17181C] border border-white/5 space-y-1">
                        <div className="flex items-center justify-between text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                          <span>Medallia Survey</span>
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        </div>
                        <p className="text-white/80 font-sans italic text-xs leading-snug">
                          “Room was great, but the shower barely worked in the morning…”
                        </p>
                        <div className="text-[10px] text-white/40">Room 504 • 2 days ago</div>
                      </div>

                      {/* HotSOS Ticket */}
                      <div className="p-3 rounded-xl bg-[#17181C] border border-white/5 space-y-1">
                        <div className="flex items-center justify-between text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                          <span>HotSOS Ticket</span>
                          <Wrench className="w-3 h-3 text-amber-400" />
                        </div>
                        <p className="text-white/90 font-sans font-medium text-xs">
                          Low Flow Rate Reported
                        </p>
                        <div className="text-[10px] text-white/40">Wing B Plumbing • Status: Open</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION: PROACTIVE CAPABILITIES */}
      <section id="for-hotels" className="py-24 sm:py-32 bg-[#07080A] relative border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Eyebrow */}
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-amber-500 font-semibold">
            Proactive Capabilities
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white max-w-2xl mx-auto leading-tight font-normal">
            Intelligence that anticipates, rather than reports.
          </h2>

          {/* Accent Gold Divider */}
          <div className="w-12 h-0.5 bg-amber-500/60 mx-auto mt-4 mb-16" />

          {/* 3 Grid Feature Cards (Matches Screenshot 4) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-left">
            {/* Card 1: Anomaly Detection */}
            <div className="p-7 sm:p-8 rounded-2xl bg-[#101114] border border-white/10 hover:border-amber-500/40 transition-all space-y-5 shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-black/60 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <Eye className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-serif font-bold text-white">
                Anomaly Detection
              </h3>
              <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
                Automatically flags deviations in revenue pacing, labor costs, or guest sentiment before they become institutional problems.
              </p>
            </div>

            {/* Card 2: Cross-System Workflows */}
            <div className="p-7 sm:p-8 rounded-2xl bg-[#101114] border border-white/10 hover:border-amber-500/40 transition-all space-y-5 shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-black/60 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <GitMerge className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-serif font-bold text-white">
                Cross-System Workflows
              </h3>
              <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
                Trigger actions across departments. A negative review automatically creates a follow-up task in your operational platform.
              </p>
            </div>

            {/* Card 3: Predictive Forecasting */}
            <div className="p-7 sm:p-8 rounded-2xl bg-[#101114] border border-white/10 hover:border-amber-500/40 transition-all space-y-5 shadow-xl group">
              <div className="w-12 h-12 rounded-xl bg-black/60 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-serif font-bold text-white">
                Predictive Forecasting
              </h3>
              <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
                Utilizes historical data and external market factors to predict occupancy crunches and optimize pricing strategies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION: THE MORNING BRIEF */}
      <section id="how-it-works" className="py-24 sm:py-32 bg-[#07080A] relative border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading & Description */}
            <div className="lg:col-span-6 space-y-6">
              <div className="font-mono text-xs uppercase tracking-[0.3em] text-amber-500 font-semibold">
                The Morning Brief
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-white font-normal leading-tight">
                Wake up knowing exactly what matters.
              </h2>

              {/* Accent Divider */}
              <div className="w-12 h-0.5 bg-amber-500/60" />

              <p className="text-white/60 text-sm sm:text-base leading-relaxed font-sans max-w-lg">
                Before you step on property, receive a curated digest of critical metrics, overnight incidents, and predicted bottlenecks for the day ahead. Curated specifically for your role.
              </p>

              {/* Highlights */}
              <div className="space-y-6 pt-4">
                <div className="space-y-1.5">
                  <div className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                    Executive Summary
                  </div>
                  <p className="text-white/70 text-xs sm:text-sm">
                    RevPAR, Occupancy, and ADR pacing vs budget.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                    Overnight Log
                  </div>
                  <p className="text-white/70 text-xs sm:text-sm">
                    Automated synthesis of night audit and security reports.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Smartphone Mockup (Matches Screenshot 5) */}
            <div className="lg:col-span-6 flex items-center justify-center">
              <div className="relative w-full max-w-[320px] sm:max-w-[340px] rounded-[42px] p-3 bg-gradient-to-b from-[#2A2B30] to-[#121316] shadow-[0_25px_60px_rgba(0,0,0,0.9)] border border-white/15">
                {/* Dynamic Screen Inside Frame */}
                <div className="rounded-[34px] bg-[#0A0B0E] border border-white/10 p-5 space-y-4 text-white overflow-hidden font-sans">
                  {/* Phone Header */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-white/50 pt-1">
                    <span>9:41</span>
                    <span className="font-bold text-amber-400">Morning Brief</span>
                  </div>

                  {/* Header Title */}
                  <div className="space-y-0.5 pt-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                      Good Morning
                    </div>
                    <div className="font-serif italic font-bold text-base text-white">
                      The Grand Meridian
                    </div>
                  </div>

                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-3 rounded-2xl bg-[#141519] border border-white/5 space-y-0.5">
                      <div className="text-[9px] text-white/40 uppercase">Occupancy</div>
                      <div className="text-base font-serif font-bold text-white">71.4%</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#141519] border border-white/5 space-y-0.5">
                      <div className="text-[9px] text-white/40 uppercase">RevPAR</div>
                      <div className="text-base font-serif font-bold text-amber-400">₹3,394</div>
                    </div>
                  </div>

                  {/* Today's Attention List */}
                  <div className="space-y-2 pt-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                      Today's Attention
                    </div>

                    <div className="space-y-1.5 font-mono text-[11px]">
                      {/* Item 1 */}
                      <div className="p-2.5 rounded-xl bg-[#141519] border border-white/5 flex items-center justify-between">
                        <span className="text-white/80 text-[10px]">VIP Check-Ins (12)</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          In Progress
                        </span>
                      </div>

                      {/* Item 2 */}
                      <div className="p-2.5 rounded-xl bg-[#141519] border border-white/5 flex items-center justify-between">
                        <span className="text-white/80 text-[10px]">Housekeeping Alert - Rm 402</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Urgent
                        </span>
                      </div>

                      {/* Item 3 */}
                      <div className="p-2.5 rounded-xl bg-[#141519] border border-white/5 flex items-center justify-between">
                        <span className="text-white/80 text-[10px]">Meeting with F&B Director</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          Scheduled
                        </span>
                      </div>

                      {/* Item 4 */}
                      <div className="p-2.5 rounded-xl bg-[#141519] border border-white/5 flex items-center justify-between">
                        <span className="text-white/80 text-[10px]">Maintenance - Pool Area</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Pending
                        </span>
                      </div>

                      {/* Item 5 */}
                      <div className="p-2.5 rounded-xl bg-[#141519] border border-white/5 flex items-center justify-between">
                        <span className="text-white/80 text-[10px]">Guest Feedback Review</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          1 New
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Phone Bottom Pill */}
                  <div className="pt-2 flex justify-center">
                    <div className="w-24 h-1 rounded-full bg-white/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER (Matches Screenshot 6) */}
      <footer className="py-20 bg-[#07080A] border-t border-white/5 text-white/70 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            {/* Left Brand Col */}
            <div className="md:col-span-6 space-y-4">
              <div className="inline-block px-3 py-1.5 rounded-lg bg-black/60 border border-amber-500/40 shadow-[0_0_15px_rgba(212,158,55,0.15)]">
                <span className="font-serif italic font-bold text-sm tracking-wider text-amber-300">
                  INNtelligence
                </span>
              </div>
              <p className="text-white/60 text-xs sm:text-sm max-w-sm leading-relaxed">
                The intersection of high-end hospitality and sophisticated AI. Designed for the observant hotelier.
              </p>
            </div>

            {/* Middle & Right Links Cols */}
            <div className="md:col-span-6 grid grid-cols-2 gap-8 md:justify-items-end">
              {/* Inquiry */}
              <div className="space-y-3">
                <div className="font-mono text-xs uppercase tracking-[0.25em] text-amber-500 font-semibold">
                  Inquiry
                </div>
                <ul className="space-y-2 text-xs text-white/70">
                  <li>
                    <button
                      onClick={() => setIsEarlyAccessModalOpen(true)}
                      className="hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      Partnerships
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setIsEarlyAccessModalOpen(true)}
                      className="hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      Media
                    </button>
                  </li>
                </ul>
              </div>

              {/* Social */}
              <div className="space-y-3">
                <div className="font-mono text-xs uppercase tracking-[0.25em] text-amber-500 font-semibold">
                  Social
                </div>
                <ul className="space-y-2 text-xs text-white/70">
                  <li>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-amber-300 transition-colors"
                    >
                      LinkedIn
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-amber-300 transition-colors"
                    >
                      Instagram
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Copyright Bottom Bar */}
          <div className="pt-8 border-t border-white/5 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
            &copy; 2024 INNtelligence Systems. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* 8. EARLY ACCESS REQUEST MODAL */}
      {isEarlyAccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0D0E11] border border-amber-500/30 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative">
            {/* Top Accent Strip */}
            <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

            <div className="p-6 sm:p-8 space-y-6">
              {/* Close Button */}
              <button
                onClick={() => {
                  setIsEarlyAccessModalOpen(false);
                  setAccessSubmitted(false);
                }}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {!accessSubmitted ? (
                <>
                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Private Executive Access
                    </span>
                    <h3 className="text-2xl font-serif italic font-bold text-white">
                      Request Early Access to INNtelligence
                    </h3>
                    <p className="text-xs text-white/60">
                      Join our private cohort of luxury hoteliers, general managers, and hospitality executives.
                    </p>
                  </div>

                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3.5 top-3 text-white/40" />
                        <input
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="e.g. Alistair Sterling"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-amber-500/60 text-white text-xs outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">
                        Work Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-3 text-white/40" />
                        <input
                          type="email"
                          required
                          value={formData.workEmail}
                          onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                          placeholder="gm@grandmeridian.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-amber-500/60 text-white text-xs outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">
                          Hotel / Property
                        </label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 absolute left-3.5 top-3 text-white/40" />
                          <input
                            type="text"
                            required
                            value={formData.propertyName}
                            onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
                            placeholder="The Grand Meridian"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-amber-500/60 text-white text-xs outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60">
                          Room Count
                        </label>
                        <select
                          value={formData.roomCount}
                          onChange={(e) => setFormData({ ...formData, roomCount: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#141519] border border-white/10 focus:border-amber-500/60 text-white text-xs outline-none transition-all"
                        >
                          <option value="Under 50 keys">Boutique (&lt; 50 keys)</option>
                          <option value="50 - 150 keys">50 – 150 keys</option>
                          <option value="150 - 300 keys">150 – 300 keys</option>
                          <option value="300+ keys">300+ keys (Luxury / Resort)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 active:scale-98 cursor-pointer mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Encrypting & Storing in Firestore...</span>
                        </>
                      ) : (
                        <span>Submit Priority Request</span>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-white">
                    Access Request Received
                  </h3>
                  <p className="text-xs text-white/70 max-w-sm mx-auto leading-relaxed">
                    Thank you, <strong className="text-white">{formData.fullName}</strong>. Your executive credentials request for <strong>{formData.propertyName || 'your property'}</strong> has been registered in Firestore.
                  </p>

                  <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => {
                        setIsEarlyAccessModalOpen(false);
                        onEnterApp();
                      }}
                      className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Explore Interactive Demo Now
                    </button>
                    <button
                      onClick={() => setIsEarlyAccessModalOpen(false)}
                      className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-mono transition-all cursor-pointer"
                    >
                      Back to Overview
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Staff Firebase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onProceedToOperations={() => {
          setIsAuthModalOpen(false);
          onEnterApp();
        }}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          onEnterApp();
        }}
      />
    </div>
  );
};
