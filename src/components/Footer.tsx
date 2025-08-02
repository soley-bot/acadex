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
    <footer className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl"></div>
      
      {/* Main Footer */}
      <Container size="xl" className="relative py-16">
        <Grid cols={1} className="md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-6 group">
              <span className="text-3xl font-black tracking-tight">
                <span className="text-white">ACAD</span>
                <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">E</span>
                <span className="text-white">X</span>
              </span>
            </Link>
            <BodyLG color="muted-light" className="mb-8 leading-relaxed">
              Join thousands of students who are already mastering skills with our innovative platform.
            </BodyLG>
            <Flex gap="md">
              {/* Social Links */}
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 flex items-center justify-center text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                aria-label="Facebook"
              >
                <Icon name="facebook" size={20} color="white" />
              </a>
              
              <a 
                href="#" 
                className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 flex items-center justify-center text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                aria-label="Twitter"
              >
                <Icon name="twitter" size={20} color="white" />
              </a>
              
              <a 
                href="#" 
                className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 flex items-center justify-center text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                aria-label="LinkedIn"
              >
                <Icon name="linkedin" size={20} color="white" />
              </a>
              
              <a 
                href="mailto:contact@acadex.com" 
                className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 flex items-center justify-center text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                aria-label="Contact Us"
              >
                <Icon name="mail" size={20} color="white" />
              </a>
            </Flex>
          </div>

          {/* Courses */}
          <div>
            <H3 className="mb-6 text-white">Popular Courses</H3>
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
                    className="hover:text-white transition-colors duration-200"
                  >
                    <BodyMD color="muted-light">{link.name}</BodyMD>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <H3 className="mb-6 text-white">Support</H3>
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
                    className="hover:text-red-400 transition-colors duration-300 font-medium"
                  >
                    <BodyMD color="muted-light">{link.name}</BodyMD>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <H3 className="mb-6 text-white">Company</H3>
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
                    className="hover:text-red-400 transition-colors duration-300 font-medium"
                  >
                    <BodyMD color="muted-light">{link.name}</BodyMD>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Grid>
      </Container>

      {/* Newsletter Section */}
      <div className="relative border-t border-white/20">
        <Container size="xl" className="py-12">
          <div className="text-center">
            <H2 className="mb-4 text-white">Join Our Learning Community</H2>
            <BodyLG color="muted-light" className="mb-8 max-w-3xl mx-auto leading-relaxed">
              Get tips, guides, lessons, and exclusive learning resources delivered to your inbox.
            </BodyLG>
            <div className="max-w-lg mx-auto">
              <Flex direction="col" gap="sm" className="sm:flex-row sm:gap-md">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 sm:px-6 sm:py-4 border border-white/30 backdrop-blur-lg bg-white/20 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder-gray-200 font-medium text-sm sm:text-base"
                />
                <button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base whitespace-nowrap">
                  Subscribe
                </button>
              </Flex>
            </div>
          </div>
        </Container>
      </div>

      {/* Bottom Footer */}
      <div className="relative border-t border-white/20">
        <Container size="xl" className="py-8">
          <Flex direction="col" align="center" justify="between" className="md:flex-row gap-4 md:gap-0">
            <BodyMD color="muted-light" className="font-medium text-center md:text-left">
              © {displayYear} ACADEX. All rights reserved. Made with love for learners worldwide.
            </BodyMD>
            <Flex align="center" gap="md" className="flex-wrap justify-center">
              {[
                { name: "Sitemap", href: "/sitemap" },
                { name: "Status", href: "/status" },
                { name: "Security", href: "/security" }
              ].map((link) => (
                <Link 
                  key={link.name}
                  href={link.href} 
                  className="hover:text-red-400 transition-colors duration-300 font-medium"
                >
                  <BodyMD color="muted-light">{link.name}</BodyMD>
                </Link>
              ))}
            </Flex>
          </Flex>
        </Container>
      </div>
    </footer>
  )
}
