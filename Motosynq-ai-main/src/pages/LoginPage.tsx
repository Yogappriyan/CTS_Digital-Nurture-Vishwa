import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { Logo } from '../components/ui/Logo';
import { Card } from '../components/ui/Card';
import { DisclaimerBanner } from '../components/ui/DisclaimerBanner';
import { Mail, User, Database, ArrowRight, AlertCircle, Shield } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { loginWithGoogle, loginWithEmailLocal, toggleDemoMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    const res = await loginWithGoogle();
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      navigate(from, { replace: true });
    }
    setSubmitting(false);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setErrorMsg(null);
    setSubmitting(true);
    const res = await loginWithEmailLocal(email, displayName);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      navigate(from, { replace: true });
    }
    setSubmitting(false);
  };

  const handleLaunchDemo = () => {
    toggleDemoMode(true);
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0B1220] flex flex-col justify-between p-4 md:p-8">
      {/* Top Header */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <Logo size="md" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline">Backend status:</span>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Firebase Firestore Connected</span>
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-md w-full mx-auto my-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">Motorcycle Condition Monitoring</h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Companion dashboard for synchronized acoustic and inertial inspections.
          </p>
        </div>

        <Card className="border-slate-800 shadow-xl">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Primary Action: Google Sign-In with Firebase Auth */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs flex items-center justify-center gap-2.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{submitting ? 'Authenticating with Google...' : 'Sign In with Google (Firebase)'}</span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono">
                <span className="bg-[#12171F] px-2 text-slate-500">Or sign in with Rider Handle</span>
              </div>
            </div>

            {/* Email / Handle Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Rider Handle / Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Alex Chen"
                    className="w-full bg-[#1A2230] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rider@example.com"
                    className="w-full bg-[#1A2230] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#0B1220] text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                Enter Dashboard
              </button>
            </form>

            {/* Quick Demo Mode Access Button */}
            <div className="mt-5 pt-4 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-400 mb-2">Want to explore without logging in?</p>
              <button
                onClick={handleLaunchDemo}
                className="w-full py-2 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Explore With Sample Data</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>
        </Card>

        <div className="mt-6">
          <DisclaimerBanner />
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 py-4 max-w-4xl mx-auto">
        MOTOSYNQ AI — Powered by Google Cloud Firestore and Multimodal Sensor Screening.
      </footer>
    </div>
  );
};
