"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CloudDownload } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Slide = { slide_id: number; title: string; file_name: string };

function SlideContent() {
  const chapterId = useSearchParams().get("chapterId");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!chapterId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${API}/chapters/${chapterId}/slides`, { credentials: "include" })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setSlides(json.slides);
        else setError(json.error ?? "โหลดสไลด์ไม่สำเร็จ");
      })
      .catch(() => setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้"))
      .finally(() => setLoading(false));
  }, [chapterId]);

  if (!chapterId) return <p className="text-gray-500">ไม่พบรหัสบทเรียน</p>;
  if (loading) return <p className="text-gray-500">กำลังโหลด...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (slides.length === 0)
    return <p className="text-gray-500">บทนี้ยังไม่มีสไลด์</p>;

  const slide = slides[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
{/* <h2 className="text-2xl font-semibold text-gray-800">{slide.title}</h2> */}
        {/* <a
          href={`${API}/slides/${slide.slide_id}/file?download=1`}
          className="flex items-center gap-2 rounded-lg bg-[#0B3FA6] px-4 py-2 text-sm font-medium text-white hover:bg-[#2563EB]"
        >
          Download
          <CloudDownload size={18} />
        </a> */}
      </div>

      <iframe
        src={`${API}/slides/${slide.slide_id}/file`}
        title={slide.title}
        className="h-[calc(100vh-170px)] w-full rounded-lg border border-[#E3E6F0]"
      />
    </div>
  );
}

export default function SlidePage() {
  return (
    <Suspense fallback={<p className="p-6 text-gray-500">กำลังโหลด...</p>}>
      <SlideContent />
    </Suspense>
  );
}