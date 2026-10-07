import React, { useState } from 'react';
import { 
  User, 
  Cpu, 
  Lock, 
  Trash2, 
  Check 
} from 'lucide-react';
import { UserProfile } from '../types';
import { DeleteConfirmModal } from '../components/modals/DeleteConfirmModal';

interface SettingsPageProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onClearAllHistory: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  onUpdateUser,
  onClearAllHistory,
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [architecture, setArchitecture] = useState(user.preferences.modelArchitecture || 'MobileNetV2 + PCA + XceptionNet');
  const [colormap, setColormap] = useState(user.preferences.gradcamColormap || 'jet');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      name,
      email,
      preferences: {
        ...user.preferences,
        modelArchitecture: architecture,
        gradcamColormap: colormap
      }
    };
    onUpdateUser(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
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

      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Settings & Customization
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Configure clinical profile details, deep learning model architecture, and diagnostic preferences.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Preferences updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. User Profile Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              User Profile
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* 2. AI Model & Grad-CAM Preferences */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Cpu className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              AI Inference Configuration
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Neural Backbone Architecture
              </label>
              <select
                value={architecture}
                onChange={(e) => setArchitecture(e.target.value as any)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
              >
                <option value="MobileNetV2 + PCA + XceptionNet">MobileNetV2 + PCA + YOLOv4 + XceptionNet (Hybrid Pipeline)</option>
                <option value="EfficientNet-B0">EfficientNet-B0 (Standard HAM10000 Transfer Learning)</option>
                <option value="ResNet50-Derm">ResNet50-Derm (Residual Convolutional Backbone)</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Pre-trained and evaluated on 10,015 ISIC / HAM10000 dermoscopy patches.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Grad-CAM Colormap
              </label>
              <select
                value={colormap}
                onChange={(e) => setColormap(e.target.value as any)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
              >
                <option value="jet">Jet (Classic Blue &rarr; Cyan &rarr; Yellow &rarr; Red)</option>
                <option value="turbo">Turbo (Google High-Perceptual Colormap)</option>
                <option value="thermal">Thermal (Black &rarr; Purple &rarr; Orange &rarr; White)</option>
                <option value="hotspot">Hotspot (High-Contrast Red Target)</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Visual gradient representation applied to convolution activation layers.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Privacy & Local Data Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Lock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Privacy & Local Session Data
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Purge All Stored Analyses
              </p>
              <p className="text-[11px] text-slate-500">
                Permanently delete all locally cached images, predictions, and report drafts.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsClearModalOpen(true)}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Stored Data</span>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
