# CLAUDE.md - Frontend Development Guide

## Build & Run Commands
- Development: `npm run dev`
- Production build: `npm run build`
- Preview production: `npm run preview`
- Generate static: `npm run generate`

## Code Style Guidelines
- Use Vue 3 + Composition API with `<script setup>` syntax
- Use TypeScript for type safety when possible
- Imports: group by internal/external, alphabetize
- Component naming: PascalCase for components (e.g., `ProductDetail.vue`)
- State management: use Pinia stores with Composition API
- Error handling: use try/catch with specific error messages
- CSS: use Tailwind utility classes; custom styles in SCSS
- Documentation: comment complex logic and component APIs
- Responsive design: use mobile-first approach with Tailwind breakpoints
- Follow Vue 3 best practices for lifecycle hooks (onMounted, onBeforeUnmount)
- Prefer computed properties over methods for derived state