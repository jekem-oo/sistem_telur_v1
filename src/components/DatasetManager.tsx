import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Trash2, 
  ShieldCheck, 
  Cpu, 
  Edit3, 
  Check, 
  ArrowDownToLine,
  FolderUp,
  Sparkles,
  AlertTriangle,
  FileCheck2,
  X
} from 'lucide-react';
import { EggInspectionData, EggGrade } from '../types';
import { DatasetFolderImportModal } from './DatasetFolderImportModal';
import { GradeStampBadge } from './GradeStampBadge';

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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Control Area */}
      <div className="p-5 sm:p-6 bg-stone-900 border border-stone-800 rounded-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold text-stone-100 font-display">
                Katalog Citra Data Latih AI (Candling Dataset)
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-300 font-mono">
                {items.length} Sampel
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-1 max-w-2xl leading-relaxed">
              Arsip seluruh foto candling sinar merah dengan anotasi manual untuk melatih model YOLOv8 / EfficientNet lokal rekan atau diekspor ke format PyTorch.
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {onOpenModelManager && (
              <button
                id="btn-open-model-manager-dataset"
                onClick={onOpenModelManager}
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold border border-stone-700 transition-all flex items-center space-x-1.5 shadow-sm"
                title="Kelola model buatan rekan/teman & model eksternal"
              >
                <Cpu className="w-4 h-4 text-amber-400" />
                <span>Kelola Model Rekan</span>
              </button>
            )}

            <button
              id="btn-import-dataset-folder"
              onClick={() => {
                setImportModalTab('upload_folder');
                setIsImportModalOpen(true);
              }}
              className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold border border-stone-700 transition-all flex items-center space-x-2 shadow-sm"
            >
              <FolderUp className="w-4 h-4 text-stone-300" />
              <span>Impor Folder Citra</span>
            </button>

            <button
              id="btn-download-yolo-package"
              onClick={onExportDataset}
              className="px-4 py-2 bg-stone-100 hover:bg-white text-stone-900 rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-2"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>Ekspor Format YOLO (.yaml)</span>
            </button>
          </div>
        </div>

        {/* Dataset Quality & Balance Bar */}
        <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between text-xs gap-2">
            <span className="font-semibold text-stone-300 flex items-center space-x-1.5">
              <FileCheck2 className="w-4 h-4 text-stone-400" />
              <span>Keseimbangan Kelas Data Latih:</span>
            </span>
            <span className="text-emerald-400 font-mono font-medium">
              {verifiedCount} dari {items.length} sampel terverifikasi pakar ({items.length > 0 ? Math.round((verifiedCount / items.length) * 100) : 0}%)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 bg-stone-900 rounded-lg border border-stone-800 text-xs">
              <span className="text-stone-400 block text-[11px]">Grade A (Prima - Class 0)</span>
              <span className="text-base font-bold text-emerald-400 mt-0.5 block">{countA} sampel</span>
            </div>
            <div className="p-2.5 bg-stone-900 rounded-lg border border-stone-800 text-xs">
              <span className="text-stone-400 block text-[11px]">Grade B (Segar - Class 1)</span>
              <span className="text-base font-bold text-amber-400 mt-0.5 block">{countB} sampel</span>
            </div>
            <div className="p-2.5 bg-stone-900 rounded-lg border border-stone-800 text-xs">
              <span className="text-stone-400 block text-[11px]">Grade C (Olahan - Class 2)</span>
              <span className="text-base font-bold text-orange-400 mt-0.5 block">{countC} sampel</span>
            </div>
            <div className="p-2.5 bg-stone-900 rounded-lg border border-stone-800 text-xs">
              <span className="text-stone-400 block text-[11px]">Grade D (Afkir - Class 3)</span>
              <span className="text-base font-bold text-red-400 mt-0.5 block">{countD} sampel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID, kata kunci cacat, atau kondisi cangkang..."
            className="w-full pl-9 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-stone-700 transition-colors"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilterGrade('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterGrade === 'all'
                ? 'bg-stone-200 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-stone-200 bg-stone-950'
            }`}
          >
            Semua ({items.length})
          </button>
          {(['Grade A', 'Grade B', 'Grade C', 'Grade D'] as EggGrade[]).map((g) => (
            <button
              key={g}
              onClick={() => setFilterGrade(g)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterGrade === g
                  ? 'bg-stone-200 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-stone-200 bg-stone-950'
              }`}
            >
              {g}
            </button>
          ))}

          <div className="h-4 w-[1px] bg-stone-800 mx-1 hidden sm:block" />

          <button
            onClick={() => setFilterVerified(filterVerified === 'verified' ? 'all' : 'verified')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterVerified === 'verified'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                : 'text-stone-400 hover:text-stone-200 bg-stone-950'
            }`}
          >
            Telah Validasi ({verifiedCount})
          </button>
        </div>
      </div>

      {/* Dataset Grid Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((egg) => (
          <div
            key={egg.id}
            className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden hover:border-stone-700 transition-all flex flex-col group shadow-sm"
          >
            {/* Image Preview */}
            <div
              onClick={() => onSelectEgg(egg)}
              className="relative aspect-square bg-black cursor-pointer overflow-hidden flex items-center justify-center"
            >
              <img
                src={egg.imageUrl}
                alt={egg.id}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2.5 left-2.5">
                <GradeStampBadge grade={egg.grade} size="sm" />
              </div>
              <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-stone-950/85 rounded text-[10px] font-mono text-stone-300">
                {egg.airCellDepthMm}mm
              </div>
            </div>

            {/* Metadata and Controls */}
            <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-medium text-stone-200">{egg.id}</span>
                  <span className="text-stone-500 text-[10px] font-mono">
                    {new Date(egg.timestamp).toLocaleDateString('id-ID')}
                  </span>
                </div>

                <p className="text-xs text-stone-400 mt-1 line-clamp-1">
                  {egg.shellCondition} • {egg.size}
                </p>

                {egg.defects.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {egg.defects.map((d, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 bg-red-950/60 text-red-300 border border-red-900/50 rounded text-[10px]"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Edit Mode Inline */}
              {editingId === egg.id ? (
                <div className="pt-2 border-t border-stone-800 space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-1">
                    {(['Grade A', 'Grade B', 'Grade C', 'Grade D'] as EggGrade[]).map((g) => (
                      <button
                        key={g}
                        onClick={() => setTempGrade(g)}
                        className={`py-1 text-[11px] rounded border ${
                          tempGrade === g
                            ? 'bg-stone-200 text-stone-950 font-bold border-white'
                            : 'bg-stone-950 text-stone-400 border-stone-800'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={tempNotes}
                    onChange={(e) => setTempNotes(e.target.value)}
                    placeholder="Catatan verifikasi..."
                    className="w-full px-2 py-1 bg-stone-950 border border-stone-800 rounded text-[11px] text-stone-200"
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2 py-1 text-[11px] text-stone-400 hover:text-stone-200"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => handleSaveEdit(egg.id)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-medium flex items-center space-x-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Simpan</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-stone-500">
                    {egg.isGroundTruthVerified ? (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Valid</span>
                      </span>
                    ) : (
                      'Belum divalidasi'
                    )}
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleStartEdit(egg)}
                      className="p-1 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded"
                      title="Koreksi Label"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteRecord(egg.id)}
                      className="p-1 text-stone-500 hover:text-red-400 hover:bg-stone-800 rounded"
                      title="Hapus Sampel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center bg-stone-900 border border-stone-800 rounded-2xl text-stone-400 text-xs">
          Tidak ada sampel telur yang cocok dengan kriteria pencarian.
        </div>
      )}

      {/* Dataset Folder Import Modal */}
      <DatasetFolderImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportEggs={(newEggs) => {
          if (onImportUserDataset) onImportUserDataset(newEggs);
          setIsImportModalOpen(false);
        }}
        initialTab={importModalTab}
        defaultGrade="Grade A"
      />
    </div>
  );
};
