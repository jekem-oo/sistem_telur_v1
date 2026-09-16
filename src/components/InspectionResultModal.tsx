import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Cpu, 
  Check, 
  ArrowRight, 
  X, 
  ClipboardCheck,
  Scale,
  Thermometer,
  Eye,
  FileCheck2,
  Calendar
} from 'lucide-react';
import { EggInspectionData, EggGrade } from '../types';
import { GradeStampBadge } from './GradeStampBadge';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden my-4 sm:my-8 text-stone-200">
        
        {/* Certificate-style Header */}
        <div className="px-5 sm:px-6 py-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-stone-100">
                  Lembar Hasil Evaluasi Candling
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-300 font-mono border border-stone-700">
                  SNI 3926:2008
                </span>
              </div>
              <p className="text-xs text-stone-400 font-mono mt-0.5">
                Nomor Sampel: {data.id} • {new Date(data.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
              </p>
            </div>
          </div>
          <button
            id="close-result-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Grade Badge Hero (Natural Certificate Stamp) */}
          <GradeStampBadge grade={data.grade} size="lg" showDetails />

          {/* Main Visual & Key Metrics split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Candling Snapshot Preview */}
            <div className="relative aspect-square rounded-xl bg-black border border-stone-800 overflow-hidden flex items-center justify-center group">
              <img
                src={data.imageUrl}
                alt="Foto Candling Telur Sinar Merah"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-stone-950/90 border border-stone-800 rounded-md text-[10px] text-amber-200 font-mono tracking-wide">
                Spektrum Merah (630–660 nm)
              </div>
              <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-stone-950/90 border border-stone-800 rounded-md text-[10px] text-stone-300 font-mono flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-stone-400" />
                <span>{data.inferenceEngine} ({data.inferenceLatencyMs}ms)</span>
              </div>
            </div>

            {/* Core Candling Indicators */}
            <div className="space-y-2.5 text-xs">
              {/* Air Cell Depth Card */}
              <div className="p-3.5 bg-stone-950/70 border border-stone-800/90 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-stone-400 font-medium">Kedalaman Kantung Udara</span>
                  <span className="font-bold text-stone-100 font-mono text-sm">{data.airCellDepthMm} mm</span>
                </div>
                {/* Visual Depth Bar */}
                <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${Math.min(100, (data.airCellDepthMm / 10) * 100)}%` }}
                    className={`h-full ${
                      data.airCellDepthMm <= 3.5
                        ? 'bg-emerald-500'
                        : data.airCellDepthMm <= 6.0
                        ? 'bg-amber-500'
                        : data.airCellDepthMm <= 9.0
                        ? 'bg-orange-500'
                        : 'bg-red-600'
                    }`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                  <span>&le;3.5mm (Grade A)</span>
                  <span>3.5–6mm (Grade B)</span>
                  <span>6–9mm (Grade C)</span>
                  <span>&gt;9mm (Afkir)</span>
                </div>
              </div>

              {/* Freshness & Weight Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-stone-950/70 border border-stone-800/90 rounded-xl">
                  <span className="text-[11px] text-stone-400 block font-medium">Indeks Kesegaran</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-lg font-bold text-stone-100">{data.freshnessScore}</span>
                    <span className="text-[10px] text-stone-400">/100</span>
                  </div>
                </div>
                <div className="p-3 bg-stone-950/70 border border-stone-800/90 rounded-xl">
                  <span className="text-[11px] text-stone-400 block font-medium">Kategori Bobot</span>
                  <span className="text-xs font-bold text-stone-100 truncate block mt-0.5">{data.size}</span>
                  <span className="text-[10px] text-stone-400 font-mono">~{data.estimatedWeightGram} gram</span>
                </div>
              </div>

              {/* Shell & Yolk Status */}
              <div className="p-3 bg-stone-950/70 border border-stone-800/90 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-stone-400">Kondisi Cangkang:</span>
                  <span className={`font-semibold ${data.shellCondition.includes('Retak') ? 'text-red-400' : 'text-emerald-400'}`}>
                    {data.shellCondition} ({data.shellIntegrityPercent}%)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-400">Kuning Telur (Yolk):</span>
                  <span className="text-stone-200 text-right truncate max-w-[150px]">{data.yolkCondition}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-400">Status Embrio:</span>
                  <span className="text-stone-300">{data.fertility}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Defect Alerts if present */}
          {data.defects.length > 0 && (
            <div className="p-3.5 bg-red-950/30 border border-red-900/50 rounded-xl">
              <div className="flex items-center space-x-2 text-red-300 text-xs font-bold mb-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>Temuan Cacat Mutu ({data.defects.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {data.defects.map((defect, i) => (
                  <span key={i} className="px-2.5 py-1 bg-red-900/40 border border-red-800/60 text-red-200 rounded-md text-xs font-medium">
                    {defect}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation */}
          <div className="p-3.5 bg-stone-950/80 border border-stone-800 rounded-xl text-xs space-y-1">
            <span className="text-stone-300 font-semibold flex items-center space-x-1.5">
              <ClipboardCheck className="w-4 h-4 text-amber-400" />
              <span>Petunjuk Distribusi & Penanganan:</span>
            </span>
            <p className="text-stone-300 leading-relaxed pl-5">
              {data.modelRecommendation}
            </p>
          </div>

          {/* Human-in-the-Loop Ground Truth Verification */}
          <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200">
                  Verifikasi Pakar Laboratorium (Ground Truth Label)
                </h4>
              </div>
              {isVerified && (
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700/50 rounded text-[10px] font-semibold">
                  Telah Diverifikasi
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400">
              Koreksi keputusan jika terdapat anomali fisik cangkang sebelum data diarsipkan ke basis data latih.
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
                      ? 'bg-stone-200 text-stone-950 border-white font-bold shadow-md'
                      : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200 hover:border-stone-700'
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>

            {/* Notes Field */}
            <div>
              <input
                type="text"
                value={expertNotes}
                onChange={(e) => setExpertNotes(e.target.value)}
                placeholder="Catatan inspektur / verifikator (misal: kantung udara agak miring, retak mikro ujung)"
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-stone-600"
              />
            </div>

            {/* Save Ground Truth Button */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-stone-400">
                {saveSuccess ? 'Label terverifikasi berhasil disimpan.' : 'Data ini berkontribusi langsung pada akurasi model.'}
              </span>
              <button
                type="button"
                onClick={handleSaveGroundTruth}
                className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold border border-stone-700 flex items-center space-x-1.5 transition-colors"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tersimpan</span>
                  </>
                ) : (
                  <span>Simpan Verifikasi</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3.5 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-medium transition-colors"
          >
            Selesai
          </button>
          <button
            onClick={onNextEgg}
            className="px-5 py-2 bg-stone-100 hover:bg-white text-stone-900 font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <span>Periksa Telur Selanjutnya</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
