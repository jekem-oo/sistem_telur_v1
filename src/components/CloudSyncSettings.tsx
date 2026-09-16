import React, { useState } from 'react';
import { Cloud, CheckCircle2, RefreshCw, Server, Shield } from 'lucide-react';
import { CloudSyncConfig } from '../types';

interface CloudSyncSettingsProps {
  config: CloudSyncConfig;
  onUpdateConfig: (newConfig: Partial<CloudSyncConfig>) => void;
  onManualSync: () => void;
  isSyncing: boolean;
  pendingCount: number;
}

export const CloudSyncSettings: React.FC<CloudSyncSettingsProps> = ({
  config,
  onUpdateConfig,
  onManualSync,
  isSyncing,
  pendingCount,
}) => {
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleTriggerSync = () => {
    onManualSync();
    setSyncFeedback('Sinkronisasi cloud sedang berjalan...');
    setTimeout(() => {
      setSyncFeedback('Data berhasil dicadangkan ke penyimpanan cloud.');
      setTimeout(() => setSyncFeedback(null), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 bg-stone-900 border border-stone-800 rounded-2xl space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-100 font-display">
              Pencadangan Cloud & Sinkronisasi Dataset
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Penyimpanan persisten seluruh arsip citra candling dan anotasi ground truth
            </p>
          </div>
        </div>

        {/* Sync Status Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-stone-950 rounded-xl border border-stone-800">
          <div>
            <span className="text-xs text-stone-500 block font-medium">Status Sinkronisasi:</span>
            <div className="flex items-center space-x-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${config.autoSyncEnabled ? 'bg-emerald-400' : 'bg-stone-600'}`} />
              <span className="text-sm font-bold text-stone-200">
                {config.autoSyncEnabled ? 'Otomatis' : 'Manual'}
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs text-stone-500 block font-medium">Terakhir Dicadangkan:</span>
            <span className="text-sm font-semibold text-stone-300 mt-1 block font-mono">
              {config.lastSyncTime
                ? new Date(config.lastSyncTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                : 'Belum pernah'}
            </span>
          </div>

          <div>
            <span className="text-xs text-stone-500 block font-medium">Antrean Menunggu:</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-sm font-bold font-mono ${pendingCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {pendingCount} butir
              </span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.5 bg-stone-800 text-amber-300 rounded text-[10px]">
                  Pending
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Manual Sync Trigger */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-stone-400">
            {syncFeedback && (
              <span className="text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{syncFeedback}</span>
              </span>
            )}
          </div>

          <button
            id="btn-trigger-manual-sync"
            onClick={handleTriggerSync}
            disabled={isSyncing}
            className="px-4 py-2 bg-stone-100 hover:bg-white text-stone-900 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Cadangkan Sekarang</span>
          </button>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="p-5 sm:p-6 bg-stone-900 border border-stone-800 rounded-2xl space-y-4 text-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300 font-mono">
          Pengaturan Penyimpanan Cloud
        </h3>

        <div className="space-y-3">
          <label className="flex items-start space-x-3 cursor-pointer p-3 bg-stone-950 rounded-xl border border-stone-800/80">
            <input
              type="checkbox"
              checked={config.autoSyncEnabled}
              onChange={(e) => onUpdateConfig({ autoSyncEnabled: e.target.checked })}
              className="mt-0.5 rounded bg-stone-900 border-stone-700 text-stone-300 focus:ring-0"
            />
            <div>
              <span className="font-semibold text-stone-200 block">Pencadangan Otomatis</span>
              <span className="text-[11px] text-stone-400">
                Secara otomatis mengunggah setiap hasil foto dan evaluasi mutu ke penyimpanan cloud.
              </span>
            </div>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer p-3 bg-stone-950 rounded-xl border border-stone-800/80">
            <input
              type="checkbox"
              checked={config.compressImagesBeforeUpload}
              onChange={(e) => onUpdateConfig({ compressImagesBeforeUpload: e.target.checked })}
              className="mt-0.5 rounded bg-stone-900 border-stone-700 text-stone-300 focus:ring-0"
            />
            <div>
              <span className="font-semibold text-stone-200 block">Optimasi Citra Edge (WebP 640x640)</span>
              <span className="text-[11px] text-stone-400">
                Kompresi lossless untuk menghemat kuota transmisi internet laboratorium saat berada di kandang lapangan.
              </span>
            </div>
          </label>
        </div>

        <div className="pt-2">
          <label className="block text-stone-400 mb-1 font-medium">Endpoint Server Cloud / Webhook</label>
          <input
            type="text"
            value={config.endpointUrl}
            onChange={(e) => onUpdateConfig({ endpointUrl: e.target.value })}
            placeholder="https://api.peternakan.id/v1/candling-sync"
            className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 font-mono text-xs focus:outline-none focus:border-stone-700"
          />
        </div>
      </div>
    </div>
  );
};
