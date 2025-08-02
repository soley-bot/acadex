# Typography Quick Reference

## 🚀 Essential Imports
```tsx
import { Typography } from '@/components/ui/Typography'
import { Container, Section, Grid } from '@/components/ui/Layout'
```

## 📝 Typography Cheat Sheet

| Old Pattern | New Component |
|-------------|---------------|
| `<h1 className="text-4xl font-bold">` | `<Typography variant="h1" as="h1">` |
| `<h2 className="text-3xl font-bold">` | `<Typography variant="h2" as="h2">` |
| `<p className="text-xl text-gray-600">` | `<Typography variant="lead">` |
| `<p className="text-lg text-gray-700">` | `<Typography variant="body-lg">` |
| `<p className="text-gray-700">` | `<Typography variant="body-md">` |
| `<span className="text-sm text-gray-500">` | `<Typography variant="caption">` |

## 🎨 Quick Colors
- `color="gradient"` - Red to orange gradient
- `color="muted"` - Gray-600
- `color="subtle"` - Gray-500
- `color="white"` - White text

## 📱 Layout Quick Start
```tsx
<Section spacing="md" background="gradient">
  <Container size="lg">
    <Typography variant="display-lg" color="gradient" className="mb-8">
      Page Title
    </Typography>
    <Grid cols={3}>
      {/* Content cards */}
    </Grid>
  </Container>
</Section>
```

## 🔧 Migration Steps
1. Add imports
2. Replace `<h1-h6>` with `<Typography variant="..." as="...">`
3. Replace `<p>` with `<Typography variant="body-md">`
4. Wrap sections in `<Container>` or `<Section>`
5. Replace grids with `<Grid cols={n}>`
6. Test responsiveness
