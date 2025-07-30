'use client'

import { useState } from 'react'
import Image from 'next/image'
import SvgIcon from '@/components/ui/SvgIcon'

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
      <section className="relative pt-32 pb-20 px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gray-50"></div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gray-100 text-black px-4 py-2 rounded-full text-sm font-medium mb-8 border border-gray-200">
            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
            Contact Us
          </div>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tight mb-8 text-black">
            Get in Touch
            <span className="block text-red-600 mt-2">We&apos;re Here to Help</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Have questions about English learning, IELTS preparation, or need support? Our team is dedicated to helping you 
            achieve English fluency and reach your language goals.
          </p>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold tracking-tight mb-6 text-black">Send us a Message</h2>
              
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

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-bold transition-all duration-200 w-full shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </div>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-6 text-black">Get in Touch</h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  We&apos;re here to support your English learning journey and answer any questions about our courses, 
                  IELTS preparation, or platform features. We look forward to hearing from you!
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
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
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
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
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 lg:px-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-6 text-black">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Quick answers to common questions. Can&apos;t find what you&apos;re looking for? Contact us directly.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="font-bold mb-3 text-black">How do I start learning English with ACADEX?</h3>
              <p className="text-gray-600 leading-relaxed">
                Create a free account, take our English level assessment, and start with courses tailored to your level. 
                Begin with our free IELTS practice tests and grammar quizzes to evaluate your current skills.
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="font-bold mb-3 text-black">What IELTS preparation resources do you offer?</h3>
              <p className="text-gray-600 leading-relaxed">
                We provide comprehensive IELTS preparation including 2,500+ authentic practice questions, 
                complete mock tests, writing feedback, speaking practice, and proven strategies for all four skills.
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="font-bold mb-3 text-black">Are there free English learning resources available?</h3>
              <p className="text-gray-600 leading-relaxed">
                Yes! We offer free grammar quizzes, vocabulary tests, sample IELTS questions, and basic English lessons. 
                Premium courses provide advanced features, personalized feedback, and certification.
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="font-bold mb-3 text-black">How long does it take to improve my English level?</h3>
              <p className="text-gray-600 leading-relaxed">
                Progress varies by individual, but most students see improvement within 2-4 weeks of regular practice. 
                Our adaptive learning system tracks your progress and adjusts to help you learn efficiently.
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="font-bold mb-3 text-black">Do you provide certificates for course completion?</h3>
              <p className="text-gray-600 leading-relaxed">
                Yes, we provide completion certificates for all our premium English courses. 
                These certificates can be used to demonstrate your English proficiency to employers or educational institutions.
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="font-bold mb-3 text-black">What English levels do your courses cover?</h3>
              <p className="text-gray-600 leading-relaxed">
                Our courses cover all English levels from beginner (A1) to advanced (C2). 
                We also offer specialized IELTS preparation for students targeting specific band scores (5.5-9.0).
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
