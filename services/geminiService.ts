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

export const chatWithData = async (query: string, employees: Employee[], currentUser?: Employee | null) => {
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) return "API Key missing.";
    
        const ai = new GoogleGenAI({ apiKey });
        const model = "gemini-3-flash-preview";

        // 1. Find specific employees mentioned in the query (Search logic)
        const lowerQuery = query.toLowerCase();
        
        // Search by Name or NIP
        const nameNipMatches = employees.filter(e => 
            (e.nama && lowerQuery.includes(e.nama.toLowerCase())) || 
            (e.nip && lowerQuery.includes(e.nip.toLowerCase()))
        ).slice(0, 10);

        // Search by Month if mentioned
        const months = ["januari", "februari", "maret", "april", "mei", "juni", "juli", "agustus", "september", "oktober", "november", "desember"];
        const monthShorts = ["jan", "feb", "mar", "apr", "mei", "jun", "jul", "agt", "sep", "okt", "nov", "des"];
        let mentionedMonthIdx = -1;
        months.forEach((m, i) => { if(lowerQuery.includes(m)) mentionedMonthIdx = i; });
        if(mentionedMonthIdx === -1) {
            monthShorts.forEach((m, i) => { if(lowerQuery.includes(m)) mentionedMonthIdx = i; });
        }

        const monthMatches = mentionedMonthIdx !== -1 ? employees.filter(e => {
            const parts = e.tmt.split(/[-/]/);
            if (parts.length < 2) return false;
            const m = parseInt(parts[1]);
            return m === mentionedMonthIdx + 1;
        }).slice(0, 15) : [];

        // 2. Summarize a sample of data for general context
        const sampleEmployees = employees.slice(0, 10);
        
        // Combine unique employees (name/nip matches + month matches + sample)
        // Use a Map to ensure uniqueness by ID
        const contextMap = new Map<string, Employee>();
        [...nameNipMatches, ...monthMatches, ...sampleEmployees].forEach(e => contextMap.set(e.id, e));
        const combinedEmployees = Array.from(contextMap.values());
        
        const summary = combinedEmployees.map(e => `- ${e.nama} (NIP: ${e.nip}, ${e.pangkat}): TMT ${e.tmt}, MK: ${e.masaKerja}, Gaji Baru: ${formatCurrency(e.gajiBaru)}`).join('\n');
        
        const stats = {
            total: employees.length,
            totalIncrease: employees.reduce((acc, curr) => acc + (curr.gajiBaru - curr.gajiLama), 0)
        };

        const personalContext = currentUser ? `
            DATA USER SAAT INI (ORANG YANG BERTANYA):
            Nama: ${currentUser.nama}
            NIP: ${currentUser.nip}
            Pangkat/Golongan: ${currentUser.pangkat}
            Status: ${currentUser.statusKepegawaian}
            TMT KGB Berikutnya: ${currentUser.tmt}
            Masa Kerja saat ini: ${currentUser.masaKerja}
            Gaji Lama: ${formatCurrency(currentUser.gajiLama)}
            Gaji Baru: ${formatCurrency(currentUser.gajiBaru)}
        ` : "User belum login atau data tidak ditemukan.";

        const context = `
            Peran: Kamu adalah "Asisten Ahli KGB (Kenaikan Gaji Berkala)".
            
            PENGETAHUAN PERATURAN KGB:
            1. KGB diberikan setiap 2 TAHUN SEKALI jika memenuhi syarat (Penilaian kinerja minimal 'Baik').
            2. Dasar Hukum: PP No. 7 Tahun 1977 (PNS) dan Peraturan Presiden No. 98 Tahun 2020 (PPPK).
            3. Syarat Pengajuan: 
               - Fotokopi SK Pangkat Terakhir.
               - Fotokopi SK KGB Terakhir.
               - Penilaian Kinerja (SKP) 2 tahun terakhir bernilai baik.
            4. Perhitungan Masa Kerja: KGB dihitung berdasarkan masa kerja golongan (MKG). Setiap 2 tahun MKG bertambah, gaji naik satu tingkat dalam tabel gaji sesuai golongan.
            5. Jika TMT KGB sudah lewat tapi belum diproses, statusnya adalah "Overdue/Terlambat".

            ATURAN JAWABAN:
            1. Jika user bertanya "kapan kgb saya" atau sejenisnya, gunakan DATA USER SAAT INI.
            2. Jawab dengan ramah, profesional namun tetap bersahabat.
            3. JANGAN gunakan markdown (tanda bintang ** dilarang). Gunakan teks biasa.
            4. Gunakan emoji secukupnya.
            5. Jika ditanya perhitungan masa kerja, jelaskan bahwa KGB naik setiap 2 tahun masa kerja golongan.

            ${personalContext}

            Data Pegawai Terkait/Sampel (Gunakan data ini untuk menjawab pertanyaan tentang orang lain):
            ${summary}
            
            Statistik Global:
            Total Pegawai: ${stats.total}
            Total Kenaikan Gaji: ${formatCurrency(stats.totalIncrease)}

            Pertanyaan User: "${query}"

            Panduan Jawaban:
            - Jika bertanya tentang dirinya sendiri, sebutkan namanya dan tanggal TMT-nya.
            - Jika bertanya tentang orang lain, cari namanya di daftar "Data Pegawai Terkait/Sampel" di atas.
            - Jika bertanya tentang aturan, berikan penjelasan singkat berdasarkan pengetahuan di atas.
            - Jika data tidak ada di daftar, katakan bahwa data tersebut tidak ditemukan di sistem saat ini dan arahkan untuk menghubungi admin.
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