"use client";

import { useEffect, useState } from "react";
import { Eye, FilePenLine, FileText, Trash2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Doc = {
  key: string;
  source: "train" | "slide";
  id: number;
  display_name: string;
  size: number | null;
  url: string;
  created_at: string;
};

const SOURCE_LABEL = { train: "เทรน AI", slide: "สไลด์" } as const;
const SOURCE_STYLE = {
  train: "bg-purple-50 text-purple-700",
  slide: "bg-blue-50 text-[#2563EB]",
} as const;

const fmtSize = (b: number | null) =>
  b == null ? "-" : b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;

const fmtDate = (d: string) =>
  new Date(d.replace(" ", "T")).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [filter, setFilter] = useState<"all" | "train" | "slide">("all");
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await fetch(`${API}/admin/documents`);
      const json = await res.json();
      if (!json.success) return setError(json.error || "โหลดข้อมูลไม่สำเร็จ");
      setDocs(json.data ?? []);
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(d: Doc) {
    const extra = d.source === "slide" ? "\nสไลด์นี้อาจถูกใช้อยู่ในบทเรียน" : "";
    if (!confirm(`ลบเอกสาร "${d.display_name}" ?${extra}`)) return;
    const res = await fetch(`${API}/admin/documents/${d.source}/${d.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) return setError(json.error || "ลบไม่สำเร็จ");
    load();
  }

  const shown = filter === "all" ? docs : docs.filter((d) => d.source === filter);
  const tabs = [
    { v: "all", label: `ทั้งหมด (${docs.length})` },
    { v: "slide", label: `สไลด์ (${docs.filter((d) => d.source === "slide").length})` },
    { v: "train", label: `เทรน AI (${docs.filter((d) => d.source === "train").length})` },
  ] as const;

  return (
    <div className="p-6">
      <h1 className="text-[28px] font-bold text-[#14213F]">รายการเอกสารที่อัปโหลด</h1>
      <p className="mt-1 text-sm text-gray-500">Check work submission</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-[#E3E6F0] bg-white shadow-sm">
        <div className="flex items-center justify-between bg-[#F8F8FD] px-5 py-4">
          <h2 className="text-lg font-bold text-[#14213F]">รายการเอกสาร</h2>
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button
                key={t.v}
                type="button"
                onClick={() => setFilter(t.v)}
                className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                  filter === t.v
                    ? "border-[#2563EB] bg-[#2563EB] text-white"
                    : "border-[#D5D9E6] bg-white text-[#14213F]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <p className="p-6 text-red-500">{error}</p>
        ) : (
          <table className="w-full table-fixed text-left text-sm text-[#14213F]">
            <thead>
              <tr className="border-y border-[#E3E6F0] text-xs text-gray-600">
                <th className="w-[8%] px-5 py-3 font-semibold">ลำดับ</th>
                <th className="w-[38%] px-5 py-3 font-semibold">File</th>
                <th className="w-[14%] px-5 py-3 font-semibold">ประเภท</th>
                <th className="w-[22%] px-5 py-3 font-semibold">วันที่อัปโหลด</th>
                
                <th className="w-[18%] px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>
             <tbody>
    {shown.length === 0 ? (
      <tr>
        <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
          ยังไม่มีเอกสารที่อัปโหลด
        </td>
      </tr>
    ) : (
      shown.map((d, i) => (
        <tr key={d.key} className="border-b border-[#E3E6F0] last:border-0">
          <td className="px-5 py-4">{i + 1}</td>
          <td className="px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                <FileText size={20} />
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-700" title={d.display_name}>
                  {d.display_name}
                </p>
                <p className="text-xs text-gray-500">{fmtSize(d.size)}</p>
              </div>
            </div>
          </td>
          <td className="px-5 py-4">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${SOURCE_STYLE[d.source]}`}>
              {SOURCE_LABEL[d.source]}
            </span>
          </td>
          <td className="px-5 py-4">{fmtDate(d.created_at)}</td>
          <td className="px-5 py-4">
            <span className="flex items-center gap-3">
              <a
                href={`${API}${d.url}`}
                target="_blank"
                rel="noreferrer"
                aria-label="ดู"
                className="text-gray-600 hover:opacity-70"
              >
                <Eye size={18} />
              </a>
              <button type="button" aria-label="แก้ไข" className="cursor-pointer text-[#2563EB] hover:opacity-70">
                <FilePenLine size={18} />
              </button>
              <button
                type="button"
                aria-label="ลบ"
                onClick={() => remove(d)}
                className="cursor-pointer text-red-600 hover:opacity-70"
              >
                <Trash2 size={18} />
              </button>
            </span>
          </td>
        </tr>
      ))
    )}
  </tbody>
          </table>
        )}
      </div>
    </div>
  );
}