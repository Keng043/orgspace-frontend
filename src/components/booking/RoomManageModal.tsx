'use client';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';

export default function RoomManageModal({ editingRoom, onClose, onRefresh }: any) {
  const [formData, setFormData] = useState({
    name: '',
    roomNumber: '',
    capacity: '',
    status: 'Available'
  });

  const API_BASE = 'http://192.168.10.101:3000/api';
  const token = Cookies.get('access_token');

  // 📝 ถ้าเป็นการแก้ไข ให้ดึงข้อมูลเดิมมาใส่ใน Form
  useEffect(() => {
    if (editingRoom) {
      setFormData({
        name: editingRoom.name || '',
        roomNumber: editingRoom.roomNumber || '',
        capacity: editingRoom.capacity || '',
        status: editingRoom.status || 'Available'
      });
    }
  }, [editingRoom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const method = editingRoom ? 'PUT' : 'POST';
    const url = editingRoom 
      ? `${API_BASE}/rooms/${editingRoom._id || editingRoom.id}` 
      : `${API_BASE}/rooms`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          capacity: Number(formData.capacity) // แปลงเป็นตัวเลขก่อนส่ง
        }),
      });

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: editingRoom ? 'Updated!' : 'Created!',
          text: `ห้องประชุมถูกบันทึกเรียบร้อยแล้ว`,
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: 'rounded-[30px]' }
        });
        onRefresh();
        onClose();
      } else {
        const errData = await res.json();
        Swal.fire({ icon: 'error', title: 'ล้มเหลว', text: errData.message });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 text-black animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[50px] p-10 shadow-2xl border border-gray-100 scale-in-center">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-black text-blue-900 italic uppercase tracking-tighter">
              {editingRoom ? 'Edit' : 'Create'} <span className="text-blue-600">Room</span>
            </h2>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1 italic">Room Asset Management System</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-red-500 transition-colors text-2xl font-black">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Room Name */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block italic tracking-widest">Room Name</label>
            <input 
              required
              type="text" 
              placeholder="เช่น Diamond Ballroom"
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm focus:ring-4 ring-blue-500/10 transition-all"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Room Number */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block italic tracking-widest">Room Number</label>
              <input 
                required
                type="text" 
                placeholder="R101"
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm focus:ring-4 ring-blue-500/10 transition-all"
                value={formData.roomNumber}
                onChange={e => setFormData({...formData, roomNumber: e.target.value})}
              />
            </div>
            {/* Capacity */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block italic tracking-widest">Capacity</label>
              <input 
                required
                type="number" 
                placeholder="10"
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm focus:ring-4 ring-blue-500/10 transition-all"
                value={formData.capacity}
                onChange={e => setFormData({...formData, capacity: e.target.value})}
              />
            </div>
          </div>

          {/* Status Select */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block italic tracking-widest">Initial Status</label>
            <select 
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm focus:ring-4 ring-blue-500/10 transition-all appearance-none cursor-pointer"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
            >
              <option value="Available">🟢 Available</option>
              <option value="Occupied">🔴 Occupied</option>
              <option value="Maintenance">🛠 Maintenance</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-4 font-black text-gray-300 hover:text-gray-500 uppercase text-[10px] tracking-widest transition-colors italic"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 py-5 bg-blue-900 text-white font-black rounded-[25px] shadow-xl shadow-blue-100 hover:bg-black transition-all active:scale-95 uppercase text-[10px] tracking-[0.2em]"
            >
              {editingRoom ? 'Update Room' : 'Confirm Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}