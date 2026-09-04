'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, RefreshCw, Cpu, Database, BarChart2, Star,
  TrendingUp, Activity, Check, AlertCircle, Loader2, ArrowLeft, Wand2, Shield
} from 'lucide-react';
import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { recalculateTrendingAndRatings, generateAIMetadata, upsertEpisode } from '@/lib/api';

export default function AdminAIAssistantPage() {
  return (
    <AuthGuard adminOnly redirectTo="/login">
      <AIAssistantDashboard />
    </AuthGuard>
  );
}

function AIAssistantDashboard() {
  const [syncing, setSyncing]           = useState(false);
  const [syncMessage, setSyncMessage]   = useState('');
  const [promptTitle, setPromptTitle]   = useState('');
  const [generating, setGenerating]     = useState(false);
  const [aiResult, setAiResult]         = useState(null);
  const [publishStatus, setPublishStatus] = useState('');

  // Auto-Trend Sync Action
  const handleAutoTrendSync = async () => {
    setSyncing(true);
    setSyncMessage('');
    const res = await recalculateTrendingAndRatings();
    setSyncing(false);
    setSyncMessage(`Successfully recalculated ratings and trending positions for ${res.count} titles.`);
    setTimeout(() => setSyncMessage(''), 5000);
  };

  // AI Metadata Generator Action
  const handleGenerateMetadata = async (e) => {
    e.preventDefault();
    if (!promptTitle.trim()) return;
    setGenerating(true);
    setAiResult(null);
    setPublishStatus('');

    const metadata = await generateAIMetadata(promptTitle);
    setGenerating(false);
    setAiResult(metadata);
  };

  // One-Click AI Publish
  const handlePublishAIResult = async () => {
    if (!aiResult) return;
    const res = await upsertEpisode(aiResult);
    if (res.success) {
      setPublishStatus(`Published "${aiResult.anime_title}" to catalog & homepage feeds!`);
      setTimeout(() => setPublishStatus(''), 4000);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#08080C', paddingTop: 80, paddingBottom: 80 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link href="/admin" style={{ textDecoration: 'none' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#12131C', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                <ArrowLeft size={18} />
              </div>
            </Link>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFF', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Sparkles size={24} color="#8B5CF6" /> AI Assistant Suite
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                Automated rating sync, metadata generation, and analytics engine.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', color: '#A78BFA', fontSize: '0.78rem', fontWeight: 700 }}>
            <Cpu size={14} color="#8B5CF6" /> AI Neural Engine v2.4 Active
          </div>
        </div>

        {/* 1. Analytics Overview Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 36 }}>
          {[
            { label: 'Most Watched Category', value: 'Action / Sci-Fi', icon: TrendingUp, color: '#8B5CF6' },
            { label: 'Platform Avg Rating', value: '4.8 / 5.0 ★', icon: Star, color: '#F59E0B' },
            { label: 'Stream Health Status', value: '100% Operational', icon: Activity, color: '#4ade80' },
            { label: 'Neural Sync Speed', value: '1.2 ms', icon: Cpu, color: '#A78BFA' },
          ].map(({ label, value, icon: Icon, color }) => (
            <GlassCard key={label} style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color={color} />
                </div>
              </div>
              <p style={{ fontSize: '1.3rem', fontWeight: 900, color: '#FFF', margin: '0 0 2px' }}>{value}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>{label}</p>
            </GlassCard>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          
          {/* 2. Auto-Trend Sync Tool */}
          <GlassCard style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <RefreshCw size={20} color="#8B5CF6" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFF', margin: 0 }}>Auto-Trend Sync</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 20 }}>
              Automatically recalculates user score weightings, popularity velocity, and featured anime placements across the database.
            </p>

            <AnimatePresence>
              {syncMessage && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 10, padding: '12px 14px', marginBottom: 16, color: '#4ade80', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={16} /> {syncMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatedButton
              variant="primary"
              size="md"
              disabled={syncing}
              onClick={handleAutoTrendSync}
              icon={syncing ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <RefreshCw size={16} />}
            >
              {syncing ? 'Recalculating Rankings...' : 'Trigger Auto-Trend Sync'}
            </AnimatedButton>
          </GlassCard>

          {/* 3. AI Metadata Generator */}
          <GlassCard style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Wand2 size={20} color="#F59E0B" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFF', margin: 0 }}>AI Metadata Generator</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 16 }}>
              Input any anime title to generate complete synopsis, genre tags, thumbnail URLs, and skip-intro bounds.
            </p>

            <form onSubmit={handleGenerateMetadata} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <input
                className="af-input"
                placeholder="e.g. Solo Leveling"
                value={promptTitle}
                onChange={(e) => setPromptTitle(e.target.value)}
                required
              />
              <AnimatedButton
                type="submit"
                variant="gold"
                size="md"
                disabled={generating}
                icon={generating ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Sparkles size={16} />}
              >
                {generating ? 'Generating...' : 'Generate'}
              </AnimatedButton>
            </form>

            <AnimatePresence>
              {publishStatus && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 10, padding: '10px 14px', color: '#4ade80', fontSize: '0.82rem', fontWeight: 600 }}>
                  <Check size={14} style={{ display: 'inline', marginRight: 6 }} /> {publishStatus}
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>

        {/* AI Result Preview Panel */}
        {aiResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 28 }}>
            <GlassCard style={{ padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#FFF', margin: 0 }}>
                  AI Generated Metadata Preview
                </h3>
                <AnimatedButton variant="primary" size="sm" onClick={handlePublishAIResult} icon={<Check size={14} />}>
                  Publish to Catalog
                </AnimatedButton>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Title & Category
                  </label>
                  <p style={{ fontWeight: 800, color: '#FFF', fontSize: '1rem', margin: '0 0 4px' }}>
                    {aiResult.anime_title}
                  </p>
                  <span className="badge-gold">{aiResult.category}</span>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Generated Synopsis
                  </label>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                    {aiResult.description}
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

      </div>
    </div>
  );
}
