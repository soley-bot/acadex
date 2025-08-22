'use client'

import Link from 'next/link'
import { 
  Heart, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram 
} from 'lucide-react'
import { Container } from '@/components/ui/Layout'
import { useHydrationSafe } from '@/hooks/useHydrationSafe'
import { NewsletterSignup } from './NewsletterSignup'

export function Footer() {
  const mounted = useHydrationSafe()
  
  // Always use same year to prevent hydration mismatch
  // Update manually when year changes, or use mounted state for dynamic year
  const currentYear = 2025

  return (
    <footer className="relative bg-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      
      {/* Main Footer */}
      <Container size="xl" className="relative py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-6 group">
              <span className="text-3xl font-black tracking-tight">
                <span className="text-secondary">ACAD</span>
                <span className="text-[hsl(var(--primary))]">E</span>
                <span className="text-secondary">X</span>
              </span>
            </Link>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Built from scratch for Cambodian learners.
              Simple lessons. Real skills. No pressure.
            </p>
            <div className="mb-8">
              <p className="text-gray-600 mb-2">
                Email: acadex@gmail.com
              </p>
              <p className="text-gray-600">
                Based in Phnom Penh, Cambodia
              </p>
            </div>
          </div>

          {/* Courses */}
          <div>
            <h3 className="text-lg font-semibold text-secondary mb-6">Courses</h3>
            <ul className="space-y-4">
              {[
                { name: "English for Daily Use", href: "/courses/english-daily" },
                { name: "Grammar & Vocabulary", href: "/courses/grammar-vocabulary" },
                { name: "Communication Skills", href: "/courses/communication" },
                { name: "Study & Productivity", href: "/courses/study-productivity" }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 hover:text-secondary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold text-secondary mb-6">Support</h3>
            <ul className="space-y-4">
              {[
                { name: "Help Center (coming soon)", href: "#" },
                { name: "Contact Us", href: "/contact" },
                { name: "Suggest a Course", href: "/contact?subject=course-suggestion" },
                { name: "FAQ", href: "/faq" }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 hover:text-primary transition-colors duration-300 font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold text-secondary mb-6">Company</h3>
            <ul className="space-y-4">
              {[
                { name: "About Acadex", href: "/about" },
                { name: "Privacy Policy", href: "/privacy" },
                { name: "Terms of Service", href: "/terms" }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 hover:text-primary transition-colors duration-300 font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      {/* Newsletter Section */}
      <div className="relative border-t border-gray-200">
        <Container size="xl" className="py-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-secondary mb-4">Join Our Learning Community</h2>
            <p className="text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Get tips, mini-lessons, and new course updates — sent right to your inbox.
            </p>
            <NewsletterSignup />
          </div>
        </Container>
      </div>

      {/* Bottom Footer */}
      <div className="relative border-t border-gray-200">
        <Container size="xl" className="py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
            <div suppressHydrationWarning>
              <p className="text-gray-600 font-medium text-center md:text-left">
                © {currentYear} Acadex. All rights reserved.
                <br className="sm:hidden" />
                <span className="block sm:inline sm:ml-2">Made with <Heart size={16} className="inline text-red-500" /> in Cambodia. Powered by persistence.</span>
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              {[
                { name: "Sitemap", href: "/sitemap" },
                { name: "Terms", href: "/terms" },
                { name: "Status", href: "/status" }
              ].map((link) => (
                <Link 
                  key={link.name}
                  href={link.href} 
                  className="text-gray-600 hover:text-primary transition-colors duration-300 font-medium text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </footer>
  )
}
