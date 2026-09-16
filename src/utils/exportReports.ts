import { jsPDF } from 'jspdf';
import { EggInspectionData, InspectionStats } from '../types';

/**
 * Generate official PDF Report for egg grading batches
 */
export function exportToPDF(items: EggInspectionData[], stats: InspectionStats, batchName: string = 'Batch Harian'): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 16;

  // Header Banner
  doc.setFillColor(24, 24, 27); // Dark zinc
  doc.roundedRect(12, y, pageWidth - 24, 24, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN INSPEKSI & GRADING TELUR OTOMATIS', 18, y + 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(212, 212, 216);
  doc.text(`Sistem Candling Sinar Merah & Computer Vision | Batch: ${batchName}`, 18, y + 17);
  doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full', timeStyle: 'short' } as any)}`, pageWidth - 85, y + 17);

  y += 32;

  // Summary Metrics Card
  doc.setTextColor(24, 24, 27);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('RINGKASAN HASIL EVALUASI BATCH', 14, y);
  y += 5;

  const cardWidth = (pageWidth - 28 - 9) / 4;
  const cards = [
    { label: 'Total Diperiksa', value: `${stats.totalInspected} Telur`, color: [244, 244, 245] },
    { label: 'Grade A (Prima)', value: `${stats.gradeACount} (${stats.totalInspected > 0 ? Math.round((stats.gradeACount / stats.totalInspected) * 100) : 0}%)`, color: [236, 253, 245] },
    { label: 'Grade B (Segar)', value: `${stats.gradeBCount} (${stats.totalInspected > 0 ? Math.round((stats.gradeBCount / stats.totalInspected) * 100) : 0}%)`, color: [239, 246, 255] },
    { label: 'Grade C / D (Olahan/Reject)', value: `${stats.gradeCCount + stats.gradeDCount} (${stats.totalInspected > 0 ? Math.round(((stats.gradeCCount + stats.gradeDCount) / stats.totalInspected) * 100) : 0}%)`, color: [254, 226, 226] },
  ];

  cards.forEach((card, idx) => {
    const cx = 14 + idx * (cardWidth + 3);
    doc.setFillColor(card.color[0], card.color[1], card.color[2]);
    doc.roundedRect(cx, y, cardWidth, 18, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(card.label, cx + 4, y + 6);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(card.value, cx + 4, y + 13);
  });

  y += 26;

  // Technical Specs
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pageWidth - 28, 16, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Rata-rata Skor Kesegaran: ${stats.avgFreshnessScore}/100 | Defect Retak: ${stats.hairlineCrackCount} | Defect Bintik Darah: ${stats.bloodSpotCount}`, 18, y + 6);
  doc.text(`Standar Acuan: SNI 3926:2008 & USDA Candling Standard (Kedalaman Kantung Udara & Integritas Cangkang)`, 18, y + 11);

  y += 24;

  // Table of Inspected Eggs
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(24, 24, 27);
  doc.text(`DAFTAR RINCIAN BUTIR TELUR (${items.length} Butir)`, 14, y);
  y += 5;

  // Table Header
  const headers = ['No', 'ID Telur', 'Grade', 'Kantung Udara', 'Cangkang', 'Bobot Est.', 'Status', 'Ground Truth'];
  const colWidths = [10, 36, 26, 28, 30, 20, 18, 16];
  
  doc.setFillColor(228, 228, 231);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(39, 39, 42);

  let currentX = 16;
  headers.forEach((h, i) => {
    doc.text(h, currentX, y + 5);
    currentX += colWidths[i];
  });

  y += 8;

  // Table Rows (limit to fit page nicely, or multi-page if > 18)
  const maxRows = Math.min(items.length, 24);
  for (let i = 0; i < maxRows; i++) {
    const item = items[i];
    const isEven = i % 2 === 0;

    if (isEven) {
      doc.setFillColor(250, 250, 250);
      doc.rect(14, y - 1, pageWidth - 28, 6.5, 'F');
    }

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    let rowX = 16;
    doc.text(`${i + 1}`, rowX, y + 4);
    rowX += colWidths[0];

    doc.text(item.id.slice(0, 16), rowX, y + 4);
    rowX += colWidths[1];

    // Grade coloring
    if (item.grade === 'Grade A') {
      doc.setTextColor(22, 101, 52); // green
      doc.setFont('helvetica', 'bold');
    } else if (item.grade === 'Grade B') {
      doc.setTextColor(2, 132, 199); // blue/cyan
      doc.setFont('helvetica', 'bold');
    } else if (item.grade === 'Grade C') {
      doc.setTextColor(180, 83, 9); // amber
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setTextColor(185, 28, 28); // red (Grade D)
      doc.setFont('helvetica', 'bold');
    }
    doc.text(item.grade, rowX, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    rowX += colWidths[2];

    doc.text(`${item.airCellDepthMm.toFixed(1)} mm`, rowX, y + 4);
    rowX += colWidths[3];

    const shellShort = item.shellCondition.length > 15 ? item.shellCondition.slice(0, 14) + '..' : item.shellCondition;
    doc.text(shellShort, rowX, y + 4);
    rowX += colWidths[4];

    doc.text(`${item.estimatedWeightGram}g`, rowX, y + 4);
    rowX += colWidths[5];

    doc.text(item.fertility.includes('Infertile') ? 'Konsumsi' : 'Fertil/Lain', rowX, y + 4);
    rowX += colWidths[6];

    doc.text(item.isGroundTruthVerified ? 'Valid' : 'AI Pred', rowX, y + 4);

    y += 6.5;

    // Check page overflow
    if (y > 265 && i < items.length - 1) {
      doc.addPage();
      y = 20;
    }
  }

  // Footer / Verification Stamp
  y = Math.min(275, y + 10);
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, pageWidth - 14, y);
  y += 6;

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text('Dokumen ini dicetak otomatis oleh Sistem Egg Candling AI Grading & Training Dataset Collector.', 14, y);
  doc.text('Tervalidasi secara komputasi untuk standarisasi mutu pangan.', pageWidth - 100, y);

  // Save PDF file
  const fileName = `Laporan_Grading_Telur_${new Date().toISOString().slice(0, 10)}_${Date.now().toString().slice(-4)}.pdf`;
  doc.save(fileName);
}

/**
 * Export inspection items to standard CSV for spreadsheet analysis
 */
export function exportToCSV(items: EggInspectionData[]): void {
  const headers = [
    'ID_Telur',
    'Timestamp',
    'Waktu_Inspeksi',
    'Grade_Akhir',
    'Tingkat_Keyakinan_Persen',
    'Kategori_Ukuran',
    'Estimasi_Bobot_Gram',
    'Skor_Kesegaran_0_100',
    'Kedalaman_Kantung_Udara_mm',
    'Kondisi_Kuning_Telur',
    'Integritas_Cangkang_Persen',
    'Status_Cangkang',
    'Skor_Translusensi_Merah',
    'Status_Fertilitas',
    'Daftar_Defect',
    'Engine_Inferensi',
    'Latency_ms',
    'Terverifikasi_Ground_Truth',
    'Tersinkron_Cloud',
  ];

  const rows = items.map((item) => [
    `"${item.id}"`,
    item.timestamp,
    `"${new Date(item.timestamp).toISOString()}"`,
    `"${item.grade}"`,
    item.confidence,
    `"${item.size}"`,
    item.estimatedWeightGram,
    item.freshnessScore,
    item.airCellDepthMm,
    `"${item.yolkCondition.replace(/"/g, '""')}"`,
    item.shellIntegrityPercent,
    `"${item.shellCondition}"`,
    item.translucencyScore,
    `"${item.fertility}"`,
    `"${item.defects.join('; ')}"`,
    `"${item.inferenceEngine}"`,
    item.inferenceLatencyMs,
    item.isGroundTruthVerified ? 'YA' : 'TIDAK',
    item.syncedToCloud ? 'YA' : 'TIDAK',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Dataset_Inspeksi_Telur_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export Training Dataset in YOLO / EfficientNet ready format (JSON manifest + annotations)
 */
export function exportTrainingDatasetManifest(items: EggInspectionData[]): void {
  const gradeToClassId: Record<string, number> = {
    'Grade A': 0,
    'Grade B': 1,
    'Grade C': 2,
    'Grade D': 3,
  };

  const manifest = {
    datasetName: 'EggCandlingRedLightDataset_SNI_4Class',
    version: '2.0.0',
    exportTimestamp: new Date().toISOString(),
    totalSamples: items.length,
    classes: ['Grade A', 'Grade B', 'Grade C', 'Grade D'],
    yoloYamlConfig: `
# YOLOv8 Red Light Egg Candling (630-660nm) Classification & Defect Config
path: ./dataset/egg_candling
train: images/train
val: images/val
nc: 4
names:
  0: Grade_A_Prima
  1: Grade_B_Segar
  2: Grade_C_Olahan
  3: Grade_D_Reject
`,
    efficientNetConfig: {
      targetInputSize: [384, 384, 3],
      preprocessing: 'red_candling_645nm_normalized',
      numClasses: 4,
      classWeights: {
        'Grade A': 1.0,
        'Grade B': 1.0,
        'Grade C': 1.3,
        'Grade D': 2.0, // Emphasize crack/defect recall
      },
    },
    annotations: items.map((item) => {
      const classId = gradeToClassId[item.grade] ?? 0;
      const bbox = item.yoloBbox || [0.5, 0.5, 0.65, 0.8];
      return {
        id: item.id,
        imageUrl: item.imageUrl,
        grade: item.grade,
        classId,
        yoloAnnotationLine: `${classId} ${bbox.join(' ')}`,
        airCellDepthMm: item.airCellDepthMm,
        translucencyScore: item.translucencyScore,
        defects: item.defects,
        isVerified: item.isGroundTruthVerified,
      };
    }),
  };

  const jsonStr = JSON.stringify(manifest, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `YOLO_EfficientNet_Egg_Dataset_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
