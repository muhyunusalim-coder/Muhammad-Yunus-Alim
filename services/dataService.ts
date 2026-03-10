
import { Employee } from '../types';
import { CSV_EXPORT_URL, MOCK_EMPLOYEES } from '../constants';

// Helper to determine status based on Golongan logic
const determineStatusKepegawaian = (pangkat: string): 'PNS' | 'PPPK' | '-' => {
  const p = pangkat.toUpperCase();
  
  // Logic: PPPK = Golongan V - XII (Roman Numerals)
  // Check specifically for PPPK numbers first to avoid confusion
  // Matches: V, VI, VII, VIII, IX, X, XI, XII surrounded by word boundaries, slashes, or parens
  const pppkRegex = /(^|[\s(\/])(V|VI|VII|VIII|IX|X|XI|XII)($|[\s)\/])/;
  
  // Logic: PNS = Golongan I - IV
  // Matches: I, II, III, IV usually followed by slash (e.g., III/a) or just the roman numeral
  const pnsRegex = /(^|[\s(\/])(I|II|III|IV)($|[\s)\/])/;

  if (pppkRegex.test(p)) {
    return 'PPPK';
  }
  
  if (pnsRegex.test(p)) {
    return 'PNS';
  }

  return '-';
};

const parseCSV = (csvText: string): Employee[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  // Simple CSV parser that handles quotes essentially
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
  
  // Helper to find column index based on priority of keywords.
  const getColIndex = (keywords: string[]) => {
    for (const keyword of keywords) {
      const idx = headers.findIndex(h => h.includes(keyword));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const idxNama = getColIndex(['nama', 'name', 'pegawai']);
  const idxNip = getColIndex(['nip', 'nomor induk']);
  const idxJabatan = getColIndex(['jabatan', 'pekerjaan', 'role', 'position']); 
  const idxPangkat = getColIndex(['pangkat', 'gol', 'golongan']);
  const idxGajiLama = getColIndex(['gaji lama', 'lama', 'old']);
  const idxGajiBaru = getColIndex(['gaji baru', 'baru', 'new']);
  
  // Update: Cari kolom tahun dan bulan terpisah untuk Masa Kerja
  const idxMkThn = getColIndex(['masa kerja tahun', 'mk tahun', 'mk thn', 'mkg tahun', 'mk_thn', 'tahun']);
  const idxMkBln = getColIndex(['masa kerja bulan', 'mk bulan', 'mk bln', 'mkg bulan', 'mk_bln', 'bulan']);
  // Fallback ke kolom gabungan
  const idxMasaKerja = getColIndex(['masa kerja', 'mkg', 'mk', 'years', 'working']); 
  
  // Prioritize "tmt kgb baru" specifically as requested
  const idxTmt = getColIndex(['tmt kgb baru', 'tmt baru', 'tmt', 'tanggal', 'date']);
  
  const idxUnit = getColIndex(['unit', 'kerja', 'skpd']);
  const idxNo = getColIndex(['no', 'nomor']);
  
  // Detect Status Column from DB
  const idxStatus = getColIndex(['status kgb', 'status', 'keterangan', 'ket']);

  return lines.slice(1).map((line, index) => {
    const values: string[] = [];
    let current = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    // Clean values
    const clean = (v: string) => v ? v.replace(/"/g, '').trim() : '';
    
    // Parse currency
    const parseMoney = (v: string) => {
      if (!v) return 0;
      return parseInt(v.replace(/[^0-9]/g, '') || '0', 10);
    };

    const tmtStr = clean(values[idxTmt] || '');
    const rawStatus = clean(values[idxStatus] || '');
    const normalizedStatus = rawStatus.toLowerCase();
    const pangkatStr = clean(values[idxPangkat] || '-');

    // Determine status logic
    let appStatus: 'Pending' | 'Processed' | 'Upcoming' = 'Upcoming';

    if (normalizedStatus.match(/sudah|selesai|terbit|sk|ok|done/)) {
        appStatus = 'Processed';
    } else {
        // Updated Logic: 
        // We do NOT automatically set status to 'Processed' if the date is past.
        // We let the frontend display "Overdue" (Lewat X Hari) based on TMT calculation
        // unless the database explicitly says it's done.
        appStatus = 'Upcoming';
    }

    // Update: Construct Masa Kerja String dengan Bulan
    let mkFinal = '-';
    // 1. Coba ambil dari kolom terpisah (Tahun & Bulan)
    if (idxMkThn !== -1 && idxMkBln !== -1) {
        const thn = clean(values[idxMkThn]);
        const bln = clean(values[idxMkBln]);
        if (thn || bln) {
             mkFinal = `${thn || '0'} Tahun ${bln || '0'} Bulan`;
        }
    } 
    
    // 2. Fallback ke kolom gabungan jika hasil di atas masih default atau kolom tidak ditemukan
    if (mkFinal === '-' && idxMasaKerja !== -1) {
        mkFinal = clean(values[idxMasaKerja] || '-');
    }

    // Mock salary history for demonstration
    const salaryHistory = [
      { date: '2022-03-01', amount: parseMoney(clean(values[idxGajiLama])) - 100000, description: 'KGB 2022' },
      { date: '2024-03-01', amount: parseMoney(clean(values[idxGajiLama])), description: 'KGB 2024' }
    ];

    return {
      id: `emp-${index}-${Date.now()}`,
      no: clean(values[idxNo] || (index + 1).toString()),
      nama: clean(values[idxNama] || 'Tanpa Nama'),
      nip: clean(values[idxNip] || '-'),
      jabatan: clean(values[idxJabatan] || '-'),
      pangkat: pangkatStr,
      statusKepegawaian: determineStatusKepegawaian(pangkatStr),
      masaKerja: mkFinal, 
      gajiLama: parseMoney(clean(values[idxGajiLama])),
      gajiBaru: parseMoney(clean(values[idxGajiBaru])),
      tmt: tmtStr || '-',
      unitKerja: clean(values[idxUnit] || '-'),
      status: appStatus,
      statusKeterangan: rawStatus,
      salaryHistory: salaryHistory
    };
  });
};

const mapMockData = (mock: any[]): Employee[] => {
  return mock.map((m, i) => {
    const rawStatus = m["Status KGB"] || m["Status"] || "";
    const normalizedStatus = rawStatus.toLowerCase();
    
    let appStatus: 'Pending' | 'Processed' | 'Upcoming' = 'Upcoming';
    
    if (normalizedStatus.match(/sudah|selesai|terbit|sk|ok/)) {
        appStatus = 'Processed';
    } else {
        appStatus = 'Upcoming';
    }

    // Check for separate columns in mock or fallback
    let mk = m["Masa Kerja"] || '-';
    // If mock data has separate keys (future proofing)
    if (m["MK Tahun"] !== undefined || m["MK Bulan"] !== undefined) {
         mk = `${m["MK Tahun"] || 0} Tahun ${m["MK Bulan"] || 0} Bulan`;
    }

    const pangkatStr = m.Pangkat || '-';

    // Mock salary history for demonstration
    const salaryHistory = [
      { date: '2022-03-01', amount: parseInt(m["Gaji Lama"]) - 100000, description: 'KGB 2022' },
      { date: '2024-03-01', amount: parseInt(m["Gaji Lama"]), description: 'KGB 2024' }
    ];

    return {
        id: `mock-${i}`,
        no: m.No,
        nama: m.Nama,
        nip: m.NIP,
        jabatan: m.Jabatan || '-', 
        pangkat: pangkatStr,
        statusKepegawaian: determineStatusKepegawaian(pangkatStr),
        gajiLama: parseInt(m["Gaji Lama"]),
        gajiBaru: parseInt(m["Gaji Baru"]),
        masaKerja: mk,
        tmt: m["TMT KGB Baru"] || m["TMT"], 
        unitKerja: m["Unit Kerja"],
        status: appStatus,
        statusKeterangan: rawStatus,
        salaryHistory: salaryHistory
    };
  });
};

export const fetchEmployeeData = async (): Promise<Employee[]> => {
  try {
    const response = await fetch(CSV_EXPORT_URL);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const text = await response.text();
    const parsed = parseCSV(text);
    if (parsed.length === 0) throw new Error("Empty CSV");
    return parsed;
  } catch (error) {
    console.warn("Failed to fetch live data from Google Sheets. Loading mock data.", error);
    return mapMockData(MOCK_EMPLOYEES);
  }
};
