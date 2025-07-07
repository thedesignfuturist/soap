"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Image from "@tiptap/extension-image";
import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List as ListIcon,
  ListOrdered,
  Image as ImageIcon,
  Link as LinkIcon
} from "lucide-react";

export default function Editor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      Heading.configure({ levels: [1, 2, 3] }),
      Link,
      BulletList,
      OrderedList,
      ListItem,
      Image,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // 이미지 업로드 핸들러
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const fileExt = file.name.split('.').pop();
    const fileName = `editor-${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('editor-images').upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) {
      alert('이미지 업로드 실패: ' + error.message);
      return;
    }
    const { data: publicUrlData } = supabase.storage.from('editor-images').getPublicUrl(fileName);
    if (publicUrlData?.publicUrl) {
      editor.chain().focus().setImage({ src: publicUrlData.publicUrl }).run();
    }
  };

  return (
    <div>
      {/* 툴바 */}
      <div className="flex flex-wrap gap-1 mb-2 border rounded-lg bg-muted p-2">
        <Button variant="ghost" size="icon" aria-label="굵게" onClick={() => editor?.chain().focus().toggleBold().run()} className={editor?.isActive('bold') ? 'bg-accent text-primary' : ''}>
          <BoldIcon className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="기울임" onClick={() => editor?.chain().focus().toggleItalic().run()} className={editor?.isActive('italic') ? 'bg-accent text-primary' : ''}>
          <ItalicIcon className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="밑줄" onClick={() => editor?.chain().focus().toggleUnderline().run()} className={editor?.isActive('underline') ? 'bg-accent text-primary' : ''}>
          <UnderlineIcon className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="제목1" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className={editor?.isActive('heading', { level: 1 }) ? 'bg-accent text-primary' : ''}>
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="제목2" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={editor?.isActive('heading', { level: 2 }) ? 'bg-accent text-primary' : ''}>
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="제목3" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} className={editor?.isActive('heading', { level: 3 }) ? 'bg-accent text-primary' : ''}>
          <Heading3 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="글머리 기호" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={editor?.isActive('bulletList') ? 'bg-accent text-primary' : ''}>
          <ListIcon className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="번호 매기기" onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={editor?.isActive('orderedList') ? 'bg-accent text-primary' : ''}>
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="이미지" onClick={() => fileInputRef.current?.click()}>
          <ImageIcon className="w-4 h-4" />
        </Button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
        <Button variant="ghost" size="icon" aria-label="링크" onClick={() => {
          const url = prompt('링크 주소 입력:');
          if (url) editor?.chain().focus().setLink({ href: url }).run();
        }}>
          <LinkIcon className="w-4 h-4" />
        </Button>
      </div>
      <div className="border rounded min-h-[200px] bg-card">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
} 