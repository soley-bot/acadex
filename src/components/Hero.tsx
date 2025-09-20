import Link from 'next/link'
import Image from 'next/image'
import { Container, Title, Text, Button, Paper, Group, Stack, SimpleGrid, Center, Badge, ThemeIcon } from '@mantine/core'
import { IconRocket, IconTarget, IconTrendingUp, IconStar } from '@tabler/icons-react'
import { BlobBackground } from '@/components/ui/BlobBackground'
import { AnimatedDiv, StaggerContainer, StaggerItem, HoverScale } from '@/components/ui/AnimatedComponents'

export default function Hero() {
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden section-padding"
    >
      {/* Standardized Animated Background */}
      <BlobBackground variant="default" />
      
      <Container size="xl" className="relative">
        <div className="grid lg:grid-cols-2 items-center gap-8 lg:gap-16">
          {/* Left Column - Content */}
          <StaggerContainer className="text-center lg:text-left order-2 lg:order-1">
            <Stack gap="lg">
              {/* Hero Badge */}
              <StaggerItem>
                <AnimatedDiv variant="scaleIn" delay={0.2}>
                  <Center inline>
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
                      Make Learning More Accessible
                    </Badge>
                  </Center>
                </AnimatedDiv>
              </StaggerItem>
              
              {/* Main Heading */}
              <StaggerItem>
                <Title order={1} className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
                  Transform Your IELTS Score in 15 Minutes a Day
                </Title>
              </StaggerItem>
              
              {/* Subtitle */}
              <StaggerItem>
                <Text size="lg" c="dimmed" className="leading-relaxed">
                  Master essential IELTS skills with AI-powered micro-quizzes designed by education experts. 
                  Focus on your weak areas and boost your score efficiently.
                </Text>
              </StaggerItem>
              
              {/* CTA Buttons */}
              <StaggerItem>
                <Group justify="center" className="lg:justify-start" gap="md">
                  <HoverScale scale={1.03}>
                    <Button
                      component={Link}
                      href="/courses"
                      size="xl"
                      variant="gradient"
                      gradient={{ from: 'red.6', to: 'red.8' }}
                      leftSection={<IconRocket size="1.2rem" />}
                      radius="xl"
                      className="min-w-[240px]"
                    >
                      Unlock Your Score
                    </Button>
                  </HoverScale>
                  <HoverScale scale={1.03}>
                    <Button
                      component={Link}
                      href="/quizzes"
                      size="xl"
                      variant="outline"
                      color="red"
                      leftSection={<IconTarget size="1.2rem" />}
                      radius="xl"
                      className="min-w-[240px]"
                    >
                      Try a Sample Quiz
                    </Button>
                  </HoverScale>
                </Group>
              </StaggerItem>
              
              {/* Stats Section */}
              <StaggerItem>
                <SimpleGrid cols={2} className="max-w-sm mx-auto lg:mx-0 lg:max-w-md">
                  <HoverScale scale={1.02}>
                    <Paper
                      p="md"
                      radius="lg"
                      withBorder
                      className="text-center transform hover:scale-105 transition-all duration-300"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <Text size="2xl" fw="bold" c="red.6" className="text-2xl lg:text-3xl">100+</Text>
                      <Text size="sm" c="dimmed">Questions</Text>
                    </Paper>
                  </HoverScale>
                  <HoverScale scale={1.02}>
                    <Paper
                      p="md"
                      radius="lg"
                      withBorder
                      className="text-center transform hover:scale-105 transition-all duration-300"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <Text size="2xl" fw="bold" c="red.6" className="text-2xl lg:text-3xl">100%</Text>
                      <Text size="sm" c="dimmed">Made with Care</Text>
                    </Paper>
                  </HoverScale>
                </SimpleGrid>
              </StaggerItem>
            </Stack>
          </StaggerContainer>

          {/* Right Column - Hero Image */}
          <AnimatedDiv variant="slideInRight" delay={0.4} className="order-1 lg:order-2">
            <HoverScale scale={1.02}>
              <Paper
                radius="xl"
                className="overflow-hidden transform hover:scale-[1.02] transition-all duration-500"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="relative">
                  <Image 
                    src="/images/hero/learning-together.jpg" 
                    alt="Students learning English together - diverse group studying with laptops and books"
                    width={600}
                    height={600}
                    className="w-full h-[400px] md:h-[500px] lg:h-[600px] object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                  
                  {/* Floating UI element */}
                  <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6">
                    <AnimatedDiv variant="fadeInUp" delay={1.2}>
                      <Paper p="sm" radius="lg" withBorder className="bg-white/95 backdrop-blur-sm shadow-lg">
                        <Group gap="xs" align="center">
                          <ThemeIcon size="sm" variant="light" color="red" radius="xl">
                            <IconTrendingUp size="0.75rem" />
                          </ThemeIcon>
                          <Text size="sm" fw="500">Score Boost Guaranteed</Text>
                        </Group>
                      </Paper>
                    </AnimatedDiv>
                  </div>
                </div>
              </Paper>
            </HoverScale>
          </AnimatedDiv>
        </div>
      </Container>
    </section>
  )
}