"use client";

import { useEffect, useState } from "react";
import { Eye, FilePenLine, Filter, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Question = {
  question_id: number;
  chapter_id: number;
  question: string;
  chapter_no: number | null;
  chapter_title: string | null;
  section_name: string | null;
  term: string | null;
};

// ชื่อบท: "บทที่ 1 ชื่อบท" ถ้าไม่เจอในตาราง chapters ใช้เลข chapter_id แทน
const chapterLabel = (q: Question) =>
  q.chapter_no != null ? `บทที่ ${q.chapter_no} ${q.chapter_title ?? ""}` : `บท (id ${q.chapter_id})`;

export default function ManageQuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [chapter, setChapter] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/admin/quiz-questions`);
        const json = await res.json();
        if (!json.success) {
          setError(json.error || "โหลดข้อมูลไม่สำเร็จ");
          return;
        }
        setQuestions(json.data ?? []);
      } catch {
        setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
      }
    }
    load();
  }, []);

  // รายการบทที่มีคำถาม (ไม่ซ้ำ) ใช้ทำตัวกรอง
  const chapters = Array.from(
    new Map(questions.map((q) => [q.chapter_id, chapterLabel(q)])).entries()
  );
  const shown = chapter
    ? questions.filter((q) => String(q.chapter_id) === chapter)
    : questions;

  return (
    <div className="p-6">
      <div className="overflow-hidden rounded-xl border border-[#E3E6F0] bg-white shadow-sm">
        <div className="flex items-center justify-between bg-[#F8F8FD] px-5 py-4">
          <h2 className="text-lg font-bold text-[#14213F]">แบบทดสอบหลังเรียน</h2>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 rounded-md border border-[#D5D9E6] bg-white px-3 py-2 text-sm text-[#14213F]">
              <Filter size={14} className="text-[#2563EB]" />
              <select
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="max-w-[220px] bg-transparent outline-none"
              >
                <option value="">ทุกบท</option>
                {chapters.map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <Link
              href="/DashboardTeacherLead/ManageQuiz/Addquiz"
              className="flex items-center gap-2 rounded-lg bg-[#0B3FA6] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#093283] active:scale-[0.98]"
            >
              เพิ่มแบบทดสอบ
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
                <th className="w-[15%] px-5 py-3 font-semibold">เทอม</th>
                <th className="w-[10%] px-5 py-3 font-semibold">ภาค</th>
                <th className="w-[20%] px-5 py-3 font-semibold">บท</th>
                <th className="w-[40%] px-5 py-3 font-semibold">คำถาม</th>
                <th className="w-[15%] px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                    ไม่พบแบบทดสอบ
                  </td>
                </tr>
              ) : (
                shown.map((q) => (
                  <tr key={q.question_id} className="border-b border-[#E3E6F0] last:border-0">
                    <td className="px-5 py-4">{q.term ?? "-"}</td>
                    <td className="px-5 py-4">{q.section_name ?? "-"}</td>
                    <td className="px-5 py-4 font-medium">{chapterLabel(q)}</td>
                    <td className="px-5 py-4">
                      <span className="line-clamp-2">{q.question}</span>
                    </td>
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