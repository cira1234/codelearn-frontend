"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const box =
  "w-full rounded-lg border border-[#E3E6F0] bg-white px-4 py-3 text-sm outline-none focus:border-[#2563EB]";
const title = "text-3xl font-semibold";

type Term = { id_term: number; term: string };
type Chapter = {
  id: number;
  chapter_no: number;
  title: string;
  section_name: string;
};

export default function AddLabPage() {
  const router = useRouter();
  const [terms, setTerms] = useState<Term[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [term, setTerm] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [namelab, setNamelab] = useState("");
  const [detail, setDetail] = useState("");
  const [error, setError] = useState("");
const [success, setSuccess] = useState("");
const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API}/admin/terms`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setTerms(json.data);
      });
    fetch(`${API}/admin/chapter-options`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setChapters(json.data);
      });
  }, []);

async function submit() {
  setError("");
  setSuccess("");
  if (!namelab.trim() || !chapterId) {
    setError("กรุณากรอกชื่อใบงานและเลือกบท");
    return;
  }
  const ch = chapters.find((c) => c.id === Number(chapterId));
  setSaving(true);
  try {
    const res = await fetch(`${API}/admin/labs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        namelab: namelab.trim(),
        detail,
        chapter_id: Number(chapterId),
        chapter_no: ch?.chapter_no,
      }),
    });
    const json = await res.json();
    if (json.success) {
      setSuccess("บันทึกใบงานสำเร็จ");
      setTimeout(() => router.push("/DashboardTeacherLead/ManageLab"), 1200);
    } else {
      setError(json.error ?? "บันทึกไม่สำเร็จ");
    }
  } catch {
    setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
  } finally {
    setSaving(false);
  }
}
  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-8 pt-8 pb-12">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={submit}
          className="flex w-[200px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#0B3FA6] py-2.5 text-sm font-semibold text-white hover:bg-[#2563EB]"
        >
          <Save size={16} />
          บันทึก
        </button>
      </div>

      <h2 className={title}>ชื่อใบงาน</h2>
      <input
        className={box}
        placeholder="เช่น ความรู้เบื้องต้นเกี่ยวกับคอมพิวเตอร์"
        value={namelab}
        onChange={(e) => setNamelab(e.target.value)}
      />

      <h2 className={title}>เทอมการสอน</h2>
      <select className={`${box} cursor-pointer`} value={term} onChange={(e) => setTerm(e.target.value)}>
        <option value="">เลือกเทอม</option>
        {terms.map((t) => (
          <option key={t.id_term} value={t.term}>
            {t.term}
          </option>
        ))}
      </select>

      <h2 className={title}>บท</h2>
      <select
        className={`${box} cursor-pointer`}
        value={chapterId}
        onChange={(e) => setChapterId(e.target.value)}
      >
        <option value="">เลือกบท</option>
        {chapters.map((c) => (
          <option key={c.id} value={c.id}>
            {c.section_name} ·  {c.title}
          </option>
        ))}
      </select>

      <h2 className={title}>รายละเอียดโจทย์</h2>
      <textarea
        className={`${box} h-[220px]`}
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}