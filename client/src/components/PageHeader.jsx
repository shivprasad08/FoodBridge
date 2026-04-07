const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-4 md:px-6 md:py-5">
    <div>
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      {subtitle ? <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p> : null}
    </div>
    {action}
  </div>
)

export default PageHeader
