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

  const load = async () => {
    setLoading(true);
    let query = supabase
      .from("resources")
      .select("id,title,type,created_at,file_path,subjects(name)")
      .eq("status","pending")
      .order("created_at", { ascending: true });
    if (typeFilter !== 'all') query = query.eq('type', typeFilter);
    const { data: res } = await query;

    const rows = (res || []) as any[];
    const byFile = new Map<string, { file_path: string; title: string; type: string; ids: string[]; subjectNames: string[] }>();
    for (const r of rows) {
      const key = r.file_path || r.id;
      let group = byFile.get(key);
      if (!group) {
        group = {
          file_path: r.file_path,
          title: r.title,
          type: r.type,
          ids: [],
          subjectNames: [],
        };
        byFile.set(key, group);
      }
      if (r.id) group.ids.push(r.id);
      const subjName = r.subjects?.name as string | undefined;
      if (subjName && !group.subjectNames.includes(subjName)) {
        group.subjectNames.push(subjName);
      }
    }
    setItems(Array.from(byFile.values()));
    setLoading(false);
  };

  const loadApproved = async () => {
    let query = supabase
      .from("resources")
      .select("id,title,type,created_at,file_path,subjects(name)")
      .eq("status","approved")
      .order("created_at", { ascending: false })
      .limit(50);
    if (typeFilter !== 'all') query = query.eq('type', typeFilter);
    const { data: res } = await query;
    setApprovedItems(res || []);
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

  const decide = async (filePath: string, ids: string[], decision: "approved"|"rejected") => {
    setStatus(null);
    const { data: user } = await supabase.auth.getUser();
    const uid = user.user?.id;
    if(!uid){ setStatus("Not signed in."); return; }
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

  const deleteResource = async (id: string, path: string | null) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    setStatus(null);

    if (path) {
      const { error: storageError } = await supabase.storage.from("resources").remove([path]);
      if (storageError) { setStatus(storageError.message); return; }
    }

    const { error } = await supabase.from("resources").delete().eq("id", id);
    if (error) { setStatus(error.message); return; }
    setApprovedItems(prev => prev.filter(x => x.id !== id));
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
      <div className="mt-6 grid gap-4">
        {loading && <div>Loading...</div>}
        {!loading && items.length===0 && <div>No pending items.</div>}
        {!loading && items.map((r)=> (
          <Card key={r.file_path || r.title} className="p-4">
            <div className="text-xs text-blue-800 font-semibold uppercase">{r.type}</div>
            <div className="mt-1 font-medium text-slate-900">{r.title}</div>
            <div className="text-sm text-slate-600">
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
      <div className="mt-2 text-sm text-slate-600">Use Delete to remove items from browse.</div>
      <div className="mt-4 grid gap-4">
        {approvedItems.length===0 && <div>No approved items for this filter.</div>}
        {approvedItems.map(r => (
          <Card key={r.id} className="p-4">
            <div className="text-xs text-blue-800 font-semibold uppercase">{r.type}</div>
            <div className="mt-1 font-medium text-slate-900">{r.title}</div>
            <div className="text-sm text-slate-600">{r.subjects?.name}</div>
            <div className="mt-3 flex gap-2">
              {r.file_path && <Button variant="secondary" size="sm" onClick={()=>openFile(r.file_path)}>Open</Button>}
              <Button size="sm" variant="destructive" onClick={()=>deleteResource(r.id, r.file_path)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
