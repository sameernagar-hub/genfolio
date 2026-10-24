"use client";

import type { ReactNode } from "react";
import { askAssistant } from "./ui";

export function AskButton({ children, prompt, className }: { children: ReactNode; prompt?: string; className?: string }) {
  return (
    <button onClick={() => askAssistant(prompt)} className={className}>
      {children}
    </button>
  );
}
