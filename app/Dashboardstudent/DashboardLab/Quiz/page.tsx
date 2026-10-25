"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function QuizContent() {
  const chapterId = useSearchParams().get("chapterId");
  return <p className="text-gray-600">Quiz ของบท id: {chapterId}</p>;
}

export default function QuizPage() {
  return (
    <Suspense fallback={<p className="text-gray-500">กำลังโหลด...</p>}>
      <QuizContent />
    </Suspense>
  );
}