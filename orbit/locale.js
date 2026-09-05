const english = {
  previous: 'Previous book', next: 'Next book', explore: 'Explore this book',
  auto: 'Auto browse', pause: 'Pause auto browse', open: 'Open cover', close: 'Close cover',
  previousPage: 'Previous page', nextPage: 'Next page', reset: 'Reset view',
  read: 'Read the book', back: 'Back to the orbit', below: 'Scroll to content below',
  hint: 'Drag or use the arrows', controls: 'Book controls', preview: 'Interactive preview',
};
const dictionaries = {
  en: english,
  da: { previous:'Forrige bog',next:'Næste bog',explore:'Udforsk denne bog',auto:'Automatisk bladren',pause:'Sæt automatisk bladren på pause',open:'Åbn omslaget',close:'Luk omslaget',previousPage:'Forrige side',nextPage:'Næste side',reset:'Nulstil visning',read:'Læs bogen',back:'Tilbage til bogringen',below:'Rul til indholdet nedenfor',hint:'Træk eller brug pilene',controls:'Bogstyring',preview:'Interaktiv forhåndsvisning' },
  ar: { previous:'الكتاب السابق',next:'الكتاب التالي',explore:'استكشف هذا الكتاب',auto:'تصفح تلقائي',pause:'إيقاف التصفح التلقائي',open:'افتح الغلاف',close:'أغلق الغلاف',previousPage:'الصفحة السابقة',nextPage:'الصفحة التالية',reset:'إعادة ضبط العرض',read:'اقرأ الكتاب',back:'العودة إلى المكتبة',below:'انتقل إلى المحتوى أدناه',hint:'اسحب أو استخدم الأسهم',controls:'أدوات الكتاب',preview:'معاينة تفاعلية' },
};
export function orbitLabels(locale) { return dictionaries[locale] || english; }
