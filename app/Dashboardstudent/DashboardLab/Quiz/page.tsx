"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, XCircle } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const IMAGE_BASE = `${API}/uploads/quiz`;

type Choice = { key: string; value: string };
type Q = {
  question_id: number;
  question: string;
  choice_type: "text" | "image";
  image_file: string | null;
  choices: Choice[];
};
type Item = {
  question_id: number;
  chosen: string;
  correct: string;
  is_correct: boolean;
  explanation: string | null;
  explanation_wrong: string | null;
};
type Result = { score: number; total: number; items: Item[] };

// ตรวจรายตัวเลือกว่าเป็นชื่อไฟล์รูปไหม (ไม่พึ่ง choice_type อย่างเดียว)
const IMG_RE = /\.(jpe?g|png|webp|gif)$/i;
const isImageValue = (v: string) => IMG_RE.test((v ?? "").trim());

function QImage({
  file,
  alt,
  className,
  onOpen,
}: {
  file: string;
  alt: string;
  className: string;
  onOpen?: (url: string) => void;
}) {
  const [failed, setFailed] = useState(false);
  const url = `${IMAGE_BASE}/${file}`;
  if (failed)
    return <span className="break-all text-xs text-red-500">โหลดรูปไม่ได้: {url}</span>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      onError={() => setFailed(true)}
      onClick={
        onOpen
          ? (e) => {
              e.stopPropagation();
              onOpen(url);
            }
          : undefined
      }
      className={`${className} ${onOpen ? "cursor-zoom-in" : ""}`}
    />
  );
}

function QuizContent() {
  const chapterId = useSearchParams().get("chapterId");

  const [questions, setQuestions] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0); // 0..total-1 = ข้อ, total = หน้าตรวจทาน
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    if (!chapterId) {
      setLoading(false);
      setError("ไม่พบรหัสบท (chapterId)");
      return;
    }
    fetch(`${API}/quiz/chapter/${chapterId}`)
      .then((r) => r.json())
      .then((j) => {
        if (!j.success) return setError(j.error || "โหลดข้อสอบไม่สำเร็จ");
        setQuestions(j.data ?? []);
      })
      .catch(() => setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้"))
      .finally(() => setLoading(false));
  }, [chapterId]);
  useEffect(() => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      // รองรับทั้ง user_id และ id เผื่อใน localStorage เก็บชื่อต่างกัน
      setUserId(u.user_id || u.id);
    } catch (e) {}
  }
}, []);

  const total = questions.length;
  const q = questions[idx];
  const answered = Object.keys(answers).length;
  const onReview = idx === total; // หน้าตรวจทาน = ถัดจากข้อสุดท้าย 1
  const unanswered = questions
    .map((qq, i) => ({ qq, i }))
    .filter(({ qq }) => answers[qq.question_id] === undefined);

  async function submit() {
  if (unanswered.length > 0 && !confirm(`ยังไม่ได้ตอบอีก ${unanswered.length} ข้อ ส่งเลยไหม?`)) return;
  
  // 👇 ดักไว้ถ้าหา user ไม่เจอ
  if (!userId) {
    setError("ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่");
    return;
  }

  setSubmitting(true);
  setError("");
  try {
    const res = await fetch(`${API}/quiz/chapter/${chapterId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        user_id: userId, // 👈 เพิ่มบรรทัดนี้
        answers 
      }),
    });
    const j = await res.json();
    if (!j.success) return setError(j.error || "ส่งคำตอบไม่สำเร็จ");
    setResult(j);
  } catch {
    setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
  } finally {
    setSubmitting(false);
  }
}

  function retry() {
    setAnswers({});
    setResult(null);
    setIdx(0);
    setError("");
  }

  if (loading) return <p className="p-6 text-gray-500">กำลังโหลด...</p>;
  if (error && !result && total === 0) return <p className="p-6 text-red-500">{error}</p>;
  if (total === 0) return <p className="p-6 text-gray-500">บทนี้ยังไม่มีข้อสอบ</p>;

  const lightbox = zoom && (
    <div
      onClick={() => setZoom(null)}
      className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/70 p-6"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={zoom} alt="ขยายรูป" className="max-h-full max-w-full rounded-lg bg-white object-contain" />
    </div>
  );

  /* ---------- หน้าสรุปผลหลังส่ง ---------- */
  if (result) {
    const pct = result.total ? Math.round((result.score / result.total) * 100) : 0;
    return (
      <div className="mx-auto max-w-[760px] p-6">
        <div className="rounded-2xl border border-[#E3E6F0] border-l-4 border-l-[#2563EB] bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-500">ผลแบบทดสอบหลังเรียน</p>
          <p className="mt-2 text-5xl font-bold text-[#0B3FA6]">
            {result.score}
            <span className="text-2xl text-gray-400"> / {result.total}</span>
          </p>
          <p className="mt-1 text-sm text-gray-500">{pct}%</p>
          <button
            type="button"
            onClick={retry}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0B3FA6] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#093283] active:scale-[0.98]"
          >
            <RotateCcw size={16} />
            ทำใหม่อีกครั้ง
          </button>
        </div>

        <h2 className="mt-8 text-lg font-bold text-[#14213F]">ทบทวนคำตอบ</h2>
        <div className="mt-3 flex flex-col gap-4">
          {questions.map((qq, i) => {
            const it = result.items.find((x) => x.question_id === qq.question_id);
            if (!it) return null;
            const show = (k: string) => {
              const c = qq.choices.find((x) => x.key === k);
              if (!k || !c) return <b>{k ? k.toUpperCase() : "ไม่ได้ตอบ"}</b>;
              const asImg = qq.choice_type === "image" || isImageValue(c.value);
              return asImg ? (
                <span className="mt-1 flex items-center gap-2">
                  <b>{k.toUpperCase()}</b>
                  <QImage
                    file={c.value}
                    alt={`ตัวเลือก ${k.toUpperCase()}`}
                    onOpen={setZoom}
                    className="max-h-24 rounded border border-[#E3E6F0] object-contain"
                  />
                </span>
              ) : (
                <b>
                  {k.toUpperCase()}. {c.value}
                </b>
              );
            };
            return (
              <div key={qq.question_id} className="rounded-xl border border-[#E3E6F0] bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  {it.is_correct ? (
                    <CheckCircle2 className="mt-0.5 shrink-0 text-green-500" size={20} />
                  ) : (
                    <XCircle className="mt-0.5 shrink-0 text-red-500" size={20} />
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-[#14213F]">
                      ข้อ {i + 1}. {qq.question}
                    </p>
                    {qq.image_file && (
                      <QImage
                        file={qq.image_file}
                        alt="รูปประกอบโจทย์"
                        onOpen={setZoom}
                        className="mt-2 max-h-48 rounded-lg border border-[#E3E6F0] object-contain"
                      />
                    )}
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <div>คำตอบของคุณ: {show(it.chosen)}</div>
                      {!it.is_correct && <div className="text-green-600">เฉลย: {show(it.correct)}</div>}
                    </div>
                    {it.explanation && <p className="mt-2 text-sm text-[#14213F]">{it.explanation}</p>}
                    {!it.is_correct && it.explanation_wrong && (
                      <p className="mt-1 text-sm text-gray-500">{it.explanation_wrong}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {lightbox}
      </div>
    );
  }

  /* ---------- แถบชิปเลขข้อ (ใช้ร่วมกันทั้งหน้าทำข้อสอบและหน้าตรวจทาน) ---------- */
  const chips = (
    <div className="flex flex-wrap gap-2">
      {questions.map((qq, i) => {
        const current = i === idx;
        const done = answers[qq.question_id] !== undefined;
        return (
          <button
            key={qq.question_id}
            type="button"
            onClick={() => setIdx(i)}
            aria-label={`ไปข้อ ${i + 1}`}
            className={`h-9 w-9 rounded-lg border-2 text-sm font-semibold transition ${
              current
                ? "border-[#2563EB] bg-[#2563EB] text-white"
                : done
                ? "border-green-500 bg-green-500 text-white"
                : "border-[#2563EB] bg-white text-[#2563EB] hover:bg-[#EEF3FF]"
            }`}
          >
            {i + 1}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => setIdx(total)}
        aria-label="หน้าตรวจทาน"
        className={`flex h-9 w-9 items-center justify-center rounded-lg border-2 border-[#2563EB] transition ${
          onReview ? "bg-[#2563EB] text-white" : "bg-white text-[#2563EB] hover:bg-[#EEF3FF]"
        }`}
      >
        <CheckCircle2 size={16} />
      </button>
    </div>
  );

  /* ---------- หน้าตรวจทานก่อนส่ง (ถัดจากข้อสุดท้าย) ---------- */
  if (onReview) {
    return (
      <div className="mx-auto max-w-[760px] p-6">
        {chips}

        <div className="mt-5 rounded-2xl border border-[#E3E6F0] border-l-4 border-l-[#2563EB] bg-white p-7 shadow-sm">
          <span className="rounded bg-[#F0F1F6] px-2 py-0.5 text-xs text-gray-600">ตรวจทานก่อนส่ง</span>
          <h2 className="mt-4 text-lg font-bold text-[#14213F]">
            ตอบแล้ว {answered} จาก {total} ข้อ
          </h2>

          {unanswered.length > 0 ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-600">
                ยังไม่ได้ตอบ {unanswered.length} ข้อ (กดเลขข้อเพื่อกลับไปตอบ)
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {unanswered.map(({ qq, i }) => (
                  <button
                    key={qq.question_id}
                    type="button"
                    onClick={() => setIdx(i)}
                    className="h-9 w-9 rounded-lg border-2 border-red-400 bg-white text-sm font-semibold text-red-500 hover:bg-red-100"
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
              ตอบครบทุกข้อแล้ว พร้อมส่งคำตอบ
            </p>
          )}

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIdx(total - 1)}
              className="flex items-center gap-2 rounded-lg bg-[#0B3FA6] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#093283] active:scale-[0.98]"
            >
              <ArrowLeft size={16} />
              ข้อก่อนหน้า
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-700 active:scale-[0.98] disabled:opacity-60"
            >
              {submitting ? "กำลังส่ง..." : "ส่งคำตอบ"}
              <CheckCircle2 size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- หน้าทำข้อสอบทีละข้อ ---------- */
  const hasImageChoice = q.choice_type === "image" || q.choices.some((c) => isImageValue(c.value));

  return (
    <div className="mx-auto max-w-[760px] p-6">
      {chips}

      {/* แถบความคืบหน้า */}
      <div className="mt-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#E3E6F0]">
          <div
            className="h-full rounded-full bg-[#2563EB] transition-all"
            style={{ width: `${(answered / total) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-500">
          ตอบแล้ว {answered}/{total}
        </span>
      </div>

      {/* การ์ดคำถาม */}
      <div className="mt-5 rounded-2xl border border-[#E3E6F0] border-l-4 border-l-[#2563EB] bg-white p-7 shadow-sm">
        <span className="rounded bg-[#F0F1F6] px-2 py-0.5 text-xs text-gray-600">
          ข้อ {idx + 1} จาก {total}
          {hasImageChoice ? " · ตัวเลือกเป็นรูป" : ""}
        </span>
        <h2 className="mt-4 text-lg font-bold leading-relaxed text-[#14213F]">{q.question}</h2>

        {q.image_file && (
          <div className="mt-4">
            <QImage
              file={q.image_file}
              alt="รูปประกอบโจทย์"
              onOpen={setZoom}
              className="max-h-80 w-full rounded-lg border border-[#E3E6F0] object-contain"
            />
          </div>
        )}

        {q.choices.length === 0 ? (
          <p className="mt-6 rounded-lg border border-dashed border-red-300 bg-red-50 p-4 text-sm text-red-500">
            ข้อนี้ไม่มีตัวเลือก (choice_a-d ว่างในฐานข้อมูล)
          </p>
        ) : (
          <div
            className={`mt-6 ${
              hasImageChoice ? "grid grid-cols-1 gap-3 sm:grid-cols-2" : "flex flex-col gap-3"
            }`}
          >
            {q.choices.map((c) => {
              const selected = answers[q.question_id] === c.key;
              const asImage = q.choice_type === "image" || isImageValue(c.value);
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setAnswers((a) => ({ ...a, [q.question_id]: c.key }))}
                  className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm transition ${
                    selected
                      ? "border-[#2563EB] bg-[#EEF3FF] text-[#14213F]"
                      : "border-[#E3E6F0] bg-white text-[#14213F] hover:border-[#9DB7F5]"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      selected ? "bg-[#2563EB] text-white" : "bg-[#F0F1F6] text-gray-600"
                    }`}
                  >
                    {c.key.toUpperCase()}
                  </span>
                  {asImage ? (
                    <QImage
                      file={c.value}
                      alt={`ตัวเลือก ${c.key.toUpperCase()}`}
                      onOpen={setZoom}
                      className="max-h-44 w-full rounded border border-[#E3E6F0] bg-white object-contain"
                    />
                  ) : (
                    <span className="min-w-0 break-words">{c.value}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            className="flex items-center gap-2 rounded-lg bg-[#0B3FA6] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#093283] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft size={16} />
            ข้อก่อนหน้า
          </button>

          <button
            type="button"
            onClick={() => setIdx((i) => Math.min(total, i + 1))}
            className="flex items-center gap-2 rounded-lg bg-[#0B3FA6] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#093283] active:scale-[0.98]"
          >
            {idx === total - 1 ? "ตรวจทาน" : "ข้อถัดไป"}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {lightbox}
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<p className="p-6 text-gray-500">กำลังโหลด...</p>}>
      <QuizContent />
    </Suspense>
  );
}