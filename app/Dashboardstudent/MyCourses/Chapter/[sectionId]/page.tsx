"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";

type Chapter = {
  chapter_id?: number;
  id?: number;
  chapter_no: number;
  title: string;
  quiz_due: string | null;
  lab_due: string | null;
  quiz_done: boolean;
  lab_done: boolean;
};

const thaiDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })
    : "ยังไม่กำหนด";

function DoneRow({
  icon: Icon,
  done,
  text,
}: {
  icon: LucideIcon;
  done: boolean;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-gray-600">
      <Icon size={18} className="shrink-0 text-[#2563EB]" />
      <span className="flex-1">{text}</span>
      {done ? (
        <CheckCircle2 size={20} className="shrink-0 text-green-600" />
      ) : (
        <Circle size={20} className="shrink-0 text-gray-300" />
      )}
    </div>
  );
}

function ChapterList() {
  const { sectionId } = useParams();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        let userId = 0;
        try {
          const raw = JSON.parse(localStorage.getItem("user") || "{}").id;
          const n = parseInt(String(raw), 10);
          userId = Number.isNaN(n) ? 0 : n;
        } catch {}

        const res = await fetch(
          `http://localhost:8000/sections/${sectionId}/chapters?user_id=${userId}`,
          { credentials: "include" }
        );
        const json = await res.json();
        if (!json.success) {
          setError(json.error || "โหลดบทเรียนไม่สำเร็จ");
          return;
        }
        setChapters(json.data ?? []);
      } catch {
        setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
      }
    }
    load();
  }, [sectionId]);

  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
      {chapters.map((c) => {
        const chapterId = c.chapter_id ?? c.id;
        return (
          <Link
            key={chapterId}
            href={`/Dashboardstudent/DashboardLab/Slide?chapterId=${chapterId}`}
            className="group relative block overflow-hidden rounded-xl border border-[#E3E6F0] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {/* วงกลมสีอ่อนขยายจากมุมขวาบนจนเต็มการ์ด */}
            <span className="absolute right-0 top-0 h-0 w-0 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#F1F3FD] transition-all duration-500 ease-out group-hover:h-[1600px] group-hover:w-[1600px]" />

            {/* เนื้อหาอยู่เหนือวงกลม */}
            <div className="relative z-10">
              <h2 className="mb-4 flex items-center gap-3 text-lg font-bold text-[#14213F]">
                <BookOpen size={22} className="shrink-0 text-[#0B3FA6]" />
                <span>
                  บทที่ {c.chapter_no} {c.title}
                </span>
              </h2>
              <div className="flex flex-col gap-3">
                <DoneRow
                  icon={ClipboardCheck}
                  done={c.quiz_done}
                  text={`Quiz หลังเรียน ส่งก่อน ${thaiDate(c.quiz_due)}`}
                />
                <DoneRow
                  icon={FlaskConical}
                  done={c.lab_done}
                  text={`Lab ส่งก่อน ${thaiDate(c.lab_due)}`}
                />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function ChaptersPage() {
  return (
    <Suspense fallback={<p className="p-6 text-gray-500">กำลังโหลด...</p>}>
      <ChapterList />
    </Suspense>
  );
}