import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Box,
  FlaskConical,
  ShieldCheck,
  Settings,
  LogOut,
  Smartphone,
  ChevronDown,
  Menu,
  X,
  Plus,
  RefreshCw,
  AlertCircle,
  Database,
} from 'lucide-react';
import { Logo } from '../ui/Logo';
import { SampleDataBadge } from '../ui/SampleDataBadge';
import { AndroidSyncStationModal } from '../sync/AndroidSyncStationModal';
import { useAuth } from '../../features/auth/AuthContext';
import { useData } from '../../features/data/DataContext';
import { formatDateTime } from '../../lib/formatters';

export const AppLayout: React.FC = () => {
  const { user, logout, isDemoMode, toggleDemoMode } = useAuth();
  const { vehicles, activeVehicle, activeVehicleId, setActiveVehicleId, sessions, androidSync, seedActiveMotorcycles } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const navigate = useNavigate();

  // Find latest synced Android session
  const latestAndroidSession = sessions.find((s) => s.source === 'android');
  const syncTimestamp = androidSync.lastSyncTime || latestAndroidSession?.started_at;
  const syncStatusText = syncTimestamp
    ? `Last synced: ${formatDateTime(syncTimestamp)}`
    : 'No data synced yet';

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/digital-twin', label: 'Digital Twin', icon: Box },
    { to: '/diagnostic-lab', label: 'Diagnostic Lab', icon: FlaskConical },
    { to: '/health-passport', label: 'Health Passport', icon: ShieldCheck },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-100 flex flex-col md:flex-row">
      {/* Desktop Sidebar (w-64) & Tablet Rail (w-20 md:w-64) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800/80 bg-[#0E1522] shrink-0 sticky top-0 h-screen z-30">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <Logo size="md" />
        </div>

        {/* Vehicle Switcher */}
        <div className="px-4 py-3 border-b border-slate-800/60 bg-[#121824]/60">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
            <span className="flex items-center gap-1.5">
              <span>ACTIVE MOTORCYCLE</span>
              {vehicles.length > 0 && (
                <span className="px-1.5 py-0.2 font-mono text-[10px] rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {vehicles.length}
                </span>
              )}
            </span>
            <button
              onClick={() => navigate('/health-passport')}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              title="Add vehicle"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          {vehicles.length > 0 ? (
            <div className="relative">
              <select
                aria-label="Active Motorcycle"
                value={activeVehicleId || ''}
                onChange={(e) => setActiveVehicleId(e.target.value)}
                className="w-full bg-[#1A2230] border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 pr-7 appearance-none cursor-pointer focus:outline-none focus:border-cyan-500"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nickname} ({v.year} {v.make} {v.model})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          ) : (
            <button
              onClick={() => seedActiveMotorcycles()}
              className="w-full text-left text-xs text-cyan-400 font-medium bg-[#1A2230] border border-cyan-500/30 rounded-lg px-2.5 py-1.5 hover:bg-cyan-500/10 transition-colors cursor-pointer"
            >
              + Register 4 Active Motorcycles
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sync & Mode Indicator */}
        <div className="p-3 mx-3 mb-3 rounded-lg bg-[#141B26] border border-slate-800/90 text-xs">
          <div className="flex items-center justify-between text-slate-300 font-medium mb-1">
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer text-left"
              title="Open Android Sync Station"
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Android Sync</span>
            </button>
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                androidSync.syncState === 'synced' || Boolean(latestAndroidSession)
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : androidSync.syncState === 'syncing'
                  ? 'bg-cyan-500/20 text-cyan-300 animate-pulse'
                  : androidSync.syncState === 'error'
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-300'
              }`}
            >
              {androidSync.syncState === 'syncing'
                ? 'Syncing...'
                : (androidSync.syncState === 'synced' || Boolean(latestAndroidSession))
                ? '✓ Synced'
                : 'Idle'}
            </button>
          </div>
          <p
            onClick={() => setIsSyncModalOpen(true)}
            className="text-[11px] text-slate-400 truncate cursor-pointer hover:text-slate-300 transition-colors"
          >
            {syncStatusText}
          </p>

          {/* Sample Data Mode Toggle */}
          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Database className="w-3 h-3 text-amber-400" />
              Sample Data:
            </span>
            <button
              onClick={() => toggleDemoMode()}
              className={`text-[10px] font-semibold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                isDemoMode
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {isDemoMode ? 'Active (ON)' : 'Disabled (OFF)'}
            </button>
          </div>
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-cyan-400 shrink-0">
              {user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-slate-200 truncate">{user?.displayName || 'User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'Authenticated'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0E1522] border-b border-slate-800 sticky top-0 z-40">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          {isDemoMode && <SampleDataBadge size="sm" />}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-[#121824] border-t border-slate-700 p-5 rounded-t-2xl space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-sm font-semibold text-slate-200">Navigation</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive ? 'bg-cyan-500/15 text-cyan-400' : 'text-slate-300 hover:bg-slate-800'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Demo Data Mode</span>
              <button
                onClick={() => toggleDemoMode()}
                className={`text-xs px-2.5 py-1 rounded font-medium ${
                  isDemoMode ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isDemoMode ? 'ON' : 'OFF'}
              </button>
            </div>
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 text-center text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Top Notification Bar if Demo Mode active */}
        {isDemoMode && (
          <div className="bg-amber-950/40 border-b border-amber-500/30 px-4 py-1.5 flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <SampleDataBadge size="sm" />
              <span className="text-[11px] text-amber-200/90">
                Displaying illustrative records. Real sensor collection requires Android sync or manual upload.
              </span>
            </div>
            <button
              onClick={() => toggleDemoMode(false)}
              className="text-[11px] underline hover:text-amber-100 cursor-pointer shrink-0"
            >
              Switch to live empty state
            </button>
          </div>
        )}

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0E1522]/95 backdrop-blur-md border-t border-slate-800/80 flex items-center justify-around py-2 px-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2 rounded text-[10px] font-medium transition-colors ${
                isActive ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Android Sync Modal */}
      <AndroidSyncStationModal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} />
    </div>
  );
};
