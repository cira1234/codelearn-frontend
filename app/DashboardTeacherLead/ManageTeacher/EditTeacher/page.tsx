"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Save, Type } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const box =
  "flex items-center gap-2 rounded-lg border border-[#D5D9E6] bg-white px-3 py-2 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/20";
const input = "w-full bg-transparent text-sm outline-none placeholder:text-[#C3C6D6]";

function EditTeacherContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teacherId = searchParams.get("id");

  const [form, setForm] = useState({ name: "", surname: "", email: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value });

  // 👇 ดึงข้อมูลเดิมมาใส่ฟอร์ม
  useEffect(() => {
    if (!teacherId) {
      setError("ไม่พบ ID ของอาจารย์");
      setLoading(false);
      return;
    }
    fetch(`${API}/admin/teachers/${teacherId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          const nameParts = (json.data.name || "").split(" ");
          setForm({
            name: nameParts[0] || "",
            surname: nameParts.slice(1).join(" ") || "",
            email: json.data.email || "",
          });
        } else {
          setError(json.error || "โหลดข้อมูลไม่สำเร็จ");
        }
      })
      .catch(() => setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้"))
      .finally(() => setLoading(false));
  }, [teacherId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.surname || !form.email) {
      setError("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`${API}/admin/teachers/${teacherId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      
      if (!json.success) {
        setError(json.error || "บันทึกการแก้ไขไม่สำเร็จ");
      } else {
        alert("บันทึกการแก้ไขสำเร็จ");
        router.push("/DashboardTeacherLead/ManageTeacher");
      }
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-10 text-center text-gray-500">กำลังโหลดข้อมูล...</p>;
  if (!teacherId) return <p className="p-10 text-center text-red-500">ไม่พบ ID อาจารย์</p>;

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-[1100px] flex-col gap-8 px-8 pt-12">
      <h1 className="text-2xl font-bold text-[#14213F]">แก้ไขข้อมูลอาจารย์</h1>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-xs font-semibold text-[#14213F]">
          ชื่อ
          <span className={box}>
            <Type size={16} className="text-gray-400" />
            <input value={form.name} onChange={set("name")} placeholder="Name" className={input} />
          </span>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-[#14213F]">
          นามสกุล
          <span className={box}>
            <Type size={16} className="text-gray-400" />
            <input value={form.surname} onChange={set("surname")} placeholder="Surname" className={input} />
          </span>
        </label>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-[#D5D9E6] bg-white px-3 py-2.5 text-sm text-[#14213F]">
        <span className="h-3 w-3 rounded-full bg-[#2563EB]" />
        อาจารย์ผู้สอน
      </div>

      <label className="flex flex-col gap-1 text-xs font-semibold text-[#14213F]">
        Email
        <span className={box}>
          <Mail size={16} className="text-gray-400" />
          <input type="email" value={form.email} onChange={set("email")} placeholder="Email" className={input} />
        </span>
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="ml-auto flex w-[260px] items-center justify-center gap-2 rounded-lg bg-[#0B3FA6] py-3 text-sm font-bold text-white transition hover:bg-[#093283] active:scale-[0.98] disabled:opacity-50"
      >
        <Save size={16} />
        {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
      </button>
    </form>
  );
}

// ห่อด้วย Suspense เพราะใช้ useSearchParams
export default function EditTeacherPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center text-gray-500">กำลังโหลด...</p>}>
      <EditTeacherContent />
    </Suspense>
  );
}