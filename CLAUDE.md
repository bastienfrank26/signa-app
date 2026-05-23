# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Framework**: React 19.2.6 with TypeScript
- **Build Tool**: Vite 8.0.12
- **Styling**: Tailwind CSS 4.3.0 (with Vite integration)
- **Type Checking**: TypeScript 6.0.2
- **Linting**: ESLint 10.3.0 with TypeScript and React Hooks support
- **Language**: TypeScript (strict mode with ESM modules)

## Project Structure

```
src/
  main.tsx           # React app entry point using createRoot
  App.tsx            # Main App component with counter demo and documentation links
  App.css            # Component-specific styles (modern CSS with nesting)
  index.css          # Global styles with CSS variables and dark mode support
  assets/            # Images and SVGs (react.svg, vite.svg, hero.png)
public/              # Static assets served as-is
  favicon.svg
  icons.svg          # SVG sprite with documentation/social icons
vite.config.ts       # Vite configuration with React plugin
tsconfig.app.json    # App TypeScript configuration (es2023, React JSX, strict)
tsconfig.node.json   # Node/build tools TypeScript configuration
eslint.config.js     # ESLint flat config with React Hooks and Refresh plugins
```

## Key Commands

```bash
npm run dev      # Start Vite dev server with HMR (hot module replacement)
npm run build    # Type-check with tsc and build optimized bundle
npm run lint     # Run ESLint on all TypeScript/TSX files
npm run preview  # Preview the production build locally
```

## Development Patterns

### Styling
- Global styles in `src/index.css` define CSS custom properties for theming (light/dark mode)
- Component styles in `src/App.css` use modern CSS nesting and @media queries
- Tailwind CSS 4 integrated via Vite plugin (no config file needed for basic setup)
- Dark mode automatically switches via `prefers-color-scheme` media query

### Component Structure
- Functional components with React hooks (useState demonstrated in App.tsx)
- React 19 with StrictMode enabled for development checks
- Entry point uses `createRoot()` from react-dom/client (React 18+ API)

### TypeScript Configuration
- Strict mode enabled: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- JSX preset: `react-jsx` (automatic JSX transform, no React import needed)
- Module resolution: `bundler` mode for modern ESM with TypeScript extensions allowed
- Target: ES2023 with DOM libraries

### ESLint Rules
- React Hooks exhaustive dependencies enforced
- React Refresh Fast Refresh plugin active (safe for HMR)
- Recommended TypeScript ESLint rules applied
- No additional eslint-plugin-react-x configured yet (can be added for stricter rules)

## Build Process

1. **Type Check**: `tsc -b` runs TypeScript compiler in build mode across referenced configs
2. **Bundle**: Vite handles module bundling, code splitting, and optimization
3. **Output**: Built files go to `dist/` directory for production deployment

## Entry Point

The app mounts to `<div id="root"></div>` in `index.html` and renders the App component within React.StrictMode for development safety.
