import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Merci | MKR Caucasian Camp',
  description: "Ta candidature a bien ete recue. On te recontacte sous 48h.",
  robots: { index: false },
}

export default function MerciPage() {
  return (
    <section className="merci-page">
      <div className="inner">
        <div className="merci-content reveal">
          <div className="merci-icon" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none" stroke="var(--primary)" strokeWidth="2.5">
              <circle cx="32" cy="32" r="28" />
              <polyline points="20,32 28,40 44,24" />
            </svg>
          </div>
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
            CANDIDATURE RECUE
          </span>
          <h1>ON A BIEN RECU<br />TA DEMANDE.</h1>
          <p className="merci-sub">On te recontacte sous 48h pour un appel de validation. Prepare-toi a parler de ton parcours sportif.</p>

          <div className="merci-steps">
            <div className="merci-step">
              <span className="merci-step-num">01</span>
              <div>
                <h3>Appel de validation</h3>
                <p>Un membre de l&apos;equipe te contacte sous 48h pour discuter de ta candidature.</p>
              </div>
            </div>
            <div className="merci-step">
              <span className="merci-step-num">02</span>
              <div>
                <h3>Confirmation et acompte</h3>
                <p>Si ta candidature est validee, tu recois un lien de paiement pour l&apos;acompte de 30%.</p>
              </div>
            </div>
            <div className="merci-step">
              <span className="merci-step-num">03</span>
              <div>
                <h3>Guide de preparation</h3>
                <p>Un guide complet t&apos;est envoye : programme de preparation, equipement, logistique.</p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/sessions" className="btn-primary">VOIR LES SESSIONS</Link>
            <Link href="/" className="btn-ghost">RETOUR A L&apos;ACCUEIL</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
