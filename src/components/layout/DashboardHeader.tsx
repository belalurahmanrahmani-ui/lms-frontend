import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { LogoutButton } from "@/components/layout/LogoutButton";
import type { AuthUser } from "@/types/auth";

export function DashboardHeader({ user }: { user: AuthUser | null }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-6">
      {/* در موبایل Sidebar پنهان است، پس لوگو اینجا نمایش داده می‌شود */}
      <Link href="/" className="flex items-center gap-2 md:hidden">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="h-5 w-5" />
        </span>
        <span className="font-heading text-lg">LMS</span>
      </Link>

      <div className="ml-auto flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-heading text-primary-foreground">
              {user.fullName.charAt(0).toUpperCase()}
            </span>
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-medium">{user.fullName}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
          </div>
        )}
        <LogoutButton />
      </div>
    </header>
  );
}