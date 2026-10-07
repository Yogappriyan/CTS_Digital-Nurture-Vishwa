import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Star, 
  ExternalLink, 
  Navigation, 
  Clock, 
  ShieldCheck, 
  Search, 
  Compass, 
  Building2, 
  CheckCircle2,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface NearbySkincareModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLesionType?: string;
}

export const NearbySkincareModal: React.FC<NearbySkincareModalProps> = ({ 
  isOpen, 
  onClose,
  initialLesionType 
}) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'prompt' | 'loading' | 'success' | 'denied'>('prompt');
  const [customLocation, setCustomLocation] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'top_rated' | 'dermatology_specialist' | 'open_now' | 'urgent_skin_check'>('top_rated');

  // Request browser geolocation when modal opens
  useEffect(() => {
    if (isOpen && !coords && navigator.geolocation) {
      setLocationStatus('loading');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationStatus('success');
        },
        (error) => {
          console.warn('Geolocation access declined or unavailable:', error.message);
          setLocationStatus('denied');
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    }
  }, [isOpen, coords]);

  if (!isOpen) return null;

  // Build the Google Maps query URL based on location and filter
  const getGoogleMapsUrl = (filterType: string = selectedFilter) => {
    let queryTerm = 'top rated skincare center';
    
    if (filterType === 'top_rated') {
      queryTerm = 'top rated skincare center and dermatologist with high ratings';
    } else if (filterType === 'dermatology_specialist') {
      queryTerm = initialLesionType 
        ? `dermatology specialist clinic for ${initialLesionType} top rated`
        : 'board certified dermatologist clinic top rated';
    } else if (filterType === 'open_now') {
      queryTerm = 'skincare clinic dermatologist open now';
    } else if (filterType === 'urgent_skin_check') {
      queryTerm = 'skin cancer screening mole check dermatology clinic';
    }

    if (customLocation.trim()) {
      return `https://www.google.com/maps/search/${encodeURIComponent(`${queryTerm} in ${customLocation.trim()}`)}`;
    }

    if (coords) {
      // Precision coordinate query for user's exact area
      return `https://www.google.com/maps/search/${encodeURIComponent(queryTerm)}/@${coords.lat},${coords.lng},14z/data=!3m1!4b1!4m2!2m1!6e5`;
    }

    // Default universal query with automatic browser/Google IP localization
    return `https://www.google.com/maps/search/${encodeURIComponent(`${queryTerm} near me`)}`;
  };

  const handleRefreshLocation = () => {
    if (navigator.geolocation) {
      setLocationStatus('loading');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationStatus('success');
        },
        () => {
          setLocationStatus('denied');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  const handleOpenGoogleMaps = (filterType: string = selectedFilter) => {
    const url = getGoogleMapsUrl(filterType);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-5 text-left max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold border border-teal-200/60 dark:border-teal-800/60">
              <MapPin className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Find Nearby Skincare Centers
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>High Ratings</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct Google Maps lookup localized to your immediate vicinity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Location Detection Status Bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Compass className={`w-4 h-4 ${locationStatus === 'loading' ? 'animate-spin text-teal-600' : 'text-teal-600 dark:text-teal-400'}`} />
            <div>
              {locationStatus === 'loading' && (
                <span className="font-medium text-slate-600 dark:text-slate-400">Detecting your location...</span>
              )}
              {locationStatus === 'success' && coords && (
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live GPS detected near your current location
                </span>
              )}
              {(locationStatus === 'denied' || locationStatus === 'prompt') && (
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  Using IP/device location for nearby high-rated centers
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleRefreshLocation}
            className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            title="Refresh GPS"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Primary Hero Action Button */}
        <div className="space-y-2">
          <a
            href={getGoogleMapsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer text-center group"
          >
            <Navigation className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Open High-Rated Skincare Centers on Google Maps</span>
            <ExternalLink className="w-4 h-4 ml-0.5 opacity-80" />
          </a>
          <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
            Opens Google Maps with top ratings, user reviews, opening hours, and direct turn-by-turn directions.
          </p>
        </div>

        {/* Quick Filter Categories */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Search Specialized Categories Near You</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Filter 1: Top Rated Skincare Clinics */}
            <a
              href={getGoogleMapsUrl('top_rated')}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 rounded-xl flex items-start gap-2.5 transition-all text-left group hover:bg-teal-50/30 dark:hover:bg-teal-950/20"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/60 dark:border-amber-800/60">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300">
                    Highest Rated (4.5★+)
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-teal-600" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Top-rated dermatology & skincare
                </p>
              </div>
            </a>

            {/* Filter 2: Clinical Dermatology Specialist */}
            <a
              href={getGoogleMapsUrl('dermatology_specialist')}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 rounded-xl flex items-start gap-2.5 transition-all text-left group hover:bg-teal-50/30 dark:hover:bg-teal-950/20"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-200/60 dark:border-teal-800/60">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300">
                    Dermatology Specialists
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-teal-600" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Board-certified clinical doctors
                </p>
              </div>
            </a>

            {/* Filter 3: Urgent Skin & Mole Check */}
            <a
              href={getGoogleMapsUrl('urgent_skin_check')}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 rounded-xl flex items-start gap-2.5 transition-all text-left group hover:bg-teal-50/30 dark:hover:bg-teal-950/20"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200/60 dark:border-rose-800/60">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300">
                    Mole & Skin Checks
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-teal-600" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Melanoma & biopsy screening
                </p>
              </div>
            </a>

            {/* Filter 4: Open Now / Walk-In */}
            <a
              href={getGoogleMapsUrl('open_now')}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 rounded-xl flex items-start gap-2.5 transition-all text-left group hover:bg-teal-50/30 dark:hover:bg-teal-950/20"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-800/60">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300">
                    Open Now Clinics
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-teal-600" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Immediate availability & hours
                </p>
              </div>
            </a>
          </div>
        </div>

        {/* Optional Custom City / Postal Code Search */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            Or search for centers in a specific city or zip code:
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="e.g., Beverly Hills, London, 90210, Sydney..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleOpenGoogleMaps();
                  }
                }}
              />
            </div>
            <a
              href={getGoogleMapsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
            >
              <span>Search Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Preparation Guide for Skincare Visit */}
        <div className="p-3 bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40 rounded-xl space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
          <h5 className="font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Before You Visit:</span>
          </h5>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 dark:text-slate-400">
            <li>Check customer ratings and verified reviews on Google Maps before booking.</li>
            <li>Take or print your AI screening report and timestamped lesion photos.</li>
            <li>Confirm clinic consultation hours and insurance / specialist network coverage.</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
