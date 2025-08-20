'use client'

import { UnifiedCard, cardVariants, backgroundVariants, gridVariants } from '@/components/ui/CardVariants'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ElevatedCard } from '@/components/ui/ElevatedCard'

export default function TestCardsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">Card System Testing</h1>
          <p className="text-secondary text-lg">Comparing new unified card system with existing components</p>
        </div>

        {/* New Unified Card Variants */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-primary">New Unified Card System</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <UnifiedCard variant="base" size="md">
              <h3 className="text-lg font-bold text-primary mb-2">Base Card</h3>
              <p className="text-secondary">Minimal styling with semantic colors. No hover effects.</p>
            </UnifiedCard>
            
            <UnifiedCard variant="elevated" size="md">
              <h3 className="text-lg font-bold text-primary mb-2">Elevated Card</h3>
              <p className="text-secondary">Subtle shadow with hover effect. Good for content cards.</p>
            </UnifiedCard>
            
            <UnifiedCard variant="interactive" size="md">
              <h3 className="text-lg font-bold text-primary mb-2">Interactive Card</h3>
              <p className="text-secondary">Full hover effects with lift. For clickable cards.</p>
            </UnifiedCard>
            
            <UnifiedCard variant="glass" size="md">
              <h3 className="text-lg font-bold text-primary mb-2">Glass Card</h3>
              <p className="text-secondary">Glass morphism effect. For hero sections.</p>
            </UnifiedCard>

          </div>
        </section>

        {/* Size Variations */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-primary">Size Variations</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <UnifiedCard variant="elevated" size="sm">
              <h4 className="font-bold text-primary mb-1">Small (sm)</h4>
              <p className="text-sm text-secondary">Compact padding</p>
            </UnifiedCard>
            
            <UnifiedCard variant="elevated" size="md">
              <h4 className="font-bold text-primary mb-2">Medium (md)</h4>
              <p className="text-secondary">Standard padding</p>
            </UnifiedCard>
            
            <UnifiedCard variant="elevated" size="lg">
              <h4 className="font-bold text-primary mb-3">Large (lg)</h4>
              <p className="text-secondary">Generous padding for important content</p>
            </UnifiedCard>
            
            <UnifiedCard variant="elevated" size="xl">
              <h4 className="font-bold text-primary mb-4">Extra Large (xl)</h4>
              <p className="text-secondary">Maximum padding for hero content</p>
            </UnifiedCard>

          </div>
        </section>

        {/* Existing Components for Comparison */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-primary">Existing Components (For Comparison)</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Original Card Component */}
            <Card>
              <CardHeader>
                <CardTitle>Original Card</CardTitle>
                <CardDescription>Current main UI card with glass morphism</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-secondary">This is the existing Card component with heavy glass effects and rounded-3xl.</p>
              </CardContent>
            </Card>

            {/* ElevatedCard Component */}
            <ElevatedCard>
              <h3 className="text-lg font-bold text-primary mb-2">ElevatedCard</h3>
              <p className="text-secondary">Existing elevated card component with hover effects.</p>
            </ElevatedCard>

            {/* Plain div for comparison */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Manual Styling</h3>
              <p className="text-gray-600">Example of current manual card styling found in codebase.</p>
            </div>

          </div>
        </section>

        {/* Background Variants */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-primary">Background Variants</h2>
          
          <div className="space-y-4">
            <div className="bg-background p-6 rounded-xl border border-subtle">
              <h4 className="font-bold mb-2">Default Background</h4>
              <p>Standard background using semantic colors</p>
            </div>
            
            <div className="bg-muted/50 p-6 rounded-xl border border-subtle">
              <h4 className="font-bold mb-2">Muted Background</h4>
              <p>Subtle muted background for sections</p>
            </div>
            
            <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6 rounded-xl border border-subtle">
              <h4 className="font-bold mb-2">Accent Background</h4>
              <p>Subtle gradient for accent sections</p>
            </div>
          </div>
        </section>

        {/* Grid Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-primary">Grid Patterns</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Courses Grid</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }, (_, i) => (
                  <UnifiedCard key={i} variant="interactive" size="md">
                    <h4 className="font-bold text-primary mb-2">Course {i + 1}</h4>
                    <p className="text-secondary text-sm">Sample course content</p>
                  </UnifiedCard>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Stats Grid</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }, (_, i) => (
                  <UnifiedCard key={i} variant="elevated" size="sm">
                    <div className="text-2xl font-bold text-primary">123</div>
                    <div className="text-sm text-secondary">Stat {i + 1}</div>
                  </UnifiedCard>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-primary">Interactive Examples</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UnifiedCard 
              variant="interactive" 
              size="md"
              onClick={() => alert('Clicked!')}
            >
              <h3 className="text-lg font-bold text-primary mb-2">Clickable Card</h3>
              <p className="text-secondary">This card has an onClick handler</p>
            </UnifiedCard>
            
            <UnifiedCard variant="elevated" size="md">
              <h3 className="text-lg font-bold text-primary mb-2">Hover Only</h3>
              <p className="text-secondary">This card only has hover effects</p>
            </UnifiedCard>
            
            <UnifiedCard variant="base" size="md">
              <h3 className="text-lg font-bold text-primary mb-2">Static Card</h3>
              <p className="text-secondary">This card has no interactions</p>
            </UnifiedCard>
          </div>
        </section>

      </div>
    </div>
  )
}
