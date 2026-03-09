
import React, { useState } from 'react';
import { Lock, AlertCircle, CreditCard, ArrowRight } from 'lucide-react';
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
        if (password !== 'bskji') {
            throw new Error('Password akses salah.');
        }

        const employees = await fetchEmployeeData();
        const foundEmployee = employees.find(emp => emp.nip === nip.trim());

        if (foundEmployee) {
            onLogin(foundEmployee.nip);
        } else {
            throw new Error('NIP tidak ditemukan.');
        }

    } catch (err: unknown) {
        const error = err as Error;
        setError(error.message || 'Gagal login.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg">L</div>
            <h2 className="text-2xl font-bold text-slate-800">Layanan KGB</h2>
            <p className="text-slate-500 text-sm mt-1">Silakan masuk ke akun Anda</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">NIP Pegawai</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <CreditCard size={18} />
                    </div>
                    <input 
                        type="text" 
                        value={nip}
                        onChange={(e) => setNip(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                        placeholder="Masukkan NIP"
                        autoFocus
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Lock size={18} />
                    </div>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-600 text-xs">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
            >
                {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <>
                        <span>Masuk Dashboard</span>
                        <ArrowRight size={18} />
                    </>
                )}
            </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">BSKJI Government System</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
