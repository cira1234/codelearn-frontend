"use client";

import { useEffect, useMemo, useState } from "react";
import { Files, Filter } from "lucide-react";
import Link from "next/link";
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type ClassRow = {
  id: number;
  group_name: string;
  term: string;
  course_title: string;
  student_count: number;
  submitted_count: number;
};

export default function DetailclassPage() {
  const [rows, setRows] = useState<ClassRow[]>([]);
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  

  useEffect(() => {
    async function load() {
      try {
        const raw = localStorage.getItem("user");
        const email = raw ? JSON.parse(raw)?.email : null;
        if (!email) {
          setError("ไม่พบอีเมลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
          return;
        }
        const res = await fetch(
          `${API}/teacher/my-classes?email=${encodeURIComponent(email)}`,
          { credentials: "include" }
        );
        const json = await res.json();
        if (!res.ok) {
          setError(json.detail ?? "โหลดข้อมูลไม่สำเร็จ");
          return;
        }
        setRows(json.data ?? []);
        if (json.data?.length) setTerm(json.data[0].term);
      } catch {
        setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const terms = useMemo(() => Array.from(new Set(rows.map((r) => r.term))), [rows]);
  const shown = rows.filter((r) => !term || r.term === term);

  return (
     <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
  {shown.map((c) => (
    <Link
      key={c.id}
      href={`/DashboardTeacher/Detailclass/Class?classId=${c.id}`}
      className="group block cursor-pointer rounded-xl border border-[#E3E5F5] bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#1E6FE8] hover:shadow-[0_8px_24px_rgba(30,111,232,0.18)]"
    >
      <h2 className="text-lg font-bold text-gray-900 transition-colors duration-300 group-hover:text-[#0040A1]">
        {c.group_name}
      </h2>
      <p className="mt-3 flex items-center gap-3 text-sm text-gray-700">
        <Files
          size={18}
          className="transition-colors duration-300 group-hover:text-[#1E6FE8]"
        />{" "}
        จำนวนนักศึกษา {c.student_count} คน
      </p>
      <p className="mt-3 flex items-center gap-3 text-sm text-gray-700">
        <Files
          size={18}
          className="transition-colors duration-300 group-hover:text-[#1E6FE8]"
        />{" "}
        ส่งงานแล้ว {c.submitted_count} คน
      </p>
    </Link>
  ))}
</div>
  );
}