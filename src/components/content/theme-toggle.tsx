"use client";

import { Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  return (
    <Button
      variant="ghost"
      size="icon"
      disabled
      aria-label="Modo oscuro"
    >
      <Moon className="h-4 w-4" />
    </Button>
  );
}
