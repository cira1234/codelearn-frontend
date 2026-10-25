"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FileText, Clock } from "lucide-react";

type Section = {
  id: number;
  name: string;
  sobday: string | null;
  start_sob_time: string | null;
  end_sob_time: string | null;
};

function SectionList() {
  const { classId } = useParams();
  const [sections, setSections] = useState<Section[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`http://localhost:8000/classes/${classId}/sections`, {
          credentials: "include"
        });
        const json = await res.json();
        if (!json.success) {
          setError(json.error || "โหลดข้อมูลไม่สำเร็จ");
          return;
        }
        setSections(json.sections ?? []);
      } catch {
        setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
      }
    }
    load();
  }, [classId]);

  const thaiDate = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })
      : "ยังไม่กำหนด";

  if (error) return <p className="p-6 text-red-500">{error}</p>;
  return (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
            {sections.map((s) => (
        <Link
          key={s.id}
          href={`/Dashboardstudent/MyCourses/Chapter/${s.id}`}
          className="group relative block overflow-hidden rounded-xl border border-[#E3E6F0] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          {/* วงกลมสีอ่อนขยายจากมุมขวาบน */}
          <span className="absolute right-0 top-0 h-0 w-0 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#F1F3FD] transition-all duration-500 ease-out group-hover:h-[700px] group-hover:w-[1700px]" />

          {/* เนื้อหาอยู่เหนือวงกลม */}
          <div className="relative z-10">
            <h2 className="text-lg font-bold text-[#14213F]">เนื้อหา{s.name}</h2>
            <div className="mt-4 flex flex-col gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <FileText size={18} /> วันที่สอบ {thaiDate(s.sobday)}
              </div>
              <div className="flex items-center gap-3">
                <Clock size={18} /> เวลาที่สอบ {s.start_sob_time ?? "-"}-{s.end_sob_time ?? "-"}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function SectionPage() {
  return (
    <Suspense fallback={<p className="p-6 text-gray-500">กำลังโหลด...</p>}>
      <SectionList />
    </Suspense>
  );
}