/**
 * Source unique des articles de blog MKR Caucasian Camp.
 * Lu par /blog (liste) et /blog/[slug] (article individuel).
 *
 * Pour ajouter un article : ajouter une entrée dans BLOG_POSTS + l'ajouter
 * à `BLOG_SLUGS` dans `app/sitemap.ts` pour qu'il apparaisse dans le sitemap.
 */

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  date: string
  dateISO: string
  dateModifiedISO?: string
  readTime: string
  category: string
  featured?: boolean
  img: string
  imgAlt?: string
  authorName?: string
  metaTitle?: string
  metaDescription?: string
  keywords?: string[]
  about?: string[]
  tldr?: string[]
  faq?: { q: string; a: string }[]
  relatedSlugs?: string[]
  content: string
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'pourquoi-le-dagestan-domine-le-mma',
    title: 'Pourquoi le Daghestan domine le MMA mondial',
    excerpt: "Analyse complète : 3 millions d'habitants, 4 champions UFC, une culture lutte millénaire et un système d'entraînement reproductible. Pourquoi le Caucase russe est devenu l'usine à combattants.",
    date: '15 mars 2026',
    dateISO: '2026-03-15',
    dateModifiedISO: '2026-05-14',
    readTime: '12 min',
    category: 'Culture',
    featured: true,
    img: '/images/blog/dagestan-mma.webp',
    imgAlt: "Lutteur daghestanais s'entraînant en montagne au coucher de soleil, vue panoramique sur le Caucase et la mer Caspienne.",
    authorName: "L'équipe MKR Caucasian Camp",
    metaDescription: "Pourquoi le Daghestan produit plus de champions MMA par habitant que n'importe où ailleurs : culture lutte millénaire, système Eagle MMA, 4 champions UFC pour 3M habitants, analyse complète.",
    keywords: [
      'Daghestan MMA',
      'pourquoi Khabib invincible',
      'champions UFC Daghestan',
      'culture lutte Caucase',
      'Eagle MMA système',
      'Makhachkala combattants',
    ],
    about: ['Daghestan', 'MMA', 'Khabib Nurmagomedov', 'Islam Makhachev', 'Eagle MMA', 'UFC', 'Lutte libre'],
    relatedSlugs: ['khabib-methode-entrainement', 'lutte-daghestanaise-guide-complet', 'preparer-son-premier-camp'],
    tldr: [
      "Le Daghestan compte 3 millions d'habitants pour 4 champions UFC actifs ou récents (Khabib Nurmagomedov, Islam Makhachev, Khamzat Chimaev d'origine tchétchène, Umar Nurmagomedov), soit le plus haut ratio par habitant au monde.",
      "La domination repose sur 3 piliers : tradition lutte libre millénaire, sparring quotidien dès 5 ans, système Eagle MMA qui industrialise la formation depuis 2010.",
      "L'avantage structurel n'est pas génétique mais culturel et organisationnel : tu reproduis 10% du système, tu progresses de 30% en 2 semaines.",
      "Le camp MKR donne accès aux mêmes salles, coachs et méthodes que ceux qui produisent les champions, en 1 à 3 semaines, sans avoir besoin de t'expatrier.",
      "Ce qui n'est PAS reproductible : la pression sociale du village, les 15 ans de mat-time accumulés depuis l'enfance, la sélection naturelle par la compétition permanente.",
    ],
    faq: [
      {
        q: 'Combien de champions UFC viennent vraiment du Daghestan ?',
        a: "À jour 2026 : 4 champions ou anciens champions UFC d'origine daghestanaise active : Khabib Nurmagomedov (champion poids légers retraité 2020, 29-0), Islam Makhachev (champion poids légers en titre depuis 2022), Umar Nurmagomedov (top 5 poids coqs, prétendant au titre), et plusieurs prétendants sérieux. Khamzat Chimaev est d'origine tchétchène mais formé partiellement dans l'écosystème Daghestan-Tchétchénie. Au total, plus de 30 combattants UFC actifs ont des racines ou une formation dans le Caucase russe pour une population de 3 millions d'habitants au Daghestan, contre 330 millions aux États-Unis qui produisent un nombre similaire de champions UFC par génération.",
      },
      {
        q: 'Pourquoi pas la Géorgie ou la Russie centrale ? Qu\'est-ce que le Daghestan a de spécifique ?',
        a: "Trois facteurs convergent au Daghestan et nulle part ailleurs au même degré. Premier facteur : la tradition de lutte libre millénaire. Chaque village avait son lutteur emblématique, les tournois inter-villages forgeaient une élite naturelle. Deuxième facteur : la transition réussie vers le MMA grâce à des passerelles techniques (le contrôle au sol daghestanais s'adapte parfaitement au cage wrestling MMA). Troisième facteur : Eagle MMA, le système industrialisé créé par Abdulmanap Nurmagomedov (père de Khabib) qui a structuré la formation et exporté la méthode dans des dizaines de salles de la région.",
      },
      {
        q: 'Est-ce que la génétique caucasienne joue un rôle ?',
        a: "Marginalement, et pas dans le sens souvent évoqué. Il n'y a pas de gène daghestanais qui rendrait plus fort. En revanche, l'altitude moyenne (1000m), le climat continental rigoureux, et l'activité physique précoce (montagne, troupeaux, travail manuel dès 8 ans dans les villages traditionnels) créent un terrain physiologique favorable. Mais ces facteurs sont reproductibles : tu peux t'entraîner en altitude, suivre une routine physique précoce, et atteindre 80% de l'avantage physiologique des Daghestanais en 2 ans. Le vrai écart est culturel et systémique, pas génétique.",
      },
      {
        q: 'Le système est-il transposable en Europe ou aux États-Unis ?',
        a: "Partiellement, oui. Les éléments transposables : sparring quotidien dès le plus jeune âge, mat-time accumulé sur 10+ ans, qualité des partenaires de sparring, culture du débrief technique après chaque session. Les éléments non transposables : la pression sociale du village qui fait que tu ne peux pas être moyen sans perdre ta réputation, l'enseignement transmis par les anciens en dehors des structures formelles, l'absence de distraction (pas d'industrie loisir massive). Les salles américaines (AKA, Jackson Wink, Eagle MMA Dagestan) qui adoptent partiellement le modèle voient des résultats notables.",
      },
      {
        q: 'Qu\'est-ce qu\'un camp MKR de 1 à 3 semaines peut vraiment t\'apporter si tu n\'as pas grandi dans ce système ?',
        a: "Trois bénéfices concrets et mesurables sur 1 à 3 semaines. Premier : une exposition à l'intensité réelle du sparring daghestanais que tu ne reproduiras nulle part en Europe (l'intensité, pas la violence). Deuxième : des corrections techniques précises sur tes 5 à 10 mouvements clés par des coachs qui ont vu et corrigé des milliers de versions de ces gestes. Troisième : un reset mental durable, parce que rentrer chez toi après 3 semaines au Daghestan change ton standard de ce qui est dur, normal, ou facile. Les athlètes qui en tirent le plus sont ceux qui ont déjà une base technique et qui viennent corriger, pas découvrir.",
      },
      {
        q: 'Pourquoi les femmes daghestanaises ne percent-elles pas en MMA féminin ?',
        a: "Contexte culturel et religieux principalement. La majorité musulmane sunnite du Daghestan ne valorise pas la pratique sportive féminine au-delà d'un certain niveau, et les structures formelles existent peu. Cela commence à changer (premiers clubs féminins à Makhachkala depuis 2020), mais l'écart avec la Russie centrale, l'Europe ou les États-Unis reste massif. MKR accueille des participantes féminines occasionnellement, sur demande, avec un encadrement adapté.",
      },
    ],
    content: `
    <p>Le Daghestan, petite république du Caucase russe de 3 millions d'habitants, a produit plus de champions UFC actifs au début des années 2020 que n'importe quelle autre région du monde ramenée à sa population. Khabib Nurmagomedov, Islam Makhachev, Umar Nurmagomedov, plus une vingtaine de prétendants et top contenders en lutte libre et MMA mondial. Ce n'est pas une coïncidence, et ce n'est pas un mystère non plus.</p>

    <p>Cet article décortique les <strong>3 piliers</strong> qui font la domination daghestanaise, ce qui est reproductible chez toi, et ce qu'un camp MKR peut concrètement t'apporter en 1 à 3 semaines.</p>

    <h2>PILIER 1 : UNE CULTURE DE LA LUTTE MILLÉNAIRE</h2>

    <p>Au Daghestan, la lutte n'est pas un sport au sens occidental. C'est un fait social total. Dans les villages de montagne, chaque communauté a son lutteur emblématique. Les tournois inter-villages, organisés à chaque grande fête, sont des événements majeurs qui mobilisent toute la région. Un bon lutteur est respecté à vie. Un mauvais lutteur garde une réputation à porter.</p>

    <p>Concrètement, les garçons commencent la lutte à 5 ou 6 ans, souvent introduits par un oncle ou un père qui ont eux-mêmes lutté. À 12 ans, un lutteur prometteur a déjà accumulé l'équivalent de 1 500 heures de mat-time. À 18 ans, il en a 5 000. À 22 ans, il a affronté plus de partenaires différents que la majorité des combattants UFC adultes occidentaux.</p>

    <blockquote><p>La différence entre un athlète occidental moyen et un athlète daghestanais moyen ne se mesure pas en force, en explosivité ou en QI tactique. Elle se mesure en heures cumulées de combat contrôlé contre des partenaires sérieux. C'est une dette de mat-time qu'aucun stage intensif de 6 mois ne peut combler totalement.</p></blockquote>

    <p>Cette accumulation crée des automatismes que tu ne peux pas obtenir par drills isolés. Les bascules, les contrôles de poignet, les transitions au sol deviennent des réflexes neurologiques, pas des techniques apprises. C'est la différence entre "savoir faire une technique" et "ne pas pouvoir faire autrement".</p>

    <h2>PILIER 2 : LE SYSTÈME EAGLE MMA</h2>

    <p>Le coup de génie du Daghestan moderne, c'est d'avoir réussi la transition de la lutte libre vers le MMA. Cette transition n'a pas été spontanée. Elle a été pensée et industrialisée par Abdulmanap Nurmagomedov, le père de Khabib, à partir des années 2000.</p>

    <p>Abdulmanap a créé Eagle MMA, un système structuré qui prend des lutteurs déjà excellents et leur ajoute les compétences manquantes : frappe debout, soumissions au sol, jeu de cage. Les salles affiliées Eagle MMA fonctionnent toutes selon le même schéma :</p>

    <ul>
      <li><strong>2 sessions techniques par jour</strong>, 6 jours par semaine, 11 mois par an. Pas d'intersaison longue.</li>
      <li><strong>Sparring 4 jours par semaine</strong> dont 2 séances intenses simulant un combat.</li>
      <li><strong>Débrief technique systématique</strong> après chaque session, vidéo à l'appui depuis 2015.</li>
      <li><strong>Compétition mensuelle</strong> au niveau local, régional ou international selon le niveau.</li>
      <li><strong>Sélection par les pairs</strong> : les meilleurs sparring partners sont disputés, les moins bons s'isolent ou abandonnent.</li>
    </ul>

    <p>Le résultat : un combattant Eagle MMA arrive en UFC avec déjà 100+ combats de sparring intenses derrière lui, là où un combattant américain moyen en a 40 à 60. À niveau technique égal, le combattant daghestanais a une expérience neurologique du combat 2x supérieure.</p>

    <h2>PILIER 3 : LA SÉLECTION NATURELLE PERMANENTE</h2>

    <p>C'est le pilier dont on parle le moins, parce qu'il est inconfortable à formuler. Au Daghestan, tu te bats pour exister. Pas pour gagner ta vie, pour exister socialement.</p>

    <p>Le fils d'un combattant qui ne lutte pas est mal vu. Le combattant moyen qui ne progresse pas est isolé. Le combattant qui abandonne son entraînement perd sa place dans le groupe. Cette pression sociale, totalement absente du contexte européen ou américain moderne, crée un mécanisme de sélection naturelle quotidien.</p>

    <p>Les 1 000 lutteurs prometteurs d'un village à 15 ans deviennent 100 à 20 ans, 10 à 25 ans, 1 à 30 ans. Ce 1 est statistiquement comparable aux meilleurs combattants mondiaux. Aux États-Unis, sur 1 000 lutteurs prometteurs à 15 ans, la grande majorité abandonne en arrivant à l'université pour des raisons économiques (le wrestling universitaire ne paie pas) ou par diversification (autre sport, autre carrière).</p>

    <h2>CE QUI N'EST PAS REPRODUCTIBLE : ET CE QUI L'EST</h2>

    <p>Soyons honnêtes sur ce qu'un camp d'1 à 3 semaines au Daghestan peut et ne peut pas faire.</p>

    <h3>Ce qui n'est pas reproductible</h3>
    <ul>
      <li>Les 15 ans de mat-time accumulés depuis l'enfance par un lutteur local.</li>
      <li>La pression sociale du village qui pousse à ne jamais s'arrêter.</li>
      <li>L'apprentissage tacite transmis par les anciens en dehors des structures formelles.</li>
    </ul>

    <h3>Ce qui est totalement reproductible : y compris pour toi</h3>
    <ul>
      <li><strong>L'intensité du sparring contrôlé</strong> : sur place, en 2 semaines, tu vivras plus de rounds de sparring sérieux que dans 6 mois de salle européenne moyenne.</li>
      <li><strong>Les corrections techniques précises</strong> par des coachs qui ont vu et corrigé des milliers de versions de chaque geste. Voir notre article <a href="/blog/lutte-daghestanaise-guide-complet">la lutte daghestanaise : guide complet</a>.</li>
      <li><strong>Le reset mental</strong> : ton standard de "ce qui est dur" se recalibre durablement après 2 semaines au camp.</li>
      <li><strong>Le contact avec l'écosystème</strong> : tu vois comment les pros vivent, mangent, dorment, s'entraînent. Tu peux importer 30 à 50% de ces habitudes chez toi.</li>
    </ul>

    <h2>POURQUOI CE N'EST PAS QUE DU MMA</h2>

    <p>Le Daghestan domine aussi la lutte libre olympique (plusieurs médaillés olympiques par génération), le sambo, le combat libre russe et plusieurs autres disciplines de grappling. Le MMA n'est que la vitrine la plus médiatisée.</p>

    <p>C'est pour ça que MKR organise séparément un <a href="/programme/lutte">camp Lutte au Daghestan</a> (Makhachkala, Kaspiysk) et un <a href="/programme/mma">camp MMA en Tchétchénie</a> (Grozny, Akhmat Fight Club). Voir la <a href="/destinations">page destinations</a> pour comprendre comment chaque écosystème fonctionne en propre. Le MMA en Tchétchénie exige un niveau Avancé minimum, la lutte au Daghestan est accessible à tous les niveaux à condition d'avoir la condition physique nécessaire.</p>

    <h2>L'AVIS DE RUSLAN, FONDATEUR MKR</h2>

    <p>Ruslan Magomedov, fondateur de MKR Caucasian Camp et facilitateur depuis 2018 : <em>"Les gens viennent souvent au Daghestan en pensant qu'ils vont copier Khabib. Ce n'est pas l'angle. L'angle, c'est de comprendre que Khabib n'est pas exceptionnel parce qu'il est Khabib. Il est exceptionnel parce qu'il est sorti d'un système qui produit des Khabib en série. Ce que tu viens chercher, c'est ce système, pas un individu."</em></p>

    <h2>CE QUE MKR T'APPORTE EN 1 À 3 SEMAINES</h2>

    <p>Pendant ton camp MKR, tu t'entraînes avec les coachs locaux directement, dans les mêmes salles que celles qui produisent les champions. Les 4 sessions officielles 2026/2027 proposent 15 places Lutte au Daghestan et 15 places MMA en Tchétchénie chacune. Tu peux aussi choisir un format <a href="/sur-mesure">Sur Mesure</a> pour adapter durée et dates, ou un format <a href="/familles">Famille</a> pour venir avec ton enfant à partir de 8 ans.</p>

    <p>Pour discuter de ton dossier avant inscription, contacte Ruslan via <a href="https://wa.me/33666177691">WhatsApp +33 6 66 17 76 91</a> ou réserve directement sur la <a href="/inscription">page inscription</a>. La prochaine étape, c'est l'appel de cadrage gratuit, sans engagement.</p>
  `,
  },
  {
    slug: 'preparer-son-premier-camp',
    title: 'Comment préparer son premier camp au Caucase',
    excerpt: "Guide pratique : condition physique sur 6 semaines, équipement obligatoire, mindset. Tout ce qu'il faut savoir avant ton premier camp MKR au Daghestan ou en Tchétchénie.",
    date: '28 février 2026',
    dateISO: '2026-02-28',
    dateModifiedISO: '2026-05-14',
    readTime: '9 min',
    category: 'Préparation',
    img: '/images/blog/prep-camp.webp',
    imgAlt: "Athlète préparant son sac d'entraînement avant un camp MMA au Caucase, gants et protections sur table.",
    authorName: "L'équipe MKR Caucasian Camp",
    metaDescription: "Préparer son premier camp MKR au Caucase : programme physique 6 semaines, check-list équipement, mindset jour 1, FAQ pratique. Guide rédigé par l'équipe terrain depuis 2018.",
    keywords: [
      'préparer camp MMA',
      'préparation lutte Daghestan',
      'équipement camp MMA',
      'condition physique pré-camp',
      'check-list camp Caucase',
      'premier camp MKR',
    ],
    about: ['MMA', 'Lutte', 'Daghestan', 'Tchétchénie', 'MKR Caucasian Camp'],
    relatedSlugs: ['nutrition-athlete-combat', 'lutte-daghestanaise-guide-complet', 'pourquoi-le-dagestan-domine-le-mma'],
    tldr: [
      "Démarre un programme physique structuré 6 semaines avant le départ : 4 séances par semaine, mix HIIT, gainage et endurance.",
      "Équipement obligatoire : gants MMA 4oz et 16oz, protège-tibias, protège-dents moulé, coquille, rashguard, short de grappling, claquettes pour les douches.",
      "Niveau requis : capable d'enchaîner 2 sessions de 90 minutes par jour, 6 jours sur 7, pendant 1 à 3 semaines au choix.",
      "Mindset : viens humble. Le niveau local est élevé, accepte de te faire dominer les 3 premiers jours, c'est là que tu progresses le plus vite.",
      "Documents indispensables : passeport valide 6 mois minimum, visa Russie, certificat médical de non contre-indication, assurance rapatriement.",
    ],
    faq: [
      {
        q: 'Quel niveau minimum faut-il pour venir au camp MKR ?',
        a: "Pas de niveau minimum théorique pour les camps Lutte au Daghestan ou les inscriptions Sur Mesure. Il faut être capable d'enchaîner 2 sessions d'entraînement par jour pendant la durée choisie (1 à 3 semaines). Pour le camp MMA en Tchétchénie, en revanche, un niveau Avancé minimum est exigé par les coachs Akhmat Fight Club. Si tu hésites, l'équipe MKR valide ton dossier en visio avant de confirmer ta place.",
      },
      {
        q: 'Combien de semaines de préparation physique faut-il prévoir ?',
        a: "Le minimum honnête : 6 semaines de préparation spécifique avant le départ, à raison de 4 séances par semaine. Si tu pars de loin (peu d'activité depuis 6 mois), prévois 10 à 12 semaines. L'objectif n'est pas d'arriver au pic de forme, mais de pouvoir absorber le volume sur place sans te blesser dès J3.",
      },
      {
        q: 'Quel équipement dois-je apporter et qu\'est-ce qui est fourni sur place ?',
        a: "Tu dois apporter : gants MMA 4oz et 16oz, protège-tibias, protège-dents (idéalement moulé chez ton dentiste), coquille, 2 à 3 rashguards, 2 shorts de grappling, claquettes pour les douches, vêtements de récupération chauds (les soirées sont fraîches en montagne). Sont fournis sur place : tatamis, sacs de frappe, équipement de musculation de base, eau, repas. Pas de location de matériel personnel.",
      },
      {
        q: 'Combien coûte un camp et qu\'est-ce qui est inclus dans le prix ?',
        a: "Les tarifs publics démarrent à 1 490 € pour une semaine en Solo ou Duo, et descendent à 1 290 €/personne pour les groupes de 6 à 10. Le forfait Famille (1 parent + 1 enfant inclus) démarre à 2 590 €. Sont inclus : vol intérieur Istanbul-Makhachkala (Lutte au Daghestan) ou Istanbul-Grozny (MMA en Tchétchénie), transferts aéroport-camp, hébergement, 2 repas par jour, encadrement coachs locaux, accès salles. Non inclus : vol international, visa, assurance, équipement personnel.",
      },
      {
        q: "Comment se passe une journée type ?",
        a: "Réveil 7h30, petit-déjeuner copieux à 8h, première session entraînement à 10h30 (Lutte) ou 11h00 (MMA), pause déjeuner 13h, récupération 14h-17h, deuxième session 17h30 (Lutte) ou 18h00 (MMA), dîner 20h, débrief technique, extinction des feux 22h. Le dimanche est plus léger ou consacré à une excursion (canyon Sulak, dune Sarykum, village Gamsutl en option).",
      },
      {
        q: "Et si je n'ai jamais lutté au sol ? Le camp est-il accessible aux débutants en grappling ?",
        a: "Oui pour les camps Lutte au Daghestan. Les coachs encadrent les non-lutteurs séparément les premiers jours, le temps d'apprendre les chutes et les bases du contrôle. Pour le MMA en Tchétchénie, le sparring sol est obligatoire et un niveau minimum en lutte est exigé. Si tu viens d'un background frappe pure (boxe, kickboxing) et que tu veux préparer un combat MMA, l'équipe MKR te conseillera plutôt sur une formule Sur Mesure Lutte intensive avant d'enchaîner sur le MMA.",
      },
    ],
    content: `
    <p>Tu as bouclé ton inscription pour un camp MKR. Que tu pars en session officielle (Lutte au Daghestan, MMA en Tchétchénie), en Sur Mesure ou en formule Famille, la qualité de ta préparation conditionne ce que tu vas retirer du séjour. Voici le guide complet rédigé à partir de notre expérience terrain depuis 2018.</p>

    <p><strong>Important :</strong> les 4 sessions officielles 2026/2027 affichent <a href="/sessions">15 places Lutte au Daghestan et 15 places MMA en Tchétchénie</a> chacune. Le MMA exige un niveau Avancé minimum. Si tu hésites entre les deux formats, contacte Ruslan en amont via <a href="https://wa.me/33666177691">WhatsApp +33 6 66 17 76 91</a> pour cadrer ton profil.</p>

    <h2>CONDITION PHYSIQUE : LE PROGRAMME 6 SEMAINES</h2>

    <p>Le but n'est pas d'arriver au pic de forme. C'est d'arriver capable d'absorber le volume sans te blesser dès le troisième jour. Le rythme du camp est de <strong>2 sessions techniques par jour, 6 jours sur 7</strong>, avec un volume de sparring que tu ne reproduiras nulle part en Europe.</p>

    <h3>Semaine 1 et 2 : Reprise et capacité aérobie</h3>
    <p>3 séances cardio par semaine en zone 2 (course, vélo, rameur) de 40 à 50 minutes, plus 2 séances de renforcement général full body (squats, tractions, pompes, gainage). Le but est de réveiller le moteur sans accumuler de fatigue.</p>

    <h3>Semaine 3 et 4 : Intensité</h3>
    <p>Introduction du HIIT : 2 séances par semaine de 20 à 30 minutes (par exemple 30 secondes à fond, 30 secondes facile, 12 répétitions). En parallèle, 2 séances spécifiques combat : drills techniques sur sac de frappe, shadow wrestling, déplacements. Renforcement spécifique du cou et des épaules pour absorber les takedowns.</p>

    <h3>Semaine 5 et 6 : Affûtage</h3>
    <p>Baisse du volume de 25 à 30%, hausse de l'intensité. 3 séances de sparring léger ou de drills à pleine vitesse. Travail mobilité articulaire (épaules, hanches, chevilles). La dernière semaine, mets-toi en mode récupération active : pas de séance qui te casse, beaucoup de sommeil, hydratation, étirements.</p>

    <h2>L'ÉQUIPEMENT À EMPORTER</h2>

    <p>Pas de location sur place pour l'équipement personnel. Ce que tu apportes est ce que tu auras. Voici la liste exhaustive validée par les coachs sur place.</p>

    <h3>Combat et protection</h3>
    <ul>
      <li><strong>Gants MMA 4oz</strong> (pour le sparring grappling et clinch) et <strong>16oz</strong> (pour les sessions stand-up et frappe au sac)</li>
      <li><strong>Protège-tibias</strong> rigides ou semi-rigides (le sparring tibia est intense)</li>
      <li><strong>Protège-dents moulé</strong> chez ton dentiste, pas un thermoformable de supermarché</li>
      <li><strong>Coquille</strong> avec sangle ajustable</li>
      <li><strong>Bandages pour les mains</strong> (2 paires minimum, ils s'usent vite)</li>
    </ul>

    <h3>Textile</h3>
    <ul>
      <li>2 à 3 <strong>rashguards</strong> longues manches</li>
      <li>2 <strong>shorts de grappling</strong> ou de MMA (no-gi)</li>
      <li>2 à 3 <strong>tee-shirts d'entraînement</strong> respirants</li>
      <li>1 <strong>training pantalon</strong> ou jogging pour les sessions S&C</li>
      <li><strong>Claquettes</strong> pour les douches et déplacements salles (obligatoire)</li>
      <li>Vêtements chauds : la température en soirée descend, surtout en automne et hiver au Daghestan</li>
    </ul>

    <h3>Hygiène et administratif</h3>
    <ul>
      <li>Trousse de toilette complète (les pharmacies locales existent mais en cyrillique uniquement)</li>
      <li>Petite trousse à pharmacie : pansements, anti-inflammatoires, anti-douleurs, désinfectant</li>
      <li>Passeport valide 6 mois minimum après ton retour</li>
      <li>Visa Russie (questionnaire et lettre d'invitation MKR fournis par notre équipe)</li>
      <li>Certificat médical de non contre-indication daté de moins de 3 mois</li>
      <li>Attestation d'assurance rapatriement (obligatoire, voir notre <a href="/logistique">page logistique</a>)</li>
    </ul>

    <p>Ce qui n'est <strong>pas nécessaire</strong> : kimono de judo ou de BJJ (le travail au Daghestan est no-gi), adaptateur électrique (les prises sont compatibles UE), crème solaire haute protection (sauf en été).</p>

    <h2>LE MINDSET : ARRIVER PRÊT MENTALEMENT</h2>

    <p>C'est la partie que les athlètes européens sous-estiment le plus souvent.</p>

    <blockquote><p>Au Caucase, tu n'es pas un client. Tu es un partenaire d'entraînement. Les coachs locaux ne te ménagent pas parce que tu paies. Ils te respectent si tu encaisses et que tu reviens le lendemain.</p></blockquote>

    <p>Concrètement, voici les attitudes qui fonctionnent et celles qui font perdre du temps.</p>

    <h3>Ce qui fonctionne</h3>
    <ul>
      <li><strong>Humilité totale</strong> les 3 premiers jours. Tu vas te faire dominer, accepte-le. Plus vite tu l'acceptes, plus vite tu progresses.</li>
      <li><strong>Régularité absolue</strong> sur les 2 sessions par jour. Ne saute pas la session du soir parce que tu es fatigué, c'est la session du soir qui te construit.</li>
      <li><strong>Pose des questions précises</strong> aux coachs. Khasan, Magomed et leur équipe parlent peu de français et d'anglais, mais ils comprennent les gestes. Filme tes drills, demande des corrections.</li>
      <li><strong>Mange tout ce qu'on te sert</strong>. La cuisine locale (agneau, kasha, pain frais, produits laitiers) est conçue pour soutenir 2 sessions par jour. Voir notre article <a href="/blog/nutrition-athlete-combat">nutrition athlète de combat au Caucase</a>.</li>
    </ul>

    <h3>Ce qui plombe ton camp</h3>
    <ul>
      <li>Vouloir prouver ton niveau dès J1. Tu vas finir blessé ou cramé pour 4 jours.</li>
      <li>Comparer la salle MKR à ta salle européenne. Ce n'est pas une salle, c'est un écosystème. Voir notre analyse <a href="/blog/pourquoi-le-dagestan-domine-le-mma">pourquoi le Daghestan domine le MMA mondial</a>.</li>
      <li>Refuser le sparring sous prétexte que c'est "trop intense". Le sparring contrôlé daghestanais est moins risqué qu'un sparring européen brouillon, malgré l'intensité apparente.</li>
      <li>Te plaindre de la nourriture, de l'hébergement, du wifi. Ce n'est pas un séjour all-inclusive, c'est un camp d'entraînement.</li>
    </ul>

    <h2>L'AVIS DE RUSLAN</h2>

    <p>Ruslan Magomedov, fondateur MKR, ancien combattant et facilitateur depuis 2018 : <em>"Les athlètes qui repartent transformés ne sont pas forcément ceux qui avaient le meilleur niveau en arrivant. Ce sont ceux qui ont accepté de redevenir débutants pendant 1 ou 2 semaines. C'est ce qui fait toute la différence."</em></p>

    <p>Si tu veux discuter de ton dossier avant inscription, l'équipe MKR organise un appel de cadrage gratuit. Réserve directement sur <a href="/inscription">la page inscription</a> ou contacte-nous via WhatsApp.</p>

    <h2>PROCHAINES ÉTAPES</h2>

    <p>Tu te prépares pour une session officielle ? Vérifie tes dates et choisis ta discipline sur la <a href="/sessions">page Sessions 2026/2027</a>. Tu pars en famille ? Consulte la <a href="/familles">formule parent + enfant 8-17 ans</a>. Tu organises un séjour avec ton club ? Demande un devis sur la <a href="/clubs-groupes">page Clubs et Groupes</a> ou par <a href="https://wa.me/33666177691">WhatsApp</a>.</p>

    <p>Et le jour où tu boucles ton sac, relis cet article. C'est la check-list qui t'évitera les oublis bêtes.</p>
  `,
  },
  {
    slug: 'lutte-daghestanaise-guide-complet',
    title: 'La lutte daghestanaise : guide complet',
    excerpt: "Techniques, histoire et philosophie de la lutte au Daghestan. Pourquoi ces méthodes sont supérieures.",
    date: '10 février 2026',
    dateISO: '2026-02-10',
    readTime: '10 min',
    category: 'Technique',
    img: '/images/blog/lutte-guide.webp',
    content: `
    <p>La lutte au Daghestan n'est pas simplement un sport. C'est une institution culturelle, un système éducatif et une voie de vie. Ce guide explore les méthodes, l'histoire et la philosophie de la lutte daghestanaise.</p>

    <h2>L'HISTOIRE</h2>
    <p>La lutte au Daghestan remonte à des siècles. Chaque village possédait sa propre tradition de combat. Les tournois inter-villages étaient des événements majeurs, et le meilleur lutteur du village était respecté comme un héros.</p>

    <h2>LES MÉTHODES</h2>
    <p>L'entraînement daghestanais met l'accent sur le sparring réel dès les premières années. Les jeunes lutteurs affrontent des partenaires plus expérimentés quotidiennement. Cette exposition constante à des niveaux supérieurs accélère la progression.</p>

    <h2>POURQUOI CES MÉTHODES FONCTIONNENT</h2>
    <p>Le volume d'entraînement, la qualité des partenaires de sparring, et la culture de compétition permanente créent un environnement où seuls les plus adaptés progressent. C'est la sélection naturelle appliquée au sport de combat.</p>
  `,
  },
  {
    slug: 'securite-dagestan-2026',
    title: 'Sécurité au Daghestan et en Tchétchénie en 2026 : la réalité du terrain',
    excerpt: "État des lieux factuel pour les athlètes occidentaux : ce que dit le Quai d'Orsay, ce que vivent réellement les participants MKR à Makhachkala, Kaspiysk et Grozny depuis 2018.",
    date: '25 janvier 2026',
    dateISO: '2026-01-25',
    dateModifiedISO: '2026-05-14',
    readTime: '11 min',
    category: 'Logistique',
    img: '/images/blog/securite-dagestan.webp',
    imgAlt: "Vue panoramique sécurisée de Makhachkala et de la mer Caspienne, zone d'entraînement principale des camps MKR Daghestan.",
    authorName: "L'équipe MKR Caucasian Camp",
    metaDescription: "Sécurité au Daghestan et en Tchétchénie pour un camp MMA ou Lutte en 2026 : avis Quai d'Orsay, stats criminalité, protocole MKR 24/7, témoignages d'athlètes occidentaux. Réponses factuelles.",
    keywords: [
      'sécurité Daghestan',
      'sécurité Tchétchénie',
      'camp MMA Russie sécurité',
      'Makhachkala dangereux',
      'Grozny athlètes occidentaux',
      'Quai d\'Orsay Caucase',
    ],
    about: ['Daghestan', 'Tchétchénie', 'Makhachkala', 'Grozny', 'Caucase', 'MKR Caucasian Camp', 'Quai d\'Orsay'],
    relatedSlugs: ['preparer-son-premier-camp', 'pourquoi-le-dagestan-domine-le-mma', 'khabib-methode-entrainement'],
    tldr: [
      "Les zones où MKR opère (Makhachkala, Kaspiysk au Daghestan, Grozny en Tchétchénie) sont stables et fréquentées par des athlètes internationaux UFC, ONE et Bellator depuis plus de 10 ans.",
      "Le Quai d'Orsay classe le Caucase russe en zone orange par principe diplomatique. Aucun athlète sportif occidental n'y a été ciblé depuis 2010.",
      "Protocole MKR : équipe francophone présente 24/7, transfert aéroport sécurisé, hébergement encadré, contact d'urgence permanent, assurance rapatriement obligatoire.",
      "Risque réel principal : accidents de la route et blessures sportives, pas l'insécurité géopolitique. Préparation médicale et assurance plus importantes que le reste.",
      "Zones autorisées par MKR : Makhachkala, Kaspiysk, Khasavyourt, Grozny centre. Zones interdites par l'équipe : frontières administratives, Tcherkessie sud, montagnes hors zones encadrées.",
    ],
    faq: [
      {
        q: 'Le Quai d\'Orsay déconseille le Caucase russe. Pourquoi MKR continue d\'y opérer ?',
        a: "L'avis du Quai d'Orsay est un avis diplomatique général qui couvre toute la région Caucase russe en zone orange ou rouge selon les districts. Cet avis ne distingue pas les zones urbaines stables (Makhachkala, Grozny centre) des zones frontalières sensibles. Concrètement, les athlètes UFC, ONE Championship et les délégations sportives internationales se rendent régulièrement à Makhachkala pour préparer leurs combats depuis plus de 15 ans, sans incident. MKR opère dans ce contexte sportif balisé, pas en mode touristique généraliste. Nous prenons l'avis du Quai d'Orsay au sérieux pour les zones que nous interdisons à nos participants (frontières administratives, montagnes hors zones encadrées), mais pas comme un blocage absolu sur les capitales sportives reconnues.",
      },
      {
        q: 'Quelles sont les zones autorisées et interdites par MKR ?',
        a: "Zones autorisées et fréquentées quotidiennement : Makhachkala (Lutte au Daghestan), Kaspiysk et Khasavyourt (déplacements d'entraînement), Grozny centre (MMA en Tchétchénie). Zones interdites par l'équipe MKR à nos participants : toutes les zones frontalières administratives, les régions montagneuses hors excursions encadrées (canyon Sulak, dune Sarykum, village Gamsutl), les déplacements solo en taxi non-MKR après 22h. Si un participant veut explorer une zone hors périmètre, c'est sous sa propre responsabilité et après accord explicite de l'équipe.",
      },
      {
        q: 'Que se passe-t-il concrètement en cas d\'urgence médicale ou de problème ?',
        a: "L'équipe MKR a un protocole en 3 niveaux. Niveau 1 (petite blessure, mal de ventre) : prise en charge interne, médecin sportif local sur appel sous 30 minutes. Niveau 2 (blessure modérée, suspicion de fracture) : transfert vers l'hôpital privé partenaire de Makhachkala ou de Grozny, accompagnement francophone. Niveau 3 (urgence vitale) : rapatriement immédiat via assurance souscrite obligatoirement avant le départ (Allianz Assistance, Mondial Assistance ou équivalent). Le contact d'urgence MKR est joignable 24/7 sur WhatsApp et téléphone.",
      },
      {
        q: 'Est-ce que des athlètes occidentaux ont eu des problèmes sur place ces dernières années ?',
        a: "Depuis 2018 et plus de 200 participants MKR, aucun incident sécuritaire lié à l'environnement géopolitique. Les seuls cas de retours anticipés sont liés à : blessures sportives (3 cas, tous bien pris en charge par l'assurance), problèmes personnels familiaux en Europe (2 cas), une intoxication alimentaire isolée (1 cas, hors structure MKR). Aucun cas de vol, agression, contrôle policier abusif ou problème lié au profil occidental des participants.",
      },
      {
        q: 'Et la guerre en Ukraine ? Comment ça affecte le Daghestan et la Tchétchénie ?',
        a: "Le Daghestan et la Tchétchénie sont à plus de 1 500 km du front, hors zone de conflit direct. La mobilisation a touché certaines régions rurales mais n'a pas d'impact opérationnel sur la vie sportive des capitales. Les compétitions UFC continuent (Islam Makhachev, Khabib en coaching, Khamzat Chimaev), les salles partenaires de MKR tournent à plein, les vols internationaux Istanbul-Makhachkala et Istanbul-Grozny sont assurés quotidiennement. Si la situation devait changer brutalement, MKR reporterait ou annulerait les camps concernés avec remboursement intégral selon nos CGV.",
      },
      {
        q: 'Quelle assurance prendre et qu\'est-ce qu\'elle doit couvrir ?',
        a: "Assurance obligatoire à souscrire avant le départ. Couverture minimum : rapatriement sanitaire depuis la Russie, frais médicaux à hauteur de 100 000 € minimum, responsabilité civile sport de combat, perte ou vol de bagages. Compagnies validées par les participants MKR : Allianz Travel, Mondial Assistance, Chapka Direct, AXA Assistance, Mutuaide. Pense à vérifier que ton contrat ne contient pas d'exclusion sur les sports de combat ou sur la Russie. Si c'est le cas, prends un contrat sport intensif complémentaire.",
      },
      {
        q: 'Et pour les femmes ? La région est-elle adaptée à des participantes ?',
        a: "MKR n'a accueilli à ce jour qu'une minorité de participantes féminines (pas par discrimination mais parce que le sport pratiqué reste majoritairement masculin sur place). Pour les femmes qui veulent venir : aucun problème opérationnel. Tenue d'entraînement libre dans les salles, code vestimentaire urbain similaire à n'importe quelle ville russe (pas d'obligation de voile, pas de séparation hommes/femmes dans les espaces publics). Le Daghestan reste une république majoritairement musulmane, le comportement modeste est apprécié mais rien n'est imposé. Si tu es une combattante intéressée, contacte directement Ruslan pour discuter du contexte.",
      },
    ],
    content: `
    <p>La question de la sécurité au Daghestan et en Tchétchénie revient systématiquement avant chaque inscription. C'est légitime. Voici un état des lieux factuel, basé sur notre expérience terrain depuis 2018, sur les chiffres officiels et sur les retours de plus de 200 participants occidentaux passés par MKR.</p>

    <p>Cet article distingue volontairement <strong>l'image médiatique</strong> de la région et <strong>la réalité opérationnelle</strong> des camps sportifs. Les deux sont vraies, mais pas au même niveau.</p>

    <h2>L'IMAGE MÉDIATIQUE : CE QUE TU AS LU OU ENTENDU</h2>

    <p>Quand tu cherches "Daghestan sécurité" sur Google, tu tombes sur trois types de contenu : les avis officiels (Quai d'Orsay, Foreign Office britannique, Département d'État américain), les articles géopolitiques sur le Caucase post-2000, et des reportages anciens sur l'insurrection islamiste des années 2000-2015. Le tout colore l'image d'une zone de guerre permanente.</p>

    <p>La réalité 2026 est différente, et c'est documenté. Le Daghestan n'a pas connu d'attentat majeur depuis 2018. Makhachkala est devenue une capitale sportive reconnue, accueillant régulièrement des camps de préparation UFC. Le tourisme intérieur russe y est en croissance forte. La Tchétchénie, sous le gouvernement Kadyrov, a un taux de criminalité urbaine officiellement inférieur à celui de Moscou.</p>

    <h2>L'AVIS OFFICIEL DU QUAI D'ORSAY : COMMENT LE LIRE</h2>

    <p>Le Quai d'Orsay classe le Caucase russe (Daghestan, Tchétchénie, Ingouchie, Ossétie du Nord) en zone <strong>orange à rouge selon les districts</strong>. C'est un avis de précaution diplomatique qui couvre uniformément un vaste territoire sans distinguer les capitales urbaines stables des zones frontalières sensibles.</p>

    <p>Concrètement, cet avis ne signifie pas "n'y allez sous aucun prétexte". Il signifie "informez le consulat de votre présence et évitez les zones frontalières". MKR communique systématiquement le programme de chaque participant à l'ambassade de France à Moscou avant le départ, et fournit le formulaire Ariane pour ceux qui veulent s'enregistrer individuellement.</p>

    <p>À noter : les délégations sportives internationales (équipes UFC, fédérations nationales de lutte, ONE Championship) qui se rendent à Makhachkala ou Grozny pour préparer leurs combats ne s'arrêtent pas à cet avis. C'est un indicateur fort.</p>

    <h2>CE QUE VIVENT RÉELLEMENT LES PARTICIPANTS MKR DEPUIS 2018</h2>

    <p>Depuis le premier camp organisé en 2018, plus de 200 participants occidentaux sont passés par MKR. Le bilan factuel :</p>

    <ul>
      <li><strong>0 incident de sécurité géopolitique</strong> (pas d'attentat, pas d'agression liée au profil occidental, pas de contrôle policier abusif, pas de prise d'otage, pas de problème consulaire majeur).</li>
      <li><strong>3 blessures sportives</strong> ayant nécessité un retour anticipé, toutes couvertes par l'assurance rapatriement obligatoire.</li>
      <li><strong>1 intoxication alimentaire isolée</strong> (hors structure MKR, lors d'une sortie individuelle dans un restaurant non recommandé).</li>
      <li><strong>2 retours anticipés</strong> pour raisons personnelles (deuil familial, urgence professionnelle en Europe).</li>
    </ul>

    <p>Ce bilan est conforme à ce qu'on observe sur n'importe quel camp sportif intensif en Europe ou aux États-Unis. Les blessures sont la première cause de retour anticipé. Pas la géopolitique.</p>

    <h2>LE PROTOCOLE DE SÉCURITÉ MKR EN 5 NIVEAUX</h2>

    <p>Le protocole MKR encadre chaque participant depuis le départ d'Europe jusqu'au retour. Il s'articule en 5 niveaux successifs.</p>

    <h3>Niveau 1 : Avant le départ</h3>
    <p>Briefing sécurité en visio avec Ruslan ou un membre de l'équipe. Vérification de l'assurance rapatriement (obligatoire), du passeport valide 6 mois minimum, du visa Russie. Communication des coordonnées du consulat de France à Moscou. Pour les profils sensibles (journalistes, doubles nationaux russes, militaires en activité), refus possible de l'inscription après évaluation au cas par cas.</p>

    <h3>Niveau 2 : Transfert aéroport</h3>
    <p>Vol intérieur Istanbul-Makhachkala (camp Lutte au Daghestan) ou Istanbul-Grozny (camp MMA en Tchétchénie) inclus dans le package. Transfert aéroport-camp par chauffeur MKR connu de l'équipe, jamais en taxi inconnu, jamais après 22h. Durée moyenne : 1h30 à Makhachkala, 30 minutes à Grozny.</p>

    <h3>Niveau 3 : Vie quotidienne au camp</h3>
    <p>Hébergement encadré (appartements ou résidence sportive), regroupement des participants occidentaux, équipe francophone présente en permanence dans les locaux. Pas de déplacement solo en zone urbaine après 22h. Excursions encadrées en groupe le dimanche (canyon Sulak, dune Sarykum, village Gamsutl, mosquée Akhmad Kadyrov à Grozny). Voir notre <a href="/destinations/dagestan">page Daghestan</a> et <a href="/destinations/tchetchenie">page Tchétchénie</a> pour le détail.</p>

    <h3>Niveau 4 : Urgence sur place</h3>
    <p>Numéro d'urgence MKR joignable 24/7 (WhatsApp et téléphone). Médecin sportif local sur appel sous 30 minutes. Partenariat avec un hôpital privé à Makhachkala et à Grozny, accompagnement francophone. Procédure documentée et affichée dans chaque hébergement.</p>

    <h3>Niveau 5 : Rapatriement</h3>
    <p>Assurance rapatriement obligatoire souscrite avant le départ. Vols quotidiens Istanbul-Makhachkala et Istanbul-Grozny. Procédure d'évacuation testée en 2022 et 2024 (deux cas de blessures sportives, rapatriement effectif en 48h).</p>

    <h2>LES RISQUES RÉELS À PRÉPARER</h2>

    <p>Le risque numéro 1 n'est pas géopolitique. C'est <strong>les blessures sportives</strong> liées à l'intensité du sparring. Tu vas faire 12 sessions par semaine minimum. La probabilité d'une entorse, d'une luxation ou d'une commotion est réelle. Voir notre article <a href="/blog/preparer-son-premier-camp">comment préparer son premier camp</a> pour la préparation physique.</p>

    <p>Le risque numéro 2 est <strong>les accidents de la route</strong> (taxis, déplacements de groupe). MKR utilise des chauffeurs identifiés et formés, jamais des VTC inconnus. Si tu commandes un Yandex Taxi (équivalent Uber russe) seul après 22h, c'est sous ta responsabilité.</p>

    <p>Le risque numéro 3 est <strong>la santé alimentaire et hydrique</strong>. La cuisine MKR est préparée sur place dans des conditions encadrées, sans souci connu sur 200+ participants. En revanche, attention aux restaurants de rue ou aux cantines non recommandées.</p>

    <h2>POUR ALLER PLUS LOIN</h2>

    <p>Tu veux préparer ton dossier ? Vois la <a href="/logistique">page logistique complète</a> (visa, vols, assurance, transferts). Tu hésites entre Daghestan et Tchétchénie ? Consulte la <a href="/destinations">page destinations</a> ou réserve un appel de cadrage avec Ruslan via <a href="https://wa.me/33666177691">WhatsApp +33 6 66 17 76 91</a>. Tu prépares un groupe ou un club ? La <a href="/clubs-groupes">page Clubs et Groupes</a> détaille les modalités spécifiques.</p>

    <p>Si tu as une question précise non couverte par cet article, écris-nous directement à <a href="mailto:contact@mkrcamp.com">contact@mkrcamp.com</a>. On répond systématiquement sous 24h.</p>
  `,
  },
  {
    slug: 'nutrition-athlete-combat',
    title: "Nutrition d'un athlète de combat au Caucase",
    excerpt: "Ce qu'on mange pendant le camp. Cuisine caucasienne, protéines et régime adapté à l'effort.",
    date: '8 janvier 2026',
    dateISO: '2026-01-08',
    readTime: '5 min',
    category: 'Préparation',
    img: '/images/blog/nutrition.webp',
    content: `
    <p>La cuisine caucasienne est naturellement adaptée aux athlètes de combat. Riche en protéines, en graisses saines et en glucides complexes, elle fournit l'énergie nécessaire pour 2 sessions d'entraînement par jour.</p>

    <h2>LES BASES</h2>
    <p>Agneau, poulet, produits laitiers, pain frais, légumes du jardin. Les repas sont préparés sur place, en grande quantité, avec des produits locaux.</p>

    <h2>PENDANT LE CAMP</h2>
    <p>2 repas principaux par jour pris en charge par MKR (petit-déjeuner copieux et déjeuner), plus des collations entre les sessions. L'hydratation est cruciale en altitude. L'équipe MKR adapte les portions et le timing des repas au programme d'entraînement.</p>
  `,
  },
  {
    slug: 'khabib-methode-entrainement',
    title: "La méthode d'entraînement de Khabib",
    excerpt: "Analyse de la préparation de Khabib Nurmagomedov. Ce que le camp MKR partage avec ses méthodes.",
    date: '20 décembre 2025',
    dateISO: '2025-12-20',
    readTime: '9 min',
    category: 'Culture',
    img: '/images/blog/khabib-methode.webp',
    content: `
    <p>Khabib Nurmagomedov, 29-0, considéré comme l'un des plus grands combattants de l'histoire du MMA. Sa méthode d'entraînement est directement liée à son environnement : le Daghestan.</p>

    <h2>LES FONDAMENTAUX</h2>
    <p>Lutte depuis l'âge de 5 ans, sparring quotidien avec les meilleurs, courses en montagne, entraînement en altitude. Khabib n'a jamais eu besoin d'une salle high-tech. Les montagnes du Daghestan étaient son terrain d'entraînement.</p>

    <h2>CE QUE LE CAMP MKR PARTAGE AVEC SES MÉTHODES</h2>
    <p>Les coachs MKR utilisent les mêmes fondamentaux : répétition, sparring réel, conditioning naturel. Tu t'entraînes dans les mêmes conditions, avec des coachs qui ont côtoyé le même système.</p>
  `,
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug)
}

export function getAllBlogSlugs(): string[] {
  return BLOG_POSTS.map(p => p.slug)
}

export function getRelatedPosts(slug: string, count = 3): BlogPost[] {
  const current = getBlogPost(slug)
  if (!current) return []

  if (current.relatedSlugs && current.relatedSlugs.length > 0) {
    const explicit = current.relatedSlugs
      .map(s => getBlogPost(s))
      .filter((p): p is BlogPost => Boolean(p))
    if (explicit.length >= count) return explicit.slice(0, count)
  }

  const sameCategory = BLOG_POSTS.filter(
    p => p.slug !== slug && p.category === current.category
  )
  const others = BLOG_POSTS.filter(
    p => p.slug !== slug && p.category !== current.category
  )

  return [...sameCategory, ...others].slice(0, count)
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function wordCount(html: string): number {
  const text = stripHtml(html)
  if (!text) return 0
  return text.split(/\s+/).length
}
