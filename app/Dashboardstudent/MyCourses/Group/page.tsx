"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, GraduationCap, LogOut, AlarmClock, Users, BookUser } from "lucide-react";

const API = "http://127.0.0.1:8000";

type ClassGroup = {
  id: number;
  join_code: string;
  course_title: string;
  term: string;
  group_name: string;
  teacher_name: string;
};

export default function MyCoursesPage() {
  // null = กำลังโหลด, [] = ยังไม่ได้เข้าห้องไหน
  const [classes, setClasses] = useState<ClassGroup[] | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [error, setError] = useState("");

  // อ่าน user_id จาก localStorage["user"] แล้วดึงรายวิชาจาก backend
  useEffect(() => {
    let id: number | null = null;
    try {
      const raw = localStorage.getItem("user");
      if (raw) id = JSON.parse(raw)?.id ?? null;
    } catch {
      // อ่านไม่ได้ ถือว่ายังไม่ล็อกอิน
    }

    if (!id) {
      setError("ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่");
      setClasses([]);
      return;
    }
    setUserId(id);

    fetch(`${API}/classes/my/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setClasses(json.data);
        else {
          setError(json.error || "โหลดข้อมูลไม่สำเร็จ");
          setClasses([]);
        }
      })
      .catch(() => {
        setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
        setClasses([]);
      });
  }, []);

  const leaveClass = async (classGroupId: number) => {
    if (!userId) return;
    try {
      const res = await fetch(`${API}/classes/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, class_group_id: classGroupId }),
      });
      const json = await res.json();
      if (json.success) {
        setClasses((prev) => (prev ?? []).filter((c) => c.id !== classGroupId));
      } else {
        setError(json.error || "ออกจากห้องไม่สำเร็จ");
      }
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    }
  };

  // รอโหลดสถานะ กันหน้ากะพริบ
  if (classes === null) return null;

  const joined = classes.length > 0;

  return (
    <div className="flex h-full min-h-[calc(100vh-120px)] flex-col">
      {/* ปุ่มบนขวา: เปลี่ยนตามสถานะ */}
      <div className="flex justify-end">
        {joined ? (
          <button
            type="button"
            onClick={() => leaveClass(classes[0].id)}
            className="flex items-center gap-2 rounded-lg bg-[#2563EB] px-8 py-3 text-base font-bold text-white transition hover:bg-[#1D4ED8] active:scale-[0.98]"
          >
            Leave Class
            <LogOut size={18} />
          </button>
        ) : (
          <Link
            href="/Dashboardstudent/MyCourses/JoinClass"
            className="flex items-center gap-2 rounded-lg bg-[#0B3FA6] px-8 py-3 text-base font-bold text-white transition hover:bg-[#093283] active:scale-[0.98]"
          >
            join Class
            <Plus size={18} />
          </Link>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {joined ? (
         <div className="mt-2 flex flex-col gap-4">
                  {classes.map((c) => (
            <Link
              key={c.id}
              href={`/Dashboardstudent/MyCourses/Section/${c.id}`}
              className="group relative block w-full max-w-[500px] overflow-hidden rounded-xl border border-[#E3E6F0] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* วงกลมสีอ่อนขยายจากมุมขวาบน */}
              <span className="absolute right-0 top-0 h-0 w-0 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#F1F3FD] transition-all duration-500 ease-out group-hover:h-[700px] group-hover:w-[1200px]" />

              {/* เนื้อหาต้องอยู่เหนือวงกลม */}
              <div className="relative z-10">
                <h2 className="text-lg font-bold text-[#14213F]">{c.course_title}</h2>
                <div className="mt-3 flex flex-col gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-3">
                    <AlarmClock size={18} /> {c.term}
                  </div>
                  <div className="flex items-center gap-3">
                    <Users size={18} /> {c.group_name}
                  </div>
                  <div className="flex items-center gap-3">
                    <BookUser size={18} /> {c.teacher_name}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-gray-300">
          <GraduationCap size={64} />
          <p className="text-2xl font-bold">Add ClassRoom</p>
        </div>
      )}
    </div>
  );
}