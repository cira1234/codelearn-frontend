"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlarmClock, Save, X } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Sec = { section_id: number; name: string; sort_order: number; id_term: number };
type TermOpt = { id_term: number; year: string; sem: string };

function ChapterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const termFromUrl = params.get("term");

  const [terms, setTerms] = useState<TermOpt[]>([]);
  const [termId, setTermId] = useState("");
  const [secs, setSecs] = useState<Sec[]>([]);
  const [drafts, setDrafts] = useState<Record<number, string[]>>({}); // section_id -> ชื่อบทใหม่
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // รายการเทอม
  useEffect(() => {
    fetch(`${API}/admin/term-summary`)
      .then((r) => r.json())
      .then((j) => {
        const list: TermOpt[] = (j.data ?? []).map(
          (r: { id_term: number; year: string; sem: string }) => ({
            id_term: r.id_term,
            year: r.year,
            sem: r.sem,
          })
        );
        setTerms(list);
        if (list.length) {
          const hit = list.find((t) => String(t.id_term) === termFromUrl);
          setTermId(String((hit ?? list[0]).id_term));
        }
      })
      .catch(() => setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้"));
  }, [termFromUrl]);

  // section ของเทอมที่เลือก -> เริ่มด้วยช่องว่าง 1 ช่องต่อกลุ่ม
  useEffect(() => {
    if (!termId) return;
    fetch(`${API}/admin/term-chapters?id_term=${termId}`)
      .then((r) => r.json())
      .then((j) => {
        const list: Sec[] = j.data ?? [];
        setSecs(list);
        setDrafts(Object.fromEntries(list.map((s) => [s.section_id, [""]])));
      })
      .catch(() => setError("โหลดข้อมูลไม่สำเร็จ"));
  }, [termId]);

  const addDraft = (sid: number) =>
    setDrafts((d) => ({ ...d, [sid]: [...(d[sid] ?? []), ""] }));
  const setDraft = (sid: number, i: number, v: string) =>
    setDrafts((d) => ({ ...d, [sid]: d[sid].map((x, k) => (k === i ? v : x)) }));
  const delDraft = (sid: number, i: number) =>
    setDrafts((d) => ({ ...d, [sid]: d[sid].filter((_, k) => k !== i) }));

  async function save() {
    const jobs = secs.flatMap((s) =>
      (drafts[s.section_id] ?? [])
        .map((t) => t.trim())
        .filter(Boolean)
        .map((title) => ({ section_id: s.section_id, title }))
    );
    if (jobs.length === 0) return setError("กรุณากรอกชื่อบทอย่างน้อย 1 บท");

    setLoading(true);
    setError("");
    try {
      for (const job of jobs) {
        const r = await (
          await fetch(`${API}/admin/chapter-create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(job),
          })
        ).json();
        if (!r.success) return setError(r.error || "บันทึกบทไม่สำเร็จ");
      }
      router.back();
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setLoading(false);
    }
  }

  const heading = "text-[28px] font-bold leading-tight text-[#14213F]";
  const row =
    "h-11 flex-1 rounded-lg border border-[#D5D9E6] bg-white px-4 text-sm text-[#14213F] outline-none focus:border-[#0B5ED7] focus:ring-2 focus:ring-[#0B5ED7]/20";
  const xBtn =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#2563EB] text-white hover:opacity-80";

  return (
    <div className="min-h-[calc(100vh-48px)] px-16 pb-10 pt-16">
      <div className="mx-auto max-w-[900px]">
        <h2 className={heading}>เทอม</h2>
        <label className="mt-2 flex h-12 items-center gap-3 rounded-xl border border-[#D5D9E6] bg-white px-4">
          <AlarmClock size={20} className="shrink-0 text-[#2563EB]" />
          <select
            value={termId}
            onChange={(e) => setTermId(e.target.value)}
            className="w-full bg-transparent text-sm font-bold text-[#14213F] outline-none"
          >
            {terms.map((t) => (
              <option key={t.id_term} value={t.id_term}>
                เทอม {t.sem} ปีการศึกษา {t.year}
              </option>
            ))}
          </select>
        </label>

        {secs.length === 0 && termId && (
          <p className="mt-10 text-sm text-gray-500">
            เทอมนี้ยังไม่มีกลางภาค/ปลายภาคในตาราง sections (ต้องสร้างแถว sections ของเทอมนี้ก่อน)
          </p>
        )}

        {secs.map((s) => (
          <section key={s.section_id} className="mt-16">
            <h2 className={heading}>เนื้อหา{s.name}</h2>
            <div className="mt-5 flex flex-col gap-3">
              {(drafts[s.section_id] ?? []).map((t, i) => (
                <div key={i} className="flex gap-3">
                  <input
                    value={t}
                    onChange={(e) => setDraft(s.section_id, i, e.target.value)}
                    placeholder="เช่น บทที่ 1 ความรู้เบื้องต้นเกี่ยวกับคอมพิวเตอร์"
                    className={row}
                  />
                  <button
                    type="button"
                    aria-label="ลบช่อง"
                    onClick={() => delDraft(s.section_id, i)}
                    className={xBtn}
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => addDraft(s.section_id)}
                className="rounded-lg bg-[#2563EB] px-6 py-2.5 text-sm font-bold text-white hover:opacity-90"
              >
                เพิ่มบท +
              </button>
            </div>
          </section>
        ))}

        {error && <p className="mt-6 text-sm text-red-500">{error}</p>}

        <div className="mt-16 flex justify-center gap-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex w-[200px] items-center justify-center gap-2 rounded-lg bg-[#0B5ED7] py-3 text-sm font-bold text-white hover:bg-[#0A4FB5]"
          >
            <X size={16} />
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={save}
            disabled={loading}
            className="flex w-[200px] items-center justify-center gap-2 rounded-lg bg-[#0B5ED7] py-3 text-sm font-bold text-white hover:bg-[#0A4FB5] disabled:opacity-60"
          >
            <Save size={16} />
            {loading ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManageChapterPage() {
  return (
    <Suspense>
      <ChapterForm />
    </Suspense>
  );
}