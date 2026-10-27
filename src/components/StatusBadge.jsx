const STATUS_CONFIG = {
  'Menunggu':         { cls: 'badge-menunggu',  icon: '⏳' },
  'Dikompil':         { cls: 'badge-dikompil',  icon: '📋' },
  'Dalam Perolehan':  { cls: 'badge-perolehan', icon: '🛒' },
  'Diterima':         { cls: 'badge-diterima',  icon: '✅' },
  'Ditolak':          { cls: 'badge-ditolak',   icon: '❌' },
}

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { cls: '', icon: '•' }
  return (
    <span className={`badge ${cfg.cls}`}>
      {cfg.icon} {status}
    </span>
  )
}
