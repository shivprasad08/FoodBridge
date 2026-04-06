const statusStyles = {
  available: 'bg-sky-100 text-sky-700',
  claimed: 'bg-amber-100 text-amber-700',
  picked_up: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-violet-100 text-violet-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-emerald-100 text-emerald-700',
}

const statusLabels = {
  available: 'Available',
  claimed: 'Claimed',
  picked_up: 'Picked Up',
  delivered: 'Delivered',
  confirmed: 'Confirmed',
  completed: 'Completed',
}

const StatusBadge = ({ status }) => {
  const key = status || 'available'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[key] || 'bg-gray-100 text-gray-700'}`}>
      {statusLabels[key] || key}
    </span>
  )
}

export default StatusBadge
