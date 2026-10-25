"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import profile from "../image/Profile.png";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const GROUP = "/Dashboardstudent/MyCourses/Group";

// ตารางชื่อที่จะโชว์บน breadcrumb (ไม่ใส่ก็ได้ จะโชว์ตาม URL แทน)
const labels: Record<string, string> = {
  MyCourses: "รายวิชาของฉัน",
  JoinClass: "Join Class",
  Section: "เนื้อหารายวิชา",
  Chapter: "บทเรียน",
  LabHistory: "ประวัติการส่ง Lab",
  Scores: "สรุปคะแนน",
  Settings: "Settings",
};

type Crumb = { label: string; href: string };
type SectionInfo = { classId: string; courseTitle: string; sectionName: string };

export default function Topbar() {
  const [name, setName] = useState("Ford");
  const [names, setNames] = useState<Record<string, string>>({});
  const [info, setInfo] = useState<SectionInfo | null>(null);
  const pathname = usePathname();

  // แยก URL เป็นชิ้นๆ ตัดคำว่า Dashboardstudent ออก
  const parts = pathname.split("/").filter(Boolean).slice(1);
  const si = parts.indexOf("Section");
  const ci = parts.indexOf("Chapter");

  let crumbs: Crumb[];

if (ci !== -1 && si === -1) {
    // URL แบบ /MyCourses/Chapter/[sectionId] ไม่มี classId ใน URL
    // ใช้ข้อมูลที่ได้จาก GET /sections/{id} แทน
    const sectionHref = info
      ? `/Dashboardstudent/MyCourses/Section/${info.classId}`
      : GROUP;
    crumbs = [
      { label: labels.MyCourses, href: GROUP },
      { label: info?.courseTitle ?? "...", href: sectionHref },
      { label: info ? "เนื้อหา" + info.sectionName : "...", href: pathname },
    ];
  } else {
    crumbs = parts.map((seg, i) => {
      let href = "/Dashboardstudent/" + parts.slice(0, i + 1).join("/");
      // MyCourses และ Section พากลับหน้า Group
      if (seg === "MyCourses" || seg === "Section") href = GROUP;
      // Chapter ไม่มี page.tsx ให้กดแล้วพากลับหน้า Section ของห้องนั้น
      if (seg === "Chapter" && si !== -1)
        href = `/Dashboardstudent/MyCourses/Section/${parts[si + 1]}`;
      const label =
        labels[seg] ?? names[String(i)] ?? (/^\d+$/.test(seg) ? "..." : seg);
      return { label, href };
    });
  }

  // กรณี URL มี Section: ดึงชื่อวิชา / ชื่อเนื้อหา มาแทนเลข id
  useEffect(() => {
    if (si === -1) return;
    const classId = parts[si + 1];
    // .../Section/[classId]/Chapter/[sectionId] หรือ .../Section/[classId]/[sectionId]
    const sIdx = parts[si + 2] === "Chapter" ? si + 3 : si + 2;
    const sectionId = parts[sIdx];
    let cancelled = false;

    async function loadNames() {
      const next: Record<string, string> = {};
      try {
        if (classId) {
          const r = await fetch(`${API}/classes/${classId}`);
          const j = await r.json();
          const c = j.class ?? j.data ?? j;
          if (c?.course_title) next[String(si + 1)] = c.course_title;
        }
        if (classId && sectionId) {
          const r = await fetch(`${API}/classes/${classId}/sections`);
          const j = await r.json();
          const found = (j.sections ?? []).find(
            (s: { id?: number; section_id?: number; name?: string }) =>
              String(s.id ?? s.section_id) === sectionId
          );
          if (found?.name) next[String(sIdx)] = "เนื้อหา" + found.name;
        }
      } catch {
        // ดึงชื่อไม่ได้ ก็แสดงเลขต่อไป
      }
      if (!cancelled) setNames(next);
    }
    loadNames();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // กรณี URL เป็น /MyCourses/Chapter/[sectionId]: ถามชื่อจาก backend
  useEffect(() => {
    if (ci === -1 || si !== -1) return;
    const sectionId = parts[ci + 1];
    if (!sectionId) return;
    let cancelled = false;

    async function loadSection() {
      try {
        const r = await fetch(`${API}/sections/${sectionId}`);
        const j = await r.json();
        const s = j.section ?? j.data;
        if (j.success !== false && s && !cancelled) {
          setInfo({
            classId: String(s.class_id),
            courseTitle: s.course_title,
            sectionName: s.name,
          });
        }
      } catch {
        // ดึงชื่อไม่ได้ ก็แสดง ... ต่อไป
      }
    }
    loadSection();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // อ่านชื่อจาก localStorage["user"] ที่เก็บไว้หลัง OTP ผ่าน
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const user = JSON.parse(raw);
        if (user?.name) setName(String(user.name).split(" ")[0]);
      }
    } catch {
      // ถ้าอ่านไม่ได้ ใช้ชื่อเริ่มต้นต่อไป
    }
  }, []);

  return (
    <header className="flex h-[48px] shrink-0 items-center justify-between border-b border-[#DDE3F5] bg-[#F8F8FD] px-4">
      <nav className="flex items-center gap-2 text-xs">
        {crumbs.length > 1 &&
          crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
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