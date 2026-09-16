class TuningConfig {
  double gradeAMaxAirCellMm;
  double gradeBMaxAirCellMm;
  double gradeCMaxAirCellMm;
  int minFreshnessGradeA;
  int minFreshnessGradeB;
  bool strictRejectCracks;
  bool strictRejectBlood;
  double redLightThreshold;

  TuningConfig({
    this.gradeAMaxAirCellMm = 3.5,
    this.gradeBMaxAirCellMm = 6.0,
    this.gradeCMaxAirCellMm = 9.0,
    this.minFreshnessGradeA = 85,
    this.minFreshnessGradeB = 65,
    this.strictRejectCracks = true,
    this.strictRejectBlood = true,
    this.redLightThreshold = 0.65,
  });

  Map<String, dynamic> toMap() {
    return {
      'gradeAMaxAirCellMm': gradeAMaxAirCellMm,
      'gradeBMaxAirCellMm': gradeBMaxAirCellMm,
      'gradeCMaxAirCellMm': gradeCMaxAirCellMm,
      'minFreshnessGradeA': minFreshnessGradeA,
      'minFreshnessGradeB': minFreshnessGradeB,
      'strictRejectCracks': strictRejectCracks,
      'strictRejectBlood': strictRejectBlood,
      'redLightThreshold': redLightThreshold,
    };
  }

  factory TuningConfig.fromMap(Map<String, dynamic> map) {
    return TuningConfig(
      gradeAMaxAirCellMm: (map['gradeAMaxAirCellMm'] as num?)?.toDouble() ?? 3.5,
      gradeBMaxAirCellMm: (map['gradeBMaxAirCellMm'] as num?)?.toDouble() ?? 6.0,
      gradeCMaxAirCellMm: (map['gradeCMaxAirCellMm'] as num?)?.toDouble() ?? 9.0,
      minFreshnessGradeA: (map['minFreshnessGradeA'] as num?)?.toInt() ?? 85,
      minFreshnessGradeB: (map['minFreshnessGradeB'] as num?)?.toInt() ?? 65,
      strictRejectCracks: map['strictRejectCracks'] ?? true,
      strictRejectBlood: map['strictRejectBlood'] ?? true,
      redLightThreshold: (map['redLightThreshold'] as num?)?.toDouble() ?? 0.65,
    );
  }
}
