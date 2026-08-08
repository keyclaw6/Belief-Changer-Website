import type { DeepPartial, Messages } from '../types'

/**
 * Danish catalog, COMPLETE. Every key in messages/en.ts is translated into
 * natural, warm, idiomatic Danish, in the register: varm mod personen, hard mod
 * faelden; sentence case; ingen udrabstegn; NUL tankestreger (kun bindestreger);
 * ingen anglicismer hvor et naturligt dansk ord findes. Reads like a thoughtful
 * Danish publisher, not machine translation.
 *
 * Book TITLES are not translated here (they come from the fixtures, English for
 * v1). The marquee reader lines stay English mock for now (flagged in
 * src/data/marquee.ts) until real Danish anonymous lines exist.
 */
export const da: DeepPartial<Messages> = {
  wordmark: 'Belief Changer',

  nav: {
    books: 'Bøger',
    howItWorks: 'Sådan virker det',
    experiences: 'Oplevelser',
    notes: 'Noter',
    about: 'Om',
    language: 'Sprog',
    menu: 'Menu',
    lightsOff: 'Sluk lyset',
    lightsOn: 'Tænd lyset',
    skipToContent: 'Spring til indhold',
  },

  footer: {
    tagline: 'Gratis bøger, der ændrer troen bag adfærden.',
    libraryHeading: 'Bibliotek',
    communityHeading: 'Fællesskab',
    smallPrintHeading: 'Det med småt',
    books: 'Bøger',
    requestABook: 'Ønsk en bog',
    experiences: 'Oplevelser',
    notes: 'Noter',
    contribute: 'Bidrag',
    about: 'Om',
    privacy: 'Privatliv',
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
      'Gratis bøger, der ændrer troen bag adfærden. På dit sprog, gratis for altid, ingen tilmelding, ingen hage ved det.',
    askPlaceholder: 'Fortæl os, hvad du gennemgår...',
    primaryCta: 'Find din bog',
    askFieldLabel: 'Fortæl os, hvad du gennemgår',
    exampleScrolling: 'scrolling',
    exampleSugar: 'sukker',
    exampleSmoking: 'rygning',
    exampleOverthinking: 'grublerier',
    exampleAlcohol: 'alkohol',
    exampleMore: 'mere',
    examplesLabel: 'Prøv en af disse',

    beat1Title: 'Du har prøvet at rette adfærden.',
    beat1Body:
      'At stoppe. At skære ned. At slette appen, hælde det ud, love dig selv. Det er at arbejde på adfærden. Men adfærd følger grunde, og grundene lever i det, du tror, tingen gør for dig. Lad troen stå, og adfærden vokser frem igen.',
    beat1ImageAlt:
      'En person standset på en aftengade, telefonen et blødt skær i hånden, varme vinduer ovenover',

    beat2Title: 'Skam hjælper aldrig.',
    beat2Body:
      'Ikke fra andre, ikke fra dig selv. Skam skubber det hele ind i mørket, og i mørket vokser det. Forståelse virker i det åbne. Disse bøger går ud fra, at du er intelligent og bare aldrig fik vist, hvordan tro driver adfærd.',
    beat2ImageAlt:
      'To personer på en parkbænk i morgenlys, den ene lytter ordentligt',

    beat3Title: 'Du vælger altid det, der virker lykkeligst.',
    beat3Body:
      'Det gør alle, hver gang. Den adfærd, du vil af med, vinder det valg på grund af det, du tror, den giver dig, og troen kan tage fejl af regnestykket: den giver en lindring, den aldrig gav, og skjuler, hvad den koster. Så længe troen står, bliver den ved med at vinde.',
    beat3ImageAlt:
      'En person, der ser ud over et lyst morgenlandskab, vejen frem er klar',

    beat4Title: 'Forståelse gør det, viljestyrke ikke kan.',
    beat4Body:
      'Når du ser, hvor trækket kommer fra, og hvad det faktisk giver, retter troen sig selv, og adfærden følger af sig selv. Ingen kamp, ingen dage at tælle. Det er hele metoden: hvordan det virker, beskrevet godt nok til at kunne mærkes.',
    beat4ImageAlt:
      'Et fuglebur i varmt lys, døren åben og buret tomt, fuglen sidder allerede på en solbeskinnet vindueskarm i nærheden',

    beat5Title: 'Bagefter føles det som lettelse.',
    beat5Body: 'Ikke som et offer. Når troen er væk, er der ikke noget at give afkald på.',
    beat5ImageAlt: 'En roer, der glider langs en åben flodbred i frisk luft',
    beat5Cta: 'Sådan virker det',

    libraryTitle: 'Bøgerne.',
    libraryBody:
      'Hver enkelt skiller én adfærd ad: hvor trækket kommer fra, hvad den faktisk giver dig, hvad den koster. Gratis at læse, downloade eller lytte til.',
    libraryLink: 'Alle bøger',

    marqueeMission:
      'Alt her er gratis, på alle de sprog vi kan nå, uden konti og uden sporing. Målet er kun at hjælpe så mange mennesker som muligt.',
    marqueeLabel: 'Hvad læsere har sagt',

    livingBooksTitle: 'Levende bøger.',
    livingBooksBody:
      'Læsere forbedrer hver bog. Versionerne er offentlige, og den nyeste version er altid den, du får.',
    nextBookTitle: 'Den næste bog vælges af dig.',
    nextBookCta: 'Føj din stemme til',
    livingExperiencesTitle: 'Oplevelser.',
    livingExperiencesLink: 'Læs mere',
  },

  status: {
    gatheringVoices: 'Samler stemmer',
    beingWritten: 'Under skrivning',
    inTranslation: 'Under oversættelse',
    published: 'Udgivet',
    inProduction: 'Under produktion',
  },

  library: {
    title: 'Biblioteket',
    intro:
      'Hver bog skiller én fælde ad, indtil den ikke har mere at tilbyde dig. Gratis at læse, downloade og lytte til. Forbedret af læserne før dig.',
    searchLabel: 'Find din bog',
    searchPlaceholder: 'Fortæl os, hvad du gennemgår...',
    chipsLabel: 'Eller start fra en af disse',
    chipScrolling: 'Jeg kan ikke lade være med at scrolle',
    chipSugar: 'Sukker har fat i mig',
    chipSmoking: 'Jeg vil gerne stoppe med at ryge',
    chipAlcohol: 'Jeg drikker mere, end jeg vil',
    chipGaming: 'Gaming æder mine aftener',
    chipOverthinking: 'Jeg overtænker alt',
    noMatchTitle: 'Den bog har vi ikke skrevet endnu.',
    noMatchBody:
      'Det er præcis sådan, biblioteket vokser. Fortæl os, hvad du kæmper med, og når nok stemmer beder om den, bliver bogen skrevet.',
    noMatchCta: 'Ønsk denne bog',
    resultsCount: '{count} bøger',
    resultsCountOne: '1 bog',
    clearSearch: 'Ryd',
    resultsFor: '{count} bøger for “{query}”',
    resultsForOne: '1 bog for “{query}”',
    footStrip: 'Biblioteket vælges af sine læsere. Se, hvad der stemmes om som det næste.',
    footStripLink: 'Ønsketavlen',
    beingWritten: 'Under skrivning',
  },

  book: {
    readOnline: 'Læs online',
    continueReading: 'Fortsæt læsningen',
    downloadEpub: 'Download EPUB',
    listen: 'Lyt',
    onlyNewestDownload: 'Kun den nyeste version kan downloades.',
    versionLabel: 'Version {version} · {month}',
    versionLanguages: 'Version {version} · {count} sprog',
    versionLanguagesOne: 'Version {version} · 1 sprog',
    languagesCount: '{count} sprog',
    languagesCountOne: '1 sprog',
    improvedFromContributions: 'Forbedret af læsernes bidrag',
    notYetInLanguage: 'Endnu ikke på dit sprog',
    changelogTab: 'Ændringslog',
    aboutTab: 'Om denne bog',
    aboutBody:
      'Som alle bøger her er også denne levende. Læsere fortæller os, hvor den mistede dem, og den næste version siger det bedre. Nedenfor kan du se præcis, hvad der blev ændret og hvornår, og kun den nyeste version tilbydes til download.',
    improveTitle: 'Hjælp den næste version',
    improveBody:
      'Giv os gerne feedback. Har du en personlig oplevelse, du vil dele? Noget, der ikke føltes beskrevet godt nok til, at troen kunne ændre sig? Skriv det her, præcis som det kommer. Det lander hos redaktørerne, og det bedste af det former den næste version af denne bog.',
    improvePlaceholder: 'Skriv det her, præcis som det kommer...',
    improveFieldLabel: 'Din feedback',
    improveSubmit: 'Send det',
    improveSuccessBody:
      'Tak. Hver version af denne bog findes, fordi nogen skrev i dette felt.',
    experiencesHeading: 'Oplevelser med denne bog',
    experiencesReadMore: 'Læs flere oplevelser',
    experiencesShareYours: 'Del din',
    experiencesEmpty: 'Ingen oplevelser med denne bog endnu. Din kunne være den første.',
    crosslinkLead: 'Ny her? Forstå, hvorfor det virker, før du begynder.',
    howItWorksCrosslink: 'Sådan virker det',
    notPublishedYet: 'Denne bog er på vej.',
    versionHeading: 'En levende bog',
  },

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
    beingWrittenTitle: 'Dette kapitel skrives stadig.',
    beingWrittenBody:
      'Denne bog er en levende bog. Kapitlerne kommer op, efterhånden som de bliver færdige, og hver læser får den nyeste version.',
    beingWrittenCta: 'Se, hvad der blev ændret',
    lastAvailable:
      'Så langt når bogen i dag. Den bliver skrevet i det åbne, og nye kapitler dukker op her i det øjeblik, de er klar.',
    finishedTitle: 'Du læste bogen færdig.',
    finishedBody:
      'Hvis noget i dig har flyttet sig, ved du det allerede. Vil du hjælpe den næste læser, er to minutter i feedbackfeltet på bogens side mere værd, end du tror.',
    finishedBackToBook: 'Tilbage til bogen',
    finishedShare: 'Del en oplevelse',
  },

  requests: {
    title: 'Hvilken fælde skal vi skille ad som den næste?',
    intro:
      'Biblioteket vokser der, hvor der er brug for det. Bed om den bog, du ønskede fandtes, føj din stemme til en, der allerede er bedt om, og når nok stemmer samler sig, bliver bogen skrevet. Når den udgives, dukker den op lige her.',
    rankedHeading: 'Hvad læsere har bedt om',
    addYourVoice: 'Føj din stemme til',
    voted: 'Din stemme tæller med',
    voteAria: 'Føj din stemme til “{subject}”',
    votedAria: 'Du føjede din stemme til “{subject}”',
    voiceCount: '{count} stemmer',
    voiceCountOne: '1 stemme',
    readIt: 'Læs den',
    rankLabel: 'Placering',
    submitTitle: 'Bed om en bog, vi ikke har skrevet',
    submitBody:
      'Beskriv fælden med dine egne ord. Vil du, så sig lidt om, hvordan den er indefra, det hjælper bogen med at blive skrevet mere sandt.',
    submitFieldLabel: 'Beskriv fælden',
    submitPlaceholder: 'Jeg kan ikke lade være med...',
    submitCta: 'Bed om den',
    submitSuccessBody:
      'Bedt om. I det øjeblik nok stemmer slutter sig til din, går bogen i skrivning, og denne tavle vil vise den.',
    submitAnother: 'Bed om en til',
  },

  experiences: {
    title: 'Det, læsere gik ud af',
    intro:
      'Hver historie her er anonym og virkelig. Ingen bliver betalt, ingen bliver nævnt, og intet er overdrevet, det ville være den gamle verdens måde at sælge på. Det er bare, hvad folk siger, efter en fælde har sluppet dem.',
    homeStripBody: 'Anonymt, virkeligt og stille delt. Sådan lyder den anden side.',
    filterLabel: 'Vis oplevelser for',
    filterAll: 'Alle bøger',
    listHeading: 'Læseroplevelser',
    countAll: '{count} oplevelser',
    countAllOne: '1 oplevelse',
    countForBook: '{count} oplevelser med {book}',
    countForBookOne: '1 oplevelse med {book}',
    emptyFiltered: 'Ingen oplevelser med denne bog endnu. Din kunne være den første.',
    empty: 'Ingen oplevelser endnu. Din kunne være den første.',
    clearFilter: 'Vis alle bøger',
    monthLabel: '{month}',
    aboutBook: 'Om {book}',
    submitTitle: 'Del, hvad der ændrede sig',
    submitBody:
      'Hvis en af bøgerne hjalp dig ud af noget, er det at fortælle det her det mest gavmilde, du kan gøre for den næste, der stadig sidder fast. Nogle få ærlige linjer er nok. Intet navn, ingen konto, helt anonymt.',
    submitBookLabel: 'Hvilken bog?',
    submitBookPlaceholder: 'Vælg en bog',
    submitTextLabel: 'Hvad ændrede sig',
    submitTextPlaceholder: 'Nogle få ærlige linjer om, hvad der flyttede sig.',
    submitCta: 'Del det',
    submitSuccessBody:
      'Tak. En, der er midt i sin værste aften, læser dette en dag og bliver ved.',
    submitAnother: 'Del en til',
    bookRequired: 'Vælg venligst, hvilken bog det handler om.',
    imageAlt: 'Mennesker, der går sammen i frisk lys efter regn',
  },

  blog: {
    title: 'Noter fra biblioteket',
    intro:
      'Hvad vi bygger, hvad der blev ændret, og hvad vi lærer af læserne. Skrevet ligefremt, dateret ærligt.',
    readMore: 'Læs noten',
    readAria: 'Læs: {title}',
    backToNotes: 'Alle noter',
    postedLabel: 'Skrevet {month}',
    contributeLead: 'Vil du hjælpe med at bygge dette? Vi leder efter nogle få dedikerede mennesker.',
    contributeLink: 'Bidrag',
    imageAlt: 'En åben umærket bog ved et åbent vindue, mens en blank side løfter sig i den friske morgenluft',
  },

  contribute: {
    title: 'Hjælp med at bygge vejen ud',
    body1:
      'Målet med dette projekt er pinligt enkelt: at hjælpe så mange mennesker som muligt ud af de fælder, der stille æder deres liv. Biblioteket er gratis, bøgerne forbedres af deres læsere, og næsten alt drives af AI-agenter, så det kan skalere til hver fælde og hvert sprog.',
    body2:
      'Men et projekt som dette hviler stadig på nogle få dedikerede mennesker. Ikke mange. Nogle få, der læste noget her og mærkede det, og som vil bruge rigtige timer på at gøre vejen ud bedre.',
    rolesHeading: 'Sådan ser det ud lige nu:',
    role1:
      'Vedligeholdere og udviklere, til at bygge og styrke siden og den pipeline, der skriver, oversætter og udgiver bøgerne.',
    role2:
      'Modersmålslæsere, til at gennemgå oversættelser, så en bog på dansk eller arabisk læses, som var den skrevet der, ikke sendt dertil.',
    role3:
      'Stille moderatorer, til at læse det, folk sender ind, med omhu og give det sandeste videre til redaktørerne.',
    body3:
      'Der er ingen løn endnu, og det vil vi ikke lade som om. Der er meningsfuldt arbejde, gjort i det åbne, som lever længere end ethvert feed, du nogensinde har scrollet.',
    body4:
      'Hvis det er dig, så skriv til os eller åbn kodelageret og præsentér dig selv. Dedikation betyder mere end kvalifikationer her.',
    repoCta: 'Åbn kodelageret',
    mailtoLink: 'Skriv til os',
    imageAlt: 'Udsigt fra en bytunnel til en åben grøn park med flod, himmel og flere klare stier',
  },

  howItWorks: {
    title: 'Sådan virker forandring af tro',
    lede:
      'Alt på denne side hviler på én idé. Den er enkel, den kan efterprøves mod din egen erfaring, og når du først ser den, forklarer bøgerne sig selv.',

    ch1Heading: 'Det lykkeligste valg',
    ch1Body1:
      'I ethvert øjeblik vælger du det, du tror, er dit lykkeligste tilgængelige valg. Det gør alle. Det er ikke en fejl; det er sådan, valg fungerer. At række ud efter cigaretten, feedet, drinken, skærmen er ikke svaghed. Det er et valg, der ifølge din nuværende tro er det bedste, der er lige nu.',
    ch1Body2:
      'Den sætning bærer hele metoden: valg følger tro. Ikke viljestyrke, ikke karakter. Tro om, hvad hver mulighed giver dig, og hvad den koster dig.',
    ch1Body3: 'Så en stædig adfærd er ikke et adfærdsproblem. Det er et trosproblem.',
    ch1ImageAlt: 'En person på en gangbro ser ud over flere åbne stier gennem en lys bypark',

    ch2Heading: 'At rette adfærden i stedet for grundene',
    ch2Body1:
      'Næsten alt, folk prøver, arbejder på adfærden. Stop, skær ned, blokér, undgå, aflæd, erstat. Nogle gange holder det et stykke tid. Det holder sjældent for altid, og grunden er strukturel: adfærden var aldrig roden. Den er den synlige ende af en tro.',
    ch2Body2:
      'Troen blev som regel dannet, uden at du bemærkede det. Noget bragte engang lindring, og en slutning skrev sig selv i stilhed: dette hjælper mig med at slappe af, dette får mig gennem aftenen, dette er en af mine få fornøjelser. Fra da af løber regnskabet skævt på en bestemt måde: det ubehag, tingen skaber, bliver lindret af den næste dosis, og lindringen bliver tilskrevet tingen selv. En rygers cigaret lindrer mest den forrige cigaret. Feedet dæmper en rastløshed, feedet selv installerede.',
    ch2Body3:
      'Forkerte tal ind, forkert valg ud. Så længe troen regner forkert, bliver adfærden ved med at blive valgt, uanset hvor oprigtigt du kæmper imod.',

    ch3Heading: 'Hvorfor viljestyrke taber',
    ch3Body1:
      'Viljestyrke accepterer de forkerte tal og kæmper mod den lyst, de skaber. Derfor føles det som afsavn: en del af dig tror stadig, at noget godt gives op, så hver afholdende dag koster kræfter. Kræfter slipper op. En hård dag kommer, og den mulighed, din tro stadig rangerer højest, vinder igen.',
    ch3Body2:
      'Bagefter bebrejder folk sig selv. Bøgerne vil vise dig, roligt og konkret, hvorfor den dom aldrig var rigtig: du kæmpede mod dit eget trossystem, og det har mere udholdenhed end nogens viljestyrke. Metoden beder dig ikke om at kæmpe hårdere. Den fjerner det, du kæmpede imod.',
    ch3ImageAlt: 'En enkelt knude af reb på en høvlebænk i morgenlys, halvt løsnet, den ene ende løber fri mod vinduet',

    ch4Heading: 'Skam hjælper aldrig',
    ch4Body1: 'Skam føles, som om den burde motivere forandring. Pålideligt gør den det modsatte.',
    ch4Body2:
      'Skam driver adfærden ud af syne, og ude af syne vokser den: uundersøgt, uomtalt, forstærket. Skam gør også ondt, og en person med smerte rækker ud efter det, der lover lindring, hvilket er adfærden selv. Sløjfen strammer til.',
    ch4Body3:
      'Derfor indeholder bøgerne ingen skræmmetaktik, ingen skuffet tone, ingen dagstællere, der venter på at nulstille. Ikke som en venlig strategi: fordi skam er kontraproduktiv, og metoden handler om det, der virker.',

    ch5Heading: 'Hvad der faktisk ændrer en tro',
    ch5Body1: 'Ikke bekræftelser. Ikke motivation. Ikke at beslutte meget hårdt.',
    ch5Body2:
      'En tro ændrer sig, når du forstår, fuldstændigt og konkret, hvor trækket kommer fra, og hvad tingen faktisk giver, klart nok til at den gamle slutning holder op med at give mening. Frihed kommer fra at forstå, hvor adfærden kommer fra, ikke fra det bevidste forsøg på at afslutte den.',
    ch5Body3:
      'Alle, der er fanget i en adfærd, kender allerede omkostningerne. Hovedviden er ikke den manglende brik. Bøgerne virker ved at gå gennem din egen erfaring, øjeblik for øjeblik, indtil forståelsen sætter sig fra dit hoved ind i dit hjerte, indtil regnskabet retter sig selv, og du kan mærke det.',
    ch5Body4:
      'Det beder om én ting af dig: ydmyghed. Du vil se på idéer, du har båret i årevis, igen. Intet andet kræves, ingen trin, intet program, ingen tricks. Læsning og ærlighed gør hele arbejdet.',

    ch6Heading: 'Intet pres, lige nu',
    ch6Body1:
      'Den mærkeligste anvisning i bøgerne, og den læsere siger fik dem til at slappe af: stop ikke noget endnu. Fortsæt, som du er, mens du læser. Ingen stopdato, ingen forberedelse, intet mod at samle.',
    ch6Body2:
      'Pres hører til viljestyrke-tilgangen, og viljestyrke-tilgangen taber. Hvis bogen gør sit arbejde, vil det at stoppe ikke føles som en afgrundskant. Det vil føles som at lægge noget fra sig, du ikke længere vil holde på.',
    ch6ImageAlt: 'Altandøre står åbne mod klar morgenluft i et stille soveværelse',

    ch7Heading: 'Når den slipper',
    ch7Body1:
      'Et sted i læsningen, ofte stille, giver troen efter. Folk beskriver det på samme måde på tværs af hver adfærd: ikke et sus af styrke, et skuldertræk. Den gjorde aldrig noget for mig.',
    ch7Body2:
      'Derefter er der intet at give op, så intet føles givet op. Trangen mister sin motor. Tilbage er dit liv med én forkert tro færre i det, og den plads, adfærden optog: tid, penge, opmærksomhed, selvrespekt.',
    ch7Body3: 'Det er hele metoden. Hvordan den faktisk virker, beskrevet godt nok til at kunne mærkes.',

    ch8Heading: 'Hvorfor bøger, og hvorfor gratis',
    ch8Body1:
      'En bog er det rette redskab til dette. Den er privat, tålmodig og uden forlegenhed; den kan sige alt, i dit eget tempo, uden at nogen ser på. Og den kan gives væk uden grænse, hvilket betyder noget, for de, der har mest brug for en, er ofte de, der mindst har råd til den.',
    ch8Body2:
      'Så biblioteket er gratis, for altid, på alle de sprog vi kan nå, uden konto og uden sporing. Bøgerne er levende dokumenter: læsere skriver ind, hvor et kapitel ikke ramte, og den næste version siger det bedre. Målet er kun at hjælpe så mange mennesker som muligt.',
    ch8ImageAlt: 'To mennesker deler umærkede bøger ved et åbent bogskab i nabolaget',

    closingHeading: 'Bøgerne står på hylden.',
    ctaLibrary: 'Se bøgerne',
    ctaRequests: 'Bed om en, vi ikke har skrevet',
  },

  about: {
    title: 'Om Belief Changer',
    headerBody:
      'Et gratis bibliotek af bøger, der hjælper folk ud af fælder: rygning, scrolling, sukker, alkohol og enhver anden adfærd, der kører på en løgn. Bygget på én overbevisning:',
    headerConviction:
      'folk har ikke brug for mere viljestyrke, de har brug for sandheden fortalt godt nok til at kunne mærkes.',
    missionHeading: 'Historien',
    missionBody1:
      'Gennemprøvede metoder til at ændre tro har eksisteret i årtier, og hvor en bog findes, virker den. Men bøgerne dækker en håndfuld fælder, og folk er fanget i hundreder. Det hul er grunden til, at dette bibliotek findes: at bringe den samme ærlige, skamfrie vej ud til hver fælde, folk beder os om, på alle sprog, til prisen af ingenting.',
    missionBody2:
      'Biblioteket drives af et lille hold og deres AI-agenter, hvilket er det, der gør "gratis for altid, på alle sprog" muligt frem for en frase. Mennesker sætter retningen og holder kvalitetsniveauet; agenterne gør det endeløse arbejde: skriver, oversætter, indlæser, reviderer. Hver bog er underskrevet af metoden, ikke af en forfatters ego.',
    lawsHeading: 'Det, vi står for',
    lawFreeTitle: 'Gratis for altid.',
    lawFreeBody: 'Ingen betalingsmur mellem et menneske og vejen ud.',
    lawNoSignupTitle: 'Ingen tilmelding, ingen sporing.',
    lawNoSignupBody:
      'Vi tæller hændelser, aldrig mennesker. Ingen cookiebanner, for der er intet at give samtykke til.',
    lawEveryLanguageTitle: 'Alle sprog.',
    lawEveryLanguageBody: 'En fælde tjekker ikke dit pas.',
    lawWarmTitle: 'Varm mod personen, hård mod fælden.',
    lawWarmBody: 'Altid, i hver sætning.',
    lawLivingTitle: 'Levende bøger.',
    lawLivingBody:
      'Versionerne er offentlige, læsere forbedrer dem, og kun den nyeste version tilbydes nogensinde.',
    honestyHeading: 'Hvordan vi tæller, ærligt',
    honestyBody:
      'Vi tæller sidevisninger og søgninger samlet, så vi kan se, hvilke bøger der er brug for, og hvor et kapitel mister folk. Vi identificerer dig aldrig. Der er ingen konti, ingen cookies, ingen tredjeparter.',
    footLead: 'Bygget i det åbne. Koden og bøgerne er offentlige.',
    openSourceLink: 'Åben kildekode',
    contributeLink: 'Bidrag',
    privacyLink: 'Privatliv',
    imageAlt: 'Et åbent vindue i et stille rum, morgenlys der falder ind',
  },

  notFound: {
    para: 'Nå, det er lidt akavet. Fordi vi nægter at spore vores besøgende eller bruge cookies, aner vi absolut ikke, hvordan du endte her. Men vi kan bekræfte, at denne side ikke findes.',
    homeCta: 'Tag mig hjem',
    imageAlt: 'En solbeskinnet parksti, der åbner sig frem en lys, åben dag',
  },

  privacy: {
    title: 'Privatliv, forenklet.',
    lede: 'Ingen sporing, ingen cookies, ingen konti, ingen bøvl. Her er præcis, hvad der sker med dine data, i almindeligt menneskeligt sprog. Den korte version: vi har designet denne side, så der næsten ingen er.',

    linkedTitle: 'Data knyttet til dig',
    linkedBody: 'Ingen. Der er ingen konti, ingen tilmeldinger, ingen nyhedsbreve og ingen kontaktformularer, der beder om dit navn. Du kan læse hver bog, downloade hvert format og bruge hele siden uden at fortælle os, hvem du er.',

    typeTitle: 'Det, du skriver',
    typeBody: 'Søgefeltet virker i din browser. Når du sender os feedback, ønsker en bog eller deler en oplevelse, er de ord, du skriver, alt, hvad vi modtager: intet navn, ingen e-mail, ingen adresse, intet vedhæftet. Skriv venligst ikke personlige oplysninger i selve teksten; hvis vi opdager nogen under gennemgang, fjerner vi dem, før noget udgives.',

    countTitle: 'Det, vi tæller',
    countBody: 'Vi tæller hændelser, ikke mennesker: hvor mange gange en side blev åbnet, en bog blev downloadet, en søgning ikke fandt noget. Disse tal indeholder ingen identitet, og vi tæller bevidst ikke unikke besøgende, fordi det er umuligt at gøre ærligt uden at spore dig. Det er også derfor, denne side ikke har noget cookiebanner: der er intet at give samtykke til.',

    deviceTitle: 'Det, der bliver på din enhed',
    deviceBody: 'Dit tema, dit sprog, din placering i hver bog, dine indstillinger for læsekomfort og en note om, at du allerede har stemt. Disse lever i din browser, så siden husker dine præferencer; de sendes aldrig til os.',

    thirdPartiesTitle: 'Nul tredjeparter',
    thirdPartiesBody: 'Ingen annoncører, ingen sporingspixels, ingen analysefirmaer, intet salg af data. Skrifttyperne serveres fra vores egen side, ikke fra en tredjepart.',

    controlTitle: 'Dine ord, din kontrol',
    controlBody: 'Fordi bidrag er anonyme af design, kan vi ikke slå dine data op, og det kan ingen andre heller: der er intet, der forbinder det med dig. Fortryder du noget, du sendte ind, så skriv til os og beskriv det, og vi fjerner det.',

    formalitiesTitle: 'Formaliteterne',
    formalitiesControllerLabel: 'Dataansvarlig:',
    formalitiesControllerValue: 'Belief Changer (enhedsoplysninger bekræftes før lancering).',
    formalitiesComplaintBefore: 'Er du nogensinde utilfreds med, hvordan vi håndterer data, kan du klage til Datatilsynet på',
    formalitiesComplaintAfter: '.',
    formalitiesLinkLabel: 'www.datatilsynet.dk',
  },

  langSwitcher: {
    label: 'Skift sprog',
    heading: 'Sprog',
  },
}
