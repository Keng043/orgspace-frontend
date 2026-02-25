'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2'; // ✅ นำเข้า SweetAlert2

export default function ReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const API_URL = 'http://192.168.10.101:3000/api/users/export/report';

  useEffect(() => {
    const role = Cookies.get('user_role');
    setUserRole(role || 'EMPLOYEE');

    const allowedRoles = ['ADMIN', 'HR'];
    if (!role || !allowedRoles.includes(role.toUpperCase())) {
      // ✅ แจ้งเตือนเมื่อไม่มีสิทธิ์เข้าถึงแบบสวยงาม
      Swal.fire({
        icon: 'error',
        title: 'สิทธิ์ไม่เพียงพอ',
        text: 'คุณไม่มีสิทธิ์เข้าถึงหน้ารายงานผลสรุป',
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'กลับไปหน้าหลัก',
      }).then(() => {
        router.push('/orgspace/dashboard');
      });
    }
  }, [router]);

  const handleExport = async () => {
    setLoading(true);
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        return Swal.fire({
          icon: 'warning',
          title: 'เซสชันหมดอายุ',
          text: 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
          confirmButtonColor: '#1E3A8A',
        });
      }

      const res = await fetch(API_URL, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/csv' 
        },
      });

      if (!res.ok) throw new Error(`${res.status}`);

      const rawCsvData = await res.text();
      const lines = rawCsvData.split('\n').filter(line => line.trim() !== '');
      const thaiHeader = "ชื่อ-นามสกุล,ระดับสิทธิ์,ตำแหน่งงาน,เงินเดือน (฿),แผนก/ฝ่าย";
      
      const formattedRows = lines.slice(1).map(line => {
        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const cleanCols = cols.map(c => c.replace(/"/g, '').trim());
        if (cleanCols[3]) {
          const salary = Number(cleanCols[3]);
          cleanCols[3] = !isNaN(salary) ? salary.toLocaleString() : cleanCols[3];
        }
        return cleanCols.map(c => `"${c}"`).join(',');
      });

      const finalCsv = [thaiHeader, ...formattedRows].join('\n');
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + finalCsv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toLocaleDateString('th-TH').replace(/\//g, '-');
      link.setAttribute('download', `รายงานพนักงาน_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // ✅ แจ้งเตือนเมื่อดาวน์โหลดสำเร็จ
      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ!',
        text: 'จัดเตรียมข้อมูลและดาวน์โหลดรายงานเรียบร้อยแล้ว',
        confirmButtonColor: '#1E3A8A',
        timer: 2000,
        timerProgressBar: true,
      });

    } catch (err: any) {
      // ✅ แจ้งเตือนเมื่อเกิดข้อผิดพลาด
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: `ไม่สามารถโหลดรายงานได้ (รหัส: ${err.message})`,
        confirmButtonColor: '#1E3A8A',
      });
    } finally {
      setLoading(false);
    }
  };

  if (userRole !== 'ADMIN' && userRole !== 'HR') return null;

  return (
    <div className="p-8 max-w-5xl mx-auto text-black animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#F8FAFC] min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-[50px] p-12 md:p-16 shadow-[0_20px_70px_-10px_rgba(0,0,0,0.1)] border border-gray-50 flex flex-col items-center text-center w-full relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-50 rounded-full -ml-12 -mb-12 opacity-50"></div>

        <div className="w-28 h-28 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] flex items-center justify-center text-white text-5xl mb-8 shadow-2xl shadow-blue-200 transform hover:scale-110 transition-transform duration-500">
          <span className="drop-shadow-lg">📊</span>
        </div>

        <h1 className="text-5xl font-black text-blue-900 italic tracking-tighter uppercase mb-3 leading-none">
          Data <span className="text-indigo-600">Formatter</span>
        </h1>
        
        <div className="flex items-center gap-2 mb-8">
           <span className="h-px w-8 bg-gray-200"></span>
           <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">Enhanced CSV Export</p>
           <span className="h-px w-8 bg-gray-200"></span>
        </div>

        <p className="text-gray-500 font-medium italic mb-12 max-w-md text-sm leading-relaxed">
          ประกาศ ห้ามดาวน์โหลดหรือโอนย้ายข้อมูลบริษัทโดยไม่ได้รับอนุญาต  
            <span className="text-red-600 font-bold"> การกระทำดังกล่าวต้องได้รับการอนุมัติจากผู้บังคับบัญชาทุกครั้ง</span> หากฝ่าฝืนมีโทษทางวินัยและกฎหมาย เพื่อความปลอดภัยของข้อมูลความลับและ PDPA
        </p>

        <div className="w-full max-w-md space-y-5">
          <button 
            onClick={handleExport}
            disabled={loading}
            className={`w-full py-6 rounded-[30px] font-black shadow-2xl transition-all active:scale-95 uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-4 group
              ${loading ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-blue-900 hover:bg-black text-white'}`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Formatting CSV...
              </>
            ) : (
              <>
                <span className="text-xl group-hover:animate-bounce">📥</span>
                Download Enhanced Report
              </>
            )}
          </button>
          
          <div className="bg-[#F1F5F9] p-8 rounded-[35px] border border-gray-100 text-left">
            <p className="text-[11px] font-black text-blue-700 uppercase mb-4 tracking-widest flex items-center gap-2">
               <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
               What's New in this Report?
            </p>
            <ul className="text-[13px] text-gray-600 font-bold space-y-3 italic">
              <li className="flex items-center gap-3">
                <span className="text-blue-500 text-lg">✓</span> หัวตารางภาษาไทย (ชื่อ, ตำแหน่ง, เงินเดือน)
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-500 text-lg">✓</span> ใส่เครื่องหมายคอมม่า (,) ในช่องเงินเดือน
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-500 text-lg">✓</span> รองรับการอ่านภาษาไทย 100%
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}