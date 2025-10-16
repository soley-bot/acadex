import { Metadata } from 'next'
import { FileText } from 'lucide-react'
import { PageHero } from '@/components/layout/PageHero'
import { PageSection } from '@/components/layout/PageSection'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Terms of Service - Acadex',
  description: 'Terms of Service for Acadex English Learning Platform',
}

export default function TermsOfService() {
  return (
    <>
      <PageHero
        badge={{ icon: FileText, text: 'Terms of Service' }}
        title="Terms of Service"
        description="Please read these terms carefully before using Acadex. By accessing our platform, you agree to be bound by these terms."
        imageSrc="/images/hero/learning-together.jpg"
        minHeight="min-h-[50vh] lg:min-h-[60vh]"
      />

      <PageSection>
        <Card className="p-8 md:p-12">
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using Acadex (&ldquo;the Service&rdquo;), you accept and agree to be bound by the 
                terms and provision of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                Acadex is an online English learning platform that provides:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Interactive English courses</li>
                <li>Quiz and assessment tools</li>
                <li>Progress tracking</li>
                <li>Educational content and resources</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Account</h2>
              <p className="text-gray-700 mb-4">
                To access certain features of the Service, you must create an account. You are responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and current information</li>
                <li>Notifying us of any unauthorized use of your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Conduct</h2>
              <p className="text-gray-700 mb-4">You agree not to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Use the Service for any unlawful purpose</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Share your account with others</li>
                <li>Upload or transmit harmful content</li>
                <li>Attempt to gain unauthorized access to the Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                All content on Acadex, including courses, quizzes, text, graphics, and software, 
                is the property of Acadex and is protected by copyright and other intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Course Enrollment and Payment</h2>
              <p className="text-gray-700 mb-4">
                Course enrollment may be subject to fees. Payment terms and refund policies 
                will be clearly stated at the time of enrollment.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                Acadex shall not be liable for any indirect, incidental, special, consequential, 
                or punitive damages resulting from your use of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Service Availability</h2>
              <p className="text-gray-700 mb-4">
                We strive to maintain high service availability but do not guarantee uninterrupted access. 
                We may modify or discontinue the Service at any time.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination</h2>
              <p className="text-gray-700 mb-4">
                We may terminate your account at any time for violation of these terms. 
                You may also terminate your account at any time.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">Email: support@acadex.academy</p>
                <p className="text-gray-700">Website: acadex.academy</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these terms at any time. Changes will be effective 
                immediately upon posting to this page.
              </p>
            </section>
          </div>
        </Card>
      </PageSection>
    </>
  )
}

