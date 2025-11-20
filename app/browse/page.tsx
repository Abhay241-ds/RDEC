"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { DEPARTMENTS, SEMESTERS, TYPES } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

function BrowseClient() {
  const params = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]); // grouped by file_path
  const [status, setStatus] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Array<{id:string; name:string}>>([]);
  const [deptRows, setDeptRows] = useState<Array<{id:string; code:string}>>([]);
  const [semRows, setSemRows] = useState<Array<{id:string; number:number}>>([]);
  const [availableSubjectIds, setAvailableSubjectIds] = useState<Set<string>>(new Set());

  const q = params.get("q") || "";
  const [searchText, setSearchText] = useState(q);
  const dept = params.get("dept") || "";
  const sem = params.get("sem") || "";
  const type = params.get("type") || "";
  const sub = params.get("sub") || ""; // subject_id
  const deptValue = dept || "all";
  const semValue = sem || "all";
  const typeValue = type || "all";
  const subValue = sub || "all";

  // Map selected dept code and sem number to their UUID IDs
  const selectedDeptId = deptRows.find(d=> d.code === dept)?.id;
  const selectedSemId = semRows.find(s=> String(s.number) === sem)?.id;

  // Subjects that match the current Dept/Sem/Type filters
  const filteredSubjects = subjects
    .filter(s => (!selectedDeptId || (s as any).department_id === selectedDeptId))
    .filter(s => (!selectedSemId || (s as any).semester_id === selectedSemId))
    .filter(s => !type || availableSubjectIds.has(s.id));

  const fetchData = async () => {
    setLoading(true);
    setStatus(null);

    // Require all filters (dept, sem, type, subject) before showing any resources
    const hasAllFilters = !!dept && !!sem && !!type && !!sub && !!selectedDeptId && !!selectedSemId;
    if (!hasAllFilters) {
      setItems([]);
      setStatus("Please select Department, Semester, Type and Subject to view resources.");
      setLoading(false);
      return;
    }
    let query = supabase
      .from("resources")
      .select("id,title,type,created_at,file_path,subject_id,subjects(name,semester_id,department_id)")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(60);

    if (type) query = query.eq("type", type);
    if (q) {
      // Search by title OR subject name
      query = query.or(`title.ilike.%${q}%,subjects.name.ilike.%${q}%`);
    }
    // Filter via nested fields using PostgREST filters with dot notation
    if (selectedDeptId) query = query.eq("subjects.department_id", selectedDeptId);
    if (selectedSemId) query = query.eq("subjects.semester_id", selectedSemId);
    if (sub) query = query.eq("subject_id", sub);

    try {
      const { data, error } = await query;
      if (error) throw error;
      if (data) {
        const rows = data as any[];
        // Group results by file_path so a single file appears once even if linked to many subjects
        const byFile = new Map<string, { file_path: string | null; title: string; type: string; created_at: string; subjectNames: string[] }>();
        for (const r of rows) {
          const key = r.file_path || r.id;
          let group = byFile.get(key);
          if (!group) {
            group = {
              file_path: r.file_path,
              title: r.title,
              type: r.type,
              created_at: r.created_at,
              subjectNames: [],
            };
            byFile.set(key, group);
          }
          const subjName = r.subjects?.name as string | undefined;
          if (subjName && !group.subjectNames.includes(subjName)) {
            group.subjectNames.push(subjName);
          }
        }
        const grouped = Array.from(byFile.values());
        setItems(grouped);
        // Cache latest successful results for offline fallback
        if (typeof window !== 'undefined') {
          try { localStorage.setItem('browse-cache', JSON.stringify(grouped)); } catch {}
        }
      }
    } catch (e: any) {
      setStatus("Service temporarily unavailable. Showing last saved results, if any.");
      // Fallback to cached results
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('browse-cache');
          if (raw) setItems(JSON.parse(raw)); else setItems([]);
        } catch { setItems([]); }
      } else {
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, dept, sem, type, sub, selectedDeptId, selectedSemId]);

  // Load subjects list once for the Subject filter
  useEffect(() => {
    (async () => {
      const [subj, dpts, sems] = await Promise.all([
        supabase.from('subjects').select('id,name,department_id,semester_id').order('name'),
        supabase.from('departments').select('id,code').order('code'),
        supabase.from('semesters').select('id,number').order('number'),
      ]);
      if (!subj.error && subj.data) setSubjects(subj.data as any);
      if (!dpts.error && dpts.data) setDeptRows(dpts.data as any);
      if (!sems.error && sems.data) setSemRows(sems.data as any);
    })();
  }, []);

  // Load available subject IDs that have approved resources for current filters
  useEffect(() => {
    (async () => {
      let rq = supabase
        .from('resources')
        .select('subject_id, subjects(department_id,semester_id)')
        .eq('status','approved')
        .limit(2000);
      if (selectedDeptId) rq = rq.eq('subjects.department_id', selectedDeptId);
      if (selectedSemId) rq = rq.eq('subjects.semester_id', selectedSemId);
      if (type) rq = rq.eq('type', type);
      const { data, error } = await rq;
      if (error || !data) { setAvailableSubjectIds(new Set()); return; }
      const ids = new Set<string>();
      (data as any[]).forEach(r => { if (r.subject_id) ids.add(r.subject_id as string); });
      setAvailableSubjectIds(ids);
    })();
  }, [selectedDeptId, selectedSemId, type]);

  const openFile = async (path: string) => {
    try {
      const { data, error } = await supabase.storage.from('resources').createSignedUrl(path, 60 * 60);
      if (error || !data?.signedUrl) throw error || new Error('No URL');
      window.open(data.signedUrl, '_blank');
    } catch (e) {
      setStatus('Unable to open file. Please try again later.');
    }
  };

  const onFilterChange = (key: string, value: string) => {
    const sp = new URLSearchParams(params.toString());
    if (value) sp.set(key, value); else sp.delete(key);
    router.push(`/browse?${sp.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <a href="/" className="text-blue-800">← Home</a>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Browse Resources</h1>
      {status && <div className="mt-2 text-sm text-amber-700 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-500 rounded px-3 py-2">{status}</div>}

      <div className="mt-6 grid sm:grid-cols-5 gap-3">
        <div className="flex gap-2">
          <Input placeholder="Search by title or subject..." value={searchText} onChange={(e)=>setSearchText(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') onFilterChange('q', searchText); }} />
          <Button onClick={()=>onFilterChange('q', searchText)}>Search</Button>
        </div>
        <Select value={deptValue} onValueChange={(v)=>onFilterChange('dept', v === 'all' ? '' : v)}>
          <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {DEPARTMENTS.filter(Boolean).map(d=> (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={semValue} onValueChange={(v)=>onFilterChange('sem', v === 'all' ? '' : v)}>
          <SelectTrigger><SelectValue placeholder="Semester" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Semesters</SelectItem>
            {SEMESTERS.filter(Boolean).map(s=> (
              <SelectItem key={s} value={String(s)}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeValue} onValueChange={(v)=>onFilterChange('type', v === 'all' ? '' : v)}>
          <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {TYPES.filter(t=> !!t.value).map(t=> (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-col gap-1">
          <Select value={subValue} onValueChange={(v)=>onFilterChange('sub', v === 'all' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {filteredSubjects.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!!dept && !!sem && !!type && filteredSubjects.length === 0 && (
        <div className="mt-1 text-sm text-red-900">
          resource unavailable. please try to upload and wait for admin approval.
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loading && <div>Loading...</div>}
        {!loading && items.map((r)=> (
          <Card key={r.file_path || r.title} className="p-3 bg-white dark:bg-[#93B1B5]">
            <div className="text-sm text-blue-800 dark:text-blue-900 font-semibold uppercase">{r.type}</div>
            <div className="mt-0.5 text-xl font-medium text-slate-900 dark:text-white leading-tight">{r.title}</div>
            <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-800 leading-tight">
              {r.created_at ? `date of uploading - ${new Date(r.created_at).toLocaleDateString()}` : ""}
            </div>
            <div className="mt-0.5 text-lg text-slate-600 dark:text-slate-900 leading-tight">
              {r.subjectNames && r.subjectNames.length > 0 ? r.subjectNames.join(", ") : "(No subjects)"}
            </div>
            {r.file_path && (
              <div className="mt-0.5">
                <button onClick={()=>openFile(r.file_path)} className="text-blue-800 underline text-base">Open</button>
              </div>
            )}
          </Card>
        ))}
        {!loading && items.length===0 && !!dept && !!sem && !!type && !!sub && (
          <div className="text-sm text-slate-600">no selected resource is available</div>
        )}
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8">Loading...</div>}>
      <BrowseClient />
    </Suspense>
  );
}
