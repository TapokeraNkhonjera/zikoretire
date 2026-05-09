"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/home" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full px-4 py-4">
      <div className="mx-auto max-w-7xl">
        {/* Glass Container */}
        <div className="flex items-center justify-between h-16 px-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
          {/* Logo */}
          <Link
            href="/home"
            className="flex items-center transition shrink-0 hover:opacity-80"
          >
            <Image
              src="/logo/zikoretire_logo.png"
              alt="ZikoRetire Logo"
              width={80}
              height={20}
              className="object-contain w-auto h-10"
              priority
            />
          </Link>

          {/* Navigation */}
          <div className="items-center hidden gap-2 p-1 md:flex bg-black/5 dark:bg-white/5 rounded-xl">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    relative px-4 py-2 rounded-lg text-sm font-medium 
                    transition-all duration-300
                    ${
                      isActive
                        ? "text-white bg-primary shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
                    }
                  `}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/dashboard">
              <Button className="px-5 transition-all duration-300 shadow-md rounded-xl hover:shadow-lg">
                Start Planning
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 px-4 py-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
            <div className="flex flex-col space-y-2 p-1 bg-black/5 dark:bg-white/5 rounded-xl">
              {navLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`
                      relative px-4 py-2 rounded-lg text-sm font-medium 
                      transition-all duration-300
                      ${
                        isActive
                          ? "text-white bg-primary shadow-md"
                          : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
                      }
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <div className="pt-2 mt-2 border-t border-white/10">
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full px-5 transition-all duration-300 shadow-md rounded-xl hover:shadow-lg">
                    Start Planning
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}