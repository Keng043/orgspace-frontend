'use client';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2'; // ✅ นำเข้า SweetAlert2

export default function ViewProfileModal({ onClose }: { onClose: () => void }) {
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFullProfile = async () => {
      try {
        const token = Cookies.get('access_token');
        
        // 🛡️ 1. ตรวจสอบเบื้องต้นว่ามี Token หรือไม่
        if (!token) {
          setLoading(false);
          await Swal.fire({
            icon: 'warning',
            title: 'เซสชันหมดอายุ',
            text: 'ไม่พบรหัสเข้าใช้งาน กรุณาเข้าสู่ระบบใหม่',
            confirmButtonColor: '#1E3A8A'
          });
          return onClose();
        }

        const res = await fetch('http://192.168.10.101:3000/api/users/profile', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await res.json();
        
        if (res.ok) {
          // ✅ เก็บข้อมูล (รองรับทั้งส่งมาตรงๆ หรือส่งผ่านก้อน data)
          setInfo(data.data || data);
        } else if (res.status === 401) {
          // 🚨 2. จัดการเคส Unauthorized (Token ผิด/หมดอายุ)
          await Swal.fire({
            icon: 'lock',
            title: 'Unauthorized',
            text: 'สิทธิ์การเข้าใช้งานของคุณไม่ถูกต้องหรือหมดอายุแล้ว',
            confirmButtonColor: '#1E3A8A'
          });
          onClose();
        } else {
          throw new Error(data.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
        }
      } catch (err: any) {
        console.error("Fetch profile error:", err);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: err.message,
          confirmButtonColor: '#1E3A8A'
        });
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchFullProfile();
  }, [onClose]);

  // กฎ: ทุกคนเห็นเงินเดือนของ "ตัวเอง" ได้ในหน้านี้
  const canSeeSalary = info !== null; 

  return (
    <div className="fixed inset-0 bg-blue-900/20 backdrop-blur-sm flex items-center justify-center z-[110] p-4 text-black animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[45px] p-10 shadow-2xl animate-in zoom-in duration-300 border border-white/20 relative overflow-hidden">
        
        {/* ตกแต่งกราฟิกเล็กน้อย */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

        {loading ? (
          <div className="flex flex-col items-center py-10">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4 shadow-sm"></div>
            <p className="text-[10px] font-black text-blue-900 uppercase animate-pulse tracking-widest">Syncing Identity...</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[35px] flex items-center justify-center text-white text-4xl font-black mb-4 shadow-2xl border-4 border-white transform hover:scale-105 transition-transform duration-500 italic">
                {String(info?.full_name || 'U').charAt(0)}
              </div>
              <h2 className="text-2xl font-black text-blue-900 italic tracking-tighter uppercase leading-none">Official ID</h2>
              <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.3em] mt-2">Verified Organization Member</p>
            </div>

            <div className="space-y-3 mb-10">
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 group hover:border-blue-200 transition-all">
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Full Name</p>
                <p className="font-bold text-gray-800 text-sm uppercase tracking-tight">{info?.full_name || 'N/A'}</p>
              </div>
              
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 group hover:border-blue-200 transition-all">
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Position & Role</p>
                <div className="flex justify-between items-center">
                  <p className="font-bold text-gray-800 text-sm italic">{info?.position || 'Staff'}</p>
                  <span className="text-[8px] bg-blue-900 text-white px-3 py-1 rounded-lg font-black uppercase tracking-tighter">{info?.role}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">User ID</p>
                  <p className="font-bold text-gray-800 text-xs tracking-tighter">{info?.userId || '—'}</p>
                </div>
                
                <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
                  <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">Income (฿)</p>
                  <p className="font-black text-indigo-700 text-sm italic tracking-tighter">
                    {canSeeSalary && info?.salary ? `${Number(info.salary).toLocaleString()}` : '••••••'}
                  </p>
                </div>
              </div>

              {info?.department && (
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Team / Dept</p>
                  <p className="font-bold text-gray-800 text-sm italic">{info?.department?.name || 'Central Office'}</p>
                </div>
              )}
            </div>

            <button 
              onClick={onClose}
              className="w-full py-5 bg-blue-900 text-white font-black rounded-3xl hover:bg-black transition-all shadow-2xl shadow-blue-100 active:scale-95 uppercase text-[10px] tracking-[0.2em]"
            >
              Confirm & Exit
            </button>
          </>
        )}
      </div>
    </div>
  );
}