import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CGV | MKR Caucasian Camp | Conditions Generales de Vente',
  alternates: { canonical: 'https://mkrcaucasiancamp.com/cgv' },
}

export default function CGVPage() {
  return (
    <section className="legal-page">
      <div className="inner">
        <h1 className="legal-title">CONDITIONS GENERALES DE VENTE</h1>
        <div className="legal-content">
          <h2>Article 1 : Objet</h2>
          <p>Les presentes conditions generales de vente (CGV) regissent les relations contractuelles entre MKR Caucasian Camp (ci-apres &laquo; l&apos;Organisateur &raquo;) et toute personne physique (ci-apres &laquo; le Participant &raquo;) souhaitant participer a un camp d&apos;entrainement organise par MKR Caucasian Camp.</p>

          <h2>Article 2 : Inscription et validation</h2>
          <p>L&apos;inscription se fait via le formulaire en ligne sur mkrcaucasiancamp.com. Toute candidature est soumise a validation par l&apos;equipe MKR lors d&apos;un entretien telephonique ou video. L&apos;Organisateur se reserve le droit de refuser toute candidature sans justification.</p>

          <h2>Article 3 : Tarifs et paiement</h2>
          <p>Les tarifs sont indiques en francs suisses (CHF) sur la page Sessions du site. Le paiement s&apos;effectue en deux temps :</p>
          <ul>
            <li>Acompte de 30% a la confirmation de la candidature</li>
            <li>Solde de 70% au plus tard 30 jours avant le debut du camp</li>
          </ul>
          <p>Moyens de paiement acceptes : virement bancaire, carte bancaire (Stripe), PayPal.</p>

          <h2>Article 4 : Politique d&apos;annulation</h2>
          <ul>
            <li>Plus de 60 jours avant le debut : remboursement integral (100%)</li>
            <li>Entre 30 et 60 jours : remboursement partiel (50%)</li>
            <li>Moins de 30 jours : aucun remboursement</li>
          </ul>
          <p>Le report sur une session ulterieure est possible sous reserve de disponibilite, si la demande est faite plus de 60 jours avant le debut du camp.</p>

          <h2>Article 5 : Prestations incluses</h2>
          <p>Le tarif du camp comprend :</p>
          <ul>
            <li>Hebergement en logement de camp</li>
            <li>3 repas par jour</li>
            <li>Sessions d&apos;entrainement biquotidiennes (6 jours/semaine)</li>
            <li>Transferts aeroport-camp</li>
            <li>Excursions culturelles prevues au programme</li>
            <li>Suivi preparatoire a distance avant le depart</li>
          </ul>

          <h2>Article 6 : Prestations non incluses</h2>
          <ul>
            <li>Vol international aller-retour</li>
            <li>Visa (si applicable)</li>
            <li>Assurance voyage (obligatoire)</li>
            <li>Equipement personnel</li>
            <li>Depenses personnelles</li>
          </ul>

          <h2>Article 7 : Assurance</h2>
          <p>Le Participant est tenu de souscrire une assurance voyage couvrant le rapatriement medical et la pratique de sports de contact avant le depart. La preuve d&apos;assurance doit etre fournie a l&apos;Organisateur au plus tard 15 jours avant le depart.</p>

          <h2>Article 8 : Responsabilite</h2>
          <p>Le Participant reconnait participer au camp de sa propre initiative et en pleine connaissance des risques lies a la pratique de sports de combat. L&apos;Organisateur decline toute responsabilite en cas de blessure survenue lors des entrainements ou activites annexes.</p>

          <h2>Article 9 : Droit a l&apos;image</h2>
          <p>Le Participant autorise l&apos;Organisateur a utiliser les photos et videos prises pendant le camp a des fins de communication et de promotion, sauf opposition ecrite prealable.</p>

          <h2>Article 10 : Droit applicable</h2>
          <p>Les presentes CGV sont soumises au droit suisse. Tout litige sera porte devant les juridictions competentes du canton de [A completer], Suisse.</p>

          <p style={{ marginTop: '2rem', fontStyle: 'italic' }}>Derniere mise a jour : avril 2026</p>
        </div>
      </div>
    </section>
  )
}
