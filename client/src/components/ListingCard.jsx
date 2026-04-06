import { Link } from 'react-router-dom'
import { formatDistance } from '../utils/distanceUtils'
import StatusBadge from './StatusBadge'

const ListingCard = ({ listing, onClaim, claiming }) => {
  const image = listing?.photo_url || 'https://placehold.co/600x340?text=Food+Listing'

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <img src={image} alt={listing?.title || 'Listing'} className="h-44 w-full object-cover" />
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{listing?.title}</h3>
            <p className="mt-1 text-xs text-gray-500">{listing?.food_type} • {listing?.quantity || listing?.quantity_number}</p>
          </div>
          <StatusBadge status={listing?.status} />
        </div>

        <p className="line-clamp-2 text-sm text-gray-600">{listing?.pickup_address || 'Pickup address unavailable'}</p>
        <p className="text-xs font-medium text-gray-500">Distance: {formatDistance(listing?.distance_km)}</p>

        <div className="flex gap-2">
          <Link
            to={`/recipient/listings/${listing?.id}`}
            className="inline-flex flex-1 items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            View Details
          </Link>
          <button
            type="button"
            disabled={claiming || listing?.status !== 'available'}
            onClick={() => onClaim?.(listing)}
            className="inline-flex flex-1 items-center justify-center rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 hover:bg-emerald-700"
          >
            {claiming ? 'Claiming...' : 'Claim'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default ListingCard
