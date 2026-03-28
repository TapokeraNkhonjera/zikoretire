"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NotAuthenticatedPage() {
  const router = useRouter();
  const [count, setCount] = useState(5); // countdown in seconds

  // Countdown effect
  useEffect(() => {
    if (count === 0) {
      router.push("/auth/signin"); // redirect to sign-in
      return;
    }
    const timer = setTimeout(() => setCount(count - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, router]);

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-gray-50 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(99,179,237,0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(99,179,237,0.3) 1px, transparent 1px)
            `,
            backgroundSize: "30px 30px",
            maskImage:
              "radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0.1) 80%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage:
              "radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0.1) 80%, rgba(0,0,0,0) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 py-10 bg-white/80 rounded-2xl shadow-lg max-w-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Not Authenticated
        </h1>
        <p className="text-gray-600 mb-6">
          You must be signed in to access this page.
        </p>
        <p className="text-gray-500 mb-6">
          Redirecting to sign-in in <span className="font-mono">{count}</span>{" "}
          second{count !== 1 ? "s" : ""}.
        </p>
        <Button onClick={() => router.push("/auth/signin")}>Go Now</Button>
      </div>
    </div>
  );
}