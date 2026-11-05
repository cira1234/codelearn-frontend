"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Users, BadgeCheck, MoreHorizontal, Eye } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
import { useRouter } from "next/navigation";

const VIEW_PATH = "/DashboardTeacher/Detailclass/Class/Listsubmit/ListNameSubmit/ViewLabSubmit"; // TODO: พาทหน้าดูงานที่ส่ง

type Student = {
  user_id: number;
  id_student: string | null;
  name: string;
  picture: string | null;
  submitted_at: string | null;
};
type Lab = { id_lab: number; labchapter: number | null; namelab: string };

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });
const fmtTime = (s: string) =>
  new Date(s).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) + " น.";

function Stat({
  icon,
  bg,
  label,
  value,
}: {
  icon: React.ReactNode;
  bg: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#D9DBE6] bg-white px-5 py-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${bg}`}>{icon}</div>
      <div>
        <div className="text-xs text-gray-600">{label}</div>
        <div className="text-2xl font-semibold text-[#14213F]">{value}</div>
      </div>
    </div>
  );
}

function Content() {
  const lab_id = useSearchParams().get("lab");
  const [lab, setLab] = useState<Lab | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!lab_id) return;
    fetch(`${API}/teacher/labs/${lab_id}/submissions`, { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setLab(j.lab);
          setStudents(j.students);
        } else setError(j.error ?? "โหลดข้อมูลไม่สำเร็จ");
      })
      .catch(() => setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้"));
  }, [lab_id]);

  if (!lab_id) return <p className="p-6 text-sm text-red-600">ไม่พบรหัสใบงาน</p>;

  const total = students.length;
  const done = students.filter((s) => s.submitted_at).length;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-[#14213F]">
        {lab ? `ใบงานที่ ${lab.labchapter ?? lab.id_lab} ${lab.namelab}` : "ใบงาน"}
      </h1>
      <p className="mt-1 text-sm text-gray-600">Check work submission</p>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 grid grid-cols-3 gap-4">
        <Stat icon={<Users size={22} className="text-white" />} bg="bg-[#0B54D0]" label="นักศึกษาทั้งหมด" value={total} />
        <Stat icon={<BadgeCheck size={22} className="text-white" />} bg="bg-[#0B6B55]" label="ส่งแล้ว" value={done} />
        <Stat icon={<MoreHorizontal size={22} className="text-[#C0262D]" />} bg="bg-[#FFD9D9]" label="ยังไม่ส่งงาน" value={total - done} />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-[#D9DBE6] bg-[#FAF9FF]">
        <h2 className="border-b border-[#D9DBE6] bg-[#F3F2FA] px-4 py-3 text-lg font-bold text-[#14213F]">
          รายชื่อนักศึกษา
        </h2>
       <table className="w-full text-left text-sm text-[#14213F]">
  <thead className="bg-white text-xs">
    <tr>
      <th className="px-4 py-3 font-medium">Student ID</th>
      <th className="px-4 py-3 font-medium">Name</th>
      <th className="px-4 py-3 font-medium">เวลาที่ส่ง</th>
      <th className="px-4 py-3 font-medium">คะแนน</th>
      <th className="px-4 py-3 font-medium">Status</th>
      <th className="px-4 py-3 text-center font-medium">View</th>
    </tr>
  </thead>
  <tbody>
    {students.map((s) => {
      const href = s.submitted_at
        ? `${VIEW_PATH}?lab=${lab_id}&user=${s.user_id}`
        : null;
      return (
        <tr key={s.user_id} className="border-t border-[#D9DBE6]">
          <td className="px-4 py-3">{s.id_student ?? "-"}</td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              {s.picture ? (
                <img src={s.picture} alt="" className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#DDE3F0] text-[10px] font-bold text-gray-600">
                  {s.name.slice(0, 2).toUpperCase()}
                </span>
              )}
              {s.name}
            </div>
          </td>
          <td className="px-4 py-3 text-xs">
            {s.submitted_at ? (
              <>
                <div className="font-semibold">{fmtDate(s.submitted_at)}</div>
                <div>{fmtTime(s.submitted_at)}</div>
              </>
            ) : (
              "-"
            )}
          </td>
          <td className="px-4 py-3">-</td>
          <td className="px-4 py-3">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                s.submitted_at ? "bg-[#CFE5DD] text-[#1F5F4B]" : "bg-[#FFD9D9] text-[#C0262D]"
              }`}
            >
              {s.submitted_at ? "ส่งแล้ว" : "ยังไม่ส่ง"}
            </span>
          </td>
          <td className="px-4 py-3 text-center">
            {href ? (
              <Link
                href={href}
                title="ดูงานที่ส่ง"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#0B54D0] hover:bg-[#E3E9FB]"
              >
                <Eye size={18} />
              </Link>
            ) : (
              <span
                title="ยังไม่ส่งงาน"
                className="inline-flex h-8 w-8 items-center justify-center text-gray-300"
              >
                <Eye size={18} />
              </span>
            )}
          </td>
        </tr>
      );
    })}
    {students.length === 0 && !error && (
      <tr>
        <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
          ไม่มีนักศึกษาในห้อง
        </td>
      </tr>
    )}
  </tbody>
</table>
      </div>
    </div>
  );
}

export default function LabSubmissionsPage() {
  return (
    <Suspense>
      <Content />
    </Suspense>
  );
}