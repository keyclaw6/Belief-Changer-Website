/// <reference types="vite/client" />
import { hydrateStart } from '@tanstack/react-start/client'

/**
 * Client entry. Hydrates the server-rendered app. Explicit (rather than relying
 * on the plugin's virtual default) so later milestones can attach client-only
 * providers here if ever needed. Keep this leaf tiny; page interactivity lives
 * in isolated client components.
 */
hydrateStart()
