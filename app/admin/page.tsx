"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, ChangeEvent, useRef } from "react";
import { createClient } from '@supabase/supabase-js';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction
} from "@/components/ui/alert-dialog";
import { fetchImages, addImage, updateImage, deleteImage, fetchImageDetails, addImageDetail, deleteImageDetail } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Editor from "@/components/admin/Editor";
import { Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// 타입 정의 추가
interface ImageRow {
  id: string;
  name: string;
  description: string;
  date: string | null;
  category: string;
  file_name: string;
  created_at: string;
}

function getErrorMessage(error: unknown) {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && "message" in error) return (error as any).message;
  return JSON.stringify(error);
}

export default function AdminPage() {
  const [images, setImages] = useState<ImageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ImageRow | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [form, setForm] = useState<any>({ name: "", description: "", date: "", category: "", file: null });
  const [detailFiles, setDetailFiles] = useState<{file: File, status: 'uploading' | 'done' | 'error', url?: string, supabaseName?: string}[]>([]);
  const [detailImages, setDetailImages] = useState<{ id: string; image_id: string; file_name: string; order?: number; created_at: string }[]>([]);
  // 대표 이미지 URL을 관리하는 state 추가
  const [mainImageUrls, setMainImageUrls] = useState<{ [id: string]: string }>({});
  // 상세 이미지 URL을 관리하는 state 추가
  const [detailImageUrls, setDetailImageUrls] = useState<{ [id: string]: string }>({});
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTag, setEditTag] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editThumbnail, setEditThumbnail] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editDateObj, setEditDateObj] = useState<Date | undefined>(editDate ? new Date(editDate) : new Date());
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(newsletters.length / pageSize);
  const pagedNewsletters = newsletters.slice((page - 1) * pageSize, page * pageSize);

  const getImageUrl = useCallback((file_name: string) => {
    if (!file_name) return "";
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    return supabase.storage.from("images").getPublicUrl(file_name).data.publicUrl;
  }, []);

  useEffect(() => {
    const urls: { [id: string]: string } = {};
    images.forEach((img) => {
      if (img.file_name) {
        urls[img.id] = getImageUrl(img.file_name);
      }
    });
    setMainImageUrls(urls);
  }, [images, getImageUrl]);

  useEffect(() => {
    const urls: { [id: string]: string } = {};
    detailImages.forEach((d) => {
      if (d.file_name) {
        urls[d.id] = getImageUrl(d.file_name);
      }
    });
    setDetailImageUrls(urls);
  }, [detailImages, getImageUrl]);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    loadImages(supabase);
  }, []);

  const fetchNewsletters = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("newsletters").select("*").order("date", { ascending: false });
    if (error) {
      alert('에러: ' + getErrorMessage(error));
      console.error('에러:', error);
      setLoading(false);
      return;
    }
    setNewsletters(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNewsletters();
  }, [fetchNewsletters]);

  // 목록 불러오기
  async function loadImages(supabase: any) {
    setLoading(true);
    const data = await fetchImages(supabase);
    setImages(data);
    setLoading(false);
  }

  // 상세 이미지 불러오기
  async function loadDetailImages(supabase: any, image_id: string) {
    const data = await fetchImageDetails(supabase, image_id);
    setDetailImages(data);
  }

  // 등록/수정 모달 열기
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function openModal(image?: any) {
    if (image) {
      setEditTarget(image);
      setForm({
        name: image.name,
        description: image.description,
        date: image.date,
        category: image.category,
        file: null,
      });
      loadDetailImages(createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ), image.id);
    } else {
      setEditTarget(null);
      setForm({ name: "", description: "", date: "", category: "", file: null });
      setDetailImages([]);
    }
    setDetailFiles([]);
    setModalOpen(true);
  }

  // 등록/수정 저장
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleSave() {
    setLoading(true);
    try {
      let file_name = editTarget?.file_name;
      // 대표 이미지 업로드
      if (form.file) {
        const filename = `${Date.now()}-${form.file.name}`;
        const { error: uploadError } = await createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        ).storage.from("images").upload(filename, form.file);
        if (uploadError) throw uploadError;
        file_name = filename;
      }
      // date가 공란이면 undefined로 변환
      const safeDate = form.date === "" ? undefined : form.date;
      let imageRow;
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      if (editTarget) {
        imageRow = await updateImage(supabase, editTarget.id, { name: form.name, description: form.description, date: safeDate, category: form.category, file_name });
      } else {
        imageRow = await addImage(supabase, { name: form.name, description: form.description, date: safeDate, category: form.category, file_name: file_name ?? "" });
      }
      // 상세 이미지 업로드
      for (const df of detailFiles) {
        if (df.status === 'done' && df.supabaseName) {
          await addImageDetail(supabase, { image_id: imageRow.id, file_name: df.supabaseName as string });
        }
      }
      setModalOpen(false);
      setForm({ name: "", description: "", date: "", category: "", file: null });
      setDetailFiles([]);
      loadImages(supabase);
    } catch (error) {
      alert('에러: ' + getErrorMessage(error));
      console.error('에러:', error);
    }
    setLoading(false);
  }

  // 삭제
  async function handleDelete(image: ImageRow) {
    setLoading(true);
    try {
      await deleteImage(createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ), image.id);
      loadImages(createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ));
    } catch (error) {
      alert('에러: ' + getErrorMessage(error));
      console.error('에러:', error);
    }
    setLoading(false);
  }

  // 상세 이미지 삭제
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleDeleteDetail(id: any) {
    setLoading(true);
    try {
      await deleteImageDetail(createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ), id);
      if (editTarget) loadDetailImages(createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ), editTarget.id);
    } catch (error) {
      alert('에러: ' + getErrorMessage(error));
      console.error('에러:', error);
    }
    setLoading(false);
  }

  // 파일 업로드 함수
  async function uploadDetailFile(f: File) {
    const filename = `${Date.now()}-${f.name}`;
    setDetailFiles(prev => prev.map(df => df.file === f ? { ...df, status: 'uploading' } : df));
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await supabase.storage.from("images").upload(filename, f);
    if (error) {
      setDetailFiles(prev => prev.map(df => df.file === f ? { ...df, status: 'error' } : df));
    } else {
      const url = supabase.storage.from("images").getPublicUrl(filename).data.publicUrl;
      setDetailFiles(prev => prev.map(df => df.file === f ? { ...df, status: 'done', url, supabaseName: filename } : df));
    }
  }

  // 파일 선택 시 즉시 업로드
  function handleDetailFilesChange(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files);
    setDetailFiles(prev => [
      ...prev,
      ...arr.map(f => ({ file: f, status: 'uploading' as const }))
    ]);
    arr.forEach(f => uploadDetailFile(f));
  }

  // 삭제 핸들러
  async function handleDeleteUploadedImage(df: {file: File, status: string, url?: string, supabaseName?: string}) {
    if (df.supabaseName) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      await supabase.storage.from("images").remove([df.supabaseName]);
    }
    setDetailFiles(prev => prev.filter(f => f.file !== df.file));
  }

  const handleEditOpen = (item: any) => {
    setEditId(item.id);
    setEditTitle(item.title);
    setEditContent(item.content);
    setEditTag(item.tag);
    setEditAuthor(item.author);
    setEditDate(item.date);
    setEditThumbnail(item.thumbnail);
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editId) return;
    setLoading(true);
    const { error } = await supabase.from("newsletters").update({
      title: editTitle,
      content: editContent,
      tag: editTag,
      author: editAuthor,
      date: editDate,
      thumbnail: editThumbnail,
    }).eq("id", editId);
    setLoading(false);
    setEditOpen(false);
    if (error) {
      alert('에러: ' + getErrorMessage(error));
      console.error('에러:', error);
    } else fetchNewsletters();
  };

  const handleDeleteNewsletter = async (id: string) => {
    setLoading(true);
    const { error } = await supabase.from("newsletters").delete().eq("id", id);
    setLoading(false);
    if (error) {
      alert('에러: ' + getErrorMessage(error));
      console.error('에러:', error);
    } else fetchNewsletters();
  };

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
      alert('썸네일 업로드 실패: ' + getErrorMessage(error));
      setLoading(false);
      return;
    }
    const { data: publicUrlData } = supabase.storage.from('thumbnails').getPublicUrl(fileName);
    setEditThumbnail(publicUrlData?.publicUrl || '');
    setLoading(false);
  };

  const handleDeleteEditThumbnail = async () => {
    if (!editThumbnail) return;
    const fileName = editThumbnail.split('/').pop();
    await supabase.storage.from('thumbnails').remove([fileName]);
    setEditThumbnail("");
  };

  useEffect(() => {
    setEditDateObj(editDate ? new Date(editDate) : new Date());
  }, [editDate]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* 헤더 우측 상단에 다크모드 토글 */}
      <div className="w-full flex justify-end p-4">
        <ThemeToggle />
      </div>
      <main className="min-h-screen flex flex-col items-center py-12 bg-background">
        <div className="w-full max-w-2xl flex flex-col gap-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">뉴스레터 관리</h1>
            <Button asChild>
              <Link href="/admin/new">새 글 작성</Link>
            </Button>
          </div>
          {loading ? (
            <div>로딩 중...</div>
          ) : newsletters.length === 0 ? (
            <div>등록된 뉴스레터가 없습니다.</div>
          ) :
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>제목</TableHead>
                    <TableHead>작성자</TableHead>
                    <TableHead>태그</TableHead>
                    <TableHead>날짜</TableHead>
                    <TableHead>액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedNewsletters.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>{item.author}</TableCell>
                      <TableCell>{item.tag}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>
                        {/* 수정 버튼 */}
                        <Dialog open={editOpen && editId === item.id} onOpenChange={setEditOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleEditOpen(item)}>수정</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>뉴스레터 수정</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-2">
                              <Label>제목</Label>
                              <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                              <Label>본문</Label>
                              <Editor value={editContent} onChange={setEditContent} />
                              <Label>태그</Label>
                              <Input value={editTag} onChange={e => setEditTag(e.target.value)} />
                              <Label>작성자</Label>
                              <Input value={editAuthor} onChange={e => setEditAuthor(e.target.value)} />
                              <Label>썸네일</Label>
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
                              {editThumbnail && (
                                <div className="flex items-center gap-2 mt-2">
                                  <img src={editThumbnail} alt="썸네일 미리보기" className="w-32 h-24 object-cover rounded border" />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleDeleteEditThumbnail}
                                    aria-label="썸네일 삭제"
                                  >
                                    <Trash2 className="w-5 h-5 text-destructive" />
                                  </Button>
                                </div>
                              )}
                              <Label>날짜</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !editDateObj && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {editDateObj ? format(editDateObj, "yyyy-MM-dd") : <span>날짜 선택</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={editDateObj}
                                    onSelect={d => {
                                      setEditDateObj(d);
                                      setEditDate(d ? d.toISOString().slice(0, 10) : "");
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <DialogFooter>
                              <Button onClick={handleUpdate}>저장</Button>
                              <DialogClose asChild>
                                <Button variant="outline">취소</Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        {/* 삭제 버튼 */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="ml-2">삭제</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteNewsletter(item.id)}>삭제</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* 페이지네이션 */}
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i}
                    variant={page === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
            </>
          }
        </div>
      </main>
    </div>
  );
} 