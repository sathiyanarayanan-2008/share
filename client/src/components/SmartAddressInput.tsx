import React, { useState, useEffect, useRef } from 'react';
import { freeApiService, GeocodingResult, WeatherCondition } from '../services/freeApiService';
import { debounce } from '../services/apiCache';
import { MapPin, CloudRain, Thermometer, Check } from 'lucide-react';

interface SmartAddressInputProps {
  onAddressSelect: (result: GeocodingResult) => void;
  initialValue?: string;
}

export const SmartAddressInput: React.FC<SmartAddressInputProps> = ({
  onAddressSelect,
  initialValue = '',
}) => {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedWeather, setSelectedWeather] = useState<WeatherCondition | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced searcher (300ms delay to protect free API rate limits)
  const debouncedSearch = useRef(
    debounce(async (val: string) => {
      if (!val || val.trim().length < 3) {
        setResults([]);
        setLoading(false);
        return;
      }
      try {
        const data = await freeApiService.searchAddress(val);
        setResults(data);
        setIsOpen(data.length > 0);
      } catch (err) {
        console.error('Geocoding error', err);
      } finally {
        setLoading(false);
      }
    }, 300)
  ).current;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setLoading(true);
    debouncedSearch(val);
  };

  const handleSelect = async (item: GeocodingResult) => {
    setQuery(item.formattedAddress);
    setIsOpen(false);
    onAddressSelect(item);

    // Fetch real-time weather alerts for chosen location (cached 30m)
    try {
      const weather = await freeApiService.getWeatherAlert(item.latitude, item.longitude);
      setSelectedWeather(weather);
    } catch {
      // Ignored - fallback handled inside service
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative w-full space-y-2" ref={containerRef}>
      <label className="block text-xs font-semibold text-slate-300">
        Pickup Location Address (Powered by OpenStreetMap &amp; Photon)
      </label>

      <div className="relative">
        <MapPin className="w-4 h-4 text-teal-400 absolute left-3 top-3" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Start typing street address (e.g. 142 Delancey St)..."
          className="w-full pl-9 pr-10 py-2.5 bg-navy-950 border border-slate-700 rounded-xl text-white text-xs focus:border-teal-500 focus:outline-none"
        />
        {loading && (
          <div className="absolute right-3 top-3 w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-navy-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden divide-y divide-slate-800 text-xs">
          {results.map((item, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(item)}
              className="p-3 hover:bg-navy-800 cursor-pointer text-slate-200 hover:text-white flex items-start gap-2 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-teal-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold block">{item.name}</span>
                <span className="text-[11px] text-slate-400">{item.formattedAddress}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Real-time Weather & Cold-Chain Alert Banner */}
      {selectedWeather && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs animate-fade-in ${
            selectedWeather.isHighRiskForFood || selectedWeather.rainRisk
              ? 'bg-amber-950/70 border-amber-500/50 text-amber-300'
              : 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {selectedWeather.rainRisk ? (
              <CloudRain className="w-4 h-4 flex-shrink-0 text-amber-400" />
            ) : (
              <Thermometer className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            )}
            <div>
              <span className="font-bold">
                Ambient Temp: {selectedWeather.temperatureC}°C &bull; {selectedWeather.description}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Open-Meteo API</span>
        </div>
      )}
    </div>
  );
};
