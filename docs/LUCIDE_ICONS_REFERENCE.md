# Lucide Icons Reference for Acadex

## Current Setup
- **Package**: `lucide-react@0.525.0` (latest)
- **Total Icons Available**: 1,500+ icons
- **Usage Pattern**: Direct imports for performance optimization

## How to Use Lucide Icons

### 1. Import Pattern (Recommended)
```tsx
// ✅ CORRECT: Direct imports for better tree-shaking
import { Heart, Star, BookOpen, User, Settings } from 'lucide-react'

// ❌ AVOID: Default import (larger bundle size)
import { LucideHeart } from 'lucide-react'
```

### 2. Component Usage
```tsx
// Standard usage with size and color
<Heart size={24} color="currentColor" />

// With Tailwind classes
<Star className="w-6 h-6 text-yellow-500" />

// Interactive with hover states
<BookOpen className="w-5 h-5 text-primary hover:text-secondary" />
```

## Popular Icon Categories

### Educational & Learning
```tsx
import { 
  BookOpen, Book, GraduateHat, Brain, Target, Trophy,
  Lightbulb, Pencil, FileText, ClipboardList, Award,
  Certificate, School, Users, Teacher, Student
} from 'lucide-react'
```

### Navigation & UI
```tsx
import {
  Home, Menu, X, ChevronDown, ChevronRight, ChevronLeft,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Search,
  Filter, Grid, List, Plus, Minus, Edit, Trash2
} from 'lucide-react'
```

### User & Profile
```tsx
import {
  User, Users, UserPlus, UserCheck, UserX, Settings,
  Profile, Account, Shield, Key, Lock, Unlock, Eye, EyeOff
} from 'lucide-react'
```

### Analytics & Progress
```tsx
import {
  BarChart3, LineChart, PieChart, TrendingUp, TrendingDown,
  Activity, Gauge, Progress, Timer, Clock, Calendar,
  CheckCircle, XCircle, AlertTriangle, Info
} from 'lucide-react'
```

### Communication & Social
```tsx
import {
  Mail, MessageCircle, Phone, Video, Share2, Heart,
  ThumbsUp, Star, Flag, Bell, BellRing, Send, Reply
} from 'lucide-react'
```

### Technology & Development
```tsx
import {
  Code, Terminal, Database, Server, Cloud, Download,
  Upload, Wifi, Smartphone, Laptop, Monitor, Tablet
} from 'lucide-react'
```

### Geographic & Location
```tsx
import {
  MapPin, Map, Globe, Navigation, Compass, Route,
  Building, Home, School, Library, Store
} from 'lucide-react'
```

### Business & Finance
```tsx
import {
  DollarSign, CreditCard, Wallet, Receipt, Invoice,
  TrendingUp, Calculator, Briefcase, Building2, Store
} from 'lucide-react'
```

## Icon Sizing Standards

### Acadex Size Guidelines
```tsx
// Small icons (inline text, badges)
<Icon className="w-4 h-4" />        // 16px

// Standard icons (buttons, cards)
<Icon className="w-5 h-5" />        // 20px
<Icon className="w-6 h-6" />        // 24px

// Large icons (hero sections, features)
<Icon className="w-8 h-8" />        // 32px
<Icon className="w-12 h-12" />      // 48px

// Extra large (landing page features)
<Icon className="w-16 h-16" />      // 64px
```

## Color Standards

### Semantic Colors
```tsx
// Primary actions
<Icon className="text-primary" />

// Secondary actions  
<Icon className="text-secondary" />

// Success states
<Icon className="text-green-600" />

// Warning states
<Icon className="text-yellow-600" />

// Error states
<Icon className="text-red-600" />

// Neutral/muted
<Icon className="text-gray-500" />
```

## Currently Used Icons in Acadex

### Landing Page
- **Hero**: `BarChart3` (dashboard), `Trophy` (achievement)
- **Features**: `Clock` (flexible), `Video` (interactive), `MapPin` (local), `Gauge` (pace)
- **Popular Courses**: `Users` (students), `Star` (rating), `BookOpen` (course)
- **Quiz Preview**: `Target` (accuracy), `TrendingUp` (progress), `Award` (certification), `Clock` (timing), `CheckCircle` (completion), `Play` (start)

### Navigation
- **Header**: `ChevronDown`, `Home`, `User`, `ArrowRight`, `Menu`, `X`, `Book`, `Lightbulb`, `Info`, `Mail`, `Rocket`
- **Footer**: `Heart` (made with love)

### Dashboard
- **Quick Actions**: `Zap` (energy), `Calendar` (schedule), `User` (profile), `BarChart3` (progress)
- **Statistics**: `BookOpen`, `Trophy`, `Target`, `TrendingUp`

## How to Find More Icons

### 1. Official Lucide Website
Visit: https://lucide.dev/icons
- Browse all 1,500+ icons
- Search by keyword
- Copy icon names directly

### 2. VS Code Extension
Install "Lucide Icons" extension for autocomplete and preview

### 3. Programmatic Search
```bash
# Search for icons containing "learn"
npm info lucide-react | grep -i learn

# List all available exports
node -e "console.log(Object.keys(require('lucide-react')).sort())"
```

## Best Practices

### Performance
✅ Use direct imports for tree-shaking
✅ Import only icons you need
✅ Use `color="currentColor"` for CSS control

### Accessibility
✅ Add `aria-label` for standalone icons
✅ Use semantic HTML with icons
✅ Ensure sufficient color contrast

### Consistency
✅ Stick to one icon family (Lucide)
✅ Use consistent sizing patterns
✅ Follow semantic meaning guidelines

## Example Implementation

```tsx
import { BookOpen, Users, Star, Play, CheckCircle } from 'lucide-react'

export function CourseCard({ course }: { course: Course }) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">{course.title}</h3>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{course.students} students</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500" />
          <span>{course.rating}</span>
        </div>
        
        {course.completed && (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>Completed</span>
          </div>
        )}
      </div>
      
      <button className="flex items-center gap-2 mt-4 bg-primary hover:bg-secondary text-white hover:text-black px-4 py-2 rounded-lg transition-colors">
        <Play className="w-4 h-4" />
        Start Learning
      </button>
    </Card>
  )
}
```

## Need a Specific Icon?

If you need a specific icon that's not in Lucide:
1. Check the official Lucide library first: https://lucide.dev/icons
2. Search using keywords related to your concept
3. Consider semantic alternatives (e.g., `Zap` for "quick actions")
4. For custom icons, consider creating SVG components following Lucide's design principles

## Updates

To get the latest icons:
```bash
npm update lucide-react
```

Current version includes all icons up to late 2024. New icons are added regularly to the Lucide library.
