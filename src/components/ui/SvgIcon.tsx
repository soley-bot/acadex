import Image from 'next/image'
import { cn } from '@/lib/utils'
import { getSvgIconPath } from '@/lib/svgIcons'

interface SvgIconProps {
  icon: string
  size?: number
  className?: string
  variant?: 'default' | 'white' | 'red'
  alt?: string
}

const getVariantStyle = (variant: SvgIconProps['variant']) => {
  switch (variant) {
    case 'white':
      return { 
        filter: 'brightness(0) invert(1)',
        color: 'white'
      }
    case 'red':
      return { 
        filter: 'brightness(0) saturate(100%) invert(22%) sepia(94%) saturate(7466%) hue-rotate(359deg) brightness(99%) contrast(118%)',
        color: '#ef4444'
      }
    case 'default':
    default:
      return { 
        filter: 'brightness(0) saturate(100%) invert(46%) sepia(8%) saturate(1019%) hue-rotate(185deg) brightness(90%) contrast(88%)',
        color: 'currentColor'
      }
  }
}

export default function SvgIcon({ 
  icon, 
  size = 20, 
  className,
  variant = 'default',
  alt
}: SvgIconProps) {
  const iconSrc = getSvgIconPath(icon)
  const style = getVariantStyle(variant)
  
  return (
    <Image
      src={iconSrc}
      alt={alt || icon}
      width={size}
      height={size}
      style={style}
      className={cn('inline-block', className)}
    />
  )
}
