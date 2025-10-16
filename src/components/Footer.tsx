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
import { Logo } from './ui/Logo'

export function Footer() {
  const mounted = useHydrationSafe()
  
  // Always use same year to prevent hydration mismatch
  const currentYear = 2025

  return (
    <footer className="relative bg-background overflow-hidden">
      {/* Simplified Background Elements - Less intensive */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/3 rounded-full opacity-60"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-secondary/3 rounded-full opacity-60"></div>
      
      {/* Main Footer */}
      <div className="container-wide section-spacing">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <Logo 
                size="lg" 
                className="group-hover:scale-105 transition-transform duration-200" 
              />
              <span className="text-3xl font-black tracking-tight group-hover:scale-105 transition-transform duration-200">
                <span className="text-foreground">ACAD</span>
                <span className="text-primary">E</span>
                <span className="text-foreground">X</span>
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Targeted IELTS prep, built by an educator to help you master the skills you need for a high score.
            </p>
            <div className="mb-8">
              <p className="text-muted-foreground mb-2">
                Email: academyacadex@gmail.com
              </p>
              <p className="text-muted-foreground">
                Based in Phnom Penh, Cambodia
              </p>
            </div>
          </div>

          {/* Practice */}
          <div>
            <h3 className="text-base md:text-lg font-semibold text-primary mb-6">Practice</h3>
            <ul className="space-y-4">
              {[
                { name: "IELTS Writing Skill Pack", href: "/quizzes" },
                { name: "Vocabulary Quizzes", href: "/quizzes?category=ielts-vocabulary" },
                { name: "Grammar Drills", href: "/quizzes?category=ielts-grammar" },
                { name: "Try a Free Quiz", href: "/quizzes/free-sample" }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-base md:text-lg font-semibold text-primary mb-6">Support</h3>
            <ul className="space-y-4">
              {[
                { name: "Help Center (coming soon)", href: "#" },
                { name: "Contact Us", href: "/contact" },
                { name: "Suggest a Feature", href: "/contact?subject=feature-suggestion" }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-muted-foreground hover:text-primary transition-colors duration-300 font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-base md:text-lg font-semibold text-primary mb-6">Company</h3>
            <ul className="space-y-4">
              {[
                { name: "About Acadex", href: "/about" },
                { name: "Privacy Policy", href: "/privacy" },
                { name: "Terms of Service", href: "/terms" }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-muted-foreground hover:text-primary transition-colors duration-300 font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="relative border-t border-border">
        <div className="container-wide section-spacing-sm">
          <div className="text-center">
            <h2 className="text-section-title mb-4">Get an Edge on the Exam</h2>
            <p className="text-section-subtitle mb-8 max-w-3xl mx-auto leading-relaxed">
              Get IELTS tips, mini-lessons, and updates on new Skill Packs — sent right to your inbox.
            </p>
            <NewsletterSignup />
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="relative border-t border-border">
        <div className="container-wide section-spacing-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
            <div>
              <p className="text-muted-foreground font-medium text-center md:text-left">
                © {currentYear} <span className="font-black tracking-tight">
                  <span className="text-foreground">ACAD</span>
                  <span className="text-primary">E</span>
                  <span className="text-foreground">X</span>
                </span>. All rights reserved.
                <br className="sm:hidden" />
                <span className="block sm:inline sm:ml-2">Made with <Heart size={16} className="inline text-destructive" /> in Cambodia. Powered by persistence.</span>
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              {[
                { name: "Terms", href: "/terms" },
                { name: "Privacy", href: "/privacy" }
              ].map((link) => (
                <Link 
                  key={link.name}
                  href={link.href} 
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

