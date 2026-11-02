"use client";

import { useEffect, useState } from "react";
import { Eye, FilePenLine, Filter, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Group = {
  id: number;
  group_name: string;
  term: string;
  teacher: string | null;
  assistant: string | null;
};

// ตัวอักษรย่อ: ตัวแรกของชื่อ + ตัวแรกของนามสกุล
function initials(name: string) {
  const w = name.trim().split(/\s+/);
  return ((w[0]?.[0] ?? "") + (w[1]?.[0] ?? "")).toUpperCase();
}

export default function ManageGroupPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [term, setTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/admin/class-groups`);
        const json = await res.json();
        if (!json.success) {
          setError(json.error || "โหลดข้อมูลไม่สำเร็จ");
          return;
        }
        setGroups(json.data ?? []);
      } catch {
        setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
      }
    }
    load();
  }, []);

  // รายการเทอมที่มีในข้อมูล (ไม่ซ้ำ) ใช้ทำตัวกรอง
  const terms = Array.from(new Set(groups.map((g) => g.term)));
  const shown = term ? groups.filter((g) => g.term === term) : groups;

  return (
    <div className="p-6">
      <div className="overflow-hidden rounded-xl border border-[#E3E6F0] bg-white shadow-sm">
        {/* หัวตาราง: ชื่อ + ตัวกรองเทอม + ปุ่มเพิ่ม */}
        <div className="flex items-center justify-between bg-[#F8F8FD] px-5 py-4">
          <h2 className="text-lg font-bold text-[#14213F]">รายการกลุ่มเรียน</h2>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 rounded-md border border-[#D5D9E6] bg-white px-3 py-2 text-sm text-[#14213F]">
              <Filter size={14} className="text-[#2563EB]" />
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="bg-transparent outline-none"
              >
                <option value="">ทุกเทอม</option>
                {terms.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
                 <Link
                href="/DashboardTeacherLead/ManageGroup/Addgroup"
                className="flex items-center gap-2 rounded-lg bg-[#0B3FA6] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#093283] active:scale-[0.98]"
                >
                เพิ่มกลุ่มเรียน
                <Plus size={16} />
                </Link>
          </div>
        </div>

        {error ? (
          <p className="p-6 text-red-500">{error}</p>
        ) : (
          <table className="w-full text-left text-sm text-[#14213F]">
            <thead>
              <tr className="border-y border-[#E3E6F0] text-xs text-gray-600">
                <th className="px-5 py-3 font-semibold">กลุ่มเรียน</th>
                <th className="px-5 py-3 font-semibold">อาจารย์ผู้สอน</th>
                <th className="px-5 py-3 font-semibold">อาจารย์ผู้ช่วย</th>
                <th className="px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-gray-400">
                    ไม่พบกลุ่มเรียน
                  </td>
                </tr>
              ) : (
                shown.map((g) => (
                  <tr key={g.id} className="border-b border-[#E3E6F0] last:border-0">
                    <td className="px-5 py-4">{g.group_name}</td>
                    <td className="px-5 py-4 font-medium">{g.teacher ?? "-"}</td>
                    <td className="px-5 py-4">
                      {g.assistant ? (
                        <span className="flex items-center gap-2 font-medium">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#DDE3F5] text-[10px] font-bold">
                            {initials(g.assistant)}
                          </span>
                          {g.assistant}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-3">
                        <button type="button" aria-label="ดู" className="text-gray-600 hover:opacity-70">
                          <Eye size={18} />
                        </button>
                        <button type="button" aria-label="แก้ไข" className="text-[#2563EB] hover:opacity-70">
                          <FilePenLine size={18} />
                        </button>
                        <button type="button" aria-label="ลบ" className="text-red-600 hover:opacity-70">
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