import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative pt-24 pb-16 px-6 lg:px-8 overflow-hidden">
      {/* Modern Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-3 py-1.5 rounded-full text-sm font-medium mb-6 border border-brand/20">
              <span className="w-2 h-2 bg-brand rounded-full"></span>
              New learning experience
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
              Master Skills with
              <span className="block text-primary mt-2">Interactive Learning</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg">
              Practice with engaging quizzes and enroll in expert-led courses. 
              Build your expertise with our modern learning platform designed for results.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/courses" className="bg-brand text-brand-foreground hover:bg-brand/90 px-6 py-3 rounded-lg font-medium transition-colors group">
                <span>Explore Courses</span>
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/quizzes" className="btn-outline group border-brand/20 hover:bg-brand/5 hover:border-brand/40 transition-colors">
                <span>Try Free Quiz</span>
                <svg className="w-4 h-4 ml-2 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </Link>
            </div>
            
            {/* Modern Stats */}
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand mb-1">10K+</div>
                <div className="text-sm text-muted-foreground">Active Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand mb-1">50+</div>
                <div className="text-sm text-muted-foreground">Expert Courses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand mb-1">500+</div>
                <div className="text-sm text-muted-foreground">Practice Quizzes</div>
              </div>
            </div>
          </div>

          {/* Modern Visual Element */}
          <div className="relative animate-slide-up">
            {/* Main Card */}
            <div className="card p-8 transform rotate-2 hover:rotate-0 transition-all duration-500 shadow-xl">
              {/* Browser Header */}
              <div className="flex items-center gap-2 mb-6 pb-4 border-b">
                <div className="w-3 h-3 bg-destructive rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1 bg-muted rounded-full h-6 ml-4"></div>
              </div>
              
              {/* Content Simulation */}
              <div className="space-y-4 mb-8">
                <div className="h-6 bg-muted rounded-lg w-4/5 animate-pulse"></div>
                <div className="h-4 bg-muted/70 rounded w-3/5"></div>
                <div className="h-4 bg-muted/70 rounded w-4/5"></div>
                <div className="h-8 bg-brand/20 rounded-lg w-2/3"></div>
              </div>
              
              {/* Success Notification */}
              <div className="card p-4 border-l-4 border-green-500 bg-green-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold">Quiz Completed!</div>
                    <div className="text-sm text-muted-foreground">Perfect Score: 100/100 🎉</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 rounded-3xl blur-sm animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-secondary/20 rounded-3xl blur-sm animate-pulse delay-75"></div>
            <div className="absolute top-1/2 -right-12 w-16 h-16 bg-accent/20 rounded-2xl blur-sm animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
