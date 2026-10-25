"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
export default function JoinClassPage() {
  const [code, setCode] = useState(["", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const [error, setError] = useState("");
  const handleChange = (i: number, value: string) => {
    const ch = value.slice(-1).toUpperCase();
    const next = [...code];
    next[i] = ch;
    setCode(next);
    if (ch && i < 3) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

    const handleJoin = async () => {
    const joined = code.join("");
    if (joined.length < 4) {
      setError("กรุณากรอกรหัสให้ครบ 4 หลัก");
      return;
    }

    let userId: number | null = null;
    try {
      const raw = localStorage.getItem("user");
      if (raw) userId = JSON.parse(raw)?.id ?? null;
    } catch {
      // อ่านไม่ได้ ถือว่ายังไม่ล็อกอิน
    }
    if (!userId) {
      setError("ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/classes/join", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, join_code: joined }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "เข้าห้องเรียนไม่สำเร็จ");
        return;
      }
      setError("");
      router.push("/Dashboardstudent/MyCourses/Group");
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center">
      <div className="w-full max-w-[316px] rounded-xl border border-[#E3E6F0] bg-white px-8 py-10 text-center shadow-sm sm:max-w-[316px]">
        <h2 className="text-base font-bold text-[#14213F]">Enter Code For Join Classroom</h2>

        <div className="mt-8 flex justify-center gap-3">
          {code.map((c, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={c}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              maxLength={1}
              placeholder="X"
              className="h-11 w-11 rounded-lg border border-[#D5D9E6] text-center text-xl text-[#14213F] placeholder:text-[#C3C6D6] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
            />
          ))}
        </div>
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
               <button
          type="button"
          onClick={handleJoin}
          className="group relative mt-10 w-full overflow-hidden rounded-lg bg-[#2563EB] py-2 text-sm font-bold text-white transition active:scale-[0.98]"
        >
          {/* วงกลมที่ขยายจากมุมขวาบน */}
          <span className="absolute right-0 top-0 h-0 w-0 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#0B3FA6] transition-all duration-500 ease-out group-hover:h-[340px] group-hover:w-[540px]" />
          {/* ข้อความต้องอยู่เหนือวงกลม */}
          <span className="relative z-10">Join Class</span>
        </button>
      </div>
    </div>
  );
}