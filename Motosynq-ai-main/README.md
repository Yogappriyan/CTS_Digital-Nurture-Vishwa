# MOTOSYNQ AI — Intelligent Motorcycle Condition Monitoring Through Multimodal Sensor Fusion

> **Positioning:** An AI-assisted screening tool for stationary motorcycle inspections. It does **NOT** replace a qualified mechanic, and no result is a confirmed mechanical diagnosis.

---

## 1. Overview
MOTOSYNQ AI is the companion web dashboard for the MOTOSYNQ Android mobile application. It enables riders and fleet managers to inspect motorcycle health through synchronized acoustic waveforms and smartphone motion sensor (accelerometer and gyroscope) recordings during stationary engine operation.

The backend infrastructure is powered by **Google Firebase** (Cloud Firestore & Firebase Authentication) with production security rules.

---

## 2. Key Architecture & Honesty Rules
1. **Never Fabricate Diagnostics**: No fake health scores or synthetic accuracy percentages. The UI renders clear empty states when data is missing.
2. **AI Model Not Configured Guard**: When no trained model artifact is loaded, screening inference returns `model_not_configured` and clearly displays "AI model not configured" while still presenting signal visualizations (waveforms, FFT spectra, and statistical feature summaries).
3. **Sample Data Flagging**: Any illustrative demo data is strictly separated in `src/demo` and labeled with prominent **"Sample data"** badges.
4. **Motion Sensor Context**: Smartphone motion sensors measure the phone's physical motion, not engine vibration directly; mounting position and bracket rigidity affect interpretation.
5. **Observation vs. Diagnosis Separation**: AI pattern observations (`AI observation – not a diagnosis`) are visually and textually distinguished from workshop mechanic confirmations (`Mechanic confirmed`, with technician name, workshop, and date).

---

## 3. Technology Stack
- **Frontend**: React 19 + Vite + TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **3D Digital Twin**: Three.js procedural motorcycle with WebGL detection and 2D schematic SVG fallback
- **Backend & Database**: Firebase Cloud Firestore (`ai-studio-motosynqai-7ace9007-a747-4648-82f7-6cb04ddd994f`)
- **Authentication**: Firebase Authentication (Google Sign-In with popup + Rider ID)
- **Signal Analytics**: Recharts + HTML5 Canvas waveform audio scrubbing + FFT spectrum
- **Reporting**: Client-side PDF generation (`jspdf`) + token-gated public sharing
- **Security**: Hardened Firestore rules (`firestore.rules`) enforcing tenant isolation and field validation

---

## 4. Firestore Database Structure (`firebase-blueprint.json`)
- `/users/{userId}`: Rider profile details
- `/vehicles/{vehicleId}`: Registered motorcycle profiles
- `/sessions/{sessionId}`: Multimodal stationary inspection sessions (duration, clock, source, features, latest analysis)
- `/maintenance/{maintenanceId}`: Routine maintenance logs
- `/mechanic_confirmations/{confirmationId}`: Physical workshop technician diagnoses
- `/shared_reports/{reportId}`: Token-gated public share links with expiration and revocation

---

## 5. Security Rules (`firestore.rules`)
- **Global Default-Deny**: Catch-all prevents unauthenticated access.
- **Master Gate**: All user records require `request.auth.uid == userId`.
- **Anti-Update Gap**: Dedicated `isValid[Entity]` helpers validate types, boundaries, and string lengths on every write.
- **No Blanket Listing**: Collection queries require matching user ownership on `resource.data.userId`.
- Rules are deployed using Firebase Tools / AI Studio RPC (`fax.DeployRules`).

---

## 6. Local Development
```bash
# 1. Install dependencies
npm install

# 2. Run dev server on port 3000
npm run dev

# 3. Build production bundle
npm run build

# 4. Type check / lint
npm run lint
```

---

## 7. Known Gaps / Remaining Integration Work
1. **Model Weights Artifact**: The acoustic classification service returns `model_not_configured` until a machine learning model artifact (e.g., Random Forest or 1D-CNN) is trained on stationary motorcycle idle audio with certified mechanic labels.
2. **Physical Device Android End-to-End Testing**: The Android sync guidance (`docs/ANDROID_INTEGRATION.md`) provides Retrofit, OkHttp, and WorkManager implementations; hardware end-to-end testing on physical devices is required to verify accelerometer mounting resonance.
3. **Dynamic Decibels Calibration**: Microphones vary in gain across smartphone OEMs; hardware calibration curves will improve SNR normalization.
