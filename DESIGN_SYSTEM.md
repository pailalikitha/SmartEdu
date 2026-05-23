# SmartEdu Design System

Built on **Tailwind CSS v4** + **shadcn/ui** (base-nova). Minimal, modern, premium aesthetic with pastel white, blue, and yellow.

## Theme colors

| Token | Role | Value |
|-------|------|--------|
| `background` | Page canvas | Soft white `#f8fafc` |
| `card` | Surfaces | Pure white `#ffffff` |
| `primary` | Actions, links | Pastel blue `#6ba3d4` |
| `secondary` | Soft fills | Pastel blue tint `#e8f4fc` |
| `accent` | Highlights | Pastel yellow `#fef3c7` |
| `muted` | Subtle backgrounds | `#f1f5f9` |
| `destructive` | Errors | `#dc2626` |

CSS variables: `src/app/globals.css`  
TypeScript tokens: `src/styles/tokens.ts`

## Spacing

4px base scale in `spacing` + layout helpers in `layoutSpacing`:

```ts
import { layoutSpacing } from "@/styles/tokens";
// layoutSpacing.pageX, .stackMd, .inlineMd, etc.
```

## Typography

```tsx
import { Heading, Text } from "@/components/ui";

<Heading level="h1">Title</Heading>
<Text variant="lead">Subtitle</Text>
<Text variant="muted">Caption</Text>
```

| Component | Variants |
|-----------|----------|
| `Heading` | `h1`–`h6` |
| `Text` | `body`, `lead`, `small`, `muted`, `label`, `caption` |

## Components

### Button (shadcn)

```tsx
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="accent">Yellow accent</Button>
<Button variant="outline" size="lg">Outline</Button>
<Button variant="ghost" isLoading>Loading</Button>
```

Variants: `default`, `secondary`, `accent`, `outline`, `ghost`, `destructive`, `link`  
Legacy: `primary` → `default`

### Card

```tsx
<Card accent="blue">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

Accent: `blue` | `yellow` | `none`

### Form field (label + input + error)

```tsx
<FormField label="Email" type="email" error="Required" />
```

### Modal

```tsx
import { Modal, ConfirmModal } from "@/components/ui";

<Modal
  trigger={<Button>Open</Button>}
  title="Title"
  description="Optional"
  footer={<Button>Save</Button>}
>
  Content
</Modal>
```

Low-level: `Dialog`, `DialogContent`, `DialogHeader`, … from shadcn.

### Badge

```tsx
<Badge variant="default">Blue</Badge>
<Badge variant="accent">Yellow</Badge>
<Badge variant="success">OK</Badge>
```

## Adding more shadcn components

```bash
npx shadcn@latest add [component] --yes
```

Components live in `src/components/ui/`. Re-export new ones from `src/components/ui/index.ts`.
