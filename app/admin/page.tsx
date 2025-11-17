"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminPage(){
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [items, setItems] = useState<any[]>([]); // pending groups
  const [approvedItems, setApprovedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deptRows, setDeptRows] = useState<Array<{id:string; code:string}>>([]);
  const [semRows, setSemRows] = useState<Array<{id:string; number:number}>>([]);

  const load = async () => {
    setLoading(true);
    let query = supabase
      .from("resources")
      .select("id,title,type,created_at,file_path,subjects(name,department_id,semester_id)")
      .eq("status","pending")
      .order("created_at", { ascending: true });
    if (typeFilter !== 'all') query = query.eq('type', typeFilter);
    const { data: res } = await query;

    const rows = (res || []) as any[];
    const byFile = new Map<string, { file_path: string; title: string; type: string; created_at: string; ids: string[]; subjectNames: string[]; departmentIds: string[]; semesterIds: string[] }>();
    for (const r of rows) {
      const key = r.file_path || r.id;
      let group = byFile.get(key);
      if (!group) {
        group = {
          file_path: r.file_path,
          title: r.title,
          type: r.type,
          created_at: r.created_at,
          ids: [],
          subjectNames: [],
          departmentIds: [],
          semesterIds: [],
        };
        byFile.set(key, group);
      }
      if (r.id) group.ids.push(r.id);
      const subjName = r.subjects?.name as string | undefined;
      if (subjName && !group.subjectNames.includes(subjName)) {
        group.subjectNames.push(subjName);
      }
      const deptId = (r.subjects as any)?.department_id as string | undefined;
      if (deptId && !group.departmentIds.includes(deptId)) {
        group.departmentIds.push(deptId);
      }
      const semId = (r.subjects as any)?.semester_id as string | undefined;
      if (semId && !group.semesterIds.includes(semId)) {
        group.semesterIds.push(semId);
      }
    }
    setItems(Array.from(byFile.values()));
    setLoading(false);
  };

  const loadApproved = async () => {
    let query = supabase
      .from("resources")
      .select("id,title,type,created_at,file_path,subject_id,subjects(name,department_id,semester_id)")
      .eq("status","approved")
      .order("created_at", { ascending: false })
      .limit(50);
    if (typeFilter !== 'all') query = query.eq('type', typeFilter);
    const { data: res } = await query;
    const rows = (res || []) as any[];
    const byFile = new Map<string, { file_path: string; title: string; type: string; created_at: string; subjectNames: string[]; departmentIds: string[]; semesterIds: string[] }>();
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
          departmentIds: [],
          semesterIds: [],
        };
        byFile.set(key, group);
      }
      const subjName = r.subjects?.name as string | undefined;
      if (subjName && !group.subjectNames.includes(subjName)) {
        group.subjectNames.push(subjName);
      }
      const deptId = (r.subjects as any)?.department_id as string | undefined;
      if (deptId && !group.departmentIds.includes(deptId)) {
        group.departmentIds.push(deptId);
      }
      const semId = (r.subjects as any)?.semester_id as string | undefined;
      if (semId && !group.semesterIds.includes(semId)) {
        group.semesterIds.push(semId);
      }
    }
    setApprovedItems(Array.from(byFile.values()));
  };

  useEffect(()=>{
    (async ()=>{
      setStatus(null);
      const { data: user } = await supabase.auth.getUser();
      const uid = user.user?.id;
      if(!uid){ setIsAdmin(false); return; }
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", uid).maybeSingle();
      const admin = prof?.role === "admin";
      setIsAdmin(admin);
      if (admin) {
        load();
        loadApproved();
      }
      else setStatus("Admin access only.");
    })();
  },[typeFilter]);

  // Load departments and semesters so we can display codes and numbers on approved cards
  useEffect(() => {
    (async () => {
      const [dpts, sems] = await Promise.all([
        supabase.from('departments').select('id,code').order('code'),
        supabase.from('semesters').select('id,number').order('number'),
      ]);
      if (!dpts.error && dpts.data) setDeptRows(dpts.data as any);
      if (!sems.error && sems.data) setSemRows(sems.data as any);
    })();
  }, []);

  const decide = async (filePath: string, ids: string[], decision: "approved"|"rejected") => {
    setStatus(null);
    const { data: user } = await supabase.auth.getUser();
    const uid = user.user?.id;
    if(!uid){ setStatus("Not signed in."); return; }

    // If rejecting, also remove the underlying file from storage so only approved files remain
    if (decision === "rejected" && filePath) {
      const { error: storageError } = await supabase.storage.from("resources").remove([filePath]);
      if (storageError) { setStatus(storageError.message); return; }
    }

    const { error: updErr } = await supabase
      .from("resources")
      .update({ status: decision })
      .eq("file_path", filePath)
      .eq("status","pending");
    if (updErr){ setStatus(updErr.message); return; }
    if (ids.length > 0) {
      await supabase.from("approvals").insert(
        ids.map(id => ({ resource_id: id, reviewer_id: uid, decision }))
      );
    }
    setItems(prev => prev.filter(x=>x.file_path !== filePath));
  };

  const openFile = async (path: string) => {
    try {
      const { data, error } = await supabase.storage.from('resources').createSignedUrl(path, 60 * 60);
      if (error || !data?.signedUrl) throw error || new Error('No URL');
      window.open(data.signedUrl, '_blank');
    } catch (e: any) {
      setStatus(e?.message || 'Unable to open file');
    }
  };

  const deleteResource = async (path: string | null) => {
    if (!window.confirm("Are you sure you want to delete this file and all its associated resources?")) return;
    setStatus(null);

    if (path) {
      const { error: storageError } = await supabase.storage.from("resources").remove([path]);
      if (storageError) { setStatus(storageError.message); return; }
    }

    const { error } = await supabase.from("resources").delete().eq("file_path", path).eq("status","approved");
    if (error) { setStatus(error.message); return; }
    setApprovedItems(prev => prev.filter(x => x.file_path !== path));
  };

  if(isAdmin === null) return <div className="max-w-5xl mx-auto px-4 py-8">Checking permissions...</div>;
  if(!isAdmin) return <div className="max-w-5xl mx-auto px-4 py-8">{status || "Admin access only."}</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Pending Approvals</h1>
      {status && <p className="mt-2 text-sm">{status}</p>}
      <div className="mt-4 flex items-center gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filter by type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="notes">Notes</SelectItem>
            <SelectItem value="pyq">PYQ</SelectItem>
            <SelectItem value="syllabus">Syllabus</SelectItem>
            <SelectItem value="lab">Lab Manual</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="secondary" size="sm" onClick={load}>Refresh</Button>
      </div>
      <div className="mt-6 grid gap-3">
        {loading && <div>Loading...</div>}
        {!loading && items.length===0 && <div>No pending items.</div>}
        {!loading && items.map((r)=> (
          <Card key={r.file_path || r.title} className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="text-[11px] text-blue-800 font-semibold uppercase">{r.type}</div>
              <div className="text-right text-[10px] text-slate-500 leading-tight">
                {(() => {
                  const deptCodes = deptRows
                    .filter(d => (r.departmentIds || []).includes(d.id))
                    .map(d => d.code);
                  const semLabels = semRows
                    .filter(s => (r.semesterIds || []).includes(s.id))
                    .map(s => `Sem ${s.number}`);
                  return (
                    <>
                      {deptCodes.length > 0 && <div>{deptCodes.join(', ')}</div>}
                      {semLabels.length > 0 && <div>{semLabels.join(', ')}</div>}
                    </>
                  );
                })()}
              </div>
            </div>
            <div className="mt-1 text-sm font-medium text-slate-900">{r.title}</div>
            <div className="text-[11px] text-slate-500">
              {r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}
            </div>
            <div className="mt-1 text-xs text-slate-600">
              {r.subjectNames && r.subjectNames.length > 0 ? r.subjectNames.join(", ") : "(No subjects)"}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {r.file_path && <Button variant="secondary" size="sm" onClick={()=>openFile(r.file_path)}>Open</Button>}
              <Button size="sm" onClick={()=>decide(r.file_path, r.ids, "approved")}>Approve</Button>
              <Button size="sm" variant="secondary" onClick={()=>decide(r.file_path, r.ids, "rejected")}>Reject</Button>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-semibold text-slate-900">Approved Resources</h2>
      <div className="mt-2 text-sm text-slate-600">Use Delete to remove all records for a file from browse.</div>
      <div className="mt-4 grid gap-3">
        {approvedItems.length===0 && <div>No approved items for this filter.</div>}
        {approvedItems.map(r => (
          <Card key={r.file_path || r.title} className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="text-[11px] text-blue-800 font-semibold uppercase">{r.type}</div>
              <div className="text-right text-[10px] text-slate-500 leading-tight">
                {(() => {
                  const deptCodes = deptRows
                    .filter(d => (r.departmentIds || []).includes(d.id))
                    .map(d => d.code);
                  const semLabels = semRows
                    .filter(s => (r.semesterIds || []).includes(s.id))
                    .map(s => `Sem ${s.number}`);
                  return (
                    <>
                      {deptCodes.length > 0 && <div>{deptCodes.join(', ')}</div>}
                      {semLabels.length > 0 && <div>{semLabels.join(', ')}</div>}
                    </>
                  );
                })()}
              </div>
            </div>
            <div className="mt-1 font-medium text-slate-900">{r.title}</div>
            <div className="text-xs text-slate-500">
              {r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}
            </div>
            <div className="mt-1 text-sm text-slate-600">
              {r.subjectNames && r.subjectNames.length > 0 ? r.subjectNames.join(", ") : "(No subjects)"}
            </div>
            <div className="mt-3 flex gap-2">
              {r.file_path && <Button variant="secondary" size="sm" onClick={()=>openFile(r.file_path)}>Open</Button>}
              <Button size="sm" variant="destructive" onClick={()=>deleteResource(r.file_path)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
