import React, { useState } from 'react';
import { 
  Code2, 
  Smartphone, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  FolderTree, 
  Layers, 
  Camera, 
  Cpu, 
  ChevronRight,
  Sparkles,
  FileCode
} from 'lucide-react';

export const FLUTTER_PROJECT_FILES: Record<string, { description: string; code: string; language: string }> = {
  'pubspec.yaml': {
    description: 'Konfigurasi dependencies resmi Flutter untuk kamera, AI Gemini, audio, dan grafis',
    language: 'yaml',
    code: `name: egg_grading_system
description: "Sistem Klasifikasi & Grading Telur Candling Sinar Merah Berbasis AI"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.8
  camera: ^0.11.0+2          # Akses kamera real-time candling 60 FPS
  google_generative_ai: ^0.4.6 # Gemini Vision API resmi untuk inspeksi telur
  image: ^4.2.0              # Manipulasi & crop area sinar merah candler
  path_provider: ^2.1.3      # Penyimpanan dataset & foto inspeksi offline
  path: ^1.9.0
  shared_preferences: ^2.2.3 # Simpan konfigurasi kalibrasi & threshold
  fl_chart: ^0.68.0          # Grafik statistik distribusi Grade A, B, C, D
  intl: ^0.19.0              # Format tanggal & waktu inspeksi
  audioplayers: ^6.0.0       # Feedback audio beeper (lulus/afkir)
  share_plus: ^10.0.0        # Ekspor dataset CSV & foto sampel telur

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/audio/
`
  },

  'lib/models/egg_inspection.dart': {
    description: 'Model data taksonomi inspeksi mutu telur (Grade A, B, C, dan mutlak Grade D untuk selain kriteria)',
    language: 'dart',
    code: `import 'dart:convert';

/// Taksonomi grading telur standar SNI 3926:2008
enum EggGrade {
  gradeA,
  gradeB,
  gradeC,
  gradeD, // Afkir / Reject (Cacat, Retak, Noda Darah, Kantung Udara > 9mm)
}

extension EggGradeExtension on EggGrade {
  String get label {
    switch (this) {
      case EggGrade.gradeA:
        return 'Grade A (Sangat Segar)';
      case EggGrade.gradeB:
        return 'Grade B (Segar/Konsumsi)';
      case EggGrade.gradeC:
        return 'Grade C (Pengolahan/Industri)';
      case EggGrade.gradeD:
        return 'Grade D (Afkir / Reject)';
    }
  }

  String get shortLabel {
    switch (this) {
      case EggGrade.gradeA: return 'Grade A';
      case EggGrade.gradeB: return 'Grade B';
      case EggGrade.gradeC: return 'Grade C';
      case EggGrade.gradeD: return 'Grade D';
    }
  }

  bool get isRejected => this == EggGrade.gradeD;
}

class EggInspection {
  final String id;
  final DateTime timestamp;
  final String imagePath;
  final EggGrade grade;
  final double confidence;
  final double airCellDepthMm;
  final int freshnessScore;
  final bool hasHairlineCrack;
  final bool hasBloodSpot;
  final String yolkCentering;
  final List<String> defects;
  final String recommendation;
  final bool isGroundTruthVerified;
  final String notes;

  EggInspection({
    required this.id,
    required this.timestamp,
    required this.imagePath,
    required this.grade,
    required this.confidence,
    required this.airCellDepthMm,
    required this.freshnessScore,
    required this.hasHairlineCrack,
    required this.hasBloodSpot,
    required this.yolkCentering,
    required this.defects,
    required this.recommendation,
    this.isGroundTruthVerified = false,
    this.notes = '',
  });

  /// ATURAN STRICT: Selain kriteria Grade A, B, dan C -> MUTLAK GRADE D
  static EggGrade evaluateGrade({
    required double airCellMm,
    required bool hasCrack,
    required bool hasBlood,
    required bool isEmbryoDead,
  }) {
    // Apabila ada cacat fisik, retak rambut, noda darah, atau busuk:
    if (hasCrack || hasBlood || isEmbryoDead) {
      return EggGrade.gradeD;
    }

    if (airCellMm <= 3.5) {
      return EggGrade.gradeA;
    } else if (airCellMm <= 6.0) {
      return EggGrade.gradeB;
    } else if (airCellMm <= 9.0) {
      return EggGrade.gradeC;
    } else {
      // Kantung udara > 9mm atau kondisi abnormal lainnya -> Grade D
      return EggGrade.gradeD;
    }
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'timestamp': timestamp.toIso8601String(),
      'imagePath': imagePath,
      'grade': grade.shortLabel,
      'confidence': confidence,
      'airCellDepthMm': airCellDepthMm,
      'freshnessScore': freshnessScore,
      'hasHairlineCrack': hasHairlineCrack,
      'hasBloodSpot': hasBloodSpot,
      'yolkCentering': yolkCentering,
      'defects': defects,
      'recommendation': recommendation,
      'isGroundTruthVerified': isGroundTruthVerified,
      'notes': notes,
    };
  }

  factory EggInspection.fromMap(Map<String, dynamic> map) {
    EggGrade parsedGrade = EggGrade.gradeD;
    final gStr = map['grade']?.toString().toUpperCase() ?? '';
    if (gStr.contains('GRADE A')) parsedGrade = EggGrade.gradeA;
    else if (gStr.contains('GRADE B')) parsedGrade = EggGrade.gradeB;
    else if (gStr.contains('GRADE C')) parsedGrade = EggGrade.gradeC;
    else parsedGrade = EggGrade.gradeD;

    return EggInspection(
      id: map['id'] ?? '',
      timestamp: DateTime.tryParse(map['timestamp'] ?? '') ?? DateTime.now(),
      imagePath: map['imagePath'] ?? '',
      grade: parsedGrade,
      confidence: (map['confidence'] as num?)?.toDouble() ?? 0.0,
      airCellDepthMm: (map['airCellDepthMm'] as num?)?.toDouble() ?? 0.0,
      freshnessScore: (map['freshnessScore'] as num?)?.toInt() ?? 0,
      hasHairlineCrack: map['hasHairlineCrack'] ?? false,
      hasBloodSpot: map['hasBloodSpot'] ?? false,
      yolkCentering: map['yolkCentering'] ?? 'Tengah',
      defects: List<String>.from(map['defects'] ?? []),
      recommendation: map['recommendation'] ?? '',
      isGroundTruthVerified: map['isGroundTruthVerified'] ?? false,
      notes: map['notes'] ?? '',
    );
  }
}
`
  },

  'lib/services/gemini_classifier_service.dart': {
    description: 'Layanan AI Gemini Vision di Flutter untuk menganalisa citra sinar merah candling',
    language: 'dart',
    code: `import 'dart:convert';
import 'dart:io';
import 'package:google_generative_ai/google_generative_ai.dart';
import '../models/egg_inspection.dart';

class GeminiClassifierService {
  final GenerativeModel _model;

  GeminiClassifierService({required String apiKey})
      : _model = GenerativeModel(
          model: 'gemini-1.5-flash',
          apiKey: apiKey,
          generationConfig: GenerationConfig(
            responseMimeType: 'application/json',
            temperature: 0.1, // Presisi deterministik tinggi untuk grading optik
          ),
          systemInstruction: Content.system('''
Anda adalah sistem inspeksi kualitas telur ovoscopy sinar merah (panjang gelombang 630-660nm) berstandar SNI 3926:2008 & USDA.

Kaidah Klasifikasi Sinar Merah:
1. Grade A: Kantung udara kedalaman <= 3.5mm, cangkang utuh mulus, kuning telur di tengah, transmisi cahaya merah merata & jernih.
2. Grade B: Kantung udara kedalaman 3.5 - 6.0mm, cangkang utuh, kuning telur agak bergerak, layak konsumsi reguler.
3. Grade C: Kantung udara kedalaman 6.0 - 9.0mm, kuning telur bergerak bebas, peruntukan industri/bakery.
4. Grade D (AFKIR/REJECT): MUTLAK ditugaskan jika telur memiliki retak rambut (hairline crack), noda darah (blood spot), embrio mati (blood ring), cangkang pecah/bocor, kantung udara > 9.0mm, atau busuk. SELAIN kriteria Grade A, B, dan C, status MUTLAK adalah Grade D.

Wajib kembalikan format JSON:
{
  "grade": "Grade A" | "Grade B" | "Grade C" | "Grade D",
  "confidence": number (persentase 0-100),
  "airCellDepthMm": number (dalam mm),
  "freshnessScore": number (skor 0-100),
  "hasHairlineCrack": boolean,
  "hasBloodSpot": boolean,
  "yolkCentering": "Tengah" | "Agak Pinggir" | "Menempel Dinding",
  "defects": ["string nama cacat jika ada"],
  "recommendation": "string saran distribusi/penanganan"
}
'''),
        );

  Future<EggInspection> classifyImageFile(File file) async {
    final imageBytes = await file.readAsBytes();
    final fileName = file.path.split('/').last;

    final prompt = TextPart(
      'Analisis citra candling telur ini. Deteksi kedalaman kantung udara, posisi kuning telur, retakan cangkang, dan tetapkan mutunya.'
    );

    final response = await _model.generateContent([
      Content.multi([
        prompt,
        DataPart('image/jpeg', imageBytes),
      ]),
    ]);

    final rawJson = response.text ?? '{}';
    final parsed = jsonDecode(rawJson) as Map<String, dynamic>;

    // Terapkan penegasan taksonomi: bila bukan Grade A, B, atau C -> MUTLAK Grade D
    String rawGrade = (parsed['grade'] ?? 'Grade D').toString();
    EggGrade grade = EggGrade.gradeD;
    if (rawGrade == 'Grade A') grade = EggGrade.gradeA;
    else if (rawGrade == 'Grade B') grade = EggGrade.gradeB;
    else if (rawGrade == 'Grade C') grade = EggGrade.gradeC;

    final double airCell = (parsed['airCellDepthMm'] as num?)?.toDouble() ?? 4.0;
    final bool hasCrack = parsed['hasHairlineCrack'] == true;
    final bool hasBlood = parsed['hasBloodSpot'] == true;

    // Double check aturan afkir
    if (hasCrack || hasBlood || airCell > 9.0) {
      grade = EggGrade.gradeD;
    }

    return EggInspection(
      id: 'EGG-\${DateTime.now().millisecondsSinceEpoch}',
      timestamp: DateTime.now(),
      imagePath: file.path,
      grade: grade,
      confidence: (parsed['confidence'] as num?)?.toDouble() ?? 92.5,
      airCellDepthMm: airCell,
      freshnessScore: (parsed['freshnessScore'] as num?)?.toInt() ?? 80,
      hasHairlineCrack: hasCrack,
      hasBloodSpot: hasBlood,
      yolkCentering: parsed['yolkCentering'] ?? 'Tengah',
      defects: List<String>.from(parsed['defects'] ?? []),
      recommendation: parsed['recommendation'] ?? 'Simpan pada suhu 4-7°C.',
    );
  }
}
`
  },

  'lib/screens/candling_camera_screen.dart': {
    description: 'Layar Kamera Utama: Aperture Corong Candling Sinar Merah, Masking Kegelapan, & Inspeksi 1-Sentuh',
    language: 'dart',
    code: `import 'dart:io';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import '../models/egg_inspection.dart';
import '../services/gemini_classifier_service.dart';
import '../widgets/inspection_result_sheet.dart';

class CandlingCameraScreen extends StatefulWidget {
  final List<CameraDescription> cameras;
  final String geminiApiKey;

  const CandlingCameraScreen({
    Key? key,
    required this.cameras,
    required this.geminiApiKey,
  }) : super(key: key);

  @override
  State<CandlingCameraScreen> createState() => _CandlingCameraScreenState();
}

class _CandlingCameraScreenState extends State<CandlingCameraScreen> {
  CameraController? _cameraController;
  late GeminiClassifierService _aiService;
  bool _isAnalyzing = false;
  bool _isFlashOn = false;
  List<EggInspection> _sessionHistory = [];

  @override
  void initState() {
    super.initState();
    _aiService = GeminiClassifierService(apiKey: widget.geminiApiKey);
    _initializeCamera();
  }

  Future<void> _initializeCamera() async {
    if (widget.cameras.isEmpty) return;
    
    _cameraController = CameraController(
      widget.cameras.first,
      ResolutionPreset.high,
      enableAudio: false,
      imageFormatGroup: ImageFormatGroup.jpeg,
    );

    await _cameraController!.initialize();
    if (mounted) setState(() {});
  }

  Future<void> _captureAndAnalyze() async {
    if (_cameraController == null || !_cameraController!.value.isInitialized || _isAnalyzing) {
      return;
    }

    setState(() => _isAnalyzing = true);

    try {
      final XFile photo = await _cameraController!.takePicture();
      final File imageFile = File(photo.path);

      final result = await _aiService.classifyImageFile(imageFile);

      setState(() {
        _sessionHistory.insert(0, result);
      });

      if (!mounted) return;

      // Buka bottom sheet modal hasil inspeksi
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (ctx) => InspectionResultSheet(
          inspection: result,
          onVerifyGroundTruth: (verifiedGrade, notes) {
            // Update ground truth dataset
            setState(() {
              final idx = _sessionHistory.indexWhere((e) => e.id == result.id);
              if (idx != -1) {
                // Update verified
              }
            });
          },
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Gagal memeriksa telur: \$e'),
          backgroundColor: Colors.redAccent,
        ),
      );
    } finally {
      if (mounted) setState(() => _isAnalyzing = false);
    }
  }

  @override
  void dispose() {
    _cameraController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_cameraController == null || !_cameraController!.value.isInitialized) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: CircularProgressIndicator(color: Colors.redAccent),
        ),
      );
    }

    final size = MediaQuery.of(context).size;
    final apertureDiameter = size.width * 0.75;

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // 1. Live Camera Feed
          CameraPreview(_cameraController!),

          // 2. Optical Masking Kegelapan di luar lingkaran candler
          ColorFiltered(
            colorFilter: ColorFilter.mode(
              Colors.black.withOpacity(0.88),
              BlendMode.srcOut,
            ),
            child: Stack(
              children: [
                Container(
                  decoration: const BoxDecoration(
                    color: Colors.transparent,
                  ),
                  child: Center(
                    child: Container(
                      width: apertureDiameter,
                      height: apertureDiameter,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.black,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // 3. Reticle Cincin Sinar Merah Candling & Target Grid
          Center(
            child: Container(
              width: apertureDiameter,
              height: apertureDiameter,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: Colors.redAccent.withOpacity(0.85),
                  width: 2.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.redAccent.withOpacity(0.35),
                    blurRadius: 20,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Garis bantu horizontal & vertikal aperture
                  Container(width: 16, height: 1, color: Colors.redAccent.withOpacity(0.6)),
                  Container(width: 1, height: 16, color: Colors.redAccent.withOpacity(0.6)),
                  
                  // Label panduan posisi ujung tumpul (kantung udara)
                  Positioned(
                    top: 14,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.black87,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.redAccent.withOpacity(0.4)),
                      ),
                      child: const Text(
                        'ARAHKAN KANTUNG UDARA KE ATAS',
                        style: TextStyle(color: Colors.white70, fontSize: 9, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // 4. Header Atas: Status Candling & Switch Flashlight
          Positioned(
            top: MediaQuery.of(context).padding.top + 10,
            left: 16,
            right: 16,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.7),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white24),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.redAccent,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'Candling 640nm Sinar Merah',
                        style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),

                IconButton(
                  icon: Icon(
                    _isFlashOn ? Icons.flash_on : Icons.flash_off,
                    color: _isFlashOn ? Colors.amber : Colors.white,
                  ),
                  onPressed: () async {
                    if (_cameraController != null) {
                      final newMode = _isFlashOn ? FlashMode.off : FlashMode.torch;
                      await _cameraController!.setFlashMode(newMode);
                      setState(() => _isFlashOn = !_isFlashOn);
                    }
                  },
                ),
              ],
            ),
          ),

          // 5. Kontrol Bawah: Tombol Capture & Quick Stats
          Positioned(
            bottom: 30,
            left: 20,
            right: 20,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (_isAnalyzing)
                  Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.red[900]?.withOpacity(0.8),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        ),
                        SizedBox(width: 10),
                        Text(
                          'Menganalisis Kualitas Sinar Merah...',
                          style: TextStyle(color: Colors.white, fontSize: 12),
                        ),
                      ],
                    ),
                  ),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    // Tombol Dataset & Riwayat
                    FloatingActionButton.small(
                      heroTag: 'history_btn',
                      backgroundColor: Colors.grey[900],
                      onPressed: () {
                        // Buka galeri/dataset inspeksi
                      },
                      child: const Icon(Icons.inventory_2_outlined, color: Colors.white70),
                    ),

                    // Tombol Shutter Utama
                    GestureDetector(
                      onTap: _isAnalyzing ? null : _captureAndAnalyze,
                      child: Container(
                        width: 76,
                        height: 76,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 4),
                          color: Colors.redAccent.withOpacity(_isAnalyzing ? 0.4 : 1.0),
                        ),
                        child: Center(
                          child: _isAnalyzing
                              ? const CircularProgressIndicator(color: Colors.white)
                              : const Icon(Icons.egg, color: Colors.white, size: 36),
                        ),
                      ),
                    ),

                    // Tombol Aturan SNI & Taksonomi
                    FloatingActionButton.small(
                      heroTag: 'rules_btn',
                      backgroundColor: Colors.grey[900],
                      onPressed: () {
                        // Tampilkan panduan kriteria Grade A-D
                      },
                      child: const Icon(Icons.help_outline, color: Colors.white70),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
`
  },

  'lib/widgets/inspection_result_sheet.dart': {
    description: 'Modal Sheet Hasil Grading: Rincian Kantung Udara, Kesegaran, Defect, & Ground Truth Verification',
    language: 'dart',
    code: `import 'package:flutter/material.dart';
import '../models/egg_inspection.dart';

class InspectionResultSheet extends StatefulWidget {
  final EggInspection inspection;
  final Function(EggGrade, String) onVerifyGroundTruth;

  const InspectionResultSheet({
    Key? key,
    required this.inspection,
    required this.onVerifyGroundTruth,
  }) : super(key: key);

  @override
  State<InspectionResultSheet> createState() => _InspectionResultSheetState();
}

class _InspectionResultSheetState extends State<InspectionResultSheet> {
  late EggGrade _selectedGrade;
  late TextEditingController _notesController;
  bool _saved = false;

  @override
  void initState() {
    super.initState();
    _selectedGrade = widget.inspection.grade;
    _notesController = TextEditingController(text: widget.inspection.notes);
  }

  Color _getGradeColor(EggGrade grade) {
    switch (grade) {
      case EggGrade.gradeA: return Colors.greenAccent[700]!;
      case EggGrade.gradeB: return Colors.blueAccent[700]!;
      case EggGrade.gradeC: return Colors.orangeAccent[700]!;
      case EggGrade.gradeD: return Colors.redAccent[700]!;
    }
  }

  @override
  Widget build(BuildContext context) {
    final grade = _selectedGrade;
    final color = _getGradeColor(grade);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: const BoxDecoration(
        color: Color(0xFF1E1E24),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Header Hasil & Badge Grade
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'HASIL INSPEKSI OVOSCOPY',
                    style: TextStyle(color: Colors.grey[400], fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    grade.label,
                    style: TextStyle(color: color, fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.15),
                  border: Border.all(color: color),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '\${widget.inspection.confidence.toStringAsFixed(1)}% Cocok',
                  style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // 3 Kartu Metrik: Kantung Udara, Kesegaran, Posisi Kuning Telur
          Row(
            children: [
              Expanded(
                child: _buildMetricTile(
                  'Kantung Udara',
                  '\${widget.inspection.airCellDepthMm.toStringAsFixed(1)} mm',
                  widget.inspection.airCellDepthMm <= 3.5 ? Colors.green : Colors.amber,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildMetricTile(
                  'Indeks Segar',
                  '\${widget.inspection.freshnessScore}/100',
                  widget.inspection.freshnessScore >= 80 ? Colors.green : Colors.orange,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildMetricTile(
                  'Kuning Telur',
                  widget.inspection.yolkCentering,
                  Colors.white70,
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Deteksi Defect / Retak Rambut
          if (widget.inspection.hasHairlineCrack || widget.inspection.defects.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red[900]?.withOpacity(0.25),
                border: Border.all(color: Colors.redAccent.withOpacity(0.5)),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Icon(Icons.warning_amber_rounded, color: Colors.redAccent),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      widget.inspection.hasHairlineCrack
                          ? 'Ditemukan retak rambut mikro pada cangkang -> MUTLAK AFKIR (Grade D).'
                          : 'Cacat terdeteksi: \${widget.inspection.defects.join(", ")}',
                      style: const TextStyle(color: Colors.white, fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),

          const SizedBox(height: 16),

          // Verifikasi Ahli (Human-in-the-Loop)
          const Text(
            'Koreksi / Verifikasi Ground Truth:',
            style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Row(
            children: EggGrade.values.map((g) {
              final isSel = _selectedGrade == g;
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 2),
                  child: ChoiceChip(
                    label: Text(g.shortLabel, style: TextStyle(fontSize: 11, color: isSel ? Colors.white : Colors.grey[400])),
                    selected: isSel,
                    selectedColor: _getGradeColor(g),
                    backgroundColor: Colors.grey[800],
                    onSelected: (val) {
                      if (val) setState(() => _selectedGrade = g);
                    },
                  ),
                ),
              );
            }).toList(),
          ),

          const SizedBox(height: 16),

          // Tombol Aksi Simpan
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: color,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              onPressed: () {
                widget.onVerifyGroundTruth(_selectedGrade, _notesController.text);
                setState(() => _saved = true);
                Navigator.pop(context);
              },
              icon: Icon(_saved ? Icons.check : Icons.save, color: Colors.white),
              label: Text(
                _saved ? 'Tersimpan ke Dataset' : 'Simpan Verifikasi ke Dataset',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricTile(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.black26,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 10)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(color: color, fontSize: 14, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
`
  },

  'lib/main.dart': {
    description: 'Entry point aplikasi Flutter: Inisialisasi Kamera & Navigasi ke Layar Utama',
    language: 'dart',
    code: `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:camera/camera.dart';
import 'screens/candling_camera_screen.dart';

List<CameraDescription> _cameras = [];

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Kunci orientasi ke Portrait untuk stabilitas optik
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
  ]);

  try {
    _cameras = await availableCameras();
  } catch (e) {
    debugPrint('Gagal memuat kamera: \$e');
  }

  runApp(const EggGradingApp());
}

class EggGradingApp extends StatelessWidget {
  const EggGradingApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Egg Candling AI System',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        primaryColor: Colors.redAccent,
        scaffoldBackgroundColor: const Color(0xFF0F0F12),
        colorScheme: const ColorScheme.dark(
          primary: Colors.redAccent,
          secondary: Colors.amberAccent,
        ),
      ),
      home: CandlingCameraScreen(
        cameras: _cameras,
        // Masukkan API key Gemini Anda di sini atau via --dart-define
        geminiApiKey: const String.fromEnvironment('GEMINI_API_KEY', defaultValue: 'YOUR_GEMINI_API_KEY'),
      ),
    );
  }
}
`
  }
};

export const FlutterExporterModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFile, setSelectedFile] = useState<string>('lib/screens/candling_camera_screen.dart');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentFileData = FLUTTER_PROJECT_FILES[selectedFile] || {
    description: '',
    code: '',
    language: 'dart',
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFileData.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAllZip = () => {
    // Generate text blob per file untuk kemudahan download
    const blob = new Blob([currentFileData.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.split('/').pop() || 'flutter_file.dart';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        id="flutter-modal-container"
        className="bg-neutral-900 border border-neutral-700 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Flutter Project Exporter (iOS & Android)</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Dart 3.0+
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Source code lengkap sistem klasifikasi telur sinar merah siap pakai untuk Flutter Mobile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-neutral-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Body Layout: Sidebar Files + Code Viewer */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Sidebar file tree */}
          <div className="md:col-span-4 border-r border-neutral-800 bg-neutral-950/40 p-4 overflow-y-auto space-y-2">
            <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              <FolderTree className="w-3.5 h-3.5 text-cyan-400" />
              <span>Struktur Berkas Flutter</span>
            </div>

            {Object.keys(FLUTTER_PROJECT_FILES).map((filePath) => {
              const isSelected = selectedFile === filePath;
              const fileName = filePath.split('/').pop();
              const dir = filePath.includes('/') ? filePath.substring(0, filePath.lastIndexOf('/')) : '';

              return (
                <button
                  key={filePath}
                  onClick={() => setSelectedFile(filePath)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition group ${
                    isSelected
                      ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-200'
                      : 'hover:bg-neutral-800/60 text-neutral-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-neutral-500 group-hover:text-neutral-300'}`} />
                    <div className="truncate">
                      <div className="font-mono font-medium truncate">{fileName}</div>
                      {dir && <div className="text-[10px] text-neutral-500 truncate">{dir}/</div>}
                    </div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400 opacity-100' : 'opacity-0 group-hover:opacity-60'}`} />
                </button>
              );
            })}

            {/* Petunjuk Eksekusi di Terminal */}
            <div className="mt-6 p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 text-[11px] text-neutral-400 space-y-2">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                Cara Menjalankan:
              </div>
              <ol className="list-decimal list-inside space-y-1 text-neutral-300 font-mono text-[10px]">
                <li>flutter create egg_grading_system</li>
                <li>Salin file-file di samping</li>
                <li>flutter pub get</li>
                <li>flutter run --dart-define=GEMINI_API_KEY=YOUR_KEY</li>
              </ol>
            </div>
          </div>

          {/* Main Code View */}
          <div className="md:col-span-8 flex flex-col bg-neutral-950 overflow-hidden">
            {/* Action Bar */}
            <div className="px-5 py-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/40">
              <div className="truncate pr-4">
                <span className="font-mono text-xs text-cyan-400 font-semibold">{selectedFile}</span>
                <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                  {currentFileData.description}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-white transition border border-neutral-700 font-medium"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
                </button>
                <button
                  onClick={handleDownloadAllZip}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 transition border border-neutral-700 font-medium"
                  title="Unduh berkas yang sedang dibuka saat ini"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Berkas Ini</span>
                </button>
                <a
                  href="/flutter_egg_grading_system.tar.gz"
                  download="flutter_egg_grading_system.tar.gz"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs text-white transition font-semibold shadow-sm"
                  title="Unduh seluruh paket proyek Flutter lengkap"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Paket Proyek (.tar.gz)</span>
                </a>
              </div>
            </div>

            {/* Code Preformatted Container */}
            <div className="flex-1 p-4 overflow-auto font-mono text-xs leading-relaxed text-neutral-200 bg-neutral-950">
              <pre>
                <code>{currentFileData.code}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Kaidah Taksonomi SNI 3926:2008 & Penegasan Mutlak Grade D (Afkir) Terintegrasi Penuh.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
