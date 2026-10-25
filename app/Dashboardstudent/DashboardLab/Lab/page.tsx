"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bot, Play, RotateCcw } from "lucide-react";

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
  lab_id?: number;
  id?: number;
  [key: string]: unknown;
};

type Output = { text: string; isError: boolean };

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

  const gutterRef = useRef<HTMLDivElement>(null);

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
          ? list.find((l, i) => String(l.lab_id ?? l.id ?? i + 1) === labKey)
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

  function resetCode() {
    setCode(STARTER);
    setOutput(null);
    setLastError("");
    setAiText("");
  }

  async function runCode() {
    if (running) return;
    setRunning(true);
    setOutput({ text: "กำลังคอมไพล์...", isError: false });
    setAiText("");
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
        <h2 className="text-xl font-bold text-[#14213F]">{lab.namelab}</h2>
        {description && (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">
            {description}
          </p>
        )}
      </section>

      {/* 2) Code editor */}
      <section className="overflow-hidden rounded-lg border border-[#E3E6F0] bg-[#F8F8FD]">
        <div className="border-b border-[#E3E6F0] px-4 py-2 text-sm text-gray-600">
          Code Editor
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
            onScroll={(e) => {
              if (gutterRef.current)
                gutterRef.current.scrollTop = e.currentTarget.scrollTop;
            }}
            spellCheck={false}
            wrap="off"
            className="flex-1 resize-none overflow-auto whitespace-pre bg-transparent p-3 font-mono text-sm leading-6 text-[#14213F] outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-[#E3E6F0] bg-white px-4 py-3">
          <button
            type="button"
            onClick={resetCode}
            className="flex items-center gap-2 rounded-lg border border-[#C3C6D6] bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            <RotateCcw size={16} />
            Reset
          </button>
          <button
            type="button"
            onClick={runCode}
            disabled={running}
            className="flex items-center gap-2 rounded-lg bg-[#22C55E] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#16A34A] disabled:opacity-60"
          >
            {running ? "กำลังรัน..." : "Run Code"}
            <Play size={16} />
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
          disabled={aiLoading || aiLimitReached}
          className="flex items-center gap-2 rounded-lg border border-[#2563EB] bg-white px-4 py-2 text-sm font-medium text-[#2563EB] transition hover:bg-[#F1F3FD] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Bot size={18} />
          {aiLoading ? "AI กำลังคิด..." : `ถาม AI ${aiUsed}/${MAX_AI}`}
        </button>
      </div>

      {/* 5) คำตอบ AI + วิธีแก้ */}
      <section className="min-h-[140px] rounded-lg bg-[#2B2D36] p-4 text-sm">
        <div className="mb-2 border-b border-white/10 pb-2 font-mono text-xs tracking-widest text-gray-500">
          AI
        </div>
        <pre className="whitespace-pre-wrap font-sans leading-6 text-gray-100">
          {aiText ||
            (aiLimitReached
              ? "ใช้สิทธิ์ถาม AI ครบแล้ว"
              : "เมื่อโค้ดมี error กดปุ่มถาม AI เพื่อดูคำอธิบายและวิธีแก้")}
        </pre>
      </section>
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