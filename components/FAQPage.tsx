
import React, { useState } from 'react';
import { BookOpen, Scale, FileText, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Search, Download, ExternalLink } from 'lucide-react';

const FAQ_ITEMS = [
    {
        question: "Apa itu Kenaikan Gaji Berkala (KGB)?",
        answer: "Kenaikan Gaji Berkala (KGB) adalah kenaikan gaji yang diberikan kepada PNS dan PPPK yang telah mencapai masa kerja golongan yang ditentukan (biasanya setiap 2 tahun sekali) dan memenuhi persyaratan penilaian kinerja yang telah ditetapkan."
    },
    {
        question: "Apa saja syarat utama untuk mendapatkan KGB?",
        answer: "Syarat utama KGB adalah: 1) Telah mencapai masa kerja golongan yang ditentukan (2 tahun sejak pengangkatan atau KGB terakhir), dan 2) Penilaian kinerja pegawai dengan predikat minimal 'Baik' dalam 2 tahun terakhir (sesuai PP No. 30 Tahun 2019)."
    },
    {
        question: "Berapa besaran kenaikan gaji yang diterima?",
        answer: "Besaran kenaikan gaji disesuaikan dengan Tabel Gaji Pokok terbaru (saat ini mengacu pada PP Nomor 5 Tahun 2024 untuk PNS). Kenaikan bukan berupa persentase tetap, melainkan perpindahan ke kolom masa kerja berikutnya dalam golongan ruang yang sama."
    },
    {
        question: "Apa yang terjadi jika penilaian kinerja saya 'Cukup' atau 'Kurang'?",
        answer: "Jika penilaian kinerja tidak memenuhi syarat (minimal 'Baik'), maka KGB dapat ditunda. Penundaan diberikan paling lama 1 (satu) tahun. Jika setelah penundaan kinerja membaik, maka KGB akan diberikan mulai bulan berikutnya."
    },
    {
        question: "Apakah KGB memerlukan SK baru?",
        answer: "Ya, setiap kenaikan gaji berkala harus ditetapkan melalui Surat Pemberitahuan Kenaikan Gaji Berkala (SPKGB) yang diterbitkan oleh pejabat yang berwenang (PPK atau pejabat yang ditunjuk) dan tembusannya disampaikan ke KPPN pembayar gaji."
    },
    {
        question: "Bagaimana jika SK KGB terlambat terbit?",
        answer: "Jika SK KGB terlambat terbit namun TMT (Terhitung Mulai Tanggal) sudah berlaku, maka kekurangan gaji akan dibayarkan secara rapel (gaji susulan) sesuai dengan selisih kenaikan gaji sejak TMT tersebut."
    },
    {
        question: "Apakah PPPK juga mendapatkan KGB?",
        answer: "Ya, berdasarkan Perpres No. 98 Tahun 2020, PPPK yang telah memenuhi masa kerja perjanjian kerja minimal 2 tahun dan predikat kinerja 'Baik' berhak mendapatkan Kenaikan Gaji Berkala sesuai dengan golongan gajinya."
    }
];

const REGULATIONS = [
    {
        title: "PP No. 5 Tahun 2024",
        desc: "Perubahan Kesembilan Belas atas PP No. 7 Tahun 1977 tentang Peraturan Gaji Pegawai Negeri Sipil (Tabel Gaji Terbaru).",
        icon: FileText,
        url: "https://peraturan.bpk.go.id/Download/335286/PP%20Nomor%205%20Tahun%202024.pdf"
    },
    {
        title: "Perpres No. 11 Tahun 2024",
        desc: "Perubahan atas Perpres No. 98 Tahun 2020 tentang Gaji dan Tunjangan PPPK (Tabel Gaji PPPK Terbaru).",
        icon: FileText,
        url: "https://peraturan.bpk.go.id/Download/335287/Salinan%20Perpres%20Nomor%2011%20Tahun%202024.pdf"
    }
];

const FAQPage = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [search, setSearch] = useState('');

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const filteredFAQ = FAQ_ITEMS.filter(item => 
        item.question.toLowerCase().includes(search.toLowerCase()) || 
        item.answer.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
                
                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
                        <BookOpen size={16} />
                        Pusat Informasi
                    </div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
                        FAQ & Regulasi KGB
                    </h1>
                    <p className="text-slate-300 text-lg leading-relaxed">
                        Panduan lengkap mengenai aturan, persyaratan, dan proses Kenaikan Gaji Berkala untuk ASN (PNS & PPPK).
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column: FAQ Accordion */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-display font-bold text-slate-800">Pertanyaan Umum</h2>
                        <div className="relative hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input 
                                type="text" 
                                placeholder="Cari topik..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all w-64"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredFAQ.length > 0 ? (
                            filteredFAQ.map((item, index) => (
                                <div 
                                    key={index}
                                    className={`bg-white rounded-2xl border transition-all duration-300 ${
                                        openIndex === index 
                                        ? 'border-indigo-200 shadow-lg shadow-indigo-500/5 ring-1 ring-indigo-50' 
                                        : 'border-slate-100 shadow-sm hover:border-indigo-100'
                                    }`}
                                >
                                    <button 
                                        onClick={() => toggleAccordion(index)}
                                        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                                    >
                                        <span className={`font-bold text-base ${openIndex === index ? 'text-indigo-700' : 'text-slate-700'}`}>
                                            {item.question}
                                        </span>
                                        <span className={`p-2 rounded-full transition-colors ${openIndex === index ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                                            {openIndex === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </span>
                                    </button>
                                    
                                    {openIndex === index && (
                                        <div className="px-6 pb-6 pt-0 animate-in fade-in slide-in-from-top-2">
                                            <div className="h-px w-full bg-slate-100 mb-4"></div>
                                            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                                                {item.answer}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 border-dashed">
                                <p className="text-slate-400 font-medium">Tidak ada hasil ditemukan.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Regulations & Quick Facts */}
                <div className="space-y-6">
                    {/* Legal Basis Card */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                                <Scale size={20} />
                            </div>
                            <div>
                                <h3 className="font-display font-bold text-slate-800 text-lg">Dasar Hukum</h3>
                                <p className="text-xs text-slate-400">Klik untuk mengunduh dokumen</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            {REGULATIONS.map((reg, idx) => (
                                <a 
                                    key={idx} 
                                    href={reg.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors group cursor-pointer items-start relative"
                                >
                                    <div className="absolute top-4 right-4 text-slate-300 group-hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100">
                                        <Download size={16} />
                                    </div>

                                    <div className="mt-1">
                                        <reg.icon size={18} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                    <div className="pr-6">
                                        <h4 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-indigo-700 flex items-center gap-2">
                                            {reg.title}
                                            <ExternalLink size={10} className="text-slate-300 group-hover:text-indigo-400" />
                                        </h4>
                                        <p className="text-xs text-slate-500 leading-relaxed">{reg.desc}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
