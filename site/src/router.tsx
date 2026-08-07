import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { NotFound } from './components/NotFound'
import { DefaultCatchBoundary } from './components/DefaultCatchBoundary'

/**
 * getRouter: the app router factory. TanStack Start calls this on the server
 * (per request) and on the client to construct the router. SSR is on by
 * default for every route. The generated routeTree lives in routeTree.gen.ts
 * (gitignored) and is produced by the Start Vite plugin from src/routes.
 */
export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    // SSR-friendly defaults; keep intent-based preloading light for a calm site.
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
    defaultNotFoundComponent: NotFound,
    defaultErrorComponent: DefaultCatchBoundary,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
