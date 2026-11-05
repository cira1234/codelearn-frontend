"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import profile from "../image/Profile.png";

const ROOT = "/DashboardTeacher";

// ชื่อโฟลเดอร์ -> ชื่อที่โชว์บน breadcrumb (ชื่อที่ไม่อยู่ในตารางจะโชว์ตาม URL)
// เพิ่มบรรทัดใหม่ได้เมื่อมีหน้าใหม่ใต้ /DashboardTeacher
const labels: Record<string, string> = {
  Detailclass: "รายละเอียดห้องเรียน",
  Createcode: "Create Code",
  Settings: "Settings",
};

export default function TopbarTeacher() {
  const [name, setName] = useState("Teacher");
  const [picture, setPicture] = useState("");
  const pathname = usePathname();

  // ตัด /DashboardTeacher ออก แล้วแยกส่วนที่เหลือเป็นชิ้นๆ
  const rest = pathname.startsWith(ROOT) ? pathname.slice(ROOT.length) : pathname;
  const parts = rest.split("/").filter(Boolean);
  const crumbs = parts.map((seg, i) => ({
    label: labels[seg] ?? seg,
    href: `${ROOT}/${parts.slice(0, i + 1).join("/")}`,
  }));

  // อ่านชื่อและรูปจาก localStorage["user"] ที่เก็บไว้หลัง OTP ผ่าน
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const user = JSON.parse(raw);
        if (user?.name) setName(String(user.name));
        if (user?.picture) setPicture(String(user.picture));
      }
    } catch {
      // อ่านไม่ได้ ใช้ค่าเริ่มต้นต่อไป
    }
  }, []);

  return (
    <header className="flex h-[48px] shrink-0 items-center justify-between border-b border-[#DDE3F5] bg-[#F8F8FD] px-4">
      <nav className="flex items-center gap-2 text-xs">
        {crumbs.map((c, i) => {
          // ชิ้นสุดท้ายเป็นสีน้ำเงินเมื่อมีหลายชั้น ถ้ามีชิ้นเดียวให้เป็นลิงก์ขีดเส้นใต้ตาม Figma
          const last = i === crumbs.length - 1 && crumbs.length > 1;
          return (
            <span key={`${c.href}-${i}`} className="flex items-center gap-2">
              {i > 0 && <span className="text-gray-400">›</span>}
              {last ? (
                <span className="text-[#2563EB]">{c.label}</span>
              ) : (
                <Link
                  href={c.href}
                  className="font-semibold text-[#14213F] underline"
                >
                  {c.label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>

      <button
        type="button"
        className="flex items-center gap-2 rounded-full border border-[#C3C6D6] bg-white py-1 pl-1 pr-3 text-sm font-medium text-[#14213F] transition hover:bg-gray-50"
      >
        <span className="relative h-7 w-7 overflow-hidden rounded-full">
          {picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={picture}
              alt="โปรไฟล์"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          ) : (
            <Image
              src={profile}
              alt="โปรไฟล์"
              className="h-full w-full scale-[1.9] object-cover object-[50%_28%]"
            />
          )}
        </span>
        {name}
        <ChevronDown size={14} className="text-gray-500" />
      </button>
    </header>
  );
}