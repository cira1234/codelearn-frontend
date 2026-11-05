"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Save } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const box =
  "w-full rounded-lg border border-[#E3E6F0] bg-white px-4 py-3 text-sm outline-none focus:border-[#2563EB]";
const title = "text-3xl font-semibold";

type Term = { id_term: number; term: string };
type Chapter = { id: number; chapter_no: number; title: string; section_name: string };

function EditLabContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const labId = searchParams.get("id");

  const [terms, setTerms] = useState<Term[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [term, setTerm] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [namelab, setNamelab] = useState("");
  const [detail, setDetail] = useState("");
  
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!labId) {
      setError("ไม่พบ ID ของใบงาน");
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(`${API}/admin/terms`).then((r) => r.json()),
      fetch(`${API}/admin/chapter-options`).then((r) => r.json()),
      fetch(`${API}/admin/labs/${labId}`).then((r) => r.json()),
    ])
      .then(([termsJson, chaptersJson, labJson]) => {
        if (termsJson.success) setTerms(termsJson.data);
        if (chaptersJson.success) setChapters(chaptersJson.data);
        
        if (labJson.success) {
          const l = labJson.data;
          setNamelab(l.namelab || "");
          setDetail(l.detail || "");
          setChapterId(String(l.lab_ofchapter || ""));
        } else {
          setError(labJson.error || "โหลดข้อมูลไม่สำเร็จ");
        }
      })
      .catch(() => setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้"))
      .finally(() => setLoading(false));
  }, [labId]);

  async function submit() {
    setError("");
    if (!namelab.trim() || !chapterId) {
      setError("กรุณากรอกชื่อใบงานและเลือกบท");
      return;
    }
    const ch = chapters.find((c) => c.id === Number(chapterId));
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/labs/${labId}`, {
        method: "PUT", // 👈 เปลี่ยนเป็น PUT
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
        alert("บันทึกการแก้ไขสำเร็จ");
        router.push("/DashboardTeacherLead/ManageLab");
      } else {
        setError(json.error ?? "บันทึกไม่สำเร็จ");
      }
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-10 text-center text-gray-500">กำลังโหลดข้อมูล...</p>;
  if (!labId) return <p className="p-10 text-center text-red-500">ไม่พบ ID ใบงาน</p>;

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-8 pt-8 pb-12">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="flex w-[200px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#0B3FA6] py-2.5 text-sm font-semibold text-white hover:bg-[#2563EB] disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
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

// ห่อด้วย Suspense เพราะใช้ useSearchParams
export default function EditLabPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center text-gray-500">กำลังโหลด...</p>}>
      <EditLabContent />
    </Suspense>
  );
}