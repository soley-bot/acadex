import Link from 'next/link'
import SvgIcon from '@/components/ui/SvgIcon'

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
              #1 English Learning Platform
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-6">
              Master English with
              <span className="block text-primary mt-2">Interactive Quizzes & Expert-Led Lessons</span>
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg">
              Prepare for IELTS, improve your grammar, and build vocabulary with personalized 
              practice designed by English language experts.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/courses" className="bg-brand text-brand-foreground hover:bg-brand/90 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                <SvgIcon icon="book" size={20} variant="white" />
                Explore Courses
              </Link>
              <Link href="/quizzes" className="btn-outline border-brand/20 hover:bg-brand/5 hover:border-brand/40 transition-colors flex items-center justify-center gap-2">
                <SvgIcon icon="check" size={20} />
                Start Practicing
              </Link>
            </div>
            
            {/* Updated Stats for English Learning */}
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-brand mb-1">500+</div>
                <div className="text-xs md:text-sm text-muted-foreground">Practice Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-brand mb-1">New</div>
                <div className="text-xs md:text-sm text-muted-foreground">Platform Launch</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-brand mb-1">Adaptive</div>
                <div className="text-xs md:text-sm text-muted-foreground">Feedback System</div>
              </div>
            </div>
          </div>

          {/* Learning Dashboard Illustration */}
          <div className="relative animate-slide-up">
            {/* Main Dashboard Card */}
            <div className="card p-6 transform hover:scale-105 transition-all duration-500 shadow-2xl bg-gradient-to-br from-card to-card/80">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <SvgIcon icon="chart" size={16} variant="white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm md:text-base">English Progress</h3>
                    <p className="text-xs text-muted-foreground">Learning Dashboard</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Today</div>
              </div>
              
              {/* Course Progress */}
              <div className="space-y-4 mb-6">
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Grammar Fundamentals</span>
                    <span className="text-xs text-primary font-semibold">85%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                
                <div className="p-3 bg-secondary/5 rounded-lg border border-secondary/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Vocabulary Building</span>
                    <span className="text-xs text-secondary font-semibold">92%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-secondary h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
              
              {/* Achievement Badge */}
              <div className="card p-4 border-l-4 border-green-500 bg-green-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <SvgIcon icon="check" size={20} variant="white" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Lesson Completed!</div>
                    <div className="text-xs text-muted-foreground">You earned 50 points</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Study Elements */}
            <div className="absolute -top-4 -right-4 card p-3 shadow-lg animate-bounce">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium">7 Day Streak!</span>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 card p-3 shadow-lg animate-pulse">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span className="text-xs font-medium">Intermediate</span>
              </div>
            </div>
            
            {/* Background Elements */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-secondary/10 rounded-full blur-2xl animate-pulse delay-75"></div>
            <div className="absolute top-1/2 -right-12 w-16 h-16 bg-accent/20 rounded-2xl blur-sm animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
