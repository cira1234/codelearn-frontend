"use client";

import { useEffect, useState } from "react";
import { FilePenLine, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // 👈 เพิ่ม import นี้

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Teacher = {
  id: number;
  email: string;
  name: string;
  picture: string | null;
  group_names: string | null;
  term_list: string | null;
};

function initials(name: string) {
  const w = name.trim().split(/\s+/);
  return ((w[0]?.[0] ?? "") + (w[1]?.[0] ?? "")).toUpperCase();
}

function Avatar({ t }: { t: Teacher }) {
  if (t.picture) {
    return <img src={t.picture} alt="" className="h-7 w-7 rounded-full object-cover" />;
  }
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#DDE3F5] text-[10px] font-bold text-[#14213F]">
      {initials(t.name)}
    </span>
  );
}

export default function TeachersPage() {
  const router = useRouter(); // 👈 เรียกใช้ router
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const res = await fetch(`${API}/admin/teachers`, { credentials: "include" });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || json.detail || "โหลดข้อมูลไม่สำเร็จ");
        return;
      }
      setTeachers(json.data ?? []);
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // 👇 ฟังก์ชันลบข้อมูล
  async function handleDelete(id: number, name: string) {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบบัญชีอาจารย์ "${name}" ?`)) return;
    
    try {
      const res = await fetch(`${API}/admin/teachers/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      
      if (json.success) {
        // ลบสำเร็จ ให้กรองเอาคนที่ลบออกจาก State ทันที (ไม่ต้องโหลดใหม่)
        setTeachers((prev) => prev.filter((t) => t.id !== id));
      } else {
        alert(json.error || "ลบข้อมูลไม่สำเร็จ");
      }
    } catch {
      alert("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    }
  }

  const q = query.trim().toLowerCase();
  const shown = teachers.filter(
    (t) => t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q)
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-end">
        <Link
          href="/DashboardTeacherLead/ManageTeacher/AddTeacher"
          className="flex items-center gap-2 rounded-lg bg-[#0B3FA6] px-8 py-3 text-base font-bold text-white transition hover:bg-[#093283] active:scale-[0.98]"
        >
          Create Account
          <Plus size={18} />
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E3E6F0] bg-white shadow-sm">
        <div className="flex items-center justify-between bg-[#F8F8FD] px-5 py-4">
          <h2 className="text-lg font-bold text-[#14213F]">รายชื่ออาจารย์รายวิชา</h2>
          <label className="flex items-center gap-2 rounded-md border border-[#D5D9E6] bg-white px-3 py-1.5 text-sm text-gray-500">
            <Search size={14} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหารายชื่อ"
              className="w-44 bg-transparent outline-none placeholder:text-gray-400"
            />
          </label>
        </div>

        {loading ? (
          <p className="p-6 text-gray-500">กำลังโหลด...</p>
        ) : error ? (
          <p className="p-6 text-red-500">{error}</p>
        ) : (
          <table className="w-full text-left text-sm text-[#14213F]">
            <thead>
              <tr className="border-y border-[#E3E6F0] text-xs text-gray-600">
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">กลุ่มเรียนที่สอน</th>
                <th className="px-5 py-3 font-semibold">เทอมที่สอน</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                    ไม่พบรายชื่ออาจารย์
                  </td>
                </tr>
              ) : (
                shown.map((t) => (
                  <tr key={t.id} className="border-b border-[#E3E6F0] last:border-0">
                    <td className="px-5 py-3">{t.email}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2 font-medium">
                        <Avatar t={t} />
                        {t.name}
                      </span>
                    </td>
                    <td className="px-5 py-3">{t.group_names ?? "-"}</td>
                    <td className="px-5 py-3">{t.term_list ?? "-"}</td>
                    <td className="px-5 py-3 text-gray-400">-</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center justify-center gap-3">
                        {/* 👇 ปุ่มแก้ไข ส่ง id ไปหน้าถัดไป */}
                        <button 
                          type="button" 
                          onClick={() => router.push(`/DashboardTeacherLead/ManageTeacher/EditTeacher?id=${t.id}`)}
                          className="text-[#2563EB] hover:opacity-70 cursor-pointer" 
                          title="แก้ไข"
                        >
                          <FilePenLine size={18} />
                        </button>
                        {/* 👇 ปุ่มลบ เรียกฟังก์ชัน handleDelete */}
                        <button 
                          type="button" 
                          onClick={() => handleDelete(t.id, t.name)}
                          className="text-red-600 hover:opacity-70 cursor-pointer" 
                          title="ลบ"
                        >
                          <Trash2 size={18} />
                        </button>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}