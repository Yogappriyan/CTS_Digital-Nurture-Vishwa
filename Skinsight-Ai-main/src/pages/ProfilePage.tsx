import React, { useState } from 'react';
import { 
  User, 
  Building2, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  Lock, 
  Trash2, 
  Check, 
  Sparkles, 
  Save, 
  AlertTriangle,
  ShieldAlert,
  Key,
  LogIn,
  LogOut,
  CheckCircle2
} from 'lucide-react';
import { UserProfile, AnalysisResult } from '../types';
import { DeleteConfirmModal } from '../components/modals/DeleteConfirmModal';
import { isUserAdmin, signInWithGoogle, logOutFromFirebase, setFirestoreUserRole } from '../services/firebase';

interface ProfilePageProps {
  user: UserProfile;
  analyses: AnalysisResult[];
  onUpdateUser: (updated: UserProfile) => void;
  onClearAllHistory: () => void;
  onNavigateToScreening?: () => void;
  onLogOut?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  analyses,
  onUpdateUser,
  onClearAllHistory,
  onNavigateToScreening,
  onLogOut
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role || 'Clinician / Screening Specialist');
  const [institution, setInstitution] = useState('Dermatology & Cutaneous Oncology Center');
  const [licenseNumber, setLicenseNumber] = useState('MD-849204-DERM');
  const [bio, setBio] = useState('Board-certified clinical specialist focusing on non-invasive dermoscopic image analysis, early melanoma identification, and AI-assisted triage workflows.');
  
  // Preferences
  const [architecture, setArchitecture] = useState(user.preferences.modelArchitecture || 'MobileNetV2 + PCA + XceptionNet');
  const [colormap, setColormap] = useState(user.preferences.gradcamColormap || 'jet');
  const [emailAlerts, setEmailAlerts] = useState(user.preferences.emailAlerts ?? true);
  const [highRiskAlerts, setHighRiskAlerts] = useState(user.preferences.highRiskAlerts ?? true);
  const [compactView, setCompactView] = useState(user.preferences.compactView ?? false);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');

  // Stats calculation
  const totalAnalyses = analyses.length;
  const highRiskCount = analyses.filter(a => a.prediction?.riskLevel === 'malignant-suspected' || a.prediction?.riskLevel === 'pre-malignant').length;
  const benignCount = analyses.filter(a => a.prediction?.riskLevel === 'benign-low' || a.prediction?.riskLevel === 'benign-monitoring').length;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      name,
      email,
      role,
      preferences: {
        ...user.preferences,
        modelArchitecture: architecture as any,
        gradcamColormap: colormap as any,
        emailAlerts,
        highRiskAlerts,
        compactView
      }
    };
    onUpdateUser(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={() => {
          onClearAllHistory();
          setIsClearModalOpen(false);
        }}
        isClearAll
      />

      {/* Profile Header Hero Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            {/* Avatar Initials Badge */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-teal-600 dark:bg-teal-700 text-white flex items-center justify-center text-2xl sm:text-3xl font-extrabold shadow-md ring-4 ring-teal-50 dark:ring-teal-950/60 shrink-0">
              {name.charAt(0).toUpperCase()}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Reviewer</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{role} • {institution}</span>
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                License: {licenseNumber} • Member since {user.joinedDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            {onLogOut && (
              <button
                type="button"
                onClick={onLogOut}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 dark:hover:border-rose-800 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Log out of current account"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            )}
            {onNavigateToScreening && (
              <button
                type="button"
                onClick={onNavigateToScreening}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Activity className="w-4 h-4" />
                <span>New Screening</span>
              </button>
            )}
          </div>
        </div>

        {/* Clinician Screening Activity Stat Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Cases</span>
              <Activity className="w-3.5 h-3.5 text-teal-600" />
            </div>
            <p className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono mt-1">{totalAnalyses}</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Benign Screenings</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">{benignCount}</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">High-Risk Triaged</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <p className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono mt-1">{highRiskCount}</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Model Concordance</span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">98.4%</p>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile changes and clinical preferences saved successfully!</span>
        </div>
      )}

      {/* Profile Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Details</span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'preferences'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Diagnostic & AI Preferences</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Security & Data</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: Profile Details */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Clinician Identity & Professional Credentials
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Information displayed on generated clinical screening reports and diagnostic audit trails.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Role / Specialization
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Medical License / Registry ID
                </label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Affiliated Medical Center / Institution
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Clinical Bio & Department Summary
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100 resize-none"
                />
              </div>
            </div>

            {/* Access Control & Administrator Panel Privileges */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-purple-600" />
                    <span>Role-Based Access Control (RBAC)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Controls whether administrative features like the Model Training & Evaluation Engine are visible.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-950 dark:text-purple-200">
                      Clinician Administrator Access (Train & Evaluate)
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      isUserAdmin(user)
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {isUserAdmin(user) ? 'Active Admin' : 'Standard User'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    {isUserAdmin(user)
                      ? 'The Train & Evaluate panel is visible in your navigation menu and dashboard.'
                      : 'The Train & Evaluate panel is hidden from your navigation menu and dashboard.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const nextAdmin = !isUserAdmin(user);
                    const updatedRole = nextAdmin ? 'Clinician Admin' : 'Dermatology Screener';
                    setRole(updatedRole);
                    const updatedUser: UserProfile = {
                      ...user,
                      role: updatedRole,
                      isAdmin: nextAdmin
                    };
                    onUpdateUser(updatedUser);
                    setFirestoreUserRole(user.id, nextAdmin);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs ${
                    isUserAdmin(user)
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {isUserAdmin(user) ? 'Disable Admin Role' : 'Grant Admin Privileges'}
                </button>
              </div>
            </div>

            {/* Firebase & Google Cloud Sync Status */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Firebase Authentication & Cloud Sync</span>
              </h4>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      SkinSight Firebase Backend
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                      Firestore Connected
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Linked to project <code className="font-mono text-teal-600 dark:text-teal-400">strategic-chess-tggh3</code> (SkinSight)
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const profile = await signInWithGoogle();
                        onUpdateUser(profile);
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  {onLogOut && (
                    <button
                      type="button"
                      onClick={onLogOut}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Diagnostic & AI Preferences */}
        {activeTab === 'preferences' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Deep Learning Model & Visual Explainability Setup
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Customize default inference pipelines, feature extraction backbones, and Grad-CAM color schemes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Primary Classification Backbone
                </label>
                <select
                  value={architecture}
                  onChange={(e) => setArchitecture(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
                >
                  <option value="MobileNetV2 + PCA + XceptionNet">MobileNetV2 + PCA + XceptionNet (Recommended)</option>
                  <option value="EfficientNet-B0">EfficientNet-B0 (ISIC High-Sensitivity)</option>
                  <option value="ResNet50-Derm">ResNet-50 Dermoscopic Ensemble</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Grad-CAM Attention Colormap
                </label>
                <select
                  value={colormap}
                  onChange={(e) => setColormap(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
                >
                  <option value="jet">Jet (Standard Thermal Blue-to-Red)</option>
                  <option value="turbo">Turbo (High-Contrast Perceptual)</option>
                  <option value="thermal">Thermal (Clinical Heatmap)</option>
                  <option value="hotspot">Hotspot Focus</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Alerts & Triage Notifications
              </h4>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    High-Risk Melanoma Urgent Alerts
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Immediately flag lesions with suspected malignant probability exceeding 80%.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={highRiskAlerts}
                  onChange={(e) => setHighRiskAlerts(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Email Digest Notifications
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Receive daily summaries of processed clinical screenings and patient cases.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
              </label>
            </div>
          </div>
        )}

        {/* TAB 3: Security & Data */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Account Security & Credentials
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage login credentials and session authenticity.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new strong password"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Privacy & Storage Clear Card */}
            <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="border-b border-rose-100 dark:border-rose-900/30 pb-3">
                <h3 className="text-sm font-bold text-rose-900 dark:text-rose-300">
                  Diagnostic Data Privacy & Local Storage
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  All dermoscopic scans and clinical history are stored securely in your local environment.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Purge All Patient Screening Records
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Irreversibly delete all {analyses.length} saved diagnostic scans, ROI bounding boxes, and Grad-CAM overlays.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsClearModalOpen(true)}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All History</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile & Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
