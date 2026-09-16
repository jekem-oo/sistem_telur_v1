import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../models/egg_inspection.dart';

class DashboardStatsScreen extends StatelessWidget {
  final List<EggInspection> inspections;

  const DashboardStatsScreen({Key? key, required this.inspections}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final total = inspections.length;
    final countA = inspections.where((e) => e.grade == EggGrade.gradeA).length;
    final countB = inspections.where((e) => e.grade == EggGrade.gradeB).length;
    final countC = inspections.where((e) => e.grade == EggGrade.gradeC).length;
    final countD = inspections.where((e) => e.grade == EggGrade.gradeD).length;

    final avgFreshness = total == 0
        ? 0.0
        : (inspections.map((e) => e.freshnessScore).reduce((a, b) => a + b) / total);

    final avgAirCell = total == 0
        ? 0.0
        : (inspections.map((e) => e.airCellDepthMm).reduce((a, b) => a + b) / total);

    return Scaffold(
      backgroundColor: const Color(0xFF0F0F12),
      appBar: AppBar(
        backgroundColor: const Color(0xFF16161D),
        title: const Text('Dasbor Mutu & Statistik Telur', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Row 4 Kartu KPI
            Row(
              children: [
                _buildKpiCard('Total Telur', '$total butir', Icons.egg, Colors.white),
                const SizedBox(width: 8),
                _buildKpiCard('Rerata Segar', '${avgFreshness.toStringAsFixed(1)}/100', Icons.eco, Colors.greenAccent),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                _buildKpiCard('Kantung Udara', '${avgAirCell.toStringAsFixed(1)} mm', Icons.compress, Colors.cyanAccent),
                const SizedBox(width: 8),
                _buildKpiCard('Afkir / Reject', '$countD butir', Icons.cancel_outlined, Colors.redAccent),
              ],
            ),

            const SizedBox(height: 24),
            const Text(
              'Distribusi Mutu Grading (SNI 3926:2008)',
              style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),

            // Pie Chart Fl_chart
            Container(
              height: 220,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF16161D),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white10),
              ),
              child: total == 0
                  ? const Center(child: Text('Belum ada data inspeksi', style: TextStyle(color: Colors.grey)))
                  : PieChart(
                      PieChartData(
                        sectionsSpace: 3,
                        centerSpaceRadius: 40,
                        sections: [
                          if (countA > 0)
                            PieChartSectionData(
                              value: countA.toDouble(),
                              color: Colors.greenAccent[700],
                              title: 'Grade A\n$countA',
                              radius: 50,
                              titleStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                          if (countB > 0)
                            PieChartSectionData(
                              value: countB.toDouble(),
                              color: Colors.blueAccent[700],
                              title: 'Grade B\n$countB',
                              radius: 50,
                              titleStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                          if (countC > 0)
                            PieChartSectionData(
                              value: countC.toDouble(),
                              color: Colors.orangeAccent[700],
                              title: 'Grade C\n$countC',
                              radius: 50,
                              titleStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                          if (countD > 0)
                            PieChartSectionData(
                              value: countD.toDouble(),
                              color: Colors.redAccent[700],
                              title: 'Grade D\n$countD',
                              radius: 50,
                              titleStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                        ],
                      ),
                    ),
            ),

            const SizedBox(height: 24),
            const Text(
              'Rincian Mutu per Kategori',
              style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            _buildGradeSummaryTile('Grade A (Sangat Segar)', countA, total, Colors.greenAccent[700]!, '<= 3.5mm kantung udara, yolk sentris'),
            _buildGradeSummaryTile('Grade B (Segar/Konsumsi)', countB, total, Colors.blueAccent[700]!, '3.5 - 6.0mm kantung udara'),
            _buildGradeSummaryTile('Grade C (Industri/Bakery)', countC, total, Colors.orangeAccent[700]!, '6.0 - 9.0mm kantung udara'),
            _buildGradeSummaryTile('Grade D (Afkir / Reject)', countD, total, Colors.redAccent[700]!, 'Retak rambut, darah, >9.0mm (MUTLAK)'),
          ],
        ),
      ),
    );
  }

  Widget _buildKpiCard(String title, String value, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFF16161D),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.white10),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: const TextStyle(color: Colors.grey, fontSize: 11)),
                Icon(icon, size: 16, color: color),
              ],
            ),
            const SizedBox(height: 8),
            Text(value, style: TextStyle(color: color, fontSize: 18, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildGradeSummaryTile(String label, int count, int total, Color color, String desc) {
    final pct = total > 0 ? (count / total * 100).toStringAsFixed(1) : '0';
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF16161D),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white10),
      ),
      child: Row(
        children: [
          Container(width: 10, height: 38, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(4))),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                Text(desc, style: const TextStyle(color: Colors.grey, fontSize: 10)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('$count butir', style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.bold)),
              Text('$pct%', style: const TextStyle(color: Colors.grey, fontSize: 10)),
            ],
          ),
        ],
      ),
    );
  }
}
