"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function AdminNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [author, setAuthor] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [loading, setLoading] = useState(false);
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
  });

  const handleSave = async () => {
    if (!title || !author || !editor?.getHTML()) {
      alert("제목, 작성자, 본문을 모두 입력하세요.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("newsletters").insert({
      title,
      tag,
      author,
      thumbnail,
      content: editor.getHTML(),
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
          </div>
          <div>
            <Label>본문</Label>
            <div className="border rounded min-h-[200px] bg-card">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading} className="mt-4">
          {loading ? "저장 중..." : "저장"}
        </Button>
      </Card>
    </main>
  );
} 