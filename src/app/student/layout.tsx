import { Sidebar, studentLinks } from "@/components/layout/Sidebar";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { getCurrentUser } from "@/lib/auth/session";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen">
      <Sidebar links={studentLinks} />

      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-border px-6">
          <span className="font-heading text-lg">Student Panel</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {user?.fullName}
            </span>
            <LogoutButton />
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}