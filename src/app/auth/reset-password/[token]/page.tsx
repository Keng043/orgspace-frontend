'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

const API_BASE_URL = 'http://192.168.10.101:3000/api';

export default function ResetPasswordPage() {
  const { token } = useParams(); // รับ token จาก URL
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return Swal.fire({
        icon: 'error',
        title: 'รหัสผ่านไม่ตรงกัน',
        text: 'กรุณาตรวจสอบการกรอกรหัสผ่านอีกครั้ง',
        confirmButtonColor: '#1E3A8A'
      });
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token, // ส่ง token ที่ได้จาก URL
          newPassword: password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'เปลี่ยนรหัสผ่านสำเร็จ!',
          text: 'คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที',
          confirmButtonColor: '#1E3A8A',
          timer: 3000
        });
        router.push('/login'); // กลับไปหน้า Login
      } else {
        throw new Error(data.message || 'ลิงก์หมดอายุหรือความผิดพลาดของระบบ');
      }
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: err.message,
        confirmButtonColor: '#1E3A8A'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50/30 p-4 font-sans text-black italic animate-in fade-in duration-1000">
      <div className="bg-white w-full max-w-lg rounded-[50px] shadow-2xl p-12 border border-gray-100 scale-in-center">
        
        <div className="text-center mb-10">
          <h2 className="text-[35px] font-black text-blue-900 uppercase tracking-tighter leading-none italic">Set New Password</h2>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mt-4 not-italic">Identity verification completed</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-6 not-italic">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-2 block tracking-widest leading-none">New Security Key</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter new password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[25px] outline-none font-bold shadow-inner focus:ring-2 focus:ring-blue-400 transition-all text-black" 
                required 
                minLength={6}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-2 block tracking-widest leading-none">Confirm Security Key</label>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Confirm new password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[25px] outline-none font-bold shadow-inner focus:ring-2 focus:ring-blue-400 transition-all text-black" 
              required 
            />
          </div>

          <div className="flex items-center gap-2 ml-2">
            <input 
              type="checkbox" 
              id="show-pass" 
              className="w-4 h-4 rounded border-gray-300 accent-blue-600"
              onChange={() => setShowPassword(!showPassword)}
            />
            <label htmlFor="show-pass" className="text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer">Show Password</label>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-blue-900 text-white py-6 rounded-[25px] font-black text-xs uppercase shadow-2xl hover:bg-black active:scale-95 transition-all mt-4 tracking-[0.2em]"
          > 
            {loading ? "UPDATING SECURITY..." : "CONFIRM NEW PASSWORD"} 
          </button>
        </form>

        <p className="text-center text-[9px] text-gray-300 font-bold uppercase mt-8 tracking-widest">ORGSPACE System Security Protocol</p>
      </div>
    </div>
  );
}