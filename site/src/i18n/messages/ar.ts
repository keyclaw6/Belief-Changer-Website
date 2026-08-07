import type { DeepPartial, Messages } from '../types'

/**
 * Arabic catalog, COMPLETE (Milestone 5).
 *
 * Every key in messages/en.ts is translated to natural Modern Standard Arabic
 * with the same warm register: رفيق بالإنسان، صارم مع الفخّ. Arabic script does
 * not use sentence case; punctuation follows Arabic conventions (، ؛) and there
 * are NO em-dashes anywhere. Numbers stay as Western digits inside interpolated
 * strings for consistency with the mono metadata. Lines are kept compact so the
 * RTL layouts hold. Crucially, this locale also proves dir="rtl" mirroring end
 * to end across every route.
 *
 * Book TITLES are not translated here: they come from the fixtures, not the
 * catalog, and stay in English for v1.
 *
 * Any omitted key falls back to English via the resolver in messages/index.ts;
 * this catalog is intended to be complete.
 */
export const ar: DeepPartial<Messages> = {
  // -- Brand -------------------------------------------------------------
  wordmark: 'Belief Changer',

  // -- Navigation --------------------------------------------------------
  nav: {
    library: 'المكتبة',
    howItWorks: 'كيف يعمل',
    language: 'اللغة',
    themeToDark: 'الوضع الداكن',
    themeToLight: 'الوضع الفاتح',
    skipToContent: 'تخطَّ إلى المحتوى',
  },

  // -- Footer ------------------------------------------------------------
  footer: {
    about: 'عن المشروع',
    requestABook: 'اطلب كتابًا',
    experiences: 'التجارب',
    blog: 'ملاحظات',
    openSource: 'مفتوح المصدر',
    navLabel: 'الموقع',
    trustLine: 'مجاني إلى الأبد · بلا حسابات، بلا تتبّع',
  },

  // -- Trust strip -------------------------------------------------------
  trust: {
    freeForever: 'مجاني إلى الأبد',
    noSignup: 'بلا تسجيل',
    noTracking: 'بلا تتبّع',
    everyLanguage: 'بكل اللغات',
  },

  // -- Home --------------------------------------------------------------
  home: {
    heroHeadline: 'ليست الإرادة هي ما ينقصك. إنه المخرج من الفخّ.',
    heroSubtext:
      'كتب مجانية تغيّر المعتقد الكامن خلف السلوك. بلغتك. بلا تسجيل، بلا تكلفة، بلا شروط.',
    askPlaceholder: 'أخبرنا بما تمرّ به...',
    primaryCta: 'اعثر على كتابك',

    reframe: {
      sentence1: 'أنت تختار دائمًا ما تعتقد أنه خيارك الأسعد.',
      sentence2:
        'الفخّ معتقد يكذب في الحساب، يَعِد بالراحة ويقدّم عكسها.',
      sentence3:
        'هذه الكتب تصحّح المعتقد، فيتبعه السلوك من تلقاء نفسه.',
    },

    method: {
      beat1Title: 'أن ترى الفخّ بوضوح',
      beat1Body:
        'كل فخّ يقوم على معتقد: أن الشيء يعينك. كل كتاب يفكّك ذلك المعتقد، بهدوء وبشكل كامل.',
      beat2Title: 'يفقد المعتقد قبضته',
      beat2Body:
        'حين ترى ما يمنحه الفخّ فعلًا وما يكلّفه فعلًا، لا يبقى للرغبة ما تقف عليه.',
      beat3Title: 'الخروج يشبه الراحة',
      beat3Body:
        'بلا إرادة، بلا عدّ للأيام. حين يتغيّر المعتقد، يكفّ الرحيل عن كونه تضحية ويصير خلاصًا.',
    },

    livingBooksTitle: 'كتب حيّة',
    livingBooksBody:
      'القرّاء يحسّنون كل كتاب. الإصدارات علنية. والإصدار الأحدث هو دائمًا الذي تحصل عليه.',

    requestHeading: 'أيّ فخّ نفكّكه تاليًا؟',
    requestCta: 'أضف صوتك',

    experiencesHeading: 'ما خرج منه القرّاء',

    askFieldLabel: 'أخبرنا بما تمرّ به',
    methodHeading: 'كيف يحدث الخروج',
    methodBody:
      'بلا إرادة، بلا عدّ للأيام. كل كتاب يفكّك معتقدًا واحدًا، فيتبعه السلوك.',
    livingBooksLink: 'تصفّح المكتبة',
    requestBody:
      'صوّت لكتاب كي يُكتب. أصوات كافية، ويُكتب التالي.',
    experiencesBody: 'مجهولة، صادقة، ومنشورة بإذن.',
    experiencesLink: 'اقرأ مزيدًا من التجارب',
    howItWorksLink: 'كيف يتغيّر المعتقد',
  },

  // -- Statuses (pastel tags) -------------------------------------------
  status: {
    gatheringVoices: 'يجمع الأصوات',
    beingWritten: 'قيد الكتابة',
    inTranslation: 'قيد الترجمة',
    published: 'منشور',
    inProduction: 'قيد الإنتاج',
  },

  // -- Library -----------------------------------------------------------
  library: {
    title: 'المكتبة',
    intro: 'كل كتاب لدينا، وكل كتاب في الطريق.',
    searchLabel: 'اعثر على كتاب',
    searchPlaceholder: 'ابحث بالعادة أو الشعور...',
    noMatchTitle: 'لا كتاب يطابق ذلك بعد.',
    noMatchBody:
      'أخبرنا بما تكافحه، وستأتي أصوات كافية بالكتاب إلى الوجود.',
    noMatchCta: 'اطلب هذا الكتاب',
    resultsCount: '{count} كتب',
    resultsCountOne: 'كتاب واحد',
    clearSearch: 'مسح',
    resultsFor: '{count} كتب عن “{query}”',
    resultsForOne: 'كتاب واحد عن “{query}”',
  },

  // -- Book page ---------------------------------------------------------
  book: {
    readOnline: 'اقرأ على الإنترنت',
    downloadEpub: 'نزّل EPUB',
    listen: 'استمع',
    onlyNewestDownload: 'الإصدار الأحدث وحده متاح للتنزيل.',
    versionLabel: 'الإصدار {version} · {month}',
    versionLanguages: 'الإصدار {version} · {count} لغات',
    versionLanguagesOne: 'الإصدار {version} · لغة واحدة',
    languagesCount: '{count} لغات',
    notYetInLanguage: 'ليس بلغتك بعد',
    changelogTab: 'سجلّ التغييرات',
    aboutTab: 'عن هذا الكتاب',
    improvedFromContributions: 'محسّن بمساهمات القرّاء',
    improveTitle: 'ساعد الإصدار التالي',
    improvePromptLostYou: 'أين فقدك الكتاب؟',
    improvePromptBeliefStanding: 'أيّ معتقد بقي قائمًا؟',
    improvePromptWhatHappened: 'ماذا حدث لك؟',
    improveFreeText: 'أيّ شيء آخر تودّ أن يعرفه المحرّرون',
    improveConsent: 'يمكنك نشر هذا كتجربة قارئ مجهولة.',
    improveSubmit: 'أرسل إلى المحرّرين',
    experiencesEmpty:
      'لا تجارب لهذا الكتاب بعد. قد تكون تجربتك الأولى.',

    experiencesHeading: 'ما خرج منه قرّاء هذا الكتاب',
    versionHeading: 'كتاب حيّ',
    improveGuide:
      'الملاحظات المحدّدة والشخصية على مستوى المعتقد تشكّل الإصدار التالي أكثر من غيرها. الأسئلة اختيارية، أجب عمّا يناسبك.',
    improveOptional: 'اختياري',
    improveSuccessTitle: 'شكرًا لك. المحرّرون يقرؤون كل شيء.',
    improveSuccessBody:
      'أوضح الملاحظات وأكثرها شخصية تشكّل الإصدار التالي، ويسجّل سجلّ التغييرات ما الذي تغيّر. لا شيء هنا مرتبط بك.',
    howItWorksCrosslink: 'كيف يتغيّر المعتقد',
    languagesCountOne: 'لغة واحدة',
    notPublishedYet: 'هذا الكتاب في الطريق.',
  },

  // -- Reader ------------------------------------------------------------
  reader: {
    prev: 'الفصل السابق',
    next: 'الفصل التالي',
    backToBook: 'العودة إلى الكتاب',
    comfortLight: 'فاتح',
    comfortSepia: 'بنّي',
    comfortDark: 'داكن',
    chapterOf: 'الفصل {n} من {total}',
    comfortLabel: 'راحة القراءة',
    chaptersLabel: 'الفصول',
    contents: 'المحتويات',
    beingWrittenTitle: 'لا يزال هذا الفصل قيد الكتابة.',
    beingWrittenBody:
      'هذا الكتاب كتاب حيّ. تُنشر الفصول كلما اكتملت، ويحصل كل قارئ على الإصدار الأحدث.',
    beingWrittenCta: 'انظر ما الذي تغيّر',
  },

  // -- Requests board ----------------------------------------------------
  requests: {
    title: 'أيّ فخّ نفكّكه تاليًا؟',
    intro: 'صوّت للكتاب التالي كي يُكتب. بلا حساب، بلا تكلفة.',
    loopExplainer:
      'كل موضوع في الأسفل كتاب طلبه أحدهم. حين تجتمع أصوات كافية خلف واحد منها، يُكتب الكتاب، ويحصل عليه الجميع مجانًا. التصويت نقرة واحدة ولا يطلب منك شيئًا.',
    rankedHeading: 'ما طلبه القرّاء',
    addYourVoice: 'أضف صوتك',
    voted: 'أُضيف صوتك',
    voteAria: 'أضف صوتك إلى “{subject}”',
    votedAria: 'أضفت صوتك إلى “{subject}”',
    voteCount: '{count} أصوات',
    voteCountOne: 'صوت واحد',
    readTheBook: 'اقرأ الكتاب',
    rankLabel: 'الترتيب',
    submitTitle: 'اطلب كتابًا',
    submitBody:
      'سمِّ الفخّ بكلماتك أنت. إن لم يكن مدرجًا بعد، سنضيفه كي يستطيع غيرك أن يضيف أصواتهم أيضًا.',
    submitSubjectLabel: 'ما الذي تكافحه؟',
    submitSubjectHelp: 'سطر قصير بصيغة المتكلّم يعمل أفضل، مثل الأسطر في الأعلى.',
    submitSubjectPlaceholder: 'لا أستطيع التوقّف عن...',
    submitExperienceLabel: 'كيف هو الأمر، بكلماتك',
    submitExperienceOptional: 'اختياري',
    submitExperiencePlaceholder:
      'أيّ شيء تودّ قوله عن شعورك أو عمّا جرّبته.',
    submitCta: 'أضف طلبك',
    submitSuccessTitle: 'صوتك محسوب.',
    submitSuccessBody:
      'حين تجتمع أصوات كافية خلف موضوع، يُكتب الكتاب ويُنشر مجانًا للجميع. لا شيء هنا مرتبط بك.',
    submitAnother: 'اطلب كتابًا آخر',
  },

  // -- Experiences board -------------------------------------------------
  experiences: {
    title: 'ما خرج منه القرّاء',
    intro: 'مجهولة، صادقة، ومنشورة بإذن.',
    lede:
      'هذه ملاحظات من أناس قرؤوا أحد الكتب وأرادوا أن يقولوا ما الذي تغيّر. كلّ واحدة مجهولة ومنشورة بإذن. بلا أسماء، بلا أعداد، وبلا تواريخ أدقّ من شهر.',
    filterLabel: 'اعرض التجارب لـ',
    filterAll: 'كل الكتب',
    listHeading: 'تجارب القرّاء',
    countAll: '{count} تجارب',
    countAllOne: 'تجربة واحدة',
    countForBook: '{count} تجارب عن {book}',
    countForBookOne: 'تجربة واحدة عن {book}',
    emptyFiltered:
      'لا تجارب عن {book} بعد. قد تكون تجربتك الأولى.',
    empty: 'لا تجارب بعد. قد تكون تجربتك الأولى.',
    clearFilter: 'اعرض كل الكتب',
    monthLabel: '{month}',
    aboutBook: 'عن {book}',
    submitTitle: 'شارك ما حدث',
    submitBody:
      'إن غيّر أحد الكتب شيئًا لك، يمكنك قول ذلك هنا. يُنشر مجهولًا، بلا اسم وبلا أيّ طريقة لتتبّعه إليك.',
    submitBookLabel: 'أيّ كتاب',
    submitBookPlaceholder: 'اختر كتابًا',
    submitTextLabel: 'ماذا حدث لك؟',
    submitTextPlaceholder:
      'ما الذي تحرّك، وما الذي فاجأك، وكيف هو الأمر الآن.',
    submitConsentLabel:
      'انشر هذا مجهولًا كتجربة قارئ. بلا اسم، بلا حساب، بلا أيّ طريقة لتتبّعه إليك.',
    submitCta: 'شارك مجهولًا',
    submitSuccessTitle: 'شكرًا لمشاركتك.',
    submitSuccessBody:
      'تمرّ كل تجربة بمراجعة هادئة قبل نشرها، كي يلقى غيرك ممّن يقرؤون في لحظة صعبة شيئًا صادقًا. لا شيء هنا مرتبط بك.',
    submitAnother: 'شارك تجربة أخرى',
    consentRequired: 'يرجى تأكيد رغبتك في نشر هذا مجهولًا.',
    bookRequired: 'يرجى اختيار الكتاب الذي يخصّه هذا.',
    imageAlt: 'أناس يمشون معًا في ضوء منعش بعد المطر',
  },

  // -- Blog --------------------------------------------------------------
  blog: {
    title: 'ملاحظات',
    intro: 'أخبار من المكتبة، وكيف تصير الكتب أفضل.',
    readMore: 'اقرأ الملاحظة',
    readAria: 'اقرأ: {title}',
    backToNotes: 'كل الملاحظات',
    postedLabel: 'نُشر في {month}',
    imageAlt: 'طائرة ورقية عالية في سماء صافية في يوم مشرق ومنفتح',
  },

  // -- How it works (method page) ---------------------------------------
  howItWorks: {
    title: 'كيف يتغيّر المعتقد',
    lede:
      'بلا إرادة، بلا خجل، بلا عدّ للأيام. كل كتاب هنا يقوم على فكرة واحدة بسيطة، وهي جديرة بالفهم قبل أن تقرأ كلمة.',
    principleHeading: 'أنت تختار دائمًا خيارك الأسعد',
    principleBody:
      'في كل لحظة، تفعل ما تعتقد أنه سيتركك في أفضل حال. لا الأصحّ، ولا ما تدافع عنه بصوت عالٍ، بل ما يبدو أقلّ الخيارات سوءًا الآن. هذا ليس عيبًا. هكذا يعمل الجميع. ما يعني أن السلوك ليس المشكلة حقًّا. بل المعتقد الذي تحته.',
    trapHeading: 'الفخّ معتقد يكذب في الحساب',
    trapBody:
      'يتمكّن الفخّ حين يخطئ معتقد بهدوء في حساب ما يمنحك إياه شيءٌ وما يكلّفه. الشراب يَعِد بالهدوء ويقدّم صباحًا أسوأ. الشاشة تَعِد بشيء جميل قريبًا وتقدّم القلق نفسه من جديد. ما دام المعتقد قائمًا، فمدّ اليد إليه هو حقًّا خيارك الأسعد، فتمدّها. لم تكن المشكلة يومًا قوّتك. بل الحساب الذي سُلّم إليك.',
    knownHeading: 'يجب أن يُعرف في القلب، لا في الرأس وحده',
    knownBody:
      'يعرف الجميع تقريبًا، نظريًّا، أن العادة تكلّف أكثر ممّا تمنح. ومعرفته كحقيقة لا تغيّر شيئًا، لأن الرغبة لا تصغي للحقائق. ما يفعله كل كتاب هو تفكيك المعتقد ببطء يكفي كي تشعر بصدقه، لا أن توافق عليه فقط. حين تنفذ الرؤية عميقًا، لا يبقى للرغبة ما تقف عليه.',
    noWillpowerHeading: 'ليست هذه معركة، ولست ضعيفًا',
    noWillpowerBody:
      'الإرادة ما تحتاجه حين لا يزال جزء منك يعتقد أن الفخّ يستحق. وهي مرهقة لأنها حرب بين نصفَي إنسان واحد. غيّر المعتقد وتنتهي الحرب، لأنه لم يعد ثمة ما تقاومه. إن كنت حاولت من قبل ولم يدُم الأمر، فلم يكن ذلك يومًا حكمًا على شخصيتك. المعتقد فقط لم يكن قد تحرّك بعد.',
    escapeHeading: 'يصير الرحيل خلاصًا، لا تضحية',
    escapeBody:
      'حين يتحرّك المعتقد أخيرًا، يكفّ الرحيل عن الشعور بأنك تتخلّى عن شيء. لست تكابد مرورًا بمتعة لا تزال تريدها. أنت تخطو خارج شيء صار بوسعك أن ترى أنه لم يكن يومًا سوى آخذٍ منك. لذلك يكون الشعور على الجانب الآخر راحةً، وغالبًا دهشةً صغيرة من هدوئه.',
    closingHeading: 'اعثر على كتاب فخّك',
    closingBody:
      'كل كتاب هو فخّ واحد، مفكّك على هذا النحو. إن لم يكن فخّك هنا بعد، فأضف صوتك وساعد على إحضاره إلى الوجود.',
    ctaLibrary: 'تصفّح المكتبة',
    ctaRequests: 'اطلب كتابًا',
    heroImageAlt:
      'نهر هادئ ينفتح أمامك عبر ضوء أخضر منعش، والطريق إلى الخارج واضح',
  },

  // -- About -------------------------------------------------------------
  about: {
    title: 'عن Belief Changer',
    missionHeading: 'لماذا وُجد هذا',
    missionBody1:
      'ثمة طريقة لإنهاء عادة تعمل بتغيير المعتقد الكامن تحتها، لا بمصارعة السلوك في الأعلى. لقد حرّرت بهدوء عددًا كبيرًا من الناس من فخاخ بعينها. توجد هذه المكتبة كي تأخذ النهج نفسه وتقدّمه لكل فخّ، لأيّ إنسان، بلغته، بلا تكلفة.',
    missionBody2:
      'من يبحث عن المخرج ينبغي ألّا يضطر أبدًا إلى تجاوز جدار دفع أو حساب أو أداة تتبّع كي يصل إليه. فلا شيء من ذلك هنا. تُبنى الكتب ويُعتنى بها فريق من الوكلاء يعملون وفق مقياس واحد للجودة، والمشروع كلّه مصمَّم كي يهب نفسه.',
    lawsHeading: 'ما سيبقى صحيحًا هنا دائمًا',
    lawFreeTitle: 'مجاني إلى الأبد',
    lawFreeBody: 'كل كتاب، مجاني للقراءة والتنزيل والاحتفاظ. لا مستوى محجوب.',
    lawNoSignupTitle: 'بلا تسجيل',
    lawNoSignupBody: 'بلا حساب، بلا بريد، بلا جدار بينك وبين الصفحة الأولى.',
    lawNoTrackingTitle: 'بلا تتبّع',
    lawNoTrackingBody: 'بلا ملفّات تعريف، بلا ملفّات ارتباط، ولا شيء على جهازك نقرؤه كي نتعقّبك.',
    lawEveryLanguageTitle: 'بكل اللغات',
    lawEveryLanguageBody: 'مترجم بأوسع ما نستطيع بلوغه، لأن المخرج ينبغي ألّا يتوقّف على لسانك.',
    lawLivingTitle: 'كتب حيّة',
    lawLivingBody: 'القرّاء يحسّنون كل كتاب، والإصدارات علنية، والأحدث هو دائمًا الذي تحصل عليه.',
    honestyHeading: 'كيف نعدّ، بصدق',
    honestyBody:
      'نعدّ مشاهدات الصفحات والبحوث إجماليًّا، كي نعرف أيّ الفخاخ يحتاج الناس كتبًا لها. لا نعرّفك أبدًا. بلا ملفّات ارتباط، بلا حسابات، بلا تتبّع. الشيء الوحيد المحفوظ على جهازك هو ما يجعل الموقع يعمل من أجلك: مظهرك، ولغتك، وموضعك في كتاب، والمواضيع التي صوّتّ لها.',
    openSourceHeading: 'مفتوح المصدر',
    openSourceBody:
      'الموقع الذي يقدّم هذه الكتب مفتوح المصدر. يستطيع أيّ أحد أن يقرأ كيف يعمل، وأن يتحقّق من أنه يفعل ما يقوله عن الخصوصية، وأن يبني عليه. لا شيء خفيّ عن كيفية معاملتك هنا.',
    openSourceLink: 'اقرأ المصدر',
    imageAlt: 'نافذة مفتوحة في غرفة هادئة، وضوء الصباح يدخل منها',
  },

  // -- 404 ---------------------------------------------------------------
  notFound: {
    title: 'هذه الصفحة ليست في المكتبة.',
    body: 'الصفحة التي تبحث عنها انتقلت أو لم توجد قطّ. المكتبة لا تزال هنا.',
    home: 'اذهب إلى الصفحة الرئيسية',
    browse: 'تصفّح المكتبة',
    imageAlt: 'شارع هادئ منفتح في ضوء صباحي ناعم',
  },

  // -- Language switcher -------------------------------------------------
  langSwitcher: {
    label: 'غيّر اللغة',
    heading: 'اللغة',
  },
}
