'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Container, Section, Grid } from '@/components/ui/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Loader2, CheckCircle, XCircle } from 'lucide-react'

function ContactFormComponent() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const subject = searchParams.get('subject')
    if (subject) {
      const subjectMap: { [key: string]: string } = {
        'feature-suggestion': 'Feature Suggestion',
        'quiz-feedback': 'Quiz Feedback',
        'support': 'Technical Support',
        'partnership': 'Partnership Inquiry',
      }
      const friendlySubject = subjectMap[subject] || decodeURIComponent(subject)
      setFormData(prev => ({ ...prev, subject: friendlySubject }))
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setError('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  const faqItems = [
    {
      question: "Is this platform ONLY for IELTS?",
      answer: "For our initial launch, yes. Our single-minded focus is on providing the absolute best, most targeted practice for the IELTS exam. This allows us to ensure the highest quality. We plan to expand to other topics in the future!"
    },
    {
      question: "How do the 'Skill Packs' work?",
      answer: "A Skill Pack is a curated collection of micro-quizzes designed to help you master one specific area, like 'Writing Task 2 Vocabulary.' Instead of a long, general course, you get focused practice to fix specific weaknesses."
    },
    {
      question: "Are the quizzes updated?",
      answer: "Yes. As an educator-led platform, I am constantly reviewing and adding new questions based on the latest exam trends and student feedback to keep the content relevant and effective."
    },
    {
      question: "Do I get a certificate?",
      answer: "Our goal is to help you get the official IELTS certificate that matters. We focus on building the skills you need for that, rather than providing our own certificate."
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      {/* Hero Section */}
      <Section className="relative pt-20 pb-12 md:pt-24 md:pb-16 text-center">
        <Container size="md">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Mail className="w-4 h-4" />
            Contact Us
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Questions About Your IELTS Prep?
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            Whether you have a question, a suggestion for a new quiz topic, or need technical support, I&apos;m here to help. Every message helps us build a better platform for you.
          </p>
        </Container>
      </Section>

      {/* Contact Form & Info Section */}
      <Section className="py-16 md:py-20 lg:py-24">
        <Container size="lg">
          <Grid cols={1} className="lg:grid-cols-5 gap-12 md:gap-16">
            {/* Form */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-8 md:p-10">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Send a Message</h2>
                  {success && (
                    <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
                      <CheckCircle className="w-5 h-5" />
                      <p>Thank you for your message! We&apos;ll get back to you within 1-2 business days.</p>
                    </div>
                  )}
                  {error && (
                    <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
                      <XCircle className="w-5 h-5" />
                      <p>{error}</p>
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Form fields here, using standard input/select/textarea elements styled by globals.css */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">Name</label>
                      <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className="input" placeholder="Your full name" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                      <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required className="input" placeholder="your.email@example.com" />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-900 mb-2">Subject</label>
                      <select id="subject" name="subject" value={formData.subject} onChange={handleInputChange} required className="input">
                        <option value="">Select a topic</option>
                        <option value="IELTS Quiz Question">IELTS Quiz Question</option>
                        <option value="Content Suggestion">Content Suggestion</option>
                        <option value="Technical Support">Technical Support</option>
                        <option value="Partnership Inquiry">Partnership Inquiry</option>
                        <option value="General Feedback">General Feedback</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">Message</label>
                      <textarea id="message" name="message" value={formData.message} onChange={handleInputChange} required rows={5} className="input" placeholder="Tell us how we can help..."></textarea>
                    </div>
                    <Button type="submit" disabled={loading} size="lg" className="w-full">
                      {loading ? (
                        <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Sending...</span>
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            {/* FAQ */}
            <div className="lg:col-span-2 space-y-8">
                <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
                {faqItems.map((item, index) => (
                  <div key={index}>
                    <h3 className="text-xl font-semibold mb-2">{item.question}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                  </div>
                ))}
            </div>
          </Grid>
        </Container>
      </Section>
    </div>
  )
}

// Suspense wrapper for searchParams usage
export default function ContactForm() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ContactFormComponent />
    </Suspense>
  )
}
