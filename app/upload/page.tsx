"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { TYPES } from "@/lib/constants";

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>("");
  const [subjectId, setSubjectId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [subjects, setSubjects] = useState<{id:string; name:string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Load subjects from Supabase (expects subjects seeded)
    (async () => {
      const { data } = await supabase.from("subjects").select("id,name").order("name");
      setSubjects(data || []);
    })();
  }, []);

  const onSubmit = async () => {
    setMessage(null);
    if (!file || !title || !type || !subjectId) {
      setMessage("Please fill title, type, subject and choose a file.");
      return;
    }
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setLoading(false);
      setMessage("Please login before uploading.");
      return;
    }

    const ext = file.name.split(".").pop();
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage.from("resources").upload(path, file, {
      upsert: false,
      cacheControl: "3600",
    });
    if (upErr) {
      setLoading(false);
      setMessage(`Upload failed: ${upErr.message}`);
      return;
    }

    const { error: insErr } = await supabase.from("resources").insert({
      subject_id: subjectId,
      type,
      title,
      description,
      file_path: path,
      status: "pending",
    });

    setLoading(false);
    if (insErr) setMessage(`Saved file but DB insert failed: ${insErr.message}`);
    else {
      setMessage("Uploaded successfully. Waiting for admin approval.");
      setTitle(""); setDescription(""); setType(""); setSubjectId(""); setFile(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Upload Resource</h1>
      <p className="text-sm text-slate-600 mt-1">Students, Faculty, and Admin can upload. All uploads require Admin approval before public visibility.</p>

      <div className="mt-6 grid gap-4">
        <Input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <Textarea placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              {TYPES.map(t=> <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={subjectId} onValueChange={setSubjectId}>
            <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
            <SelectContent>
              {subjects.map(s=> <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <input type="file" onChange={(e)=>setFile(e.target.files?.[0] || null)} />
        <Button disabled={loading} onClick={onSubmit}>{loading? "Uploading..." : "Submit"}</Button>
        {message && <p className="text-sm">{message}</p>}
      </div>
    </div>
  );
}
