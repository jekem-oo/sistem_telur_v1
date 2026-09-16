import React from 'react';
import { EggGrade } from '../types';
import { CheckCircle2, ShieldCheck, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

interface GradeStampBadgeProps {
  grade: EggGrade;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const GradeStampBadge: React.FC<GradeStampBadgeProps> = ({
  grade,
  size = 'md',
  showDetails = false,
}) => {
  const getBadgeStyle = () => {
    switch (grade) {
      case 'Grade A':
        return {
          wrapper: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300',
          seal: 'bg-emerald-600 text-white',
          label: 'MUTU I (GRADE A)',
          sub: 'Prima • Segar Maksimal',
          icon: ShieldCheck,
        };
      case 'Grade B':
        return {
          wrapper: 'bg-amber-950/30 border-amber-500/40 text-amber-300',
          seal: 'bg-amber-600 text-white',
          label: 'MUTU II (GRADE B)',
          sub: 'Standar Konsumsi Meja',
          icon: CheckCircle2,
        };
      case 'Grade C':
        return {
          wrapper: 'bg-orange-950/30 border-orange-500/40 text-orange-300',
          seal: 'bg-orange-700 text-white',
          label: 'MUTU III (GRADE C)',
          sub: 'Olahan & Industri Bakery',
          icon: AlertTriangle,
        };
      case 'Grade D':
      default:
        return {
          wrapper: 'bg-red-950/40 border-red-500/40 text-red-300',
          seal: 'bg-red-700 text-white',
          label: 'AFKIR (GRADE D)',
          sub: 'Reject • Cacat / Retak',
          icon: AlertOctagon,
        };
    }
  };

  const style = getBadgeStyle();
  const Icon = style.icon;

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-medium text-xs ${style.wrapper}`}>
        <Icon className="w-3.5 h-3.5" />
        <span className="font-semibold">{grade}</span>
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${style.wrapper}`}>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-black text-lg shadow-inner ${style.seal}`}>
          {grade.replace('Grade ', '')}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide text-white">{style.label}</span>
          </div>
          <p className="text-xs text-stone-300 mt-0.5">{style.sub}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${style.wrapper}`}>
      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${style.seal}`}>
        {grade.replace('Grade ', '')}
      </span>
      <span className="font-medium">{grade}</span>
      {showDetails && <span className="text-stone-400 text-[11px]">• {style.sub}</span>}
    </div>
  );
};
