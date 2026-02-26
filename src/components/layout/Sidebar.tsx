"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";

export default function Sidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>("EMPLOYEE");

  // 🔄 ดึงข้อมูล Role จาก Cookie จริงๆ เพื่อให้เมนูเปลี่ยนตามคน Login
  useEffect(() => {
    const role = Cookies.get('user_role') || 'EMPLOYEE';
    setUserRole(role);
  }, []);

  // 📋 กำหนดรายการเมนูตามเงื่อนไขสิทธิ์ที่คุณระบุ
  const menus = [
    {
      // เปลี่ยนชื่อเมนูตามบริบท: พนักงานเห็นเป็นโปรไฟล์ คนที่มีอำนาจจัดการเห็นเป็นหน้าจัดการ
      name: (userRole === "ADMIN" || userRole === "HR" || userRole === "MANAGER") 
            ? "แดชบอร์ด" 
            : "หน้าหลัก / โปรไฟล์",
      path: "/orgspace/dashboard",
      roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"], // ทุกคนเข้าหน้านี้ได้
    },
    {
      name: "จองห้องประชุม",
      path: "/booking",
      roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"], // เมนูทั่วไปที่ทุกคนเห็น
    },
    {
      name: "จัดการแผนก",
      path: "/orgspace/departments",
      roles: ["ADMIN","HR"],
    },
    {
      name: "รายงานภาพรวม",
      path: "/orgspace/reports",
      roles: ["ADMIN","HR"], 
    },
    {
      name: "log",
      path: "/audit-logs",
      roles: ["ADMIN"],
    },
  ];

  const handleLogout = () => {
    Cookies.remove('user_role');
    Cookies.remove('access_token');
    window.location.href = "/login";
  };

  return (
    <aside className="w-64 bg-[#1E40AF] text-white flex flex-col h-screen shadow-xl transition-all">
      <div className="p-6 border-b border-blue-400/20">
        <h1 className="text-xl font-bold italic tracking-tighter uppercase">
          ORGSPACE
        </h1>
        {/* แสดง Role ปัจจุบันที่ดึงมาจากระบบ */}
        <div className="mt-1 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <p className="text-[9px] opacity-70 uppercase tracking-widest font-black">
            {userRole.replace('_', ' ')} PANEL
          </p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menus.map((menu, index) => (
          // 🛡️ ตรวจสอบสิทธิ์ว่า Role ปัจจุบันมีสิทธิ์เห็นเมนูนี้หรือไม่
          menu.roles.includes(userRole) && (
            <Link
              key={`sidebar-menu-${index}`}
              href={menu.path}
              className={`block p-3 rounded-xl transition-all duration-300 text-sm ${
                pathname === menu.path
                  ? "bg-white text-blue-700 font-black shadow-lg translate-x-1"
                  : "hover:bg-white/10 opacity-70 hover:opacity-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <span>{menu.name}</span>
              </div>
            </Link>
          )
        ))}
      </nav>

      <div className="p-4 border-t border-blue-400/20">
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl border border-white/10 hover:bg-red-500 hover:border-red-500 transition-all text-xs font-black uppercase tracking-widest active:scale-95"
        >
          Logout System
        </button>
      </div>
    </aside>
  );
}