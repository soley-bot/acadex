import Image from 'next/image'
import { LucideIcon } from 'lucide-react'

interface PageHeroProps {
  badge?: {
    icon: LucideIcon
    text: string
  }
  title: string | React.ReactNode
  description: string | React.ReactNode
  imageSrc?: string
  minHeight?: string
}

export function PageHero({
  badge,
  title,
  description,
  imageSrc = '/images/hero/learning-together.jpg',
  minHeight = 'min-h-[70vh] lg:min-h-[80vh]'
}: PageHeroProps) {
  return (
    <section className={`relative ${minHeight}`}>
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageSrc}
          alt=""
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl relative z-10 h-full flex items-center">
        <div className="max-w-3xl py-20 lg:py-32">
          {badge && (
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full shadow-lg mb-6">
              <badge.icon className="w-4 h-4" />
              <span className="font-medium">{badge.text}</span>
            </div>
          )}

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 drop-shadow-2xl">
            {title}
          </h1>

          <div className="text-lg text-white/95 leading-relaxed drop-shadow-lg">
            {description}
          </div>
        </div>
      </div>
    </section>
  )
}
