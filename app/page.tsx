"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Page() {
  const [year, setYear] = useState<number | null>(null);
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(newsletters.length / pageSize);
  const pagedNewsletters = newsletters.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    async function fetchNewsletters() {
      setLoading(true);
      const { data, error } = await supabase.from("newsletters").select("*").order("date", { ascending: false });
      if (!error) setNewsletters(data || []);
      setLoading(false);
    }
    fetchNewsletters();
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Hero Section */}
      <section className="w-full py-20 bg-background flex flex-col items-center text-center relative">
        <h1 className="text-4xl font-bold mb-4">최신 트렌드 뉴스레터</h1>
        <p className="text-lg text-muted-foreground mb-6">IT, 디자인, 개발, AI 등 다양한 분야의 인사이트를 한눈에!</p>
        <Button asChild size="lg">
          <Link href="#newsletter-list">최신 뉴스레터 보기</Link>
        </Button>
      </section>

      {/* Newsletter List Section */}
      <section id="newsletter-list" className="max-w-3xl w-full mx-auto py-12 flex-1 bg-background">
        <h2 className="text-2xl font-semibold mb-8">최신 뉴스레터</h2>
        {loading ? (
          <div>로딩 중...</div>
        ) : (
          <>
            <div className="grid gap-6">
              {pagedNewsletters.map((item) => (
                <Card
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-6 p-4 items-stretch rounded-xl border shadow-sm max-w-full cursor-pointer hover:bg-accent/30 transition"
                  onClick={() => router.push(`/newsletter/${item.id}`)}
                >
                  {/* 썸네일 */}
                  <div className="flex-shrink-0 max-w-[120px] w-full">
                    <AspectRatio ratio={4 / 3} className="bg-muted rounded-lg overflow-hidden border">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="object-cover w-full h-full"
                      />
                    </AspectRatio>
                  </div>
                  {/* 정보 영역 */}
                  <div className="flex flex-col flex-1 gap-2 min-w-0 justify-center">
                    <div className="flex items-center gap-2">
                      <Badge>{item.tag}</Badge>
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                    </div>
                    <div className="text-lg font-semibold hover:underline truncate">
                      {item.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">{item.author}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            {/* shadcn Pagination */}
            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        setPage(p => Math.max(1, p - 1));
                      }}
                      aria-disabled={page === 1}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        isActive={page === i + 1}
                        onClick={e => {
                          e.preventDefault();
                          setPage(i + 1);
                        }}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        setPage(p => Math.min(totalPages, p + 1));
                      }}
                      aria-disabled={page === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </section>

      {/* Footer Section */}
      <footer className="w-full py-8 border-t text-center text-muted-foreground text-sm">
        &copy; {year ?? ""} 뉴스레터 사이트. All rights reserved.
      </footer>
    </main>
  );
}
