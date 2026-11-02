"use client";
import Link from "next/dist/client/link";

import GoogleSignInButton from "../Components/GoogleSignInButton";
import { useRouter } from "next/navigation";
import logo from "../image/logo.png";
import Image from "next/image";
import Login from "../image/login.png";
import Logologin from "../image/logologin.png";
import { ArrowRight } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
export default function LoginPage() {
    const router = useRouter();

  return (
     
         <main className="page-fade-in">
               <section className="flex min-h-[calc(100vh-82px)] w-full items-center bg-white mt-5 ">
                
                <div className="mx-auto w-full max-w-[1200px] px-[clamp(1.5rem,4vw,4rem)]">

                    <div className="rounded-2xl bg-[#FBF8FE] ">
                    
                    <div className="flex items-center justify-items-center  grid grid-cols-1 md:grid-cols-2 ">

                        <div>
                             <div className="flex justify-start bg-white">
                                <Image
                            src={Login}
                            alt="CodeLearn Logo"
                            className="h-auto w-full object-contain rounded-l-2xl "
                            />
                            </div>
                        </div>


                        <div className="flex flex-col items-center justify-center gap-4 p-10 text-center md:items-start md:text-left">
                           
                            <div className="flex w-full justify-center">
                                <Image
                                    src={Logologin}
                                    alt="CodeLearn Logo"
                                    className="h-auto w-[182px] object-contain"
                                />
                            </div>

                            



                           <div className="mt-6 flex w-full max-w-[420px] flex-col gap-6">
  <div className="text-center">
    <h1 className="text-xl font-bold text-gray-900">
      ยินดีต้อนรับเข้าสู่ระบบบริการนักศึกษา
    </h1>
    <p className="mt-1 text-sm text-gray-500">
      เข้าสู่ระบบด้วยรหัสนักศึกษาและรหัสผ่านของคุณ
      เพื่อเข้าถึงข้อมูลการเรียนของคุณและฟีเจอร์อื่น ๆ ของระบบบริการนักศึกษา
    </p>
  </div>
</div>

                           <div className="flex w-[420px] flex-col gap-6 mt-0">
                            {/* ปุ่ม Google */}
                          <div className="flex w-[420px] flex-col gap-6 mt-10">
                            {/* ปุ่ม Google */}
                            <GoogleSignInButton onSuccess={() => router.push("/OTP")} />
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
                             <button className="w-[420px] px-5 py-2 group relative flex items-center justify-center overflow-hidden rounded-lg bg-linear-to-r from-[#315BFF] to-[#1D4ED8] px-6 py-3 w-36 text-[18px] font-bold text-white">
                                <span className="absolute -right-4 -top-2 h-4 w-4 rounded-lg bg-[#14213F] transition-transform duration-500 ease-out group-hover:scale-[70]" />
                                <span className="relative z-10">Sign In</span>

                                <ArrowRight
                                size={25}
                                className="transition-transform group-hover:translate-x-1"
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