"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Logologin from "../image/logologin.png";
import bg from "../image/bg.png";

const API = process.env.NEXT_PUBLIC_API_URL;
const LENGTH = 4;
const RESEND_AFTER_MS = 60_000; // ขอรหัสใหม่ได้เมื่อเหลือเวลา <= 60 วินาที (ตรงกับ cooldown ของ backend)

type Pending = { token: string; email: string; expiresAt: number };

const formatTime = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export default function OtpPage() {
  const router = useRouter();
  const [pending, setPending] = useState<Pending | null>(null);
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""));
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // อ่านสถานะรอ OTP ถ้าไม่มี แปลว่าเข้าหน้านี้ตรงๆ ให้กลับไป Login
  useEffect(() => {
    const saved = sessionStorage.getItem("otpPending");
    if (!saved) {
      router.replace("/Login");
      return;
    }
    setPending(JSON.parse(saved));
  }, [router]);

  // นาฬิกานับถอยหลัง
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!pending) return null;

  const remaining = pending.expiresAt - now;
  const expired = remaining <= 0;
  const canResend = remaining <= RESEND_AFTER_MS;
  const resendWait = Math.max(0, Math.ceil((remaining - RESEND_AFTER_MS) / 1000));

  const handleChange = (i: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = digit;
    setDigits(next);
    setError("");
    if (digit && i < LENGTH - 1) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
    if (e.key === "Enter") handleSubmit();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = Array(LENGTH).fill("");
    text.split("").forEach((c, idx) => (next[idx] = c));
    setDigits(next);
    inputs.current[Math.min(text.length, LENGTH - 1)]?.focus();
  };

  const handleSubmit = async () => {
    const code = digits.join("");
    if (code.length < LENGTH) return setError("กรุณากรอกรหัสให้ครบ");
    if (expired) return setError("รหัสหมดอายุ กรุณาขอรหัสใหม่");

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/otp/verify`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pending_token: pending.token, code }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        sessionStorage.removeItem("otpPending");
        router.push("/Dashboardstudent/MyCourses");
      } else {
        setError(data.error || "ยืนยันไม่สำเร็จ");
        setDigits(Array(LENGTH).fill(""));
        inputs.current[0]?.focus();
      }
    } catch {
      setError("เชื่อมต่อ server ไม่ได้");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      const res = await fetch(`${API}/auth/otp/resend`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pending_token: pending.token }),
      });
      const data = await res.json();

      if (data.success) {
        const updated = { ...pending, expiresAt: Date.now() + data.expires_in * 1000 };
        sessionStorage.setItem("otpPending", JSON.stringify(updated));
        setPending(updated);
        setDigits(Array(LENGTH).fill(""));
        inputs.current[0]?.focus();
      } else {
        setError(data.error || "ส่งรหัสไม่สำเร็จ");
      }
    } catch {
      setError("เชื่อมต่อ server ไม่ได้");
    }
  };

  return (
    <main
      className="fixed inset-0 flex items-center justify-center bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: `url(${bg.src})` }}
    >
      <div className="w-full max-w-[430px] rounded-lg bg-white px-10 py-12 shadow-xl">
        <div className="flex justify-center">
          <Image src={Logologin} alt="CodeLearn Logo" className="h-auto w-[182px] object-contain" />
        </div>

        <div className="mt-10 flex items-center gap-4">
          <div className="h-px flex-1 bg-[#C3C6D6]" />
          <span className="text-gray-500">verify</span>
          <div className="h-px flex-1 bg-[#C3C6D6]" />
        </div>

        <p className="mt-3 font-semibold text-gray-900">
          Verify your email We&apos;ve sent a verification code to {pending.email}
        </p>

        <p className={`mt-6 font-semibold ${expired ? "text-red-500" : "text-gray-900"}`}>
          Time {formatTime(remaining)} minute
        </p>

       <div className="mt-4 flex justify-center gap-3">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              value={d}
              placeholder="X"
              inputMode="numeric"
              maxLength={1}
              autoComplete={i === 0 ? "one-time-code" : "off"}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className="h-12 w-12 rounded-md border border-[#C3C6D6] text-center text-xl text-gray-900 outline-none placeholder:text-[#C3C6D6] focus:border-[#0040A1] focus:ring-2 focus:ring-[#0040A1]/20"
            />
          ))}
        </div>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="group relative mt-8 flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-[#0040A1] px-6 py-3 font-bold text-white disabled:opacity-60"
        >
          <span className="absolute -right-4 -top-2 h-4 w-4 rounded-lg bg-[#14213F] transition-transform duration-500 ease-out group-hover:scale-[70]" />
          <span className="relative z-10">{loading ? "กำลังตรวจสอบ..." : "Submit"}</span>
          <ArrowRight size={18} className="relative z-10 transition-transform group-hover:translate-x-1" />
        </button>

        <div className="mt-4 text-center text-sm">
          {canResend ? (
            <button type="button" onClick={handleResend} className="font-medium text-[#0040A1] hover:underline">
              ส่งรหัสอีกครั้ง
            </button>
          ) : (
            <span className="text-gray-500">ขอรหัสใหม่ได้ในอีก {resendWait} วินาที</span>
          )}
        </div>
      </div>
    </main>
  );
}