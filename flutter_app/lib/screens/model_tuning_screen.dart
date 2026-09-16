import 'package:flutter/material.dart';
import '../models/tuning_config.dart';
import '../services/dataset_storage_service.dart';

class ModelTuningScreen extends StatefulWidget {
  final TuningConfig config;
  final Function(TuningConfig) onSave;

  const ModelTuningScreen({
    Key? key,
    required this.config,
    required this.onSave,
  }) : super(key: key);

  @override
  State<ModelTuningScreen> createState() => _ModelTuningScreenState();
}

class _ModelTuningScreenState extends State<ModelTuningScreen> {
  late double _gradeA;
  late double _gradeB;
  late double _gradeC;
  late bool _strictCracks;
  late bool _strictBlood;
  late double _redThreshold;

  @override
  void initState() {
    super.initState();
    _gradeA = widget.config.gradeAMaxAirCellMm;
    _gradeB = widget.config.gradeBMaxAirCellMm;
    _gradeC = widget.config.gradeCMaxAirCellMm;
    _strictCracks = widget.config.strictRejectCracks;
    _strictBlood = widget.config.strictRejectBlood;
    _redThreshold = widget.config.redLightThreshold;
  }

  void _save() {
    final updated = TuningConfig(
      gradeAMaxAirCellMm: _gradeA,
      gradeBMaxAirCellMm: _gradeB,
      gradeCMaxAirCellMm: _gradeC,
      strictRejectCracks: _strictCracks,
      strictRejectBlood: _strictBlood,
      redLightThreshold: _redThreshold,
    );
    widget.onSave(updated);
    DatasetStorageService.saveTuningConfig(updated);
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F12),
      appBar: AppBar(
        backgroundColor: const Color(0xFF16161D),
        title: const Text('Kalibrasi Ambang & Model Tuning', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.check, color: Colors.greenAccent),
            tooltip: 'Simpan Konfigurasi',
            onPressed: _save,
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Ambang Batas Kedalaman Kantung Udara (SNI 3926:2008)',
            style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),

          _buildSliderTile('Maks. Kantung Udara Grade A', '$_gradeA mm', _gradeA, 1.0, 5.0, (v) => setState(() => _gradeA = double.parse(v.toStringAsFixed(1)))),
          _buildSliderTile('Maks. Kantung Udara Grade B', '$_gradeB mm', _gradeB, 3.5, 7.5, (v) => setState(() => _gradeB = double.parse(v.toStringAsFixed(1)))),
          _buildSliderTile('Maks. Kantung Udara Grade C', '$_gradeC mm', _gradeC, 6.0, 11.0, (v) => setState(() => _gradeC = double.parse(v.toStringAsFixed(1)))),

          const SizedBox(height: 20),
          const Text(
            'Aturan Penegasan Mutlak Grade D (Afkir/Reject)',
            style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),

          SwitchListTile(
            title: const Text('Tolak Mutlak Retak Rambut (Hairline Crack)', style: TextStyle(color: Colors.white, fontSize: 12)),
            subtitle: const Text('Otomatis Grade D jika ditemukan retak mikro', style: TextStyle(color: Colors.grey, fontSize: 10)),
            value: _strictCracks,
            activeColor: Colors.redAccent,
            onChanged: (v) => setState(() => _strictCracks = v),
          ),
          SwitchListTile(
            title: const Text('Tolak Mutlak Noda Darah / Bintik Daging', style: TextStyle(color: Colors.white, fontSize: 12)),
            subtitle: const Text('Otomatis Grade D jika ada bayangan darah', style: TextStyle(color: Colors.grey, fontSize: 10)),
            value: _strictBlood,
            activeColor: Colors.redAccent,
            onChanged: (v) => setState(() => _strictBlood = v),
          ),

          const SizedBox(height: 24),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.redAccent,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            icon: const Icon(Icons.save, color: Colors.white),
            label: const Text('Terapkan Ambang Kalibrasi', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            onPressed: _save,
          ),
        ],
      ),
    );
  }

  Widget _buildSliderTile(String title, String valStr, double value, double min, double max, Function(double) onChanged) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF16161D),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(color: Colors.white70, fontSize: 12)),
              Text(valStr, style: const TextStyle(color: Colors.cyanAccent, fontSize: 12, fontWeight: FontWeight.bold)),
            ],
          ),
          Slider(
            value: value,
            min: min,
            max: max,
            activeColor: Colors.cyanAccent,
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }
}
