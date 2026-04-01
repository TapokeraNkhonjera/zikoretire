"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";


export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    router.push("/auth/signin");
  }

  return (
<form onSubmit={handleSubmit} className="space-y-5">

  {/* NAME */}
  <div className="space-y-2">
    <Label>Name</Label>
    <Input
      placeholder="John Doe"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
  </div>

  {/* EMAIL */}
  <div className="space-y-2">
    <Label>Email</Label>
    <Input
      type="email"
      placeholder="email@example.com"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
  </div>

  {/* PASSWORD */}
  <div className="space-y-2">
    <Label>Password</Label>
    <Input
      type="password"
      placeholder="Create a password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
  </div>

  {/* BUTTON */}
  <Button type="submit" className="w-full h-11 text-base">
    Create Account
  </Button>

  {/* LINK */}
  <p className="text-sm text-center text-muted-foreground">
    Already have an account?{" "}
    <Link
      href="/auth/signin"
      className="text-[#0606EA] font-medium hover:underline"
    >
      Sign in
    </Link>
  </p>
</form>

  );
}