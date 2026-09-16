import React from 'react';
import { 
  BarChart3, 
  FileDown, 
  Database, 
  Cloud, 
  CheckCircle, 
  AlertOctagon, 
  Calendar, 
  FileText, 
  ShieldAlert, 
  Zap, 
  ArrowUpRight, 
  Filter 
} from 'lucide-react';
import { EggInspectionData, InspectionStats } from '../types';

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
    <div className="space-y-6">
      {/* Action Toolbar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-rose-500" />
            <span>Dasbor Pemantauan Statistik Kualitas Telur (Grade A - D)</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Evaluasi real-time berbasis candling sinar merah (630-660nm) & model klasifikasi deep learning
          </p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-export-pdf-report"
            onClick={onExportPDF}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg text-xs font-semibold border border-zinc-700 transition-all flex items-center space-x-1.5 shadow-sm"
            title="Unduh Laporan Sertifikasi PDF Resmi"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span>Laporan PDF</span>
          </button>

          <button
            id="btn-export-csv-data"
            onClick={onExportCSV}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg text-xs font-semibold border border-zinc-700 transition-all flex items-center space-x-1.5 shadow-sm"
            title="Ekspor Data Mentah CSV"
          >
            <FileDown className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ekspor CSV</span>
          </button>

          <button
            id="btn-export-yolo-dataset"
            onClick={onExportDataset}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg text-xs font-semibold border border-zinc-700 transition-all flex items-center space-x-1.5 shadow-sm"
            title="Download Paket Data Latih YOLO & EfficientNet"
          >
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Dataset YOLO</span>
          </button>

          <button
            id="btn-sync-cloud-fast"
            onClick={onTriggerCloudSync}
            className="px-3 py-1.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-rose-950/30 transition-all flex items-center space-x-1.5"
            title="Sinkronisasikan ke Penyimpanan Cloud"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Sync Cloud</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards: Grade A, B, C, D */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Grade A (Prima) */}
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Grade A (Prima)</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {stats.gradeACount}
            <span className="text-xs font-normal text-zinc-500 ml-1">
              ({stats.totalInspected > 0 ? gradeAPercent : 0}%)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-400 flex items-center space-x-1">
            <span>Kantung &lt; 3.5mm • Sangat segar</span>
          </div>
        </div>

        {/* Grade B (Segar) */}
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Grade B (Segar Konsumsi)</span>
            <span className="w-2 h-2 rounded-full bg-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400">
            {stats.gradeBCount}
            <span className="text-xs font-normal text-zinc-500 ml-1">
              ({stats.totalInspected > 0 ? gradeBPercent : 0}%)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-400">
            Kantung 3.5 - 6.0mm • Retail harian
          </div>
        </div>

        {/* Grade C (Olahan/Bakery) */}
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Grade C (Olahan/Bakery)</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            {stats.gradeCCount}
            <span className="text-xs font-normal text-zinc-500 ml-1">
              ({stats.totalInspected > 0 ? gradeCPercent : 0}%)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-400">
            Kantung 6.0 - 9.0mm • Industri olahan
          </div>
        </div>

        {/* Grade D (Reject) */}
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Grade D (REJECT)</span>
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">
            {stats.gradeDCount}
            <span className="text-xs font-normal text-zinc-500 ml-1">
              ({stats.totalInspected > 0 ? gradeDPercent : 0}%)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-rose-400/90 font-medium">
            Retak rambut / Bintik darah / Rusak
          </div>
        </div>
      </div>

      {/* Visual Distribution Bar & Defect Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Grade Distribution Bar */}
        <div className="lg:col-span-2 p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Distribusi Klasifikasi Grade Mutu (A - D)
            </h3>
            <span className="text-xs text-zinc-500 font-mono">
              Total {stats.totalInspected} butir diperiksa
            </span>
          </div>

          {/* Segmented Progress Bar */}
          <div className="w-full h-4 bg-zinc-950 rounded-full overflow-hidden flex p-0.5 border border-zinc-800">
            {stats.gradeACount > 0 && (
              <div
                style={{ width: `${gradeAPercent}%` }}
                className="h-full bg-emerald-500 transition-all rounded-l-full"
                title={`Grade A: ${gradeAPercent}%`}
              />
            )}
            {stats.gradeBCount > 0 && (
              <div
                style={{ width: `${gradeBPercent}%` }}
                className="h-full bg-blue-500 transition-all"
                title={`Grade B: ${gradeBPercent}%`}
              />
            )}
            {stats.gradeCCount > 0 && (
              <div
                style={{ width: `${gradeCPercent}%` }}
                className="h-full bg-amber-500 transition-all"
                title={`Grade C: ${gradeCPercent}%`}
              />
            )}
            {stats.gradeDCount > 0 && (
              <div
                style={{ width: `${gradeDPercent}%` }}
                className="h-full bg-rose-500 transition-all rounded-r-full"
                title={`Grade D (Reject): ${gradeDPercent}%`}
              />
            )}
          </div>

          {/* Legend Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-2.5 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
              <div className="flex items-center space-x-1.5 text-xs text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Grade A</span>
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {stats.gradeACount} <span className="text-xs text-zinc-500 font-normal">({gradeAPercent}%)</span>
              </div>
            </div>

            <div className="p-2.5 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
              <div className="flex items-center space-x-1.5 text-xs text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Grade B</span>
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {stats.gradeBCount} <span className="text-xs text-zinc-500 font-normal">({gradeBPercent}%)</span>
              </div>
            </div>

            <div className="p-2.5 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
              <div className="flex items-center space-x-1.5 text-xs text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Grade C</span>
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {stats.gradeCCount} <span className="text-xs text-zinc-500 font-normal">({gradeCPercent}%)</span>
              </div>
            </div>

            <div className="p-2.5 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
              <div className="flex items-center space-x-1.5 text-xs text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Grade D</span>
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {stats.gradeDCount} <span className="text-xs text-zinc-500 font-normal">({gradeDPercent}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Defect Breakdown Card */}
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Deteksi Defect Candling</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-zinc-950/70 rounded-xl border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="text-zinc-300">Retak Rambut (Hairline crack)</span>
              </div>
              <span className="font-bold text-white">{stats.hairlineCrackCount}</span>
            </div>

            <div className="p-2.5 bg-zinc-950/70 rounded-xl border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                <span className="text-zinc-300">Bintik Darah (Blood spot)</span>
              </div>
              <span className="font-bold text-white">{stats.bloodSpotCount}</span>
            </div>

            <div className="p-2.5 bg-zinc-950/70 rounded-xl border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-zinc-300">Kantung Udara Melebihi Batas</span>
              </div>
              <span className="font-bold text-white">{stats.largeAirCellCount}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onSwitchTab('dataset')}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-medium border border-zinc-700 transition-colors flex items-center justify-center space-x-1"
            >
              <span>Buka Katalog Data Latih AI</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Inspection Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-white">
              Riwayat Hasil Inspeksi Terkini
            </h3>
            <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full text-xs font-mono">
              {items.length} tersimpan
            </span>
          </div>
          <button
            onClick={() => onSwitchTab('dataset')}
            className="text-xs text-rose-400 hover:text-rose-300 font-medium"
          >
            Kelola Semua Data →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Citra Candling</th>
                <th className="py-3 px-4">ID & Waktu</th>
                <th className="py-3 px-4">Grade Hasil</th>
                <th className="py-3 px-4">Kantung Udara</th>
                <th className="py-3 px-4">Cangkang</th>
                <th className="py-3 px-4">Bobot</th>
                <th className="py-3 px-4">Data Latih</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {items.slice(0, 8).map((egg) => (
                <tr key={egg.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-2.5 px-4">
                    <div className="w-10 h-10 rounded-lg bg-black border border-zinc-700 overflow-hidden flex items-center justify-center">
                      <img src={egg.imageUrl} alt={egg.id} className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="py-2.5 px-4 font-mono">
                    <div className="font-semibold text-white">{egg.id}</div>
                    <div className="text-[10px] text-zinc-500">
                      {new Date(egg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold inline-block ${
                      egg.grade === 'Grade AA' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                      egg.grade === 'Grade A' ? 'bg-green-500/15 text-green-400 border border-green-500/30' :
                      egg.grade === 'Grade B' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                      'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}>
                      {egg.grade}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-zinc-300">
                    {egg.airCellDepthMm} mm
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={`text-xs ${egg.shellCondition.includes('Retak') ? 'text-rose-400 font-semibold' : 'text-zinc-300'}`}>
                      {egg.shellCondition}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-zinc-300">
                    {egg.estimatedWeightGram}g
                  </td>
                  <td className="py-2.5 px-4">
                    {egg.isGroundTruthVerified ? (
                      <span className="inline-flex items-center text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                        Tervalidasi
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                        AI Prediksi
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <button
                      onClick={() => onSelectEgg(egg)}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs font-medium transition-colors"
                    >
                      Detail
                    </button>
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
