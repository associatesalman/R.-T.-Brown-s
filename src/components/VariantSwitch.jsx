import { HERO_VARIANTS } from '../heroConfig.js'

// Floating review switch for comparing the two hero placements.
export default function VariantSwitch({ current, onChange }) {
  return (
    <div className="vswitch" role="group" aria-label="Hero artwork placement (review)">
      <span className="vswitch-label">Hero</span>
      {Object.values(HERO_VARIANTS).map((v) => (
        <button
          key={v.id}
          type="button"
          aria-pressed={current === v.id}
          title={v.description}
          onClick={() => onChange(v.id)}
        >
          {v.label}
        </button>
      ))}
    </div>
  )
}
