"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function BackButton({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={() => router.back()}
      type="button"
    >
      <ArrowRight className="size-4" />
      <span className="me-1">برگشت</span>
    </Button>
  );
}
