import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  CheckCircle2, 
  Download, 
  Trash2, 
  ShieldCheck, 
  Tag, 
  Layers, 
  Cpu, 
  Edit3, 
  Check, 
  ArrowDownToLine,
  FolderUp,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { EggInspectionData, EggGrade } from '../types';
import { DatasetFolderImportModal } from './DatasetFolderImportModal';

interface DatasetManagerProps {
  items: EggInspectionData[];
  onUpdateGroundTruth: (id: string, updatedGrade: EggGrade, notes: string) => void;
  onDeleteRecord: (id: string) => void;
  onExportDataset: () => void;
  onSelectEgg: (egg: EggInspectionData) => void;
  onImportUserDataset?: (eggs: EggInspectionData[]) => void;
  onOpenModelManager?: () => void;
}

export const DatasetManager: React.FC<DatasetManagerProps> = ({
  items,
  onUpdateGroundTruth,
  onDeleteRecord,
  onExportDataset,
  onSelectEgg,
  onImportUserDataset,
  onOpenModelManager,
}) => {
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterVerified, setFilterVerified] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempGrade, setTempGrade] = useState<EggGrade>('Grade A');
  const [tempNotes, setTempNotes] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importModalTab, setImportModalTab] = useState<'upload_folder' | 'gdrive_link' | 'grade_a_preset' | 'grade_b_preset' | 'grade_c_preset' | 'grade_d_preset'>('upload_folder');

  // Class distribution counts
  const countA = items.filter((i) => i.grade === 'Grade A').length;
  const countB = items.filter((i) => i.grade === 'Grade B').length;
  const countC = items.filter((i) => i.grade === 'Grade C').length;
  const countD = items.filter((i) => i.grade === 'Grade D').length;
  const verifiedCount = items.filter((i) => i.isGroundTruthVerified).length;

  // Filtered eggs
  const filtered = items.filter((item) => {
    if (filterGrade !== 'all' && item.grade !== filterGrade) return false;
    if (filterVerified === 'verified' && !item.isGroundTruthVerified) return false;
    if (filterVerified === 'unverified' && item.isGroundTruthVerified) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.id.toLowerCase().includes(q) ||
        item.grade.toLowerCase().includes(q) ||
        item.shellCondition.toLowerCase().includes(q) ||
        item.defects.some((d) => d.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleStartEdit = (egg: EggInspectionData) => {
    setEditingId(egg.id);
    setTempGrade(egg.grade);
    setTempNotes(egg.notes || '');
  };

  const handleSaveEdit = (id: string) => {
    onUpdateGroundTruth(id, tempGrade, tempNotes);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Retraining Readiness Banner */}
      <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Database className="w-4 h-4 text-rose-500" />
              <span>Katalog Data Latih Model (YOLOv8 & EfficientNet)</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Setiap telur yang dipindai otomatis masuk ke database ini untuk memperkuat akurasi model melalui retraining berkala.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-import-grade-a-preset"
              onClick={() => {
                setImportModalTab('grade_a_preset');
                setIsImportModalOpen(true);
              }}
              className="px-3 py-2 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 rounded-xl text-xs font-bold border border-emerald-500/30 transition-all flex items-center space-x-1.5"
              title="Muat 5 sampel foto Grade A candling sinar merah"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Preset Grade A (5)</span>
            </button>

            <button
              id="btn-import-grade-b-preset"
              onClick={() => {
                setImportModalTab('grade_b_preset');
                setIsImportModalOpen(true);
              }}
              className="px-3 py-2 bg-blue-950/40 hover:bg-blue-900/50 text-blue-300 rounded-xl text-xs font-bold border border-blue-500/30 transition-all flex items-center space-x-1.5"
              title="Muat 5 sampel foto Grade B candling sinar merah (IMG_0444, IMG_0496, IMG_0431, IMG_0438, IMG_0415)"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Preset Grade B (5)</span>
            </button>

            <button
              id="btn-import-grade-c-preset"
              onClick={() => {
                setImportModalTab('grade_c_preset');
                setIsImportModalOpen(true);
              }}
              className="px-3 py-2 bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 rounded-xl text-xs font-bold border border-amber-500/30 transition-all flex items-center space-x-1.5"
              title="Muat 5 sampel foto Grade C candling sinar merah (IMG_0567, IMG_0561, IMG_0590, IMG_0723, IMG_0738)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Preset Grade C (5)</span>
            </button>

            <button
              id="btn-import-grade-d-preset"
              onClick={() => {
                setImportModalTab('grade_d_preset');
                setIsImportModalOpen(true);
              }}
              className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 rounded-xl text-xs font-bold border border-rose-500/30 transition-all flex items-center space-x-1.5"
              title="Muat sampel Grade D (Reject/Afkir) - Sesuai aturan: selain Grade A, B, C adalah Grade D"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Preset Grade D (Reject)</span>
            </button>

            {onOpenModelManager && (
              <button
                id="btn-open-model-manager-dataset"
                onClick={onOpenModelManager}
                className="px-3.5 py-2 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 rounded-xl text-xs font-bold border border-purple-500/40 transition-all flex items-center space-x-1.5 shadow-sm"
                title="Kelola model buatan rekan/teman & model eksternal"
              >
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>Kelola Model AI Teman / Eksternal</span>
              </button>
            )}

            <button
              id="btn-import-dataset-folder"
              onClick={() => {
                setImportModalTab('upload_folder');
                setIsImportModalOpen(true);
              }}
              className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold border border-zinc-700 transition-all flex items-center space-x-2"
            >
              <FolderUp className="w-4 h-4 text-rose-400" />
              <span>Impor Folder GDrive / Lokal</span>
            </button>

            <button
              id="btn-download-yolo-package"
              onClick={onExportDataset}
              className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-950/40 transition-all flex items-center space-x-2"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>Ekspor Format YOLOv8 (.yaml & labels)</span>
            </button>
          </div>
        </div>

        {/* Retraining Readiness Meter */}
        <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-300 flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>Status Kesiapan Dataset Retraining:</span>
            </span>
            <span className="text-emerald-400 font-mono font-bold">
              {verifiedCount} dari {items.length} sampel tervalidasi ({items.length > 0 ? Math.round((verifiedCount / items.length) * 100) : 0}%)
            </span>
          </div>

          {/* Distribution balance for ML training */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="p-2 bg-zinc-900/90 rounded-lg border border-zinc-800 text-[11px]">
              <span className="text-zinc-400 block">Grade A (Prima - Class 0)</span>
              <span className="text-sm font-bold text-emerald-400">{countA} sampel</span>
            </div>
            <div className="p-2 bg-zinc-900/90 rounded-lg border border-zinc-800 text-[11px]">
              <span className="text-zinc-400 block">Grade B (Segar - Class 1)</span>
              <span className="text-sm font-bold text-blue-400">{countB} sampel</span>
            </div>
            <div className="p-2 bg-zinc-900/90 rounded-lg border border-zinc-800 text-[11px]">
              <span className="text-zinc-400 block">Grade C (Olahan - Class 2)</span>
              <span className="text-sm font-bold text-amber-400">{countC} sampel</span>
            </div>
            <div className="p-2 bg-zinc-900/90 rounded-lg border border-zinc-800 text-[11px]">
              <span className="text-zinc-400 block">Grade D (Reject - Class 3)</span>
              <span className="text-sm font-bold text-rose-400">{countD} sampel</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 pt-0.5 flex items-center space-x-1.5">
            <span className="text-rose-400 font-semibold">• Aturan Sistem:</span>
            <span>Semua telur selain kriteria Grade A, B, atau C (retak rambut, bintik darah, kantung udara &gt; 9.0mm) otomatis diklasifikasikan sebagai <strong className="text-rose-300">Grade D (Afkir / Reject)</strong>.</span>
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="search-dataset-input"
            type="text"
            placeholder="Cari berdasarkan ID telur, cacat, atau kondisi cangkang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
          />
        </div>

        {/* Grade Filter */}
        <select
          id="select-grade-filter"
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
          className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-zinc-700"
        >
          <option value="all">Semua Grade</option>
          <option value="Grade A">Grade A</option>
          <option value="Grade B">Grade B</option>
          <option value="Grade C">Grade C</option>
          <option value="Grade D">Grade D</option>
        </select>

        {/* Verification Filter */}
        <select
          id="select-verified-filter"
          value={filterVerified}
          onChange={(e) => setFilterVerified(e.target.value)}
          className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-zinc-700"
        >
          <option value="all">Semua Status Validasi</option>
          <option value="verified">Tervalidasi Pakar Saja</option>
          <option value="unverified">Perlu Verifikasi</option>
        </select>
      </div>

      {/* Dataset Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900/50 border border-zinc-800 rounded-2xl">
          <Database className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-zinc-300">Tidak ada data telur yang cocok</p>
          <p className="text-xs text-zinc-500 mt-1">Coba sesuaikan filter atau pindai telur baru melalui kamera.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((egg) => {
            const isEditing = editingId === egg.id;

            return (
              <div
                key={egg.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700/80 transition-all flex flex-col"
              >
                {/* Candling Photo & Quick Badges */}
                <div className="relative aspect-[4/3] bg-black overflow-hidden group">
                  <img
                    src={egg.imageUrl}
                    alt={egg.id}
                    className="w-full h-full object-contain cursor-pointer transition-transform group-hover:scale-105"
                    onClick={() => onSelectEgg(egg)}
                  />
                  <div className="absolute top-2 left-2 flex items-center space-x-1.5">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      egg.grade === 'Grade A' ? 'bg-emerald-500 text-zinc-950' :
                      egg.grade === 'Grade B' ? 'bg-blue-500 text-zinc-950' :
                      egg.grade === 'Grade C' ? 'bg-amber-500 text-zinc-950' :
                      'bg-rose-500 text-white'
                    }`}>
                      {egg.grade}
                    </span>
                    {egg.isGroundTruthVerified && (
                      <span className="px-1.5 py-0.5 bg-zinc-950/80 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-medium flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Valid</span>
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-zinc-950/80 rounded text-[10px] text-zinc-300 font-mono">
                    Air cell: {egg.airCellDepthMm}mm
                  </div>
                </div>

                {/* Info and Edit Box */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  {isEditing ? (
                    /* Inline Editing Mode */
                    <div className="space-y-2.5">
                      <label className="text-[11px] font-semibold text-zinc-400 block">Koreksi Grade:</label>
                      <select
                        value={tempGrade}
                        onChange={(e) => setTempGrade(e.target.value as EggGrade)}
                        className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white"
                      >
                        <option value="Grade A">Grade A</option>
                        <option value="Grade B">Grade B</option>
                        <option value="Grade C">Grade C</option>
                        <option value="Grade D">Grade D</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Catatan ground truth..."
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white"
                      />

                      <div className="flex justify-end space-x-2 pt-1">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 bg-zinc-800 text-zinc-300 rounded text-xs"
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => handleSaveEdit(egg.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center space-x-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Simpan</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Read Mode */
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-semibold text-white">{egg.id}</span>
                        <span className="text-zinc-500 text-[11px]">
                          {new Date(egg.timestamp).toLocaleDateString('id-ID')}
                        </span>
                      </div>

                      <div className="mt-2 text-xs text-zinc-400 space-y-1">
                        <div className="flex justify-between">
                          <span>Kondisi Cangkang:</span>
                          <span className={egg.shellCondition.includes('Retak') ? 'text-rose-400 font-semibold' : 'text-zinc-200'}>
                            {egg.shellCondition}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Kesegaran:</span>
                          <span className="text-zinc-200">{egg.freshnessScore}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bobot / Ukuran:</span>
                          <span className="text-zinc-200">{egg.estimatedWeightGram}g ({egg.size.split(' ')[0]})</span>
                        </div>
                      </div>

                      {egg.defects.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {egg.defects.map((d, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-rose-950/60 text-rose-300 border border-rose-800/40 rounded text-[10px]">
                              {d}
                            </span>
                          ))}
                        </div>
                      )}

                      {egg.notes && (
                        <p className="mt-2 text-[11px] text-zinc-400 italic bg-zinc-950/40 p-1.5 rounded border border-zinc-800/60">
                          "{egg.notes}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions footer */}
                  {!isEditing && (
                    <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                      <button
                        onClick={() => handleStartEdit(egg)}
                        className="text-xs text-zinc-400 hover:text-white flex items-center space-x-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Koreksi Label</span>
                      </button>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onSelectEgg(egg)}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-medium"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => onDeleteRecord(egg.id)}
                          className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                          title="Hapus dari data latih"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dataset Folder & File Import Modal */}
      <DatasetFolderImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportEggs={(eggs) => {
          if (onImportUserDataset) {
            onImportUserDataset(eggs);
          }
        }}
        defaultGrade="Grade A"
        initialTab={importModalTab}
      />
    </div>
  );
};
