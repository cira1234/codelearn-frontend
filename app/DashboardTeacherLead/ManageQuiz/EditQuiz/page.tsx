"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, CloudUpload, FileText, FolderOpen, ImagePlus, Plus, X } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const IMAGE_BASE = `${API}/uploads/quiz`;

type ChapterOpt = {
  id: number;
  chapter_no: number;
  title: string;
  section_id: number;
  section_name: string;
  term: string;
};
type TrainPdf = { id_file: number; filename: string; created_at: string };
type ChoiceType = "text" | "image";
// เพิ่ม existingFile สำหรับเก็บชื่อไฟล์รูปเดิมจาก Database
type Choice = { text: string; file: File | null; existingFile?: string | null };

const LETTERS = ["a", "b", "c", "d"];
const field =
  "w-full rounded-lg border border-[#D5D9E6] bg-white px-3 py-2 text-sm text-[#14213F] outline-none placeholder:text-[#C3C6D6] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20";
const heading = "mb-3 text-xl font-bold text-[#14213F]";
const emptyChoice = (): Choice => ({ text: "", file: null, existingFile: null });

function checkImage(f: File): string {
  if (!/\.(png|jpe?g)$/i.test(f.name)) return "รองรับเฉพาะไฟล์ .png .jpg .jpeg";
  if (f.size > 50 * 1024 * 1024) return "ไฟล์ใหญ่เกิน 50MB";
  return "";
}
const showName = (filename: string) => filename.replace(/^[0-9a-f]{8}_/, "");

function EditQuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizId = searchParams.get("id");
  const fileInput = useRef<HTMLInputElement>(null);

  const [chapters, setChapters] = useState<ChapterOpt[]>([]);
  const [term, setTerm] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [chapterId, setChapterId] = useState("");
  
  const [question, setQuestion] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null); // 👈 เก็บรูปโจทย์เดิม
  
  const [choiceType, setChoiceType] = useState<ChoiceType>("text");
  const [choices, setChoices] = useState<Choice[]>([emptyChoice(), emptyChoice()]);
  const [correct, setCorrect] = useState<number | null>(null);
  const [explainRight, setExplainRight] = useState("");
  const [explainWrong, setExplainWrong] = useState("");
  
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [pdfs, setPdfs] = useState<TrainPdf[]>([]);
  const [selectedPdfs, setSelectedPdfs] = useState<number[]>([]);

  // โหลดข้อมูลเริ่มต้น
  useEffect(() => {
    if (!quizId) return;
    Promise.all([
      fetch(`${API}/admin/chapters`).then((r) => r.json()),
      fetch(`${API}/admin/train-pdfs`).then((r) => r.json()),
      fetch(`${API}/admin/quiz-questions/${quizId}`).then((r) => r.json()),
    ])
      .then(([chaptersJson, pdfsJson, quizJson]) => {
        if (chaptersJson.success) setChapters(chaptersJson.data ?? []);
        if (pdfsJson.success) setPdfs(pdfsJson.data ?? []);

        if (quizJson.success) {
          const q = quizJson.data;
          setQuestion(q.question);
          setChapterId(String(q.chapter_id));
          setChoiceType(q.choice_type || "text");
          setExplainRight(q.explanation || "");
          setExplainWrong(q.explanation_wrong || "");
          setExistingImage(q.image_file);

          // หาเทอมและภาคจาก chapter_id
          const ch = chaptersJson.data.find((c: any) => c.id === q.chapter_id);
          if (ch) {
            setTerm(ch.term);
            setSectionId(String(ch.section_id));
          }

          // จัดการตัวเลือก
          const loadedChoices: Choice[] = [];
          let correctIdx = -1;
          
          LETTERS.forEach((l, i) => {
            const val = q[`choice_${l}`];
            if (val) {
              if (q.choice_type === "image") {
                loadedChoices.push({ text: "", file: null, existingFile: val });
              } else {
                loadedChoices.push({ text: val, file: null, existingFile: null });
              }
              if (q.correct_choice === l) correctIdx = i;
            }
          });
          
          if (loadedChoices.length > 0) {
            setChoices(loadedChoices);
            if (correctIdx !== -1) setCorrect(correctIdx);
          }
        } else {
          setError(quizJson.error || "โหลดข้อมูลโจทย์ไม่สำเร็จ");
        }
      })
      .catch(() => setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้"))
      .finally(() => setLoading(false));
  }, [quizId]);

  const terms = Array.from(new Set(chapters.map((c) => c.term)));
  const sections = Array.from(
    new Map(chapters.filter((c) => c.term === term).map((c) => [c.section_id, c.section_name])).entries()
  );
  const chapterOptions = chapters.filter((c) => String(c.section_id) === sectionId);

  const switchType = (t: ChoiceType) => {
    if (t === choiceType) return;
    setChoiceType(t);
    setChoices([emptyChoice(), emptyChoice()]);
    setCorrect(null);
    setError("");
  };

  const setChoiceText = (i: number, text: string) =>
    setChoices(choices.map((c, idx) => (idx === i ? { ...c, text } : c)));

  const setChoiceFile = (i: number, f: File | undefined) => {
    if (!f) return;
    const msg = checkImage(f);
    if (msg) return setError(msg);
    setError("");
    setChoices(choices.map((c, idx) => (idx === i ? { ...c, file: f } : c)));
  };

  const addChoice = () => {
    if (choices.length < LETTERS.length) setChoices([...choices, emptyChoice()]);
  };

  const removeChoice = (i: number) => {
    if (choices.length <= 2) return;
    setChoices(choices.filter((_, idx) => idx !== i));
    if (correct === i) setCorrect(null);
    else if (correct !== null && correct > i) setCorrect(correct - 1);
  };

  const pickImage = (f: File | undefined) => {
    if (!f) return;
    const msg = checkImage(f);
    if (msg) return setError(msg);
    setError("");
    setImage(f);
  };

  async function handleSave() {
    const isImage = choiceType === "image";
    // ตรวจสอบว่ามีข้อมูล (ข้อความ หรือ ไฟล์ใหม่ หรือ ไฟล์เดิม)
    const filled = choices.map((c) => (isImage ? (!!c.file || !!c.existingFile) : !!c.text.trim()));
    
    if (!chapterId) return setError("กรุณาเลือกเทอม ภาค และบท");
    if (!question.trim()) return setError("กรุณากรอกโจทย์");
    if (filled.filter(Boolean).length < 2)
      return setError(isImage ? "ต้องมีรูปตัวเลือกอย่างน้อย 2 ข้อ" : "ต้องมีตัวเลือกอย่างน้อย 2 ข้อ");
    if (correct === null || !filled[correct])
      return setError("กรุณากดเครื่องหมายถูกที่ข้อที่เป็นคำตอบ");

    const fd = new FormData();
    fd.append("chapter_id", chapterId);
    fd.append("question", question.trim());
    fd.append("choice_type", choiceType);
    fd.append("correct_choice", LETTERS[correct]);
    fd.append("explanation", explainRight.trim());
    fd.append("explanation_wrong", explainWrong.trim());
    
    // ส่งรูปโจทย์เดิมไปด้วย (ถ้าไม่มีใหม่ทับ)
    if (existingImage) fd.append("existing_image", existingImage);
    
    choices.forEach((c, i) => {
      const l = LETTERS[i];
      if (isImage) {
        if (c.file) fd.append(`choice_image_${l}`, c.file);
        else if (c.existingFile) fd.append(`choice_${l}`, c.existingFile); // ส่งชื่อไฟล์เดิมกลับไป
      } else {
        fd.append(`choice_${l}`, c.text.trim());
      }
    });
    
    if (image) fd.append("image", image);

    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API}/admin/quiz-questions/${quizId}`, { method: "PUT", body: fd });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "บันทึกไม่สำเร็จ");
        return;
      }
      alert("บันทึกการแก้ไขสำเร็จ");
      router.push("/DashboardTeacherLead/ManageQuiz");
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-10 text-center text-gray-500">กำลังโหลดข้อมูล...</p>;
  if (!quizId) return <p className="p-10 text-center text-red-500">ไม่พบ ID ของโจทย์</p>;

  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-8 px-8 py-10">
      <section className="grid grid-cols-3 gap-4">
        <div>
          <h2 className={heading}>เทอม</h2>
          <select value={term} onChange={(e) => { setTerm(e.target.value); setSectionId(""); setChapterId(""); }} className={field}>
            <option value="">เลือกเทอม</option>
            {terms.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <h2 className={heading}>ภาค</h2>
          <select value={sectionId} disabled={!term} onChange={(e) => { setSectionId(e.target.value); setChapterId(""); }} className={`${field} disabled:bg-gray-100`}>
            <option value="">เลือกภาค</option>
            {sections.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </div>
        <div>
          <h2 className={heading}>บท</h2>
          <select value={chapterId} disabled={!sectionId} onChange={(e) => setChapterId(e.target.value)} className={`${field} disabled:bg-gray-100`}>
            <option value="">เลือกบท</option>
            {chapterOptions.map((c) => <option key={c.id} value={c.id}>บทที่ {c.chapter_no} {c.title}</option>)}
          </select>
        </div>
      </section>

      <section>
        <h2 className={heading}>โจทย์ที่เป็นข้อความ</h2>
        <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={4} className={field} />
      </section>

      <section
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); pickImage(e.dataTransfer.files[0]); }}
        className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-[#C3C6D6] px-6 py-10 text-center"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#DDE3F5] text-[#0B3FA6]">
          <CloudUpload size={22} />
        </span>
        <p className="font-bold text-[#14213F]">อัปโหลดรูปภาพโจทย์</p>
        
        {/* แสดงรูปเก่า (ถ้ามี) */}
        {existingImage && !image && (
          <div className="mt-2 text-sm text-[#2563EB] flex items-center gap-2">
            มีรูปเดิมอยู่: 
            <img src={`${IMAGE_BASE}/${existingImage}`} alt="old" className="h-10 rounded border" />
          </div>
        )}
        
        {image && <p className="text-sm text-green-600">เลือกรูปใหม่: {image.name}</p>}
        
        <input ref={fileInput} type="file" accept=".png,.jpg,.jpeg" className="hidden" onChange={(e) => pickImage(e.target.files?.[0])} />
        <button type="button" onClick={() => fileInput.current?.click()} className="mt-1 flex cursor-pointer items-center gap-2 rounded-md bg-[#0B3FA6] px-5 py-1.5 text-xs font-bold text-white hover:bg-[#093283]">
          <FolderOpen size={14} />
          {existingImage ? "เปลี่ยนรูปโจทย์" : "Browse Files"}
        </button>
      </section>

      <section>
        <h2 className={heading}>รูปแบบตัวเลือก</h2>
        <div className="flex flex-col gap-3 text-sm text-[#14213F]">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#D5D9E6] px-3 py-2.5">
            <input type="radio" name="choiceType" checked={choiceType === "text"} onChange={() => switchType("text")} className="accent-[#2563EB]" />
            ข้อความ
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#D5D9E6] px-3 py-2.5">
            <input type="radio" name="choiceType" checked={choiceType === "image"} onChange={() => switchType("image")} className="accent-[#2563EB]" />
            รูปภาพ
          </label>
        </div>
      </section>

      {/* ปุ่ม AI ถูกซ่อนไว้ในหน้า Edit เพราะซับซ้อนเกินไป ถ้าอยากให้มีค่อยเพิ่ม */}
      
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#14213F]">ตัวเลือก</h2>
          <button type="button" onClick={addChoice} disabled={choices.length >= LETTERS.length} className="flex cursor-pointer items-center gap-2 rounded-md bg-[#2563EB] px-4 py-1.5 text-sm font-bold text-white hover:bg-[#1D4ED8] disabled:opacity-50">
            เพิ่มตัวเลือก
            <Plus size={14} />
          </button>
        </div>
        <div className="flex flex-col gap-3 rounded-lg border-l-4 border-[#2563EB] bg-white p-4 shadow-sm">
          {choices.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              {choiceType === "text" ? (
                <input value={c.text} onChange={(e) => setChoiceText(i, e.target.value)} placeholder={`ตัวเลือกที่ ${i + 1}`} className={field} />
              ) : (
                <div className="flex-1 flex items-center gap-3">
                  {/* แสดงรูปเก่า */}
                  {c.existingFile && !c.file && (
                    <img src={`${IMAGE_BASE}/${c.existingFile}`} alt="old choice" className="h-10 rounded border" />
                  )}
                  <label className={`${field} flex cursor-pointer items-center gap-2`}>
                    <ImagePlus size={16} className="shrink-0 text-gray-400" />
                    <span className={`truncate ${c.file || c.existingFile ? "text-[#14213F]" : "text-[#C3C6D6]"}`}>
                      {c.file ? c.file.name : (c.existingFile ? "มีรูปเดิมอยู่ (คลิกเพื่อเปลี่ยน)" : `เลือกรูปตัวเลือกที่ ${i + 1}`)}
                    </span>
                    <input type="file" accept=".png,.jpg,.jpeg" className="hidden" onChange={(e) => setChoiceFile(i, e.target.files?.[0])} />
                  </label>
                </div>
              )}
              <button type="button" aria-label="ลบตัวเลือก" onClick={() => removeChoice(i)} className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md bg-[#2563EB] text-white hover:bg-[#1D4ED8]">
                <X size={16} />
              </button>
              <button type="button" aria-label="ตั้งเป็นคำตอบที่ถูก" onClick={() => setCorrect(i)} className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md border ${correct === i ? "border-green-500 bg-green-500 text-white" : "border-[#D5D9E6] bg-white text-gray-300 hover:text-green-500"}`}>
                <Check size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className={heading}>คำอธิบายเมื่อตอบถูก</h2>
        <textarea value={explainRight} onChange={(e) => setExplainRight(e.target.value)} rows={3} className={field} />
      </section>
      <section>
        <h2 className={heading}>คำอธิบายเมื่อตอบผิด</h2>
        <textarea value={explainWrong} onChange={(e) => setExplainWrong(e.target.value)} rows={3} className={field} />
      </section>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.push("/DashboardTeacherLead/ManageQuiz")} className="w-[140px] cursor-pointer rounded-lg bg-[#FF4D4F] py-2.5 text-sm font-bold text-white hover:opacity-90">
          ยกเลิก
        </button>
        <button type="button" onClick={handleSave} disabled={saving} className="w-[180px] cursor-pointer rounded-lg bg-[#2563EB] py-2.5 text-sm font-bold text-white hover:bg-[#1D4ED8] disabled:opacity-60">
          {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
        </button>
      </div>
    </div>
  );
}

// ห่อด้วย Suspense เพราะใช้ useSearchParams
export default function EditQuizPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center text-gray-500">กำลังโหลด...</p>}>
      <EditQuizContent />
    </Suspense>
  );
}