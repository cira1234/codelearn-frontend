"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Topbar from "./Topbar";
import LabTopbar from "./LabTopbar";
import Sidebar from "./SideBarStudent";
import Sidebarlab from "./Sidebarlab";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const chapterId = searchParams.get("chapterId");
  const inLab = pathname.startsWith("/Dashboardstudent/DashboardLab");

  // มี chapterId หรืออยู่ในโฟลเดอร์ DashboardLab → ใช้ sidebar และ topbar แบบ Lab
  const useLab = inLab || !!chapterId;

  return (
    <div className="flex min-h-screen bg-white">
      {useLab ? <Sidebarlab /> : <Sidebar />}
      <div className="flex flex-1 flex-col">
        {useLab ? <LabTopbar /> : <Topbar />}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}