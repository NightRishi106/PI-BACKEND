import { useState } from 'react';
import { Database, Copy, Check, Terminal, ExternalLink, RefreshCw, Sparkles, Server } from 'lucide-react';
import { supabaseService } from '../lib/supabaseService';

interface SchemaGuideProps {
  isConfigured: boolean;
  onResetMockData: () => void;
}

export function SchemaGuide({ isConfigured, onResetMockData }: SchemaGuideProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const sqlSchema = `-- ==========================================
-- INVESTMENT CONSULTING BLUEPRINT SCHEMAS
-- Execute this SQL code inside your Supabase SQL Editor
-- ==========================================

-- 1. Create client leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  investment_budget NUMERIC DEFAULT 0 NOT NULL,
  status TEXT DEFAULT 'new'::text NOT NULL,
  interest_area TEXT,
  notes TEXT
);

-- Enable RLS for leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policy allowing authenticated users full access
CREATE POLICY "Allow full access for authenticated admins" 
  ON public.leads 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- 2. Create consultations appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  lead_name TEXT NOT NULL,
  lead_email TEXT NOT NULL,
  consultant_name TEXT NOT NULL,
  scheduled_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled'::text NOT NULL,
  notes TEXT
);

-- Enable RLS for appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create policy allowing authenticated users full access
CREATE POLICY "Allow full access for authenticated admins" 
  ON public.appointments 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- 3. Create indices for performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_time ON public.appointments(scheduled_time);
`;

  const handleCopy = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopied(identifier);
    setTimeout(() => setCopied(null), 2500);
  };

  const executeReset = () => {
    setResetting(true);
    setTimeout(() => {
      onResetMockData();
      setResetting(false);
      alert('Sandbox mock leads and appointments have been reset to pristine defaults.');
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="db-setup-workspace">
      
      {/* Page Title */}
      <div>
        <h2 className="font-display text-2xl font-semibold text-slate-105 tracking-tight flex items-center gap-2">
          Supabase Provisioning Control
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Review credentials state, copy database blueprints, and manage local developer sandbox simulations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Connection status card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#0c0d12] border border-slate-800 p-5 rounded-xl space-y-4">
            <h3 className="text-xs font-semibold text-slate-350 uppercase tracking-widest font-mono">
              Database Connection State
            </h3>

            <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Environment Config:</span>
                {isConfigured ? (
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold uppercase tracking-wider font-mono">
                    CONNECTED
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded font-bold uppercase tracking-wider font-mono animate-pulse">
                    MOCK/SIMULATED
                  </span>
                )}
              </div>

              <div className="space-y-1 text-[11px] font-mono border-t border-slate-900 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">CLIENT SDK:</span>
                  <span className="text-slate-300">@supabase/supabase-js v2.48+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">API HOST URL:</span>
                  <span className="text-slate-300 truncate max-w-[120px]" title={supabaseService.getSupabaseUrl() || 'Not Defined'}>
                    {supabaseService.getSupabaseUrl() || 'MOCK_SANDBOX'}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-450 leading-relaxed">
              When Google AI Studio environment variables are empty, the app defaults to client-side localStorage simulation. To transition to a live database:
            </p>

            <div className="space-y-2 text-xs text-slate-350">
              <div className="flex items-start gap-2">
                <span className="font-mono text-amber-500 bg-amber-500/10 shrink-0 w-5 h-5 flex items-center justify-center rounded">1</span>
                <span>Open your remote <strong>Supabase Dashboard</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-amber-500 bg-amber-500/10 shrink-0 w-5 h-5 flex items-center justify-center rounded">2</span>
                <span>Navigate to the SQL Editor and run the script on the right.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-amber-500 bg-amber-500/10 shrink-0 w-5 h-5 flex items-center justify-center rounded">3</span>
                <span>Go to <strong>Settings &rarr; Secrets</strong> in AI Studio and apply:</span>
              </div>
              <div className="pl-7 pt-1 font-mono text-[10px] text-slate-500 space-y-0.5">
                <div>• VITE_SUPABASE_URL</div>
                <div>• VITE_SUPABASE_ANON_KEY</div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-850 flex gap-2">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 text-xs font-semibold rounded-lg text-center flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span>Console Link</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Sandbox utility toolkit */}
          <div className="bg-[#0c0d12] border border-slate-800 p-5 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              Sandbox Toolkit
            </h3>
            <p className="text-xs text-slate-400 leading-normal">
              Need to restore the simulated leads database to the pristine default set? Clear modified records and refresh easily.
            </p>
            <button
              onClick={executeReset}
              disabled={resetting}
              className="w-full py-2.5 px-4 bg-slate-950 border border-amber-500/20 hover:border-amber-500/40 text-amber-400 hover:text-amber-300 font-semibold text-xs rounded-lg duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-4.5 w-4.5 ${resetting ? 'animate-spin' : ''}`} />
              <span>Reset Simulated Datasets</span>
            </button>
          </div>
        </div>

        {/* SQL Script Display panel */}
        <div className="lg:col-span-3 flex flex-col bg-[#08090d] border border-slate-850 rounded-xl overflow-hidden shadow-2xl">
          <div className="p-4 bg-slate-900/50 border-b border-slate-850 flex justify-between items-center">
            <div className="flex items-center gap-2 font-mono text-xs text-slate-350">
              <Terminal className="h-4 w-4 text-amber-500" />
              <span>Investment_Advisory_Schema.sql</span>
            </div>
            <button
              onClick={() => handleCopy(sqlSchema, 'sql')}
              className="py-1.5 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-350 text-xs font-mono rounded-lg transition duration-150 flex items-center gap-1.5 cursor-pointer"
            >
              {copied === 'sql' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>Copy SQL Blueprint</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 overflow-auto flex-1 max-h-[480px]">
            <pre className="text-[10.5px] font-mono text-slate-300 leading-relaxed whitespace-pre font-light select-all">
              {sqlSchema}
            </pre>
          </div>

          <div className="p-3 bg-slate-950 border-t border-slate-850/80 flex items-center gap-2 text-[11px] text-slate-550 leading-normal font-mono">
            <Server className="h-4 w-4 text-slate-500 shrink-0" />
            <span>SCHEMAS CONFORM TO STRICT ROW LEVEL SECURITY STANDARDS. COPIED LOGS READY FOR TRANSFERS.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
