"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, IdCard, User } from "lucide-react";
import bg from "../image/bg.png";
import Logologin from "../image/logologin.png";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function RegisterPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ไม่มี user (ยังไม่ผ่าน OTP) ให้กลับไปหน้า Login
  useEffect(() => {
    if (!localStorage.getItem("user")) router.replace("/Login");
  }, [router]);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !name.trim() || !surname.trim()) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    let user: { user_id?: number; [k: string]: unknown };
    try {
      user = JSON.parse(localStorage.getItem("user") ?? "{}");
    } catch {
      user = {};
    }
    if (!user.user_id) {
      setError("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/profile`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,
          id_student: studentId.trim(),
          name: name.trim(),
          surname: surname.trim(),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "บันทึกไม่สำเร็จ");
        return;
      }
      // อัปเดตข้อมูลใน localStorage ให้ Topbar แสดงชื่อใหม่
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, id_student: data.id_student, name: data.name })
      );
      router.push("/Dashboardstudent/MyCourses");
    } catch {
      setError("เชื่อมต่อ server ไม่ได้");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-[#C3C6D6] bg-white py-2.5 pl-10 pr-3 text-sm text-[#14213F] placeholder:text-gray-400 outline-none transition focus:border-[#0B3FA6] focus:ring-2 focus:ring-[#0B3FA6]/20";

  return (
    <main
      className="fixed inset-0 flex items-center justify-center overflow-y-auto bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: `url(${bg.src})` }}
    >
      <div className="w-full max-w-[430px] rounded-lg bg-white px-10 py-12 shadow-xl">
        <div className="flex justify-center">
          <Image src={Logologin} alt="CodeLearn Logo" className="h-auto w-[182px] object-contain" />
        </div>

        <div className="mt-10 flex items-center gap-4">
          <div className="h-px flex-1 bg-[#C3C6D6]" />
          <span className="text-lg text-gray-500">Register</span>
          <div className="h-px flex-1 bg-[#C3C6D6]" />
        </div>

        <form onSubmit={handleNext} className="mt-6">
          <p className="text-xs text-gray-500">Student Information</p>

          <label className="mt-2 block text-sm font-semibold text-[#14213F]">ID Student</label>
          <div className="relative mt-1">
            <IdCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              inputMode="numeric"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Student ID"
              className={inputClass}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#14213F]">Name</label>
              <div className="relative mt-1">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#14213F]">Surname</label>
              <div className="relative mt-1">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="Surname"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-10 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B3FA6] py-2.5 text-sm font-bold text-white transition hover:bg-[#093283] active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "กำลังบันทึก..." : "Next"}
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </main>
  );
}