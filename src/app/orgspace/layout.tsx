// src/app/orgspace/layout.tsx
'use client'; // ต้องใส่เพราะมีการใช้ Sidebar ที่เป็น Client Component
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function OrgspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar อยู่ซ้ายสุด */}
      <Sidebar /> 

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar อยู่ด้านบน */}
        <Topbar />
        
        {/* เนื้อหาหน้า Dashboard จะมาแสดงตรงนี้ */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#F1F5F9] text-black">
          {children}
        </main>
      </div>
    </div>
  );
}