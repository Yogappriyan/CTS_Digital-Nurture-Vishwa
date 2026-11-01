import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useData } from '../../features/data/DataContext';
import { formatDateTime } from '../../lib/formatters';
import {
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Server,
  Layers,
  FileAudio,
  Activity,
  ArrowRight,
  Code2,
} from 'lucide-react';

interface AndroidSyncStationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidSyncStationModal: React.FC<AndroidSyncStationModalProps> = ({ isOpen, onClose }) => {
  const { androidSync, triggerTestAndroidSync, refreshData, activeVehicle, vehicles } = useData();
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'code' | 'endpoints'>('status');

  const handleTestSync = async () => {
    setIsSyncing(true);
    try {
      const targetVehicleId = activeVehicle?.id || vehicles[0]?.id || 'veh-default';
      await triggerTestAndroidSync(targetVehicleId);
      await refreshData();
    } catch (err) {
      console.error('Test sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const kotlinSnippet = `// MOTOSYNQ Android Studio Integration (Kotlin + Jetpack Compose + WorkManager)
class InspectionSyncWorker(
    context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        val baseUrl = "https://your-domain.run.app/api/v1"
        val client = OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(60, TimeUnit.SECONDS)
            .build()

        val audioFile = File(applicationContext.cacheDir, "inspection.wav")
        val accelFile = File(applicationContext.cacheDir, "accel.csv")

        val metadataJson = JSONObject().apply {
            put("client_session_id", UUID.randomUUID().toString())
            put("vehicle_id", "veh-yamaha-fzx")
            put("duration_seconds", 30.0)
            put("started_at", SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(Date()))
            put("source", "android")
        }.toString()

        val requestBody = MultipartBody.Builder()
            .setType(MultipartBody.FORM)
            .addFormDataPart("metadata", metadataJson)
            .addFormDataPart(
                "audio",
                "audio.wav",
                audioFile.asRequestBody("audio/wav".toMediaTypeOrNull())
            )
            .addFormDataPart(
                "accelerometer",
                "accel.csv",
                accelFile.asRequestBody("text/csv".toMediaTypeOrNull())
            )
            .build()

        val request = Request.Builder()
            .url("$baseUrl/sync/android-batch")
            .post(requestBody)
            .build()

        val response = client.newCall(request).execute()
        if (response.isSuccessful) {
            Result.success()
        } else {
            Result.retry()
        }
    }
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(kotlinSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-100">
          <Smartphone className="w-5 h-5 text-cyan-400" />
          <span>Android Studio Sync Station</span>
        </div>
      }
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Subtitle / explanation */}
        <p className="text-xs text-slate-400 leading-relaxed">
          Monitor and configure real-time multimodal sensor synchronization between your Android Jetpack Compose application and this MOTOSYNQ companion dashboard.
        </p>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              activeTab === 'status'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Real-Time Sync Telemetry
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              activeTab === 'code'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Kotlin & Compose Worker
          </button>
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              activeTab === 'endpoints'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Backend API Endpoints
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'status' && (
          <div className="space-y-4">
            {/* Sync Status Banner */}
            <div className="p-4 rounded-xl bg-[#0E1522] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    androidSync.syncState === 'synced'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : androidSync.syncState === 'syncing'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse'
                      : androidSync.syncState === 'error'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-100">Synchronization Status:</span>
                    <span
                      className={`text-xs font-bold uppercase px-2 py-0.5 rounded font-mono ${
                        androidSync.syncState === 'synced'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : androidSync.syncState === 'syncing'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse'
                          : androidSync.syncState === 'error'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {androidSync.syncState === 'synced' ? '✓ Synced' : androidSync.syncState === 'syncing' ? 'Syncing...' : androidSync.syncState === 'error' ? 'Sync Error' : 'Idle / Ready'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {androidSync.lastSyncTime
                      ? `Last confirmed upload: ${formatDateTime(androidSync.lastSyncTime)}`
                      : 'No Android sessions synced in this cycle yet.'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleTestSync}
                disabled={isSyncing}
                className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-[#0B1220] text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Verifying Upload...' : 'Test Device Sync'}
              </button>
            </div>

            {/* Telemetry Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#121824] p-3 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Last Synced Session</span>
                <span className="font-mono text-xs text-slate-200 block truncate mt-1">
                  {androidSync.lastSyncedSessionId || 'None'}
                </span>
              </div>
              <div className="bg-[#121824] p-3 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Total Synced Sessions</span>
                <span className="font-mono text-sm font-semibold text-cyan-400 block mt-1">
                  {androidSync.totalSyncedCount} confirmed
                </span>
              </div>
              <div className="bg-[#121824] p-3 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Pending Uploads</span>
                <span className="font-mono text-sm font-semibold text-slate-200 block mt-1">
                  {androidSync.pendingUploadsCount}
                </span>
              </div>
              <div className="bg-[#121824] p-3 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Server Health</span>
                <span className="font-mono text-xs text-emerald-400 flex items-center gap-1 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  Online (Port 3000)
                </span>
              </div>
            </div>

            {/* Error Telemetry if any */}
            {androidSync.syncErrors.length > 0 && (
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-800/40 text-xs">
                <div className="flex items-center gap-1.5 text-rose-400 font-semibold mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Recent Synchronization Warnings</span>
                </div>
                <div className="space-y-1">
                  {androidSync.syncErrors.map((err, idx) => (
                    <div key={idx} className="text-[11px] text-rose-300 font-mono">
                      [{formatDateTime(err.timestamp)}] {err.code}: {err.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Android Jetpack Compose Background Worker:
              </span>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-cyan-400 transition-colors cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? 'Copied!' : 'Copy Kotlin'}
              </button>
            </div>
            <pre className="p-3.5 rounded-lg bg-[#0E1420] border border-slate-800 font-mono text-[11px] text-cyan-300/90 overflow-x-auto max-h-72">
              {kotlinSnippet}
            </pre>
          </div>
        )}

        {activeTab === 'endpoints' && (
          <div className="space-y-3 text-xs">
            <div className="bg-[#0E1420] p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-emerald-400">POST /api/v1/sync/android-batch</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded">Recommended</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Accepts multipart form with JSON metadata, 44-byte validated audio WAV, and accelerometer/gyroscope CSV in a single atomic transmission.
              </p>
            </div>

            <div className="bg-[#0E1420] p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-cyan-400">POST /api/v1/sessions</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">REST Idempotent</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Creates session record with client UUID to avoid duplicates on poor cell reception.
              </p>
            </div>

            <div className="bg-[#0E1420] p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-cyan-400">POST /api/v1/sessions/:id/audio</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">Audio Ingestion</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Uploads RIFF/WAVE PCM audio file with mandatory SHA256 integrity validation.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
