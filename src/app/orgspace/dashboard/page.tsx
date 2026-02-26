'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import UnifiedDashboard from '@/components/dashboard/UnifiedDashboard';

// --- ➕ คอมโพเนนต์ Modal สำหรับสร้างพนักงานใหม่ ---
function AddEmployeeModal({ onClose, onRefresh, userRole }: { onClose: () => void, onRefresh: () => void, userRole: string }) {
  const [departmentList, setDepartmentList] = useState<any[]>([]); // ✅ สำหรับเก็บรายชื่อแผนกจาก API
  const [loadingDepts, setLoadingDepts] = useState(true);
  
  const [formData, setFormData] = useState({
    userId: '',
    full_name: '',
    password: '',
    salary: '',
    role: 'EMPLOYEE',
    position: '',
    departmentId: '', // ✅ ใช้ departmentId ให้ตรงกับ Dropdown
  });

  const isAdmin = userRole === 'ADMIN';
  const API_BASE_URL = 'http://192.168.10.101:3000/api'; 

// ✅ ดึงข้อมูลแผนกจาก API (รูปแบบเดียวกับ EditEmployeeModal)
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const token = Cookies.get("access_token");
        const res = await fetch(`${API_BASE_URL}/departments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setDepartmentList(Array.isArray(data) ? data : data.data || []);
        }
      } catch (err) {
        console.error("Fetch Dept Error:", err);
      } finally {
        setLoadingDepts(false);
      }
    };
    fetchDepts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get('access_token');
    
    if (!formData.departmentId) {
      return Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณาเลือกแผนกที่พนักงานสังกัด',
        confirmButtonColor: '#1E3A8A'
      });
    }
// ✅ เพิ่ม Logic ค้นหา "ชื่อแผนก" จาก ID ที่เลือก
    const selectedDept = departmentList.find(d => d._id === formData.departmentId);
    const departmentName = selectedDept ? selectedDept.name : '';

    try {
      // ✅ ปรับ Payload ส่งเป็นชื่อแผนก (String) ตามที่ Backend ต้องการ
      const payload = {
        userId: formData.userId,
        full_name: formData.full_name,
        password: formData.password,
        salary: Number(formData.salary),
        role: formData.role,
        position: formData.position,
        department: departmentName // 🔄 เปลี่ยนจากส่ง ID เป็นส่ง "ชื่อแผนก"
      };

      const response = await fetch(`${API_BASE_URL}/users`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: 'สร้างพนักงานใหม่เข้าสู่ระบบเรียบร้อยแล้ว',
          confirmButtonColor: '#1E3A8A',
          timer: 2000,
          timerProgressBar: true
        });
        onRefresh();
        onClose();
      } else {
        const errorData = await response.json();
        const msg = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message;
        
        Swal.fire({
          icon: 'error',
          title: 'สร้างไม่สำเร็จ',
          text: msg,
          confirmButtonColor: '#1E3A8A'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ในขณะนี้',
        confirmButtonColor: '#1E3A8A'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 text-black animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[45px] p-10 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-black text-blue-900 mb-2 italic uppercase tracking-tighter leading-none">New Member</h2>
        <p className="text-gray-400 text-[10px] mb-8 font-black uppercase tracking-widest italic">เพิ่มสมาชิกใหม่</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">User ID (Username)</label>
              <input required type="text" placeholder="เช่น EMP001" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold focus:ring-2 ring-blue-50 text-black transition-all"
                onChange={e => setFormData({...formData, userId: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Full Name</label>
              <input required type="text" placeholder="ชื่อ-นามสกุล" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold focus:ring-2 ring-blue-50 text-black transition-all"
                onChange={e => setFormData({...formData, full_name: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Password</label>
              <input required type="password" placeholder="••••••••" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold focus:ring-2 ring-blue-50 text-black transition-all"
                onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Salary (฿)</label>
              <input required type="number" placeholder="0.00" className="w-full p-4 border border-blue-600 rounded-2xl outline-none font-black text-blue-900 focus:ring-2 ring-blue-500"
                onChange={e => setFormData({...formData, salary: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Position</label>
              <input required type="text" placeholder="เช่น Developer" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold focus:ring-2 ring-blue-50 text-black transition-all"
                onChange={e => setFormData({...formData, position: e.target.value})} />
            </div>
            <div>
              {/* ✅ เปลี่ยนเป็น Dropdown แผนก ตามรูปแบบ EditEmployeeModal */}
              <label className="text-[10px] font-black text-blue-600 uppercase ml-2 tracking-widest underline decoration-blue-200">Department</label>
              <select 
                required 
                className="w-full p-4 bg-blue-50 border border-blue-100 rounded-2xl outline-none font-bold focus:ring-2 ring-blue-500 text-black cursor-pointer transition-all"
                value={formData.departmentId}
                onChange={e => setFormData({...formData, departmentId: e.target.value})}
              >
                <option value="">{loadingDepts ? "Loading..." : "เลือกแผนก"}</option>
                {departmentList.map((dept: any) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Role (ระดับสิทธิ์)</label>
            <select 
              value={formData.role}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold bg-white text-black cursor-pointer"
              onChange={e => setFormData({...formData, role: e.target.value})}
            > 
              <option value="EMPLOYEE">EMPLOYEE</option>
              <option value="MANAGER">MANAGER</option>
              {isAdmin && <option value="HR">HR</option>}
            </select>
          </div>

          <div className="flex gap-4 pt-6">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-gray-900 text-white font-black rounded-3xl shadow-xl uppercase text-[10px] tracking-[0.2em] active:scale-95 transition-all shadow-blue-100">Cancel</button>
            <button type="submit" className="flex-1 py-4 bg-blue-900 text-white font-black rounded-3xl shadow-xl uppercase text-[10px] tracking-[0.2em] active:scale-95 transition-all shadow-blue-100">Confirm & Create</button>
          </div>
        </form>
      </div>
    </div>
  );
} 

// --- DashboardPage Component ---
export default function DashboardPage() { 
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const role = Cookies.get('user_role');
    const currentRole = role ? role.toUpperCase() : 'EMPLOYEE';
    setUserRole(currentRole);
  }, []);

  if (userRole === null) return null;

  const canAddEmployee = userRole === 'ADMIN' || userRole === 'HR';

  return (
    <div className="p-8 min-h-screen text-black animate-in fade-in duration-700 bg-[#F8FAFC]">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-blue-900 italic uppercase tracking-tighter leading-none">
            Management <span className="text-blue-600">Center</span>
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="flex items-center gap-2 text-[9px] font-black text-blue-600 bg-blue-100 px-4 py-1.5 rounded-xl border border-blue-200 uppercase tracking-widest shadow-sm">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
                Auth Level: {userRole}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          {canAddEmployee && (
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-blue-900 text-white px-8 py-4 rounded-[25px] font-black shadow-xl hover:bg-black transition-all active:scale-95 uppercase text-[10px] tracking-widest">Add Employee
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 bg-white rounded-[50px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-50 overflow-hidden">
        <UnifiedDashboard userRole={userRole} />
      </div>

      {showAddForm && (
        <AddEmployeeModal 
          userRole={userRole} 
          onClose={() => setShowAddForm(false)} 
          onRefresh={() => window.location.reload()} 
        />
      )}
    </div>
  );
}