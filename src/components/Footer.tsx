'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import SvgIcon from '@/components/ui/SvgIcon'

export default function Footer() {
  // Fix hydration issue by using a static year initially
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Use static year to prevent hydration mismatch
  const displayYear = isClient ? new Date().getFullYear() : 2025

  return (
    <footer className="relative bg-card border-t overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      
      {/* Main Footer */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-6 group">
              <span className="text-2xl font-inter font-bold tracking-tight">
                <span className="text-foreground font-light">ACAD</span>
                <span className="text-brand font-bold">EX</span>
              </span>
            </Link>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Join thousands of students who are already mastering English with our innovative platform.
            </p>
            <div className="flex space-x-3">
              {/* Facebook - available */}
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-md border bg-white hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all duration-200"
                aria-label="Facebook"
              >
                <SvgIcon icon="about" size={16} />
              </a>
              
              {/* Twitter - using alternative icon */}
              <a 
                href="#" 
                className="w-10 h-10 rounded-md border bg-white hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all duration-200"
                aria-label="Twitter"
              >
                <SvgIcon icon="code" size={16} />
              </a>
              
              {/* LinkedIn - using briefcase icon */}
              <a 
                href="#" 
                className="w-10 h-10 rounded-md border bg-white hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all duration-200"
                aria-label="LinkedIn"
              >
                <SvgIcon icon="briefcase" size={16} />
              </a>
              
              {/* Contact/Email */}
              <a 
                href="mailto:contact@acadex.com" 
                className="w-10 h-10 rounded-md border bg-white hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all duration-200"
                aria-label="Contact Us"
              >
                <SvgIcon icon="paperclip" size={16} />
              </a>
            </div>
          </div>

          {/* English Courses */}
          <div>
            <h3 className="text-sm font-semibold mb-4">English Courses</h3>
            <ul className="space-y-3">
              {[
                { name: "Grammar Mastery", href: "/courses/grammar", icon: "document" },
                { name: "Vocabulary Builder", href: "/courses/vocabulary", icon: "dictionary" },
                { name: "Pronunciation Training", href: "/courses/pronunciation", icon: "microphone" },
                { name: "Business English", href: "/courses/business-english", icon: "briefcase" }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm flex items-center gap-2"
                  >
                    <SvgIcon icon={link.icon} size={14} />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {[
                { name: "Help Center", href: "/help", icon: "info" },
                { name: "Contact Us", href: "/contact", icon: "connect" },
                { name: "Community", href: "/community", icon: "users" },
                { name: "Blog", href: "/blog", icon: "document" },
                { name: "Careers", href: "/careers", icon: "briefcase" }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm flex items-center gap-2"
                  >
                    <SvgIcon icon={link.icon} size={14} />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {[
                { name: "About Us", href: "/about", icon: "info" },
                { name: "Privacy Policy", href: "/privacy", icon: "document" },
                { name: "Terms of Service", href: "/terms", icon: "document" },
                { name: "Cookie Policy", href: "/cookie-policy", icon: "document" },
                { name: "Accessibility", href: "/accessibility", icon: "connect" }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm flex items-center gap-2"
                  >
                    <SvgIcon icon={link.icon} size={14} />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="relative border-t">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Join Our English Learning Community</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Get IELTS tips, grammar guides, vocabulary lessons, and exclusive English learning resources delivered to your inbox.
            </p>
            <div className="max-w-md mx-auto flex gap-3">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
                <SvgIcon icon="angleRight" variant="white" size={14} />
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="relative border-t">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              © {displayYear} ACADEX. All rights reserved. Made with <SvgIcon icon="heart" size={16} className="inline text-red-500" /> for learners worldwide.
            </p>
            <div className="flex items-center space-x-6">
              {[
                { name: "Sitemap", href: "/sitemap", icon: "settings" },
                { name: "Status", href: "/status", icon: "check" },
                { name: "Security", href: "/security", icon: "lock" }
              ].map((link) => (
                <Link 
                  key={link.name}
                  href={link.href} 
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200 flex items-center gap-1"
                >
                  <SvgIcon icon={link.icon} size={12} />
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
