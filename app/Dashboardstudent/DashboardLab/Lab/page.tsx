"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bot, CheckCircle2, Play, RotateCcw, Send } from "lucide-react";
import commentImg from "@/app/image/comment.png";
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const MAX_AI = 3;

// ชื่อคอลัมน์ในตาราง lab ที่เก็บ "รายละเอียดโจทย์"
// ผมยังไม่รู้ชื่อจริง จึงปล่อยว่างไว้ (ว่าง = แสดงแค่ชื่อโจทย์ namelab)
const DESC_FIELD: string = "";

const STARTER = `#include <stdio.h>

int main() {
    
    return 0;
}
`;

type Lab = {
  namelab: string;
  id_lab?: number;
  lab_id?: number;
  id?: number;
  detail?: string;
  [key: string]: unknown;
};

type Output = { text: string; isError: boolean };

// อ่าน user_id จาก localStorage["user"] (รองรับทั้ง user_id และ id)
function getUserId(): number | null {
  try {
    const u = JSON.parse(localStorage.getItem("user") ?? "{}");
    return u?.user_id ?? u?.id ?? null;
  } catch {
    return null;
  }
}

function LabContent() {
  const sp = useSearchParams();
  const chapterId = sp.get("chapterId");
  const labKey = sp.get("lab");

  const [lab, setLab] = useState<Lab | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [code, setCode] = useState(STARTER);
  const [output, setOutput] = useState<Output | null>(null);
  const [lastError, setLastError] = useState("");
  const [running, setRunning] = useState(false);

  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiUsed, setAiUsed] = useState(0);
  // 👇 สถานะสำหรับเช็กว่ากดถาม AI ไปแล้วหรือยัง
  const [hasAsked, setHasAsked] = useState(false); 

  // สถานะการส่ง Lab
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  // ผลตรวจจากอาจารย์
  const [score, setScore] = useState<number | null>(null);
  const [teacherComment, setTeacherComment] = useState("");

  const gutterRef = useRef<HTMLDivElement>(null);

  // รหัสโจทย์ที่ใช้บันทึกการส่ง (ตาราง lab ใช้ id_lab)
  const rawId = lab ? (lab.id_lab ?? lab.lab_id ?? lab.id) : undefined;
  const idLab = rawId !== undefined && rawId !== null && !Number.isNaN(Number(rawId)) ? Number(rawId) : null;

  // โหลดโจทย์ของบทนี้ แล้วเลือกข้อที่ตรงกับ ?lab=
  useEffect(() => {
    if (!chapterId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    setCode(STARTER);
    setOutput(null);
    setLastError("");
    setAiText("");
    setHasAsked(false); // 👈 รีเซ็ตสถานะแชทเมื่อเปลี่ยนโจทย์
    setSubmitted(false);
    setSubmitMsg("");
    setScore(null);
    setTeacherComment("");

    fetch(`${API}/chapters/${chapterId}/labs`, { credentials: "include" })
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (!json.success) {
          setError(json.error ?? "โหลดโจทย์ไม่สำเร็จ");
          return;
        }
        const list: Lab[] = json.labs ?? [];
        const found = labKey
          ? list.find((l, i) => String(l.id_lab ?? l.lab_id ?? l.id ?? i + 1) === labKey)
          : list[0];
        setLab(found ?? null);
      })
      .catch(() => {
        if (!cancelled) setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [chapterId, labKey]);

  // เช็กว่านักเรียนคนนี้ส่งข้อนี้ไปแล้วหรือยัง ถ้าส่งแล้วแสดงโค้ดที่เคยส่ง ล็อกปุ่ม และโหลดผลตรวจ
  useEffect(() => {
    const uid = getUserId();
    if (!idLab || !uid) return;
    let cancelled = false;
    fetch(`${API}/labs/${idLab}/submission/${uid}`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j.success && j.submitted) {
          setSubmitted(true);
          setCode(j.code ?? STARTER);
          setScore(j.score != null ? Number(j.score) : null);
          setTeacherComment(j.comment ?? "");
        } else {
          setSubmitted(false);
          setScore(null);
          setTeacherComment("");
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [idLab]);

  function resetCode() {
    if (submitted) return;
    setCode(STARTER);
    setOutput(null);
    setLastError("");
    setAiText("");
    setHasAsked(false); // 👈 รีเซ็ตแชท
  }

  async function runCode() {
    if (running || submitted) return;
    setRunning(true);
    setOutput({ text: "กำลังคอมไพล์...", isError: false });
    setAiText("");
    setHasAsked(false); // 👈 รีเซ็ตแชทเมื่อรันโค้ดใหม่
    try {
      const res = await fetch(`${API}/compile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const json = await res.json();
      if (json.success) {
        const err: string = json.error ?? "";
        const out: string = json.output ?? "";
        setOutput({
          text: out + (err ? `\n${err}` : "") || "(โปรแกรมไม่มีข้อความแสดงผล)",
          isError: !!err,
        });
        setLastError(err);
      } else {
        const err: string = json.error ?? "คอมไพล์ไม่สำเร็จ";
        setOutput({ text: err, isError: true });
        setLastError(err);
      }
    } catch {
      setOutput({ text: "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้", isError: true });
      setLastError("");
    } finally {
      setRunning(false);
    }
  }

  async function askAi() {
    if (aiLoading || aiUsed >= MAX_AI) return;
    
    setHasAsked(true); // 👈 แสดงกล่องแชทเมื่อกดปุ่ม

    if (!lastError) {
      setAiText("ยังไม่มี error ให้วิเคราะห์ กด Run Code ก่อน");
      return;
    }
    setAiLoading(true);
    setAiText("");
    try {
      const res = await fetch(`${API}/useai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: lastError, code }),
      });
      const json = await res.json();
      setAiText(json.ai_explanation ?? "AI ไม่ตอบกลับ");
      if (json.success) setAiUsed((n) => n + 1);
    } catch {
      setAiText("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setAiLoading(false);
    }
  }

  // ส่ง Lab: บันทึกลง lab_submissions แล้วล็อกไม่ให้ส่งซ้ำ
  async function submitLab() {
    if (submitted || submitting) return;
    const uid = getUserId();
    if (!uid) return setSubmitMsg("ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่");
    if (!idLab) return setSubmitMsg("ไม่พบรหัสโจทย์ (id_lab)");
    if (!code.trim()) return setSubmitMsg("ยังไม่มีโค้ด");
    if (!confirm("ส่ง Lab แล้วจะส่งซ้ำหรือแก้ไขไม่ได้ ยืนยันส่งหรือไม่?")) return;

    setSubmitting(true);
    setSubmitMsg("");
    try {
      const res = await fetch(`${API}/labs/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: uid,
          id_lab: idLab,
          code,
          output: output?.text ?? "",
        }),
      });
      const j = await res.json();
      if (j.success || j.already) setSubmitted(true);
      else setSubmitMsg(j.error ?? "ส่งไม่สำเร็จ");
    } catch {
      setSubmitMsg("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setSubmitting(false);
    }
  }

  // กด Tab ในช่องโค้ดให้เว้น 4 ช่อง แทนการย้าย focus
  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const t = e.currentTarget;
    const s = t.selectionStart;
    const en = t.selectionEnd;
    setCode(code.slice(0, s) + "    " + code.slice(en));
    requestAnimationFrame(() => {
      t.selectionStart = t.selectionEnd = s + 4;
    });
  }

  if (!chapterId) return <p className="text-gray-500">ไม่พบรหัสบทเรียน</p>;
  if (loading) return <p className="text-gray-500">กำลังโหลด...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!lab) return <p className="text-gray-500">ไม่พบโจทย์ข้อนี้</p>;

  const description = DESC_FIELD ? String(lab[DESC_FIELD] ?? "") : "";
  const lineCount = code.split("\n").length;
  const aiLimitReached = aiUsed >= MAX_AI;

  return (
    <div className="flex flex-col gap-4">
      {/* 1) โจทย์ */}
      <section className="rounded-lg border border-[#E3E6F0] bg-white p-5">
        <h2 className="text-xl font-bold text-[#14213F]">{lab.detail}</h2>
        {description && (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">
            {description}
          </p>
        )}
      </section>

      {/* 2) Code editor */}
      <section className="overflow-hidden rounded-lg border border-[#E3E6F0] bg-[#F8F8FD]">
        <div className="flex items-center justify-between border-b border-[#E3E6F0] px-4 py-2 text-sm text-gray-600">
          <span>Code Editor</span>
          {submitted && (
            <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
              <CheckCircle2 size={14} /> ส่งแล้ว (แก้ไขไม่ได้)
            </span>
          )}
        </div>

        <div className="flex h-[320px] bg-white">
          <div
            ref={gutterRef}
            className="select-none overflow-hidden px-3 py-3 text-right font-mono text-sm leading-6 text-gray-400"
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={onKeyDown}
            readOnly={submitted}
            onScroll={(e) => {
              if (gutterRef.current)
                gutterRef.current.scrollTop = e.currentTarget.scrollTop;
            }}
            spellCheck={false}
            wrap="off"
            className={`flex-1 resize-none overflow-auto whitespace-pre p-3 font-mono text-sm leading-6 text-[#14213F] outline-none ${
              submitted ? "bg-gray-50" : "bg-transparent"
            }`}
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#E3E6F0] bg-white px-4 py-3">
          {submitMsg && <span className="mr-auto text-sm text-red-500">{submitMsg}</span>}
          <button
            type="button"
            onClick={resetCode}
            disabled={submitted}
            className="flex items-center gap-2 rounded-lg border border-[#C3C6D6] bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw size={16} />
            Reset
          </button>
          <button
            type="button"
            onClick={runCode}
            disabled={running || submitted}
            className="flex items-center gap-2 rounded-lg bg-[#22C55E] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#16A34A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {running ? "กำลังรัน..." : "Run Code"}
            <Play size={16} />
          </button>
          <button
            type="button"
            onClick={submitLab}
            disabled={submitted || submitting}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed ${
              submitted
                ? "bg-green-600 opacity-80"
                : "bg-[#0B3FA6] hover:bg-[#093283] disabled:opacity-50"
            }`}
          >
            {submitted ? "ส่งแล้ว" : submitting ? "กำลังส่ง..." : "ส่ง Lab"}
            {submitted ? <CheckCircle2 size={16} /> : <Send size={16} />}
          </button>
        </div>
      </section>

      {/* 3) Compiler output */}
      <section className="min-h-[140px] rounded-lg bg-[#2B2D36] p-4 font-mono text-sm">
        <div className="mb-2 border-b border-white/10 pb-2 text-xs tracking-widest text-gray-500">
          OUTPUT
        </div>
        <pre
          className={`whitespace-pre-wrap ${
            output?.isError ? "text-red-300" : "text-gray-100"
          }`}
        >
          {output ? output.text : "กด Run Code เพื่อดูผลลัพธ์"}
        </pre>
      </section>

      {/* 4) ปุ่มถาม AI */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={askAi}
          disabled={aiLoading || aiLimitReached || submitted}
          className="flex items-center gap-2 rounded-lg border border-[#2563EB] bg-white px-4 py-2 text-sm font-medium text-[#2563EB] transition hover:bg-[#F1F3FD] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Bot size={18} />
          {aiLoading ? "AI กำลังคิด..." : `ถาม AI ${aiUsed}/${MAX_AI}`}
        </button>
      </div>

      {/* 5) คำตอบ AI (แบบมาสคอสพูด) */}
      {hasAsked && (
        <div className="relative mt-8 mb-4 flex flex-col md:flex-row items-end justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* มาสคอส (ฝั่งซ้าย) */}
          <div className="w-32 md:w-40 shrink-0 relative mb-4">
            <img
              src={aiLoading ? "/cbot/sleep.png" : "/cbot/cheer.png"}
              alt="AI Mascot"
              className="w-full drop-shadow-lg transition-transform hover:scale-105"
            />
            {/* แอนิเมชัน Zzz ตอนนอน */}
            {aiLoading && (
              <div className="absolute -top-4 right-0 flex flex-col items-center animate-pulse">
                <span className="font-bold text-2xl text-[#2563EB]">Z</span>
                <span className="font-bold text-lg text-[#2563EB] ml-2">z</span>
                <span className="font-bold text-sm text-[#2563EB] ml-4">z</span>
              </div>
            )}
          </div>

          {/* กล่องข้อความ (Speech Bubble) */}
          <div className="relative flex-1 max-w-2xl w-full">
            {/* หางชี้ไปที่มาสคอส (ทำด้วย CSS) */}
            <div className="absolute -left-3 bottom-8 h-6 w-6 rotate-45 border-b-[3px] border-l-[3px] border-[#0B3FA6] bg-white rounded-sm z-0"></div>
            
            {/* ตัวกล่องข้อความ */}
            <div className="relative z-10 rounded-[2rem] border-[3px] border-[#0B3FA6] bg-white p-6 shadow-[0_8px_0_rgb(11,63,166,0.2)] min-h-[140px] flex flex-col justify-center">
              
              {/* ไอคอนเครื่องหมายคำถาม (โชว์เฉพาะตอนรอคำตอบ) */}
              {aiLoading && (
                <div className="absolute -top-5 -left-5 bg-white rounded-full p-1 shadow-md border-2 border-[#0B3FA6] animate-bounce">
                  <div className="bg-[#2563EB] text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold">?</div>
                </div>
              )}

              <div className="text-[#14213F]">
                {aiLoading ? (
                  <p className="text-lg font-semibold flex items-center gap-2">
                    AI กำลังหาสาเหตุของ Error...
                  </p>
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">
                    {aiText}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6) คอมเมนต์และคะแนนจากอาจารย์ (แสดงเมื่อส่งแล้วและอาจารย์ตรวจแล้ว) */}
      {submitted && (score !== null || teacherComment) && (
        <div className="flex flex-col gap-3 mt-4">
          {score !== null && (
            <div className="flex justify-end">
              <span className="rounded-full bg-[#C9DCDD] px-8 py-1 text-xs font-medium text-[#14213F]">
                คะแนน {score}/10
              </span>
            </div>
          )}
          <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-md shadow-gray-200/50">
            <h2 className="text-2xl font-bold text-[#14213F]">คอมเมนต์งานจากอาจารย์</h2>
            
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-6 md:gap-10">
              <img
                src={commentImg.src}
                alt=""
                className="w-40 md:w-48 shrink-0 object-contain"
              />
              <p className="whitespace-pre-wrap text-lg leading-relaxed text-gray-700">
                {teacherComment || "อาจารย์ยังไม่ได้เขียนคอมเมนต์"}
              </p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default function LabPage() {
  return (
    <Suspense fallback={<p className="text-gray-500">กำลังโหลด...</p>}>
      <LabContent />
    </Suspense>
  );
}