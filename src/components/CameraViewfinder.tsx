import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Camera, 
  RefreshCw, 
  Upload, 
  Sparkles, 
  Lightbulb, 
  Cpu, 
  CheckCircle2, 
  Sliders, 
  HelpCircle,
  ScanLine
} from 'lucide-react';
import { analyzeCandlingCanvas, RealtimeFrameAnalysis, DEFAULT_TUNING_CONFIG } from '../utils/cvAnalyzer';
import { ModelTuningConfig } from '../types';

interface CameraViewfinderProps {
  onCaptureImage: (imageBase64: string, fastAnalysis?: RealtimeFrameAnalysis) => void;
  isProcessing: boolean;
  onSelectSample: () => void;
  tuningConfig?: ModelTuningConfig;
  activeModelName?: string;
  onOpenModelManager?: () => void;
}

export const CameraViewfinder: React.FC<CameraViewfinderProps> = ({
  onCaptureImage,
  isProcessing,
  onSelectSample,
  tuningConfig = DEFAULT_TUNING_CONFIG,
  activeModelName = 'Gemini 3.8 Flash Vision',
  onOpenModelManager,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hiddenProcessingCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [autoCaptureEnabled, setAutoCaptureEnabled] = useState(false);
  const [simulatedRedLight, setSimulatedRedLight] = useState(false);
  const [realtimeAnalysis, setRealtimeAnalysis] = useState<RealtimeFrameAnalysis | null>(null);
  const [alignmentCounter, setAlignmentCounter] = useState(0);

  // Initialize camera stream
  const startCamera = useCallback(async (facing: 'environment' | 'user') => {
    setCameraError(null);
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setStreamActive(true);
        };
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Kamera fisik belum terhubung atau akses dibatasi. Anda dapat mengunggah foto atau menggunakan sampel candling.');
      setStreamActive(false);
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [facingMode, startCamera]);

  // Real-time Computer Vision analysis loop (at ~15 fps to preserve CPU/battery)
  useEffect(() => {
    let animationFrameId: number;
    let lastAnalyzeTime = 0;

    const processLoop = (time: number) => {
      if (time - lastAnalyzeTime > 65) {
        lastAnalyzeTime = time;
        if (videoRef.current && hiddenProcessingCanvasRef.current && streamActive && !isProcessing) {
          const video = videoRef.current;
          const canvas = hiddenProcessingCanvasRef.current;
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            canvas.width = 320;
            canvas.height = 320;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
              const size = Math.min(video.videoWidth, video.videoHeight);
              const sx = (video.videoWidth - size) / 2;
              const sy = (video.videoHeight - size) / 2;
              ctx.drawImage(video, sx, sy, size, size, 0, 0, canvas.width, canvas.height);

              const analysis = analyzeCandlingCanvas(canvas, ctx, tuningConfig);
              setRealtimeAnalysis(analysis);

              if (autoCaptureEnabled && analysis.alignmentScore >= 80) {
                setAlignmentCounter((prev) => {
                  if (prev >= 18) {
                    captureFrame(analysis);
                    return 0;
                  }
                  return prev + 1;
                });
              } else {
                setAlignmentCounter(0);
              }
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(processLoop);
    };

    animationFrameId = requestAnimationFrame(processLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [streamActive, autoCaptureEnabled, isProcessing]);

  // Capture current frame from video
  const captureFrame = (analysis?: RealtimeFrameAnalysis) => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    onCaptureImage(dataUrl, analysis || realtimeAnalysis || undefined);
  };

  const toggleFacingMode = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setTimeout(() => {
            onCaptureImage(base64);
          }, index * 250);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="relative w-full bg-stone-900 rounded-2xl border border-stone-800 shadow-xl overflow-hidden flex flex-col">
      <canvas ref={hiddenProcessingCanvasRef} className="hidden" />

      {/* Top Station Status Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-stone-950/90 border-b border-stone-800/90 backdrop-blur-sm z-10 gap-2">
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${streamActive ? 'bg-emerald-500' : 'bg-stone-500'}`} />
          <span className="text-xs font-medium tracking-wide text-stone-300">
            {streamActive ? 'Sensor Ovoskopi Aktif' : 'Sensor Standby'}
          </span>
          <span className="text-[11px] text-stone-400 hidden sm:inline">• Kalibrasi 640nm</span>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenModelManager && (
            <button
              id="open-model-manager-top-btn"
              onClick={onOpenModelManager}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-stone-800 hover:bg-stone-700/80 border border-stone-700 text-stone-200 transition-colors flex items-center space-x-1.5"
              title="Ganti atau tambah model AI"
            >
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span className="truncate max-w-[120px] sm:max-w-[170px]">{activeModelName}</span>
            </button>
          )}

          <button
            id="toggle-red-light-sim"
            onClick={() => setSimulatedRedLight(!simulatedRedLight)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors flex items-center space-x-1 ${
              simulatedRedLight
                ? 'bg-amber-950/70 text-amber-200 border-amber-600/60'
                : 'bg-stone-800/80 text-stone-400 border-stone-700 hover:text-stone-200'
            }`}
            title="Simulasi filter optik sinar merah jika menggunakan sumber cahaya alami"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filter Sinar Merah</span>
          </button>

          <button
            id="switch-camera-btn"
            onClick={toggleFacingMode}
            className="p-1.5 text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg transition-colors"
            title="Ganti Kamera Depan/Belakang"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Viewfinder Box with Circular Aperture Guide */}
      <div className="relative w-full aspect-square sm:aspect-[4/3] bg-stone-950 flex items-center justify-center overflow-hidden">
        {/* Live Video Feed */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            streamActive ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Fallback Screen if camera unavailable */}
        {!streamActive && (
          <div className="flex flex-col items-center justify-center p-6 text-center z-10 max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center mb-3 text-stone-400 shadow-inner">
              <Camera className="w-7 h-7 text-amber-400" />
            </div>
            <p className="text-sm font-semibold text-stone-200 mb-1">
              Siap Melakukan Pemeriksaan
            </p>
            <p className="text-xs text-stone-400 mb-4 leading-relaxed">
              {cameraError || 'Letakkan telur di atas corong candler beriluminasi sinar merah atau unggah foto telur.'}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                id="btn-retry-camera"
                onClick={() => startCamera(facingMode)}
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-200 rounded-xl border border-stone-700 transition-colors"
              >
                Coba Kamera Lagi
              </button>
              <button
                id="btn-use-sample-fallback"
                onClick={onSelectSample}
                className="px-4 py-2 bg-stone-100 hover:bg-white text-xs font-bold text-stone-950 rounded-xl shadow-sm transition-all"
              >
                Gunakan Sampel Candling
              </button>
            </div>
          </div>
        )}

        {/* Physical Candler Socket Guide Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 border-2 border-stone-400/40 rounded-full flex items-center justify-center transition-all duration-300">
            {/* Top Blunt End Target (Air Cell zone) */}
            <div className="absolute -top-3 px-3 py-1 bg-stone-950/90 border border-stone-700 rounded-full text-[10px] text-stone-300 font-medium tracking-wide">
              Kutub Tumpul (Kantung Udara)
            </div>

            {/* Crosshair precision marks */}
            <div className="w-full h-[1px] bg-stone-500/20 absolute" />
            <div className="h-full w-[1px] bg-stone-500/20 absolute" />
            <div className="w-12 h-12 border border-stone-400/30 rounded-full absolute" />

            {/* Bottom Candler Hole Guide */}
            <div className="absolute -bottom-3 px-3 py-1 bg-stone-950/90 border border-stone-700 rounded-full text-[10px] text-stone-400">
              Lubang Dudukan Candler
            </div>

            {/* Guidance Badge */}
            {realtimeAnalysis && streamActive && (
              <div className="absolute bottom-6 px-3 py-1.5 bg-stone-900/90 border border-stone-700 rounded-lg text-xs text-stone-200 shadow-md">
                {realtimeAnalysis.guidanceMessage}
              </div>
            )}
          </div>
        </div>

        {/* Real-time Optical Metrics HUD */}
        {realtimeAnalysis && streamActive && (
          <div className="absolute top-3 left-3 bg-stone-950/90 border border-stone-800 rounded-xl p-3 backdrop-blur-md text-[11px] text-stone-300 font-mono space-y-1.5 shadow-lg pointer-events-none">
            <div className="flex items-center justify-between space-x-3">
              <span className="text-stone-400">Pendar Merah:</span>
              <span className="font-bold text-stone-200">{realtimeAnalysis.redIntensity}</span>
            </div>
            <div className="flex items-center justify-between space-x-3">
              <span className="text-stone-400">Translusensi:</span>
              <span className="font-bold text-amber-300">{realtimeAnalysis.translucencyScore}%</span>
            </div>
            <div className="flex items-center justify-between space-x-3">
              <span className="text-stone-400">Est. Kantung:</span>
              <span className="font-bold text-stone-200">{realtimeAnalysis.airCellEstimateMm} mm</span>
            </div>
            <div className="flex items-center justify-between space-x-3 pt-1 border-t border-stone-800">
              <span className="text-stone-400">Prediksi Awal:</span>
              <span className="font-bold text-emerald-400">
                {realtimeAnalysis.instantGradeEstimate}
              </span>
            </div>
          </div>
        )}

        {/* Processing Spinner Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 text-center px-4">
            <div className="w-12 h-12 border-3 border-stone-700 border-t-amber-400 rounded-full animate-spin mb-3" />
            <p className="text-sm font-semibold text-stone-100">Menganalisis Ovoskopi...</p>
            <p className="text-xs text-stone-400 mt-1 max-w-xs">
              Memeriksa kedalaman kantung udara, posisi kuning telur, dan integritas mikroskopis cangkang
            </p>
          </div>
        )}
      </div>

      {/* Bottom Action Controls */}
      <div className="p-4 bg-stone-950 border-t border-stone-800/90">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Preset Samples Picker */}
          <button
            id="btn-open-samples"
            onClick={onSelectSample}
            disabled={isProcessing}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Katalog Sampel</span>
          </button>

          {/* Primary Take Photo / Process Button */}
          <button
            id="btn-capture-egg"
            onClick={() => captureFrame()}
            disabled={isProcessing || !streamActive}
            className="flex-1 sm:flex-initial px-6 py-2.5 bg-stone-100 hover:bg-white text-stone-900 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]"
          >
            <Camera className="w-4 h-4 text-stone-900" />
            <span>Pindai Telur Ini</span>
          </button>

          {/* Upload Picture File */}
          <label
            htmlFor="upload-egg-input"
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center justify-center space-x-2"
          >
            <Upload className="w-4 h-4 text-stone-400" />
            <span>Unggah Foto</span>
          </label>
          <input
            id="upload-egg-input"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Auto Capture & Info Helper */}
        <div className="mt-3 pt-3 border-t border-stone-900 flex flex-wrap items-center justify-between text-xs text-stone-400 gap-2">
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              id="checkbox-auto-capture"
              type="checkbox"
              checked={autoCaptureEnabled}
              onChange={(e) => setAutoCaptureEnabled(e.target.checked)}
              className="rounded bg-stone-900 border-stone-700 text-amber-500 focus:ring-0 focus:ring-offset-0"
            />
            <span className="text-stone-300 text-xs">Pindai Otomatis Saat Telur Stabil</span>
          </label>

          <span className="text-[11px] text-stone-400">
            Toleransi: SNI 3926:2008 & USDA Grade Shield
          </span>
        </div>
      </div>
    </div>
  );
};
