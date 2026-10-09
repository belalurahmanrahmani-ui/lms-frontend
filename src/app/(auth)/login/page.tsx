import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Login to continue learning"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary underline-offset-4 hover:underline">
            Register
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}