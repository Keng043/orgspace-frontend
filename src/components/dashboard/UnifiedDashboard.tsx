"use client";

import { useState, useEffect, useMemo } from "react";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const API_BASE_URL = "http://192.168.10.101:3000/api";

// --- 1. EditEmployeeModal (คงเดิมตามที่คุณส่งมา) ---
function EditEmployeeModal({ employee, onClose, onRefresh, userRole }: any) {
  const [departments, setDepartments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    full_name: employee?.full_name || "",
    position: employee?.position || "",
    salary: employee?.salary || 0,
    role: employee?.role || "EMPLOYEE",
    departmentId:
      typeof employee?.department === "object"
        ? employee.department?._id || ""
        : employee?.department || "",
  });

  const isAdmin = userRole === "ADMIN";
  const isHR = userRole === "HR";
  const canEditGeneral = isAdmin || isHR || userRole === "EMPLOYEE";
  const canEditSalary = isAdmin || isHR;
  const canEditRole = isAdmin;
  const isManager = userRole === 'MANAGER'; //เพิ่ม

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const token = Cookies.get("access_token");
        const res = await fetch(`${API_BASE_URL}/departments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setDepartments(Array.isArray(data) ? data : data.data || []);
        }
      } catch (err) {
        console.error("Fetch Dept Error:", err);
      }
    };
    fetchDepts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get("access_token");
    const empId = employee?._id || employee?.id;

    try {
      const payload: any = {
        full_name: formData.full_name,
        position: formData.position,
        department: formData.departmentId,
      };
      if (canEditSalary) payload.salary = Number(formData.salary);
      if (canEditRole) payload.role = formData.role;

      const response = await fetch(`${API_BASE_URL}/users/${empId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: "อัปเดตสำเร็จ!",
          confirmButtonColor: "#1E3A8A",
          timer: 2000,
        });
        onRefresh();
        onClose();
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: "error",
          title: "ไม่สำเร็จ",
          text: errorData.message,
          confirmButtonColor: "#1E3A8A",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 text-black animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[45px] p-10 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto scale-in-center text-black">
        <h2 className="text-3xl font-black text-blue-900 mb-6 italic uppercase tracking-tighter leading-none">
          Edit Member
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">
                Full Name
              </label>
              <input
                required
                type="text"
                value={formData.full_name || ""}
                disabled={!canEditGeneral}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold focus:ring-2 ring-blue-500 text-black"
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">
                Position
              </label>
              <input
                required
                type="text"
                value={formData.position || ""}
                disabled={!canEditGeneral}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold focus:ring-2 ring-blue-500 text-black"
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-blue-600 uppercase ml-2 tracking-widest underline decoration-blue-200">
                Department
              </label>
              <select
                required
                value={formData.departmentId}
                disabled={!canEditGeneral}
                className="w-full p-4 bg-blue-50 border border-blue-100 rounded-2xl outline-none font-bold focus:ring-2 ring-blue-500 cursor-pointer text-black"
                onChange={(e) =>
                  setFormData({ ...formData, departmentId: e.target.value })
                }
              >
                <option value="">เลือกแผนก</option>
                {departments.map((dept: any) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">
                Salary (฿)
              </label>
              <input
                required
                type="number"
                value={formData.salary ?? 0}
                disabled={!canEditSalary}
                className="w-full p-4 border border-blue-600 rounded-2xl outline-none font-black text-blue-900 focus:ring-2 ring-blue-500"
                onChange={(e) =>
                  setFormData({ ...formData, salary: Number(e.target.value) })
                }
              />
            </div>
          </div>
          {canEditRole && (
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">
                Role
              </label>
              <select
                value={formData.role || "EMPLOYEE"}
                className="w-full p-4 border border-gray-200 rounded-2xl outline-none font-bold bg-white cursor-pointer text-black"
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="MANAGER">MANAGER</option>
                {isAdmin && <option value="HR">HR</option>}
              </select>
            </div>
          )}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-black text-white font-black rounded-3xl shadow-xl uppercase text-[10px] tracking-widest active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-blue-900 text-white font-black rounded-3xl shadow-xl uppercase text-[10px] tracking-widest active:scale-95 transition-all"
            >
              Confirm Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- 2. UnifiedDashboard ---
export default function UnifiedDashboard({ userRole }: { userRole: string }) {
  const router = useRouter();
  const [dataList, setDataList] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // ✅ 🔔 State สำหรับคำขอรีเซ็ตรหัสผ่าน (Pending Requests)
  const [resetRequests, setResetRequests] = useState<any[]>([]);

  // States สำหรับการกรอง
  const [searchName, setSearchName] = useState("");
  const [searchDept, setSearchDept] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [minSalary, setMinSalary] = useState<string>("");
  const [maxSalary, setMaxSalary] = useState<string>("");
  const [sortBy, setSortBy] = useState<"salary" | "full_name" | "position">(
    "full_name",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const isAdmin = userRole === "ADMIN";
  const isHR = userRole === "HR";
  const isManager = userRole === "MANAGER";
  const isEmployee = userRole === "EMPLOYEE";
  

  // ✅ fetchData — ดึงข้อมูลตามสิทธิ์แต่ละ Role
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("access_token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // 1. ดึง Profile ตัวเองก่อนเสมอ
      const profRes = await fetch(`${API_BASE_URL}/users/profile`, { headers });
      if (!profRes.ok) throw new Error("Unauthorized");
      const profData = await profRes.json();
      setCurrentUser(profData);

      let list: any[] = [];

      if (profData.role === "ADMIN" || profData.role === "HR") {
        // ✅ ADMIN & HR → ดูได้ทุกคน
        const userRes = await fetch(`${API_BASE_URL}/users`, { headers });
        const userData = await userRes.json();
        list = Array.isArray(userData) ? userData : userData.data || [];

      } else if (profData.role === "MANAGER") {
        // ✅ MANAGER → ดูตัวเองและพนักงานในแผนกเดียวกัน
        // ดึงแผนกของตัวเองจาก profile
        const myDeptId =
          typeof profData.department === "object"
            ? profData.department?._id
            : profData.department;

        if (myDeptId) {
          // ดึงรายชื่อทุกคนในแผนก (ต้องมี API endpoint นี้บน Backend)
          const deptRes = await fetch(
            `${API_BASE_URL}/users?department=${myDeptId}`,
            { headers }
          );
          if (deptRes.ok) {
            const deptData = await deptRes.json();
            list = Array.isArray(deptData) ? deptData : deptData.data || [];
          } else {
            // Fallback: ถ้า Backend ยังไม่รองรับ query param → กรองฝั่ง client
            const allRes = await fetch(`${API_BASE_URL}/users`, { headers });
            if (allRes.ok) {
              const allData = await allRes.json();
              const allUsers: any[] = Array.isArray(allData)
                ? allData
                : allData.data || [];
              list = allUsers.filter((u) => {
                const uDeptId =
                  typeof u.department === "object"
                    ? u.department?._id
                    : u.department;
                return (
                  String(uDeptId) === String(myDeptId) ||
                  String(u._id || u.id) === String(profData._id || profData.id)
                );
              });
            }
          }
        } else {
          // ถ้าไม่มีแผนก → เห็นแค่ตัวเอง
          list = [profData];
        }

      } else {
        // ✅ EMPLOYEE → เห็นแค่ตัวเอง
        list = [profData];
      }

      setDataList(list);

      // ดึง Reset Requests เฉพาะ Admin
      if (profData.role === "ADMIN") {
        const reqRes = await fetch(`${API_BASE_URL}/auth/admin/reset-requests`, { headers });
        if (reqRes.ok) {
          setResetRequests(await reqRes.json());
        }
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      if (err.message === "Unauthorized") router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  // ✅ ฟังก์ชันอนุมัติ (ใช้ Navigator API คัดลอกลิงก์ทันที)
  const handleApproveReset = async (requestId: string | null, targetUserId: string, userName: string) => {
    const result = await Swal.fire({
      title: "Approve Reset?",
      text: `ยืนยันการอนุมัติสำหรับคุณ ${userName}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1E3A8A",
      confirmButtonText: "Generate Reset Link",
      customClass: { popup: "rounded-[35px]" },
    });

    if (!result.isConfirmed) return;

    try {
      const token = Cookies.get("access_token");
      const payload: any = { targetUserId };
      if (requestId && requestId !== "") payload.requestId = requestId;

      const res = await fetch(`${API_BASE_URL}/auth/admin/request-reset`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        // 🔗 สร้างลิงก์ที่สมบูรณ์
        const linkToken = data.token || data.resetToken;
        const resetLink = `${window.location.origin}/auth/reset-password/${linkToken}`;

        // 📋 พยายามคัดลอกลง Clipboard อัตโนมัติ (ถ้าเบราว์เซอร์ยอม)
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(resetLink);
        }

        // 🎊 แสดงหน้าต่างแจ้งเตือนพร้อมลิงก์
        await Swal.fire({
          icon: "success",
          title: "สร้างลิงก์สำเร็จ!",
          html: `
            <div class="mt-4 text-left">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Reset Link:</p>
              <input id="res-link-input" value="${resetLink}" readonly 
                class="w-full p-4 bg-blue-50 border border-blue-100 rounded-2xl text-[11px] font-mono text-blue-700 mb-4 shadow-inner">
              <button onclick="const copyText = document.getElementById('res-link-input'); copyText.select(); document.execCommand('copy');" 
                class="w-full py-3 bg-blue-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                Copy Link Again
              </button>
            </div>
          `,
          confirmButtonColor: "#1E3A8A",
          customClass: { popup: "rounded-[35px]" },
        });

        fetchData(); // รีโหลดข้อมูลหน้าจอ
      } else {
        throw new Error(data.message || "ไม่สามารถอนุมัติได้");
      }
    } catch (err: any) {
      Swal.fire("Error", err.message || "เกิดข้อผิดพลาด", "error");
    }
  };

  // ✅ ย้าย Event Listener เข้ามาข้างในเพื่อให้เรียกใช้ handleApproveReset ได้
  useEffect(() => {
    const handleEvent = (e: any) => {
      const { rid, uid, name } = e.detail;
      handleApproveReset(rid, uid, name);
    };
    window.addEventListener("approve-reset" as any, handleEvent);
    return () =>
      window.removeEventListener("approve-reset" as any, handleEvent);
  }, [resetRequests]);

  const filteredAndSortedData = useMemo(() => {
    let result = dataList.filter((emp) => {
      const nameMatch = (emp.full_name || "")
        .toLowerCase()
        .includes(searchName.toLowerCase());
      const deptVal =
        typeof emp.department === "object"
          ? emp.department?.name
          : emp.department;
      const deptMatch = (deptVal || "")
        .toLowerCase()
        .includes(searchDept.toLowerCase());
      const roleMatch = filterRole === "ALL" || emp.role === filterRole;
      const salary = Number(emp.salary || 0);
      const minMatch = minSalary === "" || salary >= Number(minSalary);
      const maxMatch = maxSalary === "" || salary <= Number(maxSalary);
      return nameMatch && deptMatch && roleMatch && minMatch && maxMatch;
    });

    return result.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (sortBy === "salary")
        return sortOrder === "asc"
          ? Number(valA) - Number(valB)
          : Number(valB) - Number(valA);
      valA = (valA || "").toString().toLowerCase();
      valB = (valB || "").toString().toLowerCase();
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [
    dataList,
    searchName,
    searchDept,
    filterRole,
    minSalary,
    maxSalary,
    sortBy,
    sortOrder,
  ]);

  const toggleSort = (field: "salary" | "full_name" | "position") => {
    if (sortBy === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  useEffect(() => {
    if (userRole) fetchData();
  }, [userRole]);

  if (loading)
    return (
      <div className="p-20 text-center animate-pulse font-black text-blue-900 uppercase italic tracking-widest text-[10px]">
        Processing Database...
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* 🔔 Notification Banner สำหรับ Admin */}
      {isAdmin && resetRequests.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-[35px] flex items-center justify-between animate-bounce-short shadow-sm shadow-amber-100">
          <div className="flex items-center gap-4 text-black">
            <div className="bg-amber-500 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black italic shadow-lg">
              !
            </div>
            <div>
              <p className="text-amber-900 font-black text-xs uppercase italic tracking-tighter leading-none">
                Password Reset Pending
              </p>
              <p className="text-amber-600 text-[9px] font-bold uppercase tracking-widest mt-1">
                มีคำขอที่รอการอนุมัติ {resetRequests.length} รายการ
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              Swal.fire({
                title: "RESET REQUESTS",
                html: `
                  <div class="space-y-2 mt-4 text-left text-black">
                    ${resetRequests
                      .map(
                        (req) => `
                      <div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div class="flex flex-col text-left">
                          <span class="font-black text-[11px] text-blue-900 uppercase italic leading-none">${req.user?.full_name}</span>
                          <span class="text-[8px] text-gray-400 font-bold uppercase mt-1">ID: ${req.user?.userId || "N/A"}</span>
                        </div>
                        <button onclick="window.dispatchEvent(new CustomEvent('approve-reset', { detail: { rid: '${req._id}', uid: '${req.user?.userId}', name: '${req.user?.full_name}' } }))" class="bg-blue-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase shadow-md active:scale-95 transition-all">Approve</button>
                      </div>
                    `,
                      )
                      .join("")}
                  </div>
                `,
                showConfirmButton: false,
                customClass: { popup: "rounded-[40px]" },
                didOpen: () => {
                  // ผูก Event ให้ปุ่มใน Swal
                  resetRequests.forEach((req) => {
                    const btn = document.getElementById(`btn-${req._id}`);
                    if (btn)
                      btn.onclick = () => {
                        Swal.close();
                        handleApproveReset(
                          req._id,
                          req.user?.userId,
                          req.user?.full_name,
                        );
                      };
                  });
                },
              });
            }}
            className="bg-white text-amber-600 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase shadow-sm border border-amber-100 hover:bg-amber-500 hover:text-white transition-all active:scale-95 shadow-inner"
          >
            View Requests
          </button>
        </div>
      )}

      {/* 🔍 Advanced Filter Section */}
      {!isEmployee && (
        <div className="bg-white p-7 rounded-[35px] border border-gray-100 shadow-sm space-y-5 shadow-inner text-black">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-black">
            <div>
              <label className="text-[9px] font-black text-gray-400 uppercase ml-2 mb-2 block tracking-widest italic leading-none">
                Search Member
              </label>
              <input
                placeholder="ชื่อพนักงาน..."
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-xs focus:ring-2 ring-blue-500 transition-all text-black shadow-inner"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[9px] font-black text-gray-400 uppercase ml-2 mb-2 block tracking-widest italic leading-none text-black">
                Department
              </label>
              <input
                placeholder="ค้นหาแผนก..."
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-xs focus:ring-2 ring-blue-500 transition-all text-black shadow-inner"
                value={searchDept}
                onChange={(e) => setSearchDept(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[9px] font-black text-blue-600 uppercase ml-2 mb-2 block tracking-widest italic underline decoration-blue-100 leading-none">
                Salary Range (฿)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-1/2 p-4 bg-blue-50/30 border border-blue-100 rounded-2xl outline-none font-bold text-xs text-blue-900 focus:ring-2 ring-blue-400 transition-all shadow-inner"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                />
                <span className="text-gray-300 font-bold italic leading-none">
                  ~
                </span>
                <input
                  type="number"
                  placeholder="Max"
                  className="w-1/2 p-4 bg-blue-50/30 border border-blue-100 rounded-2xl outline-none font-bold text-xs text-blue-900 focus:ring-2 ring-blue-400 transition-all shadow-inner"
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between gap-4 pt-4 border-t border-gray-50">
            <div className="flex flex-wrap gap-2">
              {["ALL", "ADMIN", "HR", "MANAGER", "EMPLOYEE"].map((role) => (
                <button
                  key={role}
                  onClick={() => setFilterRole(role)}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${filterRole === role ? "bg-blue-900 text-white shadow-lg shadow-blue-200" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}
                >
                  {role}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-gray-300 uppercase italic leading-none">
                Sort by:
              </span>
              {[
                { id: "full_name", label: "ก-ฮ" },
                { id: "salary", label: "เงินเดือน" },
                { id: "position", label: "ตำแหน่ง" },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => toggleSort(btn.id as any)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${sortBy === btn.id ? "bg-blue-600 text-white shadow-lg" : "bg-white border border-gray-100 text-gray-400 hover:border-blue-200"}`}
                >
                  {btn.label}{" "}
                  {sortBy === btn.id && (sortOrder === "asc" ? "↑" : "↓")}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 📋 Table Section */}
      <div className="bg-white rounded-[45px] shadow-sm border border-gray-50 overflow-hidden overflow-x-auto shadow-inner text-black font-bold">
        <table className="w-full text-left font-bold text-black">
          <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[10px] uppercase font-black italic tracking-widest text-black font-bold">
            <tr className="text-black font-bold">
              <th
                className="px-10 py-6 cursor-pointer hover:text-blue-600 text-black font-bold"
                onClick={() => toggleSort("full_name")}
              >
                Member
              </th>
              <th
                className="px-10 py-6 cursor-pointer hover:text-blue-600 text-black font-bold"
                onClick={() => toggleSort("position")}
              >
                Position / Dept
              </th>
              {(isAdmin || isHR || !isEmployee) && (
                <th
                  className="px-10 py-6 cursor-pointer hover:text-blue-600 text-black font-bold"
                  onClick={() => toggleSort("salary")}
                >
                  Salary
                </th>
              )}
              <th className="px-10 py-6 text-center text-black font-bold">
                Manage
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-black">
            {filteredAndSortedData.map((emp) => {
              if (!emp) return null;
              const empDatabaseId = emp._id || emp.id; 
              const empEmployeeCode = emp.userId; // 👈 ใช้รหัสพนักงานส่ง Reset
              const isMe =
                String(empDatabaseId) ===
                String(currentUser?._id || currentUser?.id);
              const deptName =
                typeof emp.department === "object"
                  ? emp.department?.name
                  : emp.department;
              const canEdit = isAdmin
                ? emp.role !== "ADMIN"
                : isHR
                  ? emp.role !== "ADMIN" && emp.role !== "HR"
                  : false;
              const canDelete = isAdmin
                ? emp.role !== "ADMIN"
                : isHR
                  ? emp.role === "MANAGER" || emp.role === "EMPLOYEE"
                  : false;
              return (
                <tr
                  key={empDatabaseId}
                  className="hover:bg-blue-50/10 transition-colors group text-black"
                >
                  <td className="px-10 py-5 text-black font-bold">
                    <div className="flex items-center gap-4 text-black">
                      <div className="h-10 w-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-900 font-black text-xs shadow-sm italic text-black">
                        {String(emp.full_name || "U").charAt(0)}
                      </div>
                      <div className="flex flex-col text-black">
                        <span className="text-gray-900 font-black text-sm leading-tight text-black">
                          {emp.full_name}
                        </span>
                        {isMe && (
                          <span className="text-[8px] bg-blue-900 text-white px-2 py-0.5 rounded-md w-fit mt-1 uppercase tracking-tighter">
                            YOU
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-5 text-[10px] text-black">
                    <div className="flex flex-col">
                      <span className="text-blue-600 font-black uppercase leading-none">
                        {emp.position || "Staff"}
                      </span>
                      <span className="text-gray-400 italic uppercase tracking-tighter mt-1">
                        {deptName || "No Dept"}
                      </span>
                    </div>
                  </td>
                  {(isAdmin || isHR || !isEmployee) && (
                    <td className="px-10 py-5 font-mono text-blue-900 font-black italic text-xs">
                      {Number(emp.salary || 0).toLocaleString()} ฿
                    </td>
                  )}
                  <td className="px-10 py-5 text-center flex justify-center gap-2">
                    {isAdmin && !isMe && (
                      <button
                        onClick={() =>
                          // ✅ ส่งรหัสพนักงาน (empEmployeeCode) แทน ID MongoDB
                          handleApproveReset(null, empEmployeeCode, emp.full_name)
                        }
                        className="bg-amber-50 text-amber-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-amber-500 hover:text-white transition-all shadow-sm italic active:scale-95 shadow-inner"
                      >
                        🔑 Reset
                      </button>
                    )}
                    {canEdit ? (
                      <button
                        onClick={() => setEditingItem(emp)}
                        className="bg-blue-900 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-black transition-all active:scale-95 shadow-sm italic shadow-inner"
                      >
                        Edit
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-300 italic border px-4 py-2 rounded-xl border-dashed py-2 px-4 text-black">
                        Locked
                      </span>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => {
                          Swal.fire({
                            title: "DELETE?",
                            text: `Remove ${emp.full_name}?`,
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#EF4444",
                            confirmButtonText: "Confirm",
                            customClass: { popup: "rounded-[35px]" },
                          }).then(async (result) => {
                            if (result.isConfirmed) {
                              const token = Cookies.get("access_token");
                              const res = await fetch(
                                `${API_BASE_URL}/users/${empDatabaseId}`,
                                {
                                  method: "DELETE",
                                  headers: {
                                    Authorization: `Bearer ${token}`,
                                  },
                                },
                              );
                              if (res.ok) {
                                Swal.fire({
                                  icon: "success",
                                  title: "Deleted",
                                  timer: 1000,
                                  showConfirmButton: false,
                                });
                                fetchData();
                              }
                            }
                          });
                        }}
                        className="bg-red-50 text-red-600 px-5 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all shadow-sm italic active:scale-95 shadow-inner"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingItem && (
        <EditEmployeeModal
          employee={editingItem}
          userRole={userRole}
          onClose={() => setEditingItem(null)}
          onRefresh={fetchData}
        />
      )}
    </div>
  );
}