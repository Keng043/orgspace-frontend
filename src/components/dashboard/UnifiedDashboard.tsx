'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2'; // ✅ นำเข้า SweetAlert2

const API_BASE_URL = 'http://192.168.10.101:3000/api';

// --- 1. EditEmployeeModal (อัปเกรดแจ้งเตือน) ---
function EditEmployeeModal({ employee, onClose, onRefresh, userRole }: any) {
  const [formData, setFormData] = useState({
    full_name: employee?.full_name || '',
    salary: employee?.salary || '',
    role: employee?.role || 'EMPLOYEE'
  });

  const isAdmin = userRole === 'ADMIN';
  const isHR = userRole === 'HR';
  const canEditGeneral = isAdmin || isHR || userRole === 'EMPLOYEE';
  const canEditSalary = isAdmin || isHR; 
  const canEditRole = isAdmin || isHR;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get('access_token');
    const empId = employee?._id || employee?.id;

    try {
      const payload: any = { full_name: formData.full_name };
      if (canEditSalary) payload.salary = Number(formData.salary);
      if (canEditRole) payload.role = formData.role;

      const response = await fetch(`${API_BASE_URL}/users/${empId}`, {
        method: 'PUT', // แนะนำใช้ PATCH ตามมาตรฐาน NestJS สำหรับการอัปเดตบางฟิลด์
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'อัปเดตสำเร็จ!',
          text: 'ข้อมูลพนักงานได้รับการแก้ไขแล้ว',
          confirmButtonColor: '#1E3A8A',
          timer: 2000
        });
        onRefresh();
        onClose();
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'ไม่สำเร็จ',
          text: errorData.message,
          confirmButtonColor: '#1E3A8A'
        });
      }
    } catch (err) { 
      Swal.fire({ icon: 'error', title: 'Error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 text-black animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[45px] p-10 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-black text-blue-900 mb-6 italic uppercase tracking-tighter leading-none">Edit Info</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Full Name</label>
            <input required type="text" value={formData.full_name} disabled={!canEditGeneral} className={`w-full p-4 border rounded-2xl outline-none font-bold transition-all ${!canEditGeneral ? 'bg-gray-50 text-gray-400' : 'bg-white border-gray-200 focus:ring-2 ring-blue-500'}`} onChange={e => setFormData({...formData, full_name: e.target.value})} />
          </div>
          {canEditSalary && (
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Salary (฿)</label>
              <input required type="number" value={formData.salary} className="w-full p-4 border border-blue-600 rounded-2xl outline-none font-black text-blue-900 focus:ring-2 ring-blue-500" onChange={e => setFormData({...formData, salary: e.target.value})} />
            </div>
          )}
          {canEditRole && (
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Account Role</label>
              <select value={formData.role} className="w-full p-4 border border-gray-200 rounded-2xl outline-none font-bold bg-white cursor-pointer" onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="MANAGER">MANAGER</option>
                {isAdmin && <option value="HR">HR</option>}
              </select>
            </div>
          )}
          <div className="flex gap-4 pt-6">
            <button type="button" onClick={onClose} className="flex-1 py-4 font-bold text-gray-400 uppercase text-xs tracking-widest hover:text-black">Cancel</button>
            <button type="submit" className="flex-1 py-4 bg-blue-900 text-white font-black rounded-2xl shadow-xl uppercase text-xs tracking-widest active:scale-95 transition-all">Save Change</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- 2. UnifiedDashboard ---
export default function UnifiedDashboard({ userRole }: { userRole: string }) {
  const [dataList, setDataList] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const isAdmin = userRole === 'ADMIN';
  const isHR = userRole === 'HR';
  const isManager = userRole === 'MANAGER';
  const isEmployee = userRole === 'EMPLOYEE';

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = Cookies.get('access_token');
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

      const profRes = await fetch(`${API_BASE_URL}/users/profile`, { headers });
      const profData = await profRes.json();
      setCurrentUser(profData);

      const targetUrl = (isEmployee) ? `${API_BASE_URL}/users/profile` : `${API_BASE_URL}/users`;
      const res = await fetch(targetUrl, { headers });
      const result = await res.json();

      if (res.ok) {
        let list = [];
        if (Array.isArray(result)) list = result;
        else if (result.data && Array.isArray(result.data)) list = result.data;
        else if (typeof result === 'object' && result !== null) list = [result];
        setDataList(list);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ฟังก์ชันสำหรับลบพนักงาน (อัปเกรดแจ้งเตือน)
  const handleDelete = async (id: string, name: string) => {
    const confirm = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: `ข้อมูลของ "${name}" จะถูกลบออกจากระบบถาวร`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#9CA3AF',
      confirmButtonText: 'ใช่, ลบทันที!',
      cancelButtonText: 'ยกเลิก'
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = Cookies.get('access_token');
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        Swal.fire({ icon: 'success', title: 'ลบสำเร็จ!', text: 'ข้อมูลถูกลบเรียบร้อยแล้ว', timer: 1500, showConfirmButton: false });
        fetchData();
      } else {
        const err = await res.json();
        Swal.fire({ icon: 'error', title: 'ลบไม่สำเร็จ', text: err.message });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
    }
  };

  useEffect(() => { if(userRole) fetchData(); }, [userRole]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-blue-900 font-black animate-pulse uppercase tracking-widest text-[10px]">Syncing for {userRole}...</p>
    </div>
  );

  return (
    <div className="space-y-6 text-black animate-in fade-in duration-700">
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden text-sm font-bold overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black italic">
              <th className="px-10 py-6">พนักงาน</th>
              <th className="px-10 py-6">ระดับ / ตำแหน่ง</th>
              {(isAdmin || isHR || isManager || isEmployee) && <th className="px-10 py-6">รายได้</th>}
              <th className="px-10 py-6 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-gray-700">
            {dataList.length > 0 ? (
              dataList.map((emp) => {
                if (!emp) return null;
                const empId = emp._id || emp.id;
                const isMe = String(empId) === String(currentUser?._id || currentUser?.id);
                
                const canEdit = isAdmin 
                  ? (emp.role !== 'ADMIN' || isMe) 
                  : isHR 
                    ? (emp.role !== 'ADMIN' && emp.role !== 'HR') 
                    : false;

                const canDelete = isAdmin 
                  ? (emp.role !== 'ADMIN') 
                  : isHR 
                    ? (emp.role === 'MANAGER' || emp.role === 'EMPLOYEE') 
                    : false;

                return (
                  <tr key={empId} className="hover:bg-blue-50/10 transition-colors">
                    <td className="px-10 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-900 font-black text-sm uppercase shadow-inner border border-blue-100">
                          {String(emp.full_name || 'U').charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-black">{emp.full_name || 'Unknown User'}</span>
                          {isMe && <span className="text-[9px] bg-blue-900 text-white px-2 py-0.5 rounded-full w-fit mt-1 uppercase tracking-tighter">YOU</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-5">
                      <div className="flex flex-col">
                        <span className={`uppercase text-[10px] font-black ${emp.role === 'ADMIN' ? 'text-red-600' : 'text-blue-600'}`}>{emp.role}</span>
                        <span className="text-gray-400 italic text-[10px] tracking-tight">{emp.position || 'Staff'}</span>
                      </div>
                    </td>
                    {(isAdmin || isHR || isManager || isMe) && ( 
                      <td className="px-10 py-5 font-mono text-blue-900 font-black italic">
                        {Number(emp.salary || 0).toLocaleString()} ฿
                      </td>
                    )}
                    <td className="px-10 py-5 text-center flex justify-center gap-2">
                      {canEdit ? (
                        <button onClick={() => setEditingItem(emp)} className="bg-blue-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-black transition-all shadow-lg active:scale-95">Edit</button>
                      ) : (
                        <span className="text-[10px] text-gray-300 uppercase italic px-5 py-2.5 border border-dashed border-gray-200 rounded-xl">Locked</span>
                      )}

                      {canDelete && (
                        <button 
                          onClick={() => handleDelete(empId, emp.full_name)} 
                          className="bg-red-50 text-red-600 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95 border border-red-100"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={5} className="px-10 py-20 text-center text-gray-400 italic">ไม่พบข้อมูลในสิทธิ์ของคุณ</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {editingItem && <EditEmployeeModal employee={editingItem} userRole={userRole} onClose={() => setEditingItem(null)} onRefresh={fetchData} />}
    </div>
  );
}