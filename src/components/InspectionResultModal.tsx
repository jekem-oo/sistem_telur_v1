import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Tag, Info, Cpu, Check, Download, FileText, ArrowRight } from 'lucide-react';
import { EggInspectionData, EggGrade } from '../types';

interface InspectionResultModalProps {
  data: EggInspectionData | null;
  onClose: () => void;
  onUpdateGroundTruth: (id: string, updatedGrade: EggGrade, notes: string) => void;
  onNextEgg: () => void;
}

export const InspectionResultModal: React.FC<InspectionResultModalProps> = ({
  data,
  onClose,
  onUpdateGroundTruth,
  onNextEgg,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<EggGrade>(data?.grade || 'Grade A');
  const [expertNotes, setExpertNotes] = useState(data?.notes || '');
  const [isVerified, setIsVerified] = useState(data?.isGroundTruthVerified ?? false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  React.useEffect(() => {
    if (data) {
      setSelectedGrade(data.grade);
      setExpertNotes(data.notes || '');
      setIsVerified(data.isGroundTruthVerified);
      setSaveSuccess(false);
    }
  }, [data]);

  if (!data) return null;

  const handleSaveGroundTruth = () => {
    onUpdateGroundTruth(data.id, selectedGrade, expertNotes);
    setIsVerified(true);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const getGradeTheme = (grade: EggGrade) => {
    switch (grade) {
      case 'Grade A':
        return {
          bg: 'bg-emerald-500/15',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          badge: 'bg-emerald-500 text-zinc-950',
          title: 'Grade A (Kualitas Prima / Super)',
          desc: 'Telur sangat segar, kantung udara < 3.5mm, kuning telur sentral tegak, cangkang utuh tanpa cacat mikro.',
        };
      case 'Grade B':
        return {
          bg: 'bg-blue-500/15',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          badge: 'bg-blue-500 text-zinc-950',
          title: 'Grade B (Standar Konsumsi)',
          desc: 'Kualitas konsumsi harian (kantung udara 3.5 - 6.0mm), kuning telur bulat tegas, pergerakan wajar.',
        };
      case 'Grade C':
        return {
          bg: 'bg-amber-500/15',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          badge: 'bg-amber-500 text-zinc-950',
          title: 'Grade C (Industri / Olahan Matang)',
          desc: 'Kantung udara 6.0 - 9.0mm, kekentalan putih telur menurun. Direkomendasikan untuk industri bakery & olahan matang.',
        };
      case 'Grade D':
      default:
        return {
          bg: 'bg-rose-500/15',
          border: 'border-rose-500/30',
          text: 'text-rose-400',
          badge: 'bg-rose-500 text-white',
          title: 'Grade D (REJECT / Afkir)',
          desc: 'Ditemukan cacat cangkang (retak rambut tembus sinar), bintik darah (blood spot), atau kantung udara > 9.0mm. Dilarang konsumsi meja.',
        };
    }
  };

  const theme = getGradeTheme(data.grade);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header Ribbon */}
        <div className={`px-6 py-4 border-b ${theme.border} ${theme.bg} flex items-center justify-between`}>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-lg font-black text-sm tracking-wide ${theme.badge}`}>
              {data.grade}
            </span>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                {theme.title}
              </h2>
              <p className="text-xs text-zinc-300 font-mono mt-0.5">
                ID: {data.id} • Keyakinan Model: {data.confidence}%
              </p>
            </div>
          </div>
          <button
            id="close-result-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Main Visual & Key Metrics split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Candling Snapshot Preview */}
            <div className="relative aspect-square rounded-xl bg-black border border-zinc-800 overflow-hidden flex items-center justify-center">
              <img
                src={data.imageUrl}
                alt="Candling Egg Scan"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 left-2 px-2 py-1 bg-zinc-950/85 border border-zinc-800 rounded text-[10px] text-zinc-300 font-mono">
                Sinar Merah 630-660nm
              </div>
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-zinc-950/85 border border-zinc-800 rounded text-[10px] text-zinc-300 font-mono flex items-center space-x-1">
                <Cpu className="w-3 h-3 text-rose-400" />
                <span>{data.inferenceEngine} ({data.inferenceLatencyMs}ms)</span>
              </div>
            </div>

            {/* Core Candling Indicators */}
            <div className="space-y-3">
              {/* Air Cell Depth Card */}
              <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Kedalaman Kantung Udara</span>
                  <span className="font-bold text-white">{data.airCellDepthMm} mm</span>
                </div>
                {/* Progress scale */}
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${Math.min(100, (data.airCellDepthMm / 10) * 100)}%` }}
                    className={`h-full ${
                      data.airCellDepthMm <= 3
                        ? 'bg-emerald-500'
                        : data.airCellDepthMm <= 5
                        ? 'bg-green-500'
                        : data.airCellDepthMm <= 8
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                  <span>&lt;3.5mm (Grade A)</span>
                  <span>3.5-6mm (Grade B)</span>
                  <span>6-9mm (Grade C)</span>
                  <span>&gt;9mm (Grade D)</span>
                </div>
              </div>

              {/* Freshness & Weight Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-xl">
                  <span className="text-[11px] text-zinc-400 block">Skor Kesegaran</span>
                  <span className="text-xl font-black text-white">{data.freshnessScore}</span>
                  <span className="text-[10px] text-zinc-500"> / 100</span>
                </div>
                <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-xl">
                  <span className="text-[11px] text-zinc-400 block">Ukuran / Bobot</span>
                  <span className="text-sm font-bold text-white truncate block">{data.size}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">~{data.estimatedWeightGram} gram</span>
                </div>
              </div>

              {/* Shell & Yolk Status */}
              <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Integritas Cangkang:</span>
                  <span className={`font-semibold ${data.shellCondition.includes('Retak') ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {data.shellCondition} ({data.shellIntegrityPercent}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Kuning Telur:</span>
                  <span className="text-zinc-200 text-right truncate max-w-[150px]">{data.yolkCondition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Status Fertilitas:</span>
                  <span className="text-zinc-200">{data.fertility}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Defect Alerts if present */}
          {data.defects.length > 0 && (
            <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded-xl">
              <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold mb-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Cacat / Anomali Terdeteksi ({data.defects.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {data.defects.map((defect, i) => (
                  <span key={i} className="px-2 py-0.5 bg-rose-900/60 border border-rose-700/50 text-rose-200 rounded text-xs">
                    {defect}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Model Recommendation */}
          <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs space-y-1">
            <span className="text-zinc-400 font-semibold flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-zinc-300" />
              <span>Rekomendasi Penanganan:</span>
            </span>
            <p className="text-zinc-300 leading-relaxed pl-5">
              {data.modelRecommendation}
            </p>
          </div>

          {/* Ground Truth Validation for Training Database (PENTING untuk Data Latih) */}
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  Validasi Ground Truth (Katalog Data Latih AI)
                </h4>
              </div>
              {isVerified && (
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-semibold">
                  Tervalidasi Pakar
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              Citra ini otomatis tersimpan ke basis data. Anda dapat memverifikasi atau mengoreksi label agar dataset semakin presisi untuk retraining model YOLOv8 / EfficientNet.
            </p>

            {/* Select Correct Grade */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Grade A', 'Grade B', 'Grade C', 'Grade D'] as EggGrade[]).map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => setSelectedGrade(grade)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-center ${
                    selectedGrade === grade
                      ? 'bg-zinc-200 text-zinc-950 border-white font-bold shadow-md'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>

            {/* Expert notes */}
            <input
              id="expert-training-notes-input"
              type="text"
              placeholder="Catatan inspektur / ciri khas citra (opsional)..."
              value={expertNotes}
              onChange={(e) => setExpertNotes(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
            />

            <div className="flex justify-end pt-1">
              <button
                id="btn-save-ground-truth"
                onClick={handleSaveGroundTruth}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-medium border border-zinc-700 transition-all flex items-center space-x-1.5"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Label Tersimpan!</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Konfirmasi Label Data Latih</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-zinc-950 border-t border-zinc-800/80 flex items-center justify-between gap-3">
          <button
            id="btn-close-modal-footer"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-medium border border-zinc-800 transition-colors"
          >
            Tutup
          </button>

          <button
            id="btn-next-egg"
            onClick={() => {
              onClose();
              onNextEgg();
            }}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-950/40 transition-all flex items-center space-x-2"
          >
            <span>Periksa Telur Berikutnya</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
