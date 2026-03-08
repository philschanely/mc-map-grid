"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { Field, Input, Label } from "@headlessui/react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useLoading } from "@/contexts/LoadingContext";

type World = {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
};

export default function Home() {
  const { data: session, status } = useSession();
  const { withLoading } = useLoading();
  const [worlds, setWorlds] = useState<World[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      setWorlds([]);
      return;
    }

    void withLoading(async () => {
      const response = await fetch("/api/worlds");
      if (!response.ok) return;
      const data: World[] = await response.json();
      setWorlds(data);
    });
  }, [session, withLoading]);

  const handleCreateWorld = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    try {
      setIsCreating(true);
      await withLoading(async () => {
      const response = await fetch("/api/worlds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "Failed to create world.");
        return;
      }

      const created: World = await response.json();
      setWorlds((current) => [created, ...current]);
      setName("");
      setDescription("");
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col items-center gap-8 rounded-2xl bg-white px-8 py-10 shadow-sm dark:bg-zinc-950">
        <div className="flex w-full items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
          {session ? (
            <>
              <span className="truncate">
                Signed in as {session.user.email ?? session.user.id}
              </span>
              <button
                type="button"
                onClick={() => signOut()}
                className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => signIn("google")}
              className="ml-auto rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Sign in with Google
            </button>
          )}
        </div>

        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {session ? "Your worlds" : "MC Map Grid"}
        </h1>

        {!session && status !== "loading" && (
          <p className="w-full text-sm text-zinc-600 dark:text-zinc-400">
            Sign in with Google to create worlds and log coordinates.
          </p>
        )}

        {session && (
          <>
            <form
              onSubmit={handleCreateWorld}
              className="flex w-full flex-col gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Create a world
              </p>
              <Field className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Name
                </Label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="World name"
                  className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none ring-0 transition-colors placeholder:text-zinc-400 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400"
                />
              </Field>
              <Field className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Description
                </Label>
                <Input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none ring-0 transition-colors placeholder:text-zinc-400 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400"
                />
              </Field>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {isCreating ? "Creating..." : "Create world"}
                </button>
              </div>
            </form>

            {worlds.length > 0 ? (
              <div className="flex w-full flex-col gap-2">
                <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Worlds
                </h2>
                <ul className="flex flex-col gap-2">
                  {worlds.map((world) => (
                    <li key={world._id}>
                      <Link
                        href={`/worlds/${world._id}`}
                        className="block rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
                      >
                        <span className="font-medium text-zinc-900 dark:text-zinc-50">
                          {world.name}
                        </span>
                        {world.description ? (
                          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                            {world.description}
                          </p>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="w-full text-sm text-zinc-500 dark:text-zinc-400">
                No worlds yet. Create one above to get started.
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
