"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/home" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex items-center justify-between h-16 px-6 mx-auto max-w-7xl">

        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight transition-opacity hover:opacity-80"
        >
          ZikoRetire
        </Link>

        {/* Navigation */}
        <div className="items-center hidden gap-10 text-sm font-medium md:flex">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative inline-block group"
              >
                <span
                  className={`transition-colors duration-200 ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-primary"
                  }`}
                >
                  {link.name}
                </span>

                {/* Blue animated underline */}
                <span
                  className={`absolute left-0 -bottom-[6px] h-[2px] w-full origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100 ${
                    isActive ? "scale-x-100" : ""
                  }`}
                />
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard/simulation">
            <Button className="px-5">Start Planning</Button>
          </Link>
        </div>

      </div>
    </nav>
  );
}