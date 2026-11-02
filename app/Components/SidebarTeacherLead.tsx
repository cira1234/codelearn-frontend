"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  UserCog,
  Users,
  CloudUpload,
  BrainCircuit,
  FileCode,
  ClipboardList,
  CalendarDays,
  BookOpen,
  Settings,
  LogOut,
} from "lucide-react";

import logo from "../image/logo.png";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const menus = [
  { href: "/DashboardTeacherLead/ManageTeacher", label: "จัดการบัญชีอาจารย์ผู้สอน", icon: UserCog },
  { href: "/DashboardTeacherLead/ManageGroup", label: "จัดการกลุ่มเรียน", icon: Users },
  { href: "/DashboardTeacherLead/UploadFile", label: "อัปโหลดเนื้อหา", icon: CloudUpload },
  { href: "/DashboardTeacherLead/TrainAi", label: "เทรนด์ข้อมูลจากไฟล์", icon: BrainCircuit },
  { href: "/DashboardTeacherLead/ManageLab", label: "จัดการ Lab", icon: FileCode },
  { href: "/DashboardTeacherLead/ManageQuiz", label: "จัดการ Quiz", icon: ClipboardList },
  { href: "/DashboardTeacherLead/ManagePark", label: "จัดการภาคการศึกษา", icon: CalendarDays },
  { href: "/DashboardTeacherLead/ViewPDF", label: "ดูรายละเอียดเอกสาร", icon: BookOpen },
  { href: "/DashboardTeacherLead/Settings", label: "Settings", icon: Settings },
];

export default function SidebarTeacherLead() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" });
    } catch {}
    localStorage.removeItem("user");
    router.replace("/LoginTeacherLead");
  }

  return (
    <aside className="sticky top-0 flex h-screen w-[260px] shrink-0 flex-col border-r border-[#E3E5F5] bg-[#F3F4FD] px-4 py-6">
      {/* โลโก้ */}
      <div className="flex items-center gap-3 px-2">
        <Image src={logo} alt="CodeLearn" className="h-10 w-10 object-contain" />
        <div className="leading-tight">
          <p className="text-lg font-bold text-[#0040A1]">CodeLearn</p>
          <p className="text-xs text-gray-600">AI Programming Tutor</p>
        </div>
      </div>

      {/* เมนู */}
      <nav className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto">
        {menus.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-[#1E6FE8] font-medium text-white"
                  : "text-gray-700 hover:bg-[#E3E8F5]"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-[#C3C6D6]/60 pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-[#E3E8F5]"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}