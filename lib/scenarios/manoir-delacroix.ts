import { Scenario } from "../engine/types";

// Scénario de démonstration — sera remplacé par les scénarios du catalogue.
export const manoirDelacroix: Scenario = {
  id: "manoir-delacroix",
  title: "Meurtre au Manoir Delacroix",
  version: "0.1.0",
  universe: "Années 1930, grande bourgeoisie de province",
  pitch:
    "Auguste Delacroix, patriarche redouté, est retrouvé mort dans son bureau au soir de ses 70 ans. Le médecin parle d'une crise cardiaque. Le notaire, lui, sait que le testament devait changer le lendemain matin…",
  minPlayers: 6,
  maxPlayers: 8,

  acts: [
    {
      id: "acte1",
      title: "Acte I — La veillée",
      intro:
        "Le corps d'Auguste repose encore à l'étage. La famille et les proches sont réunis au salon. L'orage empêche quiconque de quitter le manoir avant l'aube.",
      gmInstructions:
        "Laissez les joueurs se présenter et discuter librement 20-30 min. Déclenchez la lecture du testament quand les conversations s'essoufflent.",
      effects: [],
    },
    {
      id: "acte2",
      title: "Acte II — Les masques tombent",
      intro:
        "Minuit. La gouvernante pousse un cri : la porte du bureau d'Auguste, pourtant fermée à clé, est entrouverte. Quelqu'un y est entré pendant la veillée.",
      gmInstructions:
        "Distribuez progressivement les indices matériels de l'acte. Poussez les personnages à s'accuser mutuellement.",
      effects: [],
    },
    {
      id: "acte3",
      title: "Acte III — La vérité",
      intro:
        "L'aube approche. L'orage se calme, la police arrivera dans une heure. C'est le moment des dernières accusations : chacun devra désigner un coupable.",
      gmInstructions:
        "Faites voter chaque joueur pour un coupable, puis déclenchez la révélation finale et lisez la solution.",
      effects: [],
    },
  ],

  characters: [
    {
      id: "helene",
      name: "Hélène Delacroix",
      publicPitch: "La veuve, seconde épouse d'Auguste, de vingt ans sa cadette. Élégante et impénétrable.",
      privateSheet:
        "Vous n'avez jamais aimé Auguste, mais vous teniez à votre position. Votre liaison avec le notaire Bertrand dure depuis deux ans. Si le testament changeait, vous perdiez tout.",
      required: true,
      priority: 0,
    },
    {
      id: "marc",
      name: "Marc Delacroix",
      publicPitch: "Le fils aîné, héritier présomptueux de l'empire textile familial.",
      privateSheet:
        "Vos dettes de jeu sont abyssales. Votre père l'a découvert la semaine dernière et menaçait de vous déshériter. Vous êtes entré dans son bureau pendant la veillée pour chercher le relevé de vos dettes.",
      required: true,
      priority: 0,
    },
    {
      id: "camille",
      name: "Camille Delacroix",
      publicPitch: "La fille cadette, peintre, en froid avec son père depuis des années.",
      privateSheet:
        "Vous étiez revenue faire la paix. Votre père vous a reçue hier soir et vous a promis « une surprise » dans le nouveau testament. Vous voulez prouver que vous méritez le manoir.",
      required: true,
      priority: 0,
    },
    {
      id: "bertrand",
      name: "Bertrand Lefort",
      publicPitch: "Le notaire de la famille depuis trente ans. Connaît tous les secrets des Delacroix.",
      privateSheet:
        "Vous aimez Hélène sincèrement. Le nouveau testament, que vous deviez faire signer demain, la déshéritait presque entièrement. Vous ne l'avez dit à personne… sauf à elle.",
      required: true,
      priority: 0,
    },
    {
      id: "rosa",
      name: "Rosa Almeida",
      publicPitch: "La gouvernante, au service du manoir depuis vingt-cinq ans. Voit tout, dit peu.",
      privateSheet:
        "Auguste vous a toujours traitée avec respect ; sa mort vous bouleverse. Hier soir, vous avez entendu une violente dispute entre lui et le Dr Vasseur. Vous hésitez à en parler.",
      required: true,
      priority: 0,
    },
    {
      id: "adrien",
      name: "Dr Adrien Vasseur",
      publicPitch: "Le médecin de famille, ami de trente ans d'Auguste. A constaté le décès : crise cardiaque.",
      privateSheet:
        "VOUS ÊTES LE MEURTRIER. Il y a dix ans, une erreur médicale de votre part a tué un patient ; vous avez falsifié le registre. Auguste l'a découvert et menaçait de vous dénoncer. Vous avez versé de la digitaline dans son cognac. Votre objectif : faire accuser quelqu'un d'autre.",
      required: true,
      priority: 0,
    },
    {
      id: "juliette",
      name: "Juliette Moreau",
      publicPitch: "Journaliste au Courrier de la Loire, invitée — officiellement — pour un portrait d'Auguste.",
      privateSheet:
        "En réalité, vous enquêtez sur la mort suspecte d'un patient du Dr Vasseur il y a dix ans. Auguste vous avait contactée : il avait des preuves à vous remettre.",
      required: false,
      priority: 1,
    },
    {
      id: "gaspard",
      name: "Gaspard Brun",
      publicPitch: "Le jardinier, taiseux, engagé il y a trois ans. Dormait dans la remise.",
      privateSheet:
        "Vous braconnez sur les terres du manoir, d'où vos rondes nocturnes. Cette nuit, vous avez vu quelqu'un sortir du bureau d'Auguste vers 23h, une mallette de cuir à la main.",
      required: false,
      priority: 2,
    },
  ],

  relationships: [
    {
      a: "helene",
      b: "bertrand",
      aKnows: "Votre amant. Il vous a prévenue pour le testament — personne ne doit le savoir.",
      bKnows: "Votre maîtresse. Vous lui avez révélé le contenu du nouveau testament, une faute professionnelle grave.",
    },
    {
      a: "marc",
      b: "camille",
      aKnows: "Votre sœur. Son retour vous inquiète : père semblait vouloir la refavoriser.",
      bKnows: "Votre frère. Vous le soupçonnez d'avoir de gros ennuis d'argent.",
    },
    {
      a: "adrien",
      b: "rosa",
      aKnows: "La gouvernante vous a peut-être entendu vous disputer avec Auguste hier soir. À surveiller.",
      bKnows: "Le médecin. Vous l'avez entendu crier avec Monsieur hier soir, mais il a toujours été bon avec vous.",
    },
    {
      a: "helene",
      b: "marc",
      aKnows: "Votre beau-fils vous méprise et vous le lui rendez bien.",
      bKnows: "Votre belle-mère. Vous êtes convaincu qu'elle n'a épousé père que pour l'argent.",
    },
    {
      a: "juliette",
      b: "adrien",
      aKnows: "L'homme sur qui vous enquêtez. Il ne sait pas qui vous êtes vraiment.",
      bKnows: "Cette journaliste pose trop de questions. Son nom vous dit vaguement quelque chose.",
    },
    {
      a: "gaspard",
      b: "rosa",
      aKnows: "Rosa vous couvre quand vous rentrez tard de vos « promenades ». Une alliée.",
      bKnows: "Le jardinier rôde la nuit. Vous savez qu'il braconne, mais c'est un brave garçon.",
    },
  ],

  infos: [
    {
      id: "i_testament",
      label: "Le testament allait changer",
      content: "Auguste devait signer un nouveau testament demain matin, modifiant profondément la répartition de l'héritage.",
      carriers: ["bertrand", "helene"],
      essential: true,
      isSecret: false,
      isObjective: false,
    },
    {
      id: "i_dettes",
      label: "Les dettes de Marc",
      content: "Marc doit 200 000 francs à un cercle de jeu parisien. Auguste l'avait découvert.",
      carriers: ["marc"],
      essential: false,
      isSecret: true,
      isObjective: false,
    },
    {
      id: "i_liaison",
      label: "La liaison d'Hélène et Bertrand",
      content: "Hélène et le notaire Bertrand sont amants depuis deux ans.",
      carriers: ["helene", "bertrand"],
      essential: false,
      isSecret: true,
      isObjective: false,
    },
    {
      id: "i_dispute",
      label: "La dispute de la veille",
      content: "Hier soir, Auguste et le Dr Vasseur ont eu une violente altercation dans le bureau. Auguste a crié : « Tu as dix ans de mensonges à payer. »",
      carriers: ["rosa"],
      essential: true,
      isSecret: false,
      isObjective: false,
    },
    {
      id: "i_enquete",
      label: "L'enquête de la journaliste",
      content: "Un patient du Dr Vasseur est mort il y a dix ans dans des circonstances troubles ; le dossier médical semble avoir été maquillé.",
      carriers: ["juliette"],
      essential: true,
      fallback: { type: "gm" },
      isSecret: false,
      isObjective: false,
    },
    {
      id: "i_mallette",
      label: "L'homme à la mallette",
      content: "Vers 23h, quelqu'un est sorti du bureau d'Auguste avec une mallette de cuir — la mallette de médecin du Dr Vasseur.",
      carriers: ["gaspard"],
      essential: true,
      fallback: { type: "character", characterId: "rosa" },
      isSecret: false,
      isObjective: false,
    },
    {
      id: "o_helene",
      label: "Objectif : sauver votre position",
      content: "Empêchez quiconque de découvrir votre liaison et assurez-vous que l'ancien testament reste valide.",
      carriers: ["helene"],
      essential: false,
      isSecret: false,
      isObjective: true,
    },
    {
      id: "o_marc",
      label: "Objectif : récupérer le relevé",
      content: "Retrouvez le relevé de vos dettes avant que quelqu'un d'autre ne mette la main dessus.",
      carriers: ["marc"],
      essential: false,
      isSecret: false,
      isObjective: true,
    },
    {
      id: "o_camille",
      label: "Objectif : la vérité pour votre père",
      content: "Découvrez qui a tué votre père. Vous étiez la seule à vouloir vous réconcilier avec lui.",
      carriers: ["camille"],
      essential: false,
      isSecret: false,
      isObjective: true,
    },
    {
      id: "o_adrien",
      label: "Objectif : détourner les soupçons",
      content: "Faites accuser un membre de la famille. Le testament est un mobile en or — servez-vous-en.",
      carriers: ["adrien"],
      essential: false,
      isSecret: false,
      isObjective: true,
    },
    {
      id: "o_rosa",
      label: "Objectif : protéger la maison",
      content: "Découvrez la vérité, mais protégez la mémoire de Monsieur et ceux qui la méritent.",
      carriers: ["rosa"],
      essential: false,
      isSecret: false,
      isObjective: true,
    },
    {
      id: "o_juliette",
      label: "Objectif : boucler l'enquête",
      content: "Trouvez les preuves qu'Auguste voulait vous remettre au sujet du Dr Vasseur.",
      carriers: ["juliette"],
      essential: false,
      isSecret: false,
      isObjective: true,
    },
    {
      id: "o_gaspard",
      label: "Objectif : ne pas être accusé",
      content: "Un braconnier qui rôde la nuit est un coupable idéal. Prouvez votre innocence sans avouer le braconnage.",
      carriers: ["gaspard"],
      essential: false,
      isSecret: false,
      isObjective: true,
    },
  ],

  clues: [
    {
      id: "c_testament",
      kind: "document",
      label: "Le projet de nouveau testament",
      content: "Brouillon signé d'Auguste : le manoir à Camille, l'usine placée sous tutelle, une rente minimale pour Hélène, rien pour Marc « tant qu'il n'aura pas réglé ses affaires ».",
      holder: "bertrand",
      actId: "acte1",
    },
    {
      id: "c_dettes",
      kind: "document",
      label: "Le relevé de dettes",
      content: "Relevé du Cercle Haussmann : M. Marc Delacroix, solde débiteur 214 350 francs. Annoté de la main d'Auguste : « Dernier avertissement. »",
      actId: "acte2",
    },
    {
      id: "c_verre",
      kind: "objet",
      label: "Le verre de cognac",
      content: "Le verre retrouvé sur le bureau d'Auguste. Un dépôt blanchâtre est visible au fond. Une odeur légèrement amère.",
      actId: "acte2",
    },
    {
      id: "c_fiole",
      kind: "objet",
      label: "Une fiole vide",
      content: "Fiole pharmaceutique vide retrouvée dans le massif sous la fenêtre du bureau. Étiquette arrachée, mais un résidu : digitaline.",
      actId: "acte2",
    },
    {
      id: "c_lettre",
      kind: "document",
      label: "Lettre inachevée d'Auguste",
      content: "« Mademoiselle Moreau, ce que je m'apprête à vous confier détruira la réputation d'un homme que j'ai longtemps cru mon ami. Les documents sont dans mon coffre, la combinaison est l'année de… » La lettre s'arrête là.",
      actId: "acte3",
    },
    {
      id: "c_registre",
      kind: "document",
      label: "Page du registre médical",
      content: "Page arrachée d'un registre de 1925 : le dosage prescrit au patient Edmond Ferrand a été visiblement surchargé. La signature est celle du Dr Vasseur.",
      actId: "acte3",
    },
  ],

  events: [
    {
      id: "e_testament",
      label: "La lecture du testament",
      description: "Bertrand est sommé de dire ce qu'il sait du testament.",
      gmInstructions: "Annoncez que la famille exige des réponses du notaire. L'info du testament devient publique.",
      actId: "acte1",
      effects: [
        { type: "revealInfo", infoId: "i_testament", to: "all" },
        { type: "announce", text: "La famille se tourne vers le notaire : « Bertrand, dites-nous la vérité sur le testament. »" },
      ],
    },
    {
      id: "e_bureau",
      label: "La fouille du bureau",
      description: "Le bureau entrouvert est fouillé par les convives.",
      gmInstructions: "Remettez le verre de cognac à celui qui fouille le bureau (ou à Camille par défaut).",
      actId: "acte2",
      effects: [
        { type: "announce", text: "Le bureau d'Auguste est fouillé. Sur le bureau, un verre de cognac à moitié vide…" },
        { type: "giveClue", clueId: "c_verre", to: "camille" },
      ],
    },
    {
      id: "e_orage",
      label: "La fenêtre battante",
      description: "Une bourrasque ouvre la fenêtre du bureau ; on aperçoit quelque chose dans le massif.",
      gmInstructions: "Faites découvrir la fiole par un joueur qui explore dehors, sinon par Gaspard/Rosa.",
      actId: "acte2",
      effects: [
        { type: "announce", text: "La fenêtre du bureau claque. En contrebas, dans le massif de rosiers, quelque chose brille…" },
        { type: "giveClue", clueId: "c_fiole", to: "rosa" },
      ],
    },
    {
      id: "e_coffre",
      label: "L'ouverture du coffre",
      description: "Le coffre d'Auguste est ouvert (combinaison : 1925).",
      gmInstructions: "À déclencher quand les joueurs trouvent la combinaison — l'année de la mort du patient (1925). Sinon, soufflez-la via Rosa.",
      actId: "acte3",
      effects: [
        { type: "announce", text: "Le coffre s'ouvre dans un déclic. À l'intérieur : une lettre inachevée et une page de registre médical." },
        { type: "giveClue", clueId: "c_lettre", to: "camille" },
        { type: "giveClue", clueId: "c_registre", to: "camille" },
      ],
    },
  ],

  timeline: [
    { time: "1925", fact: "Le patient Edmond Ferrand meurt d'une surdose prescrite par le Dr Vasseur, qui falsifie le registre." },
    { time: "Il y a 1 mois", fact: "Auguste retrouve la page du registre et contacte la journaliste Juliette Moreau." },
    { time: "Hier, 21h", fact: "Auguste confronte Vasseur dans son bureau — dispute entendue par Rosa." },
    { time: "Ce soir, 22h30", fact: "Vasseur verse de la digitaline dans le cognac d'Auguste pendant le toast." },
    { time: "Ce soir, 23h", fact: "Vasseur quitte le bureau avec sa mallette, jette la fiole par la fenêtre — vu par Gaspard." },
    { time: "Ce soir, 23h15", fact: "Marc entre dans le bureau chercher le relevé de dettes et trouve le corps. Il ne dit rien." },
  ],

  solution:
    "Le meurtrier est le Dr Adrien Vasseur. Auguste avait découvert la falsification du registre médical de 1925 et s'apprêtait à tout remettre à la journaliste. Vasseur a empoisonné son cognac à la digitaline — un poison qui mime la crise cardiaque, qu'il était lui-même chargé de constater. La fiole dans le massif, la dispute de la veille, la mallette aperçue par Gaspard et la page du registre le confondent.",
};
