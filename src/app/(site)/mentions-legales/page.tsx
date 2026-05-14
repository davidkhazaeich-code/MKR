import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions légales | MKR Caucasian Camp',
  description: "Mentions légales du site mkrcamp.com. Éditeur, hébergeur, responsable de publication, droits d'auteur.",
  alternates: { canonical: 'https://mkrcamp.com/mentions-legales' },
}

export default function MentionsLegalesPage() {
  return (
    <section className="legal-page">
      <div className="inner">
        <h1 className="legal-title">MENTIONS LÉGALES</h1>
        <div className="legal-content">
          <h2>Éditeur du site</h2>
          <p>MKR Caucasian Camp<br/>Adresse : [À compléter]<br/>Email : contact@mkrcamp.com<br/>Responsable de la publication : [À compléter]</p>

          <h2>Hébergement et sous-traitants techniques</h2>
          <p>Ce site est hébergé par Vercel Inc.<br/>440 N Bashaw St, Covina, CA 91723, USA<br/>Site web : vercel.com</p>
          <p>La base de données des candidatures et le stockage des données de formulaire sont assurés par Supabase (Supabase Inc., 970 Toa Payoh North #07-04, Singapore 318992). Le projet MKR est hébergé sur l&apos;infrastructure européenne de Supabase (région eu-central-1, Francfort, Allemagne). Voir la <a href="/politique-de-confidentialite">politique de confidentialité</a> pour le détail des sous-traitants et des transferts de données.</p>

          <h2>Propriété intellectuelle</h2>
          <p>L&apos;ensemble des contenus présents sur ce site (textes, images, vidéos, logos, éléments graphiques) sont la propriété exclusive de MKR Caucasian Camp, sauf mention contraire. Toute reproduction, représentation, modification, publication, distribution, retransmission ou exploitation de ces contenus est strictement interdite sans l&apos;autorisation écrite préalable de MKR Caucasian Camp.</p>

          <h2>Données personnelles</h2>
          <p>Les informations recueillies via les formulaires du site sont destinées exclusivement à MKR Caucasian Camp pour le traitement des candidatures et la communication avec les participants. Conformément au RGPD, tu disposes d&apos;un droit d&apos;accès, de rectification et de suppression de tes données. Pour le détail complet (données collectées, durée de conservation, sous-traitants, droits, contact DPO), consulte notre <a href="/politique-de-confidentialite">politique de confidentialité</a>. Pour exercer tes droits, écris à contact@mkrcamp.com.</p>

          <h2>Cookies</h2>
          <p>Ce site utilise des cookies techniques strictement nécessaires à son fonctionnement. Aucun cookie de tracking ou publicitaire n&apos;est utilisé sans ton consentement explicite.</p>

          <h2>Limitation de responsabilité</h2>
          <p>MKR Caucasian Camp s&apos;efforce de fournir des informations aussi précises que possible. Toutefois, nous ne pouvons garantir l&apos;exactitude, l&apos;exhaustivité et l&apos;actualité des informations diffusées sur ce site.</p>
        </div>
      </div>
    </section>
  )
}
