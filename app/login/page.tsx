"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/` // 로그인 후 메인으로 이동
      }
    });
    setLoading(false);
    if (error) alert("로그인 실패: " + error.message);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-xs p-8 rounded-xl border shadow-sm bg-card flex flex-col gap-6 items-center">
        <h1 className="text-2xl font-bold mb-4">로그인</h1>
        <Button
          variant="outline"
          size="lg"
          className="w-full flex items-center gap-2 justify-center"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <FcGoogle className="w-5 h-5" />
          구글로 로그인
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="w-full mt-2"
          onClick={() => router.push("/")}
        >
          취소
        </Button>
      </div>
    </main>
  );
} 