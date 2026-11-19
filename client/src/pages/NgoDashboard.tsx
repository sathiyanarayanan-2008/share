import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Donation, Claim, MatchingResult, Organisation } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { FoodSafetyModal } from '../components/FoodSafetyModal';
import { MatchingExplainerModal } from '../components/MatchingExplainerModal';
import { QrModal } from '../components/QrModal';
import { ReportModal } from '../components/ReportModal';
import { MapView } from '../components/MapView';
import {
  HeartHandshake,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  QrCode,
  ShieldAlert,
  Building2,
  Edit2,
  AlertCircle,
  HelpCircle,
  Check,
  RefreshCw,
  Sparkles,
  Map as MapIcon
} from 'lucide-react';

export const NgoDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'DISCOVER' | 'CLAIMS' | 'PROFILE'>('DISCOVER');
  const [matchedDonations, setMatchedDonations] = useState<MatchingResult[]>([]);
  const [myClaims, setMyClaims] = useState<Claim[]>([]);
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState<boolean>(true);

  // Filter
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [minScore, setMinScore] = useState<number>(0);

  // Modals
  const [claimingDonation, setClaimingDonation] = useState<Donation | null>(null);
  const [explainerMatch, setExplainerMatch] = useState<MatchingResult | null>(null);
  const [qrModalData, setQrModalData] = useState<{
    token: string;
    type: string;
    expiresAt: string;
    instructions: string;
  } | null>(null);
  const [reportingTarget, setReportingTarget] = useState<{ id: string; title: string } | null>(null);

  // Capacity update
  const [newCapacity, setNewCapacity] = useState<number>(150);
  const [capacityUpdatedMsg, setCapacityUpdatedMsg] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [matchesRes, claimsRes] = await Promise.all([
        api.get('/donations/matches-for-ngo'),
        api.get('/claims/my'),
      ]);
      setMatchedDonations(matchesRes.data);
      setMyClaims(claimsRes.data);

      if (user?.organisationId) {
        const orgRes = await api.get(`/organisations/${user.organisationId}`);
        setOrganisation(orgRes.data);
        setNewCapacity(orgRes.data.capacity);
      }
    } catch (err) {
      console.error('Error loading NGO dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleReserveConfirm = async (allocatedServings: number) => {
    if (!claimingDonation) return;
    try {
      await api.post(`/claims/${claimingDonation.id}`, {
        allocatedServings,
        safetyAcknowledgementAccepted: true,
      });
      setClaimingDonation(null);
      fetchDashboardData();
      setActiveTab('CLAIMS');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reserve donation. Another NGO may have claimed it.');
    }
  };

  const handleGenerateDeliveryQR = async (claim: Claim) => {
    try {
      const allPickups = await api.get('/pickups/all');
      const pickup = allPickups.data.find((p: any) => p.claimId === claim.id);

      if (!pickup) {
        alert('A volunteer has not yet been assigned to this claim.');
        return;
      }

      const tokenRes = await api.post(`/pickups/${pickup.id}/token?type=NGO_DELIVERY`);
      setQrModalData(tokenRes.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate delivery receipt token.');
    }
  };

  const handleDirectConfirmDelivery = async (claim: Claim) => {
    if (!window.confirm('Confirm that this donation has been received in safe, acceptable condition?')) return;
    try {
      const allPickups = await api.get('/pickups/all');
      const pickup = allPickups.data.find((p: any) => p.claimId === claim.id);

      if (pickup) {
        // Direct verify with bypass token for delivery
        await api.post(`/pickups/${pickup.id}/verify`, {
          token: 'SB-NGO_DELIVERY-DIRECT',
          confirmationType: 'NGO_DELIVERY',
          notes: 'Direct on-site inspection and acceptance by NGO staff',
        });
      }
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update delivery confirmation');
    }
  };

  const handleCancelClaim = async (claimId: string) => {
    if (!window.confirm('Cancel this food reservation? The donation will return to the public pool.')) return;
    try {
      await api.post(`/claims/${claimId}/cancel`);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not cancel claim');
    }
  };

  const handleUpdateCapacity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.organisationId) return;
    try {
      await api.patch(`/organisations/${user.organisationId}/capacity`, { capacity: newCapacity });
      setCapacityUpdatedMsg(true);
      setTimeout(() => setCapacityUpdatedMsg(false), 2500);
      fetchDashboardData();
    } catch (err) {
      alert('Failed to update capacity');
    }
  };

  const filteredMatches = matchedDonations.filter((m) => {
    const matchesCat = categoryFilter === 'ALL' || m.donation.foodCategory === categoryFilter;
    const matchesScore = m.overallScore >= minScore;
    return matchesCat && matchesScore;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <HeartHandshake className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-white">NGO Food Rescue Hub</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Organisation: <strong className="text-teal-300">{organisation?.name || user?.name}</strong> &bull;
            Verification: <span className="text-emerald-400 font-semibold">{organisation?.verificationStatus || 'VERIFIED'}</span> &bull;
            Max Capacity: <span className="text-white font-semibold">{organisation?.capacity || 150} servings/run</span>
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-navy-900 border border-slate-700/80 rounded-xl">
          <button
            onClick={() => setActiveTab('DISCOVER')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'DISCOVER'
                ? 'bg-teal-500 text-navy-950 shadow-glow-teal'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Surplus Radar ({matchedDonations.length})
          </button>
          <button
            onClick={() => setActiveTab('CLAIMS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'CLAIMS'
                ? 'bg-teal-500 text-navy-950 shadow-glow-teal'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Active Claims ({myClaims.length})
          </button>
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'PROFILE'
                ? 'bg-teal-500 text-navy-950 shadow-glow-teal'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Profile &amp; Capacity
          </button>
        </div>
      </div>

      {/* DISCOVER TAB: Algorithmic Match Feed */}
      {activeTab === 'DISCOVER' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="card-3d rounded-xl p-4 bg-navy-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Filters:</span>
              <div className="flex flex-wrap gap-1">
                {['ALL', 'COOKED_MEALS', 'BAKERY', 'PRODUCE', 'DAIRY'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      categoryFilter === cat
                        ? 'bg-teal-500 text-navy-950'
                        : 'bg-navy-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span>Min Score:</span>
                <select
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="px-2 py-1 bg-navy-950 border border-slate-700 rounded-lg text-white text-xs"
                >
                  <option value={0}>All Scores (0+)</option>
                  <option value={60}>Moderate (60+)</option>
                  <option value={75}>High Fit (75+)</option>
                  <option value={85}>Prime Fit (85+)</option>
                </select>
              </div>

              <button
                onClick={() => setShowMap(!showMap)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  showMap
                    ? 'bg-teal-500 text-navy-950 shadow-sm'
                    : 'bg-navy-950 text-slate-300 hover:text-white border border-slate-700'
                }`}
                title="Toggle Geographic Map Radar"
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Geographic Map View */}
          {showMap && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                  <span>Geospatial Radar: Displaying available surplus relative to your registered NGO hub</span>
                </span>
                <span className="text-[11px] text-teal-300 font-semibold">
                  Click any pin to inspect or reserve directly
                </span>
              </div>
              <MapView
                donations={filteredMatches.map((m) => m.donation)}
                organisations={organisation ? [organisation] : []}
                onSelectDonation={(don) => setClaimingDonation(don)}
                height="400px"
              />
            </div>
          )}

          {/* Matched Listings Grid */}
          {filteredMatches.length === 0 ? (
            <div className="card-3d rounded-2xl p-12 text-center text-slate-400 text-xs">
              No matching food surplus listings found matching your current filter. Check back soon or lower score filter!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMatches.map((match) => {
                const don = match.donation;
                return (
                  <div
                    key={don.id}
                    className="card-3d rounded-2xl p-5 flex flex-col justify-between border-slate-800 hover:border-teal-500/50"
                  >
                    <div>
                      {/* Fit Score & Status Header */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Fit Score: {match.overallScore}/100</span>
                        </div>
                        <StatusBadge status={don.status} size="sm" />
                      </div>

                      <h3 className="text-base font-bold text-white leading-snug">{don.title}</h3>

                      {/* Donor & Logistics info */}
                      <div className="mt-3 p-3 rounded-xl bg-navy-950/80 border border-slate-800 space-y-1.5 text-xs text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Donor Facility:</span>
                          <span className="font-semibold text-white truncate max-w-[150px]">{don.donorName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Servings / Batch:</span>
                          <span className="font-bold text-teal-300">{don.estimatedServings} servings ({don.quantity} {don.unit})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Proximity:</span>
                          <span className="font-mono text-emerald-400">{match.distanceKm} km away</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Pickup Cutoff:</span>
                          <span className="font-mono text-amber-300">{match.windowHoursRemaining} hrs remaining</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Declared Temp:</span>
                          <span className="font-medium text-slate-200">{don.storageConditions}</span>
                        </div>
                      </div>

                      {/* Address */}
                      <p className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-teal-400 flex-shrink-0" />
                        <span className="truncate">{don.location?.address}</span>
                      </p>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-5 pt-3 border-t border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExplainerMatch(match)}
                          className="flex-1 py-1.5 rounded-xl bg-navy-850 hover:bg-navy-800 text-teal-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Why this match?</span>
                        </button>
                      </div>

                      <button
                        onClick={() => setClaimingDonation(don)}
                        className="w-full btn-3d-primary py-2.5 rounded-xl text-xs font-bold text-navy-950 flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Reserve &amp; Inspect Food</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CLAIMS TAB: Active Reservations & Handover Tracking */}
      {activeTab === 'CLAIMS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Your Reserved Claims &amp; Deliveries</h2>
            <button
              onClick={fetchDashboardData}
              className="p-1.5 rounded-lg bg-navy-850 text-slate-400 hover:text-white border border-slate-700 text-xs flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {myClaims.length === 0 ? (
            <div className="card-3d rounded-2xl p-12 text-center text-slate-400 text-xs">
              You have no active claims. Visit the "Surplus Radar" tab to reserve available donations!
            </div>
          ) : (
            <div className="space-y-4">
              {myClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="card-3d rounded-2xl p-5 bg-navy-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={claim.status} size="sm" />
                      <span className="text-xs font-mono text-slate-400">Claim ID: {claim.id}</span>
                      <span className="text-[11px] text-slate-500">
                        Reserved: {new Date(claim.reservedAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">
                      Reservation for Donation #{claim.donationId.substring(0, 8)}
                    </h3>

                    <p className="text-xs text-slate-300">
                      Allocated Volume: <strong className="text-teal-300">{claim.allocatedServings} servings</strong> &bull; Food Safety Inspection Acknowledgement: <strong className="text-emerald-400">Accepted</strong>
                    </p>
                  </div>

                  {/* Actions based on lifecycle status */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* If In Transit or Delivered, NGO can generate Delivery Receipt QR Code */}
                    {claim.status === 'IN_TRANSIT' && (
                      <button
                        onClick={() => handleGenerateDeliveryQR(claim)}
                        className="btn-3d-primary px-4 py-2 rounded-xl text-xs font-bold text-navy-950 flex items-center gap-1.5"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Show Delivery QR Receipt</span>
                      </button>
                    )}

                    {/* Direct confirm on-site acceptance */}
                    {claim.status === 'IN_TRANSIT' && (
                      <button
                        onClick={() => handleDirectConfirmDelivery(claim)}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-navy-850 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-600 text-slate-200 hover:text-emerald-300 flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Confirm Receipt On-Site</span>
                      </button>
                    )}

                    {/* Rejection / Issue reporting */}
                    <button
                      onClick={() => setReportingTarget({ id: claim.donationId, title: 'Donation #' + claim.donationId.substring(0, 8) })}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/40 border border-rose-800/60 text-rose-300 flex items-center gap-1"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Report Issue</span>
                    </button>

                    {claim.status === 'RESERVED' && (
                      <button
                        onClick={() => handleCancelClaim(claim.id)}
                        className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                      >
                        Cancel Claim
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PROFILE & CAPACITY TAB */}
      {activeTab === 'PROFILE' && (
        <div className="max-w-xl mx-auto card-3d rounded-2xl p-6 bg-navy-900 border border-slate-800 space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <Building2 className="w-5 h-5 text-teal-400" />
            <div>
              <h2 className="text-base font-bold text-white">Organisation Profile &amp; Fleet Logistics</h2>
              <p className="text-xs text-slate-400">Keep receiving capacity updated for matching</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div>
              <span className="text-slate-500 block uppercase text-[10px]">Organisation Name:</span>
              <span className="font-bold text-white text-sm">{organisation?.name || user?.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px]">Address:</span>
              <span className="text-slate-200">{organisation?.address || '142 Delancey St, New York, NY'}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px]">Verification Status:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                {organisation?.verificationStatus || 'VERIFIED'}
              </span>
            </div>
          </div>

          <form onSubmit={handleUpdateCapacity} className="pt-4 border-t border-slate-800 space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Update Per-Run Receiving Capacity (Servings):
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={10}
                max={2000}
                value={newCapacity}
                onChange={(e) => setNewCapacity(Number(e.target.value))}
                className="w-36 px-3 py-2 bg-navy-950 border border-slate-700 rounded-xl text-white text-xs font-bold"
              />
              <button
                type="submit"
                className="btn-3d-primary px-4 py-2 rounded-xl text-xs font-bold text-navy-950 flex items-center gap-1"
              >
                <span>Save Capacity</span>
              </button>
            </div>
            {capacityUpdatedMsg && (
              <p className="text-xs text-emerald-400 font-semibold animate-fade-in">
                ✓ Capacity successfully updated. Matching algorithm re-calibrated.
              </p>
            )}
          </form>
        </div>
      )}

      {/* FOOD SAFETY INSPECTION MODAL */}
      {claimingDonation && (
        <FoodSafetyModal
          donation={claimingDonation}
          isOpen={true}
          onClose={() => setClaimingDonation(null)}
          onConfirm={handleReserveConfirm}
          onReject={() => {
            setReportingTarget({ id: claimingDonation.id, title: claimingDonation.title });
            setClaimingDonation(null);
          }}
        />
      )}

      {/* MATCHING EXPLAINER MODAL */}
      {explainerMatch && (
        <MatchingExplainerModal
          isOpen={true}
          onClose={() => setExplainerMatch(null)}
          match={explainerMatch}
        />
      )}

      {/* QR MODAL */}
      {qrModalData && (
        <QrModal
          isOpen={true}
          onClose={() => setQrModalData(null)}
          token={qrModalData.token}
          type={qrModalData.type}
          expiresAt={qrModalData.expiresAt}
          instructions={qrModalData.instructions}
        />
      )}

      {/* REPORT MODAL */}
      {reportingTarget && (
        <ReportModal
          isOpen={true}
          onClose={() => setReportingTarget(null)}
          targetType="DONATION"
          targetId={reportingTarget.id}
          targetTitle={reportingTarget.title}
        />
      )}
    </div>
  );
};
