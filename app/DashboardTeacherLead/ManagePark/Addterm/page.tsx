"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlarmClock, CalendarDays, Save } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function AddTermPage() {
  const router = useRouter();
  const [termText, setTermText] = useState("1/2569");
  const [day, setDay] = useState("");
  const [start, setStart] = useState("13:00");
  const [end, setEnd] = useState("16:00");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // แยก "1/2569" -> เทอม 1, ปี 2569
  const m = termText.trim().match(/^([12])\s*\/\s*(\d{4})$/);
  const semester = m ? Number(m[1]) : null;
  const year = m ? Number(m[2]) : null;
  const examLabel = semester === 2 ? "สอบปลายภาค" : "สอบกลางภาค";

  async function save() {
    if (!m || semester === null || year === null)
      return setError("รูปแบบเทอมไม่ถูกต้อง ใช้เช่น 1/2569 หรือ 2/2569");
    if (!day) return setError("กรุณาเลือกวันที่สอบ");
    if (start >= end) return setError("เวลาเริ่มต้องน้อยกว่าเวลาสิ้นสุด");

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/admin/term-create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          semester,
          year,
          day_sob: day,
          start_time: start,
          end_time: end,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "บันทึกไม่สำเร็จ");
        return;
      }
      router.back();
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setLoading(false);
    }
  }

  const heading = "text-[28px] font-bold leading-tight text-[#14213F]";
  const subHeading = "text-[24px] font-bold leading-tight text-[#14213F]";
  const box =
    "flex h-12 items-center gap-3 rounded-xl border border-[#D5D9E6] bg-white px-4 text-sm font-bold text-[#14213F] focus-within:border-[#0B5ED7] focus-within:ring-2 focus-within:ring-[#0B5ED7]/20";
  const input = "w-full bg-transparent font-bold outline-none";

  return (
    <div className="min-h-[calc(100vh-48px)] px-16 pb-10 pt-20">
      <div className="mx-auto max-w-[900px]">
        {/* เทอม */}
        <h2 className={heading}>เทอม</h2>
        <label className={`${box} mt-2`}>
          <AlarmClock size={20} className="shrink-0 text-[#2563EB]" />
          <input
            value={termText}
            onChange={(e) => setTermText(e.target.value)}
            placeholder="เช่น 1/2569"
            className={input}
          />
        </label>

        {/* สอบ */}
        <h2 className={`${heading} mt-24`}>{examLabel}</h2>

        <div className="mt-6 grid grid-cols-[1fr_1fr] gap-6">
          <div>
            <h3 className={subHeading}>วันที่สอบ</h3>
            <label className={`${box} mt-3`}>
              <CalendarDays size={20} className="shrink-0 text-[#2563EB]" />
              <input
                type="date"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className={input}
              />
            </label>
          </div>

          <div>
            <h3 className={subHeading}>เวลาที่สอบ</h3>
            <div className={`${box} mt-3`}>
              <CalendarDays size={20} className="shrink-0 text-[#2563EB]" />
              <input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className={input}
              />
              <span className="text-gray-400">-</span>
              <input
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className={input}
              />
            </div>
          </div>
        </div>

        {error && <p className="mt-6 text-sm text-red-500">{error}</p>}

        {/* ปุ่มบันทึก */}
        <div className="mt-40 flex justify-end">
          <button
            type="button"
            onClick={save}
            disabled={loading}
            className="flex w-[180px] items-center justify-center gap-2 rounded-xl bg-[#0B5ED7] py-3 text-sm font-bold text-white transition hover:bg-[#0A4FB5] active:scale-[0.98] disabled:opacity-60"
          >
            <Save size={18} />
            {loading ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>
    </div>
  );
}