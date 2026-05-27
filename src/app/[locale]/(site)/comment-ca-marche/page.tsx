import { buildMetadata } from '@/lib/seo'
import PageHero from '@/components/PageHero'
import FAQAccordion from '@/components/FAQAccordion'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import RefundPolicyTable from '@/components/RefundPolicyTable'

export const metadata = buildMetadata({
  title: "Comment ça marche : 6 étapes pour rejoindre le camp | MKR",
  description: "De l'inscription au premier tapis : découvre les 6 étapes pour rejoindre le camp MKR au Daghestan. Processus clair, transparent, sans surprise.",
  path: '/comment-ca-marche',
})
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
    title: 'PAIEMENT POST-VISIO',
    desc: "Une fois ta candidature validée à l'issue de la visio, tu reçois le RIB MKR pour régler le package en une seule fois (virement ou espèces). Aucun paiement n'est demandé avant l'entretien.",
    detail: 'Après validation',
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
    desc: "Tu prends ton vol jusqu'à Istanbul (à organiser librement). MKR a réservé ton vol intérieur Istanbul → Caucase et un véhicule t'attend à l'aéroport. Tu n'as plus qu'à embarquer.",
    detail: 'Vol intérieur et transfert inclus',
  },
  {
    num: '06',
    title: 'LE CAMP',
    desc: "1 à 3 semaines d'entraînement intensif. 2 sessions par jour. Coachs locaux. Hébergement, repas, excursions en option. Tu te concentres sur une seule chose : progresser.",
    detail: '1 à 3 semaines',
  },
]

const PROCESS_FAQ = [
  { question: "Que se passe-t-il si ma candidature est refusée ?", answer: "On t'explique les raisons et on te donne des pistes pour te préparer à une prochaine session. Le refus est souvent lié au niveau sportif : on te recommande un programme de préparation. Pour les autres questions (durée du processus, paiement, report), consulte la FAQ Inscription." },
  { question: "Et si je m'inscris à moins de 30 jours du départ ?", answer: "C'est possible quand il reste de la place, mais un supplément MKR de traitement express s'applique. Il couvre la procédure visa accélérée, la sécurisation du vol intérieur Istanbul-Caucase en haute-saison et la coordination logistique en délai contraint. Le montant est communiqué lors de la visio de validation, en sus du tarif du package. MKR se réserve le droit de refuser une candidature à moins de 30 jours si les délais administratifs (visa russe, vol intérieur) ne peuvent être tenus dans des conditions raisonnables." },
  { question: "MKR organise mon vol jusqu'à Istanbul ?", answer: "Non, le vol international jusqu'à Istanbul reste à ton organisation : tu choisis ta compagnie, ton aéroport de départ et ta classe selon ton budget. Ton vol doit arriver à Istanbul (IST ou SAW) au moins 4 heures avant ton vol intérieur MKR. MKR confirme l'horaire du vol intérieur Istanbul → Makhachkala (Lutte au Daghestan) ou Istanbul → Grozny (MMA en Tchétchénie) dès la validation de ta candidature, et te transmet le billet correspondant." },
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
            <RefundPolicyTable />
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
              { title: 'Virement bancaire', desc: "IBAN communiqué après validation de ta candidature en visio. Pas de frais supplémentaires." },
              { title: 'Espèces', desc: "Possible sur place ou en main propre. À convenir directement avec Ruslan lors de l'entretien visio." },
              { title: 'Autre modalité', desc: 'Toute demande spécifique est étudiée au cas par cas. Parle-en lors de la visio de validation.' },
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
