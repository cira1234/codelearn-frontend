"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  GraduationCap,
  ChevronDown,
  Code2,
  FileQuestion,
  LineChart,
  Settings,
  LogOut,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const BASE = "/Dashboardstudent";

type LabItem = {
  namelab: string;
  lab_id?: number;
  id?: number;
};

const bottomMenus = [
  { href: `${BASE}/LabHistory`, label: "ประวัติการส่ง Lab", icon: Code2 },
  { href: `${BASE}/Scores`, label: "สรุปคะแนน", icon: LineChart },
  { href: `${BASE}/Settings`, label: "Settings", icon: Settings },
];

function GroupHeader({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
}) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-md border border-[#E3E6F0] bg-white px-3 py-1.5 text-sm text-gray-800">
      <Icon size={18} />
      {label}
    </div>
  );
}

export default function SidebarLab() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(true);
  const [labs, setLabs] = useState<LabItem[]>([]);
  const [labsLoaded, setLabsLoaded] = useState(false);

  const chapterId = searchParams.get("chapterId");
  const q = chapterId ? `?chapterId=${chapterId}` : "";
  const currentLab = searchParams.get("lab");

  const slideActive = pathname.startsWith(`${BASE}/DashboardLab/Slide`);
  const quizActive = pathname.startsWith(`${BASE}/DashboardLab/Quiz`);

  // ดึงรายการ Lab ของบทนี้จากฐานข้อมูล
  useEffect(() => {
    if (!chapterId) return;
    let cancelled = false;
    setLabsLoaded(false);
    fetch(`${API}/chapters/${chapterId}/labs`, { credentials: "include" })
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled && json.success) setLabs(json.labs ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLabsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [chapterId]);

  const itemClass = (active: boolean) =>
    `block rounded-md px-3 py-2 text-sm transition ${
      active
        ? "font-semibold text-[#2563EB]"
        : "text-gray-700 hover:bg-[#F1F3FD]"
    }`;

  return (
    <aside className="sticky top-0 flex h-screen w-[260px] shrink-0 flex-col overflow-y-auto border-r border-[#E3E6F0] bg-[#F7F8FE] p-3">
      {/* โลโก้ */}
      <div className="px-2 py-4">
        <div className="text-xl font-bold text-[#0B3FA6]">CodeLearn</div>
        <div className="text-xs text-gray-600">AI Programming Tutor</div>
      </div>

      {/* ปุ่มรายวิชาของฉัน (พับ/ขยาย) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg bg-[#2563EB] px-3 py-2.5 text-sm font-medium text-white"
      >
        <span className="flex items-center gap-2">
          <GraduationCap size={18} />
          รายวิชาของฉัน
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* การ์ดขาว: เนื้อหา / Lab / Quiz */}
      {open && (
        <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-[#E3E6F0] bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-1">
            <GroupHeader icon={GraduationCap} label="เนื้อหา" />
            <Link
              href={`${BASE}/DashboardLab/Slide${q}`}
              className={itemClass(slideActive)}
            >
              สไลด์
            </Link>
          </div>

          <div className="flex flex-col gap-1">
            <GroupHeader icon={Code2} label="Lab" />
            {labsLoaded && labs.length === 0 && (
              <p className="px-3 py-2 text-sm text-gray-400">ยังไม่มี Lab</p>
            )}
            {labs.map((lab, i) => {
              const key = String(lab.lab_id ?? lab.id ?? i + 1);
              return (
                <Link
                  key={key}
                  href={`${BASE}/DashboardLab/Lab${q}${q ? "&" : "?"}lab=${key}`}
                  className={itemClass(currentLab === key)}
                >
                  {lab.namelab}
                </Link>
              );
            })}
          </div>

          <div className="flex flex-col gap-1">
            <GroupHeader icon={FileQuestion} label="Quiz หลังเรียน" />
            <Link
              href={`${BASE}/DashboardLab/Quiz${q}`}
              className={itemClass(quizActive)}
            >
              แบบทดสอบหลังเรียน
            </Link>
          </div>
        </div>
      )}

      {/* เมนูล่าง */}
      <nav className="mt-4 flex flex-col gap-1">
        {bottomMenus.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? "bg-[#E1E6FA] font-semibold text-[#0B3FA6]"
                  : "text-gray-700 hover:bg-[#E1E6FA]"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="mt-auto border-t border-[#DDE3F5] pt-3">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-[#E1E6FA]"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}