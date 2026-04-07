const EmptyState = ({
  icon = 'Empty',
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
    <div className="mb-4 text-5xl">{icon}</div>
    <h3 className="mb-2 text-lg font-medium text-gray-700">{title}</h3>
    {description ? <p className="mb-6 max-w-xs text-sm text-gray-400">{description}</p> : null}
    {actionLabel && onAction ? (
      <button
        type="button"
        onClick={onAction}
        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
      >
        {actionLabel}
      </button>
    ) : null}
  </div>
)

export default EmptyState
