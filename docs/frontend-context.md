# Frontend Context

## Architecture
The Admin UI is constructed as a React SPA using Vite, bundled and served statically or via SSR if advanced deployment options are chosen. 

## Routing & Flow
- The frontend is _not_ the direct App URL. It serves as the frontend for the Admin dashboard inside the SHOPLINE portal.
- All requests are routed through React Router.
- **`api/` layer**: Utilizes Axios or direct Fetch wrapped in react-query for auto-caching.

## Pages
1. `/` (Dashboard / Blind Box List)
2. `/blind-boxes/create` (Create config setup)
3. `/blind-boxes/:id/edit` (Edit specific limits & weights)
4. `/assignments` (Viewing orders and their assigned box items)

## Component Strategy
- Focus strictly on standard Tailwind CSS utilities for responsive admin components to keep dependency weight low.
- Provide clean `EmptyState`, `LoadingSpinner`, and `ErrorView` handlers per feature.
