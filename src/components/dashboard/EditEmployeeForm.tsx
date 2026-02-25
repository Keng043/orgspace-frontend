'use client';
import { useState } from 'react';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2'; // ✅ นำเข้า SweetAlert2

export default function EditEmployeeForm({ 
  employee, 
  onClose, 
  onRefresh, 
  userRole 
}: { 
  employee: any, 
  onClose: () => void, 
  onRefresh: () => void,
  userRole: string 
}) {
  const [formData, setFormData] = useState({
    full_name: employee.full_name || '',
    position: employee.position || '',
    phone: employee.phone || '',
    salary: employee.salary || '',
    role: employee.role || 'EMPLOYEE'
  });

  const isAdmin = userRole === 'ADMIN';
  const isHR = userRole === 'HR';
  const canEditPrimaryInfo = isAdmin || isHR;
  const canEditSalary = isAdmin || isHR;
  const canChangeRole = isAdmin;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get('access_token');

    try {
      const res = await fetch(`http://192.168.10.101:3000/api/users/${employee._id || employee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          salary: Number(formData.salary)
        }),
      });

      if (res.ok) {
        // ✅ แจ้งเตือนสำเร็จแบบสวยงาม
        await Swal.fire({
          icon: 'success',
          title: 'อัปเดตสำเร็จ!',
          text: 'ข้อมูลพนักงานได้รับการแก้ไขเรียบร้อยแล้ว',
          confirmButtonColor: '#1E3A8A',
          timer: 2000,
          timerProgressBar: true
        });
        onRefresh();
        onClose();
      } else {
        const errorData = await res.json();
        // 🚨 แจ้งเตือนเมื่อเกิดข้อผิดพลาดจาก Backend
        Swal.fire({
          icon: 'error',
          title: 'อัปเดตไม่สำเร็จ',
          text: errorData.message || 'กรุณาตรวจสอบข้อมูลอีกครั้ง',
          confirmButtonColor: '#1E3A8A'
        });
      }
    } catch (err) {
      console.error('Update error:', err);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        confirmButtonColor: '#1E3A8A'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 text-black animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[45px] p-10 shadow-2xl animate-in zoom-in duration-300 border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-black text-blue-900 italic uppercase tracking-tighter">Edit Member</h2>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest italic">Update credentials & position</p>
          </div>
          <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
            ID: {employee.userId || 'N/A'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 ml-2 uppercase">Full Name</label>
              <input 
                required
                type="text" 
                value={formData.full_name}
                disabled={!canEditPrimaryInfo}
                placeholder="ชื่อ-นามสกุล"
                className={`w-full p-4 border rounded-2xl outline-none transition-all font-bold ${!canEditPrimaryInfo ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-100' : 'bg-white border-gray-200 focus:ring-2 ring-blue-500 text-black'}`}
                onChange={e => setFormData({...formData, full_name: e.target.value})} 
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 ml-2 uppercase">Position</label>
              <input 
                required
                type="text" 
                value={formData.position}
                disabled={!canEditPrimaryInfo}
                placeholder="ตำแหน่ง"
                className={`w-full p-4 border rounded-2xl outline-none transition-all font-bold ${!canEditPrimaryInfo ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-100' : 'bg-white border-gray-200 focus:ring-2 ring-blue-500 text-black'}`}
                onChange={e => setFormData({...formData, position: e.target.value})} 
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 ml-2 uppercase">Salary (เงินเดือน)</label>
            <input 
              required
              type="number" 
              value={formData.salary}
              disabled={!canEditSalary}
              placeholder="0.00"
              className={`w-full p-4 border rounded-2xl outline-none transition-all font-black ${!canEditSalary ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-100' : 'bg-white border-blue-600 text-blue-900 focus:ring-2 ring-blue-500'}`}
              onChange={e => setFormData({...formData, salary: e.target.value})} 
            />
          </div>

          {isAdmin && (
            <div className="bg-blue-50 p-6 rounded-[35px] border border-blue-100 transition-all">
              <label className="text-[10px] font-black text-blue-600 ml-2 uppercase tracking-widest block mb-2">Account Role (Admin Only)</label>
              <select 
                value={formData.role}
                className="w-full p-4 bg-white border border-blue-200 rounded-2xl outline-none focus:ring-2 ring-blue-600 font-bold text-gray-700 cursor-pointer"
                onChange={e => setFormData({...formData, role: e.target.value})}
              >
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="MANAGER">MANAGER</option>
                <option value="HR">HR</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-4 font-bold text-gray-400 hover:text-black transition-all uppercase text-xs tracking-widest"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 py-4 bg-blue-900 text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-black transition-all active:scale-95 uppercase text-xs tracking-widest"
            >
              Confirm Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}