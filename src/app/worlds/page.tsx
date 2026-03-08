"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { CreateWorldModal } from "@/components/CreateWorldModal";
import { useLoading } from "@/contexts/LoadingContext";

type World = {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  logCount?: number;
};

export default function WorldsDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { withLoading } = useLoading();
  const [worlds, setWorlds] = useState<World[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }
  }, [status, router]);

  useEffect(() => {
    if (!session) return;

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
        setWorlds((current) => [{ ...created, logCount: 0 }, ...current]);
        setName("");
        setDescription("");
        setIsModalOpen(false);
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex w-full max-w-2xl flex-col items-center gap-8 rounded-2xl bg-white px-8 py-10 shadow-sm dark:bg-zinc-950">
          <p className="text-sm text-zinc-500">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-8 rounded-2xl bg-white px-8 py-10 shadow-sm dark:bg-zinc-950">
        <div className="flex w-full justify-end">
          <div className="flex flex-col items-end gap-1 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="truncate max-w-[220px]">
              {session.user.email ?? session.user.id}
            </span>
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Your worlds
          </h1>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="shrink-0 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Create world
          </button>
        </div>

        <CreateWorldModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setError(null);
          }}
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          onSubmit={handleCreateWorld}
          isCreating={isCreating}
          error={error}
        />

        {worlds.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {worlds.map((world) => (
              <li key={world._id} className="flex">
                <Link
                  href={`/worlds/${world._id}`}
                  className="flex min-h-[120px] w-full flex-col rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">
                    {world.name}
                  </span>
                  {world.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {world.description}
                    </p>
                  ) : (
                    <span className="mt-1 flex-1" />
                  )}
                  <span className="mt-auto pt-2 text-xs text-zinc-500 dark:text-zinc-500">
                    {world.logCount ?? 0} log{(world.logCount ?? 0) === 1 ? "" : "s"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="w-full text-sm text-zinc-500 dark:text-zinc-400">
            No worlds yet. Click Create world to get started.
          </p>
        )}
      </main>
    </div>
  );
}
