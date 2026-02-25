'use client';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import BookingForm from '@/components/booking/BookingForm';

export default function BookingPage() {
  const [activeTab, setActiveTab] = useState<'reserve' | 'history'>('reserve');
  const [rooms, setRooms] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = 'http://192.168.10.101:3000'; // IP เพื่อนคนที่ 2
  const token = Cookies.get('access_token');
  const userRole = Cookies.get('user_role') || 'EMPLOYEE';

  // ดึงรายการห้องประชุมทั้งหมด
  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API_BASE}/rooms`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (res.ok) setRooms(await res.json());
    } catch (err) { console.error(err); }
  };

  // ดึงประวัติการจองของผู้ใช้งานปัจจุบัน
  const fetchMyHistory = async () => {
    try {
      // หากเป็น ADMIN อาจจะดึงข้อมูลทั้งหมด หรือดึงแค่ของตนเองตามปกติ
      const endpoint = userRole === 'ADMIN' ? `${API_BASE}/bookings` : `${API_BASE}/bookings/me`;
      const res = await fetch(endpoint, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (res.ok) setMyBookings(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  // 🗑 ฟังก์ชันยกเลิกการจอง
  const handleCancelBooking = async (id: string) => {
    if (!confirm('ยืนยันการยกเลิกการจองนี้ใช่หรือไม่?')) return;
    try {
      const res = await fetch(`${API_BASE}/bookings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('ยกเลิกการจองสำเร็จ');
        fetchMyHistory();
        fetchRooms();
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchRooms();
    fetchMyHistory();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto text-black animate-in fade-in duration-700">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-blue-900 italic tracking-tighter uppercase">Meeting Reservation</h1>
        <p className="text-gray-400 font-medium">จัดการตารางเวลาและห้องประชุมใน ORGSPACE</p>
      </div>

      <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-10 w-fit shadow-inner">
        <button onClick={() => setActiveTab('reserve')} className={`px-8 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'reserve' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>AVAILABLE ROOMS</button>
        <button onClick={() => setActiveTab('history')} className={`px-8 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>
          {userRole === 'ADMIN' ? 'ALL BOOKINGS' : 'MY HISTORY'}
        </button>
      </div>

      {activeTab === 'reserve' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-xl font-bold italic border border-blue-100">R{room.id}</div>
                <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${room.status === 'Available' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {room.status}
                </span>
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-2 uppercase tracking-tighter">{room.name}</h3>
              <p className="text-gray-400 text-sm font-medium mb-6">Max Capacity: {room.capacity} Persons</p>
              <button 
                disabled={room.status !== 'Available'}
                onClick={() => setSelectedRoom(room)}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all active:scale-95 uppercase tracking-widest"
              >
                BOOK NOW
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b">
              <tr className="text-gray-400 text-[10px] uppercase font-black tracking-[0.2em]">
                <th className="px-8 py-6">Room Name</th>
                <th className="px-8 py-6">Date</th>
                <th className="px-8 py-6">Time Slot</th>
                <th className="px-8 py-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {myBookings.length > 0 ? myBookings.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/10 transition-colors">
                  <td className="px-8 py-5 font-bold text-gray-800">{item.room_name}</td>
                  <td className="px-8 py-5 text-gray-500 font-medium">{item.date}</td>
                  <td className="px-8 py-5 text-blue-600 font-black">{item.start_time} - {item.end_time}</td>
                  <td className="px-8 py-5 text-center">
                    <button 
                      onClick={() => handleCancelBooking(item.id)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all tracking-widest"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-gray-400 italic">ไม่พบข้อมูลประวัติการจอง</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedRoom && (
        <BookingForm 
          room={selectedRoom} 
          onClose={() => setSelectedRoom(null)} 
          onRefresh={() => { fetchRooms(); fetchMyHistory(); }} 
        />
      )}
    </div>
  );
}