import React from 'react';
import { SAMPLE_EGGS } from '../data/sampleEggs';
import { EggInspectionData } from '../types';
import { Sparkles, X, Check } from 'lucide-react';

interface SampleEggsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEgg: (egg: EggInspectionData) => void;
}

export const SampleEggsDrawer: React.FC<SampleEggsDrawerProps> = ({
  isOpen,
  onClose,
  onSelectEgg,
}) => {
  const [filterGrade, setFilterGrade] = React.useState<string>('all');

  if (!isOpen) return null;

  const filteredSamples = SAMPLE_EGGS.filter((s) => {
    if (filterGrade === 'all') return true;
    return s.grade === filterGrade;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Pilih Sampel Citra Candling Sinar Merah
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2.5 bg-zinc-950/60 border-b border-zinc-800 flex items-center space-x-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setFilterGrade('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
              filterGrade === 'all'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Semua ({SAMPLE_EGGS.length})
          </button>
          <button
            onClick={() => setFilterGrade('Grade A')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
              filterGrade === 'Grade A'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-emerald-400'
            }`}
          >
            Grade A
          </button>
          <button
            onClick={() => setFilterGrade('Grade B')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
              filterGrade === 'Grade B'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-zinc-400 hover:text-blue-400'
            }`}
          >
            Grade B
          </button>
          <button
            onClick={() => setFilterGrade('Grade C')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
              filterGrade === 'Grade C'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-zinc-400 hover:text-amber-400'
            }`}
          >
            Grade C
          </button>
          <button
            onClick={() => setFilterGrade('Grade D')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
              filterGrade === 'Grade D'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'text-zinc-400 hover:text-rose-400'
            }`}
          >
            Grade D (Reject)
          </button>
        </div>

        {/* List of presets */}
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Uji coba klasifikasi candling secara langsung:</span>
            <span className="text-[10px] text-zinc-500 font-mono">SNI 3926:2008 & Taksonomi 4-Grade</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredSamples.map((sample) => (
              <div
                key={sample.id}
                onClick={() => {
                  onSelectEgg(sample);
                  onClose();
                }}
                className="p-3 bg-zinc-950 border border-zinc-800/90 rounded-xl hover:border-zinc-700 cursor-pointer transition-all flex space-x-3 items-center group"
              >
                <div className="w-14 h-14 rounded-lg bg-black border border-zinc-700 overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={sample.imageUrl}
                    alt={sample.grade}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${
                      sample.grade === 'Grade A' ? 'text-emerald-400' :
                      sample.grade === 'Grade B' ? 'text-blue-400' :
                      sample.grade === 'Grade C' ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {sample.grade}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {sample.airCellDepthMm}mm
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 truncate mt-0.5 font-medium">
                    {sample.shellCondition}
                  </p>
                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                    {sample.defects.length > 0 ? sample.defects[0] : (sample.notes || 'Kondisi Prima')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80 text-[11px] text-zinc-400">
            <span className="text-rose-400 font-semibold">• Aturan Taksonomi:</span> Selain dari kriteria Grade A, B, dan C, seluruh telur dengan cacat cangkang, noda darah, atau kantung udara &gt;9.0mm dikategorikan sebagai <strong className="text-rose-300">Grade D (Afkir / Reject)</strong>.
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
