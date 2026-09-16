import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, Upload, Sparkles, CheckCircle2, AlertCircle, Scan, Lightbulb, Zap, Info } from 'lucide-react';
import { analyzeCandlingCanvas, RealtimeFrameAnalysis, DEFAULT_TUNING_CONFIG } from '../utils/cvAnalyzer';
import { ModelTuningConfig } from '../types';

interface CameraViewfinderProps {
  onCaptureImage: (imageBase64: string, fastAnalysis?: RealtimeFrameAnalysis) => void;
  isProcessing: boolean;
  onSelectSample: () => void;
  tuningConfig?: ModelTuningConfig;
}

export const CameraViewfinder: React.FC<CameraViewfinderProps> = ({
  onCaptureImage,
  isProcessing,
  onSelectSample,
  tuningConfig = DEFAULT_TUNING_CONFIG,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
      setCameraError('Kamera tidak dapat diakses atau diblokir. Anda tetap dapat mengunggah foto atau menggunakan sampel candling.');
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
      if (time - lastAnalyzeTime > 65) { // ~15 FPS
        lastAnalyzeTime = time;
        if (videoRef.current && hiddenProcessingCanvasRef.current && streamActive && !isProcessing) {
          const video = videoRef.current;
          const canvas = hiddenProcessingCanvasRef.current;
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            canvas.width = 320;
            canvas.height = 320;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
              // Draw centered crop to focus on circular socket
              const size = Math.min(video.videoWidth, video.videoHeight);
              const sx = (video.videoWidth - size) / 2;
              const sy = (video.videoHeight - size) / 2;
              ctx.drawImage(video, sx, sy, size, size, 0, 0, canvas.width, canvas.height);

              const analysis = analyzeCandlingCanvas(canvas, ctx, tuningConfig);
              setRealtimeAnalysis(analysis);

              // Auto-capture countdown logic when stable & optimal
              if (autoCaptureEnabled && analysis.alignmentScore >= 80) {
                setAlignmentCounter((prev) => {
                  if (prev >= 18) { // ~1.2s stable
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

  // Switch between front and back camera (mobile friendly)
  const toggleFacingMode = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
  };

  // Handle file upload (supports single or batch photos)
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
    e.target.value = '';
  };

  return (
    <div id="camera-viewfinder-container" className="flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Hidden processing canvas for CV sampling */}
      <canvas ref={hiddenProcessingCanvasRef} className="hidden" />

      {/* Top Controls Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-950/80 border-b border-zinc-800/80 backdrop-blur-md z-10">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${streamActive ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${streamActive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          <span className="text-xs font-semibold tracking-wider uppercase text-zinc-300">
            {streamActive ? 'Sinar Merah Candling Viewfinder' : 'Camera Standby'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="toggle-red-light-sim"
            onClick={() => setSimulatedRedLight(!simulatedRedLight)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors flex items-center space-x-1 ${
              simulatedRedLight
                ? 'bg-rose-950/70 text-rose-300 border-rose-600/50'
                : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:text-zinc-200'
            }`}
            title="Aktifkan simulasi cahaya merah jika menguji tanpa lampu fisik candler"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simulasi Sinar Merah</span>
          </button>

          <button
            id="switch-camera-btn"
            onClick={toggleFacingMode}
            className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 rounded-lg transition-colors"
            title="Ganti Kamera Depan/Belakang"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Viewfinder Box with Circular Aperture Guide */}
      <div className="relative w-full aspect-square sm:aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
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
            <div className="w-16 h-16 rounded-full bg-zinc-900/80 border border-zinc-700 flex items-center justify-center mb-3 text-zinc-400">
              <Camera className="w-8 h-8 text-rose-500" />
            </div>
            <p className="text-sm font-medium text-zinc-200 mb-1">
              Kamera siap dihubungkan
            </p>
            <p className="text-xs text-zinc-400 mb-4">
              {cameraError || 'Letakkan telur pada lubang bulat beriluminasi sinar merah atau unggah foto candling.'}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                id="btn-retry-camera"
                onClick={() => startCamera(facingMode)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 rounded-lg border border-zinc-700"
              >
                Coba Kamera Lagi
              </button>
              <button
                id="btn-use-sample-fallback"
                onClick={onSelectSample}
                className="px-3 py-1.5 bg-rose-600/90 hover:bg-rose-500 text-xs font-medium text-white rounded-lg shadow-sm"
              >
                Pilih Sampel Telur
              </button>
            </div>
          </div>
        )}

        {/* Simulated Candler Red Light Layer if enabled */}
        {simulatedRedLight && (
          <div className="absolute inset-0 pointer-events-none mix-blend-color-dodge bg-gradient-to-t from-rose-600/50 via-rose-700/40 to-transparent" />
        )}

        {/* Circular Candling Aperture Guide (Tempat Bulat Sinar Merah) */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Dimmed backdrop outside circular socket */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full border-2 border-dashed transition-all duration-300 flex items-center justify-center ${
            realtimeAnalysis?.alignmentScore && realtimeAnalysis.alignmentScore >= 80
              ? 'border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.35)]'
              : 'border-rose-500/80 shadow-[0_0_35px_rgba(244,63,94,0.35)]'
          }">
            {/* Center crosshair */}
            <div className="w-3 h-0.5 bg-rose-400/80 absolute" />
            <div className="h-3 w-0.5 bg-rose-400/80 absolute" />

            {/* Target ring collar */}
            <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-full border border-rose-400/30" />

            {/* Air Cell Target Area indicator at top of circular socket */}
            <div className="absolute top-2 w-20 h-7 border-t-2 border-amber-400/70 rounded-t-full flex items-center justify-center">
              <span className="text-[10px] text-amber-300/80 font-mono tracking-wider -mt-4 bg-zinc-950/70 px-1 rounded">
                Kantung Udara
              </span>
            </div>

            {/* Live Alignment Indicator */}
            {realtimeAnalysis && (
              <div className="absolute -bottom-8 px-3 py-1 bg-zinc-950/85 border border-zinc-700/80 rounded-full text-[11px] font-medium text-zinc-200 backdrop-blur-sm flex items-center space-x-1.5 shadow-lg">
                {realtimeAnalysis.alignmentScore >= 80 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Scan className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                )}
                <span>{realtimeAnalysis.guidanceMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Edge CV Overlay Badge */}
        {realtimeAnalysis && streamActive && (
          <div className="absolute top-3 left-3 bg-zinc-950/80 border border-zinc-800 rounded-xl p-2.5 backdrop-blur-md text-[11px] text-zinc-300 font-mono space-y-1 shadow-md pointer-events-none">
            <div className="flex items-center justify-between space-x-3">
              <span className="text-zinc-400">Intensitas Merah:</span>
              <span className="font-bold text-rose-400">{realtimeAnalysis.redIntensity}</span>
            </div>
            <div className="flex items-center justify-between space-x-3">
              <span className="text-zinc-400">Translusensi:</span>
              <span className="font-bold text-amber-400">{realtimeAnalysis.translucencyScore}%</span>
            </div>
            <div className="flex items-center justify-between space-x-3">
              <span className="text-zinc-400">Est. Kantung:</span>
              <span className="font-bold text-zinc-200">{realtimeAnalysis.airCellEstimateMm} mm</span>
            </div>
            <div className="flex items-center justify-between space-x-3 pt-1 border-t border-zinc-800">
              <span className="text-zinc-400">Est. Instan:</span>
              <span className={`font-bold ${
                realtimeAnalysis.instantGradeEstimate === 'Grade A' ? 'text-emerald-400' :
                realtimeAnalysis.instantGradeEstimate === 'Grade B' ? 'text-blue-400' :
                realtimeAnalysis.instantGradeEstimate === 'Grade C' ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {realtimeAnalysis.instantGradeEstimate}
              </span>
            </div>
          </div>
        )}

        {/* Processing Spinner Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-zinc-950/75 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <div className="relative flex items-center justify-center mb-3">
              <div className="w-14 h-14 border-3 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
              <Sparkles className="w-6 h-6 text-rose-400 absolute animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-white">Memproses Grading Telur...</p>
            <p className="text-xs text-zinc-400 mt-1">Menganalisis kantung udara, kuning telur, & integritas cangkang</p>
          </div>
        )}
      </div>

      {/* Bottom Action Controls */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-800/80">
        <div className="flex items-center justify-between gap-3">
          {/* Preset Samples Picker */}
          <button
            id="btn-open-samples"
            onClick={onSelectSample}
            disabled={isProcessing}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/70 rounded-xl text-xs font-medium transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Pilih Sampel Candling</span>
          </button>

          {/* Primary Take Photo / Process Button */}
          <button
            id="btn-capture-egg"
            onClick={() => captureFrame()}
            disabled={isProcessing || !streamActive}
            className="flex-1 sm:flex-initial px-6 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 active:scale-95 text-white font-semibold text-sm rounded-xl shadow-lg shadow-rose-950/50 transition-all flex items-center justify-center space-x-2 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Camera className="w-4 h-4" />
            <span>Ambil Foto & Grade</span>
          </button>

          {/* Upload Picture File */}
          <label
            htmlFor="upload-egg-input"
            className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/70 rounded-xl text-xs font-medium cursor-pointer transition-all flex items-center justify-center space-x-2"
          >
            <Upload className="w-4 h-4 text-zinc-400" />
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
        <div className="mt-3 pt-3 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-400">
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              id="checkbox-auto-capture"
              type="checkbox"
              checked={autoCaptureEnabled}
              onChange={(e) => setAutoCaptureEnabled(e.target.checked)}
              className="rounded bg-zinc-800 border-zinc-700 text-rose-600 focus:ring-rose-500 focus:ring-offset-zinc-950"
            />
            <span className="text-zinc-300">Otomatis jepret saat posisi telur stabil di lingkaran</span>
          </label>
          <span className="hidden sm:inline-flex items-center text-[11px] text-zinc-500">
            <Info className="w-3.5 h-3.5 mr-1" />
            Standar Candling SNI 3926:2008
          </span>
        </div>
      </div>
    </div>
  );
};
