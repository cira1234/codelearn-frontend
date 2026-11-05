"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, Trophy } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
// เดา: แก้ให้ตรงกับ path จริงของหน้า Lab
const LAB_PATH = "/Dashboardstudent/MyCourses/Lab";

type Row = {
  id_lab: number;
  namelab: string;
  detail: string | null;
  chapter_id: number;
  chapter_no: number;
  chapter_title: string;
  submitted_at: string | null;
};

const fmtDate = (d: string) =>
  new Date(d.replace(" ", "T")).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function getUserId(): number | null {
  try {
    const u = JSON.parse(localStorage.getItem("user") ?? "{}");
    return u?.user_id ?? u?.id ?? null;
  } catch {
    return null;
  }
}

export default function LabHistoryPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const uid = getUserId();
    if (!uid) {
      setError("ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่");
      setRows([]);
      return;
    }
    fetch(`${API}/labs/history/${uid}`)
      .then((r) => r.json())
      .then((j) => {
        if (!j.success) {
          setError(j.error || "โหลดข้อมูลไม่สำเร็จ");
          setRows([]);
          return;
        }
        setRows(j.data ?? []);
      })
      .catch(() => {
        setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
        setRows([]);
      });
  }, []);

  if (rows === null) return null;

  // จัดกลุ่มตามบท
  const groups = Array.from(
    rows.reduce((m, r) => {
      const g = m.get(r.chapter_id) ?? { no: r.chapter_no, title: r.chapter_title, items: [] as Row[] };
      g.items.push(r);
      m.set(r.chapter_id, g);
      return m;
    }, new Map<number, { no: number; title: string; items: Row[] }>())
  );

  const total = rows.length;
  const done = rows.filter((r) => r.submitted_at).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-10 p-6 lg:flex-row">
      {/* ซ้าย: รายการ lab แยกตามบท */}
      <div className="flex-1">
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        {groups.length === 0 && !error && (
          <p className="text-gray-500">ยังไม่มีโจทย์ Lab</p>
        )}

        <div className="flex flex-col gap-10">
          {groups.map(([chapterId, g]) => (
            <section key={chapterId}>
              <h2 className="text-lg font-bold text-[#14213F]">
                บทที่ {g.no} {g.title.replace(/^บทที่\s*\d+\s*/, "")}
              </h2>
              <div className="mt-4 flex flex-col gap-4">
                {g.items.map((r) => {
                  const ok = !!r.submitted_at;
                  return (
                    <div
                      key={r.id_lab}
                      className="flex items-center gap-4 rounded-lg border border-[#E3E6F0] border-l-4 border-l-[#065F46] bg-[#FBFAFE] p-4"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#DDE3F5] text-[#0B3FA6]">
                        <Copy size={22} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#14213F]">
                          ใบงานที่ {r.id_lab} {r.namelab}
                        </p>
                        {ok && (
                          <p className="mt-1 text-xs text-gray-500">
                            ส่งเมื่อ {fmtDate(r.submitted_at!)}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            ok ? "bg-[#DCF3EA] text-[#065F46]" : "bg-[#FDE2E2] text-[#B91C1C]"
                          }`}
                        >
                          {ok ? "FINISHED" : "UNFINISHED"}
                        </span>
                        <Link
                          href={`/Dashboardstudent/DashboardLab/Lab?chapterId=${r.chapter_id}&lab=${r.id_lab}`}
                          className="rounded-md border border-[#C3C6D6] bg-white px-5 py-1 text-xs font-semibold text-[#14213F] transition hover:bg-gray-50"
                        >
                          Open
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* ขวา: Learning Progress */}
      <aside className="w-full shrink-0 lg:w-[300px]">
        <h2 className="text-lg font-bold text-[#14213F]">Learning Progress</h2>
        <div className="mt-4 rounded-xl border border-[#E3E6F0] bg-[#FBFAFE] p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCEFE8] text-[#065F46]">
              <Trophy size={20} />
            </span>
            <div>
              <p className="text-sm font-bold text-[#14213F]">Lab Progress</p>
              <p className="text-xs text-gray-500">ส่งแล้ว {done} จาก {total} ข้อ</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-gray-600">{done} / {total} lab</span>
            <span className="font-bold text-[#065F46]">{pct}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#E3E6F0]">
            <div className="h-full rounded-full bg-[#065F46]" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </aside>
    </div>
  );
}