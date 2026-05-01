"use client";

import { useState } from "react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);

    try {

      const res = await fetch(
        "/api/auth/forgot-password",
        {
          method: "POST",
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      setMessage(data.message);

    } catch (err) {

      setMessage("Something went wrong");

    } finally {

      setLoading(false);

    }
  };

  return (

    <div className="space-y-5">

      <div className="space-y-1">

        <h1 className="text-2xl font-bold">
          Forgot Password
        </h1>

        <p className="text-sm text-muted-foreground">
          Enter your email to receive a reset link
        </p>

      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        {/* EMAIL */}

        <div className="space-y-2">

          <Label htmlFor="email">
            Email
          </Label>

          <Input
            id="email"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

        </div>

        {/* BUTTON */}

        <Button
          type="submit"
          className="w-full text-base h-11"
          disabled={loading}
        >

          {loading
            ? "Sending..."
            : "Send Reset Link"
          }

        </Button>

      </form>

      {/* MESSAGE */}

      {message && (
        <p className="text-sm text-green-600">
          {message}
        </p>
      )}

      {/* BACK TO LOGIN */}

      <p className="text-sm text-center text-muted-foreground">

        Remember your password?{" "}

        <Link
          href="/auth/signin"
          className="text-[#0606EA] hover:underline"
        >

          Sign in

        </Link>

      </p>

    </div>

  );
}