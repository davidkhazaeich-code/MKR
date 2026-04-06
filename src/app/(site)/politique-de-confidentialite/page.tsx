import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de confidentialite | MKR Caucasian Camp',
  description: "Politique de confidentialite de MKR Caucasian Camp. Collecte, utilisation et protection de vos donnees personnelles.",
  alternates: { canonical: 'https://mkrcaucasiancamp.com/politique-de-confidentialite' },
}

export default function PolitiqueConfidentialitePage() {
  return (
    <section className="legal-page">
      <div className="inner">
        <h1 className="legal-title">POLITIQUE DE CONFIDENTIALITE</h1>
        <div className="legal-content">
          <h2>Introduction</h2>
          <p>MKR Caucasian Camp s&apos;engage a proteger la vie privee de ses utilisateurs. Cette politique de confidentialite explique comment nous collectons, utilisons et protegeons vos donnees personnelles.</p>

          <h2>Donnees collectees</h2>
          <p>Nous collectons les donnees suivantes via nos formulaires :</p>
          <ul>
            <li>Nom, prenom, date de naissance</li>
            <li>Adresse email, numero de telephone</li>
            <li>Informations sportives (discipline, niveau, experience)</li>
            <li>Informations de sante pertinentes pour la pratique sportive</li>
            <li>Preferences logistiques (session, dates)</li>
          </ul>

          <h2>Utilisation des donnees</h2>
          <p>Vos donnees sont utilisees exclusivement pour :</p>
          <ul>
            <li>Traiter votre candidature au camp</li>
            <li>Vous contacter dans le cadre du processus d&apos;inscription</li>
            <li>Preparer votre sejour (informations logistiques, medicales)</li>
            <li>Vous envoyer des informations sur les prochaines sessions (avec votre consentement)</li>
          </ul>

          <h2>Conservation des donnees</h2>
          <p>Vos donnees sont conservees pendant la duree necessaire au traitement de votre candidature, et au maximum 3 ans apres votre dernier contact avec MKR Caucasian Camp.</p>

          <h2>Partage des donnees</h2>
          <p>Vos donnees ne sont jamais vendues a des tiers. Elles peuvent etre partagees avec nos partenaires logistiques (hebergement, transport) dans le strict cadre de l&apos;organisation de votre sejour.</p>

          <h2>Vos droits</h2>
          <p>Conformement au RGPD, vous disposez des droits suivants :</p>
          <ul>
            <li>Droit d&apos;acces a vos donnees</li>
            <li>Droit de rectification</li>
            <li>Droit a l&apos;effacement</li>
            <li>Droit a la portabilite</li>
            <li>Droit d&apos;opposition au traitement</li>
          </ul>
          <p>Pour exercer ces droits, contactez-nous a contact@mkrcaucasiancamp.com.</p>

          <h2>Securite</h2>
          <p>Nous mettons en oeuvre des mesures techniques et organisationnelles appropriees pour proteger vos donnees contre tout acces non autorise, modification, divulgation ou destruction.</p>
        </div>
      </div>
    </section>
  )
}
