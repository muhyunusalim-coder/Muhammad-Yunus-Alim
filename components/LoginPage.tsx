
import React, { useState } from 'react';
import { Lock, AlertCircle, CreditCard, ArrowRight, ShieldCheck, Hexagon, Sparkles } from 'lucide-react';
import { fetchEmployeeData } from '../services/dataService';

interface Props {
  onLogin: (nip: string) => void;
}

const LoginPage: React.FC<Props> = ({ onLogin }) => {
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        if (password !== 'bskji') { // Simple password check as per original logic
            throw new Error('Password akses salah.');
        }

        const employees = await fetchEmployeeData();
        const foundEmployee = employees.find(emp => emp.nip === nip.trim());

        if (foundEmployee) {
            onLogin(foundEmployee.nip);
        } else {
            throw new Error('NIP tidak ditemukan dalam database KGB.');
        }

    } catch (err: any) {
        setError(err.message || 'Gagal login. Periksa koneksi atau data.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans relative overflow-hidden bg-slate-950">
      {/* Background Ambience (Optimized) - Reduced quality and width to save bandwidth */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&auto=format&fit=crop&w=1080&q=60')] bg-cover bg-center opacity-[0.03] mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-900"></div>
      
      {/* Static gradients instead of heavy animated blurs - using translate3d for GPU acceleration */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.15)_0%,transparent_70%)] pointer-events-none transform translate-z-0 will-change-transform"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.1)_0%,transparent_70%)] pointer-events-none transform translate-z-0 will-change-transform"></div>

      <div className="relative z-10 w-full flex flex-col md:flex-row h-screen">
        
        {/* Left Side: Brand & Info */}
        <div className="hidden md:flex flex-col justify-between w-1/2 p-20 text-white relative">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent to-slate-950/20"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-5 mb-12">
                    <div className="relative group cursor-default">
                        <div className="absolute -inset-2 bg-gradient-to-r from-pink-600 to-violet-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-gradient-to-br from-indigo-900 to-slate-900 p-4 rounded-2xl border border-white/10 shadow-2xl flex items-center justify-center">
                            <Hexagon size={36} className="text-indigo-400 group-hover:text-indigo-300 transition-colors" strokeWidth={1.5} />
                            <Sparkles size={18} className="text-amber-300 absolute -top-2 -right-2 animate-bounce delay-700" fill="currentColor" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-display font-bold text-2xl tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">Sistem KGB Terpadu</span>
                        <span className="font-display text-sm font-medium text-indigo-300 tracking-wide mt-1 uppercase">BSKJI Kementerian Perindustrian</span>
                    </div>
                </div>
                <h1 className="text-6xl font-display font-bold leading-tight mb-8 tracking-tight">
                    Manajemen <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">KGB Cerdas</span> <br/>
                    & Terintegrasi.
                </h1>
                <p className="text-slate-400 text-xl leading-relaxed max-w-lg font-light">
                    Transformasi digital administrasi kepegawaian. Pantau jadwal, analisis data, dan kelola kenaikan gaji dengan presisi tinggi.
                </p>
            </div>
            <div className="flex gap-10 text-sm text-slate-500 font-medium relative z-10">
                <span className="flex items-center gap-3"><ShieldCheck size={18} className="text-emerald-400"/> Data Terenkripsi End-to-End</span>
                <span className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]"/> Server Online</span>
            </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
            {/* Glass Effect Card (Simplified Blur) */}
            <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-md border border-white/[0.08] p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden ring-1 ring-white/5 transform translate-z-0">
                {/* Glossy Header Highlight */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
                
                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-display font-bold text-white mb-3">Selamat Datang</h2>
                    <p className="text-slate-400 text-sm font-medium">Masuk ke dashboard pegawai Anda.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">NIP Pegawai</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-400">
                                <CreditCard size={20} className="text-slate-600 group-hover:text-slate-500 transition-colors" />
                            </div>
                            <input 
                                type="text" 
                                value={nip}
                                onChange={(e) => setNip(e.target.value)}
                                className="block w-full pl-12 pr-4 py-4 bg-slate-900/40 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-slate-900/60 transition-all text-white placeholder-slate-700 text-sm font-medium outline-none shadow-inner"
                                placeholder="1985xxxx..."
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-400">
                                <Lock size={20} className="text-slate-600 group-hover:text-slate-500 transition-colors" />
                            </div>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-12 pr-4 py-4 bg-slate-900/40 border border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-slate-900/60 transition-all text-white placeholder-slate-700 text-sm font-medium outline-none shadow-inner"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 text-rose-300 text-xs animate-in fade-in slide-in-from-top-2 shadow-sm">
                            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                            <span className="font-medium leading-relaxed">{error}</span>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-900/40 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 group mt-6 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none blur-md"></div>
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Memverifikasi...</span>
                            </>
                        ) : (
                            <>
                                <span>Masuk Dashboard</span>
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            </div>
            
            <p className="md:hidden absolute bottom-6 text-xs text-slate-600 font-medium">
                BSKJI Government System v2.0
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
