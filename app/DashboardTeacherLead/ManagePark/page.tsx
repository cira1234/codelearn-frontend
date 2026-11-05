"use client";

import { useEffect, useState } from "react";
import { Eye, FilePenLine, Filter, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type TermRow = {
  id_term: number;
  term: string;
  year: string;
  sem: string;
  midterm_date: string | null;
  midterm_start: string | null;
  midterm_end: string | null;
  final_date: string | null;
  final_start: string | null;
  final_end: string | null;
  group_count: number;
};

const fmtDate = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })
    : "-";
const fmtTime = (s: string | null, e: string | null) =>
  s && e ? `${s.slice(0, 5)} - ${e.slice(0, 5)} น.` : "";

export default function ManageTermPage() {
  const [rows, setRows] = useState<TermRow[]>([]);
  const [year, setYear] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/admin/term-summary`);
        const json = await res.json();
        if (!json.success) {
          setError(json.error || "โหลดข้อมูลไม่สำเร็จ");
          return;
        }
        setRows(json.data ?? []);
      } catch {
        setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
      }
    }
    load();
  }, []);

  const years = Array.from(new Set(rows.map((r) => r.year)));
  const shown = year ? rows.filter((r) => r.year === year) : rows;

  return (
    <div className="p-6">
      <div className="overflow-hidden rounded-xl border border-[#E3E6F0] bg-white shadow-sm">
        <div className="flex items-center justify-between bg-[#F8F8FD] px-5 py-4">
          <h2 className="text-lg font-bold text-[#14213F]">รายการภาคการศึกษา</h2>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 rounded-md border border-[#D5D9E6] bg-white px-3 py-2 text-sm text-[#14213F]">
              <Filter size={14} className="text-[#2563EB]" />
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="max-w-[220px] bg-transparent outline-none"
              >
                <option value="">ทุกปีการศึกษา</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    ปี {y}
                  </option>
                ))}
              </select>
            </label>
            <Link
              href="/DashboardTeacherLead/ManagePark/Addterm"
              className="flex items-center gap-2 rounded-lg bg-[#0B3FA6] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#093283] active:scale-[0.98]"
            >
              เพิ่มเทอม
              <Plus size={16} />
            </Link>
          </div>
        </div>

        {error ? (
          <p className="p-6 text-red-500">{error}</p>
        ) : (
          <table className="w-full table-fixed text-left text-sm text-[#14213F]">
            <thead>
              <tr className="border-y border-[#E3E6F0] text-xs text-gray-600">
                <th className="w-[12%] px-5 py-3 font-semibold">เทอม</th>
                <th className="w-[20%] px-5 py-3 font-semibold">วันสอบกลางภาค</th>
                <th className="w-[20%] px-5 py-3 font-semibold">วันสอบปลายภาค</th>
                <th className="w-[16%] px-5 py-3 font-semibold">จำนวนกลุ่มเรียน</th>
                <th className="w-[14%] px-5 py-3 font-semibold">Action</th>
                <th className="w-[18%] px-5 py-3 font-semibold">จัดการบทเรียน</th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                    ไม่พบภาคการศึกษา
                  </td>
                </tr>
              ) : (
                shown.map((r) => (
                  <tr key={r.id_term} className="border-b border-[#E3E6F0] last:border-0">
                    <td className="px-5 py-4 font-medium">
                      {r.year}/{r.sem}
                    </td>
                    <td className="px-5 py-4">
                      {fmtDate(r.midterm_date)}
                      <div className="text-xs text-gray-500">{fmtTime(r.midterm_start, r.midterm_end)}</div>
                    </td>
                    <td className="px-5 py-4">
                      {fmtDate(r.final_date)}
                      <div className="text-xs text-gray-500">{fmtTime(r.final_start, r.final_end)}</div>
                    </td>
                    <td className="px-5 py-4">{r.group_count}</td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-3">
                        <button type="button" aria-label="ดู" className="cursor-pointer text-gray-600 hover:opacity-70">
                          <Eye size={18} />
                        </button>
                        <button type="button" aria-label="แก้ไข" className="cursor-pointer text-[#2563EB] hover:opacity-70">
                          <FilePenLine size={18} />
                        </button>
                        <button type="button" aria-label="ลบ" className="cursor-pointer text-red-600 hover:opacity-70">
                          <Trash2 size={18} />
                        </button>
                      </span>
                    </td>
                    <td className="px-5 py-4">
                       <Link
                         href={`/DashboardTeacherLead/ManagePark/Addchapter?term=${r.id_term}`}
                          className="inline-block rounded-lg bg-[#0B5ED7] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#0A4FB5] active:scale-[0.98]"
                        >
                          จัดการบทเรียน
                        </Link>
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