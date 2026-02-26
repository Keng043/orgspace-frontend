"use client";

import { useState, useEffect, useMemo } from "react";
import Cookies from "js-cookie";
import BookingForm from "@/components/booking/BookingForm";
import RoomManageModal from "@/components/booking/RoomManageModal";
import Swal from "sweetalert2";

export default function BookingPage() {
  const [activeTab, setActiveTab] = useState<"reserve" | "history" | "my-history">("reserve");
  const [rooms, setRooms] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]); 
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [roomSearch, setRoomSearch] = useState("");
  const [historySearch, setHistorySearch] = useState("");

  // ✅ 1. เพิ่ม State สำหรับเก็บค่าการกรอง Capacity และ Date
  const [filterCapacity, setFilterCapacity] = useState<string>(""); 
  const [filterDate, setFilterDate] = useState<string>(""); 

  const API_BASE = "http://192.168.10.101:3000/api";
  const token = Cookies.get("access_token");
  const userRole = (Cookies.get("user_role") || "EMPLOYEE").toUpperCase();
  const isAdmin = userRole === "ADMIN";

  useEffect(() => {
    setMounted(true);
    fetchProfile();
    fetchRooms();
    fetchAllHistory();
    fetchMyHistory();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setCurrentUser(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API_BASE}/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRooms(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) { console.error(err); }
  };

  const fetchAllHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/bookings?type=all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAllBookings(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) { console.error(err); }
  };

  const fetchMyHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/bookings?type=my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMyBookings(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const handleDeleteRoom = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: "DELETE ROOM?",
      text: `คุณต้องการลบห้อง "${name}" ใช่หรือไม่?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "DELETE",
      customClass: { popup: "rounded-[35px] font-sans italic" },
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_BASE}/rooms/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          Swal.fire({ icon: "success", title: "DELETED", timer: 1500, showConfirmButton: false });
          fetchRooms();
        }
      } catch (err) { console.error(err); }
    }
  };

  const handleCancelBooking = async (id: string, title: string) => {
    const result = await Swal.fire({
      title: "CONFIRM CANCEL?",
      text: `ยืนยันการยกเลิก "${title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "YES, CANCEL IT",
      customClass: { popup: "rounded-[35px] font-sans italic" },
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_BASE}/bookings/${id}/cancel`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (res.ok) {
          Swal.fire({ icon: "success", title: "SUCCESS", timer: 1500, showConfirmButton: false });
          fetchAllHistory(); fetchMyHistory(); fetchRooms();
        }
      } catch (err) { Swal.fire("Error", "Server Error", "error"); }
    }
  };

  // ✅ 2. ปรับปรุง filteredRooms ให้กรอง Capacity (ห้องต้องมีความจุมากกว่าหรือเท่ากับค่าที่กรอง)
  const filteredRooms = useMemo(() => {
    return rooms.filter(r => {
      const nameMatch = (r.name || "").toLowerCase().includes(roomSearch.toLowerCase());
      const capacityMatch = filterCapacity === "" || Number(r.capacity) >= Number(filterCapacity);
      return nameMatch && capacityMatch;
    });
  }, [rooms, roomSearch, filterCapacity]);

  // ✅ 3. ปรับปรุง filteredHistory ให้กรอง วันที่ (เทียบเฉพาะส่วนวันที่ YYYY-MM-DD)
  const filteredAllHistory = useMemo(() => {
    return allBookings.filter(b => {
      const titleMatch = (b.title || "").toLowerCase().includes(historySearch.toLowerCase());
      const dateMatch = filterDate === "" || b.startTime.startsWith(filterDate);
      return titleMatch && dateMatch;
    });
  }, [allBookings, historySearch, filterDate]);

  const filteredMyHistory = useMemo(() => {
    return myBookings.filter(b => {
      const titleMatch = (b.title || "").toLowerCase().includes(historySearch.toLowerCase());
      const dateMatch = filterDate === "" || b.startTime.startsWith(filterDate);
      return titleMatch && dateMatch;
    });
  }, [myBookings, historySearch, filterDate]);

  if (!mounted) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto text-black animate-in fade-in duration-700 font-sans min-h-screen">
      
      {/* 🟦 HEADER SECTION */}
      <div className="mb-10 flex justify-between items-end border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-5xl font-black text-blue-900 italic tracking-tighter uppercase leading-none text-black">Booking Center</h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3 italic text-black">
            Timeline / <span className="text-blue-600">Space Management</span>
          </p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <button 
              onClick={() => { setEditingRoom(null); setIsRoomModalOpen(true); }}
              className="bg-blue-900 text-white px-8 py-4 rounded-[22px] font-black shadow-xl hover:bg-black transition-all active:scale-95 uppercase text-[10px] tracking-widest italic"
            >
              Create Room
            </button>
          )}
          <button onClick={() => { fetchRooms(); fetchAllHistory(); fetchMyHistory(); }} className="bg-blue-900 text-white px-8 py-4 rounded-[22px] font-black shadow-xl hover:bg-black transition-all active:scale-95 uppercase text-[10px] tracking-widest italic">Sync Data</button>
        </div>
      </div>

      {/* 📑 TABS SECTION & ADVANCED FILTERS */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex bg-gray-100 p-1.5 rounded-[25px] shadow-inner border border-gray-200/50">
          <button onClick={() => setActiveTab("reserve")} className={`px-10 py-3.5 rounded-[20px] text-[10px] font-black transition-all uppercase italic ${activeTab === "reserve" ? "bg-white text-blue-900 shadow-md" : "text-gray-400"}`}>Available Spaces</button>
          <button onClick={() => setActiveTab("history")} className={`px-10 py-3.5 rounded-[20px] text-[10px] font-black transition-all uppercase italic ${activeTab === "history" ? "bg-white text-blue-900 shadow-md" : "text-gray-400"}`}>Global Schedule</button>
          <button onClick={() => setActiveTab("my-history")} className={`px-10 py-3.5 rounded-[20px] text-[10px] font-black transition-all uppercase italic ${activeTab === "my-history" ? "bg-white text-blue-900 shadow-md" : "text-gray-400"}`}>My History</button>
        </div>

        {/* ✅ 4. เพิ่มส่วน UI สำหรับ Filter ใหม่ */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {activeTab === "reserve" ? (
             <input 
              type="number" 
              placeholder="👤 Capacity..." 
              className="p-4 bg-white border border-gray-100 rounded-[20px] shadow-inner font-bold text-xs w-32 outline-none focus:ring-2 ring-blue-100 transition-all" 
              value={filterCapacity} 
              onChange={(e) => setFilterCapacity(e.target.value)} 
             />
          ) : (
            <input 
              type="date" 
              className="p-4 bg-white border border-gray-100 rounded-[20px] shadow-inner font-bold text-xs outline-none focus:ring-2 ring-blue-100 transition-all" 
              value={filterDate} 
              onChange={(e) => setFilterDate(e.target.value)} 
            />
          )}
          <div className="relative w-full md:w-64">
            <input type="text" placeholder="Search title..." className="w-full p-4 pl-12 bg-white border border-gray-100 rounded-[25px] shadow-inner font-bold text-xs italic text-black focus:ring-4 ring-blue-50 outline-none transition-all" value={activeTab === "reserve" ? roomSearch : historySearch} onChange={(e) => activeTab === "reserve" ? setRoomSearch(e.target.value) : setHistorySearch(e.target.value)} />
            <span className="absolute left-5 top-1/2 -translate-y-1/2 opacity-40">🔍</span>
          </div>
        </div>
      </div>

      {activeTab === "reserve" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {filteredRooms.map(room => {
             const isOccupied = allBookings.some(b => 
               b.roomId?._id === room._id && b.status === 'APPROVED' && 
               new Date() >= new Date(b.startTime) && new Date() <= new Date(b.endTime)
             );

             return (
              <div key={room._id} className="bg-white rounded-[50px] p-10 border border-gray-50 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all group relative overflow-hidden text-black">
                <div className="flex justify-between items-start mb-8 relative z-10">
                   <div className="w-16 h-16 bg-blue-900 text-white rounded-3xl flex items-center justify-center text-2xl font-black italic shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">
                     {room.name.charAt(0)}
                   </div>
                   <div className="flex flex-col items-end gap-2">
                     {isAdmin && (
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => { setEditingRoom(room); setIsRoomModalOpen(true); }} className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-500 hover:text-white transition-all">✏️</button>
                         <button onClick={() => handleDeleteRoom(room._id, room.name)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-all">🗑️</button>
                       </div>
                     )}
                     <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border ${room.status === 'available' ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"}`}>
                       {room.status}
                     </span>
                     {isOccupied && <span className="text-[8px] font-black bg-amber-500 text-white px-3 py-1 rounded-lg uppercase italic animate-pulse shadow-md">Occupied Now</span>}
                   </div>
                </div>

                <h3 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tighter italic leading-none">{room.name}</h3>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-10 italic">Cap: {room.capacity} Persons</p>
                <button onClick={() => setSelectedRoom(room)} className="w-full py-5 bg-gray-900 text-white rounded-[25px] font-black shadow-xl hover:bg-blue-600 transition-all active:scale-95 uppercase text-[11px] tracking-[0.2em] italic text-white">Book Space</button>
              </div>
             );
           })}
        </div>
      ) : (
        <div className="bg-white rounded-[50px] border border-gray-100 overflow-hidden shadow-2xl shadow-blue-900/5 text-black">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black italic tracking-[0.2em]">
                <th className="px-10 py-8">Meeting / Room</th>
                <th className="px-10 py-8">Organized By</th>
                <th className="px-10 py-8">Time Slot</th>
                <th className="px-10 py-8 text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(activeTab === "history" ? filteredAllHistory : filteredMyHistory).map((item) => {
                const bookingOwnerId = String(item.userId?._id || item.userId || "");
                const currentUserId = String(currentUser?._id || currentUser?.id || "");
                const isOwner = currentUserId !== "" && bookingOwnerId === currentUserId;
                const canCancel = isAdmin || isOwner;

                return (
                  <tr key={item._id} className="hover:bg-blue-50/20 transition-colors group text-black">
                    <td className="px-10 py-6">
                      <div className="font-black text-blue-900 uppercase italic text-sm leading-tight text-black">{item.title}</div>
                      <div className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest text-black italic">ROOM: {item.roomId?.name || 'N/A'}</div>
                    </td>
                    <td className="px-10 py-6">
                       <span className="text-xs font-black text-gray-700 uppercase text-black italic">{item.userId?.full_name || 'System User'}</span>
                       {isOwner && <span className="ml-2 text-[8px] bg-blue-900 text-white px-2 py-0.5 rounded-md font-black italic shadow-sm">YOU</span>}
                    </td>
                    <td className="px-10 py-6 text-black font-bold">
                      <div className="text-xs font-black text-gray-600 italic">{new Date(item.startTime).toLocaleDateString('th-TH')}</div>
                      <div className="text-[10px] text-blue-500 font-black italic mt-1 bg-blue-50 w-fit px-2 py-0.5 rounded border border-blue-100">{new Date(item.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(item.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </td>
                    <td className="px-10 py-6 text-center">
                      {canCancel && item.status !== 'CANCELLED' ? (
                        <button onClick={() => handleCancelBooking(item._id, item.title)} className="px-8 py-2.5 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all shadow-sm italic shadow-inner active:scale-95">Cancel</button>
                      ) : (
                        <span className="text-[9px] text-gray-300 font-black uppercase italic tracking-widest border border-dashed border-gray-200 px-4 py-2 rounded-xl block">
                          {item.status === 'CANCELLED' ? 'Inactive' : 'View Only'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {(activeTab === "history" ? filteredAllHistory : filteredMyHistory).length === 0 && (
              <div className="py-20 text-center text-gray-300 font-black italic uppercase tracking-widest opacity-40">No activity found</div>
          )}
        </div>
      )}

      {selectedRoom && <BookingForm room={selectedRoom} onClose={() => setSelectedRoom(null)} onRefresh={() => { fetchRooms(); fetchAllHistory(); fetchMyHistory(); }} />}
      
      {isRoomModalOpen && (
        <RoomManageModal 
          editingRoom={editingRoom} 
          onClose={() => setIsRoomModalOpen(false)} 
          onRefresh={fetchRooms} 
        />
      )}
    </div>
  );
}