"use client";

import { useEffect } from "react";
import { ensureDashboardSession } from "@/lib/research-persistence";

export function DashboardSession() {
  useEffect(() => {
    void ensureDashboardSession().catch(() => {});
  }, []);

  return null;
}
