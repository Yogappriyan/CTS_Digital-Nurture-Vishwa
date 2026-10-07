import jsPDF from 'jspdf';
import { AnalysisResult } from '../types';

/**
 * Generates and downloads a clinical-grade PDF summary report of the skin analysis
 * for the user to share directly with a dermatologist or healthcare professional.
 */
export function generateSkinAnalysisPDF(analysis: AnalysisResult): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - (margin * 2);
  let y = margin;

  const primaryColor: [number, number, number] = [13, 148, 136]; // Teal #0d9488
  const darkTextColor: [number, number, number] = [30, 41, 59]; // Slate-800
  const mutedTextColor: [number, number, number] = [100, 116, 139]; // Slate-500
  const lightBgColor: [number, number, number] = [248, 250, 252]; // Slate-50

  const checkPageBreak = (spaceNeeded: number) => {
    if (y + spaceNeeded > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(margin, y, contentWidth, 18, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SKINSIGHT AI • CLINICAL SCREENING SUMMARY', margin + 6, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('AI-Assisted Computer Vision Dermatological Assessment Report', margin + 6, y + 14);

  y += 24;

  // Metadata Card
  doc.setFillColor(...lightBgColor);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 22, 'FD');

  doc.setTextColor(...mutedTextColor);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORT ID', margin + 5, y + 6);
  doc.text('DATE GENERATED', margin + 50, y + 6);
  doc.text('IMAGE QUALITY', margin + 105, y + 6);
  doc.text('ARCHITECTURE', margin + 145, y + 6);

  doc.setTextColor(...darkTextColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(analysis.id, margin + 5, y + 12);
  doc.text(new Date(analysis.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), margin + 50, y + 12);
  doc.text(analysis.imageMetadata.qualityScore || 'Standard', margin + 105, y + 12);
  doc.text((analysis.modelInfo.architecture || 'EfficientNet + CNN').substring(0, 22), margin + 145, y + 12);

  y += 28;

  // Primary Diagnosis Box
  const isHighRisk = analysis.prediction.riskLevel === 'malignant-suspected' || analysis.prediction.riskLevel === 'pre-malignant';
  const isClearSkin = analysis.prediction.categoryCode === 'normal_skin' || analysis.prediction.isNormalHealthySkin === true;

  const boxFill: [number, number, number] = isHighRisk 
    ? [254, 242, 242] 
    : isClearSkin 
    ? [240, 253, 244] 
    : [240, 253, 250];

  const boxBorder: [number, number, number] = isHighRisk 
    ? [239, 68, 68] 
    : isClearSkin 
    ? [34, 197, 94] 
    : [13, 148, 136];

  doc.setFillColor(...boxFill);
  doc.setDrawColor(...boxBorder);
  doc.setLineWidth(0.6);
  doc.rect(margin, y, contentWidth, 26, 'FD');

  doc.setTextColor(...mutedTextColor);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('PRIMARY DETECTED CONDITION', margin + 6, y + 6);

  doc.setTextColor(...darkTextColor);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(analysis.prediction.categoryName, margin + 6, y + 13);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedTextColor);
  doc.text(analysis.prediction.clinicalName, margin + 6, y + 19);

  // Confidence Pill
  const confText = `${Math.round(analysis.prediction.confidence * 100)}% Confidence (${analysis.prediction.confidenceLabel})`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...boxBorder);
  doc.text(confText, contentWidth + margin - 6 - doc.getTextWidth(confText), y + 13);

  const riskText = `Risk Tier: ${analysis.prediction.riskLevel.toUpperCase().replace('-', ' ')}`;
  doc.setFontSize(8);
  doc.setTextColor(...mutedTextColor);
  doc.text(riskText, contentWidth + margin - 6 - doc.getTextWidth(riskText), y + 19);

  y += 32;

  // Visual Findings / ABCDE
  checkPageBreak(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkTextColor);
  doc.text('Visual Morphological Analysis & ABCDE Findings', margin, y);
  y += 5;

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, margin + contentWidth, y);
  y += 5;

  if (analysis.abcdeAssessment) {
    const abcde = analysis.abcdeAssessment;
    const colW = contentWidth / 5;
    const items = [
      { label: 'Asymmetry', val: abcde.asymmetry },
      { label: 'Border', val: abcde.border },
      { label: 'Color', val: abcde.color },
      { label: 'Diameter', val: abcde.diameter },
      { label: 'Evolution', val: abcde.evolution }
    ];

    items.forEach((item, idx) => {
      const xPos = margin + (idx * colW);
      doc.setFillColor(248, 250, 252);
      doc.rect(xPos, y, colW - 2, 18, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...primaryColor);
      doc.text(item.label, xPos + 3, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...darkTextColor);
      const splitVal = doc.splitTextToSize(item.val, colW - 6);
      doc.text(splitVal.slice(0, 3), xPos + 3, y + 10);
    });
    y += 23;
  }

  // Visual Characteristics list
  if (analysis.visualFindings && analysis.visualFindings.length > 0) {
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...darkTextColor);
    doc.text('Observed Lesion Features:', margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...mutedTextColor);
    analysis.visualFindings.forEach((finding) => {
      doc.text(`• ${finding}`, margin + 3, y);
      y += 4;
    });
    y += 3;
  }

  // Differential Diagnoses Table
  checkPageBreak(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkTextColor);
  doc.text('Differential Diagnoses & Probability Distribution', margin, y);
  y += 5;

  doc.line(margin, y, margin + contentWidth, y);
  y += 5;

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...darkTextColor);
  doc.text('Condition Class', margin + 4, y + 4.5);
  doc.text('Clinical Classification', margin + 55, y + 4.5);
  doc.text('Confidence Share', margin + contentWidth - 30, y + 4.5);
  y += 7;

  analysis.probabilities.slice(0, 5).forEach((prob) => {
    checkPageBreak(8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...darkTextColor);
    doc.text(prob.name, margin + 4, y + 4);
    doc.setTextColor(...mutedTextColor);
    doc.text(prob.clinicalName.substring(0, 48), margin + 55, y + 4);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(`${prob.percentage}%`, margin + contentWidth - 25, y + 4);
    y += 5.5;
  });

  y += 4;

  // Clinical Interpretation & Recommendations
  checkPageBreak(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkTextColor);
  doc.text('Clinical Interpretation & Guidance', margin, y);
  y += 5;
  doc.line(margin, y, margin + contentWidth, y);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryColor);
  doc.text('What This Result Indicates:', margin, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...darkTextColor);
  const splitInterp = doc.splitTextToSize(analysis.prediction.interpretation, contentWidth);
  doc.text(splitInterp, margin, y);
  y += (splitInterp.length * 4) + 3;

  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(225, 29, 72); // Rose
  doc.text('What It Does NOT Mean:', margin, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...darkTextColor);
  const splitNot = doc.splitTextToSize(analysis.prediction.whatItDoesNotMean, contentWidth);
  doc.text(splitNot, margin, y);
  y += (splitNot.length * 4) + 4;

  // Recommended Next Steps
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...darkTextColor);
  doc.text('Recommended Clinical Next Steps for Patient:', margin, y);
  y += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...darkTextColor);
  analysis.prediction.recommendedActions.forEach((action, i) => {
    checkPageBreak(8);
    const splitAction = doc.splitTextToSize(`${i + 1}. ${action}`, contentWidth - 4);
    doc.text(splitAction, margin + 2, y);
    y += (splitAction.length * 3.8);
  });

  // Footer / Medical Disclaimer
  y = Math.max(y + 8, pageHeight - 24);
  if (y > pageHeight - 20) {
    doc.addPage();
    y = pageHeight - 24;
  }

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, margin + contentWidth, y);
  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(185, 28, 28);
  doc.text('MEDICAL DISCLAIMER & INTENDED USE NOTICE:', margin, y);
  y += 3.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...mutedTextColor);
  const disclaimerText = 'SkinSight AI is an academic computer-vision prototype intended strictly for educational and pre-screening decision-support purposes. It does not provide definitive medical diagnoses, replace histopathological tissue biopsies, or substitute for comprehensive in-person dermatological examination by a licensed medical doctor. Please present this report to your physician for physical clinical correlation.';
  const splitDisc = doc.splitTextToSize(disclaimerText, contentWidth);
  doc.text(splitDisc, margin, y);

  // Trigger browser download
  const cleanId = analysis.id.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`SkinSight_Clinical_Summary_${cleanId}.pdf`);
}
