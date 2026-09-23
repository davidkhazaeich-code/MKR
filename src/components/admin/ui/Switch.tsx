'use client'

// Interrupteur oui/non (ex. "Paiement recu"). La case native reste dans le
// DOM (clavier, lecteurs d'ecran) sous la piste dessinee ; libelle et aide
// lui sont relies par aria-labelledby et aria-describedby.

import { useId } from 'react'

interface Props {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label: string
  help?: string
}

export default function Switch({ checked, onChange, disabled, label, help }: Props) {
  const labelId = useId()
  const helpId = useId()
  return (
    <div className="adm-switch-row">
      <div className="adm-switch-row-text">
        <p id={labelId} className="adm-switch-label">
          {label}
        </p>
        {help && (
          <p id={helpId} className="adm-switch-help">
            {help}
          </p>
        )}
      </div>
      <label className="adm-switch">
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          aria-labelledby={labelId}
          aria-describedby={help ? helpId : undefined}
        />
        <span className="adm-switch-track" aria-hidden="true" />
        <span className="adm-switch-thumb" aria-hidden="true" />
      </label>
    </div>
  )
}
