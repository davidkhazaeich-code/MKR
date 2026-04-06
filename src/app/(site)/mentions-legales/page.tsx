import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions legales | MKR Caucasian Camp',
  description: "Mentions legales du site mkrcaucasiancamp.com. Editeur, hebergeur, responsable de publication, droits d'auteur.",
  alternates: { canonical: 'https://mkrcaucasiancamp.com/mentions-legales' },
}

export default function MentionsLegalesPage() {
  return (
    <section className="legal-page">
      <div className="inner">
        <h1 className="legal-title">MENTIONS LEGALES</h1>
        <div className="legal-content">
          <h2>Editeur du site</h2>
          <p>MKR Caucasian Camp<br/>Adresse : [A completer]<br/>Email : contact@mkrcaucasiancamp.com<br/>Responsable de la publication : [A completer]</p>

          <h2>Hebergement</h2>
          <p>Ce site est heberge par Vercel Inc.<br/>440 N Bashaw St, Covina, CA 91723, USA<br/>Site web : vercel.com</p>

          <h2>Propriete intellectuelle</h2>
          <p>L&apos;ensemble des contenus presents sur ce site (textes, images, videos, logos, elements graphiques) sont la propriete exclusive de MKR Caucasian Camp, sauf mention contraire. Toute reproduction, representation, modification, publication, distribution, retransmission, ou exploitation de ces contenus est strictement interdite sans l&apos;autorisation ecrite prealable de MKR Caucasian Camp.</p>

          <h2>Donnees personnelles</h2>
          <p>Les informations recueillies via les formulaires du site sont destinees exclusivement a MKR Caucasian Camp pour le traitement des candidatures et la communication avec les participants. Conformement au RGPD, vous disposez d&apos;un droit d&apos;acces, de rectification et de suppression de vos donnees. Pour exercer ce droit, contactez-nous a contact@mkrcaucasiancamp.com.</p>

          <h2>Cookies</h2>
          <p>Ce site utilise des cookies techniques strictement necessaires a son fonctionnement. Aucun cookie de tracking ou publicitaire n&apos;est utilise sans votre consentement explicite.</p>

          <h2>Limitation de responsabilite</h2>
          <p>MKR Caucasian Camp s&apos;efforce de fournir des informations aussi precises que possible. Toutefois, nous ne pouvons garantir l&apos;exactitude, la completude et l&apos;actualite des informations diffusees sur ce site.</p>
        </div>
      </div>
    </section>
  )
}
