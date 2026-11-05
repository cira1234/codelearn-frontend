"use client";

import { useRef, useState } from "react";
import { FolderOpen, Sparkles, Upload, X } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function TrainAiPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  function showMessage(text: string, error: boolean) {
    setMessage(text);
    setIsError(error);
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFiles([...files, ...Array.from(list)]);
  }

  function removeFile(index: number) {
    setFiles(files.filter((_, i) => i !== index));
  }

  async function submit() {
    if (files.length === 0) {
      showMessage("กรุณาเลือกไฟล์ PDF", true);
      return;
    }
    const body = new FormData();
    files.forEach((f) => body.append("files", f));

    const res = await fetch(`${API}/admin/train-ai/upload`, { method: "POST", body });
    const json = await res.json();
    if (json.success) {
      showMessage(`เพิ่มเอกสารสำเร็จ ${json.count} ไฟล์`, false);
      setFiles([]);
    } else {
      showMessage(json.error ?? "อัปโหลดไม่สำเร็จ", true);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-8 pt-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold">Upload PDF for Train Ai</h1>
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
          addFiles(e.dataTransfer.files);
        }}
        className={`mx-auto flex w-full max-w-[740px] flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center ${
          dragging ? "border-[#2563EB] bg-[#F1F3FD]" : "border-[#C9CCE6] bg-white"
        }`}
      >
        <Upload size={36} className="text-[#2563EB]" />
        <p className="text-lg font-semibold">Drag &amp; Drop your PDFs here</p>
        <p className="text-xs text-gray-500">
          Supported formats: .pdf. Max file size: 50MB per document.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 rounded-lg bg-[#0B3FA6] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2563EB]"
        >
          <FolderOpen size={16} />
          Browse Files
        </button>
      </div>

      {files.length > 0 && (
        <ul className="mx-auto flex w-full max-w-[740px] flex-col gap-2">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center justify-between rounded-lg border border-[#E3E6F0] bg-white px-4 py-2 text-sm"
            >
              <span>
                {f.name} ({(f.size / 1024 / 1024).toFixed(1)} MB)
              </span>
              <button type="button" onClick={() => removeFile(i)} className="text-gray-500 hover:text-red-600">
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {message && (
        <p className={`mx-auto w-full max-w-[740px] text-sm ${isError ? "text-red-600" : "text-green-600"}`}>
          {message}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        className="mx-auto flex w-full max-w-[740px] items-center justify-center gap-2 rounded-lg border border-[#93B4F5] bg-[#C7D8F8] py-3 text-sm font-semibold text-[#0B3FA6] hover:bg-[#B3C9F5]"
      >
        <Sparkles size={16} />
        เพิ่มเอกสารให้ Ai
      </button>
    </div>
  );
}