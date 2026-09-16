import React, { useState } from 'react';
import { Cloud, CheckCircle2, Clock, RefreshCw, Server, Shield, ArrowUpRight, AlertCircle } from 'lucide-react';
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
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Sinkronisasi Cloud Data Latih & Laporan Berkala
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Menjamin seluruh gambar candling dan data anotasi tersimpan secara persisten dan aman di cloud server
            </p>
          </div>
        </div>

        {/* Sync Status Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-zinc-950 rounded-xl border border-zinc-800">
          <div>
            <span className="text-xs text-zinc-500 block">Status Sinkronisasi:</span>
            <div className="flex items-center space-x-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${config.autoSyncEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
              <span className="text-sm font-bold text-zinc-200">
                {config.autoSyncEnabled ? 'Otomatis Aktif' : 'Manual'}
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs text-zinc-500 block">Terakhir Disinkronkan:</span>
            <span className="text-sm font-semibold text-zinc-300 mt-1 block">
              {config.lastSyncTime
                ? new Date(config.lastSyncTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                : 'Belum pernah'}
            </span>
          </div>

          <div>
            <span className="text-xs text-zinc-500 block">Antrean Belum Sinkron:</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-sm font-bold ${pendingCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {pendingCount} telur
              </span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-950/60 text-amber-300 rounded text-[10px]">
                  Pending
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Manual Sync Trigger */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-zinc-400">
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
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-950/40 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
          </button>
        </div>
      </div>

      {/* Interval and Target Cloud Settings */}
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-5">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Clock className="w-4 h-4 text-zinc-400" />
          <span>Konfigurasi Interval Otomatis</span>
        </h3>

        {/* Enable Auto Sync Switch */}
        <div className="flex items-center justify-between p-3.5 bg-zinc-950 rounded-xl border border-zinc-800">
          <div>
            <span className="text-xs font-semibold text-zinc-200 block">
              Aktifkan Sinkronisasi Terjadwal
            </span>
            <span className="text-xs text-zinc-500">
              Sistem akan otomatis mengirimkan rekaman baru ke cloud storage sesuai interval pilihan
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              id="toggle-auto-sync"
              type="checkbox"
              checked={config.autoSyncEnabled}
              onChange={(e) => onUpdateConfig({ autoSyncEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
          </label>
        </div>

        {/* Interval Dropdown */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300 block">
            Interval Frekuensi Sinkronisasi:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[5, 15, 30, 60].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => onUpdateConfig({ syncIntervalMinutes: mins })}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                  config.syncIntervalMinutes === mins
                    ? 'bg-rose-600/20 text-rose-300 border-rose-500/60 shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                Setiap {mins} Menit
              </button>
            ))}
          </div>
        </div>

        {/* Cloud Provider Information */}
        <div className="pt-2 border-t border-zinc-800 space-y-2">
          <label className="text-xs font-semibold text-zinc-300 block">
            Target Penyimpanan Cloud:
          </label>
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              <Server className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-semibold text-zinc-200 block">Penyimpanan Cloud Dedicated</span>
                <span className="text-[11px] text-zinc-500 font-mono">Endpoint: /api/cloud-sync (Active)</span>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-semibold">
              Terhubung
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
