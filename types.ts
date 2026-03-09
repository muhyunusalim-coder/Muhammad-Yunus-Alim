export interface Employee {
  id: string;
  no: string;
  nama: string;
  nip: string;
  jabatan: string;
  pangkat: string;
  statusKepegawaian: 'PNS' | 'PPPK' | '-'; // Field baru
  gajiLama: number;
  gajiBaru: number;
  masaKerja: string; 
  tmt: string; 
  unitKerja: string;
  status: 'Pending' | 'Processed' | 'Upcoming';
  statusKeterangan?: string; 
}

export interface DashboardStats {
  totalEmployees: number;
  upcomingKGB: number;
  processedKGB: number;
}

export interface ChartData {
  name: string;
  value: number;
}