"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { callBackend } from "@/lib/api/browser";
import type { AdminUser } from "@/types/user";

export function UserForm({
  user,
  onDone,
}: {
  user: AdminUser;
  onDone: () => void;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [profileImage, setProfileImage] = useState(user.profileImage ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await callBackend(`Admin/users/${user.id}`, "PUT", {
      fullName: fullName.trim(),
      email: email.trim(),
      profileImage: profileImage.trim() || null,
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
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="user-name">Full Name</Label>
        <Input
          id="user-name"
          required
          minLength={3}
          maxLength={100}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="user-email">Email</Label>
        <Input
          id="user-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="user-image">Profile Image URL (optional)</Label>
        <Input
          id="user-image"
          type="url"
          value={profileImage}
          onChange={(e) => setProfileImage(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? " Saveing ..." : "Save Changes"}
      </Button>
    </form>
  );
}