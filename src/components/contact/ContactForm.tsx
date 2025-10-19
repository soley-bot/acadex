'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, XCircle, MessageCircle } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { PageSection } from '@/components/layout/PageSection'
import { SectionHeader } from '@/components/layout/SectionHeader'

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
  
  // Prevent double submission
  const submitRef = useRef(false)

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
    
    // CRITICAL: Prevent double submission
    if (submitRef.current || loading) {
      console.log('[Submit Guard] Already submitting, ignoring');
      return;
    }
    
    submitRef.current = true;
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
      // Allow re-submit after 3 seconds
      setTimeout(() => {
        submitRef.current = false;
      }, 3000);
    } catch (err) {
      setError('Failed to send message. Please try again.')
      // Allow immediate retry on error
      submitRef.current = false;
    } finally {
      setLoading(false)
    }
  }
  
  const faqItems = [
    {
      question: "What topics do you cover?",
      answer: "I'm starting with IELTS preparation because it's what I know best from my decade in education. But I'm building this platform to eventually cover general English skills too—vocabulary, grammar, conversation practice, and more. IELTS is just the beginning!"
    },
    {
      question: "How do the quizzes work?",
      answer: "Each quiz is a focused micro-lesson targeting one specific skill—like 'Complex Sentences' or 'Environment Vocabulary.' You spend just 15 minutes, get instant feedback, and move on. No fluff, just the practice you need."
    },
    {
      question: "Are the quizzes updated regularly?",
      answer: "Yes! I'm constantly reviewing and adding new questions based on learner feedback and the latest trends. This is an educator-led platform, which means quality and relevance come first."
    },
    {
      question: "Is there a certificate when I finish?",
      answer: "My goal is to help you build real skills—whether that's passing IELTS or feeling confident in everyday conversations. I focus on the learning itself rather than certificates, but I track your progress so you can see how far you've come."
    },
  ]

  return (
    <>
      {/* Hero Section */}
      <PageHero
        badge={{ icon: MessageCircle, text: 'Contact Us' }}
        title="Have Questions About Learning English?"
        description="Whether you have a question, a suggestion for a new quiz topic, or need technical support, I'm here to help. Every message helps me build a better platform for you."
        imageSrc="/images/hero/learning-together.jpg"
        minHeight="min-h-[60vh] lg:min-h-[70vh]"
      />

      {/* Contact Form & Info Section */}
      <PageSection>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 md:gap-16">
          {/* Form */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-8 md:p-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Send a Message</h2>
                {success && (
                  <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" />
                    <p>Thank you for your message! I&apos;ll get back to you within 1-2 business days.</p>
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
                      <option value="Quiz Question or Feedback">Quiz Question or Feedback</option>
                      <option value="New Topic Suggestion">New Topic Suggestion</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Partnership Inquiry">Partnership Inquiry</option>
                      <option value="General Feedback">General Feedback</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">Message</label>
                    <textarea id="message" name="message" value={formData.message} onChange={handleInputChange} required rows={5} className="input" placeholder="Tell me how I can help..."></textarea>
                  </div>
                  <Button type="submit" disabled={loading || submitRef.current} size="lg" className="w-full">
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
        </div>
      </PageSection>
    </>
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
