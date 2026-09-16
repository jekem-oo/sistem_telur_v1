import 'package:flutter/material.dart';
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
                  '${widget.inspection.confidence.toStringAsFixed(1)}% Cocok',
                  style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          Row(
            children: [
              Expanded(
                child: _buildMetricTile(
                  'Kantung Udara',
                  '${widget.inspection.airCellDepthMm.toStringAsFixed(1)} mm',
                  widget.inspection.airCellDepthMm <= 3.5 ? Colors.green : Colors.amber,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildMetricTile(
                  'Indeks Segar',
                  '${widget.inspection.freshnessScore}/100',
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
                          : 'Cacat terdeteksi: ${widget.inspection.defects.join(", ")}',
                      style: const TextStyle(color: Colors.white, fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),

          const SizedBox(height: 16),

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
