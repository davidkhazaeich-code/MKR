'use client'

interface Props {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label: string
  help?: string
}

export default function Switch({ checked, onChange, disabled, label, help }: Props) {
  return (
    <div className="adm-switch-row">
      <div className="adm-switch-row-text">
        <p className="adm-switch-label">{label}</p>
        {help && <p className="adm-switch-help">{help}</p>}
      </div>
      <label className="adm-switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <span className="adm-switch-track" aria-hidden="true" />
        <span className="adm-switch-thumb" aria-hidden="true" />
      </label>
    </div>
  )
}
