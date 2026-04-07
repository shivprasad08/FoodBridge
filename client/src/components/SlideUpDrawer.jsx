const SlideUpDrawer = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50 md:hidden"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl p-4 md:hidden animate-slide-up">
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {title}
          </h3>
        )}
        {children}
      </div>
    </>
  )
}

export default SlideUpDrawer
