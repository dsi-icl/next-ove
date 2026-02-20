# UI Primitives + Reorderable List Utility

A lightweight utility library built on top of **shadcn/ui** primitives, plus a flexible **ReorderableList** component that enables drag-and-drop reordering with a clean API.

This library is ideal for building modern, accessible interfaces with composable primitives and simple list reordering behavior.

---

## ✨ Features

- ✅ Built on top of `shadcn/ui`
- ✅ Accessible and composable UI primitives
- ✅ Drag-and-drop reordering
- ✅ Keyboard-friendly interactions
- ✅ Controlled and uncontrolled modes
- ✅ Fully typed (TypeScript support)

---

## 📦 Installation

```bash
npm install your-library-name
```

or

```bash
yarn add your-library-name
```

> Ensure `shadcn/ui` and its peer dependencies are already configured in your project.

---

## 🧱 Requirements

- React 18+
- shadcn/ui installed
- Tailwind CSS configured
- TypeScript (recommended)

---

## 🚀 Usage

### Import Components

```tsx
import {
  Button,
  Card,
  Input,
  ReorderableList,
} from "your-library-name";
```

---

## 🧩 Using UI Primitives

All UI primitives are re-exported from `shadcn/ui`.

```tsx
import { Button, Card } from "your-library-name";

export function Example() {
  return (
    <Card className="p-4 space-y-4">
      <Button>Click me</Button>
    </Card>
  );
}
```

---

# 🔁 ReorderableList

A flexible component for drag-and-drop list reordering.

---

## Basic Example

```tsx
import { useState } from "react";
import { ReorderableList } from "your-library-name";

export function TodoList() {
  const [items, setItems] = useState([
    { id: "1", label: "First" },
    { id: "2", label: "Second" },
    { id: "3", label: "Third" },
  ]);

  return (
    <ReorderableList
      items={items}
      onReorder={setItems}
      renderItem={(item) => (
        <div className="p-3 border rounded bg-white shadow-sm">
          {item.label}
        </div>
      )}
    />
  );
}
```

---

## API

### `ReorderableList`

| Prop        | Type                              | Required | Description |
|-------------|-----------------------------------|----------|--------------|
| `items`     | `T[]`                             | ✅       | Array of items |
| `onReorder` | `(items: T[]) => void`            | ✅       | Called when order changes |
| `renderItem`| `(item: T) => ReactNode`          | ✅       | Render function |
| `getId`     | `(item: T) => string`             | ❌       | Custom ID extractor (default: `item.id`) |
| `className` | `string`                          | ❌       | Wrapper styles |

---

## Controlled vs Uncontrolled

### Controlled (Recommended)

You manage state externally:

```tsx
<ReorderableList
  items={items}
  onReorder={setItems}
  renderItem={(item) => <Item item={item} />}
/>
```

### Uncontrolled

If you pass `defaultItems`, the component manages its own state:

```tsx
<ReorderableList
  defaultItems={initialItems}
  renderItem={(item) => <Item item={item} />}
/>
```

---

## ♿ Accessibility

- Keyboard reorder support
- Focus management
- ARIA attributes for drag state
- Screen reader announcements

---

## 🎨 Styling

The component uses Tailwind CSS classes by default and supports full customization:

```tsx
<ReorderableList
  className="space-y-2"
  renderItem={(item) => (
    <div className="bg-muted p-2 rounded-md">
      {item.label}
    </div>
  )}
/>
```

You can also override drag state styles via data attributes:

```css
[data-dragging="true"] {
  opacity: 0.5;
}
```

---

## 🛠 Extending

You can compose with other primitives:

```tsx
import { Card, CardContent } from "your-library-name";

renderItem={(item) => (
  <Card>
    <CardContent>{item.label}</CardContent>
  </Card>
)}
```

---

## 🧪 Testing

Recommended tools:

- React Testing Library
- Vitest or Jest
- Playwright (for drag-and-drop E2E testing)

---

## 📁 Example Structure

```text
src/
  components/
    ui/              
    shadcn primitives
    reorderable-list/
      ReorderableList.tsx
  index.ts
```

---
