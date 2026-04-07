import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'

const MobileHeader = ({ title }) => {
  const { profile } = useAuth()

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
      <div className="flex items-center gap-2">
        <span className="text-green-700 font-semibold text-base">
          FoodBridge
        </span>
        {title && (
          <span className="text-gray-400 text-sm">· {title}</span>
        )}
      </div>
      <NotificationBell />
    </div>
  )
}

export default MobileHeader
