"use client";

// ==========================================
// IMPORTS & CONSTANTS
// ==========================================
import { useState, useEffect, useMemo } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const API_BASE_URL = "http://192.168.10.101:3000/api";

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState("ALL");
  
  // ✅ ปรับ startDate ให้เก็บค่าแบบ string (DD/MM/YYYY)
  const [startDate, setStartDate] = useState("");
  
  const [selectedSubAction, setSelectedSubAction] = useState("ALL");

  const router = useRouter();
  const token = Cookies.get("access_token");

  // ✨ ฟังก์ชันจัดการการพิมพ์วันที่ (Auto-masking วดป)
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 8);
    if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
    if (v.length > 5) v = v.slice(0, 5) + "/" + v.slice(5);
    setStartDate(v);
  };

  useEffect(() => {
    const role = Cookies.get("user_role")?.toUpperCase();
    if (role !== "ADMIN") {
      Swal.fire({
        icon: "error",
        title: "ACCESS DENIED",
        text: "เฉพาะผู้ดูแลระบบเท่านั้น",
        confirmButtonColor: "#1E40AF",
      }).then(() => router.push("/orgspace/dashboard"));
    } else {
      setUserRole(role);
      fetchLogs();
    }
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/audit-logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const availableActions = [
    { label: "ALL EVENTS", value: "ALL" },
    { label: "🔑 LOGIN SESSIONS", value: "LOGIN" },
    { label: "👤 USER MGMT", value: "USER" },
    { label: "🏢 DEPT MGMT", value: "DEPARTMENT" },
    { label: "🚪 ROOM MGMT", value: "ROOM" },
    { label: "📅 BOOKING MGMT", value: "BOOKING" },
    { label: "🛡️ SECURITY & PW", value: "PASSWORD" },
  ];

  const allSubActions = [
    { label: "Select Action...", value: "ALL" },
    { label: "CREATE USER", value: "CREATE_USER" },
    { label: "UPDATE USER", value: "UPDATE_USER" },
    { label: "DELETE USER", value: "DELETE_USER" },
    { label: "LOGIN", value: "LOGIN" },
    { label: "PW RESET REQ", value: "PASSWORD_RESET_APPROVED" },
    { label: "PW CHANGE", value: "PASSWORD_CHANGE" },
    { label: "REQ RESET PW", value: "REQUEST_RESET_PASSWORD" },
    { label: "EXPORT REPORT", value: "EXPORT_REPORT" },
    { label: "ACCOUNT LOCKED", value: "ACCOUNT_LOCKED" },
    { label: "CREATE DEPT", value: "CREATE_DEPARTMENT" },
    { label: "UPDATE DEPT", value: "UPDATE_DEPARTMENT" },
    { label: "DELETE DEPT", value: "DELETE_DEPARTMENT" },
    { label: "CREATE ROOM", value: "CREATE_ROOM" },
    { label: "UPDATE ROOM", value: "UPDATE_ROOM" },
    { label: "DELETE ROOM", value: "DELETE_ROOM" },
    { label: "CREATE BOOKING", value: "CREATE_BOOKING" },
    { label: "CANCEL BOOKING", value: "CANCEL_BOOKING" },
  ];

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const search = searchTerm.toLowerCase();
      
      const matchSearch =
        (log.actorInfo?.full_name || "").toLowerCase().includes(search) ||
        (log.details || "").toLowerCase().includes(search) ||
        (log.targetName || "").toLowerCase().includes(search);

      const matchActionGroup = 
        selectedAction === "ALL" || 
        log.action === selectedAction || 
        log.action.includes(selectedAction);

      const matchSubAction = 
        selectedSubAction === "ALL" || 
        log.action === selectedSubAction;

      // ✅ แปลง วดป (DD/MM/YYYY) เป็น ISO เพื่อใช้กรอง
      let matchDate = true;
      if (startDate.length === 10) {
        const [d, m, y] = startDate.split("/");
        const isoDatePrefix = `${y}-${m}-${d}`;
        matchDate = log.createdAt.startsWith(isoDatePrefix);
      }

      return matchSearch && matchActionGroup && matchSubAction && matchDate;
    });
  }, [logs, searchTerm, selectedAction, startDate, selectedSubAction]);

  const getActionBadge = (action: string) => {
    const baseStyle = "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm border whitespace-nowrap";
    if (action.includes('CREATE') || action === 'LOGIN') 
      return `${baseStyle} bg-emerald-50 text-emerald-600 border-emerald-100`;
    if (action.includes('UPDATE') || action.includes('PASSWORD') || action.includes('CHANGE')) 
      return `${baseStyle} bg-amber-50 text-amber-600 border-amber-100`;
    if (action.includes('DELETE') || action.includes('CANCEL') || action === 'ACCOUNT_LOCKED') 
      return `${baseStyle} bg-red-50 text-red-600 border-red-100`;
    return `${baseStyle} bg-blue-50 text-blue-600 border-blue-100`;
  };

  if (userRole !== "ADMIN") return null;

  return (
    <div className="p-8 min-h-screen bg-[#F8FAFC] text-black animate-in fade-in duration-700 font-sans">

      {/* HEADER SECTION */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-blue-900 italic uppercase tracking-tighter leading-none">
            Audit <span className="text-blue-600">Intelligence</span>
          </h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-3 italic opacity-70">
            Tracking Every Movement in ORGSPACE
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="bg-blue-900 text-white px-8 py-4 rounded-[20px] font-black shadow-xl hover:bg-black transition-all uppercase text-[10px] tracking-widest active:scale-95"
        >
          Refresh Logs
        </button>
      </div>

      {/* ✅ FILTER BAR */}
      <div className="mb-8 bg-white p-6 rounded-[35px] shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
        <div>
          <label className="text-[9px] font-black text-gray-400 uppercase ml-2 mb-2 block tracking-widest">
            Operator Search
          </label>
          <input
            type="text"
            placeholder="ชื่อผู้ใช้งาน..."
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-xs focus:ring-2 ring-blue-500 transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <label className="text-[9px] font-black text-gray-400 uppercase ml-2 mb-2 block tracking-widest">
            Action Detail
          </label>
          <select
            value={selectedSubAction}
            onChange={(e) => setSelectedSubAction(e.target.value)}
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-xs text-blue-900 focus:ring-2 ring-blue-500 cursor-pointer appearance-none transition-all shadow-inner"
          >
            {allSubActions.map((act) => (
              <option key={act.value} value={act.value}>{act.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[9px] font-black text-gray-400 uppercase ml-2 mb-2 block tracking-widest">
            Filter by Category
          </label>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-xs text-blue-900 focus:ring-2 ring-blue-500 cursor-pointer appearance-none transition-all shadow-inner"
          >
            {availableActions.map((act) => (
              <option key={act.value} value={act.value}>{act.label}</option>
            ))}
          </select>
        </div>

        {/* ✅ ส่วนกรองวันที่แบบ วดป (DD/MM/YYYY) */}
        <div>
          <label className="text-[9px] font-black text-gray-400 uppercase ml-2 mb-2 block tracking-widest">
            Select Date (วดป)
          </label>
          <input
            type="text"
            placeholder="วว/ดด/ปปปป"
            maxLength={10}
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-xs text-blue-900 focus:ring-2 ring-blue-500 shadow-inner"
            value={startDate}
            onChange={handleDateChange}
          />
        </div>
      </div>

      {/* LOGS TABLE */}
      {loading ? (
        <div className="py-40 flex justify-center items-center font-black italic text-blue-900 tracking-[0.5em] animate-pulse uppercase text-center text-sm">
          Syncing Security Data...
        </div>
      ) : (
        <div className="bg-white rounded-[50px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden shadow-inner">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[10px] uppercase font-black italic tracking-widest">
                  <th className="px-10 py-7">Timestamp</th>
                  <th className="px-10 py-7">Who</th>
                  <th className="px-10 py-7 text-center">Action</th>
                  <th className="px-10 py-7">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-black">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-blue-50/20 transition-all group">
                    <td className="px-10 py-6">
                      <div className="font-bold text-xs">
                        {new Date(log.createdAt).toLocaleDateString('th-TH')}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono italic">
                        {new Date(log.createdAt).toLocaleTimeString('th-TH')}
                      </div>
                    </td>

                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-black text-xs italic shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                          {log.actorInfo?.full_name?.charAt(0) || 'S'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase text-blue-900">{log.actorInfo?.full_name || "System"}</span>
                          <span className="text-[9px] text-gray-400 font-bold uppercase italic">Role: {log.actorInfo?.role || "SERVER"}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-10 py-6 text-center">
                      <span className={getActionBadge(log.action)}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="px-10 py-6">
                      <div className="flex flex-col gap-2 min-w-[320px]">
                        <div className="text-[11px] font-black text-gray-800 italic uppercase tracking-tight">{log.details}</div>
                        
                        {log.action === 'LOGIN' && (
                          <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 text-[9px] font-bold text-emerald-700 uppercase italic">🔓 User Access Granted</div>
                        )}
                        {(log.action.includes('BOOKING')) && (
                          <div className={`p-2.5 rounded-xl border text-[9px] font-bold uppercase italic ${log.action.includes('CREATE') ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                            {log.action.includes('CREATE') ? '📌 New Reservation' : '🚫 Cancelled Reservation'}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="py-32 text-center text-gray-300 font-black italic uppercase tracking-[0.3em] opacity-40">Zero activity found</div>
          )}
        </div>
      )}
    </div>
  );
}