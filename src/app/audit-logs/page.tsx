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
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState("ALL");
  const [startDate, setStartDate] = useState("");

  // Navigation & Auth
  const router = useRouter();
  const token = Cookies.get("access_token");

  // ==========================================
  // LIFECYCLE & AUTH CHECK
  // ==========================================
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

  // ==========================================
  // DATA FETCHING
  // ==========================================
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

  // ==========================================
  // FILTER CONFIGURATION
  // ==========================================
  const availableActions = [
    { label: "ALL EVENTS", value: "ALL" },
    { label: "LOGIN / LOGOUT", value: "LOGIN" },
    { label: "CREATE BOOKING", value: "CREATE_BOOKING" },
    { label: "CANCEL BOOKING", value: "CANCEL_BOOKING" },
    { label: "CREATE USER", value: "CREATE_USER" },
    { label: "UPDATE USER", value: "UPDATE_USER" },
    { label: "DELETE USER", value: "DELETE_USER" },
  ];

  // ==========================================
  // FILTERED LOGS COMPUTATION
  // ==========================================
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const search = searchTerm.toLowerCase();
      const matchSearch =
        (log.actorInfo?.full_name || "").toLowerCase().includes(search) ||
        (log.details || "").toLowerCase().includes(search) ||
        (log.targetName || "").toLowerCase().includes(search);

      const matchAction = selectedAction === "ALL" || log.action === selectedAction;
      const matchDate = !startDate || log.createdAt.startsWith(startDate);

      return matchSearch && matchAction && matchDate;
    });
  }, [logs, searchTerm, selectedAction, startDate]);

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================
  const getActionBadge = (action: string) => {
    const baseStyle = "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm border";
    if (action.includes('CREATE') || action === 'LOGIN') return `${baseStyle} bg-emerald-50 text-emerald-600 border-emerald-100`;
    if (action.includes('UPDATE')) return `${baseStyle} bg-amber-50 text-amber-600 border-amber-100`;
    if (action.includes('DELETE') || action.includes('CANCEL')) return `${baseStyle} bg-red-50 text-red-600 border-red-100`;
    return `${baseStyle} bg-blue-50 text-blue-600 border-blue-100`;
  };

  // ==========================================
  // ACCESS CONTROL
  // ==========================================
  if (userRole !== "ADMIN") return null;

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="p-8 min-h-screen bg-[#F8FAFC] text-black animate-in fade-in duration-700 font-sans">

      {/* ==========================================
          HEADER SECTION
          ========================================== */}
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

      {/* ==========================================
          FILTER BAR
          ========================================== */}
      <div className="mb-8 bg-white p-6 rounded-[35px] shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
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
            Category
          </label>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-xs text-blue-900 focus:ring-2 ring-blue-500 cursor-pointer appearance-none transition-all shadow-inner"
          >
            {availableActions.map((act) => (
              <option key={act.value} value={act.value}>
                {act.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[9px] font-black text-gray-400 uppercase ml-2 mb-2 block tracking-widest">
            Pick Date
          </label>
          <input
            type="date"
            className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-xs text-blue-900 focus:ring-2 ring-blue-500 shadow-inner"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
      </div>

      {/* ==========================================
          LOGS TABLE
          ========================================== */}
      {loading ? (
        <div className="py-40 flex justify-center items-center font-black italic text-blue-900 tracking-[0.5em] animate-pulse uppercase text-center text-sm">
          Syncing Security Data...
        </div>
      ) : (
        <div className="bg-white rounded-[50px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.05)] border border-gray-50 overflow-hidden shadow-inner">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[10px] uppercase font-black italic tracking-widest">
                  <th className="px-10 py-7">Timestamp</th>
                  <th className="px-10 py-7">Operator (Who)</th>
                  <th className="px-10 py-7 text-center">Action</th>
                  <th className="px-10 py-7">Activity Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-black">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-blue-50/20 transition-all group">

                    {/* ==========================================
                        TIMESTAMP COLUMN
                        ========================================== */}
                    <td className="px-10 py-6">
                      <div className="font-bold text-xs">
                        {new Date(log.createdAt).toLocaleDateString('th-TH')}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono italic">
                        {new Date(log.createdAt).toLocaleTimeString('th-TH')}
                      </div>
                    </td>

                    {/* ==========================================
                        OPERATOR INFO COLUMN
                        ========================================== */}
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-black text-xs italic shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                          {log.actorInfo?.full_name?.charAt(0) || 'S'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase text-blue-900">
                            {log.actorInfo?.full_name || "System Auto"}
                          </span>
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter italic">
                            Role: {log.actorInfo?.role || "SERVER"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* ==========================================
                        ACTION BADGE COLUMN
                        ========================================== */}
                    <td className="px-10 py-6 text-center">
                      <span className={getActionBadge(log.action)}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* ==========================================
                        ACTIVITY DETAILS COLUMN
                        ========================================== */}
                    <td className="px-10 py-6">
                      <div className="flex flex-col gap-2 min-w-[320px]">
                        {/* Main Activity Description */}
                        <div className="text-[11px] font-black text-gray-800 italic uppercase tracking-tight">
                          {log.details}
                        </div>

                        {/* Special Case: LOGIN Activity */}
                        {log.action === 'LOGIN' && (
                          <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 flex items-center gap-2">
                            <span className="text-emerald-600 text-[10px]">🔓</span>
                            <span className="text-[10px] font-bold text-emerald-700 uppercase italic">
                              Session started by {log.actorInfo?.full_name}
                            </span>
                          </div>
                        )}

                        {/* Special Case: BOOKING Activities */}
                        {(log.action === 'CREATE_BOOKING' || log.action === 'CANCEL_BOOKING') && (
                          <div className={`p-3 rounded-2xl border flex flex-col gap-1 ${log.action === 'CREATE_BOOKING' ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
                            <div className="flex justify-between items-center">
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${log.action === 'CREATE_BOOKING' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'}`}>
                                {log.action === 'CREATE_BOOKING' ? 'New Reservation' : 'Cancellation'}
                              </span>
                              <span className="text-[9px] font-black text-gray-400 italic uppercase">
                                Target: {log.newValue?.roomName || "Meeting Room"}
                              </span>
                            </div>
                            <p className="text-[10px] font-bold text-blue-900 mt-1 uppercase italic">
                              "{log.newValue?.title || "No Title"}"
                            </p>
                            <p className="text-[9px] font-medium text-gray-500 italic">
                              Performed by: {log.actorInfo?.full_name}
                            </p>
                          </div>
                        )}

                        {/* Special Case: USER Management Activities */}
                        {log.action.includes('USER') && (
                          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 text-[9px] font-bold text-gray-600 italic">
                            Target User: {log.targetName || log.newValue?.full_name || "N/A"}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ==========================================
              EMPTY STATE
              ========================================== */}
          {filteredLogs.length === 0 && (
            <div className="py-32 text-center text-gray-300 font-black italic uppercase tracking-[0.3em] opacity-40">
              Zero activity found in this period
            </div>
          )}
        </div>
      )}
    </div>
  );
}