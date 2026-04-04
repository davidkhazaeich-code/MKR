'use client'

export default function GuideForm() {
  return (
    <div className="guide-form-card">
      <h3>TELECHARGE LE GUIDE</h3>
      <p>Recois le guide complet directement dans ta boite mail. Gratuit, sans engagement.</p>
      <form className="guide-form" onSubmit={e => e.preventDefault()}>
        <input type="email" placeholder="Ton adresse email" className="cand-input" required />
        <button type="submit" className="btn-primary" style={{ width: '100%' }}>
          TELECHARGER GRATUITEMENT
        </button>
      </form>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block', marginTop: '0.5rem' }}>
        Pas de spam. Juste le guide.
      </span>
    </div>
  )
}
