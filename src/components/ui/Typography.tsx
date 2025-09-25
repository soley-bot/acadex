import * as React from "react"

const H1 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = "", ...props }, ref) => (
    <h1 ref={ref} className={`text-4xl font-bold tracking-tight ${className}`} {...props} />
  )
)

const H2 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = "", ...props }, ref) => (
    <h2 ref={ref} className={`text-3xl font-semibold tracking-tight ${className}`} {...props} />
  )
)

const H3 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = "", ...props }, ref) => (
    <h3 ref={ref} className={`text-2xl font-semibold tracking-tight ${className}`} {...props} />
  )
)

const H4 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = "", ...props }, ref) => (
    <h4 ref={ref} className={`text-xl font-semibold tracking-tight ${className}`} {...props} />
  )
)

const BodyLG = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = "", ...props }, ref) => (
    <p ref={ref} className={`text-lg leading-7 ${className}`} {...props} />
  )
)

const BodyMD = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = "", ...props }, ref) => (
    <p ref={ref} className={`text-base leading-6 ${className}`} {...props} />
  )
)

H1.displayName = "H1"
H2.displayName = "H2"
H3.displayName = "H3"
H4.displayName = "H4"
BodyLG.displayName = "BodyLG"
BodyMD.displayName = "BodyMD"

export { H1, H2, H3, H4, BodyLG, BodyMD }