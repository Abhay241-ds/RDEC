"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { DEPARTMENTS, SEMESTERS, TYPES } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

function BrowseClient() {
  const params = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  const q = params.get("q") || "";
  const dept = params.get("dept") || "";
  const sem = params.get("sem") || "";
  const type = params.get("type") || "";

  const fetchData = async () => {
    setLoading(true);
    let query = supabase
      .from("resources")
      .select("id,title,type,created_at,subjects(name,semester_id,department_id)")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(60);

    if (type) query = query.eq("type", type);
    if (q) query = query.ilike("title", `%${q}%`);
    // Filter via nested fields using PostgREST filters with dot notation
    if (dept) query = query.eq("subjects.department_id", dept);
    if (sem) query = query.eq("subjects.semester_id", sem);

    const { data, error } = await query;
    if (!error && data) setItems(data as any[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, dept, sem, type]);

  const onFilterChange = (key: string, value: string) => {
    const sp = new URLSearchParams(params.toString());
    if (value) sp.set(key, value); else sp.delete(key);
    router.push(`/browse?${sp.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Browse Resources</h1>

      <div className="mt-6 grid sm:grid-cols-4 gap-3">
        <Input placeholder="Search..." defaultValue={q} onKeyDown={(e)=>{ if(e.key==='Enter') onFilterChange('q',(e.target as HTMLInputElement).value); }} />
        <Select value={dept} onValueChange={(v)=>onFilterChange('dept', v)}>
          <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Departments</SelectItem>
            {DEPARTMENTS.map(d=> <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sem} onValueChange={(v)=>onFilterChange('sem', v)}>
          <SelectTrigger><SelectValue placeholder="Semester" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Semesters</SelectItem>
            {SEMESTERS.map(s=> <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={(v)=>onFilterChange('type', v)}>
          <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            {TYPES.map(t=> <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && <div>Loading...</div>}
        {!loading && items.map((r)=> (
          <Card key={r.id} className="p-4">
            <div className="text-xs text-blue-800 font-semibold uppercase">{r.type}</div>
            <div className="mt-1 font-medium text-slate-900">{r.title}</div>
            <div className="text-sm text-slate-600">{r.subjects?.name}</div>
          </Card>
        ))}
        {!loading && items.length===0 && <div>No results.</div>}
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
