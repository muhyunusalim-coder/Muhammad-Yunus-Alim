import { GoogleGenAI } from "@google/genai";
import { Employee } from "../types";

// Helper to get formatting right
const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);

export const analyzeEmployeeKGB = async (employee: Employee, promptType: 'draft_sk' | 'analysis') => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key not found");

    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-3-flash-preview";

    let userPrompt = "";
    
    if (promptType === 'draft_sk') {
      userPrompt = `
        Buatkan draft surat resmi pemberitahuan Kenaikan Gaji Berkala (KGB) untuk pegawai berikut.
        Gunakan bahasa Indonesia baku, format surat dinas resmi. HIndari penggunaan markdown bold (**).
        
        Data Pegawai:
        Nama: ${employee.nama}
        NIP: ${employee.nip}
        Pangkat/Golongan: ${employee.pangkat}
        Unit Kerja: ${employee.unitKerja}
        
        Rincian KGB:
        Gaji Lama: ${formatCurrency(employee.gajiLama)}
        Gaji Baru: ${formatCurrency(employee.gajiBaru)}
        TMT (Terhitung Mulai Tanggal): ${employee.tmt}
        
        Surat ditujukan kepada Kepala ${employee.unitKerja}.
        Sertakan bagian 'Menimbang', 'Mengingat' (UU ASN terbaru), dan 'Memutuskan'.
      `;
    } else {
      userPrompt = `
        Analisis data kenaikan gaji untuk pegawai ini:
        Nama: ${employee.nama}
        Golongan: ${employee.pangkat}
        Kenaikan: Dari ${formatCurrency(employee.gajiLama)} menjadi ${formatCurrency(employee.gajiBaru)}
        
        Berikan insight sangat singkat (1-2 kalimat) dengan bahasa santai mengenai kenaikan ini.
        JANGAN gunakan formatting markdown seperti tanda bintang (**). Gunakan teks biasa.
      `;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: userPrompt,
    });

    return response.text;

  } catch (error) {
    console.error("Gemini Error:", error);
    return "Maaf, layanan AI sedang tidak tersedia saat ini. Pastikan API Key valid.";
  }
};

export const chatWithData = async (query: string, employees: Employee[]) => {
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) return "Aduh, maaf ya, kunci akses AI-nya belum terpasang nih. Hubungi admin ya! 🙏";
    
        const ai = new GoogleGenAI({ apiKey });
        const model = "gemini-3-flash-preview";

        // Provide a more comprehensive summary of the data
        // If the list is very long, we still need to be careful, but let's try to include more or key info
        const employeeList = employees.map(e => `${e.nama} (NIP: ${e.nip}, Pangkat: ${e.pangkat}, Unit: ${e.unitKerja}, TMT: ${e.tmt}, Gaji: ${formatCurrency(e.gajiBaru)})`).join('\n');
        
        const stats = {
            total: employees.length,
            pnsCount: employees.filter(e => e.statusKepegawaian === 'PNS').length,
            pppkCount: employees.filter(e => e.statusKepegawaian === 'PPPK').length,
            totalIncrease: employees.reduce((acc, curr) => acc + (curr.gajiBaru - curr.gajiLama), 0)
        };

        const context = `
            Identitas: Kamu adalah "Kakak KGB", asisten AI yang sangat ramah, hangat, ceria, dan membantu untuk sistem Kenaikan Gaji Berkala (KGB).
            
            Gaya Bahasa:
            - Sangat hangat, sopan, dan bersahabat (seperti rekan kerja yang sangat baik).
            - Gunakan sapaan seperti "Kak", "Bapak", atau "Ibu" jika terasa pas, atau gunakan bahasa "kita".
            - Berikan jawaban yang solutif dan menyemangati.
            - Gunakan emoji agar suasana terasa lebih hidup dan ramah (😊, ✨, 🙌, 💼).

            Tugas Utama:
            - Menjawab pertanyaan seputar data pegawai yang ada di sistem.
            - Memberikan informasi statistik kepegawaian.
            - Membantu menjelaskan jadwal KGB.

            Data Pegawai Lengkap:
            ${employeeList}
            
            Statistik Sistem:
            - Total Pegawai: ${stats.total}
            - Jumlah PNS: ${stats.pnsCount}
            - Jumlah PPPK: ${stats.pppkCount}
            - Total Anggaran Kenaikan Gaji: ${formatCurrency(stats.totalIncrease)}

            Aturan Teknis:
            1. JAWAB DENGAN CEPAT DAN TEPAT.
            2. JANGAN gunakan markdown (tanda bintang ** dilarang). Gunakan teks biasa saja.
            3. Jika data tidak ditemukan, jawab dengan sangat sopan: "Wah, maaf banget ya Kak, data yang dicari belum ketemu di catatan aku. Coba cek lagi di tabel utama atau tanya admin ya! 😊"
            4. Jaga kerahasiaan data sensitif jika dirasa perlu, tapi berikan info umum yang diminta.

            Pertanyaan User: "${query}"
        `;

        const response = await ai.models.generateContent({
            model: model,
            contents: context,
            config: {
                temperature: 0.7,
                topP: 0.95,
                topK: 40
            }
        });

        return response.text;
    } catch (error) {
        console.error("Chat Error:", error);
        return "Aduh, maaf ya Kak, sepertinya aku lagi agak pusing nih (sistem sibuk). Coba tanya lagi sebentar lagi ya! 🙏✨";
    }
}