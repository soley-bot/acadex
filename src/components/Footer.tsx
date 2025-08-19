'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import Icon from '@/components/ui/Icon'
import { Typography, H2, H3, BodyLG, BodyMD } from '@/components/ui/Typography'
import { Container, Section, Grid, Flex } from '@/components/ui/Layout'

export default function Footer() {
  // Fix hydration issue by using a static year initially
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Use static year to prevent hydration mismatch
  const displayYear = isClient ? new Date().getFullYear() : 2025

  return (
    <footer className="relative bg-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      
      {/* Main Footer */}
      <Container size="xl" className="relative py-16">
        <Grid cols={1} className="md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-6 group">
              <span className="text-3xl font-black tracking-tight">
                <span className="text-secondary">ACAD</span>
                <span className="text-[hsl(var(--primary))]">E</span>
                <span className="text-secondary">X</span>
              </span>
            </Link>
            <BodyLG color="muted" className="mb-6 leading-relaxed">
              Built from scratch for Cambodian learners.
              Simple lessons. Real skills. No pressure.
            </BodyLG>
            <div className="mb-8">
              <BodyMD color="muted" className="mb-2">
                Email: acadex@gmail.com
              </BodyMD>
              <BodyMD color="muted">
                Based in Phnom Penh, Cambodia
              </BodyMD>
            </div>
          </div>

          {/* Courses */}
          <div>
            <H3 className="mb-6 text-secondary">Courses</H3>
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
                    className="hover:text-secondary transition-colors duration-200"
                  >
                    <BodyMD color="muted">{link.name}</BodyMD>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <H3 className="mb-6 text-secondary">Support</H3>
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
                    className="hover:text-primary transition-colors duration-300 font-medium"
                  >
                    <BodyMD color="muted">{link.name}</BodyMD>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <H3 className="mb-6 text-secondary">Company</H3>
            <ul className="space-y-4">
              {[
                { name: "About Acadex", href: "/about" },
                { name: "Privacy Policy", href: "/privacy" },
                { name: "Terms of Service", href: "/terms" }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="hover:text-primary transition-colors duration-300 font-medium"
                  >
                    <BodyMD color="muted">{link.name}</BodyMD>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Grid>
      </Container>

      {/* Newsletter Section */}
      <div className="relative border-t border-gray-200">
        <Container size="xl" className="py-12">
          <div className="text-center">
            <H2 className="mb-4 text-secondary">Join Our Learning Community</H2>
            <BodyLG color="muted" className="mb-8 max-w-3xl mx-auto leading-relaxed">
              Get tips, mini-lessons, and new course updates — sent right to your inbox.
            </BodyLG>
            <div className="max-w-lg mx-auto">
              <Flex direction="col" gap="sm" className="sm:flex-row sm:gap-md">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 sm:px-6 sm:py-4 border border-gray-300 bg-white text-secondary rounded-xl focus:ring-2 focus:ring-primary focus:border-primary placeholder-gray-500 font-medium text-sm sm:text-base"
                />
                <button className="bg-primary hover:bg-secondary text-black hover:text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base whitespace-nowrap">
                  Subscribe
                </button>
              </Flex>
            </div>
          </div>
        </Container>
      </div>

      {/* Bottom Footer */}
      <div className="relative border-t border-gray-200">
        <Container size="xl" className="py-8">
          <Flex direction="col" align="center" justify="between" className="md:flex-row gap-4 md:gap-0">
            <BodyMD color="muted" className="font-medium text-center md:text-left">
              © {displayYear} Acadex. All rights reserved.
              <br className="sm:hidden" />
              <span className="block sm:inline sm:ml-2">Made with love in Cambodia. Powered by persistence.</span>
            </BodyMD>
            <Flex align="center" gap="md" className="flex-wrap justify-center">
              {[
                { name: "Sitemap", href: "/sitemap" },
                { name: "Terms", href: "/terms" },
                { name: "Status", href: "/status" }
              ].map((link) => (
                <Link 
                  key={link.name}
                  href={link.href} 
                  className="hover:text-primary transition-colors duration-300 font-medium text-sm"
                >
                  <BodyMD color="muted">{link.name}</BodyMD>
                </Link>
              ))}
            </Flex>
          </Flex>
        </Container>
      </div>
    </footer>
  )
}
