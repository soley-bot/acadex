'use client'

import { useState } from 'react'
import Image from 'next/image'
import SvgIcon from '@/components/ui/SvgIcon'
import { Button } from '@/components/ui/Button'
import { Container, Section } from '@/components/ui/Layout'
import { ElevatedCard } from '@/components/ui/ElevatedCard'
import { SectionHeading, HeroHeading, Badge } from '@/components/ui/Typography'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Here you would typically send the form data to your backend
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess(true)
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
    } catch (err) {
      setError('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section */}
      <Section variant="muted" spacing="lg">
        <Container className="text-center pt-16 md:pt-20">
          <Badge className="mb-8">
            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
            Contact Us
          </Badge>
          <HeroHeading className="mb-8">
            Get in Touch
            <span className="block text-red-600 mt-2">We&apos;re Here to Help</span>
          </HeroHeading>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Have questions about English learning, IELTS preparation, or need support? Our team is dedicated to helping you 
            achieve English fluency and reach your language goals.
          </p>
        </Container>
      </Section>

      {/* Contact Form and Info */}
      <Section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <ElevatedCard>
              <SectionHeading size="lg" className="mb-6">Send us a Message</SectionHeading>
              
              {success && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 text-lg">✅</span>
                    <p className="text-green-800 font-medium">
                      Thank you for your message! We&apos;ll get back to you within 24 hours.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 text-lg">❌</span>
                    <p className="text-red-800 font-medium">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-bold text-black mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-black mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-bold text-black mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General English Learning</option>
                    <option value="ielts">IELTS Preparation</option>
                    <option value="technical">Technical Support</option>
                    <option value="grammar">Grammar Questions</option>
                    <option value="vocabulary">Vocabulary Building</option>
                    <option value="course">Course Content</option>
                    <option value="feedback">Feedback & Suggestions</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-black mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </div>
                  ) : (
                    'Send Message'
                  )}
                </Button>
              </form>
            </ElevatedCard>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <SectionHeading size="lg" className="mb-6">Get in Touch</SectionHeading>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  We&apos;re here to support your English learning journey and answer any questions about our courses, 
                  IELTS preparation, or platform features. We look forward to hearing from you!
                </p>
              </div>

              <div className="space-y-6">
                <ElevatedCard className="hover:-translate-y-1">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 rounded-full">
                      <span className="text-red-600 text-xl">📧</span>
                    </div>
                    <div>
                      <h3 className="font-bold mb-2 text-black">Email Us</h3>
                      <p className="text-gray-600 mb-2">Send us an email anytime</p>
                      <a href="mailto:acadex@gmail.com" className="text-red-600 hover:text-red-700 font-bold transition-colors duration-200">
                        acadex@gmail.com
                      </a>
                    </div>
                  </div>
                </ElevatedCard>

                <ElevatedCard className="hover:-translate-y-1">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 rounded-full">
                      <span className="text-red-600 text-xl">🕒</span>
                    </div>
                    <div>
                      <h3 className="font-bold mb-2 text-black">Support Hours</h3>
                      <p className="text-gray-600 mb-2">We&apos;re available to help</p>
                      <p className="text-black">
                        Monday - Friday: 9:00 AM - 6:00 PM ICT<br />
                        Weekend: 10:00 AM - 4:00 PM ICT<br />
                        <span className="text-sm text-gray-600">(Cambodia Time)</span>
                      </p>
                    </div>
                  </div>
                </ElevatedCard>

                <ElevatedCard className="hover:-translate-y-1">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 rounded-full">
                      <span className="text-red-600 text-xl">💬</span>
                    </div>
                    <div>
                      <h3 className="font-bold mb-2 text-black">Quick Response</h3>
                      <p className="text-gray-600 mb-2">Average response time</p>
                      <p className="text-black font-bold">Within 24 hours</p>
                    </div>
                  </div>
                </ElevatedCard>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* FAQ Section */}
      <Section variant="muted">
        <Container size="lg" className="text-center">
          <div className="mb-16">
            <SectionHeading className="mb-6">
              Frequently Asked Questions
            </SectionHeading>
            <p className="text-xl text-gray-600 leading-relaxed">
              Quick answers to common questions. Can&apos;t find what you&apos;re looking for? Contact us directly.
            </p>
          </div>

          <div className="space-y-6 text-left">
            <ElevatedCard className="hover:-translate-y-1">
              <h3 className="font-bold mb-3 text-black">How do I start learning English with ACADEX?</h3>
              <p className="text-gray-600 leading-relaxed">
                Create a free account, take our English level assessment, and start with courses tailored to your level. 
                Begin with our free IELTS practice tests and grammar quizzes to evaluate your current skills.
              </p>
            </ElevatedCard>

            <ElevatedCard className="hover:-translate-y-1">
              <h3 className="font-bold mb-3 text-black">What IELTS preparation resources do you offer?</h3>
              <p className="text-gray-600 leading-relaxed">
                We provide comprehensive IELTS preparation including 2,500+ authentic practice questions, 
                complete mock tests, writing feedback, speaking practice, and proven strategies for all four skills.
              </p>
            </ElevatedCard>

            <ElevatedCard className="hover:-translate-y-1">
              <h3 className="font-bold mb-3 text-black">Are there free English learning resources available?</h3>
              <p className="text-gray-600 leading-relaxed">
                Yes! We offer free grammar quizzes, vocabulary tests, sample IELTS questions, and basic English lessons. 
                Premium courses provide advanced features, personalized feedback, and certification.
              </p>
            </ElevatedCard>

            <ElevatedCard className="hover:-translate-y-1">
              <h3 className="font-bold mb-3 text-black">How long does it take to improve my English level?</h3>
              <p className="text-gray-600 leading-relaxed">
                Progress varies by individual, but most students see improvement within 2-4 weeks of regular practice. 
                Our adaptive learning system tracks your progress and adjusts to help you learn efficiently.
              </p>
            </ElevatedCard>

            <ElevatedCard className="hover:-translate-y-1">
              <h3 className="font-bold mb-3 text-black">Do you provide certificates for course completion?</h3>
              <p className="text-gray-600 leading-relaxed">
                Yes, we provide completion certificates for all our premium English courses. 
                These certificates can be used to demonstrate your English proficiency to employers or educational institutions.
              </p>
            </ElevatedCard>

            <ElevatedCard className="hover:-translate-y-1">
              <h3 className="font-bold mb-3 text-black">What English levels do your courses cover?</h3>
              <p className="text-gray-600 leading-relaxed">
                Our courses cover all English levels from beginner (A1) to advanced (C2). 
                We also offer specialized IELTS preparation for students targeting specific band scores (5.5-9.0).
              </p>
            </ElevatedCard>
          </div>
        </Container>
      </Section>

    </div>
  )
}
