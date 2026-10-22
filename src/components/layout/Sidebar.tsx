"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  User,
  PlusCircle,
  GraduationCap,
  Users,
  Tags,
  type LucideIcon,
} from "lucide-react";


// import { LayoutDashboard, BookOpen, User, PlusCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type SidebarLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

// آیتمی فعال است که طولانی‌ترین مسیر منطبق را دارد
// (تا در /teacher/courses/5 آیتم «My Courses» فعال بماند، ولی /create دو آیتم را فعال نکند)
export function getActiveHref(pathname: string, links: SidebarLink[]) {
  return links
    .filter(
      (link) => pathname === link.href || pathname.startsWith(link.href + "/")
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

export function Sidebar({ links }: { links: SidebarLink[] }) {
    const pathname = usePathname();
  const activeHref = getActiveHref(pathname, links);

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card/40 md:block">
      <div className="sticky top-0 flex h-screen flex-col gap-1 p-4">
        <Link href="/" className="mb-6 flex items-center gap-2 px-2 pt-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="font-heading text-xl">LMS</span>
        </Link>

        {links.map((link) => {
          const Icon = link.icon;
          const isActive = link.href === activeHref;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
export const studentLinks: SidebarLink[] = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/courses", label: "My Courses", icon: BookOpen },
  { href: "/student/profile", label: "Profile", icon: User },
];
export const teacherLinks: SidebarLink[] = [
  { href: "/teacher/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teacher/courses", label: "My Courses", icon: BookOpen },
  { href: "/teacher/courses/create", label: "Create Course", icon: PlusCircle },
  { href: "/teacher/profile", label: "Profile", icon: User },
];
export const adminLinks: SidebarLink[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/categories", label: "Categories", icon: Tags },
];
