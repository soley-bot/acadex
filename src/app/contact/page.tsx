'use client'

import { useState } from 'react'
import Icon from '@/components/ui/Icon'

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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-6000"></div>
      </div>
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-full text-sm lg:text-base font-medium mb-8 shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Contact Us
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-8 leading-tight">
            Get in Touch
            <span className="block text-red-600 mt-4">We&apos;re Here to Help</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Have questions about English learning, IELTS preparation, or need support? Our team is dedicated to helping you 
            achieve English fluency and reach your language goals.
          </p>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="relative py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Send us a Message</h2>
              
              {success && (
                <div className="bg-green-50/80 backdrop-blur-sm border-2 border-green-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <Icon name="check" size={16} color="white" />
                    </div>
                    <p className="text-green-800 font-medium">
                      Thank you for your message! We&apos;ll get back to you within 24 hours.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                      <Icon name="close" size={16} color="white" />
                    </div>
                    <p className="text-red-800 font-medium">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/80 backdrop-blur-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all duration-200 shadow-lg"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/80 backdrop-blur-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all duration-200 shadow-lg"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-bold text-gray-900 mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/80 backdrop-blur-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all duration-200 shadow-lg"
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
                  <label htmlFor="message" className="block text-sm font-bold text-gray-900 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/80 backdrop-blur-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all duration-200 shadow-lg resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Get in Touch</h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  We&apos;re here to support your English learning journey and answer any questions about our courses, 
                  IELTS preparation, or platform features. We look forward to hearing from you!
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-r from-red-600 to-red-700 rounded-full shadow-lg">
                      <Icon name="mail" size={24} color="white" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-2 text-gray-900">Email Us</h3>
                      <p className="text-gray-600 mb-2">Send us an email anytime</p>
                      <a href="mailto:acadex@gmail.com" className="text-red-600 hover:text-red-700 font-bold transition-colors duration-200">
                        acadex@gmail.com
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-r from-red-600 to-red-700 rounded-full shadow-lg">
                      <Icon name="clock" size={24} color="white" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-2 text-gray-900">Support Hours</h3>
                      <p className="text-gray-600 mb-2">We&apos;re available to help</p>
                      <p className="text-gray-900">
                        Monday - Friday: 9:00 AM - 6:00 PM ICT<br />
                        Weekend: 10:00 AM - 4:00 PM ICT<br />
                        <span className="text-sm text-gray-600">(Cambodia Time)</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-r from-red-600 to-red-700 rounded-full shadow-lg">
                      <Icon name="message-circle" size={24} color="white" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-2 text-gray-900">Quick Response</h3>
                      <p className="text-gray-600 mb-2">Average response time</p>
                      <p className="text-gray-900 font-bold">Within 24 hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-16 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-gray-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Quick answers to common questions. Can&apos;t find what you&apos;re looking for? Contact us directly.
            </p>
          </div>

          <div className="space-y-6 text-left">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <h3 className="font-bold mb-3 text-gray-900 text-lg">How do I start learning English with ACADEX?</h3>
              <p className="text-gray-600 leading-relaxed">
                Create a free account, take our English level assessment, and start with courses tailored to your level. 
                Begin with our free IELTS practice tests and grammar quizzes to evaluate your current skills.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <h3 className="font-bold mb-3 text-gray-900 text-lg">What IELTS preparation resources do you offer?</h3>
              <p className="text-gray-600 leading-relaxed">
                We provide comprehensive IELTS preparation including 2,500+ authentic practice questions, 
                complete mock tests, writing feedback, speaking practice, and proven strategies for all four skills.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <h3 className="font-bold mb-3 text-gray-900 text-lg">Are there free English learning resources available?</h3>
              <p className="text-gray-600 leading-relaxed">
                Yes! We offer free grammar quizzes, vocabulary tests, sample IELTS questions, and basic English lessons. 
                Premium courses provide advanced features, personalized feedback, and certification.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <h3 className="font-bold mb-3 text-gray-900 text-lg">How long does it take to improve my English level?</h3>
              <p className="text-gray-600 leading-relaxed">
                Progress varies by individual, but most students see improvement within 2-4 weeks of regular practice. 
                Our adaptive learning system tracks your progress and adjusts to help you learn efficiently.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <h3 className="font-bold mb-3 text-gray-900 text-lg">Do you provide certificates for course completion?</h3>
              <p className="text-gray-600 leading-relaxed">
                Yes, we provide completion certificates for all our premium English courses. 
                These certificates can be used to demonstrate your English proficiency to employers or educational institutions.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <h3 className="font-bold mb-3 text-gray-900 text-lg">What English levels do your courses cover?</h3>
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
