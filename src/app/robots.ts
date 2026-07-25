import type { MetadataRoute } from 'next';

/**
 * SOURCE UNIQUE du robots.txt.
 *
 * Il existait jusqu'au 2026-07-25 un `public/robots.txt` statique de 60 lignes
 * qui portait toute la politique de crawl IA. Il n'a JAMAIS ete servi : dans
 * l'App Router, ce Route Handler gagne sur le fichier statique de meme nom.
 * Verifie en prod : `curl https://mkrcamp.com/robots.txt` ne renvoyait que les
 * 5 regles d'origine. Les `Disallow` censes bloquer les aspirateurs
 * d'entrainement etaient donc inoperants depuis leur ecriture.
 *
 * Le fichier statique a ete supprime et sa politique reprise ici.
 *
 * Politique : on OUVRE aux robots de recherche generative (canal d'acquisition
 * reel pour ce business, cf. axe GEO) et on FERME aux collecteurs qui ne
 * servent qu'a entrainer des modeles sans jamais renvoyer de trafic.
 */

/** Moteurs de recherche IA : ils citent la source et renvoient du trafic. */
const AI_SEARCH_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
];

/** Collecte pour entrainement uniquement : aucun trafic en retour. */
const AI_TRAINING_ONLY_BOTS = [
  'CCBot',
  'anthropic-ai',
  'cohere-ai',
  'Bytespider',
  'Amazonbot',
  'Diffbot',
  'meta-externalagent',
  'FacebookBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/en/'],
        disallow: ['/admin/', '/api/', '/merci', '/en/thank-you'],
      },
      {
        userAgent: AI_SEARCH_BOTS,
        allow: ['/', '/en/'],
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: AI_TRAINING_ONLY_BOTS,
        disallow: ['/'],
      },
    ],
    sitemap: 'https://mkrcamp.com/sitemap.xml',
  };
}
