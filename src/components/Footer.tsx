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
    <footer className="relative bg-foreground overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-background/5 rounded-full blur-3xl"></div>
      
      {/* Main Footer */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-6 group">
              <span className="text-3xl font-black tracking-tight">
                <span className="text-white">ACAD</span>
                <span className="text-red-600">E</span>
                <span className="text-white">X</span>
              </span>
            </Link>
            <p className="text-gray-300 mb-8 leading-relaxed text-lg">
              Join thousands of students who are already mastering skills with our innovative platform.
            </p>
            <div className="flex space-x-4">
              {/* Social Links */}
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-lg bg-red-600 hover:bg-primary flex items-center justify-center text-white transition-all duration-200 font-bold text-lg"
                aria-label="Facebook"
              >
                f
              </a>
              
              <a 
                href="#" 
                className="w-12 h-12 rounded-lg bg-red-600 hover:bg-primary flex items-center justify-center text-white transition-all duration-200 font-bold text-lg"
                aria-label="Twitter"
              >
                t
              </a>
              
              <a 
                href="#" 
                className="w-12 h-12 rounded-lg bg-red-600 hover:bg-primary flex items-center justify-center text-white transition-all duration-200 font-bold text-sm"
                aria-label="LinkedIn"
              >
                in
              </a>
              
              <a 
                href="mailto:contact@acadex.com" 
                className="w-12 h-12 rounded-lg bg-red-600 hover:bg-primary flex items-center justify-center text-white transition-all duration-200 font-bold text-lg"
                aria-label="Contact Us"
              >
                @
              </a>
            </div>
          </div>

          {/* Courses */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-background">Popular Courses</h3>
            <ul className="space-y-4">
              {[
                { name: "Web Development", href: "/courses/web-development" },
                { name: "Data Science", href: "/courses/data-science" },
                { name: "Digital Marketing", href: "/courses/digital-marketing" },
                { name: "Business Skills", href: "/courses/business-skills" }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-base"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-background">Support</h3>
            <ul className="space-y-4">
              {[
                { name: "Help Center", href: "/help" },
                { name: "Contact Us", href: "/contact" },
                { name: "Community", href: "/community" },
                { name: "Blog", href: "/blog" },
                { name: "Careers", href: "/careers" }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-base"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-background">Company</h3>
            <ul className="space-y-4">
              {[
                { name: "About Us", href: "/about" },
                { name: "Privacy Policy", href: "/privacy" },
                { name: "Terms of Service", href: "/terms" },
                { name: "Cookie Policy", href: "/cookie-policy" },
                { name: "Accessibility", href: "/accessibility" }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-base"
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
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-black mb-4 text-background">Join Our Learning Community</h3>
            <p className="text-gray-300 mb-8 max-w-3xl mx-auto text-lg leading-relaxed">
              Get tips, guides, lessons, and exclusive learning resources delivered to your inbox.
            </p>
            <div className="max-w-lg mx-auto flex gap-4">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 border border-border bg-secondary text-background rounded-lg focus:ring-2 focus:ring-primary focus:border-primary placeholder-muted-foreground"
              />
              <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-xl">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="relative border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-300 text-base">
              © {displayYear} ACADEX. All rights reserved. Made with love for learners worldwide.
            </p>
            <div className="flex items-center space-x-8">
              {[
                { name: "Sitemap", href: "/sitemap" },
                { name: "Status", href: "/status" },
                { name: "Security", href: "/security" }
              ].map((link) => (
                <Link 
                  key={link.name}
                  href={link.href} 
                  className="text-gray-300 hover:text-white text-base transition-colors duration-200"
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
