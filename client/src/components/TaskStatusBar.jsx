const STAGES = [
  { key: 'available', label: 'Posted' },
  { key: 'claimed', label: 'Claimed' },
  { key: 'picked_up', label: 'Picked Up' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'confirmed', label: 'Confirmed' },
]

const TaskStatusBar = ({ currentStatus = 'available' }) => {
  const currentIndex = STAGES.findIndex(stage => stage.key === currentStatus)

  return (
    <div className="w-full py-4">
      <div className="flex items-center">
        {STAGES.map((stage, index) => (
          <div key={stage.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 ${
                  index < currentIndex
                    ? 'bg-primary text-white'
                    : index === currentIndex
                    ? 'animate-pulse bg-primary text-white ring-4 ring-primary/20'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {index < currentIndex ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`mt-1 whitespace-nowrap text-xs font-medium ${
                  index <= currentIndex ? 'text-primary' : 'text-gray-400'
                }`}
              >
                {stage.label}
              </span>
            </div>

            {index < STAGES.length - 1 ? (
              <div
                className={`mx-2 h-0.5 flex-1 transition-all duration-500 ${
                  index < currentIndex ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TaskStatusBar
