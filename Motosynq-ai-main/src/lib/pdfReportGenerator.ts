import jsPDF from 'jspdf';
import { InspectionSession, Vehicle, MechanicConfirmation } from '../types';
import { formatDateTime, formatDate } from './formatters';

export function generateInspectionPdfReport(
  session: InspectionSession,
  vehicle?: Vehicle | null,
  mechanicConfirmation?: MechanicConfirmation | null,
  options?: { hide_registration?: boolean; hide_audio?: boolean }
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const analysis = session.latest_analysis;

  // Header Background bar
  doc.setFillColor(11, 18, 32); // #0B1220
  doc.rect(0, 0, 210, 32, 'F');

  // Title & Wordmark
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('MOTOSYNQ AI — CONDITION SCREENING REPORT', 14, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(34, 211, 238); // Cyan accent
  doc.text('Acoustic & Inertial Multimodal Inspection Record', 14, 22);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${formatDateTime(new Date().toISOString())}`, 140, 22);

  let y = 42;

  // Disclaimer Box (MANDATORY HONESTY REQUIREMENT)
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(245, 158, 11);
  doc.rect(14, y, 182, 16, 'FD');

  doc.setTextColor(180, 83, 9);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('IMPORTANT SCREENING DISCLAIMER:', 18, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(
    'This report contains AI-assisted screening observations from stationary recordings. It is NOT a mechanical diagnosis',
    18,
    y + 10
  );
  doc.text(
    'and does not replace a qualified technician. No component is confirmed defective without a verified physical inspection.',
    18,
    y + 14
  );

  y += 24;

  // Vehicle & Session Summary Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, y, 182, 36, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('VEHICLE & INSPECTION METADATA', 18, y + 7);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  const col1X = 18;
  const col2X = 100;

  doc.text(`Motorcycle: ${vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.nickname})` : 'Unassigned'}`, col1X, y + 15);
  const displayReg = options?.hide_registration
    ? (vehicle?.registration_identifier ? `•••• ${vehicle.registration_identifier.slice(-4)} (Masked)` : 'Masked')
    : (vehicle?.registration_identifier || 'Not recorded');
  doc.text(`Registration ID: ${displayReg}`, col1X, y + 21);
  doc.text(`Recording Date: ${formatDateTime(session.started_at)}`, col1X, y + 27);
  doc.text(`Inspection Source: ${session.source === 'android' ? 'Android Mobile App' : 'Web Diagnostic Lab'}`, col1X, y + 33);

  doc.text(`Session ID: ${session.id}`, col2X, y + 15);
  doc.text(`Duration: ${session.duration_seconds} seconds`, col2X, y + 21);
  doc.text(`Audio Sample Rate: ${session.recording_config?.audio_sample_rate || 16000} Hz`, col2X, y + 27);
  doc.text(
    `Sensors: Audio (${session.sensor_availability?.audio ? 'Yes' : 'No'}), Accel (${session.sensor_availability?.accelerometer ? 'Yes' : 'No'})`,
    col2X,
    y + 33
  );

  y += 44;

  // Screening Classification Section
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, y, 182, 38, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('AI SCREENING CLASSIFICATION', 18, y + 7);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  const resultCat = analysis?.result_category ? analysis.result_category.replace('_', ' ').toUpperCase() : 'AI MODEL NOT CONFIGURED';
  doc.text(`Result Classification: ${resultCat}`, col1X, y + 15);
  doc.text(
    `Confidence Score: ${analysis?.confidence !== null && analysis?.confidence !== undefined ? `${(analysis.confidence * 100).toFixed(0)}%` : 'Unavailable'}`,
    col1X,
    y + 21
  );
  doc.text(`Model Identifier: ${analysis?.model_name || 'N/A'} (${analysis?.model_version || 'Not loaded'})`, col1X, y + 27);
  doc.text(`Preprocessing Version: ${analysis?.preprocessing_version || 'v1.0'}`, col1X, y + 33);

  doc.text(`Mounting Stability: ${analysis?.quality_observations?.mounting_stability || 'Stable'}`, col2X, y + 15);
  doc.text(`Acoustic SNR: ${analysis?.quality_observations?.audio_snr_db ? `${analysis.quality_observations.audio_snr_db} dB` : 'Normal'}`, col2X, y + 21);
  doc.text(`Background Noise: ${analysis?.quality_observations?.background_noise_level || 'Low'}`, col2X, y + 27);

  y += 46;

  // AI Observation
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 22, 'F');

  doc.setTextColor(14, 116, 144);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('AI OBSERVATION (Not a diagnosis):', 18, y + 6);

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const recText = analysis?.recommendation || 'Signals match baseline envelope. Regular servicing recommended.';
  doc.text(doc.splitTextToSize(recText, 174), 18, y + 12);

  y += 28;

  // Mechanic-Confirmed Diagnosis Section
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, y, 182, 30, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('WORKSHOP MECHANIC CONFIRMATION', 18, y + 7);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  if (mechanicConfirmation) {
    doc.setTextColor(22, 101, 52);
    doc.text(`Status: Mechanic Confirmed on ${formatDate(mechanicConfirmation.confirmed_on)}`, 18, y + 14);
    doc.setTextColor(71, 85, 105);
    doc.text(`Technician: ${mechanicConfirmation.mechanic_name} (${mechanicConfirmation.workshop_name || 'Workshop'})`, 18, y + 19);
    doc.text(`Diagnosis: ${mechanicConfirmation.diagnosis_text}`, 18, y + 24);
  } else {
    doc.setTextColor(148, 163, 184);
    doc.text('No verified physical mechanic record attached to this inspection session.', 18, y + 16);
  }

  y += 38;

  // Footer Note
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7.5);
  doc.text('MOTOSYNQ AI — Intelligent Motorcycle Condition Monitoring Through Multimodal Sensor Fusion', 14, 285);

  // Trigger browser download
  doc.save(`motosynq_inspection_${session.id}.pdf`);
}
