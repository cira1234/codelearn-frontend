"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import GoogleSignInButton from "../Components/GoogleSignInButton";
import LoginTeacher from "../image/loginteacher.png";
import Logologin from "../image/logologin.png";

export default function LoginTeacherPage() {
  const router = useRouter();

  return (
    <main className="page-fade-in">
      <section className="mt-5 flex min-h-[calc(100vh-82px)] w-full items-center bg-white">
        <div className="mx-auto w-full max-w-[1200px] px-[clamp(1.5rem,4vw,4rem)]">
          <div className="overflow-hidden rounded-2xl bg-[#FBF8FE]">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* ซ้าย: ภาพประกอบ (ซ่อนบนมือถือ) */}
              <div className="hidden bg-white md:block">
                <Image
                  src={LoginTeacher}
                  alt="Teacher illustration"
                  priority
                  className="h-full w-full object-cover"
                />
              </div>

              {/* ขวา: ฟอร์ม */}
              <div className="flex flex-col items-center justify-center gap-4 p-10">
                <Image
                  src={Logologin}
                  alt="CodeLearn Logo"
                  className="h-auto w-[182px] object-contain"
                />

                <div className="mt-6 flex w-full max-w-[420px] flex-col gap-6">
                  <div className="text-center">
                    <h1 className="text-xl font-bold text-gray-900">
                      เข้าสู่ระบบอาจารย์ผู้รับผิดชอบ
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                      สำหรับอาจารย์ผู้ดูแลรายวิชาเท่านั้น
                    </p>
                  </div>

                  {/* ปุ่ม Google */}
                  <GoogleSignInButton onSuccess={() => router.push("/OTPTeacherlead")} />

                  {/* Divider */}
                  <div className="flex w-full items-center gap-4">
                    <div className="h-px flex-1 bg-[#C3C6D6]" />
                    <span className="text-sm text-gray-500">or continue with email</span>
                    <div className="h-px flex-1 bg-[#C3C6D6]" />
                  </div>

                  {/* Remember me */}
                  <label className="flex cursor-pointer items-center gap-3 text-gray-700">
                    <input
                      type="checkbox"
                      className="h-5 w-5 cursor-pointer rounded border-[#C3C6D6] accent-[#0040A1]"
                    />
                    <span>Remember me for 30 days</span>
                  </label>

                  {/* ปุ่ม Sign In */}
                  <button
                    type="button"
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-[#315BFF] to-[#1D4ED8] px-6 py-3 text-[18px] font-bold text-white"
                  >
                    <span className="absolute -right-4 -top-2 h-4 w-4 rounded-lg bg-[#14213F] transition-transform duration-500 ease-out group-hover:scale-[70]" />
                    <span className="relative z-10">Sign In</span>
                    <ArrowRight
                      size={22}
                      className="relative z-10 transition-transform group-hover:translate-x-1"
                    />
                  </button>

                  {/* Forgot Password */}
                  <div className="flex justify-end">
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-[#0040A1] hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}