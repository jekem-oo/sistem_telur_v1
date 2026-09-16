import React from 'react';
import { SAMPLE_EGGS } from '../data/sampleEggs';
import { EggInspectionData, EggGrade } from '../types';
import { Sparkles, X } from 'lucide-react';
import { GradeStampBadge } from './GradeStampBadge';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden text-stone-200">
        {/* Header */}
        <div className="p-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-100">
                Koleksi Sampel Citra Candling
              </h3>
              <p className="text-[11px] text-stone-400">
                Pilih sampel foto telur ovoskopi untuk pengujian instan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2.5 bg-stone-950/70 border-b border-stone-800 flex items-center space-x-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setFilterGrade('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              filterGrade === 'all'
                ? 'bg-stone-200 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Semua ({SAMPLE_EGGS.length})
          </button>
          {(['Grade A', 'Grade B', 'Grade C', 'Grade D'] as EggGrade[]).map((g) => (
            <button
              key={g}
              onClick={() => setFilterGrade(g)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterGrade === g
                  ? 'bg-stone-200 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* List of presets */}
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredSamples.map((sample) => (
              <div
                key={sample.id}
                onClick={() => {
                  onSelectEgg(sample);
                  onClose();
                }}
                className="p-3 bg-stone-950 border border-stone-800/90 rounded-xl hover:border-stone-700 cursor-pointer transition-all flex space-x-3 items-center group shadow-sm"
              >
                <div className="w-14 h-14 rounded-lg bg-black border border-stone-800 overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={sample.imageUrl}
                    alt={sample.grade}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <GradeStampBadge grade={sample.grade} size="sm" />
                    <span className="text-[10px] text-stone-400 font-mono">
                      {sample.airCellDepthMm}mm
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-300 truncate mt-1 font-medium">
                    {sample.shellCondition}
                  </p>
                  <p className="text-[10px] text-stone-400 truncate mt-0.5">
                    {sample.defects.length > 0 ? sample.defects[0] : (sample.notes || 'Kondisi Baik')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-[11px] text-stone-400 leading-relaxed">
            <span className="text-amber-400 font-semibold">• Kaidah SNI:</span> Telur dengan retak rambut tembus cahaya, blood spot, atau kantung udara &gt;9.0mm secara mutlak dimasukkan ke dalam <strong className="text-red-300">Grade D (Afkir)</strong>.
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-stone-950 border-t border-stone-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
