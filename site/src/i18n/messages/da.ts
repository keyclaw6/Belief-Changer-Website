import type { DeepPartial, Messages } from '../types'

/**
 * Danish catalog, COMPLETE (Milestone 5).
 *
 * Every key in messages/en.ts is translated to natural, warm, idiomatic Danish.
 * The register carries over exactly: varm mod personen, hård mod fælden;
 * sentence case; ingen udråbstegn; NUL tankestreger (em-dashes) i synlig tekst,
 * kun bindestreger; ingen anglicismer hvor et naturligt dansk ord findes. The
 * tone should read like a thoughtful Danish publisher, not machine translation.
 *
 * Book TITLES are not translated here: they come from the fixtures, not the
 * catalog, and stay in English for v1 (no invented Danish titles).
 *
 * Any key that were ever to be omitted falls back to English via the resolver
 * in messages/index.ts; this catalog is intended to be complete.
 */
export const da: DeepPartial<Messages> = {
  // -- Brand -------------------------------------------------------------
  wordmark: 'Belief Changer',

  // -- Navigation --------------------------------------------------------
  nav: {
    library: 'Bibliotek',
    howItWorks: 'Sådan virker det',
    language: 'Sprog',
    themeToDark: 'Mørk tilstand',
    themeToLight: 'Lys tilstand',
    skipToContent: 'Spring til indhold',
  },

  // -- Footer ------------------------------------------------------------
  footer: {
    about: 'Om',
    requestABook: 'Ønsk en bog',
    experiences: 'Oplevelser',
    blog: 'Noter',
    privacy: 'Privatliv',
    openSource: 'Åben kildekode',
    navLabel: 'Websted',
    trustLine: 'Gratis for altid · ingen konti, ingen sporing',
  },

  // -- Trust strip -------------------------------------------------------
  trust: {
    freeForever: 'Gratis for altid',
    noSignup: 'Ingen tilmelding',
    noTracking: 'Ingen sporing',
    everyLanguage: 'Alle sprog',
  },

  // -- Home --------------------------------------------------------------
  home: {
    heroHeadline: 'Det er ikke viljestyrke, du mangler. Det er vejen ud af en fælde.',
    heroSubtext:
      'Gratis bøger, der ændrer troen bag adfærden. På dit sprog. Ingen tilmelding, ingen udgift, ingen hage.',
    askPlaceholder: 'Fortæl os, hvad du går igennem...',
    primaryCta: 'Find din bog',

    reframe: {
      sentence1: 'Du vælger altid det, du tror er din lykkeligste mulighed.',
      sentence2:
        'En fælde er en tro, der lyver om regnestykket, den lover lindring og leverer det modsatte.',
      sentence3:
        'Disse bøger retter troen, og adfærden følger med af sig selv.',
    },

    method: {
      beat1Title: 'Se fælden tydeligt',
      beat1Body:
        'Enhver fælde kører på en tro: at tingen hjælper dig. Hver bog skiller den tro ad, roligt og fuldstændigt.',
      beat2Title: 'Troen mister sit greb',
      beat2Body:
        'Når du ser, hvad fælden faktisk giver, og hvad den faktisk koster, har trangen ikke længere noget at stå på.',
      beat3Title: 'At gå ud føles som lettelse',
      beat3Body:
        'Ingen viljestyrke, ingen optælling af dage. Når troen ændrer sig, holder det op med at være et offer at gå og bliver i stedet en flugt.',
    },

    livingBooksTitle: 'Levende bøger',
    livingBooksBody:
      'Læserne forbedrer hver bog. Versionerne er offentlige. Den nyeste version er altid den, du får.',

    requestHeading: 'Hvilken fælde skal vi skille ad som den næste?',
    requestCta: 'Læg din stemme til',

    experiencesHeading: 'Det læserne gik ud af',

    askFieldLabel: 'Fortæl os, hvad du går igennem',
    methodHeading: 'Sådan foregår en flugt',
    methodBody:
      'Ingen viljestyrke, ingen optælling af dage. Hver bog skiller én tro ad, og adfærden følger med.',
    livingBooksLink: 'Se biblioteket',
    requestBody:
      'Stem en bog til live. Nok stemmer, og den næste bliver skrevet.',
    experiencesBody: 'Anonymt, ærligt og delt med tilladelse.',
    experiencesLink: 'Læs flere oplevelser',
    howItWorksLink: 'Sådan virker en ændret tro',
  },

  // -- Statuses (pastel tags) -------------------------------------------
  status: {
    gatheringVoices: 'Samler stemmer',
    beingWritten: 'Bliver skrevet',
    inTranslation: 'Under oversættelse',
    published: 'Udgivet',
    inProduction: 'Under produktion',
  },

  // -- Library -----------------------------------------------------------
  library: {
    title: 'Bibliotek',
    intro: 'Hver bog vi har, og hver bog der er på vej.',
    searchLabel: 'Find en bog',
    searchPlaceholder: 'Søg efter vane eller følelse...',
    noMatchTitle: 'Ingen bog passer på det endnu.',
    noMatchBody:
      'Fortæl os, hvad du kæmper med, så bringer nok stemmer bogen til live.',
    noMatchCta: 'Ønsk denne bog',
    resultsCount: '{count} bøger',
    resultsCountOne: '1 bog',
    clearSearch: 'Ryd',
    resultsFor: '{count} bøger for “{query}”',
    resultsForOne: '1 bog for “{query}”',
  },

  // -- Book page ---------------------------------------------------------
  book: {
    readOnline: 'Læs online',
    downloadEpub: 'Hent EPUB',
    listen: 'Lyt',
    onlyNewestDownload: 'Kun den nyeste version kan hentes.',
    versionLabel: 'Version {version} · {month}',
    versionLanguages: 'Version {version} · {count} sprog',
    versionLanguagesOne: 'Version {version} · 1 sprog',
    languagesCount: '{count} sprog',
    notYetInLanguage: 'Ikke på dit sprog endnu',
    changelogTab: 'Ændringslog',
    aboutTab: 'Om denne bog',
    improvedFromContributions: 'Forbedret ud fra læsernes bidrag',
    improveTitle: 'Hjælp den næste version',
    improvePromptLostYou: 'Hvor mistede den dig?',
    improvePromptBeliefStanding: 'Hvilken tro stod stadig tilbage?',
    improvePromptWhatHappened: 'Hvad skete der for dig?',
    improveFreeText: 'Alt andet, redaktørerne bør vide',
    improveConsent: 'Du må gerne udgive dette som en anonym læseroplevelse.',
    improveSubmit: 'Send til redaktørerne',
    experiencesEmpty:
      'Ingen oplevelser for denne bog endnu. Din kunne blive den første.',

    experiencesHeading: 'Det læserne gik ud af denne bog',
    versionHeading: 'En levende bog',
    improveGuide:
      'Konkrete, personlige noter på trosniveau former den næste version mest. Spørgsmålene er valgfri, svar på det, der passer.',
    improveOptional: 'Valgfrit',
    improveSuccessTitle: 'Tak. Redaktørerne læser alt.',
    improveSuccessBody:
      'De klareste og mest personlige noter former den næste version, og ændringsloggen holder styr på, hvad der blev ændret. Intet her er knyttet til dig.',
    howItWorksCrosslink: 'Sådan virker en ændret tro',
    languagesCountOne: '1 sprog',
    notPublishedYet: 'Denne bog er på vej.',
  },

  // -- Reader ------------------------------------------------------------
  reader: {
    prev: 'Forrige kapitel',
    next: 'Næste kapitel',
    backToBook: 'Tilbage til bogen',
    comfortLight: 'Lys',
    comfortSepia: 'Sepia',
    comfortDark: 'Mørk',
    chapterOf: 'Kapitel {n} af {total}',
    comfortLabel: 'Læsekomfort',
    chaptersLabel: 'Kapitler',
    contents: 'Indhold',
    beingWrittenTitle: 'Dette kapitel bliver stadig skrevet.',
    beingWrittenBody:
      'Denne bog er en levende bog. Kapitlerne lægges op, efterhånden som de bliver færdige, og alle læsere får den nyeste version.',
    beingWrittenCta: 'Se hvad der blev ændret',
  },

  // -- Requests board ----------------------------------------------------
  requests: {
    title: 'Hvilken fælde skal vi skille ad som den næste?',
    intro: 'Stem den næste bog til live. Ingen konto, ingen udgift.',
    loopExplainer:
      'Hvert emne nedenfor er en bog, som nogen har bedt om. Når nok stemmer samler sig om ét af dem, bliver bogen skrevet, og alle får den gratis. At stemme tager ét tryk og kræver intet af dig.',
    rankedHeading: 'Det læserne har bedt om',
    addYourVoice: 'Læg din stemme til',
    voted: 'Stemme lagt til',
    voteAria: 'Læg din stemme til “{subject}”',
    votedAria: 'Du lagde din stemme til “{subject}”',
    voteCount: '{count} stemmer',
    voteCountOne: '1 stemme',
    readTheBook: 'Læs bogen',
    rankLabel: 'Placering',
    submitTitle: 'Ønsk en bog',
    submitBody:
      'Sæt ord på fælden med dine egne. Er den ikke allerede på listen, tilføjer vi den, så andre også kan lægge deres stemme til.',
    submitSubjectLabel: 'Hvad kæmper du med?',
    submitSubjectHelp: 'En kort linje i første person virker bedst, ligesom dem ovenfor.',
    submitSubjectPlaceholder: 'Jeg kan ikke lade være med at...',
    submitExperienceLabel: 'Hvordan det er, med dine egne ord',
    submitExperienceOptional: 'Valgfrit',
    submitExperiencePlaceholder:
      'Alt du har lyst til at sige om, hvordan det føles, eller hvad du har prøvet.',
    submitCta: 'Send dit ønske',
    submitSuccessTitle: 'Din stemme tæller med.',
    submitSuccessBody:
      'Når nok stemmer samler sig om et emne, bliver bogen skrevet og lagt op gratis til alle. Intet her er knyttet til dig.',
    submitAnother: 'Ønsk en bog mere',
  },

  // -- Experiences board -------------------------------------------------
  experiences: {
    title: 'Det læserne gik ud af',
    intro: 'Anonymt, ærligt og delt med tilladelse.',
    lede:
      'Dette er noter fra folk, der har læst en af bøgerne og gerne ville fortælle, hvad der ændrede sig. Hver eneste er anonym og delt med tilladelse. Ingen navne, ingen tal, ingen datoer finere end en måned.',
    filterLabel: 'Vis oplevelser for',
    filterAll: 'Alle bøger',
    listHeading: 'Læseroplevelser',
    countAll: '{count} oplevelser',
    countAllOne: '1 oplevelse',
    countForBook: '{count} oplevelser af {book}',
    countForBookOne: '1 oplevelse af {book}',
    emptyFiltered:
      'Ingen oplevelser af {book} endnu. Din kunne blive den første.',
    empty: 'Ingen oplevelser endnu. Din kunne blive den første.',
    clearFilter: 'Vis alle bøger',
    monthLabel: '{month}',
    aboutBook: 'Om {book}',
    submitTitle: 'Del hvad der skete',
    submitBody:
      'Hvis en af bøgerne ændrede noget for dig, kan du fortælle det her. Det udgives anonymt, uden navn og uden nogen måde at spore det tilbage til dig.',
    submitBookLabel: 'Hvilken bog',
    submitBookPlaceholder: 'Vælg en bog',
    submitTextLabel: 'Hvad skete der for dig?',
    submitTextPlaceholder:
      'Hvad der flyttede sig, hvad der overraskede dig, hvordan det er nu.',
    submitConsentLabel:
      'Udgiv dette anonymt som en læseroplevelse. Uden navn, uden konto, uden nogen måde at spore det til dig.',
    submitCta: 'Del anonymt',
    submitSuccessTitle: 'Tak fordi du delte.',
    submitSuccessBody:
      'Hver oplevelse går gennem et stille gennemsyn, før den lægges op, så andre, der læser i et lavt øjeblik, møder noget ærligt. Intet her er knyttet til dig.',
    submitAnother: 'Del en mere',
    consentRequired: 'Bekræft venligst, at du ønsker dette udgivet anonymt.',
    bookRequired: 'Vælg venligst, hvilken bog dette handler om.',
    imageAlt: 'Mennesker der går sammen i friskt lys efter regn',
  },

  // -- Blog --------------------------------------------------------------
  blog: {
    title: 'Noter',
    intro: 'Nyt fra biblioteket, og hvordan bøgerne bliver bedre.',
    readMore: 'Læs noten',
    readAria: 'Læs: {title}',
    backToNotes: 'Alle noter',
    postedLabel: 'Skrevet {month}',
    imageAlt: 'En drage højt oppe på en klar himmel på en lys, åben dag',
  },

  // -- How it works (method page) ---------------------------------------
  howItWorks: {
    title: 'Sådan virker en ændret tro',
    lede:
      'Ingen viljestyrke, ingen skam, ingen optælling af dage. Hver bog her hviler på én enkel tanke, og den er værd at forstå, før du læser et ord.',
    principleHeading: 'Du vælger altid din lykkeligste mulighed',
    principleBody:
      'I ethvert øjeblik gør du det, du tror vil stille dig bedst. Ikke det sundeste, ikke det du ville forsvare højlydt, men det der føles som den mindst dårlige mulighed lige nu. Det er ikke en fejl. Sådan fungerer alle mennesker. Og det betyder, at adfærden aldrig rigtig er problemet. Det er troen under den.',
    trapHeading: 'En fælde er en tro, der lyver om regnestykket',
    trapBody:
      'En fælde får fat, når en tro i stilhed tæller forkert på, hvad noget giver dig, og hvad det koster. Drinken lover ro og leverer en værre morgen. Skærmen lover noget godt lige om lidt og leverer den samme rastløshed igen. Så længe troen holder, er det virkelig din lykkeligste mulighed at række ud efter den, så du rækker ud. Problemet var aldrig din styrke. Det var det regnestykke, du fik stukket i hånden.',
    knownHeading: 'Det skal mærkes i hjertet, ikke kun forstås i hovedet',
    knownBody:
      'Næsten alle ved allerede, i det abstrakte, at vanen koster mere, end den giver. At vide det som en kendsgerning ændrer intet, for trangen lytter ikke til kendsgerninger. Det hver bog gør, er at skille troen ad langsomt nok til, at du mærker sandheden i den, ikke bare er enig i den. Når det at se går dybt nok, har lysten ikke længere noget at stå på.',
    noWillpowerHeading: 'Dette er ikke en kamp, og du er ikke svag',
    noWillpowerBody:
      'Viljestyrke er det, du har brug for, når en del af dig stadig tror, fælden er det værd. Den er udmattende, fordi den er en krig mellem to halvdele af samme menneske. Skift troen, og krigen slutter, for der er ikke længere noget at stå imod. Har du prøvet før, og holdt det ikke, var det aldrig en dom over din karakter. Troen havde bare ikke flyttet sig endnu.',
    escapeHeading: 'At gå bliver en flugt, ikke et offer',
    escapeBody:
      'Når troen endelig flytter sig, holder det at gå op med at føles som at give afkald på noget. Du bider ikke tænderne sammen forbi en nydelse, du stadig vil have. Du træder ud af noget, du nu kan se kun nogensinde tog fra dig. Derfor er følelsen på den anden side lettelse, og ofte en lille undren over, hvor stille der er.',
    closingHeading: 'Find bogen til din fælde',
    closingBody:
      'Hver bog er én fælde, skilt ad på denne måde. Er din ikke her endnu, så læg din stemme til og hjælp med at bringe den til live.',
    ctaLibrary: 'Se biblioteket',
    ctaRequests: 'Ønsk en bog',
    heroImageAlt:
      'En rolig flod, der åbner sig forude gennem friskt grønt lys, vejen ud er tydelig',
  },

  // -- About -------------------------------------------------------------
  about: {
    title: 'Om Belief Changer',
    missionHeading: 'Hvad dette er til for',
    missionBody1:
      'Der findes en måde at ende en vane på, som virker ved at ændre troen under den, ikke ved at bekæmpe adfærden ovenpå. Den har i stilhed befriet rigtig mange mennesker fra nogle få bestemte fælder. Dette bibliotek findes for at tage den samme tilgang og tilbyde den for enhver fælde, til hvem som helst, på deres eget sprog, uden udgift.',
    missionBody2:
      'Et menneske, der leder efter vejen ud, bør aldrig skulle forbi en betalingsmur, en konto eller en sporing for at nå den. Så det er der ikke noget af her. Bøgerne bygges og passes af et hold agenter, der arbejder efter én fælles målestok for kvalitet, og hele projektet er skabt til at give sig selv væk.',
    lawsHeading: 'Hvad der altid vil gælde her',
    lawFreeTitle: 'Gratis for altid',
    lawFreeBody: 'Hver bog, gratis at læse, hente og beholde. Intet niveau holdes tilbage.',
    lawNoSignupTitle: 'Ingen tilmelding',
    lawNoSignupBody: 'Ingen konto, ingen e-mail, ingen mur mellem dig og første side.',
    lawNoTrackingTitle: 'Ingen sporing',
    lawNoTrackingBody: 'Ingen cookies, ingen profiler, intet på din enhed som vi læser for at følge dig.',
    lawEveryLanguageTitle: 'Alle sprog',
    lawEveryLanguageBody: 'Oversat så bredt, vi kan nå, for vejen ud bør ikke afhænge af dit sprog.',
    lawLivingTitle: 'Levende bøger',
    lawLivingBody: 'Læserne forbedrer hver bog, versionerne er offentlige, og den nyeste er altid den, du får.',
    honestyHeading: 'Hvordan vi tæller, ærligt',
    honestyBody:
      'Vi tæller sidevisninger og søgninger samlet, så vi kan se, hvilke fælder folk har brug for bøger til. Vi identificerer dig aldrig. Ingen cookies, ingen konti, ingen sporing. Det eneste, der gemmes på din enhed, er det, der får siden til at virke for dig: dit tema, dit sprog, hvor du er i en bog, og hvilke emner du har stemt på.',
    openSourceHeading: 'Åben kildekode',
    openSourceBody:
      'Det websted, der leverer disse bøger, er åben kildekode. Alle kan læse, hvordan det virker, tjekke at det gør, hvad det siger om privatliv, og bygge videre på det. Intet om, hvordan du bliver behandlet her, er skjult.',
    openSourceLink: 'Læs kildekoden',
    imageAlt: 'Et åbent vindue i et stille rum, morgenlys der falder ind',
  },

  // -- 404 ---------------------------------------------------------------
  notFound: {
    para: 'Nå, det her er lidt pinligt. Fordi vi nægter at spore vores besøgende eller bruge cookies, aner vi simpelthen ikke, hvordan du er endt her. Men vi kan bekræfte, at denne side ikke findes.',
    homeCta: 'Tag mig hjem',
    imageAlt: 'En solbeskinnet sti gennem en park, der åbner sig forude på en lys, åben dag',
  },

  // -- Privacy -----------------------------------------------------------
  privacy: {
    title: 'Privatliv, forenklet.',
    lede: 'Ingen sporing, ingen cookies, ingen konti, ingen krumspring. Her er præcis, hvad der sker med dine data, i almindeligt menneskesprog. Den korte version: vi har designet dette websted, så der næsten ingen er.',

    linkedTitle: 'Data knyttet til dig',
    linkedBody: 'Ingen. Der er ingen konti, ingen tilmeldinger, ingen nyhedsbreve og ingen kontaktformularer, der beder om dit navn. Du kan læse hver bog, hente hvert format og bruge hele webstedet uden at fortælle os, hvem du er.',

    typeTitle: 'Det du skriver',
    typeBody: 'Finderfeltet virker i din browser. Når du sender os feedback, ønsker en bog eller deler en oplevelse, er de ord, du skriver, alt hvad vi modtager: intet navn, ingen e-mail, ingen adresse, intet vedhæftet. Undlad venligst at skrive personlige oplysninger i selve teksten; hvis vi opdager nogen under gennemsyn, fjerner vi dem, før noget bliver udgivet.',

    countTitle: 'Det vi tæller',
    countBody: 'Vi tæller hændelser, ikke mennesker: hvor mange gange en side blev åbnet, en bog blev hentet, en søgning intet fandt. Disse tal indeholder ingen identitet, og vi undlader bevidst at tælle unikke besøgende, for at gøre det ærligt er umuligt uden at spore dig. Det er også derfor, dette websted ikke har noget cookiebanner: der er intet at give samtykke til.',

    deviceTitle: 'Det der bliver på din enhed',
    deviceBody: 'Dit tema, din læseposition og en note om, at du allerede har stemt. Disse lever i din browser, så webstedet husker dine præferencer; de bliver aldrig sendt til os.',

    thirdPartiesTitle: 'Nul tredjeparter',
    thirdPartiesBody: 'Ingen annoncører, ingen sporingspixels, ingen analysevirksomheder, intet salg af data. Skrifttyperne leveres fra vores eget websted, ikke fra en tredjepart.',

    controlTitle: 'Dine ord, din kontrol',
    controlBody: 'Fordi bidrag er anonyme fra bunden, kan vi ikke slå dine data op, og det kan ingen andre heller: der er intet, der forbinder dem med dig. Fortryder du noget, du har indsendt, så skriv til os og beskriv det, så fjerner vi det.',

    formalitiesTitle: 'Formaliteterne',
    formalitiesControllerLabel: 'Dataansvarlig:',
    formalitiesControllerValue: 'Belief Changer (virksomhedsoplysninger bekræftes inden lancering).',
    formalitiesComplaintBefore: 'Er du nogensinde utilfreds med, hvordan vi håndterer data, kan du klage til Datatilsynet på',
    formalitiesComplaintAfter: '.',
    formalitiesLinkLabel: 'www.datatilsynet.dk',
  },

  // -- Language switcher -------------------------------------------------
  langSwitcher: {
    label: 'Skift sprog',
    heading: 'Sprog',
  },
}
