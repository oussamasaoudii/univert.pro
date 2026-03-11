# Marketing Section Components - API Reference

Complete API documentation for all reusable marketing section components.

## HeroSection

Main hero/banner section for page headers.

```tsx
import { HeroSection } from '@/components/marketing/sections';

<HeroSection
  badge="Optional badge text"
  title="Main title (supports text-balance)"
  description="Subtitle/description text"
  actions={[
    { label: 'Primary Action', href: '/path', variant: 'primary' },
    { label: 'Secondary Action', href: '/path', variant: 'outline' },
  ]}
  variant="centered" // 'centered' | 'default'
/>
```

**Props:**
- `badge`: string (optional) - Badge label above title
- `title`: string - Main heading
- `description`: string - Subtitle
- `actions`: Action[] - CTA buttons
- `variant`: 'centered' | 'default' - Layout style

**Variants:**
- `centered`: Center-aligned hero with top badge

---

## StatsSection

Display key metrics or statistics.

```tsx
import { StatsSection } from '@/components/marketing/sections';

<StatsSection
  title="Impressive Metrics"
  description="Here's why we're the best"
  stats={[
    { label: 'Value', sublabel: 'Description' },
    { label: '2B+', sublabel: 'Monthly requests' },
  ]}
  variant="grid" // 'grid' | 'animated'
/>
```

**Props:**
- `title`: string - Section title
- `description`: string - Section description
- `stats`: { label: string; sublabel: string }[] - Stats array
- `variant`: 'grid' | 'animated' - Display style

---

## FeatureShowcase

Detailed feature highlight with description and visual.

```tsx
import { FeatureShowcase } from '@/components/marketing/sections';

<FeatureShowcase
  badge="Feature"
  title="Feature Name"
  description="Detailed feature description"
  features={[
    { icon: ZapIcon, title: 'Fast', description: 'Ultra fast performance' },
  ]}
  imageUrl="/path/to/image"
  variant="image-right" // 'image-left' | 'image-right' | 'side-by-side'
/>
```

**Props:**
- `badge`: string - Feature badge
- `title`: string - Feature title
- `description`: string - Feature description
- `features`: { icon: LucideIcon; title: string; description: string }[] - Feature list
- `imageUrl`: string - Feature image (optional)
- `variant`: 'image-left' | 'image-right' | 'side-by-side'

---

## TrustMetrics

Security, compliance, and trust signals display.

```tsx
import { TrustMetrics } from '@/components/marketing/sections';

<TrustMetrics
  badge="Enterprise"
  title="Trust & Security"
  description="We take your security seriously"
  metrics={[
    { icon: ShieldIcon, label: 'SOC2 Certified', value: '✓' },
    { icon: LockIcon, label: 'End-to-end Encryption', value: '✓' },
  ]}
  variant="grid" // 'grid' | 'list'
/>
```

**Props:**
- `badge`: string - Section badge
- `title`: string - Section title
- `description`: string - Description
- `metrics`: { icon: LucideIcon; label: string; value: string }[] - Trust metrics
- `variant`: 'grid' | 'list'

---

## LogoCloud

Display partner/customer logos.

```tsx
import { LogoCloud } from '@/components/marketing/sections';

<LogoCloud
  title="Trusted by leading companies"
  description="Used by thousands of teams worldwide"
  logos={[
    { name: 'Company A', icon: Logo1Icon },
    { name: 'Company B', text: 'CompanyB' },
  ]}
  animated={true}
/>
```

**Props:**
- `title`: string - Section title
- `description`: string - Description
- `logos`: { name: string; icon?: LucideIcon; text?: string }[] - Logos array
- `animated`: boolean - Enable scrolling animation

---

## TestimonialSection

Customer testimonials and quotes.

```tsx
import { TestimonialSection } from '@/components/marketing/sections';

<TestimonialSection
  badge="Social Proof"
  title="What customers say"
  description="Real feedback from real users"
  testimonials={[
    {
      quote: "This product is amazing!",
      author: {
        name: 'John Doe',
        title: 'CEO',
        company: 'Tech Corp',
      },
      rating: 5,
      featured: true,
    },
  ]}
  variant="featured" // 'default' | 'featured' | 'carousel'
/>
```

**Props:**
- `badge`: string - Section badge
- `title`: string - Section title
- `description`: string - Description
- `testimonials`: Testimonial[] - Testimonials array
- `variant`: 'default' | 'featured' | 'carousel'

**Testimonial:**
- `quote`: string
- `author`: { name: string; title: string; company: string }
- `rating`: number (1-5)
- `featured`: boolean

---

## FAQSection

Frequently asked questions with accordion.

```tsx
import { FAQSection } from '@/components/marketing/sections';

<FAQSection
  badge="FAQ"
  title="Common Questions"
  description="Answers to your questions"
  faqs={[
    { question: "How do I get started?", answer: "Click the button below..." },
    { question: "What's the pricing?", answer: "We offer free and paid plans..." },
  ]}
  variant="default" // 'default' | 'accordion'
/>
```

**Props:**
- `badge`: string - Section badge
- `title`: string - Section title
- `description`: string - Description
- `faqs`: { question: string; answer: string }[] - FAQ items
- `variant`: 'default' | 'accordion'

---

## CTABand

Call-to-action section with multiple variants.

```tsx
import { CTABand } from '@/components/marketing/sections';

<CTABand
  title="Ready to get started?"
  description="Join thousands of happy users"
  actions={[
    { label: 'Start Free Trial', href: '/signup', variant: 'primary' },
    { label: 'Learn More', href: '/docs', variant: 'outline' },
  ]}
  variant="centered" // 'default' | 'gradient' | 'minimal' | 'centered'
/>
```

**Props:**
- `title`: string - CTA headline
- `description`: string - CTA description (optional)
- `actions`: Action[] - CTA buttons
- `variant`: 'default' | 'gradient' | 'minimal' | 'centered'

**Action:**
- `label`: string - Button text
- `href`: string - Link destination
- `variant`: 'primary' | 'secondary' | 'outline'
- `icon`: LucideIcon (optional)

---

## BenefitsGrid

Grid of benefits with icons.

```tsx
import { BenefitsGrid } from '@/components/marketing/sections';

<BenefitsGrid
  title="Key Benefits"
  description="Why choose us"
  benefits={[
    { icon: ZapIcon, title: 'Fast', description: 'Lightning quick' },
    { icon: ShieldIcon, title: 'Secure', description: 'Enterprise security' },
  ]}
  columns={3}
/>
```

**Props:**
- `title`: string - Section title
- `description`: string - Description
- `benefits`: { icon: LucideIcon; title: string; description: string }[] - Benefits array
- `columns`: number - Grid columns (2-4)

---

## IntegrationGrid

Display integrations/plugins.

```tsx
import { IntegrationGrid } from '@/components/marketing/sections';

<IntegrationGrid
  badge="Integrations"
  title="Connect your tools"
  description="Works with everything you use"
  integrations={[
    { name: 'GitHub', icon: GitHubIcon, description: 'Version control' },
  ]}
  variant="grid" // 'grid' | 'list'
/>
```

**Props:**
- `badge`: string - Section badge
- `title`: string - Section title
- `description`: string - Description
- `integrations`: { name: string; icon: LucideIcon; description: string }[] - Integrations
- `variant`: 'grid' | 'list'

---

## IndustryCards

Industry/solution specific cards.

```tsx
import { IndustryCards } from '@/components/marketing/sections';

<IndustryCards
  badge="Solutions"
  title="Built for every industry"
  description="Tailored solutions"
  cards={[
    { icon: ShoppingIcon, title: 'E-commerce', description: 'Online stores' },
  ]}
/>
```

**Props:**
- `badge`: string - Section badge
- `title`: string - Section title
- `description`: string - Description
- `cards`: { icon: LucideIcon; title: string; description: string }[] - Cards array

---

## ComparisonTable

Feature comparison table.

```tsx
import { ComparisonTable } from '@/components/marketing/sections';

<ComparisonTable
  title="Feature Comparison"
  description="See what's included"
  headers={['Free', 'Pro', 'Enterprise']}
  rows={[
    { feature: 'Projects', free: '1', pro: 'Unlimited', enterprise: 'Unlimited' },
  ]}
/>
```

**Props:**
- `title`: string - Table title
- `description`: string - Description
- `headers`: string[] - Column headers
- `rows`: { feature: string; [key: string]: string }[] - Table rows

---

## Styling Convention

All components follow the same styling patterns:

**Spacing:**
- Sections: `py-20 lg:py-28`
- Container: `container mx-auto px-4`
- Subsections: `gap-6` or `gap-8`

**Colors:**
- Primary action: `bg-accent hover:bg-accent/90`
- Secondary: `variant="outline"`
- Backgrounds: `bg-secondary/20`
- Text: `text-foreground`, `text-muted-foreground`

**Typography:**
- Titles: `text-3xl lg:text-4xl font-bold`
- Subtitles: `text-lg text-foreground/70`
- Body: `text-base` with `leading-relaxed`

**Animations:**
- All components use Framer Motion
- Pattern: `initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}`
- Viewport: `viewport={{ once: true }}`

---

## Component Composition Example

```tsx
'use client';

import {
  HeroSection,
  BenefitsGrid,
  FeatureShowcase,
  TestimonialSection,
  FAQSection,
  CTABand,
} from '@/components/marketing/sections';

export default function ExamplePage() {
  return (
    <div className="w-full">
      <HeroSection
        badge="New Feature"
        title="Transform Your Workflow"
        description="Build faster with our powerful tools"
        actions={[
          { label: 'Get Started', href: '/signup', variant: 'primary' },
          { label: 'Learn More', href: '/docs', variant: 'outline' },
        ]}
      />

      <BenefitsGrid
        title="Why Choose Us"
        description="The best choice for modern teams"
        benefits={[
          /* benefits array */
        ]}
      />

      <FeatureShowcase
        badge="Feature"
        title="Powerful Deployment"
        description="Deploy with confidence"
        features={[
          /* features array */
        ]}
      />

      <TestimonialSection
        badge="Testimonials"
        title="Loved by our users"
        description="Real feedback from real customers"
        testimonials={[
          /* testimonials array */
        ]}
      />

      <FAQSection
        badge="FAQ"
        title="Your Questions Answered"
        description="Everything you need to know"
        faqs={[
          /* faqs array */
        ]}
      />

      <CTABand
        title="Ready to transform?"
        description="Join thousands of successful teams"
        actions={[
          { label: 'Start Free', href: '/signup', variant: 'primary' },
          { label: 'Talk to Sales', href: '/contact', variant: 'outline' },
        ]}
      />
    </div>
  );
}
```

---

**Last Updated:** March 2026
**Version:** 1.0 - Initial Release
