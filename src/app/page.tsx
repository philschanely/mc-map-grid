"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session) {
      router.replace("/worlds");
    }
  }, [session, router]);

  if (session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <p className="text-sm text-zinc-500">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col items-center gap-8 rounded-2xl bg-white px-8 py-10 shadow-sm dark:bg-zinc-950">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          MC Map Grid
        </h1>

        {status !== "loading" && (
          <div className="flex w-full flex-col items-center gap-4 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Sign in with Google to create worlds and log coordinates.
            </p>
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/worlds" })}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Sign in with Google
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
