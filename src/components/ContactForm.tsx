'use client'

export default function ContactForm() {
  return (
    <form className="contact-form" onSubmit={e => e.preventDefault()}>
      <div className="cand-field">
        <label className="cand-label">Nom complet</label>
        <input type="text" className="cand-input" placeholder="Ton nom" required />
      </div>
      <div className="cand-field">
        <label className="cand-label">Email</label>
        <input type="email" className="cand-input" placeholder="ton@email.com" required />
      </div>
      <div className="cand-field">
        <label className="cand-label">Sujet</label>
        <select className="cand-select" required defaultValue="">
          <option value="" disabled>Choisis un sujet</option>
          <option value="general">Question generale</option>
          <option value="partenariat">Partenariat</option>
          <option value="clubs">Clubs et groupes</option>
          <option value="presse">Presse et medias</option>
          <option value="autre">Autre</option>
        </select>
      </div>
      <div className="cand-field">
        <label className="cand-label">Message</label>
        <textarea className="cand-textarea" rows={5} placeholder="Ton message..." required />
      </div>
      <button type="submit" className="btn-primary" style={{ width: '100%' }}>ENVOYER</button>
    </form>
  )
}
