import { Typography, DisplayLG, H2, H3, BodyLG, BodyMD } from '@/components/ui/Typography'
import { Container, Section, Grid, Flex } from '@/components/ui/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Icon from '@/components/ui/Icon'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Acadex - Built from Scratch, Built with Heart',
  description: 'The story of Soley Heng and how Acadex was created to challenge traditional education and support self-directed learning for Cambodian students.',
  keywords: [
    'about acadex',
    'soley heng',
    'cambodian education',
    'online learning story',
    'self-directed learning',
    'education revolution cambodia'
  ],
}

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-destructive/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-warning/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-secondary/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <Section className="relative" background="transparent" spacing="lg">
        <Container size="lg" className="relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-black px-6 py-3 rounded-full text-sm lg:text-base font-medium mb-8 shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              Our Story
            </div>
            
            <DisplayLG className="mb-6">
              About Acadex
            </DisplayLG>
            
            <H2 className="text-primary mb-8">
              Built from Scratch. Built with Heart.
            </H2>
          </div>
        </Container>
      </Section>

      {/* Main Story */}
      <Section background="transparent" spacing="lg">
        <Container size="lg" className="relative">
          <div className="max-w-4xl mx-auto">
            
            {/* Opening Statement */}
            <Card variant="glass" className="mb-12">
              <CardContent className="p-8 lg:p-12">
                <BodyLG className="text-muted-foreground leading-relaxed text-center">
                  Acadex is not backed by a big company.
                  <br />
                  It was built from zero — line by line — by someone who had no tech background but cared deeply about learning.
                </BodyLG>
              </CardContent>
            </Card>

            {/* Founder Introduction */}
            <Card variant="elevated" className="mb-12">
              <CardContent className="p-8 lg:p-12">
                <Flex align="center" gap="lg" className="flex-col md:flex-row">
                  <div className="w-32 h-32 bg-gradient-to-r from-primary to-primary/90 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <Icon name="user" size={64} color="white" />
                  </div>
                  <div className="text-center md:text-left">
                    <H2 className="mb-4">Hi, I&apos;m Soley Heng</H2>
                    <BodyLG className="text-muted-foreground leading-relaxed">
                      I spent months learning how to build this platform on my own. No team. No investor. 
                      Just a dream and many sleepless nights.
                      <br /><br />
                      <strong>Why? Because I wanted to share something real.</strong>
                    </BodyLG>
                  </div>
                </Flex>
              </CardContent>
            </Card>

            {/* Why I Started Section */}
            <Card variant="glass" className="mb-12">
              <CardHeader>
                <CardTitle>
                  <H2 className="text-center">Why I Started Acadex</H2>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 lg:p-12">
                <BodyLG className="text-muted-foreground leading-relaxed mb-6">
                  I&apos;ve worked in education for years. And I saw the same pattern again and again:
                </BodyLG>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-muted-foreground text-lg">•</span>
                    </div>
                    <BodyMD className="text-muted-foreground">
                      Students who thought they weren&apos;t smart — just because school didn&apos;t work for them
                    </BodyMD>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-muted-foreground text-lg">•</span>
                    </div>
                    <BodyMD className="text-muted-foreground">
                      Young people who felt left behind because they couldn&apos;t afford extra classes or didn&apos;t pass the right tests
                    </BodyMD>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-muted-foreground text-lg">•</span>
                    </div>
                    <BodyMD className="text-muted-foreground">
                      A system that rewarded memorization, not understanding
                    </BodyMD>
                  </div>
                </div>
                
                <BodyLG className="text-foreground leading-relaxed mt-8 text-center font-medium">
                  I wanted to challenge that.
                </BodyLG>
              </CardContent>
            </Card>

            {/* Beliefs Section */}
            <Card variant="elevated" className="mb-12">
              <CardHeader>
                <CardTitle>
                  <H2 className="text-center text-secondary">A Different Belief About Learning</H2>
                </CardTitle>
                <CardDescription className="text-center">
                  <BodyLG className="text-muted-foreground leading-relaxed">
                    At Acadex, we believe this:
                  </BodyLG>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 lg:p-12">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Icon name="check" size={16} color="white" />
                    </div>
                    <BodyMD className="text-foreground">
                      You don&apos;t need a classroom to learn.
                    </BodyMD>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Icon name="check" size={16} color="white" />
                    </div>
                    <BodyMD className="text-foreground">
                      You don&apos;t need a degree to grow.
                    </BodyMD>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Icon name="check" size={16} color="white" />
                    </div>
                    <BodyMD className="text-foreground">
                      And you don&apos;t need someone else&apos;s permission to improve.
                    </BodyMD>
                  </div>
                </div>
                
                <Card variant="glass" className="mt-8">
                  <CardContent className="p-6">
                    <BodyLG className="text-foreground leading-relaxed">
                      <strong>Self-study is powerful.</strong>
                      <br />
                      When the content is clear, when you&apos;re motivated, and when you&apos;re given the right tools — 
                      you can learn just as much (or even more) than in a traditional classroom.
                      <br /><br />
                      Acadex is here to support that kind of learning.
                    </BodyLG>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            {/* What We Offer */}
            <Card variant="glass" className="mb-12">
              <CardHeader>
                <CardTitle>
                  <H2 className="text-center">What We Offer</H2>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 lg:p-12">
                <Grid cols={1} className="md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/90 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Icon name="book" size={24} color="white" />
                    </div>
                    <div>
                      <H3 className="mb-2">Clear, simple lessons</H3>
                      <BodyMD className="text-muted-foreground">Made for real people</BodyMD>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/90 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Icon name="video" size={24} color="white" />
                    </div>
                    <div>
                      <H3 className="mb-2">Friendly visuals</H3>
                      <BodyMD className="text-muted-foreground">And short videos</BodyMD>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/90 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Icon name="heart" size={24} color="white" />
                    </div>
                    <div>
                      <H3 className="mb-2">No pressure, no grades</H3>
                      <BodyMD className="text-muted-foreground">No judgment</BodyMD>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/90 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Icon name="user" size={24} color="white" />
                    </div>
                    <div>
                      <H3 className="mb-2">Just you</H3>
                      <BodyMD className="text-muted-foreground">And your own pace</BodyMD>
                    </div>
                  </div>
                </Grid>
              </CardContent>
            </Card>

            {/* Current State */}
            <Card variant="base" className="mb-12 bg-warning/5 border-warning/20">
              <CardHeader>
                <CardTitle>
                  <H2 className="text-center">Still Small, Still Growing</H2>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <BodyLG className="text-muted-foreground leading-relaxed">
                  This platform is still in its early stage.
                  <br />
                  We don&apos;t have a huge course library — yet.
                  <br />
                  But we have something real. And that&apos;s enough to start.
                </BodyLG>
              </CardContent>
            </Card>

            {/* Personal Message */}
            <Card variant="glass" className="mb-12">
              <CardContent className="p-8 lg:p-12 text-center">
                <BodyLG className="text-muted-foreground leading-relaxed mb-8">
                  If you&apos;ve ever felt lost in school…
                  <br />
                  If you&apos;ve ever thought &quot;maybe I&apos;m just not good at learning&quot;…
                  <br />
                  <strong className="text-primary">Acadex is here to prove otherwise.</strong>
                </BodyLG>
                
                <H2 className="mb-6">Let&apos;s build this together.</H2>
                <BodyLG className="text-muted-foreground font-medium">– Soley</BodyLG>
              </CardContent>
            </Card>

            {/* CTA Section */}
            <div className="text-center">
              <Flex direction="col" gap="md" className="sm:flex-row justify-center">
                <Link href="/courses">
                  <button className="bg-primary hover:bg-secondary text-black hover:text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 min-w-[200px]">
                    Start Learning
                    <span className="ml-3">→</span>
                  </button>
                </Link>
                <Link href="/">
                  <button className="border-2 border-primary text-primary hover:bg-primary hover:text-black px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 min-w-[200px]">
                    Back to Home
                  </button>
                </Link>
              </Flex>
            </div>

          </div>
        </Container>
      </Section>
    </div>
  )
}
