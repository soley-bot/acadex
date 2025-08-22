'use client'

import { useState } from 'react'
import { Typography, DisplayLG, H2, H3, BodyLG, BodyMD } from '@/components/ui/Typography'
import { Container, Section, Grid, Flex } from '@/components/ui/Layout'
import Icon from '@/components/ui/Icon'
import { Metadata } from 'next'

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

  const faqItems = [
    {
      question: "How do I start learning with Acadex?",
      answer: "Create a free account, browse our available courses, and start learning at your own pace. No special tests or placements are needed."
    },
    {
      question: "Do I need to prepare for IELTS to use this platform?",
      answer: "No. Acadex is not only about IELTS. While we offer grammar and communication practice that can help with exams, our focus is on real-life English and practical skills."
    },
    {
      question: "Are there free resources?",
      answer: "Yes. Most of our content right now is completely free — including quizzes, short lessons, and study tools."
    },
    {
      question: "Do I get a certificate?",
      answer: "We're working on adding certificates in the future. For now, the focus is on actual learning, not papers."
    },
    {
      question: "How long will it take to see improvement?",
      answer: "Everyone's pace is different. Some learners feel more confident after just a few lessons. The key is consistency — and learning that makes sense."
    },
    {
      question: "Is this platform only for English?",
      answer: "Right now, we focus on English and communication skills. In the future, we plan to expand into other useful skills for students and young professionals."
    },
    {
      question: "I have more questions. What should I do?",
      answer: "Just send us a message using the form or email acadex@gmail.com — we'd love to help."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-warning/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-secondary/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Hero Section */}
      <Section className="relative" background="transparent" spacing="lg">
        <Container size="lg" className="relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-white px-6 py-3 rounded-full text-sm lg:text-base font-medium mb-8 shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              Contact Us
            </div>
            
            <DisplayLG className="mb-6">
              Get in Touch
            </DisplayLG>
            
            <H2 className="text-primary mb-8">
              We&apos;re Here to Listen — Not Just Sell
            </H2>
            
            <BodyLG className="text-muted-foreground leading-relaxed max-w-3xl mx-auto" color="muted">
              Got a question, suggestion, or concern? Whether you&apos;re curious about a course, need help navigating the platform, 
              or just want to share feedback — I&apos;m here. Acadex is still small, but every message helps us grow better.
            </BodyLG>
          </div>
        </Container>
      </Section>

      {/* Contact Form and Info */}
      <Section background="transparent" spacing="lg">
        <Container size="lg" className="relative">
          <Grid cols={1} className="lg:grid-cols-2 gap-16">
            
            {/* Contact Form */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 lg:p-12 shadow-xl border border-white/20">
              <H2 className="mb-8">Send us a Message</H2>
              
              {success && (
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 mb-6 shadow-xl border border-white/20">
                  <Flex align="center" gap="sm">
                    <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
                      <Icon name="check" size={16} color="white" />
                    </div>
                    <Typography variant="status-success">
                      Thank you for your message! We&apos;ll get back to you within 1-2 business days.
                    </Typography>
                  </Flex>
                </div>
              )}

              {error && (
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 mb-6 shadow-xl border border-white/20">
                  <Flex align="center" gap="sm">
                    <div className="w-6 h-6 bg-destructive rounded-full flex items-center justify-center">
                      <Icon name="close" size={16} color="white" />
                    </div>
                    <Typography variant="status-error">{error}</Typography>
                  </Flex>
                </div>
              )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="form-label block mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-input rounded-xl bg-white/90 backdrop-blur-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="form-label block mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-input rounded-xl bg-white/90 backdrop-blur-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="form-label block mb-2">
                    Subject
                  </label>
                  <select
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-input rounded-xl bg-white/90 backdrop-blur-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm"
                  >
                    <option value="">Select a topic</option>
                    <option value="Course Question">Course Question</option>
                    <option value="Quiz Feedback">Quiz Feedback</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Partnership">Partnership</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="form-label block mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-input rounded-xl bg-white/90 backdrop-blur-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-secondary text-white hover:text-black btn-text-lg py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Flex align="center" justify="center" gap="sm">
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </Flex>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              
              {/* Email */}
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20">
                <Flex align="center" gap="md" className="mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/90 rounded-2xl flex items-center justify-center shadow-lg">
                    <Icon name="mail" size={24} color="white" />
                  </div>
                  <H3>Email Us</H3>
                </Flex>
                <BodyMD className="mb-2" color="muted">Send us an email anytime</BodyMD>
                <BodyLG className="text-primary font-medium">acadex@gmail.com</BodyLG>
              </div>

              {/* Support Hours */}
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20">
                <Flex align="center" gap="md" className="mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/90 rounded-2xl flex items-center justify-center shadow-lg">
                    <Icon name="clock" size={24} color="white" />
                  </div>
                  <H3>Support Hours</H3>
                </Flex>
                <BodyMD className="mb-3" color="muted">
                  We&apos;re available to help during the following times (Cambodia Time):
                </BodyMD>
                <div className="space-y-1">
                  <BodyMD className="font-medium">Monday – Friday: 9:00 AM – 6:00 PM</BodyMD>
                  <BodyMD className="font-medium">Weekend: 10:00 AM – 4:00 PM</BodyMD>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20">
                <Flex align="center" gap="md" className="mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/90 rounded-2xl flex items-center justify-center shadow-lg">
                    <Icon name="timer" size={24} color="white" />
                  </div>
                  <H3>Response Time</H3>
                </Flex>
                <BodyMD color="muted">
                  We usually respond within 1–2 business days.
                  <br />
                  Thanks for your patience — it&apos;s just one person reading and replying to every message!
                </BodyMD>
              </div>
              
            </div>
          </Grid>
        </Container>
      </Section>

      {/* FAQ Section */}
      <Section background="transparent" spacing="lg">
        <Container size="lg" className="relative">
          <div className="text-center mb-16">
            <H2 className="mb-6">Frequently Asked Questions</H2>
            <BodyLG className="max-w-3xl mx-auto" color="muted">
              Quick answers to common questions about Acadex
            </BodyLG>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 lg:p-8 shadow-lg border border-white/20">
                <H3 className="mb-4">{item.question}</H3>
                <BodyMD className="leading-relaxed" color="muted">{item.answer}</BodyMD>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </div>
  )
}
