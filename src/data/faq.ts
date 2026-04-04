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
    question: 'Le visa est-il nécessaire pour la Géorgie ?',
    answer: "Les ressortissants de l'UE, Suisse, France et Canada n'ont pas besoin de visa pour la Géorgie pour des séjours inférieurs à 365 jours. L'entrée se fait avec le passeport.",
  },
  {
    question: "Qu'est-ce qui est inclus dans le prix ?",
    answer: "Le tarif comprend l'hébergement en logement de camp, les repas (3 repas/jour), les séances d'entraînement biquotidiennes, les transferts aéroport-camp, et le suivi préparatoire à distance. Le vol international n'est pas inclus.",
  },
  {
    question: "Quelle est la langue d'entraînement ?",
    answer: "Les entraînements se déroulent principalement en géorgien et en russe. Un interprète est présent pour le français et l'anglais. L'immersion linguistique fait partie de l'expérience.",
  },
  {
    question: 'Quel équipement dois-je apporter ?',
    answer: "Kimono (si tu pratiques la lutte), gants de boxe (16 oz), protège-tibias, protège-dents et coquille. Un guide complet de préparation est envoyé après confirmation de ta candidature.",
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
        question: 'Le visa est-il necessaire pour la Georgie ?',
        answer: "Les ressortissants de l'UE, Suisse, France et Canada n'ont pas besoin de visa pour la Georgie pour des sejours inferieurs a 365 jours. L'entree se fait avec le passeport.",
      },
      {
        question: "Qu'est-ce qui est inclus dans le prix ?",
        answer: "Le tarif comprend l'hebergement en logement de camp, les repas (3 repas/jour), les seances d'entrainement biquotidiennes, les transferts aeroport-camp, et le suivi preparatoire a distance. Le vol international n'est pas inclus.",
      },
      {
        question: 'Quel equipement dois-je apporter ?',
        answer: "Kimono (si tu pratiques la lutte), gants de boxe (16 oz), protege-tibias, protege-dents et coquille. Un guide complet de preparation est envoye apres confirmation de ta candidature.",
      },
      {
        question: "Comment se passe le transfert depuis l'aeroport ?",
        answer: "Le transfert aeroport-camp est inclus dans le prix. Un vehicule MKR t'attend a l'arrivee. Le trajet dure environ 2-3 heures selon la destination.",
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
        answer: "Les entrainements se deroulent principalement en georgien et en russe. Un interprete est present pour le francais et l'anglais. L'immersion linguistique fait partie de l'experience.",
      },
      {
        question: 'Combien de participants par session ?',
        answer: 'Maximum 15 participants par session pour garantir un suivi individualise. Les places sont limitees volontairement. La selection est reelle.',
      },
      {
        question: 'Puis-je choisir entre MMA et lutte ?',
        answer: "Le programme inclut les deux disciplines. Tu participes aux sessions de MMA et de lutte selon le planning. C'est la polyvalence qui forge les meilleurs combattants.",
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
        answer: "Oui, tarif degressif a partir de 5 personnes. Contacte-nous directement par WhatsApp ou email pour un devis personnalise.",
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
