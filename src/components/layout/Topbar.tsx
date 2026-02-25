'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import ViewProfileModal from './ViewProfileModal';

export default function Topbar() {
  const [role, setRole] = useState('EMPLOYEE'); 
  const [userName, setUserName] = useState('User');
  const [isViewOpen, setIsViewOpen] = useState(false); // ✅ ตรวจสอบสถานะนี้

  useEffect(() => {
    const userRole = Cookies.get('user_role');
    const storedName = Cookies.get('user_name'); 
    
    if (userRole) setRole(userRole.toUpperCase());
    if (storedName) setUserName(storedName);
  }, []);

  return (
    // 🏁 ส่วนหัวของแอป - แสดงชื่อและบทบาท พร้อมปุ่มดูโปรไฟล์
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 border-b border-gray-100 relative z-50 text-black">
      <div className="flex items-center gap-2">
        <span className="text-gray-400 font-medium text-lg italic"> </span>
        <h2 className="font-black text-lg text-blue-900 italic tracking-tight">
          {}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300">Current Role</span>
          <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 uppercase">
            {role.replace('_', ' ')}
          </span>
        </div>
        
        {/* 🔘 ปุ่ม Avatar - เพิ่ม onClick และ z-index ให้กดได้แน่นอน */}
        <button 
          type="button"
          onClick={() => {
            console.log("Opening Modal..."); // 🔍 ตรวจสอบใน Console ว่ากดติดไหม
            setIsViewOpen(true);
          }}
          className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 font-black border border-blue-200 hover:from-blue-600 hover:to-blue-700 hover:text-white hover:scale-105 transition-all active:scale-95 shadow-sm cursor-pointer relative z-50"
        >
          {userName.charAt(0).toUpperCase()}
        </button>
      </div>

      {/* 🖼 Modal แสดงข้อมูล - ย้ายมาไว้นอกเงื่อนไขเพื่อเช็คตำแหน่ง หรือใช้ Portal */}
      {isViewOpen && (
        <ViewProfileModal 
          onClose={() => {
            console.log("Closing Modal...");
            setIsViewOpen(false);
          }} 
        />
      )}
    </header>
  );
}