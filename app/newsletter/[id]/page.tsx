"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function NewsletterDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const [newsletter, setNewsletter] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNewsletter() {
      setLoading(true);
      const { data, error } = await supabase.from("newsletters").select("*").eq("id", id).single();
      if (!error) setNewsletter(data);
      setLoading(false);
    }
    if (id) fetchNewsletter();
  }, [id]);

  if (loading) return <div className="py-12 text-center">로딩 중...</div>;
  if (!newsletter) return <div>뉴스레터를 찾을 수 없습니다.</div>;

  // 본문 1/3만 공개 (HTML 파싱)
  const contentLines = (newsletter.content || "").split(/<br\s*\/?>|\n/);
  const previewCount = Math.ceil(contentLines.length / 3);
  const previewHtml = contentLines.slice(0, previewCount).join("<br>");
  const hiddenHtml = contentLines.slice(previewCount).join("<br>");

  return (
    <main className="min-h-screen flex flex-col items-center py-12 bg-background">
      <Card className="max-w-2xl w-full flex flex-col gap-6">
        <CardContent className="p-8 relative">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">{newsletter.tag}</span>
            <span className="text-xs text-muted-foreground">{newsletter.date}</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">{newsletter.title}</h1>
          <div className="text-sm text-muted-foreground mb-4">by {newsletter.author}</div>
          <div className="text-base mb-4" dangerouslySetInnerHTML={{ __html: previewHtml }} />
          {/* 나머지 본문: 로그인 필요 */}
          <div className="relative">
            <div className={`text-base transition-all duration-300 ${showAll ? "blur-none" : "blur-sm select-none pointer-events-none"}`} style={{ minHeight: 200 }} dangerouslySetInnerHTML={{ __html: hiddenHtml }} />
            {!showAll && (
              <div className="absolute left-0 top-0 w-full h-full flex flex-col items-center justify-center bg-background/80 min-h-[200px] sm:min-h-[240px] p-6 z-10 pointer-events-auto overflow-hidden" style={{ boxSizing: 'border-box', borderRadius: 16 }}>
                <div className="mb-4 text-center text-muted-foreground text-base">전체 내용을 보려면 로그인하세요.</div>
                <Button onClick={() => router.push("/login")}>로그인</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
} 