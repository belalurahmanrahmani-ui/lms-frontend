import Link from "next/link";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserRowActions } from "@/components/user/UserRowActions";
import { apiFetchServer, ApiError } from "@/lib/api/server";
import { getCurrentUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminUser } from "@/types/user";
import { AddUserButton } from "@/components/user/AddUserButton";

const roleTabs = ["All", "Admin", "Teacher", "Student"];

const roleStyles: Record<string, string> = {
  Admin: "bg-primary/20 text-highlight",
  Teacher: "bg-sky-500/15 text-sky-400",
  Student: "bg-emerald-500/15 text-emerald-400",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string }>;
}) {
  const { role, q } = await searchParams;
  const currentUser = await getCurrentUser();

  let users: AdminUser[] = [];
  let errorMessage: string | null = null;

  try {
    users = await apiFetchServer<AdminUser[]>("/Admin/users");
  } catch (error) {
    errorMessage =
      error instanceof ApiError ? error.message : "Error fetching Users.";
  }

  if (errorMessage) {
    return <p className="text-destructive">{errorMessage}</p>;
  }

  const activeRole = role && roleTabs.includes(role) ? role : "All";
  const query = q?.trim().toLowerCase() ?? "";

  const filteredUsers = users.filter((user) => {
    const matchesRole = activeRole === "All" || user.role === activeRole;
    const matchesQuery =
      !query ||
      user.fullName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query);
    return matchesRole && matchesQuery;
  });

  function tabHref(tab: string) {
    const params = new URLSearchParams();
    if (tab !== "All") params.set("role", tab);
    if (q) params.set("q", q);
    const queryString = params.toString();
    return queryString ? `/admin/users?${queryString}` : "/admin/users";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl">Users</h1>

        <form action="/admin/users" className="flex gap-2">
          {activeRole !== "All" && (
            <input type="hidden" name="role" value={activeRole} />
          )}
          <Input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search name or email"
            className="w-64"
          />
          <Button type="submit" size="sm" variant="outline">
            Search
          </Button>
        </form>
        <AddUserButton />
      </div>

      <div className="flex flex-wrap gap-2">
        {roleTabs.map((tab) => (
          <Link
            key={tab}
            href={tabHref(tab)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm transition-colors",
              activeRole === tab
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-accent"
            )}
          >
            {tab}
          </Link>
        ))}
      </div>

      <section className="rounded-2xl border border-border bg-card">
        <div className="px-5 py-4 text-sm text-muted-foreground">
          {filteredUsers.length} users
        </div>

        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <Users className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">User in not found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-y border-border text-xs uppercase text-muted-foreground">
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-accent/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-highlight">
                          {user.fullName.charAt(0).toUpperCase()}
                        </span>
                        <div className="leading-tight">
                          <p>{user.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium",
                          roleStyles[user.role]
                        )}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium",
                          user.isActive
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-rose-500/15 text-rose-400"
                        )}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <UserRowActions
                        user={user}
                        isSelf={currentUser?.userId === user.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}