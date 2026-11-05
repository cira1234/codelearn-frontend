"use client";

import { Suspense } from "react";
import TopbarTL from "./TopbarTeacher";
import SidebarTeacherLead from "./SidebarTeacher";

export default function DashboardShellTL({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white">
      <Suspense fallback={null}>
    <SidebarTeacherLead />
      </Suspense>
      <div className="flex flex-1 flex-col">
        <Suspense fallback={null}>
          <TopbarTL />
        </Suspense>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}