import React from 'react';
import { 
  BarChart3, 
  FileDown, 
  Database, 
  Cloud, 
  CheckCircle, 
  AlertOctagon, 
  FileText, 
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Scale,
  Sparkles
} from 'lucide-react';
import { EggInspectionData, InspectionStats } from '../types';
import { GradeStampBadge } from './GradeStampBadge';

interface DashboardViewProps {
  items: EggInspectionData[];
  stats: InspectionStats;
  onExportPDF: () => void;
  onExportCSV: () => void;
  onExportDataset: () => void;
  onTriggerCloudSync: () => void;
  onSelectEgg: (egg: EggInspectionData) => void;
  onSwitchTab: (tab: 'camera' | 'dataset' | 'cloud') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  items,
  stats,
  onExportPDF,
  onExportCSV,
  onExportDataset,
  onTriggerCloudSync,
  onSelectEgg,
  onSwitchTab,
}) => {
  const total = stats.totalInspected || 1;
  const gradeAPercent = Math.round((stats.gradeACount / total) * 100);
  const gradeBPercent = Math.round((stats.gradeBCount / total) * 100);
  const gradeCPercent = Math.round((stats.gradeCCount / total) * 100);
  const gradeDPercent = Math.round((stats.gradeDCount / total) * 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Action Toolbar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-stone-900 border border-stone-800 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-stone-100 font-display">
              Dasbor Mutu Telur Ovoskopi
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 border border-stone-700 text-amber-300 font-mono">
              Batch Harian
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Rekapitulasi pemeriksaan fisik sinar merah (640nm) berdasarkan SNI 3926:2008 & basis data pelatihan
          </p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-export-pdf-report"
            onClick={onExportPDF}
            className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700/90 text-stone-200 rounded-xl text-xs font-semibold border border-stone-700 transition-all flex items-center space-x-1.5 shadow-sm"
            title="Unduh Laporan Sertifikasi PDF Resmi"
          >
            <FileText className="w-3.5 h-3.5 text-stone-300" />
            <span>Laporan PDF</span>
          </button>

          <button
            id="btn-export-csv-data"
            onClick={onExportCSV}
            className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700/90 text-stone-200 rounded-xl text-xs font-semibold border border-stone-700 transition-all flex items-center space-x-1.5 shadow-sm"
            title="Ekspor Data Mentah CSV"
          >
            <FileDown className="w-3.5 h-3.5 text-stone-300" />
            <span>Ekspor CSV</span>
          </button>

          <button
            id="btn-export-yolo-dataset"
            onClick={onExportDataset}
            className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700/90 text-stone-200 rounded-xl text-xs font-semibold border border-stone-700 transition-all flex items-center space-x-1.5 shadow-sm"
            title="Download Paket Data Latih YOLO & EfficientNet"
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Paket Dataset Latih</span>
          </button>

          <button
            id="btn-sync-cloud-fast"
            onClick={onTriggerCloudSync}
            className="px-4 py-2 bg-stone-100 hover:bg-white text-stone-900 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
            title="Sinkronisasikan ke Penyimpanan Cloud"
          >
            <Cloud className="w-3.5 h-3.5 text-stone-900" />
            <span>Cadangkan Cloud</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards: Grade A, B, C, D */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Grade A */}
        <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1.5">
            <span className="font-semibold text-stone-300">Grade A (Prima)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-display text-emerald-400">
            {stats.gradeACount}
            <span className="text-xs font-normal text-stone-400 ml-1.5 font-sans">
              ({stats.totalInspected > 0 ? gradeAPercent : 0}%)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-stone-400">
            Kantung &le; 3.5mm • Sangat Segar
          </div>
        </div>

        {/* Grade B */}
        <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1.5">
            <span className="font-semibold text-stone-300">Grade B (Konsumsi)</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-display text-amber-400">
            {stats.gradeBCount}
            <span className="text-xs font-normal text-stone-400 ml-1.5 font-sans">
              ({stats.totalInspected > 0 ? gradeBPercent : 0}%)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-stone-400">
            Kantung 3.5–6mm • Meja Harian
          </div>
        </div>

        {/* Grade C */}
        <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1.5">
            <span className="font-semibold text-stone-300">Grade C (Olahan)</span>
            <span className="w-2 h-2 rounded-full bg-orange-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-display text-orange-400">
            {stats.gradeCCount}
            <span className="text-xs font-normal text-stone-400 ml-1.5 font-sans">
              ({stats.totalInspected > 0 ? gradeCPercent : 0}%)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-stone-400">
            Kantung 6–9mm • Industri Roti
          </div>
        </div>

        {/* Grade D */}
        <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1.5">
            <span className="font-semibold text-stone-300">Grade D (Afkir)</span>
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-display text-red-400">
            {stats.gradeDCount}
            <span className="text-xs font-normal text-stone-400 ml-1.5 font-sans">
              ({stats.totalInspected > 0 ? gradeDPercent : 0}%)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-stone-400">
            Retak mikro / Bintik darah / Rusak
          </div>
        </div>
      </div>

      {/* Visual Distribution Bar & Defect Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Grade Distribution Bar */}
        <div className="lg:col-span-2 p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300 font-mono">
              Distribusi Mutu Hasil Evaluasi (A – D)
            </h3>
            <span className="text-xs text-stone-400 font-mono">
              {stats.totalInspected} butir diperiksa
            </span>
          </div>

          {/* Segmented Progress Bar */}
          <div className="w-full h-3.5 bg-stone-950 rounded-full overflow-hidden flex border border-stone-800">
            {stats.gradeACount > 0 && (
              <div
                style={{ width: `${gradeAPercent}%` }}
                className="h-full bg-emerald-500 transition-all"
                title={`Grade A: ${gradeAPercent}%`}
              />
            )}
            {stats.gradeBCount > 0 && (
              <div
                style={{ width: `${gradeBPercent}%` }}
                className="h-full bg-amber-500 transition-all"
                title={`Grade B: ${gradeBPercent}%`}
              />
            )}
            {stats.gradeCCount > 0 && (
              <div
                style={{ width: `${gradeCPercent}%` }}
                className="h-full bg-orange-500 transition-all"
                title={`Grade C: ${gradeCPercent}%`}
              />
            )}
            {stats.gradeDCount > 0 && (
              <div
                style={{ width: `${gradeDPercent}%` }}
                className="h-full bg-red-600 transition-all"
                title={`Grade D (Afkir): ${gradeDPercent}%`}
              />
            )}
          </div>

          {/* Summary Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800/80">
              <span className="text-xs text-stone-400 block font-medium">Mutu I (Grade A)</span>
              <div className="text-base font-bold text-stone-100 mt-0.5">
                {stats.gradeACount} <span className="text-xs text-stone-400 font-normal">({gradeAPercent}%)</span>
              </div>
            </div>
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800/80">
              <span className="text-xs text-stone-400 block font-medium">Mutu II (Grade B)</span>
              <div className="text-base font-bold text-stone-100 mt-0.5">
                {stats.gradeBCount} <span className="text-xs text-stone-400 font-normal">({gradeBPercent}%)</span>
              </div>
            </div>
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800/80">
              <span className="text-xs text-stone-400 block font-medium">Mutu III (Grade C)</span>
              <div className="text-base font-bold text-stone-100 mt-0.5">
                {stats.gradeCCount} <span className="text-xs text-stone-400 font-normal">({gradeCPercent}%)</span>
              </div>
            </div>
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800/80">
              <span className="text-xs text-stone-400 block font-medium">Afkir (Grade D)</span>
              <div className="text-base font-bold text-red-300 mt-0.5">
                {stats.gradeDCount} <span className="text-xs text-stone-400 font-normal">({gradeDPercent}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Defect Summary Card */}
        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300 font-mono">
              Analisis Cacat Fisik
            </h3>
            <span className="text-xs font-bold text-red-400">
              {stats.defectiveCount} kasus
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-stone-950 rounded-xl border border-stone-800/80">
              <span className="text-stone-400">Retak Rambut (Hairline):</span>
              <span className="font-semibold text-stone-200">{stats.hairlineCrackCount} butir</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-stone-950 rounded-xl border border-stone-800/80">
              <span className="text-stone-400">Noda Darah (Blood Spot):</span>
              <span className="font-semibold text-stone-200">{stats.bloodSpotCount} butir</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-stone-950 rounded-xl border border-stone-800/80">
              <span className="text-stone-400">Rerata Kedalaman Kantung:</span>
              <span className="font-semibold text-amber-300 font-mono">{stats.avgAirCellDepthMm} mm</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-stone-950 rounded-xl border border-stone-800/80">
              <span className="text-stone-400">Tingkat Kelayakan Meja:</span>
              <span className="font-bold text-emerald-400">
                {Math.round(((stats.gradeACount + stats.gradeBCount) / total) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Inspection Feed Table */}
      <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300 font-mono">
              Catatan Pemeriksaan Terbaru
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Klik baris untuk membuka rincian evaluasi dan verifikasi ground truth
            </p>
          </div>
          <button
            onClick={() => onSwitchTab('dataset')}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center space-x-1"
          >
            <span>Buka Katalog Lengkap</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 font-medium font-mono">
                <th className="py-2.5 px-3">Sampel</th>
                <th className="py-2.5 px-3">Waktu</th>
                <th className="py-2.5 px-3">Keputusan Mutu</th>
                <th className="py-2.5 px-3">Kantung Udara</th>
                <th className="py-2.5 px-3">Cangkang</th>
                <th className="py-2.5 px-3">Mesin AI</th>
                <th className="py-2.5 px-3 text-right">Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {items.slice(0, 7).map((egg) => (
                <tr
                  key={egg.id}
                  onClick={() => onSelectEgg(egg)}
                  className="hover:bg-stone-800/50 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 flex items-center space-x-2.5">
                    <img
                      src={egg.imageUrl}
                      alt="Candling"
                      className="w-7 h-7 rounded-lg object-cover bg-black border border-stone-700"
                    />
                    <span className="font-mono text-stone-300 font-medium">{egg.id}</span>
                  </td>
                  <td className="py-2.5 px-3 text-stone-400 font-mono">
                    {new Date(egg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3">
                    <GradeStampBadge grade={egg.grade} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 font-mono text-stone-300">
                    {egg.airCellDepthMm} mm
                  </td>
                  <td className="py-2.5 px-3 text-stone-400">
                    {egg.shellCondition}
                  </td>
                  <td className="py-2.5 px-3 text-stone-400 font-mono text-[11px]">
                    {egg.inferenceEngine}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {egg.isGroundTruthVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Valid</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-stone-400">Auto-AI</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
