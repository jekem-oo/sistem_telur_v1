import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:camera/camera.dart';
import 'models/egg_inspection.dart';
import 'models/tuning_config.dart';
import 'services/dataset_storage_service.dart';
import 'screens/candling_camera_screen.dart';
import 'screens/dashboard_stats_screen.dart';
import 'screens/dataset_history_screen.dart';
import 'screens/model_tuning_screen.dart';

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
      title: 'Sistem Grading Telur AI',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        primaryColor: Colors.redAccent,
        scaffoldBackgroundColor: const Color(0xFF0F0F12),
        colorScheme: const ColorScheme.dark(
          primary: Colors.redAccent,
          secondary: Colors.cyanAccent,
        ),
      ),
      home: const MainNavigationShell(),
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({Key? key}) : super(key: key);

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;
  List<EggInspection> _inspections = [];
  TuningConfig _tuningConfig = TuningConfig();
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadInitialState();
  }

  Future<void> _loadInitialState() async {
    final list = await DatasetStorageService.loadInspections();
    final config = await DatasetStorageService.loadTuningConfig();
    setState(() {
      _inspections = list;
      _tuningConfig = config;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFF0F0F12),
        body: Center(
          child: CircularProgressIndicator(color: Colors.redAccent),
        ),
      );
    }

    final pages = [
      // 1. Layar Kamera Candling Real-Time
      CandlingCameraScreen(
        cameras: _cameras,
        geminiApiKey: const String.fromEnvironment('GEMINI_API_KEY', defaultValue: ''),
      ),
      // 2. Dasbor Statistik & Grafik
      DashboardStatsScreen(inspections: _inspections),
      // 3. Riwayat Dataset & Ground Truth
      DatasetHistoryScreen(
        inspections: _inspections,
        onUpdate: (updated) => setState(() => _inspections = updated),
      ),
      // 4. Model Tuning & Ambang Kalibrasi
      ModelTuningScreen(
        config: _tuningConfig,
        onSave: (updated) => setState(() => _tuningConfig = updated),
      ),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: pages,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (idx) => setState(() => _currentIndex = idx),
        backgroundColor: const Color(0xFF16161D),
        selectedItemColor: Colors.redAccent,
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
        selectedFontSize: 11,
        unselectedFontSize: 11,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.camera_alt),
            label: 'Candling',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.bar_chart),
            label: 'Dasbor',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.inventory_2),
            label: 'Dataset',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.tune),
            label: 'Tuning',
          ),
        ],
      ),
    );
  }
}
