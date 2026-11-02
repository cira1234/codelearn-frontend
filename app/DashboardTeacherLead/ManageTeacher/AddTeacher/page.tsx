"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Save, Type } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const box =
  "flex items-center gap-2 rounded-lg border border-[#D5D9E6] bg-white px-3 py-2 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/20";
const input = "w-full bg-transparent text-sm outline-none placeholder:text-[#C3C6D6]";

export default function AddTeacherPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", surname: "", email: "" });
  const [error, setError] = useState("");

  // อัปเดตทีละช่อง: set("name")(ค่า)
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.surname || !form.email) {
      setError("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    try {
      const res = await fetch(`${API}/admin/teachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "สร้างบัญชีไม่สำเร็จ");
        return;
      }
      router.push("/DashboardTeacherLead/ManageTeacher");
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    }
  }

  return (
        <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-[1100px] flex-col gap-8 px-8 pt-12">
      <h1 className="text-2xl font-bold text-[#14213F]">บัญชี</h1>

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

      {/* role มีแบบเดียว เซิร์ฟเวอร์ตั้ง role = 1 เอง */}
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
        className="ml-auto flex w-[260px] items-center justify-center gap-2 rounded-lg bg-[#0B3FA6] py-3 text-sm font-bold text-white transition hover:bg-[#093283] active:scale-[0.98]"
      >
        <Save size={16} />
        สร้าง
      </button>
    </form>
  );
}