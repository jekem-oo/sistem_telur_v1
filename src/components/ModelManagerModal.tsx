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
  AlertCircle, 
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
  const [formDescription, setFormDescription] = useState('Model deteksi defect telur candling terlatih pada citra senter merah.');
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
        message: 'Tidak dapat menjangkau server proxy. Pastikan URL endpoint valid.',
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

    // Reset fields
    setFormName('');
    setFormUploadedFileName(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Manajemen Model AI & Eksternal</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-300 font-mono border border-rose-500/30">
                  {models.length} Model Terdaftar
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Tambahkan model buatan teman atau model eksternal (API/Weights) untuk memperkuat akurasi grading.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs inside Modal */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/40 px-6 pt-2 gap-2 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'list'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Daftar Model ({models.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('add_external');
              setFormType('external_api');
            }}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'add_external'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>+ Hubungkan Model Eksternal (API / Cloud)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('upload_weights');
              setFormType('custom_weights');
            }}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'upload_weights'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>+ Unggah Bobot Model Teman (.pt/.onnx/.tflite)</span>
          </button>
          <button
            onClick={() => setActiveTab('ensemble')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'ensemble'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Mode Konsensus (Ensemble)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[68vh] overflow-y-auto space-y-4">
          {/* TAB 1: LIST OF REGISTERED MODELS */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl flex items-center justify-between text-xs text-zinc-300">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>
                    Model aktif saat ini:{' '}
                    <strong className="text-white">
                      {models.find((m) => m.id === activeModelId)?.name || 'Default'}
                    </strong>
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 font-mono">
                  Mode: {ensembleSettings.mode === 'ensemble_consensus' ? 'Voting Gabungan (Ensemble)' : 'Model Tunggal'}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {models.map((model) => {
                  const isSelected = model.id === activeModelId;
                  return (
                    <div
                      key={model.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-rose-950/20 border-rose-500/50 shadow-md shadow-rose-950/30'
                          : 'bg-zinc-950/50 border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="font-bold text-sm text-white">{model.name}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                              {model.version}
                            </span>
                            {model.isBuiltIn ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                                Bawaan Sistem
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                                Model Rekan / Eksternal
                              </span>
                            )}
                            {model.type === 'external_api' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-950/60 text-purple-300 border border-purple-500/30">
                                REST API
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-zinc-400">{model.description}</p>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-zinc-500 font-mono">
                            <span>Author: <strong className="text-zinc-300">{model.author}</strong></span>
                            <span>Akurasi: <strong className="text-emerald-400">{model.accuracyScore}%</strong></span>
                            <span>Bobot Suara: <strong className="text-amber-400">{model.votingWeight}x</strong></span>
                            {model.endpointUrl && (
                              <span className="truncate max-w-[200px]" title={model.endpointUrl}>
                                URL: {model.endpointUrl}
                              </span>
                            )}
                            {model.weightSizeMb && (
                              <span>Ukuran: {model.weightSizeMb} MB</span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onSelectActiveModel(model.id)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                              isSelected
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Aktif Utama</span>
                              </>
                            ) : (
                              <span>Pilih Model Ini</span>
                            )}
                          </button>

                          <button
                            onClick={() => onToggleModelActive(model.id, !model.isActive)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                              model.isActive
                                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                            }`}
                            title={model.isActive ? 'Ikut serta dalam voting ensemble' : 'Dinonaktifkan'}
                          >
                            {model.isActive ? 'Aktif' : 'Off'}
                          </button>

                          {!model.isBuiltIn && (
                            <button
                              onClick={() => onDeleteModel(model.id)}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                              title="Hapus model ini"
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

              {/* Quick Add CTA */}
              <div className="p-4 bg-zinc-950/70 border border-dashed border-zinc-800 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-white">Ingin Menambahkan Model Temanmu?</h4>
                  <p className="text-zinc-400 mt-0.5">
                    Model dapat berupa endpoint API lokal (FastAPI / Flask) atau file bobot model (.pt, .onnx, .tflite).
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setActiveTab('add_external');
                      setFormType('external_api');
                    }}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 border border-zinc-700"
                  >
                    <Plus className="w-3.5 h-3.5 text-rose-400" />
                    <span>Tambah Model</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONNECT EXTERNAL API MODEL */}
          {activeTab === 'add_external' && (
            <form onSubmit={handleSubmitNewModel} className="space-y-4 text-xs">
              <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl text-purple-200">
                <p className="font-bold flex items-center space-x-1.5">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span>Koneksikan Server API Model Teman (REST / HTTP)</span>
                </p>
                <p className="text-[11px] text-purple-300/80 mt-1">
                  Temanmu yang menjalankan script Python (PyTorch/YOLO) di laptop/server lokal via FastAPI atau Flask dapat langsung menerima citra candling base64 dan mengembalikan prediksi Grade A/B/C/D.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Nama Model</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: YOLOv10-EggGrading-Lab"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Pembuat / Peneliti Model</label>
                  <input
                    type="text"
                    placeholder="Contoh: Budi Santoso (Teman Lab)"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">URL Endpoint Prediksi (POST)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    placeholder="http://192.168.1.50:8000/predict atau https://api.temanmu.com/grade-egg"
                    value={formEndpoint}
                    onChange={(e) => setFormEndpoint(e.target.value)}
                    className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500 font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting || !formEndpoint}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-semibold flex items-center space-x-1.5 border border-zinc-700 disabled:opacity-50"
                  >
                    {isTesting ? (
                      <span>Mengetes...</span>
                    ) : (
                      <>
                        <Activity className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Tes Koneksi</span>
                      </>
                    )}
                  </button>
                </div>
                {testResult && (
                  <div
                    className={`mt-2 p-2 rounded-lg text-[11px] flex items-center space-x-2 ${
                      testResult.success
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {testResult.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Versi Model</label>
                  <input
                    type="text"
                    value={formVersion}
                    onChange={(e) => setFormVersion(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Estimasi Akurasi (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="50"
                    max="99.9"
                    value={formAccuracy}
                    onChange={(e) => setFormAccuracy(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Bobot Voting Ensemble (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formWeight}
                    onChange={(e) => setFormWeight(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">API Token / Header Auth (Opsional)</label>
                <input
                  type="text"
                  placeholder="Bearer eyJhbGciOi... atau X-Api-Key"
                  value={formAuthHeader}
                  onChange={(e) => setFormAuthHeader(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Deskripsi & Catatan Pelatihan</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold flex items-center space-x-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Simpan & Aktifkan Model</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: UPLOAD WEIGHTS (.pt / .onnx / .tflite) */}
          {activeTab === 'upload_weights' && (
            <form onSubmit={handleSubmitNewModel} className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-emerald-200">
                <p className="font-bold flex items-center space-x-1.5">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Impor Bobot Model Pelatihan Teman (.pt / .onnx / .tflite / .json)</span>
                </p>
                <p className="text-[11px] text-emerald-300/80 mt-1">
                  Unggah file model yang telah dilatih temanmu menggunakan dataset telur candling sinar merah. Sistem akan mengintegrasikannya ke arsitektur Edge AI.
                </p>
              </div>

              <div className="p-6 border-2 border-dashed border-zinc-700 hover:border-emerald-500 rounded-xl bg-zinc-950/60 text-center transition-colors">
                <Upload className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-white">
                  {formUploadedFileName ? `File Terpilih: ${formUploadedFileName} (${formWeightSizeMb} MB)` : 'Klik atau Seret Berkas Model ke Sini'}
                </p>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Format didukung: PyTorch (.pt, .pth), ONNX Runtime (.onnx), TensorFlow Lite (.tflite), Keras (.h5), TFJS (.json)
                </p>
                <label className="mt-3 inline-block px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-semibold cursor-pointer border border-zinc-700 transition">
                  <span>Pilih File Bobot Model</span>
                  <input
                    type="file"
                    accept=".pt,.pth,.onnx,.tflite,.h5,.json,.bin"
                    onChange={handleFileDrop}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Nama Model</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: YOLOv8x-EggDefect-Weights"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Pelatih Model (Teman)</label>
                  <input
                    type="text"
                    placeholder="Nama temanmu"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Resolusi Input</label>
                  <input
                    type="text"
                    defaultValue="640x640"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Skor Akurasi (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formAccuracy}
                    onChange={(e) => setFormAccuracy(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Bobot Voting (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formWeight}
                    onChange={(e) => setFormWeight(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center space-x-1.5 shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>Daftarkan Bobot Model</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: ENSEMBLE CONSENSUS SETTINGS */}
          {activeTab === 'ensemble' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl text-amber-200">
                <p className="font-bold flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Mode Multi-Model Voting (Ensemble Consensus)</span>
                </p>
                <p className="text-[11px] text-amber-300/80 mt-1">
                  Menggabungkan prediksi dari model bawaan sistem + model temanmu + model eksternal secara berbobot (weighted voting) sehingga akurasi grading mendekati 100% sempurna!
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-zinc-300 font-bold">Pilih Mode Kerja Multi-Model:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => onUpdateEnsembleSettings({ ...ensembleSettings, mode: 'ensemble_consensus' })}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      ensembleSettings.mode === 'ensemble_consensus'
                        ? 'bg-rose-950/30 border-rose-500 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>Ensemble Voting</span>
                      {ensembleSettings.mode === 'ensemble_consensus' && <Check className="w-3.5 h-3.5 text-rose-400" />}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Semua model aktif memberikan prediksi. Grade dengan bobot suara terbanyak terpilih (paling akurat).
                    </p>
                  </div>

                  <div
                    onClick={() => onUpdateEnsembleSettings({ ...ensembleSettings, mode: 'cascade_fallback' })}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      ensembleSettings.mode === 'cascade_fallback'
                        ? 'bg-rose-950/30 border-rose-500 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>Cascade Fallback</span>
                      {ensembleSettings.mode === 'cascade_fallback' && <Check className="w-3.5 h-3.5 text-rose-400" />}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Gunakan model eksternal teman dulu, jika confidence &lt; {ensembleSettings.confidenceThreshold}%, serahkan ke Gemini Vision.
                    </p>
                  </div>

                  <div
                    onClick={() => onUpdateEnsembleSettings({ ...ensembleSettings, mode: 'single_active' })}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      ensembleSettings.mode === 'single_active'
                        ? 'bg-rose-950/30 border-rose-500 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>Model Tunggal</span>
                      {ensembleSettings.mode === 'single_active' && <Check className="w-3.5 h-3.5 text-rose-400" />}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Hanya gunakan satu model yang dipilih sebagai aktif utama tanpa voting tambahan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Retrain Trigger Notification threshold */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300 font-bold">Ambang Otomatis Retraining Dataset</span>
                  <span className="text-rose-400 font-mono font-bold">
                    {ensembleSettings.autoRetrainTriggerCount} Butir Telur Baru
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Ketika operator telah memverifikasi ground truth sebanyak {ensembleSettings.autoRetrainTriggerCount} butir telur baru, sistem akan otomatis memicu notifikasi ekspor dataset untuk di-retrain oleh temanmu.
                </p>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={ensembleSettings.autoRetrainTriggerCount}
                  onChange={(e) =>
                    onUpdateEnsembleSettings({
                      ...ensembleSettings,
                      autoRetrainTriggerCount: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-rose-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-zinc-500">
            Arsitektur: Multi-Tier Hybrid Inference (Gemini + Edge YOLO + External AI API)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all shadow-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
