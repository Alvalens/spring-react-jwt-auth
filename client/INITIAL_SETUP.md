# React Frontend — Initial Setup From Scratch

A step-by-step walkthrough of how the client was built from zero.
Use this as a learning reference for understanding the React + Vite + Tailwind + shadcn/ui stack.

---

## Table of Contents

1. [Scaffolding with Vite](#1-scaffolding-with-vite)
2. [Project Structure Explained](#2-project-structure-explained)
3. [Tailwind CSS v4](#3-tailwind-css-v4)
4. [shadcn/ui](#4-shadcnui)
5. [Path Aliases](#5-path-aliases)
6. [React Router v7](#6-react-router-v7)
7. [Pages & Components](#7-pages--components)
8. [How It All Connects](#8-how-it-all-connects)

---

## 1. Scaffolding with Vite

### What is Vite?

Vite is a build tool and dev server for modern frontend projects. Think of it as the
equivalent of `./gradlew bootRun` for Spring — but for React.

| Vite | Spring Boot equivalent |
|---|---|
| `pnpm dev` | `./gradlew bootRun` |
| `pnpm build` | `./gradlew build` (creates production jar) |
| Hot Module Replacement (HMR) | Spring DevTools auto-restart |
| `vite.config.ts` | `application.yml` |

### Why Vite over Create React App (CRA)?

CRA is dead (no longer maintained). Vite is the standard:
- **Instant dev server** — no bundling during development, serves files directly via ES modules
- **Fast HMR** — edit a file, see changes in <50ms (CRA took seconds)
- **Small output** — production builds are optimized and tree-shaken

### How we scaffolded

```bash
pnpm create vite client --template react-ts
cd client
pnpm install
```

`react-ts` template gives us React 19 + TypeScript out of the box. This creates:

```
client/
├── index.html          ← the single HTML page (SPA entry point)
├── package.json        ← dependencies + scripts
├── tsconfig.json       ← TypeScript config
├── vite.config.ts      ← Vite config
└── src/
    ├── main.tsx        ← React root (mounts <App /> into the DOM)
    ├── App.tsx         ← main component
    └── index.css       ← global styles
```

### package.json scripts

```json
{
  "scripts": {
    "dev": "vite",              // start dev server (localhost:5173)
    "build": "tsc -b && vite build",  // type-check + production build
    "preview": "vite preview",  // preview the production build locally
    "lint": "eslint ."          // run linter
  }
}
```

### pnpm vs npm vs yarn

| | npm | pnpm | yarn |
|---|---|---|---|
| Speed | Slowest | Fastest | Medium |
| Disk usage | Duplicates deps across projects | Symlinks from global store | Duplicates |
| Lock file | `package-lock.json` | `pnpm-lock.yaml` | `yarn.lock` |
| Strictness | Allows phantom deps | Strict (can't import undeclared deps) | Medium |

We use **pnpm** for speed and strictness. The commands are identical to npm:
- `pnpm add react-router` = `npm install react-router`
- `pnpm add -D tailwindcss` = `npm install --save-dev tailwindcss`
- `pnpm dev` = `npm run dev`

---

## 2. Project Structure Explained

```
client/src/
├── main.tsx                ← mounts React into the DOM (touch rarely)
├── App.tsx                 ← routing (all pages registered here)
├── index.css               ← Tailwind imports + shadcn theme variables
├── components/
│   └── ui/                 ← shadcn components (Button, Input, Card, Label)
├── lib/
│   └── utils.ts            ← cn() utility for merging Tailwind classes
└── pages/
    ├── LoginPage.tsx
    ├── RegisterPage.tsx
    ├── ForgotPasswordPage.tsx
    ├── ResetPasswordPage.tsx
    ├── DashboardPage.tsx
    └── ProfilePage.tsx
```

### main.tsx — The entry point

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

This is like Spring's `AuthApplication.java` — it boots the app. You almost never edit this.

**What it does:**
1. Finds `<div id="root">` in `index.html`
2. Mounts the `<App />` component into it
3. `StrictMode` enables extra development warnings (removed in production)

### index.html — The single page

```html
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
```

This is the **only** HTML file. React renders everything inside `<div id="root">`.
That's why it's called a Single Page Application (SPA) — one HTML page, JavaScript
handles all the "page" transitions via routing.

**Spring Boot equivalent:** There is no equivalent — Spring renders HTML server-side
or just serves JSON APIs. The SPA model is fundamentally different.

---

## 3. Tailwind CSS v4

### What is Tailwind?

Instead of writing CSS in separate files, you write utility classes directly in HTML/JSX:

```tsx
// Traditional CSS
<div className="card">         // then define .card { padding: 2rem; ... } somewhere

// Tailwind
<div className="p-8 rounded-lg bg-white shadow">    // style right here, no CSS file
```

### v4 vs v3 — What changed

| | Tailwind v3 | Tailwind v4 (what we use) |
|---|---|---|
| Config | `tailwind.config.js` (JavaScript) | CSS-based (`@theme` in `index.css`) |
| Setup | PostCSS plugin | Vite plugin (`@tailwindcss/vite`) |
| Import | `@tailwind base; @tailwind components;` | `@import "tailwindcss"` |
| Performance | Scans files for classes | Faster, native oxide engine |

v4 is simpler — no config file needed for most projects.

### How we installed it

```bash
pnpm add -D tailwindcss @tailwindcss/vite
```

Then in `vite.config.ts`:

```ts
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

And in `src/index.css`:

```css
@import "tailwindcss";
```

That's it. No `tailwind.config.js`, no PostCSS config.

### Common Tailwind Classes Used in This Project

| Class | What it does | CSS equivalent |
|---|---|---|
| `min-h-screen` | Minimum height = viewport height | `min-height: 100vh` |
| `flex items-center justify-center` | Center content horizontally + vertically | `display: flex; align-items: center; justify-content: center` |
| `w-full max-w-md` | Full width, max 448px | `width: 100%; max-width: 28rem` |
| `space-y-4` | 1rem gap between children (vertical) | `> * + * { margin-top: 1rem }` |
| `grid grid-cols-2 gap-4` | 2-column grid with 1rem gap | `display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem` |
| `text-sm text-muted-foreground` | Small text in muted color | `font-size: 0.875rem; color: var(--muted-foreground)` |
| `p-8` | Padding 2rem all sides | `padding: 2rem` |

---

## 4. shadcn/ui

### What is it?

shadcn/ui is **NOT a component library** you install as a dependency. It's a collection
of copy-paste components. When you "add" a component, the source code is copied into
your project at `src/components/ui/`.

| Traditional library (e.g., Material UI) | shadcn/ui |
|---|---|
| `npm install @mui/material` | `pnpx shadcn@latest add button` |
| Source code in `node_modules/` | Source code in `src/components/ui/` |
| Update = `npm update` | Update = re-run add command (or edit yourself) |
| Customization = theme overrides | Customization = edit the actual file |
| Bundle includes ALL components | Only components you added |

### Why this approach?

- **You own the code** — full control, no library lock-in
- **Minimal bundle** — only what you use
- **Easy to customize** — change button styles by editing `button.tsx` directly

### How we set it up

```bash
# Initialize (creates components.json, configures theme in index.css)
pnpx shadcn@latest init -d

# Add specific components
pnpx shadcn@latest add button input card label
```

This created 4 files:

```
src/components/ui/
├── button.tsx    ← Button with variants (default, outline, destructive, etc.)
├── input.tsx     ← Styled input field
├── card.tsx      ← Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
└── label.tsx     ← Form label
```

### components.json — shadcn config

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,              // not using React Server Components
  "tsx": true,               // TypeScript
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

### The cn() utility

`src/lib/utils.ts`:

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

This merges Tailwind classes intelligently. For example:

```ts
cn("px-4 py-2", "px-6")  // → "px-6 py-2" (px-6 overrides px-4, not duplicated)
cn("bg-red-500", condition && "bg-blue-500")  // conditional classes
```

Every shadcn component uses `cn()` for class merging.

### Using a shadcn component

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card className="w-full max-w-md">
  <CardHeader>
    <CardTitle>Login</CardTitle>
  </CardHeader>
  <CardContent>
    <Button variant="outline" className="w-full">Click me</Button>
  </CardContent>
</Card>
```

**Button variants** (defined in `button.tsx`):
- `default` — solid dark background
- `outline` — border only
- `destructive` — red (for delete/logout)
- `secondary` — muted background
- `ghost` — transparent, hover shows background
- `link` — looks like a link

### Theme Variables

shadcn uses CSS custom properties for theming, defined in `src/index.css`:

```css
:root {
  --background: oklch(1 0 0);           /* white */
  --foreground: oklch(0.145 0 0);       /* near-black */
  --primary: oklch(0.205 0 0);          /* dark */
  --primary-foreground: oklch(0.985 0 0); /* light */
  --muted-foreground: oklch(0.556 0 0); /* gray */
  --destructive: oklch(0.577 0.245 27.325); /* red */
  --border: oklch(0.922 0 0);           /* light gray */
  /* ... more variables ... */
}

.dark {
  --background: oklch(0.145 0 0);       /* overrides for dark mode */
  /* ... */
}
```

To switch to dark mode, add `class="dark"` to the `<html>` element.
The CSS variables automatically switch values.

---

## 5. Path Aliases

### The problem

Without aliases, imports look like this:

```tsx
import { Button } from "../../../components/ui/button";
```

### The solution

We configured `@` to point to `src/`:

```tsx
import { Button } from "@/components/ui/button";  // always the same, no matter file depth
```

### Setup — three places

**1. `vite.config.ts`** — tells Vite how to resolve `@/` during bundling:

```ts
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**2. `tsconfig.json`** — tells TypeScript how to resolve `@/` for type-checking:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**3. `tsconfig.app.json`** — same paths, needed because Vite uses this file for compilation:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Why three places? Vite handles bundling (runtime), TypeScript handles type-checking (IDE).
They're separate tools that both need to know about the alias.

**Spring Boot equivalent:** There's no equivalent — Java uses package imports
(`import com.springauth.service.JwtService`) which are always absolute.

---

## 6. React Router v7

### What is it?

React is an SPA (Single Page Application) — there's only one HTML page.
React Router intercepts URL changes and renders different components without
a full page reload.

```
URL: /login     → renders <LoginPage />
URL: /dashboard → renders <DashboardPage />
URL: /profile   → renders <ProfilePage />
```

The browser never actually navigates to a new page — React Router swaps components in and out.

**Spring Boot equivalent:** This is like `@RequestMapping` but on the client:

| React Router | Spring Boot |
|---|---|
| `<Route path="/login" element={<LoginPage />} />` | `@GetMapping("/login")` returns a view |
| `useNavigate()` | `redirect:/dashboard` |
| `useParams()` | `@PathVariable` |
| `<Link to="/register">` | `<a href="/register">` (but without page reload) |

### How we configured it

```bash
pnpm add react-router
```

In `App.tsx`:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Protected routes (auth guard added later) */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Catch-all: redirect unknown paths to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Key concepts

**`<BrowserRouter>`** — wraps the entire app, enables URL-based routing.
Uses the browser's History API (clean URLs like `/login`, not `/#/login`).

**`<Routes>`** — container for all route definitions. Only the first matching route renders.

**`<Route path="/login" element={<LoginPage />} />`** — when URL matches `/login`, render `LoginPage`.

**`<Route path="/reset-password/:token">`** — `:token` is a URL parameter.
In the component, access it with:

```tsx
import { useParams } from "react-router";
const { token } = useParams();  // e.g., "abc123" from /reset-password/abc123
```

**`<Navigate to="/login" replace />`** — redirect. `replace` means it doesn't create a
browser history entry (back button won't go to the unknown URL).

**`<Link to="/register">`** — navigation without page reload (unlike `<a href>`):

```tsx
import { Link } from "react-router";
<Link to="/register">Register</Link>   // SPA navigation, instant
<a href="/register">Register</a>        // full page reload, slow
```

---

## 7. Pages & Components

### Page pattern

Every page follows the same structure:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          {/* form fields */}
        </CardContent>
      </Card>
    </div>
  );
}
```

**Outer div** — full viewport height, centers the card.
**Card** — shadcn component, provides the white container with shadow.
**CardHeader / CardContent / CardFooter** — semantic sections of the card.

### Current state

All pages are **static UI only** — no form handling, no API calls, no state management.
Buttons don't do anything yet. This is the base scaffold that will be wired to the
backend in the next phase.

### What will be added later

```
src/
├── api/
│   └── axios.ts              ← axios instance + refresh token interceptor
├── contexts/
│   └── AuthContext.tsx        ← global auth state (user, isAuthenticated, loading)
├── components/
│   ├── ui/                   ← shadcn (already done)
│   └── ProtectedRoute.tsx    ← redirects to /login if not authenticated
└── pages/
    └── *.tsx                 ← will add form state + API calls
```

---

## 8. How It All Connects

### The build chain

```
index.html
    └── loads src/main.tsx (via <script>)
            └── imports index.css (Tailwind + shadcn theme)
            └── renders <App />
                    └── <BrowserRouter> reads the URL
                            └── matches a <Route>
                                    └── renders the matching Page component
                                            └── uses shadcn components (Button, Card, etc.)
                                                    └── styled with Tailwind classes
                                                            └── themed by CSS variables in index.css
```

### Dev server flow

```
You edit LoginPage.tsx
    │
    ├─ Vite detects the change (file watcher)
    ├─ Compiles only that module (not the entire app)
    ├─ Sends the update via WebSocket to the browser
    └─ React hot-swaps the component (state preserved)

Total time: ~50ms
```

This is **Hot Module Replacement (HMR)** — the reason we use Vite.
Spring Boot's equivalent (DevTools auto-restart) takes 2-5 seconds.

### Production build

```bash
pnpm build
```

This runs:
1. `tsc -b` — TypeScript type-checking (catches type errors)
2. `vite build` — bundles everything into optimized static files:

```
dist/
├── index.html          ← single HTML file
└── assets/
    ├── index-xxx.js    ← all JavaScript, minified (~85KB gzipped)
    └── index-xxx.css   ← all CSS, minified (~5KB gzipped)
```

These static files can be served by any web server (Nginx, S3, Vercel, etc.).
No Node.js needed in production — it's just HTML/CSS/JS.

---

## Common Commands

```bash
pnpm dev                          # start dev server (localhost:5173)
pnpm build                        # type-check + production build
pnpm preview                      # preview production build locally
pnpx shadcn@latest add [name]     # add a shadcn component
pnpm add [package]                # add a dependency
pnpm add -D [package]             # add a dev dependency
```
