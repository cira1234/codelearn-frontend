"use client";

import { useEffect, useState } from "react";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Lab = { id_lab: number; namelab: string; lab_ofchapter: string | number };

export default function ManageLabPage() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/admin/labs`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setLabs(json.data);
        else setError(json.error ?? "โหลดใบงานไม่สำเร็จ");
      })
      .catch(() => setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้"))
      .finally(() => setLoading(false));
  }, []);

  return (
     
    <div className="w-full px-8 pt-12 pb-12">
      <div className="overflow-hidden rounded-xl border border-[#E3E6F0] bg-white">
        <div className="flex items-center justify-between bg-[#F3F4FD] px-6 py-4">
          <h2 className="text-xl font-semibold">ใบงาน</h2>
            <Link
            href="/DashboardTeacherLead/ManageLab/AddLab"
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#0B3FA6] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#093283] active:scale-[0.98]"
            >
            เพิ่มใบงาน
            <Plus size={16} />
            </Link>
        </div>

        <table className="w-full cursor-default text-sm">
          <thead>
            <tr className="border-b border-[#E3E6F0] text-left">
              <th className="px-6 py-3 text-center font-semibold">บทที่</th>
              <th className="px-6 py-3 font-semibold">ชื่อใบงาน</th>
              <th className="px-6 py-3 text-center font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={3} className="px-6 py-6 text-center text-gray-500">
                  กำลังโหลด...
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan={3} className="px-6 py-6 text-center text-red-600">
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && labs.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-6 text-center text-gray-500">
                  ยังไม่มีใบงาน
                </td>
              </tr>
            )}
            {labs.map((lab) => (
              <tr key={lab.id_lab} className="border-b border-[#E3E6F0] last:border-b-0">
                <td className="px-6 py-4 text-center">{lab.lab_ofchapter}</td>
                <td className="px-6 py-4">{lab.namelab}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-4">
                    <button type="button" className="cursor-pointer text-gray-700 hover:text-black">
                      <Eye size={18} />
                    </button>
                    <button type="button" className="cursor-pointer text-[#2563EB] hover:text-[#0B3FA6]">
                      <Pencil size={18} />
                    </button>
                    <button type="button" className="cursor-pointer text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  
  );
}