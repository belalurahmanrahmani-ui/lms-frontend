"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { callBackend } from "@/lib/api/browser";
import { ROLES, ROLE_VALUES } from "@/lib/roles";
import type { UserRole } from "@/types/auth";
import type { AdminUser } from "@/types/user";

export function RoleForm({
  user,
  onDone,
}: {
  user: AdminUser;
  onDone: () => void;
}) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(user.role);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isChanged = role !== user.role;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isChanged) return;

    setError(null);
    setIsLoading(true);

    const result = await callBackend(`Admin/users/${user.id}/role`, "PATCH", {
      role: ROLE_VALUES[role],
    });

    setIsLoading(false);

    if (!result.ok) {
      setError(result.errorMessage);
      return;
    }

    onDone();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {user.fullName} · {user.email}
      </p>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="user-role">Role</Label>
        <select
          id="user-role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {ROLES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {isChanged && role === "Admin" && (
        <p className="rounded-md bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
         Note: Assigning the Admin role to this user grants full access to the entire system.
        </p>
      )}

      <Button type="submit" className="w-full" disabled={!isChanged || isLoading}>
        {isLoading ? " Saving ..." : "Change Role"}
      </Button>
    </form>
  );
}