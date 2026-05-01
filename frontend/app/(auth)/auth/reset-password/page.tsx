"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {

  const params = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);

    try {

      const res = await fetch(
        "/api/auth/reset-password",
        {
          method: "POST",
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const data = await res.json();

      setMessage(data.message || data.error);

    } finally {

      setLoading(false);

    }
  };

  return (

    <div className="space-y-5">

      <h1 className="text-2xl font-bold">
        Reset Password
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        {/* PASSWORD */}

        <div className="space-y-2">

          <Label>
            New Password
          </Label>

          <Input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

        </div>

        {/* BUTTON */}

        <Button
          className="w-full text-base h-11"
          disabled={loading}
        >

          {loading
            ? "Resetting..."
            : "Reset Password"
          }

        </Button>

      </form>

      {/* MESSAGE */}

      {message && (
        <p className="text-sm">
          {message}
        </p>
      )}

    </div>

  );
}