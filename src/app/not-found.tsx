import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="max-w-md mx-auto text-center px-4">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-8xl mb-4">🤔</div>
            <h1 className="text-6xl font-bold tracking-tight mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Page Not Found</h2>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Oops! The page you&apos;re looking for seems to have wandered off. 
              Don&apos;t worry, even the best explorers sometimes take a wrong turn.
            </p>
            <p className="text-muted-foreground">
              Let&apos;s get you back on track to your learning journey!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="btn btn-default"
              >
                Go Home
              </Link>
              <Link
                href="/courses"
                className="btn btn-outline"
              >
                Browse Courses
              </Link>
            </div>
            
            <div className="pt-4">
              <Link
                href="/quizzes"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Or try a quiz instead →
              </Link>
            </div>
          </div>

          {/* Popular Links */}
          <div className="mt-12 pt-8 border-t">
            <h3 className="text-lg font-semibold tracking-tight mb-4">Popular Pages</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Link
                href="/about"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

