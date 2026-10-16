"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { callBackend } from "@/lib/api/browser";

const roles = [
  { label: "Student", value: 2 },
  { label: "Teacher", value: 1 },
  { label: "Admin", value: 0 },
];

const labelClass = "mb-1 block text-sm text-muted-foreground";

export function AddUserButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button type="button" size="sm" onClick={() => setIsOpen(true)}>
        <UserPlus className="mr-1.5 h-4 w-4" />
        Add User
      </Button>

      {isOpen && (
        <Modal title="Add User" onClose={() => setIsOpen(false)}>
          <AddUserForm onDone={() => setIsOpen(false)} />
        </Modal>
      )}
    </>
  );
}

function AddUserForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await callBackend("Admin/users", "POST", {
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      role,
    });

    setIsLoading(false);

    if (!result.ok) {
      setError(result.errorMessage);
      return;
    }

    router.refresh();
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="add-fullName" className={labelClass}>
          Full name
        </label>
        <Input
          id="add-fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          minLength={3}
          maxLength={100}
        />
      </div>

      <div>
        <label htmlFor="add-email" className={labelClass}>
          Email
        </label>
        <Input
          id="add-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="add-password" className={labelClass}>
          Password
        </label>
        <Input
          id="add-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          maxLength={100}
        />
      </div>

      <div>
        <label htmlFor="add-role" className={labelClass}>
          Role
        </label>
        <select
          id="add-role"
          value={role}
          onChange={(e) => setRole(Number(e.target.value))}
          className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {roles.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onDone} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create User"}
        </Button>
      </div>
    </form>
  );
}