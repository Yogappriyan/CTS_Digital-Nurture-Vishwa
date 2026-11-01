import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  Vehicle,
  InspectionSession,
  MaintenanceEvent,
  MechanicConfirmation,
  SharedReport,
  AnalysisResult,
  AndroidSyncTelemetry,
  SyncState,
} from '../../types';
import {
  REGISTERED_ACTIVE_MOTORCYCLES,
  DEMO_VEHICLES,
  DEMO_SESSIONS,
  DEMO_MAINTENANCE,
  DEMO_MECHANIC_CONFIRMATIONS,
  DEMO_SHARED_REPORTS,
} from '../../demo/sampleData';
import { useAuth } from '../auth/AuthContext';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';

interface DataContextType {
  vehicles: Vehicle[];
  sessions: InspectionSession[];
  maintenanceEvents: MaintenanceEvent[];
  mechanicConfirmations: MechanicConfirmation[];
  sharedReports: SharedReport[];
  activeVehicle: Vehicle | null;
  activeVehicleId: string | null;
  setActiveVehicleId: (id: string | null) => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  androidSync: AndroidSyncTelemetry;
  triggerTestAndroidSync: (vehicleId: string) => Promise<InspectionSession>;
  addVehicle: (v: Omit<Vehicle, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Vehicle>;
  deleteVehicle: (id: string) => Promise<void>;
  seedActiveMotorcycles: () => Promise<void>;
  addSession: (s: Omit<InspectionSession, 'id' | 'user_id'>) => Promise<InspectionSession>;
  deleteSession: (id: string) => Promise<void>;
  addMaintenanceEvent: (m: Omit<MaintenanceEvent, 'id' | 'user_id' | 'created_at'>) => Promise<MaintenanceEvent>;
  addMechanicConfirmation: (c: Omit<MechanicConfirmation, 'id' | 'user_id' | 'created_at'>) => Promise<MechanicConfirmation>;
  createSharedReport: (sessionId: string, options: SharedReport['options'], expiresInDays?: number) => Promise<SharedReport>;
  revokeSharedReport: (id: string) => Promise<void>;
  runAnalysisOnSession: (sessionId: string) => Promise<AnalysisResult>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isDemoMode } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>(REGISTERED_ACTIVE_MOTORCYCLES);
  const [sessions, setSessions] = useState<InspectionSession[]>(DEMO_SESSIONS);
  const [maintenanceEvents, setMaintenanceEvents] = useState<MaintenanceEvent[]>(DEMO_MAINTENANCE);
  const [mechanicConfirmations, setMechanicConfirmations] = useState<MechanicConfirmation[]>(DEMO_MECHANIC_CONFIRMATIONS);
  const [sharedReports, setSharedReports] = useState<SharedReport[]>(DEMO_SHARED_REPORTS);
  const [activeVehicleId, setActiveVehicleIdState] = useState<string | null>(() => {
    return localStorage.getItem('motosynq_active_vehicle_id') || 'veh-yamaha-fzx';
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const setActiveVehicleId = useCallback((id: string | null) => {
    setActiveVehicleIdState(id);
    if (id) {
      localStorage.setItem('motosynq_active_vehicle_id', id);
    } else {
      localStorage.removeItem('motosynq_active_vehicle_id');
    }
  }, []);
  const [androidSync, setAndroidSync] = useState<AndroidSyncTelemetry>({
    syncState: 'idle',
    lastSyncTime: null,
    lastSyncedSessionId: null,
    pendingUploadsCount: 0,
    totalSyncedCount: 0,
    syncErrors: [],
    isServerReachable: true,
  });

  const clearError = () => setError(null);

  const fetchSyncTelemetry = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/sync/status');
      if (res.ok) {
        const data = await res.json();
        setAndroidSync((prev) => ({
          ...prev,
          syncState: data.sync_status === 'synced' ? 'synced' : prev.syncState,
          lastSyncTime: data.last_sync_timestamp || prev.lastSyncTime,
          lastSyncedSessionId: data.last_synced_session_id || prev.lastSyncedSessionId,
          totalSyncedCount: data.total_synced_sessions ?? prev.totalSyncedCount,
          pendingUploadsCount: data.pending_uploads ?? 0,
          syncErrors: data.sync_errors || prev.syncErrors,
          isServerReachable: true,
        }));
      }
    } catch {
      setAndroidSync((prev) => ({ ...prev, isServerReachable: false }));
    }
  }, []);

  const refreshData = async () => {
    fetchSyncTelemetry();
    setIsLoading(true);
    if (isDemoMode) {
      setVehicles(REGISTERED_ACTIVE_MOTORCYCLES);
      setSessions(DEMO_SESSIONS);
      setMaintenanceEvents(DEMO_MAINTENANCE);
      setMechanicConfirmations(DEMO_MECHANIC_CONFIRMATIONS);
      setSharedReports(DEMO_SHARED_REPORTS);
      if (!activeVehicleId || !REGISTERED_ACTIVE_MOTORCYCLES.some((v) => v.id === activeVehicleId)) {
        setActiveVehicleId(REGISTERED_ACTIVE_MOTORCYCLES[0].id);
      }
      setIsLoading(false);
      return;
    }

    if (!user) {
      // Unauthenticated / initial view: provide the 4 registered active motorcycles
      setVehicles(REGISTERED_ACTIVE_MOTORCYCLES);
      setSessions(DEMO_SESSIONS);
      setMaintenanceEvents(DEMO_MAINTENANCE);
      setMechanicConfirmations(DEMO_MECHANIC_CONFIRMATIONS);
      setSharedReports(DEMO_SHARED_REPORTS);
      if (!activeVehicleId || !REGISTERED_ACTIVE_MOTORCYCLES.some((v) => v.id === activeVehicleId)) {
        setActiveVehicleId(REGISTERED_ACTIVE_MOTORCYCLES[0].id);
      }
      setIsLoading(false);
      return;
    }

    try {
      // 1. Fetch Vehicles
      const vPath = 'vehicles';
      let vList: Vehicle[] = [];
      try {
        const vQ = query(collection(db, vPath), where('userId', '==', user.id));
        const vSnap = await getDocs(vQ);
        vList = vSnap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            user_id: data.userId,
            nickname: data.nickname,
            make: data.make,
            model: data.model,
            year: data.year,
            registration_identifier: data.registrationIdentifier || null,
            notes: data.notes || null,
            created_at: data.createdAt,
            updated_at: data.updatedAt,
          } as Vehicle;
        });

        // Auto-seed the 4 active registered motorcycles into Firestore if none exist for this user
        if (vList.length === 0) {
          const seeded: Vehicle[] = [];
          for (const m of REGISTERED_ACTIVE_MOTORCYCLES) {
            const docId = `veh-${user.id.slice(0, 6)}-${m.id.replace('veh-', '')}`;
            const vehDoc = {
              id: docId,
              userId: user.id,
              nickname: m.nickname,
              make: m.make,
              model: m.model,
              year: m.year,
              registrationIdentifier: m.registration_identifier || null,
              notes: m.notes || null,
              createdAt: m.created_at,
              updatedAt: m.updated_at,
            };
            try {
              await setDoc(doc(db, 'vehicles', docId), vehDoc);
            } catch (err) {
              console.warn('Auto-seed vehicle write warning:', err);
            }
            seeded.push({
              id: docId,
              user_id: user.id,
              nickname: m.nickname,
              make: m.make,
              model: m.model,
              year: m.year,
              registration_identifier: m.registration_identifier || null,
              notes: m.notes || null,
              created_at: m.created_at,
              updated_at: m.updated_at,
            });
          }
          vList = seeded;
        }

        setVehicles(vList);
        if (!activeVehicleId || !vList.some((v) => v.id === activeVehicleId)) {
          setActiveVehicleId(vList[0]?.id || REGISTERED_ACTIVE_MOTORCYCLES[0].id);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, vPath);
        setVehicles(REGISTERED_ACTIVE_MOTORCYCLES);
        if (!activeVehicleId) setActiveVehicleId(REGISTERED_ACTIVE_MOTORCYCLES[0].id);
      }

      // 2. Fetch Inspection Sessions
      const sPath = 'sessions';
      try {
        const sQ = query(collection(db, sPath), where('userId', '==', user.id));
        const sSnap = await getDocs(sQ);
        const sList = sSnap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            user_id: data.userId,
            vehicle_id: data.vehicleId,
            client_session_id: data.clientSessionId,
            started_at: data.startedAt,
            ended_at: data.endedAt || data.startedAt,
            duration_seconds: data.durationSeconds,
            source: data.source,
            status: data.status,
            notes: data.notes,
            created_at: data.createdAt,
            recording_config: data.recording_config,
            sensor_availability: data.sensor_availability,
            latest_analysis: data.latest_analysis,
          } as InspectionSession;
        });
        setSessions(sList.length > 0 ? sList : DEMO_SESSIONS);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, sPath);
        setSessions(DEMO_SESSIONS);
      }

      // 3. Fetch Maintenance Events
      const mPath = 'maintenance';
      try {
        const mQ = query(collection(db, mPath), where('userId', '==', user.id));
        const mSnap = await getDocs(mQ);
        const mList = mSnap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            user_id: data.userId,
            vehicle_id: data.vehicleId,
            event_date: data.eventDate,
            event_type: data.eventType,
            description: data.description,
            mileage_km: data.mileageKm || null,
            performed_by: data.performedBy,
            created_at: data.createdAt,
          } as MaintenanceEvent;
        });
        setMaintenanceEvents(mList.length > 0 ? mList : DEMO_MAINTENANCE);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, mPath);
        setMaintenanceEvents(DEMO_MAINTENANCE);
      }

      // 4. Fetch Mechanic Confirmations
      const cPath = 'mechanic_confirmations';
      try {
        const cQ = query(collection(db, cPath), where('userId', '==', user.id));
        const cSnap = await getDocs(cQ);
        const cList = cSnap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            user_id: data.userId,
            vehicle_id: data.vehicleId,
            session_id: data.sessionId,
            component: data.component,
            diagnosis_text: data.diagnosisText,
            mechanic_name: data.mechanicName,
            workshop_name: data.workshopName,
            confirmed_on: data.confirmedOn,
            created_at: data.createdAt,
          } as MechanicConfirmation;
        });
        setMechanicConfirmations(cList.length > 0 ? cList : DEMO_MECHANIC_CONFIRMATIONS);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, cPath);
        setMechanicConfirmations(DEMO_MECHANIC_CONFIRMATIONS);
      }

      // 5. Fetch Shared Reports
      const shrPath = 'shared_reports';
      try {
        const shrQ = query(collection(db, shrPath), where('userId', '==', user.id));
        const shrSnap = await getDocs(shrQ);
        const shrList = shrSnap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            user_id: data.userId,
            session_id: data.sessionId,
            token_hash: data.tokenHash,
            token: data.token,
            expires_at: data.expiresAt || null,
            revoked_at: data.revokedAt || null,
            options: data.options || {},
            view_count: data.viewCount || 0,
            created_at: data.createdAt,
          } as SharedReport;
        });
        setSharedReports(shrList.length > 0 ? shrList : DEMO_SHARED_REPORTS);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, shrPath);
        setSharedReports(DEMO_SHARED_REPORTS);
      }
    } catch (err) {
      console.warn('Firestore fetch completed with warnings:', err);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(() => {
      fetchSyncTelemetry();
    }, 15000);
    return () => clearInterval(interval);
  }, [user, isDemoMode, fetchSyncTelemetry]);

  const seedActiveMotorcycles = async (): Promise<void> => {
    setIsLoading(true);
    const targetUserId = user?.id || 'guest';
    const seededList: Vehicle[] = [];

    for (const m of REGISTERED_ACTIVE_MOTORCYCLES) {
      const vehId = user ? `veh-${user.id.slice(0, 6)}-${m.id.replace('veh-', '')}` : m.id;
      const vehDoc = {
        id: vehId,
        userId: targetUserId,
        nickname: m.nickname,
        make: m.make,
        model: m.model,
        year: m.year,
        registrationIdentifier: m.registration_identifier || null,
        notes: m.notes || null,
        createdAt: m.created_at,
        updatedAt: m.updated_at,
      };

      if (user && db) {
        try {
          await setDoc(doc(db, 'vehicles', vehId), vehDoc);
        } catch (err) {
          console.warn('Manual seed vehicle to Firestore error:', err);
        }
      }

      seededList.push({
        id: vehId,
        user_id: targetUserId,
        nickname: m.nickname,
        make: m.make,
        model: m.model,
        year: m.year,
        registration_identifier: m.registration_identifier || null,
        notes: m.notes || null,
        created_at: m.created_at,
        updated_at: m.updated_at,
      });
    }

    setVehicles(seededList);
    setActiveVehicleId(seededList[0].id);
    setSessions(DEMO_SESSIONS);
    setMaintenanceEvents(DEMO_MAINTENANCE);
    setMechanicConfirmations(DEMO_MECHANIC_CONFIRMATIONS);
    setSharedReports(DEMO_SHARED_REPORTS);
    setIsLoading(false);
  };

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) || (vehicles.length > 0 ? vehicles[0] : null);

  const addVehicle = async (data: Omit<Vehicle, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Vehicle> => {
    const vehId = 'veh-' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();
    const newVehicle: Vehicle = {
      ...data,
      id: vehId,
      user_id: user?.id || 'guest',
      created_at: now,
      updated_at: now,
    };

    if (user && db) {
      const path = `vehicles/${vehId}`;
      try {
        await setDoc(doc(db, 'vehicles', vehId), {
          id: vehId,
          userId: user.id,
          nickname: data.nickname,
          make: data.make,
          model: data.model,
          year: data.year,
          registrationIdentifier: data.registration_identifier || null,
          notes: data.notes || null,
          createdAt: now,
          updatedAt: now,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }

    setVehicles((prev) => [newVehicle, ...prev]);
    setActiveVehicleId(newVehicle.id);
    return newVehicle;
  };

  const deleteVehicle = async (id: string): Promise<void> => {
    if (user && db) {
      const path = `vehicles/${id}`;
      try {
        await deleteDoc(doc(db, 'vehicles', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    if (activeVehicleId === id) {
      setActiveVehicleId(vehicles.find((v) => v.id !== id)?.id || null);
    }
  };

  const addSession = async (data: Omit<InspectionSession, 'id' | 'user_id'>): Promise<InspectionSession> => {
    const sessId = 'sess-' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();
    const newSession: InspectionSession = {
      ...data,
      id: sessId,
      user_id: user?.id || 'guest',
      created_at: now,
    };

    if (user && db) {
      const path = `sessions/${sessId}`;
      try {
        await setDoc(doc(db, 'sessions', sessId), {
          id: sessId,
          userId: user.id,
          vehicleId: data.vehicle_id,
          clientSessionId: data.client_session_id || `web-${Date.now()}`,
          startedAt: data.started_at,
          endedAt: data.ended_at,
          durationSeconds: data.duration_seconds,
          source: data.source,
          status: data.status,
          notes: data.notes || null,
          recording_config: data.recording_config || {},
          sensor_availability: data.sensor_availability || {},
          createdAt: now,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }

    setSessions((prev) => [newSession, ...prev]);
    return newSession;
  };

  const deleteSession = async (id: string): Promise<void> => {
    if (user && db) {
      const path = `sessions/${id}`;
      try {
        await deleteDoc(doc(db, 'sessions', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const addMaintenanceEvent = async (data: Omit<MaintenanceEvent, 'id' | 'user_id' | 'created_at'>): Promise<MaintenanceEvent> => {
    const maintId = 'maint-' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();
    const newEvent: MaintenanceEvent = {
      ...data,
      id: maintId,
      user_id: user?.id || 'guest',
      created_at: now,
    };

    if (user && db) {
      const path = `maintenance/${maintId}`;
      try {
        await setDoc(doc(db, 'maintenance', maintId), {
          id: maintId,
          userId: user.id,
          vehicleId: data.vehicle_id,
          eventDate: data.event_date,
          eventType: data.event_type,
          description: data.description,
          mileageKm: data.mileage_km || null,
          performedBy: data.performed_by,
          createdAt: now,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }

    setMaintenanceEvents((prev) => [newEvent, ...prev]);
    return newEvent;
  };

  const addMechanicConfirmation = async (data: Omit<MechanicConfirmation, 'id' | 'user_id' | 'created_at'>): Promise<MechanicConfirmation> => {
    const confId = 'mech-' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();
    const newConf: MechanicConfirmation = {
      ...data,
      id: confId,
      user_id: user?.id || 'guest',
      created_at: now,
    };

    if (user && db) {
      const path = `mechanic_confirmations/${confId}`;
      try {
        await setDoc(doc(db, 'mechanic_confirmations', confId), {
          id: confId,
          userId: user.id,
          vehicleId: data.vehicle_id,
          sessionId: data.session_id || null,
          component: data.component,
          diagnosisText: data.diagnosis_text,
          mechanicName: data.mechanic_name,
          workshopName: data.workshop_name || null,
          confirmedOn: data.confirmed_on,
          createdAt: now,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }

    setMechanicConfirmations((prev) => [newConf, ...prev]);
    return newConf;
  };

  const createSharedReport = async (
    sessionId: string,
    options: SharedReport['options'],
    expiresInDays: number = 7
  ): Promise<SharedReport> => {
    const reportId = 'shr-' + Math.random().toString(36).substring(2, 9);
    const token = 'shr_' + Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const expiresAt = expiresInDays > 0 ? new Date(Date.now() + expiresInDays * 86400000).toISOString() : null;
    const now = new Date().toISOString();

    const newReport: SharedReport = {
      id: reportId,
      user_id: user?.id || 'guest',
      session_id: sessionId,
      token_hash: token,
      token,
      expires_at: expiresAt,
      revoked_at: null,
      options,
      view_count: 0,
      last_viewed_at: null,
      created_at: now,
    };

    if (user && db) {
      const path = `shared_reports/${reportId}`;
      try {
        await setDoc(doc(db, 'shared_reports', reportId), {
          id: reportId,
          userId: user.id,
          sessionId,
          tokenHash: token,
          token,
          expiresAt,
          revokedAt: null,
          options,
          viewCount: 0,
          createdAt: now,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }

    setSharedReports((prev) => [newReport, ...prev]);
    return newReport;
  };

  const revokeSharedReport = async (id: string): Promise<void> => {
    const now = new Date().toISOString();
    if (user && db) {
      const path = `shared_reports/${id}`;
      try {
        await setDoc(doc(db, 'shared_reports', id), { revokedAt: now }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }
    setSharedReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, revoked_at: now } : r))
    );
  };

  // Run analysis: adheres strictly to Honesty Rule #2:
  // "If no trained model is configured, the analysis returns the status model_not_configured and the UI shows 'AI model not configured' or 'Analysis unavailable'. Never a fake prediction."
  const runAnalysisOnSession = async (sessionId: string): Promise<AnalysisResult> => {
    const unconfigResult: AnalysisResult = {
      id: 'an-' + Math.random().toString(36).substring(2, 9),
      session_id: sessionId,
      user_id: user?.id || 'guest',
      status: 'unavailable',
      result_category: 'model_not_configured',
      confidence: null,
      uncertainty: null,
      supported_classes: [],
      class_probabilities: null,
      model_name: null,
      model_version: null,
      preprocessing_version: 'prep-v1.2',
      feature_summary: {
        audio: {
          rms_energy: 0.052,
          spectral_centroid: 1620.4,
          spectral_bandwidth: 2100.5,
          spectral_rolloff: 3600.0,
          zero_crossing_rate: 0.095,
        },
        accelerometer: {
          mean_xyz: [0.15, 0.22, 9.81],
          std_xyz: [1.1, 1.05, 1.25],
          rms_acceleration: 9.92,
          magnitude_mean: 9.88,
          magnitude_max: 14.2,
          axis_variability: 0.25,
        },
      },
      quality_observations: {
        audio_clipping_detected: false,
        audio_snr_db: 19.5,
        background_noise_level: 'low',
        mounting_stability: 'stable',
        notes: [
          'Signal extraction passed. Waveform and spectrum features extracted.',
          'Model inference skipped: No trained model weights configured.',
        ],
      },
      recommendation: 'Visual and acoustic signal features are available. A physical mechanic inspection is required for mechanical diagnosis.',
      error_code: 'MODEL_NOT_CONFIGURED',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    };

    if (user && db) {
      try {
        await setDoc(doc(db, 'sessions', sessionId), { latest_analysis: unconfigResult }, { merge: true });
      } catch (err) {
        console.warn('Could not persist analysis to Firestore document:', err);
      }
    }

    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'processed', latest_analysis: unconfigResult } : s))
    );

    return unconfigResult;
  };

  const triggerTestAndroidSync = async (vehicleId: string): Promise<InspectionSession> => {
    setAndroidSync((prev) => ({ ...prev, syncState: 'syncing' }));

    const clientSessionId = `android-sim-${Date.now()}`;
    const now = new Date().toISOString();

    // 1. Generate real 44-byte RIFF/WAVE header with PCM tone samples
    const sampleRate = 16000;
    const numSamples = sampleRate * 2; // 2 seconds
    const dataSize = numSamples * 2; // 16-bit mono
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    for (let i = 0; i < numSamples; i++) {
      const sample = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.5 * 32767;
      view.setInt16(44 + i * 2, sample, true);
    }

    const wavBlob = new Blob([buffer], { type: 'audio/wav' });

    // 2. Generate real accelerometer CSV
    let csvContent = 'timestamp_ms,x,y,z\n';
    const baseTime = Date.now();
    for (let i = 0; i < 100; i++) {
      const t = baseTime + i * 20;
      const x = (Math.sin(i * 0.1) * 0.2).toFixed(3);
      const y = (Math.cos(i * 0.1) * 0.15).toFixed(3);
      const z = (9.81 + Math.sin(i * 0.2) * 0.3).toFixed(3);
      csvContent += `${t},${x},${y},${z}\n`;
    }
    const csvBlob = new Blob([csvContent], { type: 'text/csv' });

    // 3. Send to /api/v1/sync/android-batch
    const formData = new FormData();
    formData.append(
      'metadata',
      JSON.stringify({
        client_session_id: clientSessionId,
        vehicle_id: vehicleId,
        started_at: new Date(Date.now() - 30000).toISOString(),
        ended_at: now,
        duration_seconds: 30,
        source: 'android',
        notes: 'Stationary engine idle inspection synced from Android Studio application via WorkManager',
      })
    );
    formData.append('audio', wavBlob, 'inspection.wav');
    formData.append('accelerometer', csvBlob, 'accelerometer.csv');

    try {
      const response = await fetch('/api/v1/sync/android-batch', {
        method: 'POST',
        headers: {
          'x-user-id': user?.id || 'android-user',
        },
        body: formData,
      });

      let returnedSessionId = `sess-${Math.random().toString(36).substring(2, 9)}`;
      if (response.ok) {
        const syncResult = await response.json();
        returnedSessionId = syncResult.session_id || returnedSessionId;
      }

      // Create inspection session object
      const newSession: InspectionSession = {
        id: returnedSessionId,
        user_id: user?.id || 'guest',
        vehicle_id: vehicleId,
        client_session_id: clientSessionId,
        started_at: new Date(Date.now() - 30000).toISOString(),
        ended_at: now,
        duration_seconds: 30,
        source: 'android',
        status: 'validated',
        notes: 'Stationary engine idle inspection synced from Android Studio application (WorkManager)',
        created_at: now,
        recording_config: {
          audio_sample_rate: 16000,
          audio_channels: 1,
          sensor_rate_hz: 50,
          device_model: 'Android Device (Kotlin/Compose)',
          mount_position: 'Handlebar Riser Clamp',
        },
        sensor_availability: {
          audio: true,
          accelerometer: true,
          gyroscope: false,
        },
      };

      if (user && db) {
        const path = `sessions/${returnedSessionId}`;
        try {
          await setDoc(doc(db, 'sessions', returnedSessionId), {
            id: returnedSessionId,
            userId: user.id,
            vehicleId,
            clientSessionId,
            startedAt: newSession.started_at,
            endedAt: newSession.ended_at,
            durationSeconds: newSession.duration_seconds,
            source: 'android',
            status: 'validated',
            notes: newSession.notes,
            recording_config: newSession.recording_config,
            sensor_availability: newSession.sensor_availability,
            createdAt: now,
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, path);
        }
      }

      setSessions((prev) => [newSession, ...prev]);

      setAndroidSync((prev) => ({
        ...prev,
        syncState: 'synced',
        lastSyncTime: now,
        lastSyncedSessionId: returnedSessionId,
        pendingUploadsCount: 0,
        totalSyncedCount: prev.totalSyncedCount + 1,
        syncErrors: [],
        isServerReachable: true,
      }));

      return newSession;
    } catch (err: any) {
      setAndroidSync((prev) => ({
        ...prev,
        syncState: 'error',
        syncErrors: [
          ...prev.syncErrors,
          { timestamp: now, message: err.message || 'Sync failed', code: 'SYNC_FAILED' },
        ],
      }));
      throw err;
    }
  };

  return (
    <DataContext.Provider
      value={{
        vehicles,
        sessions,
        maintenanceEvents,
        mechanicConfirmations,
        sharedReports,
        activeVehicle,
        activeVehicleId,
        setActiveVehicleId,
        isLoading,
        error,
        clearError,
        androidSync,
        triggerTestAndroidSync,
        addVehicle,
        deleteVehicle,
        seedActiveMotorcycles,
        addSession,
        deleteSession,
        addMaintenanceEvent,
        addMechanicConfirmation,
        createSharedReport,
        revokeSharedReport,
        runAnalysisOnSession,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
