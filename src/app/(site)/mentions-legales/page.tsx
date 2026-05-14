import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Mentions légales | MKR Caucasian Camp',
  description: "Mentions légales du site mkrcamp.com édité par MKR Caucasian Camp (France). Éditeur, hébergeur, responsable de publication, propriété intellectuelle, RGPD.",
  path: '/mentions-legales',
})
export default function MentionsLegalesPage() {
  return (
    <section className="legal-page">
      <div className="inner">
        <h1 className="legal-title">MENTIONS LÉGALES</h1>
        <p className="legal-intro">
          Conformément aux dispositions des articles 6-III et 19 de la Loi n° 2004-575 du 21 juin 2004 pour la confiance dans l&apos;économie numérique (LCEN),
          nous informons les utilisateurs et visiteurs du site <a href="https://mkrcamp.com">mkrcamp.com</a> des informations suivantes.
        </p>

        <div className="legal-content">
          <h2>1. Éditeur du site</h2>
          <p>
            <strong>MKR Caucasian Camp</strong><br/>
            Activité : organisation de camps d&apos;entraînement sportif (Lutte au Daghestan, MMA en Tchétchénie)<br/>
            Pays d&apos;immatriculation : France<br/>
            Forme juridique et numéro SIRET : <em>à confirmer par MKR — sera renseigné dès l&apos;obtention du Kbis ou de l&apos;avis de situation Insee</em><br/>
            Siège social : <em>adresse à confirmer par MKR</em><br/>
            Email : <a href="mailto:contact@mkrcamp.com">contact@mkrcamp.com</a><br/>
            Téléphone / WhatsApp : <a href="https://wa.me/33666177691" target="_blank" rel="noopener noreferrer">+33 6 66 17 76 91</a>
          </p>

          <h2>2. Directeur de la publication</h2>
          <p>
            Ruslan Mukhtarov, fondateur de MKR Caucasian Camp, ancien équipe de France de lutte (INSEP 2012-2016).<br/>
            Contact : <a href="mailto:contact@mkrcamp.com">contact@mkrcamp.com</a>
          </p>

          <h2>3. Hébergeur du site</h2>
          <p>
            <strong>Vercel Inc.</strong><br/>
            440 N Bashaw St, Covina, CA 91723, États-Unis<br/>
            Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a>
          </p>

          <h2>4. Sous-traitants techniques</h2>
          <p>
            Le site fait appel à des prestataires tiers pour son fonctionnement. Conformément à l&apos;article 28 du Règlement général sur la protection des données (RGPD),
            ces sous-traitants traitent les données pour le compte de MKR Caucasian Camp dans le cadre strict défini par contrat.
          </p>
          <ul>
            <li>
              <strong>Vercel Inc.</strong> (États-Unis) : hébergement du site web et diffusion via réseau CDN.
              Les transferts vers les États-Unis sont encadrés par les clauses contractuelles types de la Commission européenne.
            </li>
            <li>
              <strong>Supabase Inc.</strong> (Singapore) : base de données des candidatures.
              Le projet MKR est hébergé sur l&apos;infrastructure européenne de Supabase, en région eu-central-1 (Francfort, Allemagne), ce qui garantit le stockage des données dans l&apos;Union européenne.
            </li>
          </ul>
          <p>
            Voir la <a href="/politique-de-confidentialite">politique de confidentialité</a> pour le détail complet des traitements et des transferts.
          </p>

          <h2>5. Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des contenus présents sur ce site (textes, images, photographies, vidéos, logos, marques, graphismes, mise en page, code source)
            sont la propriété exclusive de MKR Caucasian Camp ou de ses partenaires, sauf mention contraire explicite.
            Ils sont protégés par le droit d&apos;auteur (articles L111-1 et suivants du Code de la propriété intellectuelle) et par le droit des marques.
          </p>
          <p>
            Toute reproduction, représentation, modification, publication, distribution, retransmission ou exploitation, intégrale ou partielle, de ces contenus, sur quelque support que ce soit,
            sans l&apos;autorisation écrite préalable de MKR Caucasian Camp, est strictement interdite et constituerait une contrefaçon sanctionnée par les articles L335-2 et suivants du Code de la propriété intellectuelle.
          </p>

          <h2>6. Données personnelles et RGPD</h2>
          <p>
            Les informations recueillies via les formulaires du site (candidature, contact, demande de guide) sont traitées par MKR Caucasian Camp pour le traitement des candidatures, la communication avec les participants et l&apos;organisation des camps.
          </p>
          <p>
            Conformément au Règlement (UE) 2016/679 du 27 avril 2016 (RGPD) et à la Loi Informatique et Libertés modifiée, tu disposes des droits suivants sur tes données personnelles :
            droit d&apos;accès, droit de rectification, droit à l&apos;effacement, droit à la limitation du traitement, droit à la portabilité et droit d&apos;opposition.
          </p>
          <p>
            Pour exercer ces droits ou pour toute question relative au traitement de tes données, contacte-nous à <a href="mailto:contact@mkrcamp.com">contact@mkrcamp.com</a>.
            Tu disposes également du droit d&apos;introduire une réclamation auprès de la Commission nationale de l&apos;informatique et des libertés (CNIL), <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>.
          </p>
          <p>
            Le détail complet des données collectées, de leur durée de conservation, des sous-traitants et de tes droits est disponible dans notre <a href="/politique-de-confidentialite">politique de confidentialité</a>.
          </p>

          <h2>7. Cookies</h2>
          <p>
            Ce site utilise uniquement des cookies techniques strictement nécessaires à son fonctionnement (session, sécurité, préférences de navigation).
            Conformément à l&apos;article 82 de la Loi Informatique et Libertés modifiée et aux recommandations de la CNIL,
            aucun cookie de tracking, de mesure d&apos;audience tiers ou de publicité ciblée n&apos;est utilisé sans ton consentement explicite préalable.
          </p>

          <h2>8. Limitation de responsabilité</h2>
          <p>
            MKR Caucasian Camp s&apos;efforce de fournir sur ce site des informations aussi précises et à jour que possible.
            Toutefois, MKR Caucasian Camp ne peut garantir l&apos;exactitude, l&apos;exhaustivité et l&apos;actualité des informations diffusées,
            ni l&apos;absence de modification de ces informations par un tiers (intrusion non autorisée).
          </p>
          <p>
            Les liens hypertextes mis en place dans le cadre du site en direction d&apos;autres ressources présentes sur le réseau Internet ne sauraient engager la responsabilité de MKR Caucasian Camp.
          </p>

          <h2>9. Droit applicable et juridiction</h2>
          <p>
            Les présentes mentions légales sont régies par le droit français. Tout litige relatif au site ou à son contenu sera soumis à la compétence des tribunaux français,
            dans les conditions de droit commun. Pour les consommateurs, les tribunaux compétents sont ceux du lieu de résidence du consommateur,
            conformément aux articles L211-3 et suivants du Code de la consommation.
          </p>

          <p className="legal-updated" style={{ marginTop: '2.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Dernière mise à jour : <time dateTime="2026-05-14">14 mai 2026</time>.
          </p>
        </div>
      </div>
    </section>
  )
}
