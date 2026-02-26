'use client';
import { useState } from 'react';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';

export default function BookingForm({ room, onClose, onRefresh }: { room: any, onClose: () => void, onRefresh: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
  });

  const API_BASE = 'http://192.168.10.101:3000/api'; // เปลี่ยนเป็น URL ที่ถูกต้องของคุณ
  const token = Cookies.get('access_token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🛡️ 1. Validation: เช็คเวลา
    if (formData.startTime >= formData.endTime) {
      return Swal.fire({ icon: 'error', title: 'เวลาไม่ถูกต้อง', text: 'เวลาเริ่มต้องก่อนเวลาเลิก' });
    }

    try {
      // 🚀 2. สร้างวันที่แบบ ISO ที่ปลอดภัยที่สุด
      // สร้างก้อนสตริง "YYYY-MM-DDTHH:mm:00.000Z"
      const startISO = new Date(`${formData.date}T${formData.startTime}:00`).toISOString();
      const endISO = new Date(`${formData.date}T${formData.endTime}:00`).toISOString();

      // 🔍 DEBUG: กด F12 ดูใน Console ว่าค่านี้ออกไหม
      console.log("Payload to send:", {
        roomName: room._name || room.name,
        title: formData.title,
        startTime: startISO,
        endTime: endISO
      });

      const res = await fetch(`${API_BASE}/bookings`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          roomName: room._name || room.name,
          title: formData.title,
          startTime: startISO,
          endTime: endISO
        }),
      });

      if (res.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'จองสำเร็จ!',
          text: `คุณจองห้อง ${room.name} เรียบร้อยแล้ว`,
          confirmButtonColor: '#1E3A8A',
          timer: 2000
        });
        onRefresh();
        onClose();
      } else {
        const errData = await res.json();
        // 🚨 ถ้าหลังบ้านส่ง Error มา จะโชว์ตรงนี้
        Swal.fire({ 
          icon: 'error', 
          title: 'จองไม่ได้', 
          text: errData.message || 'ห้องอาจถูกจองไปแล้วในช่วงเวลานี้' 
        });
      }
    } catch (err) { 
      Swal.fire({ 
        icon: 'error', 
        title: 'Network Error', 
        text: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' 
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4 text-black animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[45px] p-10 shadow-2xl border border-gray-100 scale-in-center">
        <div className="flex justify-between items-start mb-6">
           <div>
             <h2 className="text-3xl font-black text-blue-900 italic uppercase tracking-tighter">Reserve</h2>
             <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1 italic">
               Room: <span className="text-blue-600">{room.name}</span>
             </p>
           </div>
           <button onClick={onClose} className="text-gray-300 hover:text-red-500 transition-all font-black text-2xl">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Meeting Title</label>
            <input type="text" required placeholder="ระบุหัวข้อประชุม..." className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 ring-blue-500 font-bold"
              onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Date</label>
            <input type="date" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 ring-blue-500 font-bold"
              onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Start Time</label>
              <input type="time" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 ring-blue-500 font-bold"
                onChange={e => setFormData({...formData, startTime: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">End Time</label>
              <input type="time" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 ring-blue-500 font-bold"
                onChange={e => setFormData({...formData, endTime: e.target.value})} />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 font-black text-gray-300 hover:text-black transition-all uppercase text-[10px] tracking-widest">Cancel</button>
            <button type="submit" className="flex-1 py-4 bg-blue-900 text-white font-black rounded-[20px] shadow-xl shadow-blue-100 hover:bg-black transition-all active:scale-95 uppercase text-[10px] tracking-widest">Confirm</button>
          </div>
        </form>
      </div>
    </div>
  );
}