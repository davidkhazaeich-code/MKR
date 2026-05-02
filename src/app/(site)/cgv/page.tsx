import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CGV | MKR Caucasian Camp | Conditions Générales de Vente',
  description: "Conditions générales de vente de MKR Caucasian Camp. Modalités d'inscription, paiement, annulation et remboursement.",
  alternates: { canonical: 'https://mkrcamp.com/cgv' },
}

export default function CGVPage() {
  return (
    <section className="legal-page">
      <div className="inner">
        <h1 className="legal-title">CONDITIONS GÉNÉRALES DE VENTE</h1>
        <div className="legal-content">
          <h2>Article 1 : Objet</h2>
          <p>Les présentes conditions générales de vente (CGV) régissent les relations contractuelles entre MKR Caucasian Camp (ci-après &laquo; l&apos;Organisateur &raquo;) et toute personne physique (ci-après &laquo; le Participant &raquo;) souhaitant participer à un camp d&apos;entraînement organisé par MKR Caucasian Camp.</p>

          <h2>Article 2 : Inscription et validation</h2>
          <p>L&apos;inscription se fait via le formulaire en ligne sur mkrcamp.com. Toute candidature est soumise à validation par l&apos;équipe MKR lors d&apos;un entretien téléphonique ou vidéo. L&apos;Organisateur se réserve le droit de refuser toute candidature sans justification.</p>

          <h2>Article 3 : Tarifs et paiement</h2>
          <p>Les tarifs sont indiqués en euros (EUR) sur la page Sessions du site. Le paiement s&apos;effectue en deux temps :</p>
          <ul>
            <li>Acompte de 30% à la confirmation de la candidature</li>
            <li>Solde de 70% au plus tard 30 jours avant le début du camp</li>
          </ul>
          <p>Moyens de paiement acceptés : virement bancaire, carte bancaire (Stripe), PayPal.</p>

          <h2>Article 4 : Politique d&apos;annulation</h2>
          <ul>
            <li>Plus de 60 jours avant le début : remboursement intégral (100%)</li>
            <li>Entre 30 et 60 jours : remboursement partiel (50%)</li>
            <li>Moins de 30 jours : aucun remboursement</li>
          </ul>
          <p>Le report sur une session ultérieure est possible sous réserve de disponibilité, si la demande est faite plus de 60 jours avant le début du camp.</p>

          <h2>Article 5 : Prestations incluses</h2>
          <p>Le tarif du camp comprend :</p>
          <ul>
            <li>Hébergement en logement de camp</li>
            <li>2 repas par jour (petit-déjeuner et déjeuner)</li>
            <li>Sessions d&apos;entraînement biquotidiennes (6 jours par semaine)</li>
            <li>Vol intérieur Istanbul-Makhachkala</li>
            <li>Transferts aéroport-camp</li>
            <li>Excursions culturelles (en option)</li>
            <li>Suivi préparatoire à distance avant le départ</li>
          </ul>

          <h2>Article 6 : Prestations non incluses</h2>
          <ul>
            <li>Vol international aller-retour</li>
            <li>Visa (si applicable)</li>
            <li>Assurance voyage (obligatoire)</li>
            <li>Équipement personnel</li>
            <li>Dépenses personnelles</li>
          </ul>

          <h2>Article 7 : Assurance</h2>
          <p>Le Participant est tenu de souscrire une assurance voyage couvrant le rapatriement médical et la pratique de sports de contact avant le départ. La preuve d&apos;assurance doit être fournie à l&apos;Organisateur au plus tard 15 jours avant le départ.</p>

          <h2>Article 8 : Responsabilité</h2>
          <p>Le Participant reconnaît participer au camp de sa propre initiative et en pleine connaissance des risques liés à la pratique de sports de combat. L&apos;Organisateur décline toute responsabilité en cas de blessure survenue lors des entraînements ou activités annexes.</p>

          <h2>Article 9 : Droit à l&apos;image</h2>
          <p>Le Participant autorise l&apos;Organisateur à utiliser les photos et vidéos prises pendant le camp à des fins de communication et de promotion, sauf opposition écrite préalable. Pour les mineurs, l&apos;autorisation est donnée par le responsable légal lors de l&apos;inscription.</p>

          <h2>Article 10 : Mineurs et autorisation parentale</h2>
          <p>Les enfants et adolescents de 8 à 17 ans sont admis au camp <strong>uniquement accompagnés d&apos;un parent ou responsable légal participant lui-même au camp</strong>. L&apos;Organisateur n&apos;assure pas la prise en charge d&apos;un mineur seul.</p>
          <p>L&apos;inscription d&apos;un mineur nécessite :</p>
          <ul>
            <li>Une autorisation parentale signée par le responsable légal au moment de l&apos;inscription</li>
            <li>Un certificat médical d&apos;aptitude à la pratique sportive intensive datant de moins de 6 mois avant le départ, établi par le médecin traitant</li>
            <li>Une copie du passeport du mineur (validité minimum 6 mois après la date de retour)</li>
            <li>Une procuration médicale autorisant l&apos;Organisateur et son équipe médicale locale à prendre les mesures d&apos;urgence nécessaires</li>
            <li>L&apos;assurance voyage doit explicitement couvrir le mineur, le rapatriement médical et la pratique de sports de contact pour mineurs</li>
          </ul>
          <p>Le parent ou responsable légal accompagnant demeure pleinement responsable du mineur pendant toute la durée du séjour, y compris en dehors des sessions d&apos;entraînement encadrées par MKR. L&apos;Organisateur fournit un encadrement spécialisé pendant les sessions Lutte enfants (coach jeunesse dédié, ratio 1 coach pour 5 enfants maximum, supervision constante).</p>

          <h2>Article 11 : Droit applicable</h2>
          <p>Les présentes CGV sont soumises au droit suisse. Tout litige sera porté devant les juridictions compétentes du canton de [À compléter], Suisse.</p>

          <p style={{ marginTop: '2rem', fontStyle: 'italic' }}>Dernière mise à jour : avril 2026</p>
        </div>
      </div>
    </section>
  )
}
