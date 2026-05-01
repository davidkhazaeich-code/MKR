export interface FAQItem {
  question: string
  answer: string
}

export interface FAQCategory {
  id: string
  label: string
  items: FAQItem[]
}

/** Homepage FAQ - 6 most common questions shown on the landing page */
export const FAQ_HOMEPAGE: FAQItem[] = [
  {
    question: 'Quel niveau est requis ?',
    answer: "Le camp est ouvert aux pratiquants intermédiaires et avancés. Une pratique régulière d'au moins 2 ans en MMA, lutte ou art martial de combat est requise. Le niveau est évalué lors de l'entretien vidéo.",
  },
  {
    question: 'Le visa est-il nécessaire ?',
    answer: "Le camp se déroule au Daghestan (Fédération de Russie). Un visa russe est nécessaire pour la majorité des nationalités. Pour les ressortissants UE, MKR fournit un questionnaire visa à compléter avec ton passeport (validité 6 mois minimum) et t'accompagne dans toute la procédure après confirmation de ta candidature.",
  },
  {
    question: "Qu'est-ce qui est inclus dans le prix ?",
    answer: "Le tarif comprend l'hébergement en logement de camp, les repas (2 repas/jour), les séances d'entraînement biquotidiennes, le vol intérieur Istanbul-Makhachkala, les transferts aéroport-camp et le suivi préparatoire à distance. Le vol international n'est pas inclus.",
  },
  {
    question: "Quelle est la langue d'entraînement ?",
    answer: "Les entraînements se déroulent principalement en russe (et quelques mots d'avar selon la salle). Un interprète est présent pour le français et l'anglais. L'immersion linguistique fait partie de l'expérience.",
  },
  {
    question: 'Quel équipement dois-je apporter ?',
    answer: "Gants de boxe (16 oz), protège-tibias, protège-dents et coquille. Un guide complet de préparation est envoyé après confirmation de ta candidature.",
  },
  {
    question: 'Combien de participants par session ?',
    answer: "Maximum 15 participants par session pour garantir un suivi individualisé. Les places sont limitées volontairement. La sélection est réelle.",
  },
]

/** Full FAQ page - categorized questions for the /faq page */
export const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: 'securite',
    label: 'Securite',
    items: [
      {
        question: 'Est-ce que le Dagestan est sur ?',
        answer: "La region ou se deroule le camp est stable et frequentee par des athletes du monde entier. Nous suivons en permanence les recommandations du Quai d'Orsay et du DFAE. Un protocole de securite MKR est en place : contacts d'urgence 24/7, assurance rapatriement recommandee, equipe locale presente en permanence.",
      },
      {
        question: 'Dois-je souscrire une assurance voyage ?',
        answer: "Oui, c'est obligatoire. Ton assurance doit couvrir le rapatriement medical et la pratique de sports de contact. Nous recommandons des prestataires comme Chapka, ACS ou World Nomads. Le detail est envoye apres validation de ta candidature.",
      },
      {
        question: 'Y a-t-il un accompagnateur francophone sur place ?',
        answer: "Oui. Un membre de l'equipe MKR francophone est present pendant toute la duree du camp. Un interprete local assure egalement la traduction pendant les entrainements.",
      },
    ],
  },
  {
    id: 'logistique',
    label: 'Logistique',
    items: [
      {
        question: 'Le visa est-il necessaire ?',
        answer: "Le camp se deroule au Daghestan (Federation de Russie). Un visa russe est necessaire pour la majorite des nationalites. Pour les ressortissants UE, MKR fournit un questionnaire visa a completer avec ton passeport (validite 6 mois minimum) et t'accompagne dans toute la procedure apres confirmation de ta candidature.",
      },
      {
        question: "Qu'est-ce qui est inclus dans le prix ?",
        answer: "Le tarif comprend l'hebergement en logement de camp, les repas (2 repas/jour), les seances d'entrainement biquotidiennes, le vol interieur Istanbul-Makhachkala, les transferts aeroport-camp et le suivi preparatoire a distance. Le vol international n'est pas inclus.",
      },
      {
        question: 'Quel equipement dois-je apporter ?',
        answer: "Gants de boxe (16 oz), protege-tibias, protege-dents et coquille. Un guide complet de preparation est envoye apres confirmation de ta candidature.",
      },
      {
        question: "Comment se passe le transfert depuis l'aeroport ?",
        answer: "Le transfert aeroport-camp est inclus dans le prix. Un vehicule MKR t'attend a l'arrivee. Le trajet entre Makhachkala et le lieu d'entrainement dure environ 1h30.",
      },
    ],
  },
  {
    id: 'entrainement',
    label: 'Entrainement',
    items: [
      {
        question: 'Quel niveau est requis pour participer ?',
        answer: "Le camp est ouvert aux pratiquants intermediaires et avances. Une pratique reguliere d'au moins 2 ans en MMA, lutte ou art martial de combat est requise. Le niveau est evalue lors de l'entretien video.",
      },
      {
        question: "Quelle est la langue d'entrainement ?",
        answer: "Les entrainements se deroulent principalement en russe (et quelques mots d'avar selon la salle). Un interprete est present pour le francais et l'anglais. L'immersion linguistique fait partie de l'experience.",
      },
      {
        question: 'Combien de participants par session ?',
        answer: 'Maximum 15 participants par session pour garantir un suivi individualise. Les places sont limitees volontairement. La selection est reelle.',
      },
      {
        question: 'Puis-je choisir entre MMA, lutte adultes et lutte enfants ?',
        answer: "Oui. Le camp propose 3 disciplines : Lutte adultes, Lutte enfants et MMA. Tu choisis ta discipline a l'inscription. Lutte adultes et enfants : sessions a 10h30 et 17h30. MMA : sessions a 11h00 et 18h00.",
      },
      {
        question: 'Y a-t-il des jours de repos ?',
        answer: "Un jour de repos par semaine est prevu, generalement consacre a une excursion culturelle ou une randonnee en montagne. Le reste du temps, c'est entrainement biquotidien.",
      },
    ],
  },
  {
    id: 'inscription',
    label: 'Inscription',
    items: [
      {
        question: "Comment fonctionne le processus d'inscription ?",
        answer: "1. Tu remplis le formulaire en ligne (5 minutes). 2. On te rappelle sous 48h pour un entretien de validation. 3. Si ta candidature est acceptee, tu verses un acompte de 30%. 4. Tu recois le guide de preparation. 5. Le solde est du 30 jours avant le depart.",
      },
      {
        question: 'Puis-je annuler apres inscription ?',
        answer: "Oui. Annulation gratuite jusqu'a 60 jours avant le depart (remboursement 100%). Entre 30 et 60 jours : remboursement 50%. Moins de 30 jours : non remboursable. Detail complet dans nos CGV.",
      },
      {
        question: 'Quels moyens de paiement acceptez-vous ?',
        answer: "Virement bancaire, carte bancaire (via Stripe) et PayPal. Le paiement se fait en CHF ou en EUR.",
      },
      {
        question: 'Je viens avec mon club, y a-t-il un tarif groupe ?',
        answer: "Le tarif par tete reste identique au tarif individuel : pas de reduction. L'avantage du groupe : reservation simultanee, hebergement bloc, transferts groupes, programme adapte au niveau collectif. Le tunnel 'Club & Groupe' est reserve aux groupes organises de 5 a 20 personnes. Pour 1 a 4 amis adultes, prends 'Sur Mesure'.",
      },
      {
        question: "Quels sont les 4 types d'inscription ?",
        answer: "1. MKR Camp 2026 (session officielle 17 aout - 5 sept, adultes uniquement, groupe constitue par MKR, 3 semaines fixes). 2. Sur Mesure (tes dates, 1 a 4 adultes, 1/2/3 semaines, delai 90 jours minimum). 3. Famille (parent + enfant 8-17 ans, choix entre rejoindre la session ou sur mesure). 4. Club & Groupe (5 a 20 personnes, club ou groupe organise, dates au choix, devis sur mesure). Tarifs publics fixes identiques pour les 4 tunnels.",
      },
      {
        question: 'Quel est le delai minimum pour reserver un camp sur mesure ?',
        answer: "90 jours minimum avant la date de debut souhaitee. Ce delai permet de gerer le visa russe (3-4 semaines), reserver un vol intl pas cher, et completer la preparation physique de 6 semaines. Pour les camps sur dates fixes (session officielle), inscription jusqu'a 30 jours avant le depart.",
      },
    ],
  },
  {
    id: 'familles',
    label: 'Familles & Jeunesse',
    items: [
      {
        question: 'Mon enfant peut-il venir au camp ?',
        answer: "Oui, des 8 ans, mais il doit obligatoirement etre accompagne d'un parent participant au camp. C'est notre regle de securite : pas de prise en charge enfant seul. Tarif enfant 8-17 ans fixe : 1 000 CHF / 1 sem, 1 400 CHF / 2 sem, 1 900 CHF / 3 sem.",
      },
      {
        question: 'Comment s\'inscrire en famille ?',
        answer: "Sur le tunnel 'Rejoindre la session' ou 'Camp sur mesure', tu trouves une option 'Tu viens avec ta famille ?'. Coche oui, indique le nombre d'enfants (1, 2 ou 3) et leurs ages. Le tarif total se calcule automatiquement (parent au tarif adulte + chaque enfant au tarif enfant).",
      },
      {
        question: "Comment l'enfant est-il encadre pendant les sessions ?",
        answer: "Un coach jeunesse forme a la pedagogie sportive des plus jeunes encadre les sessions enfants (Lutte enfants a 10h30 et 17h30). Ratio 1 coach pour 5 enfants maximum. Tapis olympiques homologues, salle dediee, pas de KO autorise, sparring controle. Briefing parents chaque fin de session, photos quotidiennes.",
      },
      {
        question: 'Le programme parent et le programme enfant sont-ils en parallele ?',
        answer: "Oui. Tu suis les sessions adultes (Lutte 10h30/17h30 ou MMA 11h00/18h00) pendant que ton enfant suit le programme Lutte enfants (10h30/17h30). Vous vous retrouvez aux repas, excursions et moments libres. Tu peux aussi assister aux sessions de ton enfant si tu le souhaites.",
      },
      {
        question: 'Quel age minimum/maximum pour les enfants ?',
        answer: "Minimum 8 ans, maximum 17 ans. En dessous de 8 ans, le camp est physiquement et culturellement trop intense. A partir de 18 ans, ton ado est inscrit comme adulte au tarif adulte (1 500 / 2 200 / 2 900 CHF selon duree).",
      },
      {
        question: 'Faut-il un certificat medical pour les enfants ?',
        answer: "Oui, certificat medical d'aptitude a la pratique sportive intensive obligatoire pour chaque enfant, etabli par le medecin traitant et date de moins de 6 mois avant le depart. Une autorisation parentale signee par le responsable legal est egalement requise.",
      },
    ],
  },
]

/** All FAQ items flattened - used for JSON-LD FAQPage schema */
export function getAllFaqItems(): FAQItem[] {
  return [
    ...FAQ_HOMEPAGE,
    ...FAQ_CATEGORIES.flatMap(c => c.items).filter(
      item => !FAQ_HOMEPAGE.some(h => h.question === item.question)
    ),
  ]
}
