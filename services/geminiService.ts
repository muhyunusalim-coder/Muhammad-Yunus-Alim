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
        if (!apiKey) return "API Key missing.";
    
        const ai = new GoogleGenAI({ apiKey });
        const model = "gemini-3-flash-preview";

        // Summarize data for context (limit to avoid token limits if list is huge)
        const summary = employees.slice(0, 30).map(e => `- ${e.nama} (${e.pangkat}): TMT ${e.tmt}`).join('\n');
        const stats = {
            total: employees.length,
            totalIncrease: employees.reduce((acc, curr) => acc + (curr.gajiBaru - curr.gajiLama), 0)
        };

        const context = `
            Peran: Kamu adalah "Asisten Sahabat KGB".
            
            ATURAN UTAMA:
            1. JAWAB DENGAN SINGKAT & PADAT. Usahakan maksimal 2-3 kalimat saja. Langsung ke intinya.
            2. JANGAN gunakan markdown (tanda bintang ** dilarang). Gunakan teks biasa.
            3. Gunakan bahasa Indonesia yang santai, akrab, dan bersahabat (seperti teman kantor).
            4. Gunakan emoji secukupnya (😊, 👍).

            Data Pegawai (Sampel):
            ${summary}
            
            Statistik Global:
            Total Pegawai: ${stats.total}
            Total Kenaikan Gaji: ${formatCurrency(stats.totalIncrease)}

            Pertanyaan User: "${query}"

            Panduan Jawaban:
            - Jika ditanya data spesifik, langsung berikan datanya tanpa pembukaan panjang lebar.
            - Jika data tidak ada di sampel, bilang "Datanya nggak ada di sampel saya nih, coba cek tabel utama ya."
        `;

        const response = await ai.models.generateContent({
            model: model,
            contents: context,
        });

        return response.text;
    } catch (error) {
        return "Waduh, maaf, sistem lagi sibuk banget nih.";
    }
}