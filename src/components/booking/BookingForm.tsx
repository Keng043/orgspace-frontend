'use client';
import { useState } from 'react';
import Cookies from 'js-cookie';

export default function BookingForm({ room, onClose, onRefresh }: { room: any, onClose: () => void, onRefresh: () => void }) {
  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    end_time: '',
    reason: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get('access_token');
    try {
      const res = await fetch('http://192.168.10.100:3000/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ room_id: room.id, ...formData }),
      });

      if (res.ok) {
        alert('ส่งคำขอจองห้องประชุมสำเร็จ!');
        onRefresh();
        onClose();
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 text-black">
      <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl animate-in zoom-in duration-300">
        <h2 className="text-3xl font-black text-blue-900 mb-2 italic tracking-tighter uppercase">Booking Form</h2>
        <p className="text-gray-400 mb-8 font-medium italic">ห้องที่เลือก: <span className="text-blue-600 font-bold uppercase">{room.name}</span></p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">วันที่ต้องการจอง</label>
            <input type="date" required className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 ring-blue-500 font-bold"
              onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">เริ่มเวลา</label>
              <input type="time" required className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 ring-blue-500 font-bold"
                onChange={e => setFormData({...formData, start_time: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">ถึงเวลา</label>
              <input type="time" required className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 ring-blue-500 font-bold"
                onChange={e => setFormData({...formData, end_time: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">วัตถุประสงค์การใช้ห้อง</label>
            <textarea placeholder="..." rows={3} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 ring-blue-500 font-medium"
              onChange={e => setFormData({...formData, reason: e.target.value})}></textarea>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 font-bold text-gray-400 hover:bg-gray-100 rounded-2xl transition-all uppercase text-xs tracking-widest">Cancel</button>
            <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase text-xs tracking-widest">Confirm Booking</button>
          </div>
        </form>
      </div>
    </div>
  );
}