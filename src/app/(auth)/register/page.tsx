import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Start learning with expert-led courses"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            Login
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}