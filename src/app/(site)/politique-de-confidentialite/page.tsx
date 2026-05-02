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
            <li>Informations sportives (discipline, niveau, expérience)</li>
            <li>Informations de santé pertinentes pour la pratique sportive</li>
            <li>Préférences logistiques (session, dates)</li>
          </ul>

          <h2>Utilisation des données</h2>
          <p>Tes données sont utilisées exclusivement pour :</p>
          <ul>
            <li>Traiter ta candidature au camp</li>
            <li>Te contacter dans le cadre du processus d&apos;inscription</li>
            <li>Préparer ton séjour (informations logistiques, médicales)</li>
            <li>T&apos;envoyer des informations sur les prochaines sessions (avec ton consentement)</li>
          </ul>

          <h2>Conservation des données</h2>
          <p>Tes données sont conservées pendant la durée nécessaire au traitement de ta candidature, et au maximum 3 ans après ton dernier contact avec MKR Caucasian Camp.</p>

          <h2>Partage des données</h2>
          <p>Tes données ne sont jamais vendues à des tiers. Elles peuvent être partagées avec nos partenaires logistiques (hébergement, transport) dans le strict cadre de l&apos;organisation de ton séjour.</p>

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
