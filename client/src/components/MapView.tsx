import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Donation, Organisation } from '../types';
import {
  MapPin,
  Navigation,
  Package,
  Utensils,
  Building2,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Clock,
  Filter,
  ShieldCheck,
  RefreshCw,
  Info
} from 'lucide-react';
import {
  CHENNAI_FALLBACK,
  NYC_FALLBACK,
  calculateHaversineDistance,
  formatDistance,
  isValidCoordinate
} from '../utils/geo';

// Fix Leaflet default marker icon paths in Vite builds
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored SVG pin generator
const createSvgPin = (bgColor: string, emoji: string, isPulsing = false) => {
  return L.divIcon({
    className: 'custom-sharebite-marker',
    html: `
      <div style="position: relative; width: 34px; height: 34px;">
        ${
          isPulsing
            ? `<div style="
                position: absolute;
                inset: -6px;
                border-radius: 50%;
                background: ${bgColor};
                opacity: 0.35;
                animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
              "></div>`
            : ''
        }
        <div style="
          background: ${bgColor};
          width: 34px;
          height: 34px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.45);
        ">
          <div style="
            transform: rotate(45deg);
            color: #ffffff;
            font-size: 13px;
            display: flex;
            align-items: center;
            justify-content: center;
            user-select: none;
          ">
            ${emoji}
          </div>
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
};

const iconAvailable = createSvgPin('#10b981', '🍽️');
const iconReserved = createSvgPin('#14b8a6', '📦');
const iconInTransit = createSvgPin('#f59e0b', '🚚');
const iconNgo = createSvgPin('#3b82f6', '🏢');
const iconLiveUser = createSvgPin('#8b5cf6', '📍', true);
const iconFallbackUser = createSvgPin('#f97316', '📍', false);

// Map controller handling center, flyTo and invalidateSize
const MapController: React.FC<{
  center: [number, number];
  zoom: number;
  selectedDonation?: Donation | null;
}> = ({ center, zoom, selectedDonation }) => {
  const map = useMap();

  useEffect(() => {
    // Invalidate size on mount and window resize to prevent blank/gray tiles
    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    const timer1 = setTimeout(() => {
      map.invalidateSize();
    }, 50);
    const timer2 = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    const timer3 = setTimeout(() => {
      map.invalidateSize();
    }, 600);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [map]);

  useEffect(() => {
    if (
      selectedDonation?.location?.latitude &&
      selectedDonation?.location?.longitude &&
      isValidCoordinate(selectedDonation.location.latitude, selectedDonation.location.longitude)
    ) {
      map.flyTo(
        [selectedDonation.location.latitude, selectedDonation.location.longitude],
        15,
        { duration: 1.2 }
      );
    } else {
      map.setView(center, zoom);
    }
    const t = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(t);
  }, [center, zoom, selectedDonation, map]);

  return null;
};

export type RadiusFilterKm = null | 2 | 5 | 10 | 20;

export interface MapViewProps {
  donations?: Donation[];
  organisations?: Organisation[];
  selectedDonation?: Donation | null;
  onSelectDonation?: (donation: Donation) => void;
  height?: string;
  showRadiusControls?: boolean;
  initialRadius?: RadiusFilterKm;
  onRadiusChange?: (radius: RadiusFilterKm) => void;
  className?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  donations = [],
  organisations = [],
  selectedDonation,
  onSelectDonation,
  height,
  showRadiusControls = true,
  initialRadius = null,
  onRadiusChange,
  className = '',
}) => {
  // Location States
  // Default development fallback: Chennai [13.0827, 80.2707]
  const [activeCenter, setActiveCenter] = useState<[number, number]>(CHENNAI_FALLBACK);
  const [zoomLevel, setZoomLevel] = useState<number>(12);
  const [userLocation, setUserLocation] = useState<{
    coords: [number, number];
    isFallback: boolean;
    status: 'IDLE' | 'LOCATING' | 'LIVE_GPS' | 'PERMISSION_DENIED' | 'TIMEOUT' | 'UNAVAILABLE' | 'UNSUPPORTED' | 'PRESET';
    message: string;
  }>({
    coords: CHENNAI_FALLBACK,
    isFallback: true,
    status: 'IDLE',
    message: 'Development Fallback: Chennai (GPS inactive)',
  });

  const [selectedRadius, setSelectedRadius] = useState<RadiusFilterKm>(initialRadius);

  // Auto-detect if donations are predominantly NYC vs Chennai to pick friendly starting view
  useEffect(() => {
    const hasChennaiDonations = donations.some(
      (d) =>
        d.location &&
        d.location.latitude &&
        d.location.latitude > 12 &&
        d.location.latitude < 14
    );
    const hasNycDonations = donations.some(
      (d) =>
        d.location &&
        d.location.latitude &&
        d.location.latitude > 40 &&
        d.location.latitude < 42
    );

    // If only NYC donations exist and user hasn't requested GPS yet, gently center NYC for demo
    if (hasNycDonations && !hasChennaiDonations && userLocation.status === 'IDLE') {
      setActiveCenter(NYC_FALLBACK);
    }
  }, [donations]);

  // Request browser GPS Geolocation
  const handleRequestLocation = () => {
    if (!('geolocation' in navigator)) {
      setUserLocation({
        coords: CHENNAI_FALLBACK,
        isFallback: true,
        status: 'UNSUPPORTED',
        message: 'Browser does not support Geolocation. Using Chennai fallback.',
      });
      setActiveCenter(CHENNAI_FALLBACK);
      return;
    }

    setUserLocation((prev) => ({
      ...prev,
      status: 'LOCATING',
      message: 'Requesting device GPS coordinates...',
    }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        if (isValidCoordinate(lat, lng)) {
          const coords: [number, number] = [lat, lng];
          setUserLocation({
            coords,
            isFallback: false,
            status: 'LIVE_GPS',
            message: `Live GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          });
          setActiveCenter(coords);
          setZoomLevel(13);
        }
      },
      (error) => {
        let msg = 'Using Chennai fallback: ';
        let status: 'PERMISSION_DENIED' | 'TIMEOUT' | 'UNAVAILABLE' = 'UNAVAILABLE';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg += 'GPS permission denied by user/browser';
            status = 'PERMISSION_DENIED';
            break;
          case error.TIMEOUT:
            msg += 'GPS request timed out';
            status = 'TIMEOUT';
            break;
          case error.POSITION_UNAVAILABLE:
          default:
            msg += 'Device location unavailable';
            status = 'UNAVAILABLE';
            break;
        }

        setUserLocation({
          coords: CHENNAI_FALLBACK,
          isFallback: true,
          status,
          message: `${msg} [13.0827, 80.2707] (Dev Fallback - Not actual location)`,
        });
        setActiveCenter(CHENNAI_FALLBACK);
        setZoomLevel(12);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 30000,
      }
    );
  };

  const handleJumpToPreset = (coords: [number, number], label: string) => {
    setActiveCenter(coords);
    setZoomLevel(13);
    setUserLocation({
      coords,
      isFallback: true,
      status: 'PRESET',
      message: `${label} Preset: [${coords[0]}, ${coords[1]}]`,
    });
  };

  const handleRadiusClick = (radius: RadiusFilterKm) => {
    setSelectedRadius(radius);
    if (onRadiusChange) {
      onRadiusChange(radius);
    }
  };

  // Filter donations:
  // 1. Must have valid coordinates
  // 2. If radius is selected, must be within radius from active reference point
  const filteredDonations = donations.filter((don) => {
    if (!don.location || !isValidCoordinate(don.location.latitude, don.location.longitude)) {
      return false;
    }
    if (selectedRadius === null) return true;

    const dist = calculateHaversineDistance(
      userLocation.coords[0],
      userLocation.coords[1],
      don.location.latitude!,
      don.location.longitude!
    );
    return dist <= selectedRadius;
  });

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-slate-800 bg-navy-950 shadow-2xl flex flex-col ${
        height ? '' : 'h-[360px] sm:h-[440px] md:h-[500px] min-h-[360px] sm:min-h-[440px] md:min-h-[500px]'
      } ${className}`}
      style={height ? { height, minHeight: height } : undefined}
    >
      {/* Top Map Action Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Region & GPS Controls (Interactive) */}
        <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto bg-navy-950/90 border border-slate-700/80 rounded-xl p-1.5 backdrop-blur-md shadow-lg">
          <button
            onClick={handleRequestLocation}
            disabled={userLocation.status === 'LOCATING'}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              userLocation.status === 'LIVE_GPS'
                ? 'bg-emerald-500 text-navy-950 shadow-glow-teal'
                : userLocation.status === 'LOCATING'
                ? 'bg-teal-500/30 text-teal-300 animate-pulse'
                : 'bg-navy-900 text-slate-200 hover:text-white border border-slate-700'
            }`}
            title="Detect device GPS location"
          >
            {userLocation.status === 'LOCATING' ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-teal-400" />
            )}
            <span>{userLocation.status === 'LIVE_GPS' ? 'Live GPS' : 'My Location'}</span>
          </button>

          {/* Preset Buttons for Quick Testing */}
          <button
            onClick={() => handleJumpToPreset(CHENNAI_FALLBACK, 'Chennai')}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              activeCenter[0] === CHENNAI_FALLBACK[0]
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-navy-850'
            }`}
            title="Development Fallback Point: Chennai, India [13.0827, 80.2707]"
          >
            Chennai Fallback
          </button>

          <button
            onClick={() => handleJumpToPreset(NYC_FALLBACK, 'NYC')}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              activeCenter[0] === NYC_FALLBACK[0]
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-navy-850'
            }`}
            title="NYC Demo Cluster [40.7250, -73.9950]"
          >
            NYC Demo Hub
          </button>
        </div>

        {/* Radius Filter Pills (Interactive) */}
        {showRadiusControls && (
          <div className="flex items-center gap-1 pointer-events-auto bg-navy-950/90 border border-slate-700/80 rounded-xl p-1 backdrop-blur-md shadow-lg">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 flex items-center gap-1">
              <Filter className="w-3 h-3 text-teal-400" />
              Radius:
            </span>
            {([null, 2, 5, 10, 20] as RadiusFilterKm[]).map((r) => (
              <button
                key={r === null ? 'all' : r}
                onClick={() => handleRadiusClick(r)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedRadius === r
                    ? 'bg-teal-500 text-navy-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-navy-850'
                }`}
              >
                {r === null ? 'All' : `${r} km`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Geolocation Notice / Fallback Banner */}
      {userLocation.message && (
        <div className="absolute top-16 left-3 z-[1000] pointer-events-none">
          <div
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border backdrop-blur-md shadow flex items-center gap-1.5 ${
              userLocation.status === 'LIVE_GPS'
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                : userLocation.status === 'LOCATING'
                ? 'bg-teal-950/80 border-teal-500/40 text-teal-300'
                : 'bg-amber-950/85 border-amber-500/40 text-amber-200'
            }`}
          >
            {userLocation.status === 'LIVE_GPS' ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            ) : userLocation.isFallback ? (
              <Info className="w-3 h-3 text-amber-400" />
            ) : (
              <Navigation className="w-3 h-3 text-teal-400 animate-spin" />
            )}
            <span>{userLocation.message}</span>
          </div>
        </div>
      )}

      {/* Empty State Banner when radius filter hides all items */}
      {selectedRadius !== null && filteredDonations.length === 0 && (
        <div className="absolute inset-x-4 bottom-14 z-[1000] pointer-events-auto">
          <div className="bg-navy-900/95 border border-amber-500/40 text-amber-200 rounded-xl p-3 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                No active food listings within <strong>{selectedRadius} km</strong> of current focus.
              </span>
            </div>
            <button
              onClick={() => handleRadiusClick(20)}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-semibold text-[11px] border border-amber-500/30 whitespace-nowrap"
            >
              Expand to 20 km
            </button>
          </div>
        </div>
      )}

      {/* Bottom Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-navy-950/90 border border-slate-800 rounded-xl px-3 py-1.5 text-[11px] text-slate-300 flex flex-wrap items-center gap-3 backdrop-blur-md shadow-md pointer-events-auto">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm" />
          <span>Available Food ({filteredDonations.length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block shadow-sm" />
          <span>Verified NGO Hub</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block shadow-sm" />
          <span>Reference Point</span>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="w-full flex-1 relative min-h-[340px] sm:min-h-[420px] md:min-h-[480px]">
        <MapContainer
          center={activeCenter}
          zoom={zoomLevel}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', minHeight: '340px' }}
          className="w-full h-full min-h-[340px]"
        >
          <MapController
            center={activeCenter}
            zoom={zoomLevel}
            selectedDonation={selectedDonation}
          />

          {/* Canonical OpenStreetMap tile endpoint */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
            tileSize={256}
          />

          {/* Radius Visualization Circle */}
          {selectedRadius !== null && (
            <Circle
              center={userLocation.coords}
              radius={selectedRadius * 1000}
              pathOptions={{
                color: '#14b8a6',
                fillColor: '#0d9488',
                fillOpacity: 0.12,
                weight: 1.5,
                dashArray: '4, 6',
              }}
            />
          )}

          {/* Reference / User GPS / Fallback Marker */}
          <Marker
            position={userLocation.coords}
            icon={userLocation.isFallback ? iconFallbackUser : iconLiveUser}
          >
            <Popup>
              <div className="p-1 max-w-[220px]">
                <div className="flex items-center gap-1 text-xs font-bold text-teal-300">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>
                    {userLocation.isFallback
                      ? 'Development Fallback (Chennai)'
                      : 'Your Live GPS Location'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Coordinates: [{userLocation.coords[0].toFixed(4)},{' '}
                  {userLocation.coords[1].toFixed(4)}]
                </p>
                {userLocation.isFallback && (
                  <p className="text-[10px] text-amber-300/90 mt-1 leading-tight">
                    * Note: This is an assigned development fallback location used when browser GPS is denied or inactive.
                  </p>
                )}
              </div>
            </Popup>
          </Marker>

          {/* Food Donation Markers */}
          {filteredDonations.map((don) => {
            if (!don.location || !isValidCoordinate(don.location.latitude, don.location.longitude)) {
              return null;
            }
            const pos: [number, number] = [don.location.latitude!, don.location.longitude!];
            let icon = iconAvailable;
            if (don.status === 'RESERVED') icon = iconReserved;
            if (don.status === 'PICKED_UP') icon = iconInTransit;

            const distanceKm = calculateHaversineDistance(
              userLocation.coords[0],
              userLocation.coords[1],
              don.location.latitude!,
              don.location.longitude!
            );

            return (
              <Marker key={don.id} position={pos} icon={icon}>
                <Popup>
                  <div className="p-1 max-w-[240px]">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-1.5 mb-1.5">
                      <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                        {don.foodCategory.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {don.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-white leading-tight">
                      {don.title}
                    </h4>

                    <div className="mt-1.5 space-y-1 text-[11px] text-slate-300">
                      <div className="flex items-center justify-between">
                        <span>Servings:</span>
                        <strong className="text-white">
                          {don.estimatedServings} ({don.quantity} {don.unit})
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Distance:</span>
                        <strong className="text-teal-300">{formatDistance(distanceKm)}</strong>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Storage:</span>
                        <span className="font-semibold text-slate-200">
                          {don.storageConditions.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-700/60 pt-1.5">
                      <p className="truncate">📍 {don.location.address}</p>
                    </div>

                    {onSelectDonation && (
                      <button
                        onClick={() => onSelectDonation(don)}
                        className="mt-2.5 w-full py-1.5 px-2 rounded-lg bg-teal-500 text-navy-950 text-xs font-bold hover:bg-teal-400 transition-colors flex items-center justify-center gap-1 shadow-sm"
                      >
                        <span>Inspect Listing</span>
                        <span>→</span>
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Verified NGO Hub Markers */}
          {organisations.map((org) => {
            if (
              !org.geoCoordinates ||
              !isValidCoordinate(org.geoCoordinates.latitude, org.geoCoordinates.longitude)
            ) {
              return null;
            }
            const pos: [number, number] = [
              org.geoCoordinates.latitude!,
              org.geoCoordinates.longitude!,
            ];

            const distanceKm = calculateHaversineDistance(
              userLocation.coords[0],
              userLocation.coords[1],
              org.geoCoordinates.latitude!,
              org.geoCoordinates.longitude!
            );

            return (
              <Marker key={org.id} position={pos} icon={iconNgo}>
                <Popup>
                  <div className="p-1 max-w-[220px]">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">
                      <Building2 className="w-3 h-3" />
                      <span>Verified NGO Hub</span>
                    </div>
                    <h4 className="font-bold text-xs text-white">{org.name}</h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Capacity: <strong>{org.capacity} servings/run</strong>
                    </p>
                    <p className="text-[11px] text-teal-300 mt-0.5">
                      Distance: <strong>{formatDistance(distanceKm)}</strong>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 truncate">
                      📍 {org.address}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};
