import React, { useState } from 'react';
import { Sliders, Check, RotateCcw, ShieldCheck, Zap, Info, Upload, Sparkles, AlertTriangle, Layers, X } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden my-4 sm:my-8 text-stone-200">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-100 font-display">
                Kalibrasi Ovoskopi & Parameter Ambang Mutu
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Penyesuaian ambang kantung udara (SNI) & sensitivitas deteksi retak mikro cangkang
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[72vh] overflow-y-auto text-xs">
          {/* Air Cell Threshold Sliders */}
          <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-3">
            <h4 className="font-semibold text-stone-200 uppercase tracking-wider text-[11px] font-mono">
              Ambang Batas Kedalaman Kantung Udara (SNI 3926:2008)
            </h4>

            {/* Grade A Slider */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-300">Maksimum Grade A (Mutu I):</span>
                <span className="font-bold text-emerald-400 font-mono">{config.gradeAMaxAirCellMm} mm</span>
              </div>
              <input
                type="range"
                min={2}
                max={5}
                step={0.1}
                value={config.gradeAMaxAirCellMm}
                onChange={(e) => setConfig({ ...config, gradeAMaxAirCellMm: parseFloat(e.target.value) })}
                className="w-full accent-stone-300"
              />
            </div>

            {/* Grade B Slider */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-300">Maksimum Grade B (Mutu II):</span>
                <span className="font-bold text-amber-400 font-mono">{config.gradeBMaxAirCellMm} mm</span>
              </div>
              <input
                type="range"
                min={4}
                max={7}
                step={0.1}
                value={config.gradeBMaxAirCellMm}
                onChange={(e) => setConfig({ ...config, gradeBMaxAirCellMm: parseFloat(e.target.value) })}
                className="w-full accent-stone-300"
              />
            </div>

            {/* Grade C Slider */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-300">Maksimum Grade C (Mutu III):</span>
                <span className="font-bold text-orange-400 font-mono">{config.gradeCMaxAirCellMm} mm</span>
              </div>
              <input
                type="range"
                min={7}
                max={10}
                step={0.1}
                value={config.gradeCMaxAirCellMm}
                onChange={(e) => setConfig({ ...config, gradeCMaxAirCellMm: parseFloat(e.target.value) })}
                className="w-full accent-stone-300"
              />
            </div>

            <p className="text-[11px] text-stone-400 pt-1">
              *Di atas ambang Grade C (&gt;{config.gradeCMaxAirCellMm}mm) otomatis digolongkan sebagai <strong className="text-red-300">Grade D (Afkir)</strong>.
            </p>
          </div>

          {/* Strict Rules */}
          <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-3">
            <h4 className="font-semibold text-stone-200 uppercase tracking-wider text-[11px] font-mono">
              Ketentuan Mutlak Cacat Cangkang
            </h4>

            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={config.strictRejectCracks}
                onChange={(e) => setConfig({ ...config, strictRejectCracks: e.target.checked })}
                className="mt-0.5 rounded bg-stone-900 border-stone-700 text-stone-300 focus:ring-0"
              />
              <div>
                <span className="font-medium text-stone-200 block">Afkir Mutlak Retak Rambut (Hairline Crack)</span>
                <span className="text-[11px] text-stone-400">
                  Jika terdeteksi retakan mikro tembus sinar, telur langsung dilabeli Grade D terlepas dari kesegaran kuning telur.
                </span>
              </div>
            </label>

            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={config.strictRejectBlood}
                onChange={(e) => setConfig({ ...config, strictRejectBlood: e.target.checked })}
                className="mt-0.5 rounded bg-stone-900 border-stone-700 text-stone-300 focus:ring-0"
              />
              <div>
                <span className="font-medium text-stone-200 block">Afkir Mutlak Noda Darah / Meat Spot</span>
                <span className="text-[11px] text-stone-400">
                  Inklusi bintik darah langsung didiskualifikasi dari konsumsi meja.
                </span>
              </div>
            </label>
          </div>

          {/* Import User Dataset JSON */}
          <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-2">
            <h4 className="font-semibold text-stone-200 uppercase tracking-wider text-[11px] font-mono">
              Impor Dataset Tambahan (.json)
            </h4>
            <p className="text-[11px] text-stone-400">
              Muat data anotasi telur pengguna sebelumnya untuk memperluas riwayat.
            </p>
            <label className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Pilih Berkas JSON</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
            {importStatus && (
              <p className="text-[11px] text-amber-300 mt-1">{importStatus}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3.5 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 text-stone-400 hover:text-stone-200 flex items-center space-x-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Standar SNI</span>
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-medium"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-stone-100 hover:bg-white text-stone-900 font-bold rounded-xl transition-all shadow-sm flex items-center space-x-1.5"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Tersimpan</span>
                </>
              ) : (
                <span>Terapkan Kalibrasi</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
