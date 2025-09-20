import { Paper, Container, Title, Text, ThemeIcon, Stack, SimpleGrid, Badge, Center, Button, Group } from '@mantine/core'
import { IconTarget, IconCircleCheck, IconBolt, IconChartBar, IconStar, IconArrowRight } from '@tabler/icons-react'
import { BlobBackground } from '@/components/ui/BlobBackground'
import { AnimatedDiv, StaggerContainer, StaggerItem, HoverScale } from '@/components/ui/AnimatedComponents'
import Link from 'next/link'

export default function Features() {
  const features = [
    {
      icon: IconTarget,
      title: "Targeted Micro-Quizzes",
      description: "Stop wasting hours on generic lessons. Fix a specific weakness, like 'Complex Sentences' or 'Environment Vocabulary,' in just 15 minutes."
    },
    {
      icon: IconCircleCheck,
      title: "Expert-Verified Content",
      description: "Every question is AI-assisted for variety and human-verified for quality by an experienced educator. This isn't just English; it's the English that impresses examiners."
    },
    {
      icon: IconBolt,
      title: "Instant, Detailed Feedback",
      description: "Understand the 'why' behind every answer. Our clear, detailed explanations in Khmer help you learn from your mistakes so you don't repeat them on exam day."
    },
    {
      icon: IconChartBar,
      title: "Build Real Mastery",
      description: "Don't just memorize word lists. Our interactive quizzes force you to apply your knowledge in context, building the deep understanding needed for a high score."
    }
  ]

  return (
    <section 
      className="relative overflow-hidden section-padding"
    >
      {/* Standardized Animated Background */}
      <BlobBackground variant="default" />

      <Container size="xl" className="relative">
        {/* Section Header */}
        <AnimatedDiv variant="fadeInUp" className="text-center mb-12">
          <Stack align="center" gap="md">
            <AnimatedDiv variant="scaleIn" delay={0.2}>
              <Badge
                variant="gradient"
                gradient={{ from: 'red.6', to: 'red.8' }}
                size="lg"
                radius="xl"
                leftSection={
                  <ThemeIcon size="xs" variant="white" color="red.6" radius="xl">
                    <IconStar size="0.75rem" />
                  </ThemeIcon>
                }
              >
                A Smarter Way to Prepare
              </Badge>
            </AnimatedDiv>
            
            <Title order={2} className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
              Focus on What Truly Matters for Your Score
            </Title>
            
            <Text size="lg" c="dimmed" className="max-w-4xl leading-relaxed">
              Getting a high score in IELTS is not about knowing everything. It is about mastering the foundational skills that examiners look for. We help you isolate and fix the common errors in vocabulary and grammar that are preventing you from reaching your goal.
            </Text>
          </Stack>
        </AnimatedDiv>

        {/* Features Grid */}
        <StaggerContainer>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" className="max-w-4xl mx-auto">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <StaggerItem key={index}>
                  <HoverScale scale={1.03} className="h-full">
                    <Paper
                      p="xl"
                      radius="xl"
                      withBorder
                      className="h-full hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <Stack gap="md">
                        {/* Icon Container */}
                        <ThemeIcon
                          size="xl"
                          radius="lg"
                          variant="gradient"
                          gradient={{ from: 'red.6', to: 'red.8' }}
                          className="group-hover:scale-110 transition-transform duration-300"
                        >
                          <IconComponent size="1.5rem" />
                        </ThemeIcon>
                        
                        <Title order={3} size="lg" className="group-hover:text-red-600 transition-colors">
                          {feature.title}
                        </Title>
                        
                        <Text c="dimmed" className="leading-relaxed">
                          {feature.description}
                        </Text>
                      </Stack>
                    </Paper>
                  </HoverScale>
                </StaggerItem>
              );
            })}
          </SimpleGrid>
        </StaggerContainer>

        {/* CTA Section */}
        <Center className="mt-12">
          <Stack align="center" gap="md">
            <Text size="lg" c="dimmed" className="max-w-2xl text-center">
              Ready to take the next step? Test yourself with a sample quiz and see the difference in quality.
            </Text>
            <Button
              component={Link}
              href="/quizzes"
              size="lg"
              variant="gradient"
              gradient={{ from: 'red.6', to: 'red.8' }}
              rightSection={<IconArrowRight size="1rem" />}
              radius="xl"
            >
              Try a Sample Quiz
            </Button>
          </Stack>
        </Center>
      </Container>
    </section>
  )
}