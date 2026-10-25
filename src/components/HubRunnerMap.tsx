import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Compass, 
  Navigation2, 
  MapPin, 
  Search, 
  Crosshair, 
  Loader2, 
  CheckCircle2, 
  X, 
  Truck, 
  Dumbbell, 
  Phone, 
  ExternalLink,
  Footprints,
  Clock,
  Flame,
  Award,
  Lock,
  ArrowRight,
  Mail,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WorkoutLogEntry, GymWithTruckParking, GymChainType, TruckParkingType } from '../types';
import { 
  GYM_TRUCK_PARKING_DATABASE, 
  GYM_CHAINS_LIST, 
  TRUCK_PARKING_TYPES_LIST, 
  calculateDistanceMiles 
} from '../data/gymDatabase';

interface HubRunnerMapProps {
  onLogWorkout: (log: WorkoutLogEntry) => void;
  onNavigateToContact?: () => void;
}

export const HubRunnerMap: React.FC<HubRunnerMapProps> = ({
  onLogWorkout,
  onNavigateToContact
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedChain, setSelectedChain] = useState<string>('all');
  const [selectedParkingType, setSelectedParkingType] = useState<string>('all');
  const [selectedHighway, setSelectedHighway] = useState<string>('all');
  const [selectedRigType, setSelectedRigType] = useState<string>('all');
  const [selectedTransitType, setSelectedTransitType] = useState<string>('all');

  // GPS State
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'locked' | 'error'>('idle');
  const [gpsFeedback, setGpsFeedback] = useState<string | null>(null);
  const [driverCoordinates, setDriverCoordinates] = useState<{
    lat: number;
    lng: number;
    label: string;
  } | null>(null);

  // Selected Gym
  const [selectedGymId, setSelectedGymId] = useState<string>(GYM_TRUCK_PARKING_DATABASE[0].id);

  // Gym Workout Logging Modal State
  const [isLoggingModalOpen, setIsLoggingModalOpen] = useState(false);
  const [gymWorkoutTitle, setGymWorkoutTitle] = useState('Commercial Gym Workout & Shower');
  const [gymWorkoutDuration, setGymWorkoutDuration] = useState(45);
  const [gymWorkoutFocus, setGymWorkoutFocus] = useState('Free Weights & Dumbbells');
  const [gymWorkoutNotes, setGymWorkoutNotes] = useState('');

  // Selected Gym Object
  const activeGym: GymWithTruckParking = useMemo(() => {
    return (
      GYM_TRUCK_PARKING_DATABASE.find((g) => g.id === selectedGymId) ||
      GYM_TRUCK_PARKING_DATABASE[0]
    );
  }, [selectedGymId]);

  // Highway options computed from database
  const highwayOptions = useMemo(() => {
    return ['all', 'I-80', 'I-40', 'I-10', 'I-75', 'I-70', 'I-44', 'I-35', 'I-5', 'I-95'];
  }, []);

  // Filter & Sort Gyms
  const filteredGyms = useMemo(() => {
    let result = [...GYM_TRUCK_PARKING_DATABASE];

    // Filter by highway
    if (selectedHighway !== 'all') {
      result = result.filter((g) => g.highway.toLowerCase().includes(selectedHighway.toLowerCase()));
    }

    // Filter by chain
    if (selectedChain !== 'all') {
      result = result.filter((g) => g.chain === selectedChain);
    }

    // Filter by parking type
    if (selectedParkingType !== 'all') {
      result = result.filter((g) => g.parkingType === selectedParkingType);
    }

    // Filter by rig compatibility
    if (selectedRigType !== 'all') {
      result = result.filter((g) => g.rigCompatibility === selectedRigType);
    }

    // Filter by truck stop distance and transit mode
    if (selectedTransitType === 'onsite_0mi') {
      result = result.filter((g) => g.nearestTruckStop.distanceMiles === 0.0);
    } else if (selectedTransitType === 'walkable') {
      result = result.filter((g) => g.nearestTruckStop.distanceMiles <= 0.5);
    } else if (selectedTransitType === 'short_ride') {
      result = result.filter((g) => g.nearestTruckStop.distanceMiles > 0.5 && g.nearestTruckStop.distanceMiles <= 3.0);
    } else if (selectedTransitType === 'bobtail') {
      result = result.filter((g) => g.nearestTruckStop.distanceMiles > 3.0 && g.nearestTruckStop.distanceMiles <= 6.0);
    } else if (selectedTransitType === 'onsite') {
      result = result.filter((g) => g.parkingType === "Dedicated Semi / 53' Lot" || g.parkingType === 'Big Box / Walmart Shared Apron');
    }

    // Filter by free text search (name, city, state, address, highway)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.city.toLowerCase().includes(q) ||
          g.state.toLowerCase().includes(q) ||
          g.highway.toLowerCase().includes(q) ||
          g.chain.toLowerCase().includes(q) ||
          g.address.toLowerCase().includes(q)
      );
    }

    // Sort by GPS distance if GPS is locked
    if (driverCoordinates) {
      result.sort((a, b) => {
        const distA = calculateDistanceMiles(driverCoordinates.lat, driverCoordinates.lng, a.lat, a.lng);
        const distB = calculateDistanceMiles(driverCoordinates.lat, driverCoordinates.lng, b.lat, b.lng);
        return distA - distB;
      });
    }

    return result;
  }, [
    searchQuery,
    selectedChain,
    selectedParkingType,
    selectedHighway,
    selectedRigType,
    selectedTransitType,
    driverCoordinates
  ]);

  // GPS Geolocation Handler
  const handleRequestGPS = () => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      setGpsFeedback('Geolocation is not supported by your browser.');
      return;
    }

    setGpsStatus('locating');
    setGpsFeedback('Locking onto satellite & cellular GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setDriverCoordinates({
          lat: latitude,
          lng: longitude,
          label: `GPS Fix (±${Math.round(accuracy)}m)`
        });
        setGpsStatus('locked');
        setGpsFeedback(`GPS Locked: ${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°. Sorted by distance!`);
      },
      (err) => {
        // Fallback to central I-80 corridor (Iowa 80 / Walcott area) so user still gets an intuitive proximity sort
        setDriverCoordinates({
          lat: 41.5782,
          lng: -90.6284,
          label: 'Default Corridor Fix (I-80 Corridor)'
        });
        setGpsStatus('locked');
        setGpsFeedback('GPS permission denied or timed out. Defaulted to major I-80 freight corridor.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedChain('all');
    setSelectedParkingType('all');
    setSelectedHighway('all');
    setSelectedRigType('all');
    setSelectedTransitType('all');
  };

  // Open Log Modal with Gym Information Pre-filled
  const handleOpenLogModal = () => {
    setGymWorkoutTitle(`${activeGym.chain} Session (${activeGym.city}, ${activeGym.state})`);
    setGymWorkoutDuration(45);
    setGymWorkoutFocus('Free Weights, Cables & Shower');
    setGymWorkoutNotes(`Staged semi at ${activeGym.parkingType}. Parking distance: ${activeGym.parkingDistance}. Amenities used: ${activeGym.amenities.slice(0, 3).join(', ')}.`);
    setIsLoggingModalOpen(true);
  };

  // Confirm and Save Log
  const handleConfirmLog = () => {
    const estimatedCalories = Math.round(gymWorkoutDuration * 8.5); // ~380 kcal for 45 mins
    const newLog: WorkoutLogEntry = {
      id: `gym-log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'gym-workout',
      title: gymWorkoutTitle || `${activeGym.chain} Gym Workout`,
      durationMinutes: Number(gymWorkoutDuration) || 40,
      caloriesBurned: estimatedCalories,
      notes: `${gymWorkoutFocus ? `Focus: ${gymWorkoutFocus}. ` : ''}${gymWorkoutNotes}`.trim()
    };

    onLogWorkout(newLog);
    setIsLoggingModalOpen(false);
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          TOP COMMAND BANNER
          ========================================================================= */}
      <div className="bg-[#12161F] border-l-4 border-[#FF6B00] border-y border-r border-[#202733] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B00]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-tactical font-black bg-[#FF6B00] text-[#0D0F12] uppercase tracking-wider">
                DRIVER AMENITY DIRECTORY
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-tactical font-bold uppercase">
                {filteredGyms.length} GYMS WITH SEMI PARKING
              </span>
              <span className="text-xs font-tactical text-slate-400 hidden sm:inline">
                • Interstate Corridors
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-heading tracking-wide">
              Gyms with Commercial Truck Parking
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed font-tactical">
              Find commercial fitness clubs (Planet Fitness, Anytime Fitness, Crunch, YMCA, Gold&apos;s, Snap, 24 Hour) situated directly next to legal semi parking, adjacent travel plazas, or big-box staging aprons. Access hot showers, heavy barbells, and full recovery facilities while legally parked.
            </p>
          </div>

          {/* GPS Location Finder Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={handleRequestGPS}
              disabled={gpsStatus === 'locating'}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A222F] hover:bg-[#242F40] border border-[#2D3A4F] text-xs font-tactical font-bold text-white uppercase tracking-wider transition shadow-lg"
            >
              {gpsStatus === 'locating' ? (
                <>
                  <Loader2 className="w-4 h-4 text-[#FF6B00] animate-spin" />
                  <span>Locking GPS...</span>
                </>
              ) : (
                <>
                  <Crosshair className="w-4 h-4 text-[#FF6B00]" />
                  <span>{driverCoordinates ? 'Re-acquire GPS' : 'Find Gyms Near Me'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleOpenLogModal}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#FF8526] text-[#0A0D12] text-xs font-tactical font-black uppercase tracking-wider transition shadow-lg shadow-[#FF6B00]/25"
            >
              <Dumbbell className="w-4 h-4 fill-current" />
              <span>Log Gym Session</span>
            </button>
          </div>
        </div>

        {/* GPS Status Indicator Feedback */}
        {gpsFeedback && (
          <div className="mt-3 text-xs font-tactical text-slate-300 flex items-center gap-2 bg-[#0A0D12] p-2 rounded-lg border border-[#1E2633]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{gpsFeedback}</span>
          </div>
        )}
      </div>

      {/* =========================================================================
          SEARCH & FILTER COMMAND BAR
          ========================================================================= */}
      <div className="bg-[#12161F] border border-[#222E3E] rounded-2xl p-4 shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Keyword Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city, state, gym, or highway..."
              className="w-full bg-[#0A0D12] border border-[#243040] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 font-tactical focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          {/* Highway Corridor */}
          <div>
            <select
              value={selectedHighway}
              onChange={(e) => setSelectedHighway(e.target.value)}
              className="w-full bg-[#0A0D12] border border-[#243040] rounded-xl px-3 py-2 text-xs text-white font-tactical focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="all">Highway: All Corridors</option>
              {highwayOptions
                .filter((h) => h !== 'all')
                .map((hw) => (
                  <option key={hw} value={hw}>
                    {hw} Corridor
                  </option>
                ))}
            </select>
          </div>

          {/* Gym Chain */}
          <div>
            <select
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value)}
              className="w-full bg-[#0A0D12] border border-[#243040] rounded-xl px-3 py-2 text-xs text-white font-tactical focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="all">Chain: All Gyms</option>
              {GYM_CHAINS_LIST.map((chain) => (
                <option key={chain} value={chain}>
                  {chain}
                </option>
              ))}
            </select>
          </div>

          {/* Truck Stop Distance & Transit Mode */}
          <div>
            <select
              value={selectedTransitType}
              onChange={(e) => setSelectedTransitType(e.target.value)}
              className="w-full bg-[#0A0D12] border border-[#243040] rounded-xl px-3 py-2 text-xs text-white font-tactical focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="all">Truck Stop: All Distances</option>
              <option value="onsite_0mi">🏢 Inside Stop (0.0 mi)</option>
              <option value="walkable">🚶 Walkable (&le;0.5 mi)</option>
              <option value="short_ride">🚕 Short Ride (1-3 mi)</option>
              <option value="bobtail">🚛 Bobtail (3-6 mi)</option>
              <option value="onsite">🅿️ On-Site Semi Apron</option>
            </select>
          </div>

          {/* Rig Compatibility */}
          <div>
            <select
              value={selectedRigType}
              onChange={(e) => setSelectedRigType(e.target.value)}
              className="w-full bg-[#0A0D12] border border-[#243040] rounded-xl px-3 py-2 text-xs text-white font-tactical focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="all">Rig: All Sizes</option>
              <option value="Full 53ft Combo">Full 53ft Combo Only</option>
              <option value="Bobtail Only">Bobtail Friendly</option>
              <option value="Wide Staging Curb">Wide Staging Curb</option>
            </select>
          </div>
        </div>

        {/* Filter tags & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1C2533] text-xs font-tactical">
          <div className="flex flex-wrap items-center gap-1.5 text-slate-400">
            <span>Filter Active:</span>
            {selectedHighway !== 'all' && (
              <span className="px-2 py-0.5 rounded bg-[#1C2533] text-white border border-[#2C3B4E]">
                Hwy: {selectedHighway}
              </span>
            )}
            {selectedChain !== 'all' && (
              <span className="px-2 py-0.5 rounded bg-[#1C2533] text-white border border-[#2C3B4E]">
                {selectedChain}
              </span>
            )}
            {selectedTransitType !== 'all' && (
              <span className="px-2 py-0.5 rounded bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30 font-bold">
                Transit: {selectedTransitType === 'onsite_0mi' ? 'Inside Stop (0.0 mi)' : selectedTransitType === 'walkable' ? 'Walkable (<0.5 mi)' : selectedTransitType === 'short_ride' ? 'Short Ride (1-3 mi)' : selectedTransitType === 'bobtail' ? 'Bobtail (3-6 mi)' : 'On-Site Lot'}
              </span>
            )}
            {selectedRigType !== 'all' && (
              <span className="px-2 py-0.5 rounded bg-[#1C2533] text-white border border-[#2C3B4E]">
                {selectedRigType}
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-0.5 rounded bg-[#1C2533] text-white border border-[#2C3B4E]">
                &quot;{searchQuery}&quot;
              </span>
            )}
            {selectedHighway === 'all' &&
              selectedChain === 'all' &&
              selectedRigType === 'all' &&
              selectedTransitType === 'all' &&
              !searchQuery && (
                <span className="text-slate-500">Showing all verified freight stops with calibrated distances</span>
              )}
          </div>

          {(selectedHighway !== 'all' ||
            selectedChain !== 'all' ||
            selectedRigType !== 'all' ||
            selectedTransitType !== 'all' ||
            searchQuery) && (
            <button
              onClick={handleClearFilters}
              className="text-[#FF6B00] hover:underline flex items-center gap-1 font-bold"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          MAIN 2-COLUMN LAYOUT: GYM LIST + SELECTED GYM DOSSIER
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =========================================================================
            LEFT COLUMN: GYM DIRECTORY LIST
            ========================================================================= */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-tactical font-black text-slate-400 uppercase tracking-wider">
              VERIFIED LOCATIONS ({filteredGyms.length})
            </span>
            {driverCoordinates && (
              <span className="text-[11px] font-tactical text-emerald-400">
                Sorted by distance from your cab
              </span>
            )}
          </div>

          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
            {filteredGyms.length === 0 ? (
              <div className="bg-[#12161F] border border-[#202733] rounded-2xl p-8 text-center space-y-3">
                <Dumbbell className="w-10 h-10 text-slate-500 mx-auto" />
                <h4 className="text-base font-heading font-black text-white uppercase">
                  No Gyms Match Current Filter
                </h4>
                <p className="text-xs text-slate-400 font-tactical max-w-xs mx-auto">
                  Try clearing highway or chain filters to view all commercial gym locations with semi parking.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 rounded-xl bg-[#FF6B00] text-[#0A0D12] text-xs font-tactical font-black uppercase"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredGyms.map((gym) => {
                const isSelected = gym.id === selectedGymId;
                const distanceMiles = driverCoordinates
                  ? calculateDistanceMiles(driverCoordinates.lat, driverCoordinates.lng, gym.lat, gym.lng)
                  : null;

                return (
                  <div
                    key={gym.id}
                    onClick={() => setSelectedGymId(gym.id)}
                    className={`cursor-pointer rounded-2xl p-4 transition border ${
                      isSelected
                        ? 'bg-[#18212D] border-[#FF6B00] shadow-xl shadow-[#FF6B00]/10'
                        : 'bg-[#12161F] border-[#222E3E] hover:border-slate-600 hover:bg-[#151C26]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-tactical font-black bg-[#202B3A] text-slate-200 border border-[#2F3D52] uppercase">
                            {gym.chain}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-tactical font-bold bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30">
                            {gym.highway}
                          </span>
                          <span className="text-[10px] font-tactical text-amber-300 font-semibold">
                            {gym.rigCompatibility}
                          </span>
                        </div>

                        <h4 className="text-sm font-heading font-black text-white uppercase">
                          {gym.name}
                        </h4>

                        <p className="text-xs text-slate-400 font-tactical">
                          {gym.city}, {gym.state} • {gym.address}
                        </p>
                      </div>

                      {/* Distance / Select indicator */}
                      <div className="text-right shrink-0">
                        {distanceMiles !== null ? (
                          <div className="text-right">
                            <span className="text-base font-heading font-black text-white">
                              {distanceMiles}
                            </span>
                            <span className="text-[10px] font-tactical text-slate-400 block">
                              MILES AWAY
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-tactical px-2 py-1 rounded bg-[#10141C] text-slate-400 border border-[#1E2530]">
                            {gym.truckSpacesEstimated}+ SPOTS
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Specs Footprint */}
                    <div className="mt-3 pt-2.5 border-t border-[#1C2533] space-y-1.5 text-[11px] font-tactical">
                      <div className="flex flex-wrap items-center justify-between text-slate-300 gap-2">
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <Truck className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[210px]">{gym.parkingType}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <Footprints className="w-3.5 h-3.5 text-[#FF6B00]" />
                          <span className="truncate max-w-[180px]">{gym.parkingDistance}</span>
                        </div>
                      </div>

                      {/* Verified Truck Stop Micro-Badge */}
                      {gym.nearestTruckStop && (
                        <div className="flex items-center justify-between gap-1 text-[10px] bg-[#0B0E14] px-2 py-1 rounded border border-[#1A222F]">
                          <span className="text-slate-400 truncate max-w-[220px]">
                            Stop: <strong className="text-white">{gym.nearestTruckStop.name.split('(')[0].trim()}</strong>
                          </span>
                          <span className={`px-1.5 py-0.2 rounded font-bold shrink-0 ${
                            gym.nearestTruckStop.distanceMiles <= 0.5
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : gym.nearestTruckStop.distanceMiles <= 3.0
                              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {gym.nearestTruckStop.distanceMiles} mi ({gym.nearestTruckStop.transitType.split(' ')[0]})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: SELECTED GYM DOSSIER & WORKOUT PROTOCOLS
            ========================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          {/* Selected Gym Dossier Card */}
          <div className="bg-[#12161F] border border-[#222E3E] rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#1E2838]">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded bg-[#FF6B00] text-[#0A0D12] text-xs font-tactical font-black uppercase tracking-wider">
                    TARGET FACILITY
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#1E2838] text-slate-200 text-xs font-tactical">
                    {activeGym.highway}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-tactical font-bold">
                    {activeGym.chain}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-heading font-black text-white uppercase tracking-tight">
                  {activeGym.name}
                </h3>
                <p className="text-xs text-slate-300 font-tactical mt-0.5">
                  {activeGym.address}
                </p>
              </div>

              {/* Navigation and Call Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`tel:${activeGym.phone.replace(/[^0-9]/g, '')}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1A222F] hover:bg-[#253042] border border-[#2A374A] text-xs font-tactical font-bold text-slate-200 transition"
                  title="Call front desk to confirm 24/7 hours or day pass"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call Gym</span>
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activeGym.name + ', ' + activeGym.address)}&travelmode=driving`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#FF8526] text-[#0A0D12] text-xs font-tactical font-black uppercase transition shadow-lg shadow-[#FF6B00]/20"
                  title="Launch turn-by-turn driving directions directly to gym entrance"
                >
                  <Navigation2 className="w-3.5 h-3.5" />
                  <span>Navigate to Gym</span>
                </a>
              </div>
            </div>

            {/* VERIFIED TRUCK STOP PROXIMITY & ROAD DISTANCE CALIBRATION PANEL */}
            {activeGym.nearestTruckStop && (
              <div className="bg-gradient-to-br from-[#151D28] to-[#0E131C] border-2 border-emerald-500/40 rounded-xl p-4 shadow-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#212E40] pb-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-xs font-heading font-black text-white uppercase tracking-wider block">
                        Verified Truck Stop Distance &amp; Transit Calibration
                      </span>
                      <span className="text-[10px] text-slate-400 font-tactical">
                        Accurate road distance from nearest commercial semi parking
                      </span>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto px-2.5 py-0.5 rounded-full text-[10px] font-tactical font-bold uppercase tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Audit Checked
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-8 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-tactical font-black uppercase bg-[#202E42] text-slate-200 border border-[#2D3E56]">
                        {activeGym.nearestTruckStop.brand}
                      </span>
                      <span className="text-sm font-bold text-white font-tactical">
                        {activeGym.nearestTruckStop.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-tactical">
                      <span className="text-amber-400 font-semibold">{activeGym.nearestTruckStop.highwayExit}</span> • {activeGym.nearestTruckStop.address}
                    </p>
                    {activeGym.nearestTruckStop.verifiedNotes && (
                      <p className="text-[11px] text-slate-400 font-tactical italic">
                        &quot;{activeGym.nearestTruckStop.verifiedNotes}&quot;
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-4 flex flex-col items-start sm:items-end justify-center bg-[#090C12] p-2.5 rounded-lg border border-[#1A2330]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black font-heading text-emerald-400">
                        {activeGym.nearestTruckStop.distanceMiles}
                      </span>
                      <span className="text-xs font-tactical text-slate-400 uppercase">
                        Road Miles
                      </span>
                    </div>
                    <span className={`text-[10px] font-tactical font-bold px-2 py-0.5 rounded mt-1 ${
                      activeGym.nearestTruckStop.distanceMiles <= 0.5
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : activeGym.nearestTruckStop.distanceMiles <= 3.0
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {activeGym.nearestTruckStop.walkOrDriveTime} ({activeGym.nearestTruckStop.transitType.split(' ')[0]})
                    </span>
                    <span className="text-[9px] text-slate-500 font-tactical mt-0.5">
                      ~{activeGym.nearestTruckStop.truckStalls} Truck Stalls
                    </span>
                  </div>
                </div>

                {/* Direct Turn-by-Turn GPS Directions */}
                <div className="pt-2 border-t border-[#1C2736] space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-tactical">
                    <span className="font-bold text-white flex items-center gap-1.5 uppercase">
                      <Navigation2 className="w-3.5 h-3.5 text-[#FF6B00]" />
                      Commercial Turn-by-Turn GPS Routing:
                    </span>
                    <span className="text-emerald-400 text-[10px]">
                      Routes explicitly from Truck Stop fuel island &amp; semi lot (not hotels)
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(activeGym.nearestTruckStop.brand + ' ' + activeGym.nearestTruckStop.name + ' Commercial Truck Stop, ' + activeGym.nearestTruckStop.address)}&destination=${encodeURIComponent(activeGym.name + ', ' + activeGym.address)}&travelmode=driving`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#FF6B00] hover:bg-[#FF8526] text-[#0A0D12] text-xs font-tactical font-black uppercase transition shadow-md shadow-[#FF6B00]/25"
                      title="Starts GPS route directly at the truck stop commercial parking bays to avoid adjacent motels"
                    >
                      <Navigation2 className="w-3.5 h-3.5 fill-current" />
                      <span>Turn-by-Turn: Truck Stop ➔ Gym</span>
                    </a>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activeGym.nearestTruckStop.brand + ' ' + activeGym.nearestTruckStop.name + ' Commercial Truck Stop, ' + activeGym.nearestTruckStop.address)}&travelmode=driving`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#141B26] hover:bg-[#1E2736] text-slate-200 hover:text-white border border-[#2B394D] text-xs font-tactical font-bold transition"
                      title="Routes directly to the commercial semi entrance and diesel canopy"
                    >
                      <Truck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Drive to Truck Stop</span>
                    </a>

                    {driverCoordinates && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${driverCoordinates.lat},${driverCoordinates.lng}&destination=${encodeURIComponent(activeGym.name + ', ' + activeGym.address)}&travelmode=driving`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121A26] hover:bg-[#1C2738] text-slate-300 hover:text-white border border-[#23354C] text-[11px] font-tactical transition"
                      >
                        <Crosshair className="w-3 h-3 text-emerald-400" />
                        <span>Route from My Current Cab GPS Fix ➔ Gym</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* INTERACTIVE GEOSPATIAL MAP & ROUTE RADAR */}
            <div className="bg-[#0A0D12] rounded-xl border border-[#1E2838] overflow-hidden shadow-lg">
              <div className="flex items-center justify-between p-3 border-b border-[#1E2838] bg-[#12161F]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FF6B00]" />
                  <span className="text-xs font-heading font-black text-white uppercase tracking-wider">
                    Corridor Geospatial Satellite Map
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                    ({activeGym.lat.toFixed(4)}° N, {Math.abs(activeGym.lng).toFixed(4)}° W)
                  </span>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeGym.name + ' ' + activeGym.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-tactical font-bold text-[#FF6B00] hover:underline flex items-center gap-1"
                >
                  <span>Full Google Map</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative w-full h-[220px] bg-[#080B10]">
                <iframe
                  title={`Map of ${activeGym.name}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${activeGym.lng - 0.02}%2C${activeGym.lat - 0.015}%2C${activeGym.lng + 0.02}%2C${activeGym.lat + 0.015}&layer=mapnik&marker=${activeGym.lat}%2C${activeGym.lng}`}
                />
              </div>
              <div className="px-3 py-2 bg-[#0E121A] flex flex-wrap items-center justify-between gap-2 text-[10px] font-tactical border-t border-[#1C2533]">
                <span className="text-slate-400">
                  Pin: <strong className="text-white">{activeGym.name}</strong> • Staging Hub: <strong className="text-emerald-400">{activeGym.nearestTruckStop.name}</strong>
                </span>
                <span className="text-emerald-400 font-bold">
                  ✓ Verified Freight Coordinates
                </span>
              </div>
            </div>

            {/* Truck Parking & Rig Staging Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#0A0D12] p-3.5 rounded-xl border border-[#1A2433]">
                <span className="text-[10px] font-tactical text-slate-400 uppercase block font-bold">TRUCK PARKING SETUP</span>
                <span className="text-xs font-bold text-white font-tactical block mt-1">
                  {activeGym.parkingType}
                </span>
                <span className="text-[11px] text-emerald-400 font-tactical mt-1 block">
                  ~{activeGym.truckSpacesEstimated} Commercial Stalls
                </span>
              </div>

              <div className="bg-[#0A0D12] p-3.5 rounded-xl border border-[#1A2433]">
                <span className="text-[10px] font-tactical text-slate-400 uppercase block font-bold">RIG COMPATIBILITY</span>
                <span className="text-xs font-bold text-amber-300 font-tactical block mt-1">
                  {activeGym.rigCompatibility}
                </span>
                <span className="text-[11px] text-slate-400 font-tactical mt-1 block">
                  Turning Radius Cleared
                </span>
              </div>

              <div className="bg-[#0A0D12] p-3.5 rounded-xl border border-[#1A2433]">
                <span className="text-[10px] font-tactical text-slate-400 uppercase block font-bold">CAB TO ENTRANCE DISTANCE</span>
                <span className="text-xs font-bold text-white font-tactical block mt-1">
                  {activeGym.parkingDistance}
                </span>
                <span className="text-[11px] text-sky-400 font-tactical mt-1 block">
                  Direct Paved Access
                </span>
              </div>
            </div>

            {/* Walking Path from Cab to Entrance */}
            <div className="p-3.5 bg-[#161C26] border-l-4 border-[#FF6B00] rounded-r-xl space-y-1.5 text-xs font-tactical">
              <span className="font-bold text-white uppercase block flex items-center gap-1.5">
                <Footprints className="w-4 h-4 text-[#FF6B00]" />
                Driver Walk Route from Staging to Front Door:
              </span>
              <p className="text-slate-300 leading-relaxed">
                {activeGym.walkRouteNotes}
              </p>
            </div>

            {/* Linehaul Driver Staging Pro-Tips */}
            <div className="p-3.5 bg-[#0A0D12] border border-[#1E2838] rounded-xl space-y-1.5 text-xs font-tactical">
              <span className="font-bold text-[#FF6B00] uppercase block flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#FF6B00]" />
                Linehaul Driver Staging Directive:
              </span>
              <p className="text-slate-300 leading-relaxed">
                {activeGym.driverNotes}
              </p>
            </div>

            {/* Amenities Badges */}
            <div className="space-y-2">
              <span className="text-[10px] font-tactical text-slate-400 uppercase tracking-wider block font-bold">
                GYM AMENITIES & RECOVERY FEATURES
              </span>
              <div className="flex flex-wrap gap-2">
                {activeGym.amenities.map((am, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-lg bg-[#18212D] text-slate-200 border border-[#263548] text-xs font-tactical flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{am}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Driver Quick Action to Log Session */}
            <div className="pt-2 border-t border-[#1C2533] flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-400 font-tactical">
                Workout completed at this facility? Record it in your driver logbook.
              </span>
              <button
                onClick={handleOpenLogModal}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#FF8526] text-[#0A0D12] text-xs font-tactical font-black uppercase tracking-wider transition shadow-lg shadow-[#FF6B00]/25"
              >
                <CheckCircle2 className="w-4 h-4 fill-current" />
                <span>Log Gym Session to Logbook</span>
              </button>
            </div>
          </div>

          {/* Staging Safety Checklist Card */}
          <div className="bg-[#12161F] border border-[#222E3E] rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1E2838]">
              <Lock className="w-4 h-4 text-[#FF6B00]" />
              <h4 className="text-sm font-heading font-black text-white uppercase tracking-wide">
                Semi-Truck Staging Security Checklist
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-tactical text-slate-300">
              <div className="p-3 bg-[#0A0D12] rounded-xl border border-[#1A2433] space-y-1">
                <span className="text-white font-bold block uppercase text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  1. Secure Your Freight & Cab
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Lock all cab doors, pull bunk privacy curtains, and ensure trailer padlock/seal is intact before heading inside.
                </p>
              </div>

              <div className="p-3 bg-[#0A0D12] rounded-xl border border-[#1A2433] space-y-1">
                <span className="text-white font-bold block uppercase text-[11px] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  2. Mind Your HOS Clock
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Log as Off-Duty or Sleeper Berth during your gym stop. Keep workout and shower to 45–60 minutes to protect sleep cycle.
                </p>
              </div>
            </div>
          </div>

          {/* Separate 1-on-1 Running Coaching Directive Card */}
          <div className="bg-gradient-to-br from-[#1A1815] to-[#12161F] border border-[#FF6B00]/40 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#FF6B00] text-[#0A0D12] text-[10px] font-tactical font-black uppercase tracking-wider">
                    SEPARATE 1-ON-1 COACHING
                  </span>
                  <span className="text-xs font-tactical text-slate-400">Personalized Programming</span>
                </div>
                <h4 className="text-base font-heading font-black text-white uppercase tracking-wide">
                  Looking to Train for Road Running or Endurance Cardio?
                </h4>
                <p className="text-xs text-slate-300 font-tactical leading-relaxed max-w-xl">
                  Running in commercial freight yards is strictly separated from general road training. If you want to train for 5Ks, sustained aerobic running, or endurance conditioning as a truck driver, Coach AJ coaches running separately on an individualized 1-on-1 basis tailored to your physical readiness, joint history, and shift schedule.
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/15 border border-[#FF6B00]/40 flex items-center justify-center shrink-0 text-[#FF6B00]">
                <Award className="w-5 h-5" />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-[#262A33]">
              <span className="text-[11px] text-slate-400 font-tactical">
                ISSA Elite Trainer & Certified Running Coach AJ Risner
              </span>
              {onNavigateToContact && (
                <button
                  onClick={onNavigateToContact}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#202734] hover:bg-[#2A3445] text-white border border-[#334257] text-xs font-tactical font-bold uppercase transition"
                >
                  <Mail className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Request 1-on-1 Running Coaching</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          LOG GYM SESSION MODAL
          ========================================================================= */}
      {isLoggingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12161F] border-2 border-[#FF6B00] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#1E2838] pb-3">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-[#FF6B00]" />
                <h3 className="text-lg font-heading font-black text-white uppercase">
                  Log Gym Workout Session
                </h3>
              </div>
              <button
                onClick={() => setIsLoggingModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[#1A222F] text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-tactical">
              <div>
                <label className="text-xs text-slate-400 uppercase block mb-1">
                  Facility & Session Name
                </label>
                <input
                  type="text"
                  value={gymWorkoutTitle}
                  onChange={(e) => setGymWorkoutTitle(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-[#243040] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 uppercase block mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={gymWorkoutDuration}
                    onChange={(e) => setGymWorkoutDuration(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-[#0A0D12] border border-[#243040] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 uppercase block mb-1">
                    Est. Burn
                  </label>
                  <div className="w-full bg-[#0A0D12] border border-[#243040] rounded-xl px-3 py-2 text-xs text-[#FF6B00] font-mono font-bold">
                    ~{Math.round(gymWorkoutDuration * 8.5)} KCAL
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 uppercase block mb-1">
                  Session Focus
                </label>
                <select
                  value={gymWorkoutFocus}
                  onChange={(e) => setGymWorkoutFocus(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-[#243040] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                >
                  <option value="Free Weights & Dumbbells">Free Weights & Dumbbells</option>
                  <option value="Olympic Barbells & Squats">Olympic Barbells & Squats</option>
                  <option value="Back, Lats & Spinal Decompression">Back, Lats & Spinal Decompression</option>
                  <option value="Full Body Circuit">Full Body Circuit</option>
                  <option value="Sauna, Shower & Mobility Reset">Sauna, Shower & Mobility Reset</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 uppercase block mb-1">
                  Driver Notes / Staging Context
                </label>
                <textarea
                  value={gymWorkoutNotes}
                  onChange={(e) => setGymWorkoutNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-[#0A0D12] border border-[#243040] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                  placeholder="Notes on parking ease, equipment used, or shower quality..."
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#1E2838]">
              <button
                onClick={() => setIsLoggingModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-tactical font-bold text-slate-400 hover:text-white uppercase"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLog}
                className="px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#FF8526] text-[#0A0D12] text-xs font-tactical font-black uppercase transition shadow-lg shadow-[#FF6B00]/25"
              >
                Save to Logbook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
