"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Home,
  CalendarDays,
  CheckCircle2,
  Copy,
  RefreshCw,
  Check,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type ClassInfo = {
  id: number;
  group_name: string;
  term: string;
  course_title: string;
  join_code: string;
};

// สุ่มรหัสตัวเลข 4 หลัก (1000-9999)
function generateCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function CreateCodeContent() {
  const router = useRouter();
  const params = useSearchParams();
  const classId = params.get("classId");

  const [cls, setCls] = useState<ClassInfo | null>(null);
  const [code, setCode] = useState(""); // รหัสที่แสดงอยู่ (อาจเป็นรหัสที่สุ่มใหม่ ยังไม่บันทึก)
  const [savedCode, setSavedCode] = useState(""); // รหัสที่บันทึกอยู่ใน DB ตอนนี้
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // TODO: ยังไม่มีข้อมูลช่วงวันที่ของโค้ดจาก backend (ใน Figma คือ "20 สิงหาคม - 22 สิงหาคม 2569")
  // ถ้ามีข้อมูลแล้วให้ setDateRange("...") ตรงนี้ ถ้าเป็นค่าว่างจะไม่แสดงแถบวันที่
  const [dateRange] = useState("");

  useEffect(() => {
    if (!classId) {
      setLoading(false);
      setError("ไม่พบรหัสห้องใน URL (ต้องเปิดด้วย ?classId=1)");
      return;
    }
    setLoading(true);
    // ใช้ endpoint เดิมที่หน้ารายละเอียดห้องใช้อยู่ (คืน class.join_code)
    fetch(`${API}/teacher/class/${classId}/students`)
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error || "โหลดข้อมูลไม่สำเร็จ");
          return;
        }
        setCls(json.class);
        setCode(String(json.class?.join_code ?? ""));
        setSavedCode(String(json.class?.join_code ?? ""));
        setError("");
      })
      .catch(() => setError("เชื่อมต่อ backend ไม่ได้"))
      .finally(() => setLoading(false));
  }, [classId]);

  const dirty = code !== savedCode;

  async function copyCode() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      alert("คัดลอกไม่สำเร็จ");
    }
  }

  // สุ่มในหน้า UI เท่านั้น ยังไม่เรียก backend
  function regenerate() {
    let next = generateCode();
    // กันสุ่มได้เลขเดิม
    while (next === code) next = generateCode();
    setCode(next);
    setCopied(false);
    setError("");
  }

  // กด Create Class ค่อยบันทึกรหัสลง backend (UPDATE แถวเดิมของกลุ่มเรียน)
  async function createClass() {
    if (!classId || !code) return;

    // ไม่ได้เปลี่ยนรหัส ไม่ต้องบันทึกซ้ำ
    if (!dirty) {
      router.back();
      return;
    }

    setSaving(true);
    setError("");
    try {
      // TODO: endpoint นี้ยังไม่มีใน backend ต้องสร้างเพิ่ม
      const res = await fetch(`${API}/teacher/class/${classId}/join-code`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ join_code: code }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) {
        setError(json.error || json.detail || "บันทึกรหัสไม่สำเร็จ");
        return;
      }
      setSavedCode(code);
      router.back();
    } catch {
      setError("เชื่อมต่อ backend ไม่ได้");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8">
      {/* ปุ่มจัดการรหัสห้องเรียน */}
      <div className="mb-6 flex justify-end">
     
      </div>

      {error && (
        <div className="mx-auto mb-4 max-w-[880px] rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* การ์ด Active Join Code */}
      <div className="mx-auto flex min-h-[476px] max-w-[880px] flex-col overflow-hidden rounded-xl border border-[#E3E5F5] border-t-4 border-t-[#0058CC] bg-[#FBF9FF] p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1B22]">Active Join Code</h1>
            <p className="mt-0.5 text-xs text-[#434654]">
              Share this code with students to join classroom
              {cls ? ` · ${cls.group_name}` : ""}
            </p>
          </div>
          {dateRange && (
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1A1B22]">
              <CalendarDays size={16} className="text-[#0058CC]" />
              {dateRange}
            </div>
          )}
        </div>

        {/* กล่องโค้ด */}
        <div className="mt-6 flex flex-col items-center justify-center rounded-lg border border-[#E3E5F5] bg-[#F3EEF8] px-4 py-12">
          <div className="break-all text-center text-[64px] font-bold leading-none tracking-[0.25em] text-[#0058CC]">
            {loading ? "···" : code || "-"}
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-[#1A1B22]">
            <CheckCircle2 size={14} className="text-[#006C55]" />
            Accepting new students
          </div>
          {dirty && !loading && (
            <div className="mt-3 rounded-full bg-[#FFF4D6] px-3 py-1 text-[11px] font-medium text-[#8A5A00]">
              ยังไม่ได้บันทึก — กด Create Class เพื่อบันทึกรหัสนี้
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* ปุ่มล่าง */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={copyCode}
              disabled={!code}
              className="flex items-center gap-2 rounded-md border border-[#C3C6D6] bg-white px-4 py-2 text-xs font-semibold text-[#1A1B22] transition hover:bg-[#F3EEF8] disabled:opacity-50"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy Code"}
            </button>
            <button
              onClick={regenerate}
              disabled={loading || saving}
              className="flex items-center gap-2 rounded-md border border-[#C3C6D6] bg-white px-4 py-2 text-xs font-semibold text-[#1A1B22] transition hover:bg-[#F3EEF8] disabled:opacity-50"
            >
              <RefreshCw size={14} />
              Regenerate
            </button>
          </div>

          <button
            onClick={createClass}
            disabled={loading || saving || !code}
            className="flex items-center gap-2 rounded-lg bg-[#0058CC] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0040A1] disabled:opacity-60"
          >
            {saving ? "กำลังบันทึก..." : "Create Class"}
            {!saving && <Check size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CreateCodePage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">กำลังโหลด...</div>}>
      <CreateCodeContent />
    </Suspense>
  );
}