// Authenticated source content, not invented manuscript: preserve the site's existing excerpts.
import ts from 'typescript';
import vm from 'node:vm';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const site = path.resolve(import.meta.dirname, '..');
function load(file) {
  const source = readFileSync(file, 'utf8'),
    exports = {};
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  vm.runInNewContext(code, {
    exports,
    require: (id) => load(path.resolve(path.dirname(file), id + '.ts')),
  });
  return exports;
}
const { books } = load(path.join(site, 'src/data/books.ts'));
const text = {
  en: {
    preview: 'Interactive preview',
    note: 'About this preview',
    intro: 'Before you begin',
    contents: 'Inside this sample',
    opening: 'Opening sample',
    end: 'Continue reading',
    endBody:
      'This is the end of the five-leaf interactive sample. No more 3D pages turn here.',
    cta: 'Continue to the book online',
    draft:
      'This manuscript is being written. The following pages show its planned outline, not finished chapters.',
    planned: 'Planned chapter',
    available:
      'The excerpt is drawn from the English sample text currently available on this site. This is not a complete edition.',
    none: 'No chapter prose is available for this title yet. Its book page shows the current availability.',
    noDownload: 'No EPUB download is available yet.',
    outline: 'Manuscript outline',
  },
  da: {
    preview: 'Interaktiv læseprøve',
    note: 'Om læseprøven',
    intro: 'Før du begynder',
    contents: 'I denne læseprøve',
    opening: 'Uddrag',
    end: 'Læs videre',
    endBody:
      'Her slutter den interaktive læseprøve med fem blade. Der er ikke flere 3D-sider at vende.',
    cta: 'Fortsæt til bogen online',
    draft:
      'Manuskriptet er under udarbejdelse. De næste sider viser den planlagte struktur, ikke færdige kapitler.',
    planned: 'Planlagt kapitel',
    available:
      'Uddraget er fra den engelske prøvetekst på hjemmesiden. Det er ikke en komplet udgave eller en dansk oversættelse.',
    none: 'Der er endnu ingen kapiteltekst til denne titel. Bogens side viser den aktuelle status.',
    noDownload: 'Der er endnu ingen EPUB-fil.',
    outline: 'Manuskriptets struktur',
  },
  ar: {
    preview: 'معاينة تفاعلية',
    note: 'عن هذه المعاينة',
    intro: 'قبل أن تبدأ',
    contents: 'محتويات المعاينة',
    opening: 'مقتطف افتتاحي',
    end: 'متابعة القراءة',
    endBody:
      'هذه نهاية العينة التفاعلية المكوّنة من خمس أوراق. لا توجد صفحات ثلاثية الأبعاد أخرى هنا.',
    cta: 'متابعة إلى صفحة الكتاب',
    draft:
      'المخطوط قيد الكتابة. تعرض الصفحات التالية مخططه المقترح، وليست فصولاً مكتملة.',
    planned: 'فصل مقترح',
    available:
      'هذا المقتطف من النص التجريبي الإنجليزي المتاح على الموقع، وليس إصداراً كاملاً أو ترجمة عربية.',
    none: 'لا يتوفر نص الفصول لهذا العنوان بعد. تعرض صفحة الكتاب حالته الحالية.',
    noDownload: 'لا يتوفر ملف EPUB بعد.',
    outline: 'مخطط الكتاب',
  },
};
const data = {};
for (const b of books) {
  data[b.slug] = {};
  for (const [locale, l] of Object.entries(text)) {
    const body = b.chapters.find((c) => c.body?.length),
      pages = [
        {
          type: 'title',
          title: b.title,
          subtitle: l.preview,
          imprint: 'Belief Changer',
        },
        {
          type: 'chapter',
          title: l.note,
          paragraphs: [
            body ? l.available : l.none,
            'Belief Changer · Free to read · No sign-up',
            l.noDownload,
          ],
        },
        {
          type: 'toc',
          title: l.contents,
          toc: [
            { title: l.note, page: '2' },
            { title: l.intro, page: '4' },
            { title: body ? l.opening : l.outline, page: '5–10' },
            { title: l.cta, page: '11' },
          ],
        },
        {
          type: 'chapter',
          title: l.intro,
          paragraphs: [b.promise, body ? l.available : l.draft],
        },
      ];
    if (body) {
      // Six contiguous passages, no synthetic chapter headings or repeated filler.
      const sentences =
        body.body.join('\n\n').match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) ||
        body.body;
      const chunks = [];
      let chunk = '';
      for (const sentence of sentences) {
        if ((chunk + ' ' + sentence).trim().split(/\s+/).length > 95 && chunk) {
          chunks.push(chunk.trim());
          chunk = '';
        }
        chunk += sentence;
      }
      if (chunk.trim()) chunks.push(chunk.trim());
      for (let i = 0; i < 6; i++)
        pages.push({
          type: 'chapter',
          kicker: `${l.opening} · ${i + 1}/6`,
          title: i === 0 ? body.title : '',
          paragraphs: [chunks[i] || l.available],
        });
    } else {
      for (let i = 0; i < 6; i++) {
        const c = b.chapters[i];
        pages.push(
          c
            ? {
                type: 'section',
                kicker: `${l.planned} ${c.n}`,
                title: c.title,
                subtitle: l.draft,
              }
            : {
                type: 'section',
                title: i === 5 ? l.cta : l.outline,
                subtitle: i === 5 ? l.none : l.draft,
              },
        );
      }
    }
    pages.push({
      type: 'chapter',
      title: l.end,
      paragraphs: [l.endBody, body ? l.available : l.none, l.cta],
      previewEnd: true,
    });
    data[b.slug][locale] = {
      pages,
      cta: l.cta,
      end: l.endBody,
      hasExcerpt: !!body,
      source: body
        ? 'site/src/data/sample-chapters.ts'
        : 'site/src/data/books.ts',
    };
  }
}
writeFileSync(
  path.join(site, 'public/orbit/_extract/preview-content.json'),
  JSON.stringify(data, null, 2) + '\n',
);
console.log(
  `Generated five-leaf previews for ${books.length} catalog entries in ${Object.keys(text).length} interface locales.`,
);
