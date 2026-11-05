"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Check, Play, Save, Star } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
// TODO: endpoint รันโค้ดที่หน้านักศึกษาใช้อยู่ (ตอนนี้เดาเป็น /run)
const RUN_PATH = "/run";

type Submission = {
  id: number;
  code: string;
  output: string | null;
  submitted_at: string;
  name: string;
  id_student: string | null;
  picture: string | null;
  score: number | null;
  comment: string | null;
};

type RunResult = { text: string; failed: boolean; exitCode?: number; time?: string };

function Content() {
  const router = useRouter();
  const params = useSearchParams();
  const lab = params.get("lab");
  const user = params.get("user");

  const [sub, setSub] = useState<Submission | null>(null);
  const [score, setScore] = useState("");
  const [comment, setComment] = useState("");
  const [run, setRun] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const base = `${API}/teacher/labs/${lab}/submissions/${user}`;

  useEffect(() => {
    if (!lab || !user) return;
    fetch(base, { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        if (!j.success) return setError(j.error ?? "โหลดข้อมูลไม่สำเร็จ");
        setSub(j.submission);
        setScore(j.submission.score != null ? String(j.submission.score) : "");
        setComment(j.submission.comment ?? "");
      })
      .catch(() => setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lab, user]);

//   async function runCode() {
//     if (!sub) return;
//     setRunning(true);
//     setRun(null);
//     try {
//       const res = await fetch(`${API}${RUN_PATH}`, {
//         method: "POST",
//         credentials: "include",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ code: sub.code, language: "c" }),
//       });
//       const j = await res.json();
//       const err = j.stderr ?? j.error ?? "";
//       setRun({
//         text: [j.output ?? j.stdout ?? "", err].filter(Boolean).join("\n"),
//         failed: Boolean(err) || (j.exit_code ?? 0) !== 0,
//         exitCode: j.exit_code,
//         time: j.time,
//       });
//     } catch {
//       setRun({ text: "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้", failed: true });
//     } finally {
//       setRunning(false);
//     }
//   }

  async function save(finish: boolean) {
    setError("");
    setNotice("");
    const n = score.trim() === "" ? null : Number(score);
    if (n !== null && (Number.isNaN(n) || n < 0 || n > 10)) {
      setError("คะแนนต้องอยู่ระหว่าง 0 ถึง 10");
      return;
    }
    if (finish && n === null) {
      setError("กรุณาให้คะแนนก่อนกดตรวจเสร็จสิ้น");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${base}/review`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: n, comment }),
      });
      const j = await res.json();
      if (!j.success) return setError(j.error ?? "บันทึกไม่สำเร็จ");
      if (finish) router.back();
      else setNotice("บันทึกแล้ว");
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setSaving(false);
    }
  }

  if (!lab || !user) return <p className="p-6 text-sm text-red-600">ไม่พบรหัสใบงานหรือนักศึกษา</p>;

  const lines = (sub?.code ?? "").split("\n");
  const terminalText = run ? run.text : sub?.output ?? "";
  const terminalLabel = run ? "OUTPUT (รันโดยอาจารย์)" : "OUTPUT (ที่นักศึกษารันไว้)";

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-[#14213F]">ตรวจงาน</h1>
      <p className="mt-1 text-sm text-gray-600">Check work submission</p>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 overflow-hidden rounded-xl border border-[#D9DBE6] bg-[#FAF9FF]">
        {/* นักศึกษา */}
        <div className="flex items-center justify-between border-b border-[#D9DBE6] bg-[#F3F2FA] px-4 py-3">
          <div className="flex items-center gap-3">
            {sub?.picture ? (
              <img src={sub.picture} alt="" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DDE3F0] text-xs font-bold text-gray-600">
                {(sub?.name ?? "?").slice(0, 2).toUpperCase()}
              </span>
            )}
            <div>
              <div className="text-sm font-semibold text-[#14213F]">{sub?.name ?? "..."}</div>
              <div className="text-xs text-gray-600">{sub?.id_student ?? "-"}</div>
            </div>
          </div>
          {sub && (
            <span className="rounded-full bg-[#CFE5DD] px-2.5 py-0.5 text-[11px] font-medium text-[#1F5F4B]">
              ส่งแล้ว {new Date(sub.submitted_at).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}
            </span>
          )}
        </div>

        {/* โค้ดที่ส่ง */}
        <div className="flex items-center justify-between bg-white px-4 py-2 text-sm text-[#14213F]">
          <span>Code Editor (อ่านอย่างเดียว)</span>
     
        </div>
        <div className="max-h-[360px] overflow-auto border-t border-[#D9DBE6] bg-[#FAF9FF] py-4 font-mono text-[13px] leading-6 text-[#14213F]">
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="w-12 shrink-0 select-none pr-4 text-right text-gray-400">{i + 1}</span>
              <pre className="whitespace-pre-wrap break-all">{line || " "}</pre>
            </div>
          ))}
        </div>

        {/* Terminal */}
        <div className="bg-[#2A2D35] px-4 py-3 font-mono text-[13px] text-gray-100">
          <div className="border-b border-white/10 pb-2 text-[11px] text-gray-400">{terminalLabel}</div>
          <pre className={`mt-3 min-h-[72px] whitespace-pre-wrap ${run?.failed ? "text-red-300" : ""}`}>
            {terminalText || "ยังไม่มีผลลัพธ์ — กด Run Code เพื่อคอมไพล์และรัน"}
          </pre>
          {run && run.exitCode !== undefined && (
            <pre className="mt-3 text-xs text-gray-400">
              [Program finished with exit code {run.exitCode}]
              {run.time ? `\nExecution time: ${run.time}` : ""}
            </pre>
          )}
        </div>
      </div>

      {/* ให้คะแนน + คอมเมนต์ */}
      <div className="mt-5 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="score" className="block text-base font-semibold text-[#14213F]">
            คะแนน
          </label>
          <div className="mt-2 flex h-11 w-44 items-center gap-2 rounded-lg border border-[#D9DBE6] bg-white px-3">
            <Star size={16} className="text-gray-400" />
            <input
              id="score"
              type="number"
              min={0}
              max={10}
              step={0.5}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="ให้คะแนน 10/10"
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="min-w-[260px] flex-1">
          <label htmlFor="comment" className="block text-base font-semibold text-[#14213F]">
            คอมเมนต์งาน
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comment"
              className="h-11 w-full rounded-lg border border-[#D9DBE6] bg-white px-4 text-sm outline-none focus:border-[#0B54D0]"
            />
          <button
  type="button"
  onClick={() => save(false)}
  disabled={saving || !sub}
  title="บันทึกคะแนนและคอมเมนต์"
  className="flex h-11 w-14 shrink-0 items-center justify-center rounded-lg bg-[#0B54D0] text-white hover:bg-[#0948b3] disabled:opacity-60"
>
  <Save size={18} />
</button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-4">
        {notice && <span className="text-sm font-medium text-green-600">{notice}</span>}
        <button
          type="button"
          onClick={() => save(true)}
          disabled={saving || !sub}
          className="inline-flex h-12 w-56 items-center justify-center gap-2 rounded-lg bg-[#0B3D9E] text-sm font-semibold text-white hover:bg-[#093485] disabled:opacity-60"
        >
          {saving ? "กำลังบันทึก..." : "ตรวจเสร็จสิ้น"}
          <Check size={16} />
        </button>
      </div>
    </div>
  );
}

export default function ViewSubmissionPage() {
  return (
    <Suspense>
      <Content />
    </Suspense>
  );
}