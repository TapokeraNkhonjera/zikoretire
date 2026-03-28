"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react"; // For show/hide icons

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  const res = await signIn("credentials", {
    email,
    password,
    redirect: false,
  });


  setLoading(false);

  if (!res) {
    alert("No response from auth server");
    return;
  }

  if (res.error) {
    alert("Invalid email or password");
  } else {
    router.push("/dashboard/simulation");
  }
}

  return (
<form onSubmit={handleSubmit} className="space-y-5">

  {/* EMAIL */}
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input
      id="email"
      type="email"
      placeholder="email@example.com"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
  </div>

  {/* PASSWORD */}
  <div className="space-y-2">
    <Label htmlFor="password">Password</Label>

    <div className="relative">
      <Input
        id="password"
        type={showPassword ? "text" : "password"}
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="pr-10"
      />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#0606EA] transition"
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>

  {/* BUTTON */}
  <Button type="submit" className="w-full h-11 text-base">
    {loading ? "Signing in..." : "Sign In"}
  </Button>

  {/* LINK */}
  <p className="text-sm text-center text-muted-foreground">
    Don’t have an account?{" "}
    <Link
      href="/auth/signup"
      className="text-[#0606EA] font-medium hover:underline"
    >
      Sign up
    </Link>
  </p>
</form>
  );
}