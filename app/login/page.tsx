"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    // Initialize session and subscribe to auth state changes
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const email = data.session?.user?.email ?? null;
      setUserEmail(email);
      // Clean auth hash from URL if present
      if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
        history.replaceState({}, document.title, window.location.pathname);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const sendLink = async () => {
    setStatus(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined,
      },
    });
    if (error) setStatus(error.message); else setStatus("Check your email for the login link.");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
  };

  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <div className="w-full max-w-sm p-6 rounded-xl border bg-white">
        <h1 className="text-xl font-bold text-slate-900">{userEmail ? "Account" : "Login"}</h1>
        {!userEmail ? (
          <div className="mt-6 grid gap-3">
            <Input placeholder="College email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <Button onClick={sendLink}>Send login link</Button>
            {status && <p className="text-sm">{status}</p>}
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            <p className="text-sm text-slate-700">Signed in as {userEmail}</p>
            <Button variant="secondary" onClick={signOut}>Sign out</Button>
          </div>
        )}
      </div>
    </div>
  );
}
