"use client";

import { useEffect, useRef, useState } from "react";
import { FolderOpen, Link2, Save, Upload } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const box =
  "w-full rounded-lg border border-[#E3E6F0] bg-white px-4 py-3 text-sm outline-none focus:border-[#2563EB]";

type Term = { id_term: number; term: string };
type Chapter = {
  id: number;
  chapter_no: number;
  title: string;
  section_name: string;
};

export default function UploadFilePage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [term, setTerm] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetch(`${API}/admin/terms`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setTerms(json.data);
      });
    fetch(`${API}/admin/chapter-options`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setChapters(json.data);
      });
  }, []);

  function showMessage(text: string, error: boolean) {
    setMessage(text);
    setIsError(error);
  }

  async function submit() {
    if (!chapterId) {
      showMessage("กรุณาเลือกเทอมและบท", true);
      return;
    }
    if (!file) {
      showMessage("กรุณาเลือกไฟล์ PDF", true);
      return;
    }
    const body = new FormData();
    body.append("chapter_id", chapterId);
    body.append("video_url", videoUrl);
    body.append("file", file);

    const res = await fetch(`${API}/admin/upload-file`, { method: "POST", body });
    const json = await res.json();
    if (json.success) {
      showMessage("บันทึกสำเร็จ", false);
      setFile(null);
      setVideoUrl("");
    } else {
      showMessage(json.error ?? "บันทึกไม่สำเร็จ", true);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-8 pt-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold">Upload &amp; Process</h1>
        <p className="mt-1 text-sm text-gray-600">Add documents to your library</p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const dropped = e.dataTransfer.files[0];
          if (dropped) setFile(dropped);
        }}
        className={`flex flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center ${
          dragging ? "border-[#2563EB] bg-[#F1F3FD]" : "border-[#C9CCE6] bg-white"
        }`}
      >
        <Upload size={36} className="text-[#2563EB]" />
        <p className="text-lg font-semibold">Drag &amp; Drop your PDF here</p>
        <p className="text-xs text-gray-500">
          Supported formats: .pdf. Max file size: 50MB per document.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 rounded-lg bg-[#0B3FA6] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2563EB]"
        >
          <FolderOpen size={16} />
          Browse Files
        </button>
        {file && (
          <p className="text-sm font-medium">
            {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
          </p>
        )}
      </div>

      <div className="relative">
        <Link2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className={`${box} pl-10`}
          placeholder="Video URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
      </div>

      <select className={box} value={term} onChange={(e) => setTerm(e.target.value)}>
        <option value="">เลือกเทอม</option>
        {terms.map((t) => (
          <option key={t.id_term} value={t.term}>
            {t.term}
          </option>
        ))}
      </select>

      <select className={box} value={chapterId} onChange={(e) => setChapterId(e.target.value)}>
        <option value="">เลือกบท</option>
        {chapters.map((c) => (
          <option key={c.id} value={c.id}>
            {c.section_name} · บทที่ {c.chapter_no} {c.title}
          </option>
        ))}
      </select>

      {message && (
        <p className={`text-sm ${isError ? "text-red-600" : "text-green-600"}`}>{message}</p>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={submit}
          className="flex w-[320px] items-center justify-center gap-2 rounded-lg bg-[#0B3FA6] py-3 text-sm font-semibold text-white hover:bg-[#2563EB]"
        >
          <Save size={16} />
          บันทึก
        </button>
      </div>
    </div>
  );
}