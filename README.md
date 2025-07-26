# Acadex - Quiz & Course Platform

A modern React-based platform for quiz practice and online course enrollment, built with Next.js, TypeScript, and Tailwind CSS. The design is inspired by Chris Do's clean, typography-focused aesthetic.

## Features

- **Interactive Quiz System**: Practice with beautifully designed quizzes that adapt to your learning pace
- **Expert-Led Courses**: Learn from industry experts with comprehensive course catalog
- **Clean Modern Design**: Minimalist interface with excellent typography and user experience
- **Progress Tracking**: Monitor your learning journey with detailed analytics
- **Responsive Design**: Optimized for all devices from mobile to desktop
- **Community Learning**: Join a vibrant community of learners worldwide

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Fonts**: Inter font family for consistent typography
- **Components**: Modular React components

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/acadex.git
   cd acadex
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── courses/           # Courses listing page
│   ├── quizzes/           # Quizzes listing page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable React components
│   ├── Header.tsx         # Navigation header
│   ├── Hero.tsx           # Hero section
│   ├── Features.tsx       # Features showcase
│   ├── QuizPreview.tsx    # Interactive quiz demo
│   ├── PopularCourses.tsx # Course cards grid
│   └── Footer.tsx         # Site footer
```

## Design System

### Color Palette
- **Primary**: Blue (#3b82f6) - Used for CTAs and highlights
- **Accent**: Red (#ef4444) - Used for alerts and secondary actions
- **Neutral**: Comprehensive gray scale - Used for text and backgrounds

### Typography
- **Font Family**: Inter - Modern, readable typeface
- **Weights**: 300-800 - Consistent weight hierarchy
- **Scale**: Responsive sizing with clear hierarchy

### Components
- **Cards**: Clean white cards with subtle shadows
- **Buttons**: Primary and secondary button styles
- **Input Fields**: Consistent form styling
- **Navigation**: Clean header with mobile responsiveness

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Design inspiration from Chris Do's clean, typography-focused aesthetic
- Built with modern web technologies for optimal performance
- Responsive design patterns for excellent user experience across all devices
