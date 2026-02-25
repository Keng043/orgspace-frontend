'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // 1. ดึงค่า Token และ Role มาเก็บในตัวแปรก่อนใช้งาน
    const token = Cookies.get('access_token');
    const role = Cookies.get('user_role'); // 👈 เพิ่มบรรทัดนี้เพื่อแก้ Error 'role is not defined'

    console.log("Checking session at Home:", { token, role });

    // 2. ตรวจสอบเงื่อนไขการเข้าถึง
    if (!token || !role) {
      // 🚀 หากไม่มีข้อมูลการล็อกอิน ให้ส่งไปหน้า Login
      // ใช้ replace เพื่อไม่ให้ผู้ใช้กดปุ่ม Back กลับมาหน้านี้ได้
      router.replace('/login'); 
    } else {
      // ✅ หากมีข้อมูลครบถ้วน ให้ส่งไปหน้า Dashboard
      router.replace('/orgspace/dashboard');
    }
  }, [router]);

  // แสดง UI ระหว่างรอการตรวจสอบ (Loading State)
  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold animate-pulse">กำลังตรวจสอบสิทธิ์เข้าใช้งาน...</p>
      </div>
    </div>
  );
}