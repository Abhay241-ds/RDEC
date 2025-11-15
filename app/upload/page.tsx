"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { TYPES } from "@/lib/constants";

type Dept = { id: string; code: string; name: string };
type Sem = { id: string; number: number };
type Subj = { id: string; name: string; department_id: string; semester_id: string };

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>("");
  const [selectedDeptIds, setSelectedDeptIds] = useState<string[]>([]);
  const [selectedSemIds, setSelectedSemIds] = useState<string[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [semesters, setSemesters] = useState<Sem[]>([]);
  const [subjects, setSubjects] = useState<Subj[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: dpts }, { data: sems }, { data: subjs }] = await Promise.all([
        supabase.from("departments").select("id,code,name").order("code"),
        supabase.from("semesters").select("id,number").order("number"),
        supabase.from("subjects").select("id,name,department_id,semester_id").order("name"),
      ]);
      setDepartments(dpts || []);
      setSemesters(sems || []);
      setSubjects(subjs || []);
    })();
  }, []);

  const filteredSubjects = useMemo(() => {
    const deptSet = new Set(selectedDeptIds);
    const semSet = new Set(selectedSemIds);
    return subjects.filter(s =>
      (deptSet.size === 0 || deptSet.has(s.department_id)) &&
      (semSet.size === 0 || semSet.has(s.semester_id))
    );
  }, [subjects, selectedDeptIds, selectedSemIds]);

  const onSubmit = async () => {
    setMessage(null);
    const chosenSubjectIds = selectedSubjectIds.filter(id => filteredSubjects.some(s=>s.id===id));
    if (chosenSubjectIds.length === 0) { setMessage("Select at least one Subject."); return; }

    if (!file || !title || !type) {
      setMessage("Please fill Title, Type and choose a file.");
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

    // Create one resource row per selected subject
    const rows = chosenSubjectIds.map((sid)=>({
      subject_id: sid,
      type,
      title,
      description,
      file_path: path,
      status: "pending",
      uploader_id: userId,
    }));
    const { error: insErr } = await supabase.from("resources").insert(rows);

    setLoading(false);
    if (insErr) setMessage(`Saved file but DB insert failed: ${insErr.message}`);
    else {
      setMessage("Uploaded successfully. Waiting for admin approval.");
      setTitle(""); setDescription(""); setType(""); setSelectedSubjectIds([]); setSelectedDeptIds([]); setSelectedSemIds([]); setFile(null);
    }
  };

  return (
    <div className="bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <a href="/" className="text-blue-800">← Home</a>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Upload Resource</h1>

        <div className="mt-6 p-4 rounded-md border bg-white">
          <p className="text-slate-600 text-sm">Students, Faculty, and Admin can upload. All uploads require Admin approval before they appear publicly.</p>
          <div className="grid gap-4 mt-4">
            <Input className="px-3 py-2" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
            <Textarea className="px-3 py-2" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border p-2">
                <div className="text-xs font-medium text-slate-600 mb-1">Departments</div>
                <div className="grid grid-cols-2 gap-1 max-h-40 overflow-auto">
                  {departments.map(d=> (
                    <label key={d.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={selectedDeptIds.includes(d.id)} onChange={(e)=>{
                        setSelectedSubjectIds([]);
                        setSelectedDeptIds(prev=> e.target.checked ? [...prev, d.id] : prev.filter(x=>x!==d.id));
                      }} />
                      <span>{d.code}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="rounded-md border p-2">
                <div className="text-xs font-medium text-slate-600 mb-1">Semesters</div>
                <div className="grid grid-cols-3 gap-1 max-h-40 overflow-auto">
                  {semesters.map(s=> (
                    <label key={s.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={selectedSemIds.includes(s.id)} onChange={(e)=>{
                        setSelectedSubjectIds([]);
                        setSelectedSemIds(prev=> e.target.checked ? [...prev, s.id] : prev.filter(x=>x!==s.id));
                      }} />
                      <span>{s.number}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border p-2">
                <div className="text-xs font-medium text-slate-600 mb-1">Subjects</div>
                <div className="grid grid-cols-1 gap-1 max-h-40 overflow-auto">
                  {filteredSubjects.map(s=> (
                    <label key={s.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={selectedSubjectIds.includes(s.id)} onChange={(e)=>{
                        setSelectedSubjectIds(prev=> e.target.checked ? [...prev, s.id] : prev.filter(x=>x!==s.id));
                      }} />
                      <span>{s.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  {TYPES.map(t=> <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-slate-600">File</label>
              <input type="file" className="mt-1 block w-full text-sm" onChange={(e)=>setFile(e.target.files?.[0] || null)} />
              <p className="text-xs text-slate-500 mt-1">Allowed: PDF, PPTX, DOCX, ZIP. Max 25MB (configurable).</p>
            </div>
            <Button type="button" className="bg-blue-800 text-white" disabled={loading} onClick={onSubmit}>{loading? "Uploading..." : "Submit"}</Button>
            {message && <p className="text-sm">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
