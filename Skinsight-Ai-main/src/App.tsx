import React, { useState, useEffect } from 'react';
import { AppView, AnalysisResult, UserProfile, ThemeMode } from './types';
import { 
  getSavedAnalyses, 
  saveAnalysesToStorage, 
  getUserProfile, 
  saveUserProfile,
  deleteAnalysisById,
  GUEST_USER 
} from './services/aiService';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewAnalysisPage } from './pages/NewAnalysisPage';
import { AnalysisResultPage } from './pages/AnalysisResultPage';
import { HistoryPage } from './pages/HistoryPage';
import { ReportsPage } from './pages/ReportsPage';
import { AssistantPage } from './pages/AssistantPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { TrainEvaluatePage } from './pages/TrainEvaluatePage';
import { AssistantDrawer } from './components/chatbot/AssistantDrawer';
import { AuthModal } from './components/modals/AuthModal';
import { AdminRestrictedView } from './components/common/AdminRestrictedView';
import { MessageSquare } from 'lucide-react';
import { 
  auth, 
  isUserAdmin, 
  saveAnalysisToFirestore, 
  deleteAnalysisFromFirestore,
  logOutFromFirebase
} from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [user, setUser] = useState<UserProfile>(getUserProfile);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>(getSavedAnalyses);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  
  // Assistant Drawer state
  const [isAssistantDrawerOpen, setIsAssistantDrawerOpen] = useState(false);
  const [assistantContextAnalysis, setAssistantContextAnalysis] = useState<AnalysisResult | null>(null);

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Theme state (light / dark / system) - Default is system theme
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return user.preferences?.theme || 'system';
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Listen to OS system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Listen to Firebase Auth state in realtime
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const isAdm = firebaseUser.email?.toLowerCase() === 'k.poornima1310@gmail.com' ||
          firebaseUser.email?.toLowerCase().includes('admin');

        setUser(prev => {
          const updated: UserProfile = {
            ...prev,
            id: firebaseUser.uid,
            name: firebaseUser.displayName || prev.name || 'SkinSight Clinician',
            email: firebaseUser.email || prev.email,
            avatarUrl: firebaseUser.photoURL || prev.avatarUrl,
            role: isAdm ? 'Clinician Admin' : prev.role,
            isAdmin: isAdm || prev.isAdmin
          };
          saveUserProfile(updated);
          return updated;
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const isDarkMode = themeMode === 'dark' || (themeMode === 'system' && systemPrefersDark);

  // Apply dark mode class to html document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = '#020617';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.backgroundColor = '#ffffff';
    }
    document.documentElement.setAttribute('data-theme-mode', themeMode);
  }, [isDarkMode, themeMode]);

  const handleSelectThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    const updated = {
      ...user,
      preferences: {
        ...user.preferences,
        theme: mode
      }
    };
    setUser(updated);
    saveUserProfile(updated);
  };

  const handleToggleTheme = () => {
    const nextMode: ThemeMode = isDarkMode ? 'light' : 'dark';
    handleSelectThemeMode(nextMode);
  };

  const handleAnalysisCompleted = (newResult: AnalysisResult) => {
    const updated = [newResult, ...analyses.filter(a => a.id !== newResult.id)];
    setAnalyses(updated);
    saveAnalysesToStorage(updated);
    saveAnalysisToFirestore(newResult, user.id);
    setSelectedAnalysisId(newResult.id);
    setAssistantContextAnalysis(newResult);
    setCurrentView('analysis-result');
  };

  const handleSelectAnalysis = (id: string) => {
    setSelectedAnalysisId(id);
    const found = analyses.find(a => a.id === id) || null;
    setAssistantContextAnalysis(found);
    setCurrentView('analysis-result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteAnalysis = (id: string) => {
    deleteAnalysisById(id);
    deleteAnalysisFromFirestore(id);
    const updated = analyses.filter(a => a.id !== id);
    setAnalyses(updated);
    if (selectedAnalysisId === id) {
      setSelectedAnalysisId(null);
      if (currentView === 'analysis-result') {
        setCurrentView('history');
      }
    }
  };

  const handleClearAllHistory = () => {
    saveAnalysesToStorage([]);
    setAnalyses([]);
    setSelectedAnalysisId(null);
    setCurrentView('dashboard');
  };

  const handleLogOut = async () => {
    try {
      await logOutFromFirebase();
    } catch (e) {
      console.error('Error logging out from Firebase:', e);
    }
    setUser(GUEST_USER);
    saveUserProfile(GUEST_USER);
    if (currentView === 'train-evaluate') {
      setCurrentView('dashboard');
    }
  };

  const handleOpenAssistant = (context?: AnalysisResult | null) => {
    setAssistantContextAnalysis(context || activeAnalysis || null);
    setIsAssistantDrawerOpen(true);
  };

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeAnalysis = analyses.find(a => a.id === selectedAnalysisId) || analyses[0] || null;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navbar with Profile Access */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onNavigateToAnalysis={handleSelectAnalysis}
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogOut={handleLogOut}
      />

      {/* Main View Router */}
      <main className="flex-1 bg-white dark:bg-slate-950">
        {currentView === 'landing' && (
          <LandingPage
            onNavigate={handleNavigate}
            onSelectSampleForAnalysis={(sample) => {
              setCurrentView('new-analysis');
            }}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardPage
            user={user}
            analyses={analyses}
            onNavigate={handleNavigate}
            onSelectAnalysis={handleSelectAnalysis}
            onOpenAssistantWithAnalysis={(analysis) => handleOpenAssistant(analysis)}
            onDeleteAnalysis={handleDeleteAnalysis}
          />
        )}

        {currentView === 'new-analysis' && (
          <NewAnalysisPage
            onBack={() => handleNavigate('dashboard')}
            onAnalysisCompleted={handleAnalysisCompleted}
          />
        )}

        {currentView === 'analysis-result' && activeAnalysis && (
          <AnalysisResultPage
            analysis={activeAnalysis}
            user={user}
            onBack={() => handleNavigate('dashboard')}
            onNavigate={handleNavigate}
            onOpenAssistant={() => handleOpenAssistant(activeAnalysis)}
            onViewReport={(analysis) => {
              setSelectedAnalysisId(analysis.id);
              setCurrentView('reports');
            }}
          />
        )}

        {currentView === 'history' && (
          <HistoryPage
            analyses={analyses}
            onNavigate={handleNavigate}
            onSelectAnalysis={handleSelectAnalysis}
            onOpenAssistantWithAnalysis={(analysis) => handleOpenAssistant(analysis)}
            onViewReport={(analysis) => {
              setSelectedAnalysisId(analysis.id);
              setCurrentView('reports');
            }}
            onDeleteAnalysis={handleDeleteAnalysis}
            onClearAll={handleClearAllHistory}
          />
        )}

        {currentView === 'reports' && (
          <ReportsPage
            analyses={analyses}
            user={user}
            onNavigate={handleNavigate}
            onOpenAssistantWithAnalysis={(analysis) => handleOpenAssistant(analysis)}
          />
        )}

        {currentView === 'train-evaluate' && (
          isUserAdmin(user) ? (
            <TrainEvaluatePage
              onNavigateToScreening={() => handleNavigate('new-analysis')}
            />
          ) : (
            <AdminRestrictedView
              user={user}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onNavigateToDashboard={() => handleNavigate('dashboard')}
            />
          )
        )}

        {currentView === 'assistant' && (
          <AssistantPage
            analyses={analyses}
            activeAnalysis={activeAnalysis}
            user={user}
          />
        )}

        {(currentView === 'profile' || currentView === 'settings') && (
          <ProfilePage
            user={user}
            analyses={analyses}
            onUpdateUser={(updated) => {
              setUser(updated);
              saveUserProfile(updated);
            }}
            onClearAllHistory={handleClearAllHistory}
            onNavigateToScreening={() => handleNavigate('new-analysis')}
            onLogOut={handleLogOut}
          />
        )}
      </main>

      {/* Persistent Floating AI Assistant Quick Trigger */}
      {currentView !== 'assistant' && (
        <button
          onClick={() => handleOpenAssistant(activeAnalysis)}
          className="fixed bottom-6 right-6 z-30 p-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-xl flex items-center gap-2 group transition-all hover:scale-105 no-print"
          title="Open SkinSight AI Assistant"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-bold pr-1">
            SkinSight AI Guidance
          </span>
        </button>
      )}

      {/* Expandable Assistant Slide-over Drawer */}
      <AssistantDrawer
        isOpen={isAssistantDrawerOpen}
        onClose={() => setIsAssistantDrawerOpen(false)}
        analysisContext={assistantContextAnalysis}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={user}
        onLogOut={handleLogOut}
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
          saveUserProfile(loggedUser);
        }}
      />

      {/* Footer */}
      <Footer 
        onNavigate={handleNavigate} 
        themeMode={themeMode}
        isDarkMode={isDarkMode}
        onSelectThemeMode={handleSelectThemeMode}
      />
    </div>
  );
}
