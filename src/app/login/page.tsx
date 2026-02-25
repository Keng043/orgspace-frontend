'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const API_BASE = 'http://192.168.10.101:3000/api/auth';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 🧨 ล้างข้อมูลเก่าก่อนเข้าสู่ระบบใหม่
      Cookies.remove('access_token', { path: '/' });
      Cookies.remove('user_role', { path: '/' });
      Cookies.remove('user_name', { path: '/' });

      const res = await fetch(`${API_BASE}/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'ID หรือรหัสผ่านไม่ถูกต้อง');

      // ✅ 1. บันทึก Access Token
      Cookies.set('access_token', data.accessToken, { expires: 1, path: '/' });
      
      // ✅ 2. ถอดรหัส JWT เพื่อเก็บข้อมูลเบื้องต้น
      try {
        const payload = JSON.parse(window.atob(data.accessToken.split('.')[1]));
        const actualName = payload.full_name || payload.name;
        const actualRole = (payload.role || 'EMPLOYEE').toUpperCase();

        Cookies.set('user_name', actualName, { expires: 1, path: '/' });
        Cookies.set('user_role', actualRole, { expires: 1, path: '/' });
      } catch (decodeError) {
        console.error("Token decoding failed:", decodeError);
      }
      
      // 🚀 เข้าสู่หน้า Dashboard
      router.push('/orgspace/dashboard');
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถเข้าสู่ระบบได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50/30 p-4 font-sans text-black animate-in fade-in duration-1000">
      <div className="bg-white w-full max-w-4xl rounded-[50px] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.1)] overflow-hidden flex min-h-[600px] border border-gray-50 italic">
        
        {/* ส่วนฟอร์ม Login */}
        <div className="w-full md:w-1/2 p-12 md:p-16 flex flex-col justify-center">
          <div className="mb-10">
            <h2 className="text-[45px] font-black text-blue-600 uppercase tracking-tighter leading-none italic">Login</h2>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3 not-italic">Identity verification required</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 not-italic">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-2 block tracking-widest">User ID</label>
              <input 
                type="text" 
                placeholder="Enter your ID" 
                value={userId} 
                onChange={(e) => setUserId(e.target.value)} 
                className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[25px] outline-none font-bold shadow-inner focus:ring-2 focus:ring-blue-400 transition-all" 
                required 
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-2 block tracking-widest">Security Key</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[25px] outline-none font-bold shadow-inner focus:ring-2 focus:ring-blue-400 transition-all" 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-400 uppercase tracking-tighter hover:text-blue-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-[10px] font-black p-4 rounded-2xl border border-red-100 text-center animate-shake uppercase italic tracking-widest">
                ⚠️ {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-blue-600 text-white py-6 rounded-[25px] font-black text-xs uppercase shadow-2xl hover:bg-black active:scale-95 transition-all mt-4 tracking-[0.2em]"
            > 
              {loading ? "AUTHENTICATING..." : "SIGN IN TO SYSTEM"} 
            </button>
            
          </form>
        </div>

        {/* ส่วน Brand Decor (ฝั่งขวา) */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 items-center justify-center p-12 text-white relative overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-blue-400/20 rounded-full blur-2xl"></div>
          <div className="z-10 flex flex-col items-center text-center">
            <span className="font-black text-7xl tracking-tighter drop-shadow-2xl italic">ORGSPACE</span>
            <div className="h-1.5 w-24 bg-white mt-4 rounded-full shadow-lg"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] mt-6 opacity-70 italic">Management Solution</p>
          </div>
        </div>
      </div>
    </div>
  );
}