"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { Eye, EyeOff } from "lucide-react";
import SessionManager from "@/lib/sessionManager";
import { useToast } from "@/hooks/use-toast";

export default function SignInPage() {

  const router = useRouter();
  const { toast } = useToast();

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
        toast({
          title: "Connection Error",
          description: "No response from auth server",
          variant: "destructive"
        });
        return;
      }

      if (res.error) {
        toast({
          title: "Sign in failed",
          description: "Invalid email or password",
          variant: "destructive"
        });
        return;
      }

      // Get current session
      const session = await getSession();

      if (!session?.user) {

        router.push("/dashboard");
        return;

      }

      // Clear other sessions for this user and set current session
      SessionManager.clearOtherSessionsForUser(session.user.id);
      SessionManager.setCurrentTabSession(session);

      // ⭐ Role redirect

      if (session.user.role === "ADMIN") {
        toast({ title: "Welcome back!", description: "Signed in successfully as Admin." });
        router.push("/admin/dashboard");
      } else {
        toast({ title: "Welcome back!", description: "Signed in successfully." });
        router.push("/dashboard");
      }

    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive"
      });
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

      <div className="text-right">
  <Link
    href="/auth/forgot-password"
    className="text-sm text-[#0606EA] hover:underline"
  >
    Forgot password?
  </Link>
</div>

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