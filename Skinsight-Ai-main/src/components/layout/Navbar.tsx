import React from 'react';
import { 
  Shield, 
  PlusCircle, 
  Menu, 
  X, 
  LayoutDashboard,
  Clock,
  MessageSquare,
  FileText,
  Cpu,
  User,
  LogIn,
  LogOut,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { AppView, UserProfile } from '../../types';
import { NotificationsDropdown } from './NotificationsDropdown';
import { isUserAdmin } from '../../services/firebase';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onNavigateToAnalysis?: (id: string) => void;
  user: UserProfile;
  onOpenAuthModal?: () => void;
  onLogOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onNavigateToAnalysis,
  user,
  onOpenAuthModal,
  onLogOut,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [aiEngineReady, setAiEngineReady] = React.useState<boolean | null>(null);
  const isAdmin = isUserAdmin(user);
  const isLoggedIn = Boolean(user && user.email && user.email.trim() !== '' && !user.isAnonymous);

  React.useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setAiEngineReady(Boolean(data.geminiConfigured));
      })
      .catch(() => {
        setAiEngineReady(false);
      });
  }, []);

  const baseNavLinks: { label: string; view: AppView; icon: React.FC<{ className?: string }>; adminOnly?: boolean }[] = [
    { label: 'Dashboard', view: 'dashboard', icon: LayoutDashboard },
    { label: 'New Screening', view: 'new-analysis', icon: PlusCircle },
    { label: 'AI Assistant', view: 'assistant', icon: MessageSquare },
    { label: 'History', view: 'history', icon: Clock },
    { label: 'Train & Evaluate', view: 'train-evaluate', icon: Cpu, adminOnly: true },
    { label: 'Reports', view: 'reports', icon: FileText }
  ];

  const navLinks = baseNavLinks.filter(link => !link.adminOnly || isAdmin);

  return (
    <header className="sticky top-0 z-40 bg-white/98 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Title */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-2.5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-lg p-1"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center shadow-xs group-hover:bg-teal-700 transition-colors">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
                SkinSight <span className="text-teal-600 dark:text-teal-400 font-extrabold text-sm ml-0.5 px-1.5 py-0.5 bg-teal-50 dark:bg-teal-950/60 rounded border border-teal-200 dark:border-teal-800/60">AI</span>
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentView === link.view;
              return (
                <button
                  key={link.view}
                  onClick={() => onNavigate(link.view)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.adminOnly && (
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 rounded border border-purple-200 dark:border-purple-800/60 ml-0.5">
                      Admin
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions (Notifications, Auth, New Analysis, Profile Access) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Google / Account Sign-in Trigger */}
            {onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer shadow-xs"
                title={isLoggedIn ? "Switch Account / Roles" : "Sign In with Google"}
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{isLoggedIn ? 'Switch' : 'Sign In'}</span>
              </button>
            )}

            {/* Logout button (Desktop) */}
            {isLoggedIn && onLogOut && (
              <button
                onClick={onLogOut}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-200 dark:hover:border-rose-800 transition-colors cursor-pointer shadow-xs"
                title="Log out of current account"
                aria-label="Log Out"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span>Log Out</span>
              </button>
            )}

            {/* Live AI Engine Status Pill */}
            {aiEngineReady !== null && (
              <div 
                className={`hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                  aiEngineReady
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/60'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800/60'
                }`}
                title={aiEngineReady ? 'Gemini Multimodal AI is active and responding' : 'GEMINI_API_KEY is not set in environment; running on local heuristic fallback'}
              >
                <span className={`w-2 h-2 rounded-full ${aiEngineReady ? 'bg-teal-500 animate-pulse' : 'bg-amber-500'}`} />
                <span>{aiEngineReady ? 'Gemini AI Active' : 'Offline Heuristic Mode'}</span>
              </div>
            )}

            {/* Notifications */}
            <NotificationsDropdown onNavigateToAnalysis={onNavigateToAnalysis} />

            {/* Primary Action Button */}
            <button
              onClick={() => onNavigate('new-analysis')}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 text-sm font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 shadow-xs transition-all whitespace-nowrap shrink-0 focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Analyze</span>
            </button>

            {/* Profile Page Access Button */}
            <button
              onClick={() => onNavigate('profile')}
              className={`inline-flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                currentView === 'profile' || currentView === 'settings'
                  ? 'border-teal-500 bg-teal-50/80 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 ring-2 ring-teal-500/20'
                  : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 shadow-xs'
              }`}
              title="View Clinician Profile & Settings"
              aria-label="View Clinician Profile & Settings"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-lg object-cover shadow-xs border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className={`w-7 h-7 rounded-lg ${isAdmin ? 'bg-purple-600 text-white' : 'bg-teal-600 text-white'} flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs`}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
                </div>
              )}
              <div className="hidden lg:flex flex-col text-left leading-tight pr-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[95px]">
                    {user?.name || (isLoggedIn ? 'Clinician' : 'Guest')}
                  </span>
                  {isAdmin && (
                    <span className="text-[9px] font-extrabold px-1 py-0.2 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200 rounded">
                      Admin
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold truncate max-w-[105px]">
                  {isAdmin ? 'Admin Panel' : isLoggedIn ? 'Screening User' : 'Guest Mode'}
                </span>
              </div>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-3 shadow-lg animate-in slide-in-from-top-2">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentView === link.view;
              return (
                <button
                  key={link.view}
                  onClick={() => {
                    onNavigate(link.view);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.adminOnly && (
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200 rounded">
                      Admin
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Auth & Logout Buttons */}
          <div className="pt-1 border-t border-slate-100 dark:border-slate-800 space-y-2">
            {onOpenAuthModal && (
              <button
                onClick={() => {
                  onOpenAuthModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 text-xs font-bold"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{isLoggedIn ? 'Switch Account / Roles' : 'Sign In with Google / Email'}</span>
              </button>
            )}

            {isLoggedIn && onLogOut && (
              <button
                onClick={() => {
                  onLogOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 flex items-center justify-center gap-2 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out ({user.name || user.email})</span>
              </button>
            )}
          </div>

          {/* Mobile Profile Navigation Link */}
          <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                onNavigate('profile');
                setMobileMenuOpen(false);
              }}
              className={`w-full py-2.5 px-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
                currentView === 'profile' || currentView === 'settings'
                  ? 'bg-teal-50 dark:bg-teal-950 border-teal-300 dark:border-teal-800 text-teal-800 dark:text-teal-300'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <div className={`w-6 h-6 rounded-lg ${isAdmin ? 'bg-purple-600 text-white' : 'bg-teal-600 text-white'} flex items-center justify-center text-xs font-extrabold`}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
                </div>
                <span>Profile & Settings {isAdmin && '(Admin)'}</span>
              </span>
              <span className="text-[11px] text-teal-600 dark:text-teal-400 font-mono font-semibold">View</span>
            </button>
          </div>

          <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                onNavigate('new-analysis');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 bg-teal-600 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Skin Analysis</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

