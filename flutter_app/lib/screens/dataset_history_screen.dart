import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import '../models/egg_inspection.dart';
import '../services/dataset_storage_service.dart';
import '../widgets/inspection_result_sheet.dart';

class DatasetHistoryScreen extends StatefulWidget {
  final List<EggInspection> inspections;
  final Function(List<EggInspection>) onUpdate;

  const DatasetHistoryScreen({
    Key? key,
    required this.inspections,
    required this.onUpdate,
  }) : super(key: key);

  @override
  State<DatasetHistoryScreen> createState() => _DatasetHistoryScreenState();
}

class _DatasetHistoryScreenState extends State<DatasetHistoryScreen> {
  String _filterGrade = 'ALL';

  Color _getGradeColor(EggGrade grade) {
    switch (grade) {
      case EggGrade.gradeA: return Colors.greenAccent[700]!;
      case EggGrade.gradeB: return Colors.blueAccent[700]!;
      case EggGrade.gradeC: return Colors.orangeAccent[700]!;
      case EggGrade.gradeD: return Colors.redAccent[700]!;
    }
  }

  void _exportCsv() {
    final csv = DatasetStorageService.generateCsv(widget.inspections);
    Share.share(csv, subject: 'Dataset_Inspeksi_Telur_Candling.csv');
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _filterGrade == 'ALL'
        ? widget.inspections
        : widget.inspections.where((e) => e.grade.shortLabel == _filterGrade).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0F0F12),
      appBar: AppBar(
        backgroundColor: const Color(0xFF16161D),
        title: const Text('Dataset & Riwayat Inspeksi', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.download, color: Colors.cyanAccent),
            tooltip: 'Ekspor Dataset CSV',
            onPressed: widget.inspections.isEmpty ? null : _exportCsv,
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: const Color(0xFF16161D),
            child: Row(
              children: ['ALL', 'Grade A', 'Grade B', 'Grade C', 'Grade D'].map((label) {
                final isSel = _filterGrade == label;
                return Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: FilterChip(
                    label: Text(label, style: TextStyle(fontSize: 11, color: isSel ? Colors.white : Colors.grey[400])),
                    selected: isSel,
                    selectedColor: Colors.redAccent,
                    backgroundColor: Colors.grey[900],
                    onSelected: (val) => setState(() => _filterGrade = label),
                  ),
                );
              }).toList(),
            ),
          ),

          // Daftar Kartu Inspeksi
          Expanded(
            child: filtered.isEmpty
                ? const Center(child: Text('Tidak ada riwayat inspeksi', style: TextStyle(color: Colors.grey)))
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filtered.length,
                    itemBuilder: (ctx, idx) {
                      final item = filtered[idx];
                      final color = _getGradeColor(item.grade);

                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: const Color(0xFF16161D),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: color.withOpacity(0.3)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: color.withOpacity(0.2),
                                        borderRadius: BorderRadius.circular(6),
                                        border: Border.all(color: color),
                                      ),
                                      child: Text(
                                        item.grade.shortLabel,
                                        style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(item.id, style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                                Row(
                                  children: [
                                    if (item.isGroundTruthVerified)
                                      const Icon(Icons.verified, size: 14, color: Colors.blueAccent),
                                    const SizedBox(width: 4),
                                    Text('${item.confidence.toStringAsFixed(1)}% Cocok', style: const TextStyle(color: Colors.grey, fontSize: 11)),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Row(
                              children: [
                                Text('Kantung Udara: ${item.airCellDepthMm.toStringAsFixed(1)} mm', style: const TextStyle(color: Colors.white70, fontSize: 11)),
                                const SizedBox(width: 12),
                                Text('Skor Segar: ${item.freshnessScore}/100', style: const TextStyle(color: Colors.white70, fontSize: 11)),
                                const SizedBox(width: 12),
                                Text('Yolk: ${item.yolkCentering}', style: const TextStyle(color: Colors.white70, fontSize: 11)),
                              ],
                            ),
                            if (item.defects.isNotEmpty) ...[
                              const SizedBox(height: 6),
                              Text(
                                'Cacat: ${item.defects.join(", ")}',
                                style: const TextStyle(color: Colors.redAccent, fontSize: 11, fontWeight: FontWeight.bold),
                              ),
                            ],
                            const SizedBox(height: 8),
                            Align(
                              alignment: Alignment.centerRight,
                              child: TextButton.icon(
                                style: TextButton.styleFrom(padding: EdgeInsets.zero, visualDensity: VisualDensity.compact),
                                icon: const Icon(Icons.edit_note, size: 14, color: Colors.cyanAccent),
                                label: const Text('Verifikasi Ulang', style: TextStyle(color: Colors.cyanAccent, fontSize: 11)),
                                onPressed: () {
                                  showModalBottomSheet(
                                    context: context,
                                    isScrollControlled: true,
                                    backgroundColor: Colors.transparent,
                                    builder: (c) => InspectionResultSheet(
                                      inspection: item,
                                      onVerifyGroundTruth: (g, n) {
                                        final updatedList = List<EggInspection>.from(widget.inspections);
                                        final i = updatedList.indexWhere((x) => x.id == item.id);
                                        if (i != -1) {
                                          final cur = updatedList[i];
                                          updatedList[i] = EggInspection(
                                            id: cur.id,
                                            timestamp: cur.timestamp,
                                            imagePath: cur.imagePath,
                                            grade: g,
                                            confidence: cur.confidence,
                                            airCellDepthMm: cur.airCellDepthMm,
                                            freshnessScore: cur.freshnessScore,
                                            hasHairlineCrack: cur.hasHairlineCrack,
                                            hasBloodSpot: cur.hasBloodSpot,
                                            yolkCentering: cur.yolkCentering,
                                            defects: cur.defects,
                                            recommendation: cur.recommendation,
                                            isGroundTruthVerified: true,
                                            notes: n,
                                          );
                                          widget.onUpdate(updatedList);
                                          DatasetStorageService.saveInspections(updatedList);
                                          setState(() {});
                                        }
                                      },
                                    ),
                                  );
                                },
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
