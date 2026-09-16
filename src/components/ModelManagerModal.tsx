import React, { useState } from 'react';
import { 
  Cpu, 
  Plus, 
  Check, 
  Trash2, 
  Upload, 
  Globe, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  Sliders, 
  CheckCircle2, 
  ExternalLink,
  Activity,
  Server,
  Zap,
  RotateCcw,
  FileCode,
  X
} from 'lucide-react';
import { CustomModelDefinition, EnsembleSettings, EggGrade } from '../types';

interface ModelManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  models: CustomModelDefinition[];
  activeModelId: string;
  onSelectActiveModel: (id: string) => void;
  onToggleModelActive: (id: string, active: boolean) => void;
  onAddNewModel: (model: CustomModelDefinition) => void;
  onDeleteModel: (id: string) => void;
  ensembleSettings: EnsembleSettings;
  onUpdateEnsembleSettings: (settings: EnsembleSettings) => void;
}

export const ModelManagerModal: React.FC<ModelManagerModalProps> = ({
  isOpen,
  onClose,
  models,
  activeModelId,
  onSelectActiveModel,
  onToggleModelActive,
  onAddNewModel,
  onDeleteModel,
  ensembleSettings,
  onUpdateEnsembleSettings,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'list' | 'add_external' | 'upload_weights' | 'ensemble'>('list');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Form states for adding a new model
  const [formName, setFormName] = useState('');
  const [formAuthor, setFormAuthor] = useState('Teman Peneliti / Rekan Tim');
  const [formVersion, setFormVersion] = useState('v1.0-custom');
  const [formType, setFormType] = useState<CustomModelDefinition['type']>('external_api');
  const [formEndpoint, setFormEndpoint] = useState('http://localhost:8000/predict');
  const [formAuthHeader, setFormAuthHeader] = useState('');
  const [formDescription, setFormDescription] = useState('Model deteksi cacat telur ovoskopi terlatih pada citra senter merah.');
  const [formAccuracy, setFormAccuracy] = useState<number>(96.5);
  const [formWeight, setFormWeight] = useState<number>(4);
  const [formUploadedFileName, setFormUploadedFileName] = useState<string | null>(null);
  const [formWeightSizeMb, setFormWeightSizeMb] = useState<number>(18.5);

  const handleTestConnection = async () => {
    if (!formEndpoint) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/models/test-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpointUrl: formEndpoint,
          apiAuthHeader: formAuthHeader,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true, message: data.message });
      } else {
        setTestResult({
          success: false,
          message: `${data.error || 'Koneksi gagal'} (Status server dicek)`,
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: 'Tidak dapat menjangkau endpoint. Pastikan server lokal rekan aktif.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormUploadedFileName(file.name);
      setFormWeightSizeMb(parseFloat((file.size / (1024 * 1024)).toFixed(1)));
      if (!formName) {
        setFormName(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmitNewModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const newId = `model-${Date.now()}`;
    const newModel: CustomModelDefinition = {
      id: newId,
      name: formName.trim(),
      version: formVersion.trim() || 'v1.0',
      type: formType,
      description: formDescription.trim(),
      author: formAuthor.trim() || 'Rekan Peneliti',
      accuracyScore: formAccuracy || 95.0,
      isActive: true,
      isBuiltIn: false,
      createdAt: Date.now(),
      lastTrainedDate: new Date().toISOString().slice(0, 10),
      endpointUrl: formType === 'external_api' ? formEndpoint : undefined,
      apiAuthHeader: formAuthHeader ? formAuthHeader : undefined,
      modelWeightFileUrl: formUploadedFileName ? `/uploads/${formUploadedFileName}` : undefined,
      weightSizeMb: formWeightSizeMb,
      classesSupported: ['Grade A', 'Grade B', 'Grade C', 'Grade D'],
      inputResolution: '640x640',
      votingWeight: formWeight,
      notes: 'Model kustom yang ditambahkan untuk meningkatkan akurasi sistem.',
    };

    onAddNewModel(newModel);
    onSelectActiveModel(newId);
    setActiveTab('list');
    setTestResult(null);

    setFormName('');
    setFormUploadedFileName(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden my-4 sm:my-8 text-stone-200">
        
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-stone-800 bg-stone-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-stone-100 font-display">
                  Manajemen Model & Bobot Inferensi
                </h2>
                <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 text-[10px] font-mono border border-stone-700">
                  {models.length} Terdaftar
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Integrasikan model buatan rekan (YOLO / API / Weights) untuk memperkuat akurasi klasifikasi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-800 bg-stone-950/50 px-5 sm:px-6 pt-2 gap-2 text-xs overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'list'
                ? 'border-stone-200 text-stone-100'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Katalog Model ({models.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('add_external');
              setFormType('external_api');
            }}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'add_external'
                ? 'border-stone-200 text-stone-100'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>+ Sambung API Rekan</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('upload_weights');
              setFormType('custom_weights');
            }}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'upload_weights'
                ? 'border-stone-200 text-stone-100'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>+ Daftarkan Berkas Bobot (.pt/.tflite)</span>
          </button>
          <button
            onClick={() => setActiveTab('ensemble')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'ensemble'
                ? 'border-stone-200 text-stone-100'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Mode Konsensus (Voting)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[68vh] overflow-y-auto space-y-4">
          {/* TAB 1: LIST */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl flex items-center justify-between text-xs text-stone-300">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>
                    Model aktif:{' '}
                    <strong className="text-stone-100 font-semibold">
                      {models.find((m) => m.id === activeModelId)?.name || 'Default'}
                    </strong>
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 font-mono">
                  {ensembleSettings.mode === 'ensemble_consensus' ? 'Mode Voting Gabungan' : 'Model Tunggal'}
                </div>
              </div>

              <div className="space-y-3">
                {models.map((model) => {
                  const isCurrent = model.id === activeModelId;
                  return (
                    <div
                      key={model.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-stone-950 border-stone-600 shadow-md'
                          : 'bg-stone-950/60 border-stone-800/80 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-stone-100">{model.name}</span>
                            <span className="px-2 py-0.5 bg-stone-800 text-stone-300 rounded text-[10px] font-mono border border-stone-700">
                              {model.version}
                            </span>
                            {model.isBuiltIn && (
                              <span className="px-2 py-0.5 bg-stone-800 text-amber-300 rounded text-[10px] font-medium">
                                Inti Sistem
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-400 leading-relaxed max-w-xl">
                            {model.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-400 font-mono pt-1">
                            <span>Arsitektur: {model.type === 'external_api' ? 'REST API Server' : model.type === 'custom_weights' ? 'Weights Lokal' : 'Cloud Vision'}</span>
                            <span>Akurasi Latih: {model.accuracyScore}%</span>
                            <span>Bobot Suara: x{model.votingWeight}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 shrink-0">
                          {isCurrent ? (
                            <span className="px-3 py-1.5 bg-emerald-950 text-emerald-300 border border-emerald-700/50 rounded-lg text-xs font-semibold flex items-center space-x-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>Sedang Aktif</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => onSelectActiveModel(model.id)}
                              className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold border border-stone-700 transition-colors"
                            >
                              Gunakan Model Ini
                            </button>
                          )}

                          {!model.isBuiltIn && (
                            <button
                              onClick={() => onDeleteModel(model.id)}
                              className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-stone-800 rounded-lg transition-colors"
                              title="Hapus Model"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: ADD EXTERNAL REST API */}
          {activeTab === 'add_external' && (
            <form onSubmit={handleSubmitNewModel} className="space-y-4 text-xs">
              <div className="p-3.5 bg-stone-950 border border-stone-800 rounded-xl space-y-1">
                <span className="font-semibold text-stone-200 block text-xs">Petunjuk Sambungan API Rekan:</span>
                <p className="text-stone-400 leading-relaxed text-[11px]">
                  Temanmu yang menjalankan script Python (FastAPI / Flask / Ultralytics) di laptopnya dapat langsung dihubungkan. Endpoint menerima POST citra base64 dan mengembalikan JSON prediksi Grade A-D.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1 font-medium">Nama Model</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: YOLOv10-EggCandler-Rekan"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 placeholder-stone-600 focus:outline-none focus:border-stone-700"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1 font-medium">Versi / Tag</label>
                  <input
                    type="text"
                    value={formVersion}
                    onChange={(e) => setFormVersion(e.target.value)}
                    placeholder="v1.2-epoch50"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 placeholder-stone-600 focus:outline-none focus:border-stone-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-medium">URL Endpoint Inferensi</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={formEndpoint}
                    onChange={(e) => setFormEndpoint(e.target.value)}
                    placeholder="http://192.168.1.15:8000/predict"
                    className="flex-1 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 placeholder-stone-600 font-mono text-xs focus:outline-none focus:border-stone-700"
                  />
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting || !formEndpoint}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl font-semibold transition-colors disabled:opacity-50"
                  >
                    {isTesting ? 'Menguji...' : 'Tes Koneksi'}
                  </button>
                </div>
              </div>

              {testResult && (
                <div className={`p-3 rounded-xl border text-xs ${testResult.success ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-red-950/40 border-red-800 text-red-300'}`}>
                  {testResult.message}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1 font-medium">Peneliti / Pemilik Model</label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="Nama temanmu"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 placeholder-stone-600 focus:outline-none focus:border-stone-700"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1 font-medium">Bobot Voting Konsensus</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formWeight}
                    onChange={(e) => setFormWeight(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 focus:outline-none focus:border-stone-700"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-100 hover:bg-white text-stone-900 font-bold rounded-xl shadow-sm transition-all"
                >
                  Simpan & Aktifkan Model
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: UPLOAD WEIGHTS */}
          {activeTab === 'upload_weights' && (
            <form onSubmit={handleSubmitNewModel} className="space-y-4 text-xs">
              <div className="p-3.5 bg-stone-950 border border-stone-800 rounded-xl space-y-1">
                <span className="font-semibold text-stone-200 block">Dukungan Format Bobot Model:</span>
                <p className="text-stone-400 leading-relaxed text-[11px]">
                  Mendukung berkas checkpoint PyTorch (.pt), ONNX (.onnx), TensorFlow Lite (.tflite), atau Keras (.h5) yang siap dijalankan pada edge candling system.
                </p>
              </div>

              <div className="p-6 bg-stone-950 border-2 border-dashed border-stone-800 hover:border-stone-700 rounded-2xl text-center space-y-2 cursor-pointer relative">
                <input
                  type="file"
                  accept=".pt,.onnx,.tflite,.h5,.bin"
                  onChange={handleFileDrop}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="w-12 h-12 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto text-stone-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-stone-200 font-semibold">
                    {formUploadedFileName || 'Tarik berkas bobot model kemari atau klik untuk memilih'}
                  </p>
                  <p className="text-stone-500 text-[11px] mt-0.5">
                    {formUploadedFileName ? `Ukuran: ${formWeightSizeMb} MB` : 'Format didukung: .pt, .onnx, .tflite, .h5 (Maks 150 MB)'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1 font-medium">Nama Model</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Nama model"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 placeholder-stone-600 focus:outline-none focus:border-stone-700"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1 font-medium">Estimasi Akurasi (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formAccuracy}
                    onChange={(e) => setFormAccuracy(parseFloat(e.target.value) || 90)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 focus:outline-none focus:border-stone-700"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!formUploadedFileName && !formName}
                  className="px-5 py-2 bg-stone-100 hover:bg-white text-stone-900 font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
                >
                  Daftarkan Bobot Model
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: ENSEMBLE */}
          {activeTab === 'ensemble' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 font-semibold">
                  <Sparkles className="w-4 h-4" />
                  <span>Konfigurasi Konsensus Multi-Model (Ensemble)</span>
                </div>
                <p className="text-stone-400 leading-relaxed">
                  Menggabungkan suara dari beberapa model sekaligus (misalnya model buatan rekan + model vision multimodal) secara berbobot (*weighted voting*). Ini meminimalkan bias dan memastikan keakuratan klasifikasi telur mencapai tingkat kesempurnaan tertinggi.
                </p>
              </div>

              <div className="space-y-2.5">
                <label className="block font-semibold text-stone-200">Mode Strategi Inferensi:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'single_active', title: 'Model Tunggal Aktif', desc: 'Hanya menggunakan 1 model yang terpilih saat ini.' },
                    { id: 'ensemble_consensus', title: 'Konsensus (Ensemble)', desc: 'Menggabungkan suara seluruh model aktif dengan bobot akurasi.' },
                    { id: 'cascade_fallback', title: 'Kaskade Cadangan', desc: 'Prioritaskan model rekan; jika confidence rendah, teruskan ke cloud.' },
                  ].map((mode) => (
                    <div
                      key={mode.id}
                      onClick={() => onUpdateEnsembleSettings({ ...ensembleSettings, mode: mode.id as any })}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        ensembleSettings.mode === mode.id
                          ? 'bg-stone-950 border-stone-400 text-stone-100 shadow-md'
                          : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                      }`}
                    >
                      <span className="font-bold text-xs block text-stone-200">{mode.title}</span>
                      <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">{mode.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-stone-200">Ambang Batas Keyakinan Minimum (Confidence Threshold):</span>
                  <span className="font-bold font-mono text-stone-100">{ensembleSettings.minConfidenceThreshold}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={95}
                  value={ensembleSettings.minConfidenceThreshold}
                  onChange={(e) => onUpdateEnsembleSettings({ ...ensembleSettings, minConfidenceThreshold: parseInt(e.target.value) })}
                  className="w-full accent-stone-300"
                />
                <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                  <span>50% (Toleran)</span>
                  <span>75% (Rekomendasi SNI)</span>
                  <span>95% (Sangat Ketat)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3.5 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs">
          <span className="text-[11px] text-stone-400">
            Sistem terintegrasi REST API & Edge Weights
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-100 hover:bg-white text-stone-900 font-bold rounded-xl transition-all shadow-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
