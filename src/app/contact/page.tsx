import { Metadata } from 'next'
import ContactForm from '@/components/contact/ContactForm'

export const metadata: Metadata = {
  title: 'Contact Acadex - English Learning Support',
  description: 'Have a question about learning English? Need help with a quiz or want to suggest a new topic? Get in touch with Soley directly.',
  keywords: [
    'contact acadex',
    'english learning support',
    'quiz feedback',
    'ielts help',
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
