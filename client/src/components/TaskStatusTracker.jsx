const STEPS = ['claimed', 'picked_up', 'delivered', 'confirmed']

const labels = {
  claimed: 'Claimed',
  picked_up: 'Picked up',
  delivered: 'Delivered',
  confirmed: 'Confirmed',
}

const rank = {
  available: 0,
  claimed: 1,
  picked_up: 2,
  delivered: 3,
  confirmed: 4,
  completed: 4,
}

const TaskStatusTracker = ({ task, status: statusProp }) => {
  const status = statusProp || task?.status || 'available'
  const level = rank[status] ?? 0

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-sm font-semibold text-gray-800">Task Progress</p>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {STEPS.map((step, idx) => {
          const active = idx + 1 <= level
          return (
            <div key={step} className="text-center">
              <div className={`mx-auto h-2 w-full rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-200'}`} />
              <p className={`mt-2 text-xs ${active ? 'text-emerald-700 font-semibold' : 'text-gray-500'}`}>
                {labels[step]}
              </p>
            </div>
          )
        })}
      </div>

      {task?.status !== 'available' && task?.status !== 'claimed' && task?.pickup_photo_url ? (
        <div className="mt-4">
          <p className="mb-2 text-xs text-gray-400">Pickup proof</p>
          <img
            src={task.pickup_photo_url}
            alt="Pickup proof"
            className="h-24 w-32 cursor-pointer rounded-lg border border-gray-100 object-cover hover:opacity-90"
            onClick={() => window.open(task.pickup_photo_url, '_blank', 'noopener,noreferrer')}
          />
        </div>
      ) : null}

      {task?.receipt_photo_url ? (
        <div className="mt-4">
          <p className="mb-2 text-xs text-gray-400">Receipt proof</p>
          <img
            src={task.receipt_photo_url}
            alt="Receipt proof"
            className="h-24 w-32 cursor-pointer rounded-lg border border-gray-100 object-cover hover:opacity-90"
            onClick={() => window.open(task.receipt_photo_url, '_blank', 'noopener,noreferrer')}
          />
        </div>
      ) : null}
    </div>
  )
}

export default TaskStatusTracker
