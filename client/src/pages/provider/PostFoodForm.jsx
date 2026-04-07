import React, { useEffect, useRef, useState } from 'react';
import { Map, MapMarker, MarkerContent, MarkerPopup, MarkerLabel, MapControls } from '../../components/ui/map';
import { Card } from '../../components/ui/card';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';
import { useToast } from '../../context/ToastContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
const mapStyles = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-tiles',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

const getStoredSession = () => {
  const authSession = sessionStorage.getItem('authSession')
  const legacySession = sessionStorage.getItem('supabaseSession')
  const rawSession = authSession || legacySession

  if (!rawSession) return null

  try {
    return JSON.parse(rawSession)
  } catch {
    return null
  }
}

const PostFoodForm = () => {
  const { profile } = useAuth();
  const geocodeTimeoutRef = useRef(null);
  const lastGeocodedAddressRef = useRef('');
  // Form state
  const [title, setTitle] = useState('');
  const [foodType, setFoodType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [quantityNumber, setQuantityNumber] = useState(1);
  const [photoFile, setPhotoFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupLat, setPickupLat] = useState(18.6298);
  const [pickupLng, setPickupLng] = useState(73.7997);
  const [expiryTime, setExpiryTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [addressHint, setAddressHint] = useState('');
  const { toast } = useToast();

  // MapCN integration for map preview and location selection

  const handleLocate = ({ longitude, latitude }) => {
    setPickupLng(longitude);
    setPickupLat(latitude);
    setAddressHint('Using your current location. Adjust by dragging the pin if needed.');
  };

  const handleMarkerDragEnd = ({ lng, lat }) => {
    setPickupLng(lng);
    setPickupLat(lat);
    setAddressHint('Pin updated manually.');
  };

  useEffect(() => {
    if (geocodeTimeoutRef.current) {
      clearTimeout(geocodeTimeoutRef.current);
    }

    const trimmedAddress = pickupAddress.trim();
    if (trimmedAddress.length < 6) {
      setAddressHint('');
      return undefined;
    }

    geocodeTimeoutRef.current = setTimeout(async () => {
      if (lastGeocodedAddressRef.current === trimmedAddress) return;

      setGeocoding(true);
      setAddressHint('Finding address on map...');

      try {
        const searchParams = new URLSearchParams({
          format: 'jsonv2',
          limit: '1',
          q: trimmedAddress,
        });

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${searchParams.toString()}`,
          {
            headers: {
              Accept: 'application/json',
            },
          }
        );

        const results = await response.json();
        if (!Array.isArray(results) || results.length === 0) {
          setAddressHint('Address not found on map. You can adjust it manually.');
          return;
        }

        const first = results[0];
        const nextLat = Number(first.lat);
        const nextLng = Number(first.lon);

        if (Number.isFinite(nextLat) && Number.isFinite(nextLng)) {
          setPickupLat(nextLat);
          setPickupLng(nextLng);
          lastGeocodedAddressRef.current = trimmedAddress;
          setAddressHint(first.display_name || 'Address found on map.');
        } else {
          setAddressHint('Address could not be mapped. Please adjust manually.');
        }
      } catch (err) {
        setAddressHint('Could not look up the address. You can still drop the pin manually.');
      } finally {
        setGeocoding(false);
      }
    }, 700);

    return () => {
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
      }
    };
  }, [pickupAddress]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const session = getStoredSession();
      if (!session?.access_token) {
        throw new Error('You are not signed in. Please log in again.');
      }

      const resolvedPickupLat = Number(pickupLat ?? 18.6298);
      const resolvedPickupLng = Number(pickupLng ?? 73.7997);

      // Step 1: upload photo if selected
      let photoUrl = null;
      if (photoFile) {
        const formData = new FormData();
        formData.append('photo', photoFile);
        const uploadRes = await fetch(`${API_BASE_URL}/api/uploads/food-photo`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`
          },
          body: formData
        });

        if (!uploadRes.ok) {
          const uploadError = await uploadRes.json().catch(() => ({}));
          throw new Error(uploadError.message || 'Photo upload failed');
        }

        const uploadData = await uploadRes.json();
        photoUrl = uploadData.data.url;
      }
      // Step 2: create listing
      const res = await fetch(`${API_BASE_URL}/api/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          title,
          food_type: foodType,
          quantity,
          quantity_number: quantityNumber,
          pickup_address: pickupAddress,
          pickup_lat: resolvedPickupLat,
          pickup_lng: resolvedPickupLng,
          expiry_time: expiryTime,
          notes,
          photo_url: photoUrl
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) {
        throw new Error(data.message || 'Failed to create listing');
      }

      toast.success('Food posted! Notifying nearby NGOs...');
      setTitle('');
      setFoodType('');
      setQuantity('');
      setQuantityNumber(1);
      setPhotoFile(null);
      setNotes('');
      setPickupAddress('');
      setExpiryTime('');
      // TODO: Navigate to listings after success
    } catch (err) {
      setError(err?.message || 'Failed to post food listing');
      toast.error(err?.message || 'Failed to post food listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <PageHeader title="Post Food Listing" subtitle="Share surplus food and notify nearby NGOs instantly" />
      <div className="mx-auto max-w-2xl px-4 py-4 md:px-6 md:py-6 pb-20 md:pb-6">
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
        {/* Food details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required minLength={3}
            className="w-full text-base border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Food type / items *</label>
          <input type="text" value={foodType} onChange={e => setFoodType(e.target.value)} required
            className="w-full text-base border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estimated quantity *</label>
          <input type="text" value={quantity} onChange={e => setQuantity(e.target.value)} required
            className="w-full text-base border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Number of portions *</label>
          <input type="number" value={quantityNumber} onChange={e => setQuantityNumber(Number(e.target.value))} min={1} max={10000} required
            className="w-full text-base border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Food photo (optional)</label>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setPhotoFile(e.target.files[0])}
            className="w-full text-base border border-gray-300 rounded-lg px-4 py-2.5" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            className="w-full text-base border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        {/* Pickup location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pickup address *</label>
          <input type="text" value={pickupAddress} onChange={e => setPickupAddress(e.target.value)} required
            className="w-full text-base border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary" />
          <div className="mt-1 text-xs text-gray-500">
            {geocoding ? 'Looking up the address...' : addressHint}
          </div>
          {/* Advanced MapCN map preview and location picker */}
          <Card className="w-full h-48 md:h-64 p-0 overflow-hidden mt-2 rounded-lg">
            <Map
              theme="light"
              styles={{ light: mapStyles, dark: mapStyles }}
              viewport={{ center: [pickupLng || 73.7997, pickupLat || 18.6298], zoom: 14 }}
              onViewportChange={({ center }) => {
                setPickupLng(center[0]);
                setPickupLat(center[1]);
              }}
              loading={false}
            >
              <MapControls
                position="bottom-right"
                showZoom
                showLocate
                onLocate={handleLocate}
              />

              <MapMarker
                longitude={pickupLng || 73.7997}
                latitude={pickupLat || 18.6298}
                draggable
                onDragEnd={handleMarkerDragEnd}
              >
                <MarkerContent>
                  <div className="relative h-5 w-5 rounded-full border-2 border-white bg-blue-500 shadow">
                    <div className="absolute -inset-1 rounded-full border border-blue-300/70" />
                  </div>
                  <MarkerLabel position="top">Pickup Point</MarkerLabel>
                </MarkerContent>
                <MarkerPopup>
                  <div className="text-xs text-gray-700">
                    <p className="font-semibold text-gray-900">Pickup location</p>
                    <p>Lat: {Number(pickupLat || 0).toFixed(6)}</p>
                    <p>Lng: {Number(pickupLng || 0).toFixed(6)}</p>
                  </div>
                </MarkerPopup>
              </MapMarker>
            </Map>
          </Card>
          <p className="mt-2 text-xs text-gray-500">
            Drag the pin or use locate to set exact pickup coordinates: {Number(pickupLat || 0).toFixed(6)}, {Number(pickupLng || 0).toFixed(6)}
          </p>
        </div>
        {/* Expiry time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Food expires at *</label>
          <input type="datetime-local" value={expiryTime} onChange={e => setExpiryTime(e.target.value)} required
            className="w-full text-base border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary" />
          <div className="text-xs text-gray-400 mt-1">Min: 30 minutes from now, Max: 24 hours from now</div>
        </div>
        <button type="submit" disabled={loading} className="mt-4 w-full min-h-[44px] rounded-xl bg-primary px-4 py-3 text-base font-medium text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50">
          {loading ? 'Posting...' : 'Post Food Now'}
        </button>
        {error && <div className="text-red-500 text-sm mt-2 text-center">{error}</div>}
      </form>
      </div>
    </section>
  );
};

export default PostFoodForm;
