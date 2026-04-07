import { useEffect, useRef, useState } from 'react'

const ExpiryCountdown = ({ expiryTime, onExpired }) => {
  const [timeLeft, setTimeLeft] = useState('')
  const [isExpired, setIsExpired] = useState(false)
  const [isUrgent, setIsUrgent] = useState(false)
  const firedRef = useRef(false)

  useEffect(() => {
    firedRef.current = false

    const calculate = () => {
      const now = Date.now()
      const end = new Date(expiryTime).getTime()
      const diff = end - now

      if (Number.isNaN(end) || diff <= 0) {
        setIsExpired(true)
        setTimeLeft('Expired')
        setIsUrgent(false)
        if (!firedRef.current) {
          firedRef.current = true
          onExpired?.()
        }
        return
      }

      const hours = Math.floor(diff / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      const secs = Math.floor((diff % 60000) / 1000)

      setIsExpired(false)
      setIsUrgent(diff < 30 * 60 * 1000)

      if (hours > 0) {
        setTimeLeft(`${hours}h ${mins}m`)
      } else if (mins > 0) {
        setTimeLeft(`${mins}m ${secs}s`)
      } else {
        setTimeLeft(`${secs}s`)
      }
    }

    calculate()
    const timer = setInterval(calculate, 1000)
    return () => clearInterval(timer)
  }, [expiryTime, onExpired])

  if (isExpired) {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-gray-500">
        <span>Expired</span>
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${isUrgent ? 'animate-pulse text-red-600' : 'text-amber-600'}`}>
      <span>Expires in {timeLeft}</span>
    </span>
  )
}

export default ExpiryCountdown
