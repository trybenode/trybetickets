'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="/trybetckets-logo.png" 
              alt="TrybeTickets Logo" 
              width={180} 
              height={40}
              className="h-20 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/events" className="text-[#454040] hover:text-[#a855f7] transition-colors font-medium">
              Browse Events
            </Link>
            <Link href="/organizers" className="text-[#454040] hover:text-[#a855f7] transition-colors font-medium">
              For Organizers
            </Link>
            <Link href="/about" className="text-[#454040] hover:text-[#a855f7] transition-colors font-medium">
              About
            </Link>
            <Link href="/contact" className="text-[#454040] hover:text-[#a855f7] transition-colors font-medium">
              Contact
            </Link>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="purple" size="sm">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#454040] hover:text-[#a855f7]"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3">
            <Link href="/events" className="block py-2 text-[#454040] hover:text-[#a855f7] font-medium">
              Browse Events
            </Link>
            <Link href="/organizers" className="block py-2 text-[#454040] hover:text-[#a855f7] font-medium">
              For Organizers
            </Link>
            <Link href="/about" className="block py-2 text-[#454040] hover:text-[#a855f7] font-medium">
              About
            </Link>
            <Link href="/contact" className="block py-2 text-[#454040] hover:text-[#a855f7] font-medium">
              Contact
            </Link>
            <div className="pt-3 space-y-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" fullWidth>
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="purple" size="sm" fullWidth>
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
