"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

export default function AccountPage() {
  const router = useRouter();
  const [email, setEmail] =
    useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;

        setEmail(
          data.session?.user
            ?.email ?? null
        );

        if (
          typeof window !==
            "undefined" &&
          window.location.hash.includes(
            "access_token"
          )
        ) {
          history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }
      });

    const { data: sub } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (!mounted) return;

          setEmail(
            session?.user
              ?.email ?? null
          );
        }
      );

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
    <div className="min-h-screen bg-slate-50">

      <div className="max-w-md mx-auto p-6">

        {/* Home */}

        <button
          onClick={() =>
            router.push("/")
          }
          className="text-blue-700 hover:underline"
        >
          ← Home
        </button>

        <div className="mt-5 rounded-xl border bg-white p-6">

          <h1 className="text-2xl font-bold">
            Account
          </h1>

          {email ? (

            <div className="mt-5 space-y-4">

              <div className="rounded-lg bg-slate-100 p-3">

                <p className="text-sm text-gray-600">
                  Signed in as
                </p>

                <p className="font-medium">
                  {email}
                </p>

              </div>

              <Button
                variant="secondary"
                className="w-full"
                onClick={signOut}
              >
                Sign out
              </Button>

            </div>

          ) : (

            <div className="mt-5">

              <p className="text-sm">

                You are not signed in.

              </p>

              <a
                href="/login"
                className="text-blue-700 underline"
              >
                Login
              </a>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}
