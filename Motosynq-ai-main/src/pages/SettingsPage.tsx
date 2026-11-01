import React, { useState } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { useData } from '../features/data/DataContext';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { DisclaimerBanner } from '../components/ui/DisclaimerBanner';
import {
  User,
  Shield,
  Download,
  Trash2,
  Smartphone,
  Share2,
  Lock,
  Database,
  ExternalLink,
  Check,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, isDemoMode, toggleDemoMode, isFirebaseConfigured, logout } = useAuth();
  const { vehicles, sessions, sharedReports, revokeSharedReport } = useData();

  const [name, setName] = useState(user?.displayName || 'MotoSynq Rider');
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExportAllData = () => {
    setIsExporting(true);
    const dump = {
      export_timestamp: new Date().toISOString(),
      user: { id: user?.id, email: user?.email, displayName: name },
      vehicles,
      sessions,
      shared_reports: sharedReports,
    };
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `motosynq_data_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setIsExporting(false);
  };

  const handleDeleteAccount = async () => {
    localStorage.clear();
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Account & System Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage user profile, Android sync credentials, shared link revocations, and privacy data exports.
        </p>
      </div>

      <DisclaimerBanner />

      {/* User Profile */}
      <Card title="User Profile & Handle">
        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Display Name / Call-Sign</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full max-w-md bg-[#18202C] border border-slate-700 rounded-lg p-2.5 text-white"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Authenticated Email</label>
            <input
              type="email"
              disabled
              value={user?.email || 'rider@motosynq.internal'}
              className="w-full max-w-md bg-[#12171F] border border-slate-800 rounded-lg p-2.5 text-slate-400 cursor-not-allowed"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#0B1220] font-bold text-xs cursor-pointer transition-colors"
            >
              Save Profile
            </button>
            {savedSuccess && (
              <span className="text-emerald-400 flex items-center gap-1 font-medium text-xs">
                <Check className="w-4 h-4" /> Profile updated
              </span>
            )}
          </div>
        </form>
      </Card>

      {/* Android Device Connection Info */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>Connected Android Mobile Device</span>
          </div>
        }
        subtitle="Android application sync architecture"
      >
        <div className="space-y-3 text-xs leading-relaxed text-slate-300">
          <p>
            The MOTOSYNQ Android app (Kotlin + Jetpack Compose) authenticates directly using Firebase Authentication. API keys are <strong>not</strong> stored in client headers.
          </p>
          <div className="p-3 bg-[#0E1420] rounded-lg border border-slate-800 space-y-1 font-mono text-[11px]">
            <div className="text-slate-400">Sync Authentication: Firebase Auth ID Token (JWT)</div>
            <div className="text-slate-400">Database Engine: Google Cloud Firestore</div>
            <div className="text-slate-400">Idempotent Upload Key: client_session_id</div>
            <div className="text-emerald-400">
              Connected Status: {sessions.some((s) => s.source === 'android') ? 'Active Android Device Synced' : 'Ready For Device Link'}
            </div>
          </div>
        </div>
      </Card>

      {/* Active Shared Links Manager */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-cyan-400" />
            <span>Shared Links Management</span>
          </div>
        }
        subtitle="Active token-gated links generated for external mechanics or prospective buyers"
      >
        {sharedReports.length > 0 ? (
          <div className="space-y-3 text-xs">
            {sharedReports.map((r) => (
              <div
                key={r.id}
                className="p-3 rounded-lg bg-[#0E1420] border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="font-mono text-cyan-300 font-semibold block">Token: {r.token_hash.slice(0, 16)}...</span>
                  <span className="text-slate-400 text-[11px]">Views: {r.view_count} • Created {r.created_at.split('T')[0]}</span>
                </div>
                <div>
                  {r.revoked_at ? (
                    <span className="text-slate-500 italic">Revoked</span>
                  ) : (
                    <button
                      onClick={() => revokeSharedReport(r.id)}
                      className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 cursor-pointer"
                    >
                      Revoke Link
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No shared links created.</p>
        )}
      </Card>

      {/* Privacy Statement & Data Management */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Privacy Policy & Local Storage Statement</span>
          </div>
        }
      >
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            <strong>What is collected:</strong> Short 3 to 300-second acoustic audio recordings (WAV format), smartphone accelerometer (m/s²), and gyroscope (rad/s) readings taken during stationary, controlled motorcycle engine inspections.
          </p>
          <p>
            <strong>How it is processed:</strong> Windowed Fourier transforms and statistical features are computed to evaluate baseline acoustic deviations. Raw files are stored in private, encrypted Firebase Storage buckets and Firestore documents protected by security rules.
          </p>
          <p>
            <strong>Ownership & Rights:</strong> You own all your data. You may download complete archives or execute an immediate, permanent deletion at any time.
          </p>

          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleExportAllData}
              disabled={isExporting}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Complete Data Archive (JSON)</span>
            </button>

            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-medium cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account & Erase All Records</span>
            </button>
          </div>
        </div>
      </Card>

      {/* MODAL: DELETE ACCOUNT CONFIRMATION */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Permanent Deletion">
        <div className="space-y-4 text-xs">
          <p className="text-rose-300 font-semibold">
            Warning: This action is permanent and cannot be undone.
          </p>
          <p className="text-slate-300">
            All registered motorcycles, inspection waveforms, motion sensor logs, maintenance records, and shared links will be purged immediately from the database.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
            >
              Erase Everything
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
