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
    answer: "Maximum 15 participants par session pour un suivi individualisé. Les places sont limitées volontairement. La sélection est réelle.",
  },
  {
    question: "Quelles sont les dates des prochains camps ?",
    answer: "Quatre sessions officielles par an, calées sur les vacances scolaires francophones. Été 2026 : 17 août - 5 septembre. Toussaint 2026 : 17 octobre - 7 novembre. Hiver 2027 : 13 février - 6 mars. Pâques 2027 : 3 - 24 avril. Toutes au Daghestan, 3 semaines, 15 places max, 2 900 € adulte tout compris.",
  },
]

/** Full FAQ page - categorized questions for the /faq page */
export const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: 'securite',
    label: 'Sécurité',
    items: [
      {
        question: 'Est-ce que le Daghestan est sûr ?',
        answer: "La région où se déroule le camp est stable et fréquentée par des athlètes du monde entier. Nous suivons en permanence les recommandations du Quai d'Orsay et du DFAE. Un protocole de sécurité MKR est en place : contacts d'urgence 24/7, assurance rapatriement recommandée, équipe locale présente en permanence.",
      },
      {
        question: 'Dois-je souscrire une assurance voyage ?',
        answer: "Oui, c'est obligatoire. Ton assurance doit couvrir le rapatriement médical et la pratique de sports de contact. Nous recommandons des prestataires comme Chapka, ACS ou World Nomads. Le détail est envoyé après validation de ta candidature.",
      },
      {
        question: 'Y a-t-il un accompagnateur francophone sur place ?',
        answer: "Oui. Un membre de l'équipe MKR francophone est présent pendant toute la durée du camp. Un interprète local assure également la traduction pendant les entraînements.",
      },
    ],
  },
  {
    id: 'logistique',
    label: 'Logistique',
    items: [
      {
        question: 'Le visa est-il nécessaire ?',
        answer: "Le camp se déroule au Daghestan (Fédération de Russie). Un visa russe est nécessaire pour la majorité des nationalités. Pour les ressortissants UE, MKR fournit un questionnaire visa à compléter avec ton passeport (validité 6 mois minimum) et t'accompagne dans toute la procédure après confirmation de ta candidature.",
      },
      {
        question: "Qu'est-ce qui est inclus dans le prix ?",
        answer: "Le tarif comprend l'hébergement en logement de camp, les repas (2 repas/jour), les séances d'entraînement biquotidiennes, le vol intérieur Istanbul-Makhachkala, les transferts aéroport-camp et le suivi préparatoire à distance. Le vol international n'est pas inclus.",
      },
      {
        question: 'Quel équipement dois-je apporter ?',
        answer: "Gants de boxe (16 oz), protège-tibias, protège-dents et coquille. Un guide complet de préparation est envoyé après confirmation de ta candidature.",
      },
      {
        question: "Comment se passe le transfert depuis l'aéroport ?",
        answer: "Le transfert aéroport-camp est inclus dans le prix. Un véhicule MKR t'attend à l'arrivée. Le trajet entre Makhachkala et le lieu d'entraînement dure environ 1h30.",
      },
    ],
  },
  {
    id: 'entrainement',
    label: 'Entraînement',
    items: [
      {
        question: 'Quel niveau est requis pour participer ?',
        answer: "Le camp est ouvert aux pratiquants intermédiaires et avancés. Une pratique régulière d'au moins 2 ans en MMA, lutte ou art martial de combat est requise. Le niveau est évalué lors de l'entretien vidéo.",
      },
      {
        question: "Quelle est la langue d'entraînement ?",
        answer: "Les entraînements se déroulent principalement en russe (et quelques mots d'avar selon la salle). Un interprète est présent pour le français et l'anglais. L'immersion linguistique fait partie de l'expérience.",
      },
      {
        question: 'Combien de participants par session ?',
        answer: 'Maximum 15 participants par session pour un suivi individualisé. Les places sont limitées volontairement. La sélection est réelle.',
      },
      {
        question: 'Puis-je choisir entre MMA, lutte adultes et lutte enfants ?',
        answer: "Oui. Le camp propose 3 disciplines : Lutte adultes, Lutte enfants et MMA. Tu choisis ta discipline à l'inscription. Lutte adultes et enfants : sessions à 10h30 et 17h30. MMA : sessions à 11h00 et 18h00.",
      },
      {
        question: 'Y a-t-il des jours de repos ?',
        answer: "Un jour de repos par semaine est prévu, généralement consacré à une excursion culturelle ou une randonnée en montagne. Le reste du temps, c'est entraînement biquotidien.",
      },
    ],
  },
  {
    id: 'inscription',
    label: 'Inscription',
    items: [
      {
        question: "Comment fonctionne le processus d'inscription ?",
        answer: "1. Tu remplis le formulaire en ligne (5 minutes). 2. On te rappelle sous 48h pour un entretien de validation. 3. Si ta candidature est acceptée, tu verses un acompte de 30%. 4. Tu reçois le guide de préparation. 5. Le solde est dû 30 jours avant le départ.",
      },
      {
        question: 'Puis-je annuler après inscription ?',
        answer: "Oui. Annulation gratuite jusqu'à 60 jours avant le départ (remboursement 100%). Entre 30 et 60 jours : remboursement 50%. Moins de 30 jours : non remboursable. Détail complet dans nos CGV.",
      },
      {
        question: 'Quels moyens de paiement acceptez-vous ?',
        answer: "Virement bancaire, carte bancaire (via Stripe) et PayPal. Le paiement se fait en euros (EUR).",
      },
      {
        question: 'Je viens avec mon club, y a-t-il un tarif groupe ?',
        answer: "Le tarif par tête reste identique au tarif individuel : pas de remise. L'avantage du groupe : réservation simultanée, hébergement bloc, transferts groupés, programme adapté au niveau collectif. Le tunnel Club et Groupe est réservé aux groupes organisés de 5 à 20 personnes. Pour 1 à 4 amis adultes, prends Sur Mesure.",
      },
      {
        question: "Quels sont les 4 types d'inscription ?",
        answer: "1. Sessions officielles (quatre par an : Été 17 août - 5 sept 2026, Toussaint 17 oct - 7 nov 2026, Hiver 13 fév - 6 mars 2027, Pâques 3 - 24 avril 2027 ; adultes uniquement, groupe constitué par MKR, 3 semaines fixes, dates calées sur les vacances scolaires francophones). 2. Sur Mesure (tes dates, 1 à 4 adultes, 1/2/3 semaines, délai 90 jours minimum). 3. Famille (parent + enfant 8-17 ans, choix entre rejoindre une session officielle ou sur mesure). 4. Club et Groupe (5 à 20 personnes, club ou groupe organisé, dates au choix, devis sur mesure). Tarifs publics fixes identiques pour les 4 tunnels.",
      },
      {
        question: "Quelles sont les 4 sessions officielles 2026 / 2027 ?",
        answer: "Quatre sessions par an, calées sur les vacances scolaires des trois zones françaises, suisses romandes et belges, pour permettre aux pratiquants francophones (et aux familles) de partir sans poser de congés. Été 2026 : 17 août - 5 septembre 2026 (3 sem, vacances été). Toussaint 2026 : 17 octobre - 7 novembre 2026 (3 sem, Toussaint FR + octobre CH + Toussaint BE). Hiver 2027 : 13 février - 6 mars 2027 (3 sem, vacances d'hiver zones A/B/C FR + relâche CH + carnaval BE). Pâques 2027 : 3 - 24 avril 2027 (3 sem, vacances de printemps FR + Pâques CH + BE). Toutes au Daghestan, 15 places max, 2 900 € / adulte / 3 semaines tout compris.",
      },
      {
        question: 'Quel est le délai minimum pour réserver un camp sur mesure ?',
        answer: "90 jours minimum avant la date de début souhaitée. Ce délai permet de gérer le visa russe (3 à 4 semaines), réserver un vol international à un bon prix, et compléter la préparation physique de 6 semaines. Pour les camps sur dates fixes (session officielle), inscription jusqu'à 30 jours avant le départ.",
      },
    ],
  },
  {
    id: 'familles',
    label: 'Familles et Jeunesse',
    items: [
      {
        question: 'Mon enfant peut-il venir au camp ?',
        answer: "Oui, dès 8 ans, mais il doit obligatoirement être accompagné d'un parent participant au camp. C'est notre règle de sécurité : pas de prise en charge enfant seul. Tarif enfant 8-17 ans fixe : 1 000 € / 1 sem, 1 400 € / 2 sem, 1 900 € / 3 sem.",
      },
      {
        question: "Comment s'inscrire en famille ?",
        answer: "Sur le tunnel Rejoindre la session ou Camp sur mesure, tu trouves une option « Tu viens avec ta famille ? ». Coche oui, indique le nombre d'enfants (1, 2 ou 3) et leurs âges. Le tarif total se calcule automatiquement (parent au tarif adulte + chaque enfant au tarif enfant).",
      },
      {
        question: "Comment l'enfant est-il encadré pendant les sessions ?",
        answer: "Un coach jeunesse formé à la pédagogie sportive des plus jeunes encadre les sessions enfants (Lutte enfants à 10h30 et 17h30). Ratio 1 coach pour 5 enfants maximum. Tapis olympiques homologués, salle dédiée, pas de KO autorisé, sparring contrôlé. Briefing parents chaque fin de session, photos quotidiennes.",
      },
      {
        question: 'Le programme parent et le programme enfant sont-ils en parallèle ?',
        answer: "Oui. Tu suis les sessions adultes (Lutte 10h30/17h30 ou MMA 11h00/18h00) pendant que ton enfant suit le programme Lutte enfants (10h30/17h30). Vous vous retrouvez aux repas, excursions et moments libres. Tu peux aussi assister aux sessions de ton enfant si tu le souhaites.",
      },
      {
        question: 'Quel âge minimum et maximum pour les enfants ?',
        answer: "Minimum 8 ans, maximum 17 ans. En dessous de 8 ans, le camp est physiquement et culturellement trop intense. À partir de 18 ans, ton ado est inscrit comme adulte au tarif adulte (1 500 / 2 200 / 2 900 € selon durée).",
      },
      {
        question: 'Faut-il un certificat médical pour les enfants ?',
        answer: "Oui, certificat médical d'aptitude à la pratique sportive intensive obligatoire pour chaque enfant, établi par le médecin traitant et daté de moins de 6 mois avant le départ. Une autorisation parentale signée par le responsable légal est également requise.",
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
