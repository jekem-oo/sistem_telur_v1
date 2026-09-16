import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:camera/camera.dart';
import 'screens/candling_camera_screen.dart';

List<CameraDescription> _cameras = [];

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
  ]);

  try {
    _cameras = await availableCameras();
  } catch (e) {
    debugPrint('Kamera status: $e');
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
        geminiApiKey: const String.fromEnvironment('GEMINI_API_KEY', defaultValue: ''),
      ),
    );
  }
}
