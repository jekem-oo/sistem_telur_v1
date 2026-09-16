import 'dart:convert';
import 'dart:io';
import 'package:google_generative_ai/google_generative_ai.dart';
import '../models/egg_inspection.dart';

class GeminiClassifierService {
  final GenerativeModel _model;

  GeminiClassifierService({required String apiKey})
      : _model = GenerativeModel(
          model: 'gemini-1.5-flash',
          apiKey: apiKey,
          generationConfig: GenerationConfig(
            responseMimeType: 'application/json',
            temperature: 0.1,
          ),
          systemInstruction: Content.system('''
Anda adalah sistem inspeksi kualitas telur ovoscopy sinar merah (panjang gelombang 630-660nm) berstandar SNI 3926:2008 & USDA.

Kaidah Klasifikasi Sinar Merah:
1. Grade A: Kantung udara kedalaman <= 3.5mm, cangkang utuh mulus, kuning telur di tengah, transmisi cahaya merah merata & jernih.
2. Grade B: Kantung udara kedalaman 3.5 - 6.0mm, cangkang utuh, kuning telur agak bergerak, layak konsumsi reguler.
3. Grade C: Kantung udara kedalaman 6.0 - 9.0mm, kuning telur bergerak bebas, peruntukan industri/bakery.
4. Grade D (AFKIR/REJECT): MUTLAK ditugaskan jika telur memiliki retak rambut (hairline crack), noda darah (blood spot), embrio mati (blood ring), cangkang pecah/bocor, kantung udara > 9.0mm, atau busuk. SELAIN kriteria Grade A, B, dan C, status MUTLAK adalah Grade D.

Wajib kembalikan format JSON:
{
  "grade": "Grade A" | "Grade B" | "Grade C" | "Grade D",
  "confidence": number (persentase 0-100),
  "airCellDepthMm": number (dalam mm),
  "freshnessScore": number (skor 0-100),
  "hasHairlineCrack": boolean,
  "hasBloodSpot": boolean,
  "yolkCentering": "Tengah" | "Agak Pinggir" | "Menempel Dinding",
  "defects": ["string nama cacat jika ada"],
  "recommendation": "string saran distribusi/penanganan"
}
'''),
        );

  Future<EggInspection> classifyImageFile(File file) async {
    final imageBytes = await file.readAsBytes();

    final prompt = TextPart(
      'Analisis citra candling telur ini. Deteksi kedalaman kantung udara, posisi kuning telur, retakan cangkang, dan tetapkan mutunya.'
    );

    final response = await _model.generateContent([
      Content.multi([
        prompt,
        DataPart('image/jpeg', imageBytes),
      ]),
    ]);

    final rawJson = response.text ?? '{}';
    final parsed = jsonDecode(rawJson) as Map<String, dynamic>;

    String rawGrade = (parsed['grade'] ?? 'Grade D').toString();
    EggGrade grade = EggGrade.gradeD;
    if (rawGrade == 'Grade A') grade = EggGrade.gradeA;
    else if (rawGrade == 'Grade B') grade = EggGrade.gradeB;
    else if (rawGrade == 'Grade C') grade = EggGrade.gradeC;

    final double airCell = (parsed['airCellDepthMm'] as num?)?.toDouble() ?? 4.0;
    final bool hasCrack = parsed['hasHairlineCrack'] == true;
    final bool hasBlood = parsed['hasBloodSpot'] == true;

    if (hasCrack || hasBlood || airCell > 9.0) {
      grade = EggGrade.gradeD;
    }

    return EggInspection(
      id: 'EGG-${DateTime.now().millisecondsSinceEpoch}',
      timestamp: DateTime.now(),
      imagePath: file.path,
      grade: grade,
      confidence: (parsed['confidence'] as num?)?.toDouble() ?? 92.5,
      airCellDepthMm: airCell,
      freshnessScore: (parsed['freshnessScore'] as num?)?.toInt() ?? 80,
      hasHairlineCrack: hasCrack,
      hasBloodSpot: hasBlood,
      yolkCentering: parsed['yolkCentering'] ?? 'Tengah',
      defects: List<String>.from(parsed['defects'] ?? []),
      recommendation: parsed['recommendation'] ?? 'Simpan pada suhu 4-7°C.',
    );
  }
}
