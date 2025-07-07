"use client";
import { useState, ChangeEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";
import { Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const Editor = dynamic(() => import("@/components/admin/Editor"), { ssr: false });

export default function AdminNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [author, setAuthor] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());

  // 썸네일 파일 업로드 핸들러
  const handleThumbnailUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage.from('thumbnails').upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) {
      alert('썸네일 업로드 실패: ' + error.message);
      setLoading(false);
      return;
    }
    // public URL 생성
    const { data: publicUrlData } = supabase.storage.from('thumbnails').getPublicUrl(fileName);
    setThumbnail(publicUrlData?.publicUrl || '');
    setLoading(false);
  };

  const handleDeleteThumbnail = async () => {
    if (!thumbnail) return;
    const fileName = thumbnail.split('/').pop();
    await supabase.storage.from('thumbnails').remove([fileName]);
    setThumbnail("");
  };

  const handleSave = async () => {
    if (!title || !author || !content) {
      alert("제목, 작성자, 본문을 모두 입력하세요.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("newsletters").insert({
      title,
      tag,
      author,
      thumbnail,
      content,
      date: date?.toISOString().slice(0, 10),
    });
    setLoading(false);
    if (error) {
      alert("저장 실패: " + error.message);
    } else {
      router.push("/admin");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center py-12 bg-background">
      <Card className="max-w-2xl w-full p-8 flex flex-col gap-6">
        <h1 className="text-2xl font-bold mb-4">새 뉴스레터 작성</h1>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="title">제목</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="tag">태그</Label>
            <Input id="tag" value={tag} onChange={e => setTag(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="author">작성자</Label>
            <Input id="author" value={author} onChange={e => setAuthor(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="thumbnail">썸네일(이미지 URL)</Label>
            <Input id="thumbnail" value={thumbnail} onChange={e => setThumbnail(e.target.value)} />
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                썸네일 업로드
              </Button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleThumbnailUpload}
              />
            </div>
            {thumbnail && (
              <div className="flex items-center gap-2 mt-2">
                <img src={thumbnail} alt="썸네일 미리보기" className="w-32 h-24 object-cover rounded border" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDeleteThumbnail}
                  aria-label="썸네일 삭제"
                >
                  <Trash2 className="w-5 h-5 text-destructive" />
                </Button>
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="date">날짜</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "yyyy-MM-dd") : <span>날짜 선택</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>본문</Label>
            <Editor value={content} onChange={setContent} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={() => router.back()} variant="outline">
            취소
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "저장 중..." : "저장"}
          </Button>
        </div>
      </Card>
    </main>
  );
} 