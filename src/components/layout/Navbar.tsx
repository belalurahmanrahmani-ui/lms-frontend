"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { GraduationCap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/layout/LogoutButton";
import type { AuthUser } from "@/types/auth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
];

const dashboardPathByRole: Record<AuthUser["role"], string> = {
  Admin: "/admin/dashboard",
  Teacher: "/teacher/dashboard",
  Student: "/student/dashboard",
};

export function Navbar({ user }: { user: AuthUser | null }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="font-heading text-xl">LMS</span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors hover:text-foreground ${
                pathname === link.href
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">
                Hi, {user.fullName}
              </span>
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link href={dashboardPathByRole[user.role]}>Dashboard</Link>}
              />
              <LogoutButton />
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href="/login">Login</Link>}
              />
              <Button
                size="sm"
                nativeButton={false}
                render={<Link href="/register">Get Started</Link>}
              />
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="border-t border-border md:hidden">
          <nav className="flex flex-col gap-1 px-6 py-4 ">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-2 flex flex-col gap-2">
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    nativeButton={false}
                    render={
                      <Link
                        href={dashboardPathByRole[user.role]}
                        onClick={() => setIsOpen(false)}
                      >
                        Dashboard
                      </Link>
                    }
                  />
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        Login
                      </Link>
                    }
                  />
                  <Button
                    size="sm"
                    nativeButton={false}
                    render={
                      <Link href="/register" onClick={() => setIsOpen(false)}>
                        Get Started
                      </Link>
                    }
                  />
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}