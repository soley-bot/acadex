import { Metadata } from 'next'
import ContactForm from '@/components/contact/ContactForm'

export const metadata: Metadata = {
  title: 'Contact Acadex - IELTS Preparation Support',
  description: 'Have a question about your IELTS prep? Need help with a quiz or want to suggest a new topic? Get in touch with our founder directly.',
  keywords: [
    'contact acadex',
    'ielts support',
    'ielts cambodia help',
    'ielts quiz feedback',
    'contact soley heng'
  ],
  alternates: {
    canonical: 'https://acadex.academy/contact',
  },
}

// Server Component - handles metadata and renders the client component
export default function ContactPage() {
  return <ContactForm />
}
