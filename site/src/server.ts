import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server'

/**
 * Server entry. Streams SSR HTML for every route. This mirrors the default
 * TanStack Start server entry and is made explicit here so later milestones
 * have a documented place to add server-side concerns (locale negotiation from
 * Accept-Language, security headers, etc.) without reaching into the plugin.
 */
const fetch = createStartHandler(defaultStreamHandler)

export default {
  fetch,
}
