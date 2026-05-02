import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de confidentialité | MKR Caucasian Camp',
  description: "Politique de confidentialité de MKR Caucasian Camp. Collecte, utilisation et protection de tes données personnelles.",
  alternates: { canonical: 'https://mkrcaucasiancamp.com/politique-de-confidentialite' },
}

export default function PolitiqueConfidentialitePage() {
  return (
    <section className="legal-page">
      <div className="inner">
        <h1 className="legal-title">POLITIQUE DE CONFIDENTIALITÉ</h1>
        <div className="legal-content">
          <h2>Introduction</h2>
          <p>MKR Caucasian Camp s&apos;engage à protéger la vie privée de ses utilisateurs. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons tes données personnelles.</p>

          <h2>Données collectées</h2>
          <p>Nous collectons les données suivantes via nos formulaires :</p>
          <ul>
            <li>Nom, prénom, date de naissance</li>
            <li>Adresse email, numéro de téléphone</li>
            <li>Pays et ville de départ</li>
            <li>Informations sportives (discipline, niveau, expérience, club, palmarès, lien vidéo si fourni)</li>
            <li>Informations de santé pertinentes pour la pratique sportive (conditions, blessures, contre-indications)</li>
            <li>Préférences logistiques (tunnel d&apos;inscription, session, durée, dates souhaitées)</li>
            <li>Composition familiale ou de groupe le cas échéant (ex. âge des enfants pour le tunnel famille)</li>
          </ul>

          <p>Lors de la soumission du formulaire d&apos;inscription, nous enregistrons également deux métadonnées techniques pour des finalités de sécurité (détection d&apos;automatisation, anti-spam, traçabilité forensique en cas d&apos;incident) :</p>
          <ul>
            <li>L&apos;adresse IP de la requête (extraite de l&apos;en-tête <code>X-Forwarded-For</code>)</li>
            <li>L&apos;identifiant du navigateur (<code>User-Agent</code>)</li>
          </ul>
          <p>Ces deux métadonnées sont stockées avec ta candidature et conservées dans les mêmes conditions et durées que les autres données du formulaire (cf. section Conservation).</p>

          <h2>Utilisation des données</h2>
          <p>Tes données sont utilisées exclusivement pour :</p>
          <ul>
            <li>Traiter ta candidature au camp</li>
            <li>Te contacter dans le cadre du processus d&apos;inscription</li>
            <li>Préparer ton séjour (informations logistiques, médicales)</li>
            <li>T&apos;envoyer des informations sur les prochaines sessions (avec ton consentement)</li>
            <li>Détecter les soumissions automatisées et prévenir les abus du formulaire (IP et User-Agent uniquement)</li>
          </ul>

          <h2>Conservation des données</h2>
          <p>Tes données sont conservées pendant la durée nécessaire au traitement de ta candidature, et au maximum 3 ans après ton dernier contact avec MKR Caucasian Camp. À l&apos;issue de ce délai, elles sont supprimées de notre base. Tu peux à tout moment demander leur suppression anticipée (cf. Tes droits).</p>

          <h2>Hébergement et sous-traitants</h2>
          <p>Pour exploiter le formulaire d&apos;inscription et le tableau de bord interne, nous nous appuyons sur les sous-traitants suivants :</p>
          <ul>
            <li><strong>Supabase</strong> (Supabase, Inc., États-Unis) — hébergement de la base de données PostgreSQL des candidatures. Nos données sont stockées sur l&apos;infrastructure européenne (région <code>eu-central-1</code>, Francfort, Allemagne). Les transferts éventuels vers les États-Unis sont encadrés par les Clauses Contractuelles Types de la Commission européenne (SCC). Politique : <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">supabase.com/privacy</a></li>
            <li><strong>Vercel</strong> (Vercel, Inc., États-Unis) — hébergement de l&apos;application web et des routes serveur. Politique : <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">vercel.com/legal/privacy-policy</a></li>
          </ul>

          <h2>Partage des données</h2>
          <p>Tes données ne sont jamais vendues à des tiers. Elles peuvent être partagées avec nos partenaires logistiques (hébergement sur place, transport) dans le strict cadre de l&apos;organisation de ton séjour.</p>

          <h2>Tes droits</h2>
          <p>Conformément au RGPD, tu disposes des droits suivants :</p>
          <ul>
            <li>Droit d&apos;accès à tes données</li>
            <li>Droit de rectification</li>
            <li>Droit à l&apos;effacement</li>
            <li>Droit à la portabilité</li>
            <li>Droit d&apos;opposition au traitement</li>
          </ul>
          <p>Pour exercer ces droits, contacte-nous à contact@mkrcaucasiancamp.com.</p>

          <h2>Sécurité</h2>
          <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger tes données contre tout accès non autorisé, modification, divulgation ou destruction.</p>
        </div>
      </div>
    </section>
  )
}
