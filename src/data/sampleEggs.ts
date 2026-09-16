import { EggInspectionData } from '../types';

/**
 * Creates SVG Data URIs representing high-resolution red candling views
 */
function createCandlingSvg(type: 'grade_a' | 'grade_b' | 'grade_c' | 'hairline_crack' | 'blood_spot' | 'blood_ring'): string {
  let innerElements = '';

  if (type === 'grade_a') {
    innerElements = `
      <!-- Soft centered yolk halo with high freshness -->
      <circle cx="200" cy="220" r="55" fill="rgba(180, 20, 10, 0.45)" filter="blur(8px)" />
      <circle cx="200" cy="220" r="38" fill="rgba(210, 40, 10, 0.65)" filter="blur(4px)" />
      <!-- Air cell at blunt top (tiny <3.0mm) -->
      <path d="M 170 85 Q 200 102 230 85 Q 200 70 170 85" fill="rgba(255, 230, 210, 0.85)" />
      <path d="M 165 83 Q 200 68 235 83" stroke="rgba(255, 240, 220, 0.9)" stroke-width="1.5" fill="none" />
    `;
  } else if (type === 'grade_b') {
    innerElements = `
      <!-- Yolk slightly defined, standard consumption -->
      <circle cx="205" cy="215" r="58" fill="rgba(170, 15, 5, 0.5)" filter="blur(6px)" />
      <circle cx="205" cy="215" r="42" fill="rgba(195, 30, 8, 0.7)" filter="blur(3px)" />
      <!-- Air cell (4.2mm) -->
      <path d="M 160 92 Q 200 115 240 92 Q 200 70 160 92" fill="rgba(255, 225, 200, 0.8)" />
      <path d="M 155 90 Q 200 68 245 90" stroke="rgba(255, 235, 210, 0.85)" stroke-width="1.8" fill="none" />
    `;
  } else if (type === 'grade_c') {
    innerElements = `
      <!-- Mobile darker yolk shifted slightly off-center for bakery use -->
      <ellipse cx="218" cy="235" rx="65" ry="55" fill="rgba(130, 8, 5, 0.7)" filter="blur(4px)" />
      <!-- Air cell larger (7.2mm) -->
      <path d="M 148 108 Q 200 140 252 108 Q 200 70 148 108" fill="rgba(255, 220, 190, 0.82)" />
      <path d="M 142 105 Q 200 68 258 105" stroke="rgba(255, 230, 200, 0.85)" stroke-width="2" fill="none" />
    `;
  } else if (type === 'hairline_crack') {
    innerElements = `
      <!-- Yolk -->
      <circle cx="198" cy="215" r="56" fill="rgba(170, 20, 10, 0.55)" filter="blur(6px)" />
      <!-- Air cell -->
      <path d="M 160 95 Q 200 120 240 95 Q 200 70 160 95" fill="rgba(255, 225, 200, 0.8)" />
      <!-- Hairline crack illuminated by intense candling red beam (sharp bright white/yellow fracture light leakage) -->
      <path d="M 145 180 L 168 202 L 160 215 L 185 242 L 182 265 L 195 285" stroke="rgba(255, 255, 230, 0.95)" stroke-width="2.2" stroke-linecap="round" fill="none" filter="drop-shadow(0 0 4px #ff3333)" />
      <path d="M 168 202 L 180 196" stroke="rgba(255, 255, 230, 0.85)" stroke-width="1.8" stroke-linecap="round" fill="none" />
    `;
  } else if (type === 'blood_spot') {
    innerElements = `
      <!-- Yolk -->
      <circle cx="200" cy="215" r="58" fill="rgba(175, 20, 10, 0.58)" filter="blur(5px)" />
      <!-- Dark opaque blood spot inclusion absorbing red light -->
      <circle cx="188" cy="210" r="8" fill="#3a0000" />
      <circle cx="191" cy="212" r="5" fill="#150000" />
      <circle cx="184" cy="207" r="4" fill="#2d0202" />
      <!-- Air cell -->
      <path d="M 160 95 Q 200 118 240 95 Q 200 70 160 95" fill="rgba(255, 225, 200, 0.75)" />
    `;
  } else {
    // blood_ring (dead embryo)
    innerElements = `
      <!-- Blood ring defect -->
      <ellipse cx="200" cy="210" rx="42" ry="36" stroke="#5a0505" stroke-width="4.5" fill="none" filter="blur(1px)" />
      <ellipse cx="200" cy="210" rx="41" ry="35" stroke="#900a0a" stroke-width="2.5" fill="none" />
      <!-- Air cell -->
      <path d="M 152 102 Q 200 130 248 102 Q 200 70 152 102" fill="rgba(255, 220, 195, 0.78)" />
    `;
  }

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
    <defs>
      <radialGradient id="candlerBacklight" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ff1a1a" stop-opacity="1" />
        <stop offset="45%" stop-color="#cc0000" stop-opacity="0.9" />
        <stop offset="75%" stop-color="#660000" stop-opacity="0.75" />
        <stop offset="100%" stop-color="#0d0202" stop-opacity="0.95" />
      </radialGradient>
      <radialGradient id="apertureGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
        <stop offset="35%" stop-color="#ff4d4d" stop-opacity="0.7" />
        <stop offset="80%" stop-color="#b30000" stop-opacity="0.4" />
        <stop offset="100%" stop-color="transparent" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="eggShellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ff8566" stop-opacity="0.95" />
        <stop offset="40%" stop-color="#e62e00" stop-opacity="0.88" />
        <stop offset="85%" stop-color="#991f00" stop-opacity="0.82" />
        <stop offset="100%" stop-color="#661400" stop-opacity="0.75" />
      </linearGradient>
    </defs>

    <!-- Dark Candling Chamber Box -->
    <rect width="400" height="400" fill="#09090b" />

    <!-- Circular Candling Aperture Socket (Tempat Bulat Sinar Merah) -->
    <circle cx="200" cy="200" r="175" fill="#18181b" stroke="#27272a" stroke-width="4" />
    <circle cx="200" cy="200" r="160" fill="url(#candlerBacklight)" />
    <circle cx="200" cy="200" r="160" fill="url(#apertureGlow)" />

    <!-- Circular Candler Aperture Collar Ring -->
    <circle cx="200" cy="200" r="158" stroke="#ff3333" stroke-width="2" stroke-dasharray="8 6" fill="none" opacity="0.65" />

    <!-- Ovoid Egg Silhouette sitting over circular candling light -->
    <!-- Egg shape: broader at bottom, tapered at top -->
    <path d="M 200 68 C 265 68, 305 145, 305 225 C 305 295, 255 338, 200 338 C 145 338, 95 295, 95 225 C 95 145, 135 68, 200 68 Z" 
          fill="url(#eggShellGrad)" 
          stroke="rgba(255, 120, 90, 0.6)" 
          stroke-width="2.5" />

    ${innerElements}

    <!-- Translucent Candling Red Glow Bloom -->
    <ellipse cx="200" cy="200" rx="90" ry="110" fill="rgba(255, 60, 40, 0.15)" filter="blur(12px)" />

    <!-- Circular Aperture Rim Indicators -->
    <circle cx="200" cy="200" r="130" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1" fill="none" />
  </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_EGGS: EggInspectionData[] = [
  {
    id: 'EGG-20260915-1001',
    timestamp: Date.now() - 1000 * 60 * 18,
    imageUrl: createCandlingSvg('grade_a'),
    grade: 'Grade A',
    confidence: 98,
    size: 'Extra Large (60-65g)',
    estimatedWeightGram: 63,
    freshnessScore: 97,
    airCellDepthMm: 2.1,
    yolkCondition: 'Sentral sempurna, bayangan lembut, elastisitas membran vitellin tinggi',
    shellIntegrityPercent: 100,
    shellCondition: 'Utuh Sempurna',
    translucencyScore: 92,
    fertility: 'Infertile (Konsumsi)',
    defects: [],
    inferenceEngine: 'Gemini-Vision-Hybrid',
    inferenceLatencyMs: 138,
    yoloBbox: [0.5, 0.5, 0.62, 0.78],
    modelRecommendation: 'Grade A (Kualitas Prima): Sangat segar, kantung udara <3.5mm, cangkang utuh tanpa cacat. Standar terbaik konsumsi meja.',
    isGroundTruthVerified: true,
    verifiedBy: 'Quality Control Lead',
    syncedToCloud: true,
    cloudSyncTimestamp: Date.now() - 1000 * 60 * 5,
  },
  {
    id: 'EGG-20260915-1002',
    timestamp: Date.now() - 1000 * 60 * 12,
    imageUrl: createCandlingSvg('grade_b'),
    grade: 'Grade B',
    confidence: 94,
    size: 'Large (55-60g)',
    estimatedWeightGram: 58,
    freshnessScore: 84,
    airCellDepthMm: 4.2,
    yolkCondition: 'Posisi tengah, bulat tegas, pergerakan wajar',
    shellIntegrityPercent: 98,
    shellCondition: 'Utuh Sempurna',
    translucencyScore: 84,
    fertility: 'Infertile (Konsumsi)',
    defects: [],
    inferenceEngine: 'Gemini-Vision-Hybrid',
    inferenceLatencyMs: 135,
    yoloBbox: [0.5, 0.5, 0.63, 0.8],
    modelRecommendation: 'Grade B: Segar standar konsumsi harian dan pasar retail, kantung udara 3.5 - 6.0mm.',
    notes: 'Dataset Grade B Sinar Merah (IMG_0444.JPG, Mutu II SNI)',
    isGroundTruthVerified: true,
    verifiedBy: 'Sistem Terkalibrasi',
    syncedToCloud: true,
    cloudSyncTimestamp: Date.now() - 1000 * 60 * 5,
  },
  {
    id: 'EGG-20260915-1003',
    timestamp: Date.now() - 1000 * 60 * 8,
    imageUrl: createCandlingSvg('grade_c'),
    grade: 'Grade C',
    confidence: 93,
    size: 'Medium (50-55g)',
    estimatedWeightGram: 53.4,
    freshnessScore: 68,
    airCellDepthMm: 7.2,
    yolkCondition: 'Agak gelap, berpindah posisi bebas ke tepi (viskositas albumen sedang)',
    shellIntegrityPercent: 98,
    shellCondition: 'Utuh Sempurna',
    translucencyScore: 71,
    fertility: 'Infertile (Konsumsi)',
    defects: ['Kantung udara membesar (7.2mm - standar mutu III)'],
    inferenceEngine: 'Gemini-Vision-Hybrid',
    inferenceLatencyMs: 140,
    yoloBbox: [0.5, 0.5, 0.64, 0.81],
    modelRecommendation: 'Grade C (Mutu III SNI 3926:2008): Kantung udara 6.0 - 9.0mm, cangkang utuh tanpa retak. Direkomendasikan untuk bahan olahan bakery, kue, atau industri pengeringan telur.',
    notes: 'Dataset Grade C Sinar Merah (IMG_0567.JPG & IMG_0561.JPG)',
    isGroundTruthVerified: true,
    verifiedBy: 'Sistem Terkalibrasi',
    syncedToCloud: true,
    cloudSyncTimestamp: Date.now() - 1000 * 60 * 5,
  },
  {
    id: 'EGG-20260915-1004',
    timestamp: Date.now() - 1000 * 60 * 5,
    imageUrl: createCandlingSvg('hairline_crack'),
    grade: 'Grade D',
    confidence: 99,
    size: 'Large (55-60g)',
    estimatedWeightGram: 57,
    freshnessScore: 32,
    airCellDepthMm: 4.5,
    yolkCondition: 'Terpengaruh tekanan cangkang dan kebocoran berkas cahaya',
    shellIntegrityPercent: 40,
    shellCondition: 'Retak Rambut (Hairline)',
    translucencyScore: 82,
    fertility: 'Infertile (Konsumsi)',
    defects: ['Retak Rambut (Hairline crack) tembus sinar merah'],
    inferenceEngine: 'Gemini-Vision-Hybrid',
    inferenceLatencyMs: 128,
    yoloBbox: [0.45, 0.55, 0.35, 0.4],
    modelRecommendation: 'Grade D (REJECT/AFKIR): Tidak memenuhi standar Grade A, B, atau C. Retak rambut menyebabkan kebocoran cahaya merah dan risiko Salmonella tinggi.',
    notes: 'Aturan: Selain Grade A, B, C = Grade D (Reject)',
    isGroundTruthVerified: true,
    verifiedBy: 'Inspector AI + Operator',
    syncedToCloud: false,
  },
  {
    id: 'EGG-20260915-1005',
    timestamp: Date.now() - 1000 * 60 * 2,
    imageUrl: createCandlingSvg('blood_spot'),
    grade: 'Grade D',
    confidence: 96,
    size: 'Medium (50-55g)',
    estimatedWeightGram: 52,
    freshnessScore: 28,
    airCellDepthMm: 4.8,
    yolkCondition: 'Inklusi hemoglobin gelap menyerap sinar merah',
    shellIntegrityPercent: 96,
    shellCondition: 'Utuh Sempurna',
    translucencyScore: 76,
    fertility: 'Blood Ring / Mati (Reject)',
    defects: ['Bintik Darah (Blood spot > 3mm)'],
    inferenceEngine: 'Gemini-Vision-Hybrid',
    inferenceLatencyMs: 148,
    yoloBbox: [0.47, 0.52, 0.15, 0.15],
    modelRecommendation: 'Grade D (REJECT/AFKIR): Inklusi darah oviduk (blood spot). Tidak lolos Grade A/B/C.',
    notes: 'Aturan: Selain Grade A, B, C = Grade D (Reject)',
    isGroundTruthVerified: true,
    verifiedBy: 'Inspector AI + Operator',
    syncedToCloud: false,
  },
];
