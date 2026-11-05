"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
// รูปที่ AI สร้างถูกเซฟใน uploads/quiz และ backend เสิร์ฟที่ /uploads/quiz
const IMAGE_BASE = `${API}/uploads/quiz`;
const COUNT = 10; // จำนวนข้อที่ให้ AI ออก (backend จำกัดสูงสุด 20)
const LETTERS = ["a", "b", "c", "d"];

type Q = {
  uid: number;
  question: string;
  choice_type: "text" | "image"; // image = choices เป็นชื่อไฟล์รูป
  choices: string[];
  answer: number; // ลำดับตัวเลือกที่ถูก เริ่มที่ 0
  explanation: string;
  explanation_wrong: string;
  image_file: string | null; // รูปประกอบโจทย์
  selected: boolean;
  saved: boolean;
};

function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
    </svg>
  );
}

// ดึงรูปที่ AI เซฟไว้มาเป็น Blob เพื่อแนบตอนบันทึก
async function fetchBlob(file: string): Promise<Blob> {
  const res = await fetch(`${IMAGE_BASE}/${file}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.blob();
}

// รูปประกอบโจทย์ ถ้าโหลดไม่ขึ้นจะบอก URL ที่ลองโหลด
function QuestionImage({ file }: { file: string }) {
  const [failed, setFailed] = useState(false);
  const url = `${IMAGE_BASE}/${file}`;

  if (failed) {
    return (
      <p className="mt-3 break-all text-xs text-red-500">
        โหลดรูปไม่ได้ ลองเปิด URL นี้ในเบราว์เซอร์: {url}
      </p>
    );
  }

  return (
    <div className="mt-3">
      <p className="text-xs text-[#2563EB]">🖼️ รูปประกอบจากเอกสาร</p>
      <img
        src={url}
        alt="รูปประกอบโจทย์"
        onError={() => setFailed(true)}
        className="mt-2 max-h-96 w-full rounded-lg border border-[#E3E6F0] object-contain"
      />
    </div>
  );
}

// รูปที่เป็นตัวเลือก
function ChoiceImage({ file }: { file: string }) {
  const [failed, setFailed] = useState(false);
  const url = `${IMAGE_BASE}/${file}`;

  if (failed) {
    return <span className="break-all text-xs text-red-500">โหลดรูปไม่ได้: {url}</span>;
  }

  return (
    <img
      src={url}
      alt="รูปตัวเลือก"
      onError={() => setFailed(true)}
      className="max-h-48 w-full rounded border border-[#E3E6F0] object-contain"
    />
  );
}

function AddQuizAiContent() {
  const router = useRouter();
  const params = useSearchParams();
  const files = params.get("files") ?? "";
  const chapterId = params.get("chapterId") ?? "";
  // ชนิดตัวเลือกที่เลือกจากหน้าเพิ่มโจทย์ (text = ข้อความล้วน, image = ใช้รูป)
  const choiceType = params.get("type") === "image" ? "image" : "text";
  // หน้าที่เริ่มอ่านในเอกสาร (ต่อท้าย URL เช่น &start=11) ไม่ใส่ = เริ่มหน้า 1
  const startPage = Number(params.get("start") ?? 1) || 1;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [chapterName, setChapterName] = useState("");
  const [editingUid, setEditingUid] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // กัน useEffect รันสองครั้งตอน dev (React Strict Mode) เพราะการเรียก AI เสียโควตา
  const started = useRef(false);

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const fileIds = files.split(",").map(Number).filter(Boolean);
      const res = await fetch(`${API}/admin/quiz-ai/generate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_ids: fileIds,
          count: COUNT,
          choice_type: choiceType,
          start_page: startPage,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "สร้างโจทย์ไม่สำเร็จ");
      } else {
        setFileNames(json.files ?? []);
        setQuestions(
          (json.questions ?? []).map((q: any, i: number) => ({
            uid: i,
            question: q.question,
            choice_type: q.choice_type === "image" ? "image" : "text",
            choices: q.choices,
            answer: q.answer,
            explanation: q.explanation ?? "",
            explanation_wrong: q.explanation_wrong ?? "",
            image_file: q.image_file ?? null,
            selected: false,
            saved: false,
          }))
        );
      }
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    }
    setLoading(false);
  }

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!files || !chapterId) {
      setError("ไม่พบเอกสารหรือบทที่เลือก กรุณากลับไปเลือกที่หน้าเพิ่มโจทย์");
      setLoading(false);
      return;
    }
    generate();

    // ชื่อบทปลายทาง
    fetch(`${API}/chapters/${chapterId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setChapterName(`${j.chapter.section_name} · บทที่ ${j.chapter.chapter_no} ${j.chapter.title}`);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- แก้ไข state ของข้อเดียว ----------
  function update(uid: number, patch: Partial<Q>) {
    setQuestions((qs) => qs.map((q) => (q.uid === uid ? { ...q, ...patch } : q)));
  }

  function updateChoice(uid: number, idx: number, value: string) {
    setQuestions((qs) =>
      qs.map((q) =>
        q.uid === uid ? { ...q, choices: q.choices.map((c, i) => (i === idx ? value : c)) } : q
      )
    );
  }

  function remove(uid: number) {
    setQuestions((qs) => qs.filter((q) => q.uid !== uid));
  }

  const selectedCount = questions.filter((q) => q.selected).length;

  // ---------- บันทึกทีละข้อที่เลือก ----------
  async function save() {
    const todo = questions.filter((q) => q.selected && !q.saved);
    if (selectedCount === 0) {
      setError("กรุณาเลือกคำถามอย่างน้อย 1 ข้อ");
      return;
    }
    setSaving(true);
    setError("");

    for (const q of todo) {
      const isImg = q.choice_type === "image";
      const fd = new FormData();
      fd.append("chapter_id", chapterId);
      fd.append("question", q.question);
      fd.append("choice_type", q.choice_type);
      fd.append("correct_choice", LETTERS[q.answer]);
      fd.append("explanation", q.explanation);
      fd.append("explanation_wrong", q.explanation_wrong);

      try {
        if (isImg) {
          // ตัวเลือกเป็นรูป: ดึงรูปแต่ละตัวเลือกมาแนบเป็นไฟล์ choice_image_a..d
          for (let i = 0; i < q.choices.length; i++) {
            fd.append(`choice_image_${LETTERS[i]}`, await fetchBlob(q.choices[i]), q.choices[i]);
          }
        } else {
          LETTERS.forEach((l, i) => fd.append(`choice_${l}`, q.choices[i] ?? ""));
        }
        // รูปประกอบโจทย์ (ถ้ามี)
        if (q.image_file) {
          fd.append("image", await fetchBlob(q.image_file), q.image_file);
        }
      } catch {
        setError(`ดึงรูปของข้อนี้ไม่ได้ จึงยังไม่บันทึก (ลองเปิด ${IMAGE_BASE}/ ตามด้วยชื่อไฟล์ในเบราว์เซอร์)`);
        setSaving(false);
        return;
      }

      try {
        const res = await fetch(`${API}/admin/quiz-questions`, {
          method: "POST",
          credentials: "include",
          body: fd,
        });
        const json = await res.json();
        if (!json.success) {
          setError(json.error ?? "บันทึกไม่สำเร็จ");
          setSaving(false);
          return; // หยุด ลองใหม่จะข้ามข้อที่บันทึกแล้ว
        }
        update(q.uid, { saved: true });
      } catch {
        setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    router.push("/DashboardTeacherLead/ManageQuiz");
  }

  // ---------- หน้าตอนรอ / ตอน error ----------
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#E3E6F0] border-t-[#2563EB]" />
        <p className="text-lg font-semibold text-[#0B3FA6]">AI กำลังอ่านเอกสารและสร้างโจทย์...</p>
        <p className="text-sm text-gray-500">อาจใช้เวลาประมาณ 1-2 นาที กรุณาอย่าปิดหน้านี้</p>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32">
        <p className="text-red-500">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/DashboardTeacherLead/ManageQuiz/AddQuiz")}
            className="cursor-pointer rounded-lg border border-[#E3E6F0] bg-white px-5 py-2 text-sm"
          >
            กลับ
          </button>
          <button
            onClick={generate}
            className="cursor-pointer rounded-lg bg-[#0B3FA6] px-5 py-2 text-sm text-white"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  // ---------- หน้าหลัก ----------
  return (
    <div className="flex w-full">
      {/* ซ้าย: รายการโจทย์ */}
      <div className="flex-1 px-8 pb-12 pt-8">
        <p className="text-sm font-medium text-gray-600">📖 {fileNames.join(", ")}</p>
        <h1 className="mt-1 text-3xl font-bold">เลือกข้อสอบที่ต้องการ</h1>
        <p className="mt-2 text-gray-600">
          AI สร้างคำถามจากเนื้อหาในเอกสาร โปรดเลือกคำถามที่ต้องการรวมในแบบทดสอบ
        </p>
        <span className="mt-3 inline-block rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs text-green-700">
          AI สร้างเสร็จสมบูรณ์ · พบ {questions.length} คำถาม
        </span>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <div className="mt-8 flex flex-col gap-6">
          {questions.map((q, n) => {
            const editing = editingUid === q.uid;
            const isImg = q.choice_type === "image";
            return (
              <div
                key={q.uid}
                className={`rounded-xl border bg-white p-5 ${
                  q.selected ? "border-[#E3E6F0] border-l-4 border-l-[#2563EB]" : "border-[#E3E6F0]"
                }`}
              >
                {/* หัวการ์ด */}
                <div className="flex items-center justify-between">
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    ข้อ {n + 1}
                    {isImg ? " · ตัวเลือกเป็นรูป" : ""}
                  </span>
                  <div className="flex items-center gap-3 text-gray-600">
                    {q.saved && <span className="text-xs text-green-600">บันทึกแล้ว</span>}
                    <button
                      onClick={() => setEditingUid(editing ? null : q.uid)}
                      className="cursor-pointer hover:text-[#2563EB]"
                      title="แก้ไข"
                    >
                      <PencilIcon />
                    </button>
                    <button
                      onClick={() => remove(q.uid)}
                      className="cursor-pointer hover:text-red-500"
                      title="ลบ"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>

                {/* รูปประกอบโจทย์ (แสดงทั้งโหมดดูและโหมดแก้ไข) */}
                {q.image_file && <QuestionImage file={q.image_file} />}

                {/* โหมดแก้ไข */}
                {editing ? (
                  <div className="mt-4 flex flex-col gap-3">
                    <textarea
                      value={q.question}
                      onChange={(e) => update(q.uid, { question: e.target.value })}
                      rows={3}
                      className="w-full rounded-lg border border-[#E3E6F0] p-3 text-sm"
                    />
                    {q.choices.map((c, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`ans-${q.uid}`}
                          checked={q.answer === i}
                          onChange={() => update(q.uid, { answer: i })}
                          className="cursor-pointer"
                        />
                        {isImg ? (
                          <div className="w-64">
                            <ChoiceImage file={c} />
                          </div>
                        ) : (
                          <input
                            value={c}
                            onChange={(e) => updateChoice(q.uid, i, e.target.value)}
                            className="flex-1 rounded-lg border border-[#E3E6F0] px-3 py-2 text-sm"
                          />
                        )}
                      </div>
                    ))}
                    <label className="text-xs text-gray-500">คำอธิบายข้อที่ถูก</label>
                    <textarea
                      value={q.explanation}
                      onChange={(e) => update(q.uid, { explanation: e.target.value })}
                      rows={2}
                      className="w-full rounded-lg border border-[#E3E6F0] p-3 text-sm"
                    />
                    <label className="text-xs text-gray-500">คำอธิบายข้อที่ผิด</label>
                    <textarea
                      value={q.explanation_wrong}
                      onChange={(e) => update(q.uid, { explanation_wrong: e.target.value })}
                      rows={2}
                      className="w-full rounded-lg border border-[#E3E6F0] p-3 text-sm"
                    />
                    <button
                      onClick={() => setEditingUid(null)}
                      className="cursor-pointer self-end rounded-lg bg-[#0B3FA6] px-5 py-2 text-sm text-white"
                    >
                      เสร็จสิ้น
                    </button>
                  </div>
                ) : (
                  /* โหมดดู */
                  <>
                    <p className="mt-4 font-bold">{q.question}</p>
                    <div
                      className={`mt-4 ${
                        isImg ? "grid grid-cols-2 gap-3" : "flex flex-col gap-3"
                      }`}
                    >
                      {q.choices.map((c, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${
                            q.answer === i
                              ? "border-[#E3E6F0] bg-[#F5F3FB]"
                              : "border-[#E3E6F0] bg-white"
                          }`}
                        >
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                              q.answer === i ? "border-[#0B3FA6]" : "border-gray-400"
                            }`}
                          >
                            {q.answer === i && <span className="h-2 w-2 rounded-full bg-[#0B3FA6]" />}
                          </span>
                          {isImg ? <ChoiceImage file={c} /> : c}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* ปุ่มเลือก */}
                <div className="mt-5 flex justify-end border-t border-[#E3E6F0] pt-4">
                  <button
                    onClick={() => update(q.uid, { selected: !q.selected })}
                    disabled={q.saved}
                    className={`cursor-pointer rounded-lg px-4 py-2 text-sm disabled:cursor-default disabled:opacity-60 ${
                      q.selected
                        ? "bg-[#0B3FA6] text-white"
                        : "border border-[#E3E6F0] bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {q.selected ? "✓ เลือกคำถามนี้แล้ว" : "+ เลือกคำถามนี้"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ขวา: สรุปแบบทดสอบ */}
      <aside className="sticky top-0 h-screen w-[340px] shrink-0 border-l border-[#E3E6F0] bg-white px-6 py-8">
        <h2 className="text-xl font-bold">สรุปแบบทดสอบ</h2>
        <p className="mt-1 text-sm text-gray-500">ภาพรวมของคำถามที่คุณเลือกไว้สำหรับแบบทดสอบนี้</p>
        <hr className="my-5 border-[#E3E6F0]" />

        <div className="flex items-center justify-between rounded-xl bg-[#F5F3FB] px-4 py-4">
          <span className="text-sm font-semibold text-[#0B3FA6]">คำถามที่เลือกแล้ว</span>
          <span className="text-lg font-bold text-[#0B3FA6]">
            {selectedCount}/{questions.length}
          </span>
        </div>

        {chapterName && (
          <p className="mt-5 text-sm text-gray-600">
            บันทึกเข้า: <span className="font-semibold">{chapterName}</span>
          </p>
        )}

        <button
          onClick={save}
          disabled={saving || selectedCount === 0}
          className="mt-8 w-full cursor-pointer rounded-lg bg-[#0B3FA6] py-3 text-sm font-semibold text-white disabled:cursor-default disabled:opacity-50"
        >
          {saving ? "กำลังบันทึก..." : "บันทึกแบบทดสอบ"}
        </button>
      </aside>
    </div>
  );
}

export default function AddQuizAiPage() {
  return (
    <Suspense fallback={null}>
      <AddQuizAiContent />
    </Suspense>
  );
}