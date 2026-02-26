"use client";
import { useState, useEffect, useMemo } from "react";
import Cookies from "js-cookie";
import Swal from "sweetalert2";

const API_BASE_URL = "http://192.168.10.101:3000/api";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  
  // 🔍 Filter & Sort States
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // 📝 Form States
  const [deptName, setDeptName] = useState("");
  const [description, setDescription] = useState("");

  const token = Cookies.get("access_token");

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // 🧪 Logic การกรองและเรียงลำดับข้อมูล
  const filteredAndSortedDepts = useMemo(() => {
    let result = departments.filter((dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dept.description || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return result.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (sortOrder === "asc") return nameA.localeCompare(nameB, 'th');
      return nameB.localeCompare(nameA, 'th');
    });
  }, [departments, searchTerm, sortOrder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return Swal.fire({ icon: "warning", title: "กรุณาระบุรายละเอียดแผนก" });
    if (description.length < 10) return Swal.fire({ icon: "warning", title: "รายละเอียดต้องมีความยาวอย่างน้อย 10 ตัวอักษร" });
    
    const alphaRegex = /^[a-zA-Zก-ฮะ-์\s]+$/;
    if (!alphaRegex.test(description)) return Swal.fire({ icon: "warning", title: "รายละเอียดต้องเป็นตัวอักษรเท่านั้น" });

    const method = editingDept ? "PUT" : "POST";
    const url = editingDept ? `${API_BASE_URL}/departments/${editingDept._id}` : `${API_BASE_URL}/departments`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: deptName, description }),
      });

      if (res.ok) {
        Swal.fire({ icon: "success", title: "สำเร็จ!", timer: 1500 });
        resetForm();
        fetchDepartments();
      } else {
        const err = await res.json();
        Swal.fire({ icon: "error", title: "ไม่สำเร็จ", text: err.message });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "ข้อผิดพลาด", text: "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้" });
    }
  };

  const resetForm = () => {
    setDeptName("");
    setDescription("");
    setEditingDept(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: "ลบแผนก?",
      text: `ยืนยันการลบแผนก "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "ลบทันที",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_BASE_URL}/departments/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          Swal.fire("ลบสำเร็จ!", "", "success");
          fetchDepartments();
        }
      } catch (err) { Swal.fire("Error", "ไม่สามารถลบได้", "error"); }
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto text-black animate-in fade-in duration-700 bg-[#F8FAFC] min-h-screen font-sans">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-blue-900 italic uppercase tracking-tighter">Departments</h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1 italic">จัดการโครงสร้างและรายละเอียดแผนก</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-blue-900 text-white px-8 py-4 rounded-[25px] font-black shadow-xl hover:bg-black transition-all active:scale-95 uppercase text-[10px] tracking-widest"
>Add New Department
        </button>
      </div>

      {/* 🔍 Filter & Sort Bar */}
      <div className="bg-white p-6 rounded-[35px] border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-xs">🔍</span>
          <input 
            type="text"
            placeholder="ค้นหาชื่อแผนกหรือรายละเอียด..."
            className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-xs focus:ring-2 ring-blue-500 transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-gray-300 uppercase italic">Sort by Name:</span>
          <button 
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="bg-white border border-gray-100 px-5 py-3 rounded-2xl text-[10px] font-black text-blue-900 shadow-sm hover:bg-blue-50 transition-all flex items-center gap-2"
          >
            {sortOrder === "asc" ? "ก - ฮ ↑" : "ฮ - ก ↓"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-blue-900 font-black italic tracking-widest text-xs">SYNCING DEPARTMENTS...</div>
      ) : (
        <div className="bg-white rounded-[50px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-50 overflow-hidden shadow-inner">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr className="text-gray-400 text-[10px] uppercase font-black italic tracking-widest">
                <th className="px-10 py-7">Department Name</th>
                <th className="px-10 py-7">Detailed Description</th>
                <th className="px-10 py-7 text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAndSortedDepts.map((dept) => (
                <tr key={dept._id} className="hover:bg-blue-50/10 transition-all group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-[10px] italic shadow-sm">
                        {dept.name.charAt(0)}
                      </div>
                      <span className="font-black text-gray-800 text-sm uppercase">{dept.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <p className="text-gray-500 text-xs font-medium leading-relaxed max-w-md italic">
                      {dept.description || "No description provided"}
                    </p>
                  </td>
                  <td className="px-10 py-6 flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setEditingDept(dept);
                        setDeptName(dept.name);
                        setDescription(dept.description || "");
                        setIsModalOpen(true);
                      }}
                      className="bg-blue-100 text-blue-700 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-blue-200 transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dept._id, dept.name)}
                      className="bg-red-50 text-red-600 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredAndSortedDepts.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-20 text-center text-gray-300 font-black italic uppercase tracking-widest text-xs">No departments found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 🟢 Modal สำหรับเพิ่ม/แก้ไข (คงเดิม) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[45px] p-10 shadow-2xl border border-gray-100 scale-in-center">
            <h2 className="text-2xl font-black text-blue-900 mb-6 italic uppercase tracking-tighter">
              {editingDept ? "Edit Department" : "New Department"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-2 block tracking-widest">Department Name</label>
                <input required type="text" value={deptName} onChange={(e) => setDeptName(e.target.value)}
                  className="w-full p-4 border border-gray-200 rounded-2xl outline-none font-bold focus:ring-2 ring-blue-500 shadow-sm transition-all"
                  placeholder="เช่น IT, HR" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-2 block tracking-widest">Description</label>
                <textarea required value={description} onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 border border-gray-200 rounded-2xl outline-none font-bold focus:ring-2 ring-blue-500 min-h-[120px] shadow-sm transition-all"
                  placeholder="รายละเอียดหน้าที่พนักงานในแผนก..." />
                <p className="text-[9px] text-gray-400 mt-2 ml-2 italic tracking-tight">* ตัวอักษรเท่านั้น และอย่างน้อย 10 ตัวอักษร</p>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={resetForm} className="flex-1 py-4 font-black text-gray-300 uppercase text-[10px] tracking-widest transition-colors hover:text-gray-500">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-blue-900 text-white font-black rounded-2xl shadow-xl uppercase text-[10px] tracking-[0.1em] active:scale-95 transition-all">
                  {editingDept ? "Save Changes" : "Confirm Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}