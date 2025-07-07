"use client";
import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/admin/Editor"), { ssr: false });

export default function AdminNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [author, setAuthor] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

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
      date: new Date().toISOString().slice(0, 10),
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
            <input type="file" accept="image/*" className="mt-2" onChange={handleThumbnailUpload} />
            {thumbnail && (
              <img src={thumbnail} alt="썸네일 미리보기" className="mt-2 w-32 h-24 object-cover rounded border" />
            )}
          </div>
          <div>
            <Label>본문</Label>
            <Editor value={content} onChange={setContent} />
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading} className="mt-4">
          {loading ? "저장 중..." : "저장"}
        </Button>
      </Card>
    </main>
  );
} 