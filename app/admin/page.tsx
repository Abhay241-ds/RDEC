"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminPage(){
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: res } = await supabase
      .from("resources")
      .select("id,title,type,created_at,subjects(name)")
      .eq("status","pending")
      .order("created_at", { ascending: true });
    setItems(res || []);
    setLoading(false);
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
      if (admin) load();
      else setStatus("Admin access only.");
    })();
  },[]);

  const decide = async (id: string, decision: "approved"|"rejected") => {
    setStatus(null);
    const { data: user } = await supabase.auth.getUser();
    const uid = user.user?.id;
    if(!uid){ setStatus("Not signed in."); return; }
    const { error: updErr } = await supabase.from("resources").update({ status: decision }).eq("id", id);
    if (updErr){ setStatus(updErr.message); return; }
    await supabase.from("approvals").insert({ resource_id: id, reviewer_id: uid, decision });
    setItems(prev => prev.filter(x=>x.id!==id));
  };

  if(isAdmin === null) return <div className="max-w-5xl mx-auto px-4 py-8">Checking permissions...</div>;
  if(!isAdmin) return <div className="max-w-5xl mx-auto px-4 py-8">{status || "Admin access only."}</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Pending Approvals</h1>
      {status && <p className="mt-2 text-sm">{status}</p>}
      <div className="mt-6 grid gap-4">
        {loading && <div>Loading...</div>}
        {!loading && items.length===0 && <div>No pending items.</div>}
        {!loading && items.map((r)=> (
          <Card key={r.id} className="p-4">
            <div className="text-xs text-blue-800 font-semibold uppercase">{r.type}</div>
            <div className="mt-1 font-medium text-slate-900">{r.title}</div>
            <div className="text-sm text-slate-600">{r.subjects?.name}</div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={()=>decide(r.id,"approved")}>Approve</Button>
              <Button size="sm" variant="secondary" onClick={()=>decide(r.id,"rejected")}>Reject</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
