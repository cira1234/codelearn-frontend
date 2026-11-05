"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const box =
  "w-full rounded-lg border border-[#E3E6F0] bg-white px-4 py-3 text-sm outline-none focus:border-[#2563EB]";
const title = "text-3xl font-semibold";

type Term = { id_term: number; term: string };
type Teacher = { user_id: number; name: string };

function EditGroupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get("id");

  const [terms, setTerms] = useState<Term[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    term: "",
    group_name: "",
    detail: "",
    teacher_id: "",
    assistant_id: "",
  });

  const set = (key: string, value: string) => setForm({ ...form, [key]: value });

  // 👇 ดึงข้อมูลเทอม, อาจารย์, และข้อมูลกลุ่มเรียนเดิม
  useEffect(() => {
    if (!groupId) {
      setError("ไม่พบ ID ของกลุ่มเรียน");
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(`${API}/admin/terms`).then((r) => r.json()),
      fetch(`${API}/admin/teacher-options`).then((r) => r.json()),
      fetch(`${API}/admin/class-groups/${groupId}`).then((r) => r.json()),
    ])
      .then(([termsJson, teachersJson, groupJson]) => {
        if (termsJson.success) setTerms(termsJson.data);
        if (teachersJson.success) setTeachers(teachersJson.data);
        
        if (groupJson.success) {
          const g = groupJson.data;
          setForm({
            term: g.term || "",
            group_name: g.group_name || "",
            detail: g.course_title || "",
            teacher_id: g.teacher_id ? String(g.teacher_id) : "",
            assistant_id: g.assistant_id ? String(g.assistant_id) : "",
          });
        } else {
          setError(groupJson.error || "โหลดข้อมูลกลุ่มเรียนไม่สำเร็จ");
        }
      })
      .catch(() => setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้"))
      .finally(() => setLoading(false));
  }, [groupId]);

  async function submit() {
    if (!form.term || !form.group_name || !form.teacher_id) {
      setError("กรุณาเลือกเทอม กรอกชื่อกลุ่มเรียน และเลือกอาจารย์ผู้สอน");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`${API}/admin/class-groups/${groupId}`, {
        method: "PUT", // 👈 เปลี่ยนเป็น PUT สำหรับ Update
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          term: form.term,
          group_name: form.group_name,
          detail: form.detail,
          teacher_id: Number(form.teacher_id),
          assistant_id: form.assistant_id ? Number(form.assistant_id) : null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert("บันทึกการแก้ไขสำเร็จ");
        router.push("/DashboardTeacherLead/ManageGroup");
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
  if (!groupId) return <p className="p-10 text-center text-red-500">ไม่พบ ID กลุ่มเรียน</p>;

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-8 pt-12 pb-12">
      <h2 className={title}>แก้ไขกลุ่มเรียน</h2>
      
      <h2 className="text-xl font-semibold mt-4">เทอมการสอน</h2>
      <select className={box} value={form.term} onChange={(e) => set("term", e.target.value)}>
        <option value="">เลือกเทอม</option>
        {terms.map((t) => (
          <option key={t.id_term} value={t.term}>
            {t.term}
          </option>
        ))}
      </select>

      <h2 className="text-xl font-semibold mt-4">กลุ่มเรียน</h2>
      <input
        className={box}
        placeholder="กลุ่มเรียนที่ 1"
        value={form.group_name}
        onChange={(e) => set("group_name", e.target.value)}
      />

      <h2 className="text-xl font-semibold mt-4">รายละเอียด</h2>
      <textarea
        className={`${box} h-[130px]`}
        value={form.detail}
        onChange={(e) => set("detail", e.target.value)}
      />

      <h2 className="text-xl font-semibold mt-4">อาจารย์ผู้สอน *</h2>
      <select
        className={box}
        value={form.teacher_id}
        onChange={(e) => set("teacher_id", e.target.value)}
      >
        <option value="">เลือก</option>
        {teachers.map((t) => (
          <option key={t.user_id} value={t.user_id}>
            {t.name}
          </option>
        ))}
      </select>

      <h2 className="text-xl font-semibold mt-4">ผู้ช่วยสอน</h2>
      <select
        className={box}
        value={form.assistant_id}
        onChange={(e) => set("assistant_id", e.target.value)}
      >
        <option value="">เลือก</option>
        {teachers.map((t) => (
          <option key={t.user_id} value={t.user_id}>
            {t.name}
          </option>
        ))}
      </select>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end mt-4">
        <button
          onClick={submit}
          disabled={saving}
          className="w-[320px] rounded-lg bg-[#0B3FA6] py-3 text-sm font-semibold text-white hover:bg-[#2563EB] disabled:opacity-50"
        >
          {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
        </button>
      </div>
    </div>
  );
}

// ห่อด้วย Suspense เพราะใช้ useSearchParams
export default function EditGroupPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center text-gray-500">กำลังโหลด...</p>}>
      <EditGroupContent />
    </Suspense>
  );
}