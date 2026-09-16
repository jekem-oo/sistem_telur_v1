import 'dart:convert';

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
