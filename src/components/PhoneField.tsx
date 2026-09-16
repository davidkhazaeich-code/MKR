'use client'

// Indicatif + numero national du tunnel d'inscription. Le parent garde les deux
// valeurs brutes dans son etat et ne normalise en E.164 qu'a la validation et
// a l'envoi (lib/phone.ts), pour que le candidat puisse taper librement.
import { useMemo } from 'react'
import { phoneCountries } from '@/lib/phone'

type Props = {
  locale: string
  country: string
  national: string
  countryLabel: string
  placeholder: string
  hasError: boolean
  onCountryChange: (iso: string) => void
  onNationalChange: (value: string) => void
}

export default function PhoneField({
  locale, country, national, countryLabel, placeholder, hasError, onCountryChange, onNationalChange,
}: Props) {
  const countries = useMemo(() => phoneCountries(locale), [locale])
  const selected = countries.find(c => c.iso === country)

  return (
    <div className={`cand-phone${hasError ? ' has-error' : ''}`}>
      <div className="cand-phone-code">
        <select
          className={`cand-select${hasError ? ' has-error' : ''}`}
          value={country}
          aria-label={countryLabel}
          aria-invalid={hasError || undefined}
          autoComplete="tel-country-code"
          onChange={e => onCountryChange(e.target.value)}
        >
          <option value="" disabled>{countryLabel}</option>
          {countries.map(c => (
            <option key={c.iso} value={c.iso}>{c.name} (+{c.code})</option>
          ))}
        </select>
        {/* Le select liste les noms complets ; en facade on ne montre que l'indicatif. */}
        <span className={`cand-phone-code-face${selected ? '' : ' is-empty'}`} aria-hidden="true">
          {selected ? `+${selected.code}` : countryLabel}
        </span>
      </div>
      <input
        className={`cand-input${hasError ? ' has-error' : ''}`}
        type="tel" autoComplete="tel-national" inputMode="tel"
        placeholder={placeholder} value={national}
        aria-invalid={hasError || undefined}
        onChange={e => onNationalChange(e.target.value)}
      />
    </div>
  )
}
