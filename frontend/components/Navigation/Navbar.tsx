"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 rounded-2xl border border-gray-200 bg-gray-900/95 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
          {/* Logo */}
          <Link
            href="/home"
            className="flex items-center transition-all duration-300 shrink-0 hover:opacity-80 hover:scale-105"
          >
            <Image
              src="/logo/zikoretire_logo.png"
              alt="ZikoRetire Logo"
              width={40}
              height={40}
              className="h-10 w-10"
            />
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex md:items-center md:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-all duration-300 relative group hover:scale-105 ${
                  pathname === link.href 
                    ? "text-white" 
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {link.name}
                <span className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${
                  pathname === link.href 
                    ? "w-full bg-white" 
                    : "w-0 bg-white group-hover:w-full"
                }`}></span>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M12 12h12" />
                )}
              </svg>
            </Button>
          </div>

          {/* CTA - Hidden on mobile when menu is closed */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/dashboard">
              <Button className="px-5 bg-white text-gray-900 hover:bg-gray-100 transition-all duration-300 shadow-md rounded-xl hover:shadow-lg hover:scale-105">
                Start Planning
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 px-4 py-4 rounded-2xl border border-gray-200 bg-gray-900/95 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-all duration-300 relative group py-2 hover:scale-105 ${
                    pathname === link.href 
                      ? "text-white" 
                      : "text-gray-300 hover:text-white"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                  <span className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${
                    pathname === link.href 
                      ? "w-full bg-white" 
                      : "w-0 bg-white group-hover:w-full"
                  }`}></span>
                </Link>
              ))}
              <div className="pt-4 border-t border-white/10">
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full px-5 bg-white text-gray-900 hover:bg-gray-100 transition-all duration-300 shadow-md rounded-xl hover:shadow-lg hover:scale-105">
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