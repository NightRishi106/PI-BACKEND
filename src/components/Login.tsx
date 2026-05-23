import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Building, AlertCircle } from 'lucide-react';
import { supabaseService } from '../lib/supabaseService';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
  isMockMode: boolean;
}

export function Login({ onLoginSuccess, isMockMode }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const { user, error } = await supabaseService.signIn(email, password);
      if (error) {
        setErrorMessage(error.message || 'Authentication failed');
      } else if (user) {
        onLoginSuccess(user);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('admin@investment.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050608] px-4 py-12 relative overflow-hidden" id="login-container">
      {/* Background ambient circular gradients for premium professional depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md" id="login-card">
        {/* Company Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 bg-slate-900 border border-amber-500/30 rounded-2xl mb-4 shadow-lg shadow-amber-500/5">
            <Building className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-100">
            PUSHKER INVESTMENTS
          </h2>
          <p className="text-xs text-amber-500 mt-1.5 uppercase tracking-widest font-medium">
            Advisor Backend Terminal (Internal Use)
          </p>
        </div>

        {/* Authentication Card */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-8 rounded-2xl shadow-2xl relative">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
          
          <div className="mb-6">
            <span className="inline-block px-2 py-0.5 mb-2.5 bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono font-semibold text-amber-400 rounded">
              RESTRICTED SYSTEM
            </span>
            <h3 className="text-lg font-medium text-slate-200 font-display">Staff Authentication</h3>
            <p className="text-xs text-slate-400 mt-1.5">
              Authorized access only. Unauthorized public entry, scanning, or usage will be monitored and actioned.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-200">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-350 uppercase tracking-wider mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all font-mono"
                  placeholder="admin@investment.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-350 uppercase tracking-wider">
                  Access Key Passcode
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all font-mono"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-semibold rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:translate-y-px transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Verify Credentials</span>
                </>
              )}
            </button>
          </form>

          {isMockMode && (
            <div className="mt-6 pt-5 border-t border-slate-800/80">
              <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3.5">
                <p className="text-xs font-medium text-amber-400 mb-1 flex items-center gap-1.5">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  Developer Sandbox Active
                </p>
                <p className="text-xs text-slate-400 leading-relaxed mb-2.5">
                  Real Supabase keys are not configured yet. Use the preset credentials to log in and preview immediately:
                </p>
                <div className="flex gap-2 justify-between items-center bg-slate-950 py-1.5 px-3 rounded-lg border border-slate-800/60 font-mono text-xs text-slate-300">
                  <span>admin@investment.com : admin123</span>
                  <button
                    onClick={handleQuickFill}
                    className="text-[10px] text-amber-500 font-semibold hover:text-amber-400 uppercase tracking-wider"
                  >
                    Quick Autofill
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info tag */}
        <div className="text-center mt-6 text-[11px] text-slate-500 tracking-wide font-mono space-y-1">
          <div>SECURE ADVISOR CONNECTION • Pushker Investments Ltd.</div>
          <div className="text-[10px] text-rose-500/80">CONFIDENTIAL INTERNAL BACKEND — NOT ACCESSIBLE TO THE PUBLIC</div>
        </div>
      </div>
    </div>
  );
}
