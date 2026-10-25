"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import profile from "../image/Profile.png";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type ChapterInfo = {
  chapter_no: number;
  title: string;
  section_id: number;
  section_name: string;
};

export default function LabTopbar() {
  const chapterId = useSearchParams().get("chapterId");
  const [info, setInfo] = useState<ChapterInfo | null>(null);
  const [name, setName] = useState("Ford");

  useEffect(() => {
    if (!chapterId) return;
    let cancelled = false;
    async function load() {
      try {
        const r = await fetch(`${API}/chapters/${chapterId}`);
        const j = await r.json();
        if (j.success && !cancelled) setInfo(j.chapter);
      } catch {
        // ดึงชื่อไม่ได้ ก็แสดง ... ต่อไป
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [chapterId]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const user = JSON.parse(raw);
        if (user?.name) setName(String(user.name).split(" ")[0]);
      }
    } catch {
      // ใช้ชื่อเริ่มต้นต่อไป
    }
  }, []);

  return (
    <header className="flex h-[48px] shrink-0 items-center justify-between border-b border-[#DDE3F5] bg-[#F8F8FD] px-4">
      <nav className="flex items-center gap-2 text-xs">
        <Link
          href={
            info
              ? `/Dashboardstudent/MyCourses/Chapter/${info.section_id}`
              : "/Dashboardstudent/MyCourses/Group"
          }
          className="font-semibold text-[#14213F] underline"
        >
          {info ? "เนื้อหา" + info.section_name : "..."}
        </Link>
        <span className="text-gray-400">›</span>
        <span className="font-semibold text-[#2563EB]">
          {info ? `บทที่ ${info.chapter_no} ${info.title}` : "..."}
        </span>
      </nav>

      <button
        type="button"
        className="flex items-center gap-2 rounded-full border border-[#C3C6D6] bg-white py-1 pl-1 pr-3 text-sm font-medium text-[#14213F] transition hover:bg-gray-50"
      >
        <span className="relative h-7 w-7 overflow-hidden rounded-full">
          <Image
            src={profile}
            alt="โปรไฟล์"
            className="h-full w-full scale-[1.9] object-cover object-[50%_28%]"
          />
        </span>
        {name}
        <ChevronDown size={14} className="text-gray-500" />
      </button>
    </header>
  );
}