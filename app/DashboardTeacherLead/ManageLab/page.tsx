"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // 👈 เพิ่ม import

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Lab = { id_lab: number; namelab: string; lab_ofchapter: string | number };

export default function ManageLabPage() {
  const router = useRouter(); // 👈 เรียกใช้ router
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const res = await fetch(`${API}/admin/labs`);
      const json = await res.json();
      if (json.success) setLabs(json.data);
      else setError(json.error ?? "โหลดใบงานไม่สำเร็จ");
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // 👇 ฟังก์ชันลบใบงาน
  async function handleDelete(id: number, name: string) {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบใบงาน "${name}" ?`)) return;

    try {
      const res = await fetch(`${API}/admin/labs/${id}`, { method: "DELETE" });
      const json = await res.json();
      
      if (json.success) {
        // ลบสำเร็จ ให้กรองเอาแถวนั้นออก
        setLabs((prev) => prev.filter((lab) => lab.id_lab !== id));
      } else {
        alert(json.error || "ลบข้อมูลไม่สำเร็จ");
      }
    } catch {
      alert("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    }
  }

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
                    {/* 👇 ปุ่มแก้ไข ส่ง id ไปหน้าถัดไป */}
                    <button 
                      type="button" 
                      onClick={() => router.push(`/DashboardTeacherLead/ManageLab/EditLab?id=${lab.id_lab}`)}
                      className="cursor-pointer text-[#2563EB] hover:text-[#0B3FA6]"
                      title="แก้ไข"
                    >
                      <Pencil size={18} />
                    </button>
                    {/* 👇 ปุ่มลบ เรียกฟังก์ชัน handleDelete */}
                    <button 
                      type="button" 
                      onClick={() => handleDelete(lab.id_lab, lab.namelab)}
                      className="cursor-pointer text-red-600 hover:text-red-800"
                      title="ลบ"
                    >
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