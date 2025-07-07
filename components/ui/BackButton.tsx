"use client";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function BackButton({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname === "/") return null;
  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="뒤로가기"
      onClick={() => router.back()}
      className={className}
    >
      <ArrowLeft className="w-5 h-5" />
    </Button>
  );
} 