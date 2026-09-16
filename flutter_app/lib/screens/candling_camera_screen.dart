import 'dart:io';
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

      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (ctx) => InspectionResultSheet(
          inspection: result,
          onVerifyGroundTruth: (verifiedGrade, notes) {
            setState(() {
              final idx = _sessionHistory.indexWhere((e) => e.id == result.id);
              if (idx != -1) {
                // Verified
              }
            });
          },
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Gagal memeriksa telur: $e'),
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
          CameraPreview(_cameraController!),

          // Optical Masking Kegelapan
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

          // Reticle Sinar Merah
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
                  Container(width: 16, height: 1, color: Colors.redAccent.withOpacity(0.6)),
                  Container(width: 1, height: 16, color: Colors.redAccent.withOpacity(0.6)),
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

          // Header
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

          // Kontrol Bawah
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
                    FloatingActionButton.small(
                      heroTag: 'history_btn',
                      backgroundColor: Colors.grey[900],
                      onPressed: () {},
                      child: const Icon(Icons.inventory_2_outlined, color: Colors.white70),
                    ),

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

                    FloatingActionButton.small(
                      heroTag: 'rules_btn',
                      backgroundColor: Colors.grey[900],
                      onPressed: () {},
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
