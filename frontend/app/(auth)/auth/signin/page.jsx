"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { Eye, EyeOff } from "lucide-react";

export default function SignInPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(e) {

    e.preventDefault();

    setLoading(true);

    try {

      const res = await signIn("credentials", {

        email,
        password,
        redirect: false,

      });

      if (!res) {

        alert("No response from auth server");
        return;

      }

      if (res.error) {

        alert("Invalid email or password");
        return;

      }

      const session =
        await getSession();

      if (!session?.user) {

        router.push("/dashboard");
        return;

      }

      // ⭐ Role redirect

      if (session.user.role === "ADMIN") {

        router.push("/admin/dashboard");

      } else {

        router.push("/dashboard");

      }

    } catch (error) {

      console.error(error);
      alert("Something went wrong");

    } finally {

      setLoading(false);

    }

  }

  return (

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

      {/* PASSWORD */}

      <div className="space-y-2">

        <Label htmlFor="password">
          Password
        </Label>

        <div className="relative">

          <Input
            id="password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="pr-10"
            required
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(!showPassword)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#0606EA] transition"
          >

            {showPassword
              ? <EyeOff size={18} />
              : <Eye size={18} />
            }

          </button>

        </div>

      </div>

      {/* BUTTON */}

      <Button
        type="submit"
        className="w-full text-base h-11"
        disabled={loading}
      >

        {loading
          ? "Signing in..."
          : "Sign In"
        }

      </Button>

      {/* SIGNUP LINK */}

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