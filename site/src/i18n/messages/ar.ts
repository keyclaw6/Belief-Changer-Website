import type { DeepPartial, Messages } from '../types'

/**
 * Arabic catalog, SAMPLE ONLY for Milestone 1.
 *
 * Per SITE-PLAN, ar carries nav + home + book-page core strings and, crucially,
 * proves dir="rtl" mirroring end to end. A later milestone completes it. Every
 * missing key falls back to English via the resolver in messages/index.ts.
 * MOCK/PARTIAL: not a complete or reviewed translation.
 */
export const ar: DeepPartial<Messages> = {
  wordmark: 'Belief Changer',

  nav: {
    library: 'المكتبة',
    howItWorks: 'كيف يعمل',
    language: 'اللغة',
    themeToDark: 'الوضع الداكن',
    themeToLight: 'الوضع الفاتح',
    skipToContent: 'تخطَّ إلى المحتوى',
  },

  footer: {
    about: 'حول',
    requestABook: 'اطلب كتابًا',
    openSource: 'مفتوح المصدر',
    trustLine: 'مجاني إلى الأبد · بلا حسابات، بلا تتبّع',
  },

  trust: {
    freeForever: 'مجاني إلى الأبد',
    noSignup: 'بلا تسجيل',
    noTracking: 'بلا تتبّع',
    everyLanguage: 'كل اللغات',
  },

  home: {
    heroHeadline: 'ليست الإرادة هي ما ينقصك. إنه المخرج من الفخّ.',
    heroSubtext:
      'كتب مجانية تغيّر المعتقد الكامن خلف السلوك. بلغتك. بلا تسجيل، بلا تكلفة، بلا شروط.',
    primaryCta: 'اعثر على كتابك',
  },

  notFound: {
    title: 'هذه الصفحة ليست في المكتبة.',
  },
}
