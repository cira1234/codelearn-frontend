"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Eye, Filter } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const ENDPOINT = `${API}/teacher/labs`;
const DETAIL_PATH = "/DashboardTeacher/Detailclass/Class/Listsubmit/ListNameSubmit"; // TODO: หน้าถัดไปของ icon ตา

type Row = {
  id_lab: number;
  labchapter: number | null;
  namelab: string;
  chapter_id?: number;
  id_term: number;
  term: string;
  section_id: number;
  section_name: string;
  submitted_count?: number; // ยังไม่มีใน API
  total_count?: number;     // ยังไม่มีใน API
};

const labNo = (r: Row) => r.labchapter ?? r.id_lab;

function FilterSelect({
  value,
  onChange,
  options,
  all,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  all: string;
}) {
  return (
    <label className="flex h-9 items-center gap-2 rounded-md border border-[#C3C6D6] bg-white px-3 text-xs text-[#14213F]">
      <Filter size={14} className="shrink-0 text-[#2563EB]" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none bg-transparent outline-none"
      >
        <option value="">{all}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Badge({ done, total }: { done: number; total: number }) {
  const ok = done >= total;
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
        ok ? "bg-[#CFE5DD] text-[#1F5F4B]" : "bg-[#FFD9D9] text-[#C0262D]"
      }`}
    >
      {ok ? "ครบแล้ว" : "ยังไม่ครบ"} {done}/{total} คน
    </span>
  );
}

export default function LabSubmitList() {
  const [rows, setRows] = useState<Row[]>([]);
  const [term, setTerm] = useState("");
  const [section, setSection] = useState("");
  const [lab, setLab] = useState("");

  useEffect(() => {
    fetch(ENDPOINT, { credentials: "include" })
      .then((r) => r.json())
      .then((j) => setRows(j.labs ?? []))
      .catch(() => {});
  }, []);

  const uniq = (pick: (r: Row) => [string, string]) =>
    [...new Map(rows.map(pick)).entries()].map(([value, label]) => ({ value, label }));

  const termOpts = useMemo(() => uniq((r) => [String(r.id_term), r.term]), [rows]);
  const sectionOpts = useMemo(
    () => uniq((r) => [String(r.section_id), r.section_name]),
    [rows]
  );
  const labOpts = useMemo(
    () =>
      uniq((r) => [String(labNo(r)), `ใบงานที่ ${labNo(r)}`]).sort(
        (a, b) => Number(a.value) - Number(b.value)
      ),
    [rows]
  );

  const filtered = rows.filter(
    (r) =>
      (!term || String(r.id_term) === term) &&
      (!section || String(r.section_id) === section) &&
      (!lab || String(labNo(r)) === lab)
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-[#14213F]">Lab</h1>
      <p className="mt-1 text-sm text-gray-600">
        Check the Lab work submitted by the students.
      </p>

      <div className="mt-6 min-h-[420px] overflow-hidden rounded-xl border border-[#D9DBE6] bg-[#FAF9FF] shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D9DBE6] bg-[#F3F2FA] px-4 py-3">
          <h2 className="text-lg font-bold text-[#14213F]">ประวัติการส่งงาน</h2>
          <div className="flex gap-2">
            <FilterSelect value={term} onChange={setTerm} options={termOpts} all="ทุกเทอม" />
            <FilterSelect value={section} onChange={setSection} options={sectionOpts} all="ทุกภาค" />
            <FilterSelect value={lab} onChange={setLab} options={labOpts} all="LAB" />
          </div>
        </div>

        <ul>
          {filtered.map((r) => (
            <li
              key={r.id_lab}
              className="flex items-center justify-between gap-4 border-b border-[#D9DBE6] px-4 py-4 text-sm text-[#14213F]"
            >
              <span>
                ใบงานที่ {labNo(r)} {r.namelab}
              </span>
              <div className="flex items-center gap-4">
                {r.total_count != null && (
                  <Badge done={r.submitted_count ?? 0} total={r.total_count} />
                )}
                <Link
                  href={`${DETAIL_PATH}?lab=${r.id_lab}`}
                  aria-label="ดูรายละเอียด"
                  className="text-gray-700 hover:text-[#2563EB]"
                >
                  <Eye size={20} />
                </Link>
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-gray-400">ไม่พบใบงาน</li>
          )}
        </ul>
      </div>
    </div>
  );
}