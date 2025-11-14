"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

export default function AccountPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const e = data.session?.user?.email ?? null;
      setEmail(e);
      if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
        history.replaceState({}, document.title, window.location.pathname);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setEmail(null);
    router.push("/");
  };

  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <div className="w-full max-w-sm p-6 rounded-xl border bg-white">
        <h1 className="text-xl font-bold text-slate-900">Account</h1>
        {email ? (
          <div className="mt-4 grid gap-3">
            <p className="text-sm text-slate-700">Signed in as {email}</p>
            <Button variant="secondary" onClick={signOut}>Sign out</Button>
          </div>
        ) : (
          <div className="mt-4 text-sm text-slate-700">You are not signed in. Go to <a className="text-blue-800 underline" href="/login">Login</a>.</div>
        )}
      </div>
    </div>
  );
}
