"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const box =
  "w-full rounded-lg border border-[#E3E6F0] bg-white px-4 py-3 text-sm outline-none focus:border-[#2563EB]";
const title = "text-3xl font-semibold";

type Term = { id_term: number; term: string };
type Teacher = { user_id: number; name: string };

export default function AddGroupPage() {
  const router = useRouter();
  const [terms, setTerms] = useState<Term[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    term: "",
    group_name: "",
    detail: "",
    teacher_id: "",
    assistant_id: "",
  });

  const set = (key: string, value: string) => setForm({ ...form, [key]: value });

  useEffect(() => {
    fetch(`${API}/admin/terms`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setTerms(json.data);
      });
    fetch(`${API}/admin/teacher-options`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setTeachers(json.data);
      });
  }, []);

  async function submit() {
    if (!form.term || !form.group_name || !form.teacher_id) {
      setError("กรุณาเลือกเทอม กรอกชื่อกลุ่มเรียน และเลือกอาจารย์ผู้สอน");
      return;
    }
    const res = await fetch(`${API}/admin/insert-class-groups`, {
      method: "POST",
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
      router.push("/DashboardTeacherLead/ManageGroup");
    } else {
      setError(json.error ?? "สร้างไม่สำเร็จ");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-8 pt-12 pb-12">
      <h2 className={title}>เทอมการสอน</h2>
      <select className={box} value={form.term} onChange={(e) => set("term", e.target.value)}>
        <option value="">เลือกเทอม</option>
        {terms.map((t) => (
          <option key={t.id_term} value={t.term}>
            {t.term}
          </option>
        ))}
      </select>

      <h2 className={title}>กลุ่มเรียน</h2>
      <input
        className={box}
        placeholder="กลุ่มเรียนที่ 1"
        value={form.group_name}
        onChange={(e) => set("group_name", e.target.value)}
      />

      <h2 className={title}>รายละเอียด</h2>
      <textarea
        className={`${box} h-[130px]`}
        value={form.detail}
        onChange={(e) => set("detail", e.target.value)}
      />

      <h2 className={title}>อาจารย์ผู้สอน *</h2>
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

      <h2 className={title}>ผู้ช่วยสอน</h2>
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

      <div className="flex justify-end">
        <button
          onClick={submit}
          className="w-[320px] rounded-lg bg-[#0B3FA6] py-3 text-sm font-semibold text-white hover:bg-[#2563EB]"
        >
          สร้าง
        </button>
      </div>
    </div>
  );
}