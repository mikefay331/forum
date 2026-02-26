import { Metadata } from "next";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = { title: "Sign Up" };

export default function SignupPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <SignupForm />
    </div>
  );
}
