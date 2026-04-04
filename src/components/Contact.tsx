'use client'

import { useState, FormEvent } from 'react'

export default function Contact() {
  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    discipline: '',
    session: '',
    message: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Form submission logic to be wired up later
    console.log('Form submitted:', form)
  }

  return (
    <section id="contact" aria-labelledby="contact-heading">
      <div className="inner">
        <div className="contact-header reveal">
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
            CANDIDATURE
          </span>
          <h2 id="contact-heading" className="contact-title">
            POSTULER<br />AU CAMP
          </h2>
          <p className="contact-subtitle">
            Les places sont limitées. Remplis ce formulaire et nous te répondons sous 48h.
          </p>
        </div>

        <form className="contact-form reveal" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="f-prenom">Prénom</label>
              <input
                className="form-input"
                type="text"
                id="f-prenom"
                name="prenom"
                autoComplete="given-name"
                required
                placeholder="Ton prénom"
                value={form.prenom}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="f-nom">Nom</label>
              <input
                className="form-input"
                type="text"
                id="f-nom"
                name="nom"
                autoComplete="family-name"
                required
                placeholder="Ton nom"
                value={form.nom}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="f-email">Email</label>
              <input
                className="form-input"
                type="email"
                id="f-email"
                name="email"
                autoComplete="email"
                required
                placeholder="ton@email.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="f-tel">
                Téléphone <span style={{ opacity: 0.5 }}>(optionnel)</span>
              </label>
              <input
                className="form-input"
                type="tel"
                id="f-tel"
                name="telephone"
                autoComplete="tel"
                placeholder="+41 XX XXX XX XX"
                value={form.telephone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="f-discipline">Discipline principale</label>
              <select
                className="form-select"
                id="f-discipline"
                name="discipline"
                required
                value={form.discipline}
                onChange={handleChange}
              >
                <option value="" disabled>Sélectionner</option>
                <option value="mma">MMA</option>
                <option value="lutte">Lutte</option>
                <option value="boxe">Boxe</option>
                <option value="sambo">Sambo</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="f-session">Session souhaitée</label>
              <select
                className="form-select"
                id="f-session"
                name="session"
                required
                value={form.session}
                onChange={handleChange}
              >
                <option value="" disabled>Sélectionner</option>
                <option value="printemps-2026">Printemps 2026</option>
                <option value="ete-2026">Été 2026</option>
                <option value="automne-2026">Automne 2026</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="f-message">Message libre</label>
            <textarea
              className="form-textarea"
              id="f-message"
              name="message"
              placeholder="Ton niveau, tes objectifs, tes questions..."
              value={form.message}
              onChange={handleChange}
            ></textarea>
          </div>

          <div>
            <button type="submit" className="form-submit">
              ENVOYER MA CANDIDATURE
            </button>
          </div>
        </form>

        <a
          href="https://wa.me/41000000000"
          className="contact-whatsapp reveal"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contacter MKR Caucasian Camp sur WhatsApp"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M20.52 3.48A11.95 11.95 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.17 1.6 5.98L0 24l6.18-1.57A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22c-1.85 0-3.66-.5-5.23-1.44l-.37-.22-3.85.98.99-3.74-.24-.38A10 10 0 0 1 2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm5.47-7.47c-.3-.15-1.76-.87-2.04-.97-.27-.1-.47-.15-.67.15s-.77.97-.94 1.17c-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.76-1.66-2.06-.18-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52s-.67-1.6-.91-2.2c-.24-.57-.49-.49-.67-.5H7.1c-.2 0-.52.07-.8.37s-1.04 1.02-1.04 2.48 1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35z" fill="currentColor" />
          </svg>
          OU NOUS CONTACTER SUR WHATSAPP
        </a>
      </div>
    </section>
  )
}
