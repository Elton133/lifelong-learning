"use client";

import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

// const navLinks = [
//   { label: "About", href: "/about" },

// ];

export default function LifelongLearningNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 transition-all duration-300
          ${scrolled
            ? "bg-white/95 dark:bg-slate-950/95 shadow-sm backdrop-blur-lg border-b border-border"
            : "bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-border"
          }`}
      >
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-white font-bold text-sm">LL</span>
          </div>
          <span className="font-bold text-lg text-gray-900 dark:text-white">Lifelong Learning</span>
        </Link>

        {/* Desktop Links */}
        {/* <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-gray-900 dark:text-white hover:text-gray-500 dark:hover:text-gray-300 transition-colors font-medium"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </div> */}

        {/* Actions + Mobile Toggle */}
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/login" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-700  transition">
            Sign in
          </Link>
          <Link href="/signup" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#050A30] text-white transition">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-full hover:bg-gray-100/20 dark:hover:bg-gray-800/30 transition"
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              key="panel"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-950 rounded-t-3xl p-8 pt-12 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center w-full gap-6">
                {/* {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Link
                      href={link.href}
                      className="text-2xl font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))} */}

                {/* Mobile Sign in / Get Started */}
                <Link href="/login" className="w-full text-center px-4 py-3 rounded-full font-medium hover:bg-gray-700 transition" >
                  Sign in
                </Link>
                <Link href="/signup" className="w-full text-center px-4 py-3 rounded-full bg-[#050A30] text-white font-medium hover:bg-[#130e1a] transition">
                  Get Started
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
