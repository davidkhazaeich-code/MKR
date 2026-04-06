import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import FAQAccordion from '@/components/FAQAccordion'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'

export const metadata: Metadata = {
  title: "Comment ca marche | MKR Caucasian Camp | Processus d'inscription",
  description: "De l'inscription au premier tapis : decouvre les 6 etapes pour rejoindre le camp MKR au Caucase. Processus clair, transparent, sans surprise.",
  alternates: { canonical: 'https://mkrcaucasiancamp.com/comment-ca-marche' },
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
    desc: "Un membre de l'equipe te contacte sous 48h pour un entretien de 15-20 minutes. On evalue ta motivation, ton niveau et on repond a toutes tes questions.",
    detail: 'Sous 48h',
  },
  {
    num: '03',
    title: 'ACOMPTE',
    desc: 'Si ta candidature est acceptee, tu verses un acompte de 30% pour confirmer ta place. Paiement par virement, CB ou PayPal.',
    detail: '30% du tarif',
  },
  {
    num: '04',
    title: 'GUIDE DE PREPARATION',
    desc: "Tu recois un guide complet : programme de preparation physique sur 6 semaines, liste d'equipement, informations logistiques, conseils pratiques.",
    detail: 'Envoye apres confirmation',
  },
  {
    num: '05',
    title: 'DEPART',
    desc: "Vol a ta charge. Un vehicule MKR t'attend a l'aeroport. Le transfert vers le camp est inclus. Tu n'as plus qu'a embarquer.",
    detail: 'Transfert inclus',
  },
  {
    num: '06',
    title: 'LE CAMP',
    desc: "3 semaines d'entrainement intensif. 2 sessions par jour. Coachs locaux. Hebergement, repas, excursions. Tu ne t'occupes de rien d'autre que de progresser.",
    detail: '3 semaines',
  },
]

const PROCESS_FAQ = [
  { question: "Combien de temps dure le processus d'inscription ?", answer: "De l'envoi du formulaire a la confirmation, le processus prend 3 a 5 jours en moyenne. L'appel de validation a lieu sous 48h apres reception de ta candidature." },
  { question: "Que se passe-t-il si ma candidature est refusee ?", answer: "On t'explique les raisons et on te donne des pistes pour te preparer a une prochaine session. Le refus est souvent lie au niveau sportif : on te recommande un programme de preparation." },
  { question: "Puis-je reporter ma session ?", answer: "Oui, sous certaines conditions. Report gratuit si demande faite plus de 60 jours avant le debut du camp. Soumis a disponibilite sur la session suivante." },
  { question: "Le solde est du quand ?", answer: "Le solde (70% restant) est du 30 jours avant le debut du camp. Tu recois un rappel automatique." },
]

export default function CommentCaMarchePage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcaucasiancamp.com/' },
        { name: 'Comment ca marche', url: 'https://mkrcaucasiancamp.com/comment-ca-marche' },
      ]} />
      <PageHero
        label="LE PROCESSUS"
        title="DE L'INSCRIPTION<br/>AU PREMIER TAPIS"
        subtitle="Processus clair, transparent, sans surprise. 6 etapes simples."
      />

      {/* Cinematic banner */}
      <section className="cinematic-banner">
        <div className="inner">
          <img
            src="/images/environment/gym-interior.webp"
            alt="Interieur de la salle d'entrainement au Caucase"
            width={1200}
            height={514}
            loading="lazy"
            className="section-photo-img"
          />
          <div className="cinematic-overlay" />
          <div className="cinematic-content">
            <span className="cinematic-label">LES SALLES</span>
            <h3 className="cinematic-title">EQUIPEMENT PRO, AME CAUCASIENNE</h3>
            <p className="cinematic-tagline">Tapis olympiques, cage MMA, sacs lourds. L&apos;essentiel pour progresser, rien de superflu.</p>
          </div>
        </div>
      </section>

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
              <thead><tr><th>Delai avant le camp</th><th>Remboursement</th></tr></thead>
              <tbody>
                <tr><td>Plus de 60 jours</td><td style={{ color: '#22c55e' }}>100%</td></tr>
                <tr><td>30 a 60 jours</td><td style={{ color: '#facc15' }}>50%</td></tr>
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
              { title: 'Virement bancaire', desc: 'IBAN suisse. Pas de frais supplementaires. Coordonnees envoyees apres validation.' },
              { title: 'Carte bancaire', desc: 'Paiement securise via Stripe. Visa, Mastercard, Amex.' },
              { title: 'PayPal', desc: 'Disponible sur demande. Frais PayPal a la charge du participant.' },
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
