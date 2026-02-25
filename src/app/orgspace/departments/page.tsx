"use client";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Swal from "sweetalert2";

const API_BASE_URL = "http://192.168.10.101:3000/api";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  
  // 📝 State สำหรับ Input
  const [deptName, setDeptName] = useState("");
  const [description, setDescription] = useState(""); // ✅ เพิ่ม State รายละเอียด

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

  // ➕ ฟังก์ชันเพิ่ม/แก้ไข พร้อม Validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🛡️ 1. ตรวจสอบว่าระบุรายละเอียดหรือไม่
    if (!description.trim()) {
      return Swal.fire({ icon: "warning", title: "กรุณาระบุรายละเอียดแผนก" });
    }

    // 🛡️ 2. ตรวจสอบความยาวอย่างน้อย 10 ตัวอักษร
    if (description.length < 10) {
      return Swal.fire({ icon: "warning", title: "รายละเอียดต้องมีความยาวอย่างน้อย 10 ตัวอักษร" });
    }

    // 🛡️ 3. ตรวจสอบว่าเป็นตัวอักษรเท่านั้น (Regex เช็คภาษาไทยและอังกฤษ ไม่เอาตัวเลข)
    const alphaRegex = /^[a-zA-Zก-ฮะ-์\s]+$/;
    if (!alphaRegex.test(description)) {
      return Swal.fire({ icon: "warning", title: "รายละเอียดต้องเป็นตัวอักษรเท่านั้น" });
    }

    const method = editingDept ? "PUT" : "POST";
    const url = editingDept
      ? `${API_BASE_URL}/departments/${editingDept._id}`
      : `${API_BASE_URL}/departments`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          name: deptName, 
          description: description // ✅ ส่งรายละเอียดไปที่ Backend
        }),
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
      text: `คุณแน่ใจไหมที่จะลบแผนก "${name}"?`,
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
      } catch (err) {
        Swal.fire("Error", "ไม่สามารถลบได้", "error");
      }
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto text-black animate-in fade-in duration-700 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-blue-900 italic uppercase tracking-tighter">Departments</h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">จัดการโครงสร้างและรายละเอียดแผนก</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-blue-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-black transition-all active:scale-95 uppercase text-[10px] tracking-widest"
        >
          + Add New Department
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-blue-900 font-black">SYNCING DEPARTMENTS...</div>
      ) : (
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-gray-400 text-[10px] uppercase font-black italic tracking-widest">
                <th className="px-10 py-6">Department Name</th>
                <th className="px-10 py-6">Description</th>
                <th className="px-10 py-6 text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {departments.map((dept) => (
                <tr key={dept._id} className="hover:bg-blue-50/10 transition-colors">
                  <td className="px-10 py-5 font-bold text-gray-800">{dept.name}</td>
                  <td className="px-10 py-5 text-gray-500 text-xs max-w-xs truncate">{dept.description || "-"}</td>
                  <td className="px-10 py-5 flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setEditingDept(dept);
                        setDeptName(dept.name);
                        setDescription(dept.description || "");
                        setIsModalOpen(true);
                      }}
                      className="bg-blue-100 text-blue-700 px-5 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dept._id, dept.name)}
                      className="bg-red-50 text-red-600 px-5 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 🟢 Modal สำหรับเพิ่ม/แก้ไข */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[45px] p-10 shadow-2xl border border-gray-100">
            <h2 className="text-2xl font-black text-blue-900 mb-6 italic uppercase tracking-tighter">
              {editingDept ? "Edit Department" : "New Department"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Department Name</label>
                <input
                  required
                  type="text"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full p-4 border border-gray-200 rounded-2xl outline-none font-bold focus:ring-2 ring-blue-500"
                  placeholder="เช่น IT, Marketing"
                />
              </div>

              {/* ✅ ช่องกรอกรายละเอียดที่เพิ่มใหม่ */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Description (รายละเอียด)</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 border border-gray-200 rounded-2xl outline-none font-bold focus:ring-2 ring-blue-500 min-h-[100px]"
                  placeholder="อธิบายหน้าที่ของแผนกนี้ (อย่างน้อย 10 ตัวอักษร)"
                />
                <p className="text-[9px] text-gray-400 mt-1 ml-2 italic">* ต้องเป็นตัวอักษรเท่านั้น และห้ามมีตัวเลข</p>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={resetForm} className="flex-1 py-4 font-bold text-gray-400 uppercase text-xs tracking-widest">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-blue-900 text-white font-black rounded-2xl shadow-xl uppercase text-xs tracking-widest active:scale-95">
                  {editingDept ? "Save" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}