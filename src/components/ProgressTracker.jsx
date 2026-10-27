const STEPS = ['Menunggu', 'Dikompil', 'Dalam Perolehan', 'Diterima']
const STEP_LABELS = ['Menunggu', 'Dikompil', 'Perolehan', 'Diterima']
const STEP_ICONS  = ['⏳', '📋', '🛒', '✅']

function stepState(stepIndex, currentStatus) {
  if (currentStatus === 'Ditolak') return stepIndex === 0 ? 'reject' : 'none'
  const currentIndex = STEPS.indexOf(currentStatus)
  if (stepIndex < currentIndex)  return 'done'
  if (stepIndex === currentIndex) return 'active'
  return 'none'
}

export default function ProgressTracker({ status }) {
  return (
    <div className="progress-tracker">
      {STEPS.map((_, i) => {
        const state = stepState(i, status)
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40 }}>
              <div className={`step-circle ${state === 'done' ? 'done' : state === 'active' ? 'active' : state === 'reject' ? 'reject' : ''}`}>
                {STEP_ICONS[i]}
              </div>
              <span className="step-label">{STEP_LABELS[i]}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`step-line ${state === 'done' ? 'done' : state === 'active' ? 'active' : ''}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
