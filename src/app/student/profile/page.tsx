import { Mail, ShieldCheck, User } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";

export default async function StudentProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    return <p className="text-destructive">User information is unavailable.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl">Profile</h1>

      <div className="max-w-md space-y-4 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-heading text-primary-foreground">
            {user.fullName.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="font-heading text-lg">{user.fullName}</p>
            <p className="text-sm text-muted-foreground">{user.role}</p>
          </div>
        </div>

        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center gap-3 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Full Name:</span>
            <span>{user.fullName}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Email:</span>
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Role:</span>
            <span>{user.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}