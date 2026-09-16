import React, { useState } from 'react';
import { Sliders, Check, RotateCcw, ShieldCheck, Zap, Info, Upload, Sparkles, AlertTriangle, Layers } from 'lucide-react';
import { ModelTuningConfig, EggInspectionData } from '../types';
import { DEFAULT_TUNING_CONFIG } from '../utils/cvAnalyzer';

interface ModelTuningModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: ModelTuningConfig;
  onSaveConfig: (newConfig: ModelTuningConfig) => void;
  datasetCount: number;
  onImportUserDataset: (eggs: EggInspectionData[]) => void;
}

export const ModelTuningModal: React.FC<ModelTuningModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSaveConfig,
  datasetCount,
  onImportUserDataset,
}) => {
  if (!isOpen) return null;

  const [config, setConfig] = useState<ModelTuningConfig>({ ...currentConfig });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSave = () => {
    onSaveConfig(config);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    setConfig({ ...DEFAULT_TUNING_CONFIG });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        let items: any[] = [];
        if (Array.isArray(parsed)) {
          items = parsed;
        } else if (parsed.annotations && Array.isArray(parsed.annotations)) {
          items = parsed.annotations;
        } else if (parsed.data && Array.isArray(parsed.data)) {
          items = parsed.data;
        }

        if (items.length > 0) {
          const formatted: EggInspectionData[] = items.map((item, idx) => ({
            id: item.id || `IMPORT-USER-${Date.now()}-${idx}`,
            timestamp: item.timestamp || Date.now(),
            imageUrl: item.imageUrl || '',
            grade: item.grade || (item.classId === 0 ? 'Grade A' : item.classId === 1 ? 'Grade B' : item.classId === 2 ? 'Grade C' : 'Grade D'),
            confidence: item.confidence || 95,
            size: item.size || 'Large (55-60g)',
            estimatedWeightGram: item.estimatedWeightGram || 57,
            freshnessScore: item.freshnessScore || 85,
            airCellDepthMm: item.airCellDepthMm || 3.5,
            yolkCondition: item.yolkCondition || 'Wajar',
            shellIntegrityPercent: item.shellIntegrityPercent || 95,
            shellCondition: item.shellCondition || 'Utuh Sempurna',
            translucencyScore: item.translucencyScore || 80,
            fertility: item.fertility || 'Infertile (Konsumsi)',
            defects: item.defects || [],
            inferenceEngine: 'Edge-YOLO-CV' as const,
            inferenceLatencyMs: 70,
            yoloBbox: item.yoloBbox || [0.5, 0.5, 0.65, 0.8],
            modelRecommendation: item.modelRecommendation || 'Hasil verifikasi dataset kustom pengguna.',
            isGroundTruthVerified: true,
            verifiedBy: 'Pengguna / User Dataset',
            syncedToCloud: false,
          }));

          onImportUserDataset(formatted);
          setImportStatus(`Berhasil memuat ${formatted.length} sampel dataset kustom!`);
          setTimeout(() => setImportStatus(null), 4000);
        } else {
          setImportStatus('Format JSON tidak sesuai, pastikan berisi array objek sampel telur.');
        }
      } catch (err) {
        setImportStatus('Gagal membaca file JSON. Periksa format syntax file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Penyetelan & Kalibrasi Model (Tuning Sinar Merah)</span>
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[10px] font-mono">
                  SNI 3926:2008 & Candling CV
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Konfigurasi sensitivitas deteksi retak, ambang kantung udara, dan spektrum red-light 630-660nm.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">
          {/* Scientific Info Box */}
          <div className="p-3.5 bg-rose-950/30 border border-rose-800/40 rounded-xl flex items-start space-x-3 text-xs text-rose-200">
            <Zap className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white block">Fisika Candling Sinar Merah (Deep Red 630-660nm):</span>
              <p className="text-zinc-300 leading-relaxed text-[11px]">
                Panjang gelombang 630-660nm menembus kalsium karbonat cangkang telur dengan hamburan optimal. Celah retak rambut menghasilkan lonjakan kontras tepi (light leakage), sedangkan bintik darah dan kantung udara tampak sebagai gradien penyerapan foton.
              </p>
            </div>
          </div>

          {/* 1. Sensitivitas Deteksi Retak Rambut (Hairline Crack) */}
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-zinc-200 block">
                  Sensitivitas Deteksi Retak Rambut (Gradient Threshold)
                </label>
                <span className="text-[11px] text-zinc-500">
                  Semakin rendah angka, semakin agresif model menandai micro-crack sebagai Grade D (Reject).
                </span>
              </div>
              <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono font-bold text-rose-400">
                {config.crackSensitivity}
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="130"
              step="5"
              value={config.crackSensitivity}
              onChange={(e) => setConfig({ ...config, crackSensitivity: Number(e.target.value) })}
              className="w-full accent-rose-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>50 (Ultra Sensitif - Lab)</span>
              <span>85 (Optimal Standar Pabrik)</span>
              <span>130 (Toleransi Tinggi)</span>
            </div>
          </div>

          {/* 2. Ambang Batas Kantung Udara (Air Cell Depth Scale) */}
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-200 block">
                Kalibrasi Ambang Batas Kedalaman Kantung Udara (SNI 3926:2008)
              </label>
              <span className="text-[11px] text-zinc-500">
                Tentukan batas kedalaman kantung udara (dalam mm) untuk transisi antar grade.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Grade A Limit */}
              <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-400 block">Maks. Grade A (Prima)</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.1"
                    min="1.5"
                    max="5.0"
                    value={config.airCellThresholdA}
                    onChange={(e) => setConfig({ ...config, airCellThresholdA: Number(e.target.value) })}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-xs text-white font-mono"
                  />
                  <span className="text-xs text-zinc-400">mm</span>
                </div>
                <span className="text-[10px] text-zinc-500 block">Standar: &lt; 3.5 mm</span>
              </div>

              {/* Grade B Limit */}
              <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 space-y-1.5">
                <span className="text-[11px] font-bold text-blue-400 block">Maks. Grade B (Segar)</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.1"
                    min="4.0"
                    max="8.0"
                    value={config.airCellThresholdB}
                    onChange={(e) => setConfig({ ...config, airCellThresholdB: Number(e.target.value) })}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-xs text-white font-mono"
                  />
                  <span className="text-xs text-zinc-400">mm</span>
                </div>
                <span className="text-[10px] text-zinc-500 block">Standar: 3.5 - 6.0 mm</span>
              </div>

              {/* Grade C Limit */}
              <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 space-y-1.5">
                <span className="text-[11px] font-bold text-amber-400 block">Maks. Grade C (Olahan)</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.1"
                    min="6.5"
                    max="12.0"
                    value={config.airCellThresholdC}
                    onChange={(e) => setConfig({ ...config, airCellThresholdC: Number(e.target.value) })}
                    className="w-full px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-xs text-white font-mono"
                  />
                  <span className="text-xs text-zinc-400">mm</span>
                </div>
                <span className="text-[10px] text-zinc-500 block">&gt; {config.airCellThresholdC}mm = Grade D</span>
              </div>
            </div>
          </div>

          {/* 3. Spektrum Sinar Merah & Auto Enhancement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Wavelength */}
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
              <label className="text-xs font-bold text-zinc-200 block">
                Panjang Gelombang LED Candler
              </label>
              <select
                value={config.spectralWavelengthNm}
                onChange={(e) => setConfig({ ...config, spectralWavelengthNm: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none"
              >
                <option value={630}>630 nm (Merah Terang Standar)</option>
                <option value={645}>645 nm (Deep Red Optimal Transmisi)</option>
                <option value={660}>660 nm (Far Red Penetrasi Cangkang Tebal)</option>
              </select>
              <span className="text-[10px] text-zinc-500 block">
                Menyesuaikan koefisien kalibrasi kanal R/G/B kamera.
              </span>
            </div>

            {/* Min Confidence Cutoff */}
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-200 block">
                  Batas Keyakinan AI Min.
                </label>
                <span className="text-xs font-bold font-mono text-zinc-300">
                  {config.minConfidenceThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="95"
                step="1"
                value={config.minConfidenceThreshold}
                onChange={(e) => setConfig({ ...config, minConfidenceThreshold: Number(e.target.value) })}
                className="w-full accent-rose-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
              />
              <span className="text-[10px] text-zinc-500 block">
                Di bawah {config.minConfidenceThreshold}%, model meminta verifikasi ground truth operator.
              </span>
            </div>
          </div>

          {/* 4. Import User Dataset ("Jika kurang nanti aku juga kasih dataset dari aku") */}
          <div className="p-4 bg-zinc-950 border border-dashed border-zinc-700/80 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-zinc-200">
                  Impor Dataset Telur Tambahan Dari Anda (JSON)
                </h4>
              </div>
              <span className="text-[10px] text-zinc-500">
                Database saat ini: {datasetCount} butir
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Punya file dataset gambar atau hasil anotasi telur beriluminasi sinar merah sendiri? Unggah ke sini untuk langsung memperkaya korpus data latih model.
            </p>

            <div className="flex items-center space-x-3 pt-1">
              <label
                htmlFor="user-dataset-file-input"
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium cursor-pointer border border-zinc-700 transition-colors flex items-center space-x-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-zinc-400" />
                <span>Pilih File Dataset (.json)</span>
              </label>
              <input
                id="user-dataset-file-input"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              {importStatus && (
                <span className="text-xs text-amber-400 font-medium">
                  {importStatus}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-medium border border-zinc-800 transition-colors flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Standar SNI</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-medium border border-zinc-800 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-950/40 transition-all flex items-center space-x-1.5"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Tuning Diterapkan!</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Terapkan Tuning Model</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
