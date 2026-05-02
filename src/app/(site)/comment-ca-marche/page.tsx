import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import FAQAccordion from '@/components/FAQAccordion'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'

export const metadata: Metadata = {
  title: "Comment ça marche : 6 étapes pour rejoindre le camp | MKR",
  description: "De l'inscription au premier tapis : découvre les 6 étapes pour rejoindre le camp MKR au Daghestan. Processus clair, transparent, sans surprise.",
  alternates: { canonical: 'https://mkrcamp.com/comment-ca-marche' },
}

const STEPS = [
  {
    num: '01',
    title: 'INSCRIPTION EN LIGNE',
    desc: 'Remplis le formulaire de candidature en 5 minutes. On te demande ton parcours sportif, tes objectifs et ta condition physique.',
    detail: '5 minutes',
  },
  {
    num: '02',
    title: 'APPEL DE VALIDATION',
    desc: "Un membre de l'équipe te contacte sous 48h pour un entretien de 15 à 20 minutes. On évalue ta motivation, ton niveau et on répond à toutes tes questions.",
    detail: 'Sous 48h',
  },
  {
    num: '03',
    title: 'ACOMPTE',
    desc: 'Si ta candidature est acceptée, tu verses un acompte de 30% pour confirmer ta place. Paiement par virement, CB ou PayPal.',
    detail: '30% du tarif',
  },
  {
    num: '04',
    title: 'GUIDE DE PRÉPARATION',
    desc: "Tu reçois un guide complet : programme de préparation physique sur 6 semaines, liste d'équipement, informations logistiques, conseils pratiques.",
    detail: 'Envoyé après confirmation',
  },
  {
    num: '05',
    title: 'DÉPART',
    desc: "Vol à ta charge. Un véhicule MKR t'attend à l'aéroport. Le transfert vers le camp est inclus. Tu n'as plus qu'à embarquer.",
    detail: 'Transfert inclus',
  },
  {
    num: '06',
    title: 'LE CAMP',
    desc: "1 à 3 semaines d'entraînement intensif. 2 sessions par jour. Coachs locaux. Hébergement, repas, excursions en option. Tu te concentres sur une seule chose : progresser.",
    detail: '1 à 3 semaines',
  },
]

const PROCESS_FAQ = [
  { question: "Combien de temps dure le processus d'inscription ?", answer: "De l'envoi du formulaire à la confirmation, le processus prend 3 à 5 jours en moyenne. L'appel de validation a lieu sous 48h après réception de ta candidature." },
  { question: "Que se passe-t-il si ma candidature est refusée ?", answer: "On t'explique les raisons et on te donne des pistes pour te préparer à une prochaine session. Le refus est souvent lié au niveau sportif : on te recommande un programme de préparation." },
  { question: "Puis-je reporter ma session ?", answer: "Oui, sous certaines conditions. Report gratuit si demande faite plus de 60 jours avant le début du camp. Soumis à disponibilité sur la session suivante." },
  { question: "Le solde est dû quand ?", answer: "Le solde (70% restant) est dû 30 jours avant le début du camp. Tu reçois un rappel automatique." },
]

export default function CommentCaMarchePage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcamp.com/' },
        { name: 'Comment ça marche', url: 'https://mkrcamp.com/comment-ca-marche' },
      ]} />
      <PageHero
        label="LE PROCESSUS"
        title="DE L'INSCRIPTION<br/>AU PREMIER TAPIS"
        subtitle="Processus clair, transparent, sans surprise. 6 étapes simples."
      />

      {/* Cinematic reveal */}
      <CinematicReveal
        image="/images/environment/gym-interior.webp"
        alt="Intérieur de la salle d'entraînement au Caucase"
        label="LES SALLES"
        title="ÉQUIPEMENT PRO, ÂME CAUCASIENNE"
        tagline="Tapis olympiques, cage MMA, sacs lourds. L'essentiel pour progresser, rien de superflu."
      />

      {/* Flow 6 etapes */}
      <section className="process-section fx-grid fx-glow">
        <div className="fx-glow-orb fx-glow-orb--right" />
        <div className="inner">
          <div className="process-flow">
            {STEPS.map((step, i) => (
              <div key={i} className={`process-step reveal${i % 2 === 1 ? ' process-step--alt' : ''}`} style={{ transitionDelay: `${i * 0.08}s` }}>
                <div className="process-step-num">{step.num}</div>
                <div className="process-step-content">
                  <span className="process-step-detail">{step.detail}</span>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Politique d'annulation */}
      <section className="logi-section fx-texture-basalt fx-mask-b fx-stack-3">
        <div className="fx-glow-orb" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>ANNULATION</span>
            <h2>POLITIQUE D&apos;ANNULATION</h2>
          </div>
          <div className="reveal" style={{ maxWidth: '600px' }}>
            <table className="table-tonal">
              <thead><tr><th>Délai avant le camp</th><th>Remboursement</th></tr></thead>
              <tbody>
                <tr><td>Plus de 60 jours</td><td style={{ color: '#22c55e' }}>100%</td></tr>
                <tr><td>30 à 60 jours</td><td style={{ color: '#facc15' }}>50%</td></tr>
                <tr><td>Moins de 30 jours</td><td style={{ color: '#ef4444' }}>Non remboursable</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Moyens de paiement */}
      <section className="logi-section fx-grid fx-glow fx-mask-a fx-stack-5">
        <div className="fx-glow-orb fx-glow-orb--left" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>PAIEMENT</span>
            <h2>MOYENS DE PAIEMENT</h2>
          </div>
          <div className="grid-3">
            {[
              { title: 'Virement bancaire', desc: 'IBAN suisse. Pas de frais supplémentaires. Coordonnées envoyées après validation.' },
              { title: 'Carte bancaire', desc: 'Paiement sécurisé via Stripe. Visa, Mastercard, Amex.' },
              { title: 'PayPal', desc: 'Disponible sur demande. Frais PayPal à la charge du participant.' },
            ].map((p, i) => (
              <div key={i} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <h3 className="card-title">{p.title}</h3>
                <p className="card-body">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ process */}
      <section className="faq-page-section fx-texture-concrete fx-mask-c fx-stack-4">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>QUESTIONS</span>
            <h2>QUESTIONS SUR LE PROCESSUS</h2>
          </div>
          <FAQAccordion items={PROCESS_FAQ} id="process-faq" />
        </div>
      </section>

      <SectionCTA
        primaryHref="/inscription"
        primaryLabel="COMMENCER L'INSCRIPTION"
        ghostHref="/faq"
        ghostLabel="DES QUESTIONS ?"
      />
    </>
  )
}
