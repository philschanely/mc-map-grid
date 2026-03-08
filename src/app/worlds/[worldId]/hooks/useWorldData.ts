"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useLoading } from "@/contexts/LoadingContext";
import type { Log, World } from "../types";

export function useWorldData(worldId: string, session: { user?: { id?: string } } | null) {
  const { withLoading } = useLoading();
  const [world, setWorld] = useState<World | null>(null);
  const [worldError, setWorldError] = useState<string | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    if (!worldId || !session) {
      queueMicrotask(() => {
        setWorld(null);
        setLogs([]);
      });
      return;
    }

    void withLoading(async () => {
      const res = await fetch(`/api/worlds/${worldId}`);
      if (!res.ok) {
        setWorldError(res.status === 404 ? "World not found." : "Failed to load world.");
        setWorld(null);
        return;
      }
      const data: World = await res.json();
      setWorld(data);
      setWorldError(null);
    });
  }, [worldId, session, withLoading]);

  useEffect(() => {
    if (!worldId || !session) return;

    void withLoading(async () => {
      const res = await fetch(`/api/worlds/${worldId}/logs`);
      if (!res.ok) return;
      const data: Log[] = await res.json();
      setLogs(data);
    });
  }, [worldId, session, withLoading]);

  return { world, worldError, logs, setLogs };
}

export function useCreateLog(
  worldId: string,
  logs: Log[],
  setLogs: React.Dispatch<React.SetStateAction<Log[]>>,
) {
  const { withLoading } = useLoading();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveLog = async (
    event: FormEvent<HTMLFormElement>,
    formData: { description: string; x: string; y: string; z: string },
    editingLogId: string | null,
    onSuccess?: () => void,
  ) => {
    event.preventDefault();
    setError(null);

    const { description, x, y, z } = formData;
    const xNumber = Number(x);
    const yNumber = Number(y);
    const zNumber = z.trim() === "" ? null : Number(z);

    if (Number.isNaN(xNumber) || Number.isNaN(yNumber)) {
      setError("X and Y must be valid numbers.");
      return;
    }

    if (zNumber !== null && Number.isNaN(zNumber)) {
      setError("Z must be a valid number or left blank.");
      return;
    }

    try {
      setIsSaving(true);
      await withLoading(async () => {
        const body = JSON.stringify({
          description: description.trim(),
          x: xNumber,
          y: yNumber,
          z: zNumber,
        });

        if (editingLogId) {
          const response = await fetch(
            `/api/worlds/${worldId}/logs/${editingLogId}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body,
            },
          );

          if (!response.ok) {
            setError("Failed to update log.");
            return;
          }

          const updated: Log = await response.json();
          setLogs((current) =>
            current.map((log) =>
              log._id === editingLogId ? updated : log,
            ),
          );
        } else {
          const response = await fetch(`/api/worlds/${worldId}/logs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
          });

          if (!response.ok) {
            setError("Failed to save log.");
            return;
          }

          const created: Log = await response.json();
          setLogs((current) => [created, ...current]);
        }
        onSuccess?.();
      });
    } finally {
      setIsSaving(false);
    }
  };

  return { saveLog, isSaving, error };
}

export function useDeleteLog(
  worldId: string,
  setLogs: React.Dispatch<React.SetStateAction<Log[]>>,
) {
  const { withLoading } = useLoading();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteLog = async (logId: string) => {
    if (!logId) return;
    try {
      setIsDeleting(true);
      await withLoading(async () => {
        const res = await fetch(`/api/worlds/${worldId}/logs/${logId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete");
        setLogs((current) => current.filter((log) => log._id !== logId));
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteLog, isDeleting };
}
