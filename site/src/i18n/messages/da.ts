import type { DeepPartial, Messages } from '../types'

/**
 * Danish catalog, SAMPLE ONLY for Milestone 1.
 *
 * Per SITE-PLAN, da carries nav + home + book-page core strings to prove the
 * machinery; a later milestone completes it. Every missing key falls back to
 * English via the resolver in messages/index.ts. These sample translations are
 * plain and in register; a native reviewer will finalize them later.
 * MOCK/PARTIAL: not a complete or reviewed translation.
 */
export const da: DeepPartial<Messages> = {
  wordmark: 'Belief Changer',

  nav: {
    library: 'Bibliotek',
    howItWorks: 'Sådan virker det',
    language: 'Sprog',
    themeToDark: 'Mørk tilstand',
    themeToLight: 'Lys tilstand',
    skipToContent: 'Spring til indhold',
  },

  footer: {
    about: 'Om',
    requestABook: 'Ønsk en bog',
    openSource: 'Åben kildekode',
    trustLine: 'Gratis for altid · ingen konti, ingen sporing',
  },

  trust: {
    freeForever: 'Gratis for altid',
    noSignup: 'Ingen tilmelding',
    noTracking: 'Ingen sporing',
    everyLanguage: 'Alle sprog',
  },

  home: {
    heroHeadline: 'Det er ikke viljestyrke, du mangler. Det er vejen ud af en fælde.',
    heroSubtext:
      'Gratis bøger, der ændrer troen bag adfærden. På dit sprog. Ingen tilmelding, ingen udgift, ingen hage.',
    primaryCta: 'Find din bog',
  },

  notFound: {
    title: 'Denne side er ikke i biblioteket.',
  },
}
