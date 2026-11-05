"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Users,
  BadgeCheck,
  Search,
  User,
  Contact,
  Mail,
  Plus,
  ArrowRight,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const PREVIEW_COUNT = 5; // จำนวนแถวที่โชว์ในโหมดตัวอย่าง

// TODO: เปลี่ยนเป็น path หน้าสร้างโค้ดของจริง
const CREATE_CODE_PATH = "/DashboardTeacher/Detailclass/Class/Createcode";

type Student = {
  user_id: number;
  id_student: string;
  name: string;
  email: string;
  picture: string;
  status: "Verified" | "Pending";
  joined_at: string;
};

type ClassInfo = {
  id: number;
  group_name: string;
  term: string;
  course_title: string;
  join_code: string;
};

function initials(s: Student) {
  const words = (s.name || s.email || "?").trim().split(/\s+/);
  return words
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

function Avatar({ s }: { s: Student }) {
  const [broken, setBroken] = useState(false);
  if (s.picture && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={s.picture}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
        className="h-8 w-8 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DCE1EE] text-[11px] font-semibold text-[#434654]">
      {initials(s)}
    </div>
  );
}

function ClassDetailContent() {
  const params = useSearchParams();
  const classId = params.get("classId");

  const [cls, setCls] = useState<ClassInfo | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [verified, setVerified] = useState(0);
  const [pending, setPending] = useState(0);
  const [filter, setFilter] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ฟอร์ม Add New Student
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!classId) {
      setLoading(false);
      setError("ไม่พบรหัสห้องใน URL (ต้องเปิดด้วย ?classId=1)");
      return;
    }
    fetch(`${API}/teacher/class/${classId}/students`)
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error || "โหลดข้อมูลไม่สำเร็จ");
          return;
        }
        setCls(json.class);
        setStudents(json.students);
        setTotal(json.total);
        setVerified(json.verified);
        setPending(json.pending);
        setError("");
      })
      .catch(() => setError("เชื่อมต่อ backend ไม่ได้"))
      .finally(() => setLoading(false));
  }, [classId, reloadKey]);

  const keyword = filter.trim().toLowerCase();
  const filtered = students.filter(
    (s) =>
      !keyword ||
      s.name.toLowerCase().includes(keyword) ||
      s.email.toLowerCase().includes(keyword) ||
      s.id_student.toLowerCase().includes(keyword)
  );
  const shown = showAll || keyword ? filtered : filtered.slice(0, PREVIEW_COUNT);

  async function addStudent() {
    if (!classId) return;
    if (!fullName.trim() || !email.trim()) {
      setAddError("กรุณากรอกชื่อและอีเมล");
      return;
    }
    setAdding(true);
    setAddError("");
    try {
      const res = await fetch(`${API}/teacher/class/${classId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          id_student: studentId,
          email,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) {
        setAddError(
          json.error || json.detail || `เพิ่มนักศึกษาไม่สำเร็จ (${res.status})`
        );
        return;
      }
      setFullName("");
      setStudentId("");
      setEmail("");
      setReloadKey((k) => k + 1); // โหลดรายชื่อใหม่
    } catch {
      setAddError("เชื่อมต่อ backend ไม่ได้");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="p-8">
      {/* หัวเรื่อง */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold leading-tight text-[#1A1B22]">
            {cls ? cls.group_name : "กลุ่มเรียน"}
          </h1>
          <p className="mt-1 text-sm text-[#434654]">
            Add new students to the academic workspace.
          </p>
        </div>
        <Link
          href={`${CREATE_CODE_PATH}?classId=${classId ?? ""}`}
          className="flex items-center gap-2 rounded-lg bg-[#0058CC] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0040A1]"
        >
          <Plus size={18} />
          Create Code
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* การ์ดสรุป */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-[#E3E5F5] bg-[#FBF9FF] px-4 py-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0058CC] text-white">
            <Users size={22} />
          </div>
          <div>
            <div className="text-[11px] font-medium tracking-wider text-[#434654]">ALL STUDENTS</div>
            <div className="text-2xl font-bold text-[#1A1B22]">{total}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-[#E3E5F5] bg-[#FBF9FF] px-4 py-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#006C55] text-white">
            <BadgeCheck size={22} />
          </div>
          <div>
            <div className="text-[11px] font-medium tracking-wider text-[#434654]">SUCCESSFULLY VERIFIED</div>
            <div className="text-2xl font-bold text-[#1A1B22]">{verified}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-[#E3E5F5] bg-[#FBF9FF] px-4 py-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFDAD6] text-lg font-bold leading-none tracking-tighter text-[#BA1A1A]">
            ···
          </div>
          <div>
            <div className="text-[11px] font-medium tracking-wider text-[#434654]">PENDING REVIEW</div>
            <div className="text-2xl font-bold text-[#1A1B22]">{pending}</div>
          </div>
        </div>
      </div>

      {/* เนื้อหาสองคอลัมน์ */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.55fr_1fr]">
        {/* ซ้าย: Student List Preview */}
        <div className="flex min-h-[430px] flex-col overflow-hidden rounded-xl border border-[#E3E5F5] bg-[#FBF9FF]">
          <div className="flex items-center justify-between bg-[#F3EEF8] px-4 py-3">
            <h2 className="text-lg font-semibold text-[#1A1B22]">Student List Preview</h2>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#434654]"
              />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter list..."
                className="w-44 rounded-md border border-[#C3C6D6] bg-white py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[#0058CC]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E3E5F5] text-[11px] font-medium text-[#434654]">
                  <th className="px-4 py-3">Student ID</th>
                  <th className="px-2 py-3">Name</th>
                  <th className="px-2 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                      กำลังโหลด...
                    </td>
                  </tr>
                )}
                {!loading && shown.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                      ยังไม่มีนักเรียนในห้องนี้
                    </td>
                  </tr>
                )}
                {shown.map((s) => (
                  <tr key={s.user_id} className="border-b border-[#E3E5F5] bg-[#F5F2FB]/60">
                    <td className="px-4 py-3 text-[#1A1B22]">{s.id_student || "-"}</td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar s={s} />
                        <span className="font-medium text-[#1A1B22]">{s.name || "-"}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-[#434654]">{s.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          "rounded-full px-2.5 py-0.5 text-[10px] font-medium " +
                          (s.status === "Verified"
                            ? "bg-[#CFE6DF] text-[#1F5C4C]"
                            : "bg-[#FFDAD6] text-[#BA1A1A]")
                        }
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={() => setShowAll((v) => !v)}
            className="border-t border-[#E3E5F5] bg-white py-2.5 text-center text-xs font-semibold text-[#0040A1] hover:bg-[#F3EEF8]"
          >
            {showAll ? "Show Less" : "View Full Directory"}
          </button>
        </div>

        {/* ขวา */}
        <div className="flex flex-col gap-6">
          {/* Add New Student */}
          <div className="rounded-xl border border-[#E3E5F5] bg-[#FBF9FF] p-5">
            <h2 className="mb-4 text-lg font-semibold text-[#1A1B22]">Add New Student</h2>

            <label className="mb-1 block text-xs font-medium text-[#1A1B22]">Full Name</label>
            <div className="relative mb-4">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#434654]" />
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full rounded-md border border-[#C3C6D6] bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#0058CC]"
              />
            </div>

            <label className="mb-1 block text-xs font-medium text-[#1A1B22]">Student ID</label>
            <div className="relative mb-4">
              <Contact size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#434654]" />
              <input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. ID-2024-001"
                className="w-full rounded-md border border-[#C3C6D6] bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#0058CC]"
              />
            </div>

            <label className="mb-1 block text-xs font-medium text-[#1A1B22]">Email Address</label>
            <div className="relative mb-6">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#434654]" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full rounded-md border border-[#C3C6D6] bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#0058CC]"
              />
            </div>

            {addError && (
              <p className="mb-3 text-sm text-red-600">{addError}</p>
            )}

            <button
              onClick={addStudent}
              disabled={adding}
              className="w-full rounded-md bg-[#0040A1] py-2.5 text-sm font-semibold text-white transition hover:bg-[#003380] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {adding ? "Adding..." : "Add to System"}
            </button>
          </div>

          {/* ดูรายชื่อคนส่งงาน */}
          <div className="rounded-xl border border-[#E3E5F5] bg-[#FBF9FF] p-5">
            <h2 className="mb-4 text-lg font-semibold text-[#1A1B22]">ดูรายชื่อคนส่งงาน</h2>
           <Link
              href={`/DashboardTeacher/Detailclass/Class/Listsubmit?classId=${classId ?? ""}`}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-[#0040A1] py-2.5 text-sm font-semibold text-white transition hover:bg-[#003380]"
            >
              ดูรายชื่อ <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClassDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">กำลังโหลด...</div>}>
      <ClassDetailContent />
    </Suspense>
  );
}