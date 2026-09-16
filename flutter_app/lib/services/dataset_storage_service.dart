import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/egg_inspection.dart';
import '../models/tuning_config.dart';

class DatasetStorageService {
  static const String _keyHistory = 'egg_inspections_history_v1';
  static const String _keyTuning = 'egg_tuning_config_v1';

  static Future<List<EggInspection>> loadInspections() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_keyHistory);
    if (raw == null || raw.isEmpty) {
      return _generateInitialDummyData();
    }
    try {
      final List decoded = jsonDecode(raw);
      return decoded.map((item) => EggInspection.fromMap(item as Map<String, dynamic>)).toList();
    } catch (e) {
      return _generateInitialDummyData();
    }
  }

  static Future<void> saveInspections(List<EggInspection> list) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = jsonEncode(list.map((e) => e.toMap()).toList());
    await prefs.setString(_keyHistory, raw);
  }

  static Future<TuningConfig> loadTuningConfig() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_keyTuning);
    if (raw == null) return TuningConfig();
    try {
      return TuningConfig.fromMap(jsonDecode(raw));
    } catch (_) {
      return TuningConfig();
    }
  }

  static Future<void> saveTuningConfig(TuningConfig config) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyTuning, jsonEncode(config.toMap()));
  }

  static String generateCsv(List<EggInspection> list) {
    final buffer = StringBuffer();
    buffer.writeln('ID,Timestamp,Grade,Confidence,AirCellMm,FreshnessScore,HasCrack,HasBlood,YolkCentering,Defects,Recommendation,Verified');
    for (final e in list) {
      buffer.writeln('\${e.id},\${e.timestamp.toIso8601String()},\${e.grade.shortLabel},\${e.confidence},\${e.airCellDepthMm},\${e.freshnessScore},\${e.hasHairlineCrack},\${e.hasBloodSpot},"\${e.yolkCentering}","\${e.defects.join("; ")}","\${e.recommendation}",\${e.isGroundTruthVerified}');
    }
    return buffer.toString();
  }

  static List<EggInspection> _generateInitialDummyData() {
    return [
      EggInspection(
        id: 'EGG-001',
        timestamp: DateTime.now().subtract(const Duration(hours: 1)),
        imagePath: '',
        grade: EggGrade.gradeA,
        confidence: 96.8,
        airCellDepthMm: 2.8,
        freshnessScore: 94,
        hasHairlineCrack: false,
        hasBloodSpot: false,
        yolkCentering: 'Tengah',
        defects: [],
        recommendation: 'Kualitas istimewa, sangat cocok untuk konsumsi segar.',
        isGroundTruthVerified: true,
      ),
      EggInspection(
        id: 'EGG-002',
        timestamp: DateTime.now().subtract(const Duration(hours: 3)),
        imagePath: '',
        grade: EggGrade.gradeB,
        confidence: 91.2,
        airCellDepthMm: 4.8,
        freshnessScore: 78,
        hasHairlineCrack: false,
        hasBloodSpot: false,
        yolkCentering: 'Agak Pinggir',
        defects: [],
        recommendation: 'Kualitas standar konsumsi supermarket / rumah tangga.',
        isGroundTruthVerified: false,
      ),
      EggInspection(
        id: 'EGG-003',
        timestamp: DateTime.now().subtract(const Duration(hours: 5)),
        imagePath: '',
        grade: EggGrade.gradeD,
        confidence: 98.4,
        airCellDepthMm: 3.2,
        freshnessScore: 40,
        hasHairlineCrack: true,
        hasBloodSpot: false,
        yolkCentering: 'Tengah',
        defects: ['Hairline crack mikro pada kutikula cangkang'],
        recommendation: 'MUTLAK AFKIR: Retak rambut dapat menyebabkan kontaminasi bakteri.',
        isGroundTruthVerified: true,
      ),
      EggInspection(
        id: 'EGG-004',
        timestamp: DateTime.now().subtract(const Duration(hours: 8)),
        imagePath: '',
        grade: EggGrade.gradeC,
        confidence: 88.0,
        airCellDepthMm: 7.2,
        freshnessScore: 58,
        hasHairlineCrack: false,
        hasBloodSpot: false,
        yolkCentering: 'Menempel Dinding',
        defects: ['Kantung udara melebar'],
        recommendation: 'Arahkan ke pabrik pengolahan bakery atau pakan.',
        isGroundTruthVerified: false,
      ),
    ];
  }
}
