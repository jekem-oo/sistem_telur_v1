export type EggGrade = 'Grade A' | 'Grade B' | 'Grade C' | 'Grade D';

export type EggSize = 'Jumbo (>65g)' | 'Extra Large (60-65g)' | 'Large (55-60g)' | 'Medium (50-55g)' | 'Small (<50g)';

export type FertilityStatus = 'Infertile (Konsumsi)' | 'Fertile (Embrio Berkembang)' | 'Blood Ring / Mati (Reject)' | 'Tidak Diketahui';

export interface ModelTuningConfig {
  crackSensitivity: number; // 50 - 150 (lower = more sensitive to hairline microcracks)
  airCellThresholdA: number; // default 3.5 mm
  airCellThresholdB: number; // default 6.0 mm
  airCellThresholdC: number; // default 9.0 mm
  minConfidenceThreshold: number; // 60 - 95%
  spectralWavelengthNm: number; // 630 - 660 nm
  enableAutoEnhancement: boolean;
}

export interface EggInspectionData {
  id: string;
  timestamp: number;
  imageUrl: string;
  grade: EggGrade;
  confidence: number; // 0 - 100%
  size: EggSize;
  estimatedWeightGram: number;
  freshnessScore: number; // 0 - 100

  // Candling Physical Indicators
  airCellDepthMm: number; // e.g. 2.1mm
  yolkCondition: string; // e.g. "Sentral, outline samar, gerak sangat terbatas"
  shellIntegrityPercent: number; // 0 - 100%
  shellCondition: 'Utuh Sempurna' | 'Retak Rambut (Hairline)' | 'Retak Bintang' | 'Noda Ringan' | 'Kotor / Noda Pekat';
  translucencyScore: number; // 0 - 100 (penetrasi sinar merah)
  fertility: FertilityStatus;
  defects: string[]; // e.g. ['Hairline crack', 'Blood spot', 'Large air cell']
  
  // Model & Architecture Metadata
  inferenceEngine: string; // e.g. 'Gemini-Vision-Hybrid', 'Edge-YOLO-CV', or Custom External Model Name
  inferenceLatencyMs: number;
  yoloBbox?: [number, number, number, number]; // [x_center, y_center, width, height] normalized 0-1
  modelRecommendation: string;
  notes?: string;

  // Training Dataset Metadata
  isGroundTruthVerified: boolean;
  verifiedBy?: string;
  syncedToCloud: boolean;
  cloudSyncTimestamp?: number;
}

export interface InspectionStats {
  totalInspected: number;
  gradeACount: number;
  gradeBCount: number;
  gradeCCount: number;
  gradeDCount: number;
  avgFreshnessScore: number;
  defectCount: number;
  hairlineCrackCount: number;
  bloodSpotCount: number;
  largeAirCellCount: number;
}

export interface CloudSyncConfig {
  autoSyncEnabled: boolean;
  syncIntervalMinutes: number; // e.g. 5, 15, 30
  lastSyncTime: number | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  targetProvider: 'Google Cloud Storage' | 'AWS S3' | 'Custom Server DB';
  pendingQueueCount: number;
}

export type ModelType = 
  | 'gemini'             // Google Gemini Flash Vision API
  | 'edge_cv'            // Local Client Edge Computer Vision & Hough Meniscus
  | 'external_api'       // External HTTP REST Endpoint (Flask/FastAPI/Triton/Roboflow)
  | 'custom_weights'     // Uploaded ONNX / TensorFlow.js / PyTorch weights manifest
  | 'ensemble';          // Multi-model consensus voter

export interface CustomModelDefinition {
  id: string;
  name: string;
  version: string;
  type: ModelType;
  description: string;
  author: string; // e.g., 'Teman Peneliti / Rekan Tim', 'Bawaan Sistem', etc.
  accuracyScore: number; // e.g. 96.4%
  isActive: boolean;
  isBuiltIn: boolean;
  createdAt: number;
  lastTrainedDate?: string;
  endpointUrl?: string; // For external_api
  apiAuthHeader?: string; // Optional Bearer token or API key
  modelWeightFileUrl?: string; // For uploaded model weights/manifest
  weightSizeMb?: number;
  classesSupported: EggGrade[];
  inputResolution?: string; // e.g. '640x640'
  votingWeight: number; // 1 - 5 for ensemble combination
  trainingEpochs?: number;
  batchSize?: number;
  notes?: string;
}

export interface EnsembleSettings {
  mode: 'single_active' | 'ensemble_consensus' | 'cascade_fallback';
  confidenceThreshold: number; // minimum confidence to accept single model before fallback
  autoRetrainTriggerCount: number; // trigger retraining alert when N new verified eggs added
}
