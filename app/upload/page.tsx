"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
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
  const [selectedSubjectName, setSelectedSubjectName] = useState<string>("");
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

  // Deduplicate by subject name across filtered subjects
  const dedupedSubjects = useMemo(() => {
    const map = new Map<string, string[]>(); // name -> [ids]
    for (const s of filteredSubjects) {
      const arr = map.get(s.name) || [];
      arr.push(s.id);
      map.set(s.name, arr);
    }
    return Array.from(map.entries()).map(([name, ids]) => ({ name, ids }));
  }, [filteredSubjects]);

  const onSubmit = async () => {
    setMessage(null);
    // Expand selected names to all matching subject IDs in current filtered set
    const entry = dedupedSubjects.find(d => d.name === selectedSubjectName);
    const chosenSubjectIds = Array.from(new Set(entry?.ids || []));
    if (chosenSubjectIds.length === 0) { setMessage("Please choose a Subject."); return; }

    if (!file || !title || !type) {
      setMessage("Please fill Title, Type and choose a file.");
      return;
    }

    // Enforce 5 MB max file size
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setMessage("File is too large. Maximum allowed size is 5 MB.");
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
      setTitle(""); setDescription(""); setType(""); setSelectedSubjectName(""); setSelectedDeptIds([]); setSelectedSemIds([]); setFile(null);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-[#4F7C81]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <a href="/" className="text-blue-800 dark:text-blue-200">← Home</a>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Upload Resource</h1>

        <div className="mt-6 p-4 rounded-md border bg-white dark:bg-[#93B1B5]">
          <p className="text-slate-600 dark:text-black text-sm">Students, Faculty, and Admin can upload. All uploads require Admin approval before they appear publicly.</p>
          <div className="grid gap-4 mt-4">
            <Input
              className="px-3 py-2 dark:text-black dark:placeholder:text-black"
              placeholder="Title"
              value={title}
              onChange={e=>setTitle(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border p-2">
                <div className="text-xs font-medium text-slate-600 dark:text-black mb-1">Departments</div>
                <div className="mb-1 flex items-center gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={selectedDeptIds.length === departments.length && departments.length > 0}
                    onChange={(e)=>{
                      setSelectedSubjectName("");
                      if (e.target.checked) {
                        setSelectedDeptIds(departments.map(d=>d.id));
                      } else {
                        setSelectedDeptIds([]);
                      }
                    }}
                  />
                  <span>Select all departments</span>
                </div>
                <div className="grid grid-cols-2 gap-1 max-h-40 overflow-auto">
                  {departments.map(d=> (
                    <label key={d.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={selectedDeptIds.includes(d.id)} onChange={(e)=>{
                        setSelectedSubjectName("");
                        setSelectedDeptIds(prev=> e.target.checked ? [...prev, d.id] : prev.filter(x=>x!==d.id));
                      }} />
                      <span>{d.code}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="rounded-md border p-2">
                <div className="text-xs font-medium text-slate-600 dark:text-black mb-1">Semesters</div>
                <div className="grid grid-cols-3 gap-1 max-h-40 overflow-auto">
                  {semesters.map(s=> (
                    <label key={s.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={selectedSemIds.includes(s.id)} onChange={(e)=>{
                        setSelectedSubjectName("");
                        setSelectedSemIds(prev=> e.target.checked ? [...prev, s.id] : prev.filter(x=>x!==s.id));
                      }} />
                      <span>{s.number}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select value={selectedSubjectName} onValueChange={setSelectedSubjectName}>
                <SelectTrigger className="dark:text-black dark:[&>svg]:text-black dark:[&>svg]:opacity-100">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  {dedupedSubjects.map(d=> (
                    <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="dark:text-black dark:[&>svg]:text-black dark:[&>svg]:opacity-100">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map(t=> <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-slate-600 dark:text-black">File</label>
              <input
                type="file"
                className="mt-1 block w-full text-sm file:mr-3 file:px-4 file:py-2 file:rounded-md file:border-0 file:bg-black file:text-white hover:file:bg-black/80"
                onChange={(e)=>setFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-slate-500 dark:text-black mt-1">Allowed: PDF. Max 5MB (configurable).</p>
            </div>
            <Button type="button" className="bg-blue-800 text-white" disabled={loading} onClick={onSubmit}>{loading? "Uploading..." : "Submit"}</Button>
            {message && <p className="text-sm dark:text-black">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
