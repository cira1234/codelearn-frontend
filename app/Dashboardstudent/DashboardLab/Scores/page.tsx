"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function ScoresPage() {
  const [userId, setUserId] = useState<number | null>(null);
  // 👇 เปลี่ยนค่าเริ่มต้นเป็น midterm
  const [filter, setFilter] = useState("midterm");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setUserId(parsed.user_id || parsed.id);
      } catch (e) {
        setUserId(null);
      }
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorMsg("");
    
    fetch(`${API}/student/scores/${userId}?section_filter=${filter}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("API ตอบกลับผิดพลาด");
        return r.json();
      })
      .then((j) => {
        if (j.success) setData(j);
        else setErrorMsg(j.error || "โหลดข้อมูลไม่สำเร็จ");
      })
      .catch((err) => setErrorMsg(err.message || "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้"))
      .finally(() => setLoading(false));
  }, [userId, filter]);

  if (loading) return <div className="p-10 text-center text-gray-500">กำลังโหลดข้อมูล...</div>;
  if (errorMsg) return <div className="p-10 text-center text-red-500">Error: {errorMsg}</div>;
  if (!data) return <div className="p-10 text-center text-gray-500">ไม่พบข้อมูล</div>;

  const chapters = data?.chapters || [];
  const totalChapters = chapters.length;

  // --- คำนวณสถิติจากข้อมูล DB จริง ---
  let quizDone = 0;
  let labDone = 0;
  let totalScore = 0;
  let totalMax = 0;

  chapters.forEach((ch: any) => {
    // Quiz
    const qMax = ch.quiz_total || 0;
    if (qMax > 0) {
      if (ch.quiz_score !== null) quizDone++;
      totalScore += (ch.quiz_score || 0);
      totalMax += qMax;
    }
    // Lab
    const lMax = ch.lab_max_score || 0;
    if (lMax > 0) {
      if (ch.submitted_labs > 0) labDone++;
      totalScore += (ch.lab_score || 0);
      totalMax += lMax;
    }
  });

  const pending = (totalChapters - quizDone) + (totalChapters - labDone);
  const overallPct = totalMax > 0 ? ((totalScore / totalMax) * 100).toFixed(1) : "0.0";

  return (
    <div className="min-h-screen bg-[#F7F8FC] p-6 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-extrabold text-[#14213F]">สรุปคะแนนและพัฒนาการแต่ละบท</h2>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E3E6F0]">
          <p className="text-sm text-gray-500 mb-1">คะแนนเฉลี่ยรวม</p>
          <p className="text-3xl font-bold text-[#14213F]">{overallPct}%</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E3E6F0] flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Quiz</p>
            <p className="text-3xl font-bold text-[#14213F]">
              {quizDone} <span className="text-sm font-normal text-gray-400">/ {totalChapters} บท</span>
            </p>
          </div>
          <div className="w-10 h-10 bg-[#22C55E] rounded-xl"></div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E3E6F0] flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Lab</p>
            <p className="text-3xl font-bold text-[#14213F]">
              {labDone} <span className="text-sm font-normal text-gray-400">/ {totalChapters} บท</span>
            </p>
          </div>
          <div className="w-10 h-10 bg-[#2563EB] rounded-xl"></div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E3E6F0] flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">ยังไม่เสร็จ</p>
            <p className="text-3xl font-bold text-[#14213F]">{pending}</p>
          </div>
          <div className="w-10 h-10 bg-[#D97706] rounded-xl"></div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E3E6F0]">
        <div className="flex justify-end mb-6">
          <div className="relative">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none bg-white border border-[#E3E6F0] text-gray-700 py-2 pl-4 pr-10 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer outline-none"
            >
              {/* 👇 เอา all ออก เหลือแค่ กลางภาค/ปลายภาค */}
              <option value="midterm">เฉพาะกลางภาค</option>
              <option value="final">เฉพาะปลายภาค</option>
            </select>
            <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        {/* กราฟแท่ง + แกน Y */}
        <div className="flex gap-2 mt-8 h-72">
          {/* Y-Axis */}
          <div className="flex flex-col justify-between text-[11px] text-gray-400 pb-8 text-right w-6">
            {[100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0].map(v => <span key={v}>{v}</span>)}
          </div>

          {/* กราฟ */}
          <div className="flex-1 relative border-l border-b border-gray-300">
            {/* เส้นกริดพื้นหลัง */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-0 z-0">
              {[...Array(11)].map((_, i) => (
                <div key={i} className="w-full border-t border-gray-100" />
              ))}
            </div>

            {/* แท่งกราฟข้อมูลจริง */}
            <div className="absolute inset-0 flex items-end justify-around px-2 z-10 pb-0">
              {chapters.length === 0 ? (
                <div className="w-full text-center text-gray-400 pb-10">ไม่มีข้อมูลบทเรียน</div>
              ) : (
                chapters.map((ch: any, idx: number) => {
                  // คำนวณ % ความสูง (ถ้าคะแนนเป็น null ให้เป็น 0)
                  const qPct = ch.quiz_total ? ((ch.quiz_score || 0) / ch.quiz_total) * 100 : 0;
                  const lPct = ch.lab_max_score ? ((ch.lab_score || 0) / ch.lab_max_score) * 100 : 0;
                  
                  return (
                    <div key={`${ch.chapter_id}-${idx}`} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group relative">
                      <div className="flex items-end gap-1.5 w-full justify-center h-full">
                        {/* แท่ง Lab */}
                        <div 
                          className="w-full max-w-[20px] bg-[#2563EB] rounded-t-sm relative min-h-[2px]" 
                          style={{ height: `${lPct}%` }}
                        >
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black text-white text-[10px] py-1 px-2 rounded transition whitespace-nowrap z-20 pointer-events-none">
                            Lab: {ch.lab_score || 0}/{ch.lab_max_score || 0}
                          </div>
                        </div>
                        {/* แท่ง Quiz */}
                        <div 
                          className="w-full max-w-[20px] bg-[#22C55E] rounded-t-sm relative min-h-[2px]" 
                          style={{ height: `${qPct}%` }}
                        >
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black text-white text-[10px] py-1 px-2 rounded transition whitespace-nowrap z-20 pointer-events-none">
                            Quiz: {ch.quiz_score || 0}/{ch.quiz_total || 0}
                          </div>
                        </div>
                      </div>
                      
                      {/* ชื่อบท */}
                      <div className="text-center h-8">
                        <p className="text-[11px] font-semibold text-gray-700 whitespace-nowrap">บทที่ {ch.chapter_no}</p>
                        <p className="text-[9px] text-gray-400">Lab / Quiz</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <div className="w-3 h-3 bg-[#2563EB] rounded-sm"></div> Lab
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <div className="w-3 h-3 bg-[#22C55E] rounded-sm"></div> Quiz
          </div>
        </div>
      </div>
    </div>
  );
}