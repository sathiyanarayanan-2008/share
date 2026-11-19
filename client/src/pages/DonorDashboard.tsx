import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Donation, MatchingResult } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { QrModal } from '../components/QrModal';
import { MatchingExplainerModal } from '../components/MatchingExplainerModal';
import { SmartAddressInput } from '../components/SmartAddressInput';
import {
  Utensils,
  PlusCircle,
  Clock,
  MapPin,
  QrCode,
  Edit3,
  XCircle,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calculator,
  RefreshCw
} from 'lucide-react';

export const DonorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [foodCategory, setFoodCategory] = useState('COOKED_MEALS');
  const [quantity, setQuantity] = useState<number>(20);
  const [unit, setUnit] = useState('portions');
  const [estimatedServings, setEstimatedServings] = useState<number>(20);
  const [prepHoursAgo, setPrepHoursAgo] = useState<number>(1);
  const [safeHandlingNotes, setSafeHandlingNotes] = useState('Maintained in hot-holding transport units at >63°C. Contains garlic and soy. No nuts.');
  const [pickupStartOffset, setPickupStartOffset] = useState<number>(0);
  const [pickupDeadlineHours, setPickupDeadlineHours] = useState<number>(3);
  const [storageConditions, setStorageConditions] = useState('HOT_HELD');
  const [address, setAddress] = useState('75 Rockefeller Plaza, New York, NY 10019');
  const [latitude, setLatitude] = useState<number>(40.7587);
  const [longitude, setLongitude] = useState<number>(-73.9787);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // QR Modal State
  const [qrModalData, setQrModalData] = useState<{
    token: string;
    type: string;
    expiresAt: string;
    instructions: string;
  } | null>(null);

  // Matching Explainer State
  const [activeMatches, setActiveMatches] = useState<MatchingResult[] | null>(null);
  const [explainerMatch, setExplainerMatch] = useState<MatchingResult | null>(null);

  const fetchMyDonations = async () => {
    try {
      const res = await api.get('/donations/my');
      setDonations(res.data);
    } catch (err) {
      console.error('Error fetching donor listings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDonations();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const now = new Date();
    const preparationTime = new Date(now.getTime() - prepHoursAgo * 60 * 60 * 1000).toISOString();
    const pickupStart = new Date(now.getTime() + pickupStartOffset * 60 * 60 * 1000).toISOString();
    const pickupDeadline = new Date(now.getTime() + pickupDeadlineHours * 60 * 60 * 1000).toISOString();

    const payload = {
      title,
      foodCategory,
      quantity,
      unit,
      estimatedServings,
      preparationTime,
      safeHandlingNotes,
      pickupStart,
      pickupDeadline,
      storageConditions,
      address,
      latitude,
      longitude,
    };

    try {
      if (editingDonation) {
        await api.put(`/donations/${editingDonation.id}`, payload);
      } else {
        await api.post('/donations', payload);
      }
      setShowCreateForm(false);
      setEditingDonation(null);
      resetForm();
      fetchMyDonations();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save listing. Please check required fields.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setQuantity(20);
    setEstimatedServings(20);
    setSafeHandlingNotes('Maintained in hot-holding transport units at >63°C. Contains garlic and soy. No nuts.');
  };

  const handleEditClick = (don: Donation) => {
    setEditingDonation(don);
    setTitle(don.title);
    setFoodCategory(don.foodCategory);
    setQuantity(don.quantity);
    setUnit(don.unit);
    setEstimatedServings(don.estimatedServings);
    setSafeHandlingNotes(don.safeHandlingNotes);
    setStorageConditions(don.storageConditions);
    if (don.location) {
      setAddress(don.location.address);
      setLatitude(don.location.latitude);
      setLongitude(don.location.longitude);
    }
    setShowCreateForm(true);
  };

  const handleCancelClick = async (donationId: string) => {
    if (!window.confirm('Are you sure you want to cancel this donation listing?')) return;
    try {
      await api.post(`/donations/${donationId}/cancel`, { reason: 'Donor withdrawn' });
      fetchMyDonations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cannot cancel donation in current state.');
    }
  };

  const handleGenerateHandoverQR = async (donation: Donation) => {
    try {
      // Find associated pickup or claim
      const claimRes = await api.get(`/claims/by-donation/${donation.id}`);
      const claim = claimRes.data;

      // Find pickup
      const allPickups = await api.get('/pickups/all');
      const pickup = allPickups.data.find((p: any) => p.claimId === claim.id);

      if (!pickup) {
        alert('A volunteer has not yet been assigned to this claim. Handover token will be available once assigned.');
        return;
      }

      const tokenRes = await api.post(`/pickups/${pickup.id}/token?type=DONOR_HANDOVER`);
      setQrModalData(tokenRes.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate handover QR token.');
    }
  };

  const handleInspectMatches = async (donationId: string) => {
    try {
      const res = await api.get(`/donations/${donationId}/matches`);
      setActiveMatches(res.data);
    } catch (err) {
      alert('Could not compute matches.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Utensils className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-white">Donor Command Center</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <strong className="text-white">{user?.name}</strong> &bull; Commercial Surplus Manager
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingDonation(null);
              resetForm();
              setShowCreateForm(!showCreateForm);
            }}
            className="btn-3d-primary px-4 py-2 rounded-xl text-xs font-bold text-navy-950 flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{showCreateForm ? 'Close Form' : 'New Food Listing'}</span>
          </button>
        </div>
      </div>

      {/* CREATE / EDIT DONATION FORM */}
      {showCreateForm && (
        <div className="card-3d rounded-2xl p-6 bg-navy-900 border border-emerald-500/40 shadow-glow-emerald animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                {editingDonation ? 'Edit Food Listing' : 'Publish Surplus Food Donation'}
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              * Timestamps and safety declarations required
            </span>
          </div>

          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleCreateOrUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Food Item Title &amp; Description *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Steamed Jasmine Rice &amp; Thai Green Curry Bowls"
                  className="w-full px-3 py-2 bg-navy-950 border border-slate-700 rounded-xl text-white text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  value={foodCategory}
                  onChange={(e) => setFoodCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-950 border border-slate-700 rounded-xl text-white text-xs focus:border-teal-500 focus:outline-none"
                >
                  <option value="COOKED_MEALS">Cooked Meals (Prepared Hot/Cold)</option>
                  <option value="BAKERY">Bakery &amp; Pastries</option>
                  <option value="PRODUCE">Fresh Produce / Fruit</option>
                  <option value="DAIRY">Dairy &amp; Chilled Products</option>
                  <option value="PACKAGED_GOODS">Sealed Packaged Goods</option>
                  <option value="BEVERAGES">Beverages</option>
                </select>
              </div>
            </div>

            {/* Quantity, Servings, Storage */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-navy-950 border border-slate-700 rounded-xl text-white text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Unit *</label>
                <input
                  type="text"
                  required
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="portions, kg, boxes, trays"
                  className="w-full px-3 py-2 bg-navy-950 border border-slate-700 rounded-xl text-white text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Servings *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={estimatedServings}
                  onChange={(e) => setEstimatedServings(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-navy-950 border border-slate-700 rounded-xl text-white text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Storage Condition *</label>
                <select
                  value={storageConditions}
                  onChange={(e) => setStorageConditions(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-950 border border-slate-700 rounded-xl text-white text-xs focus:border-teal-500 focus:outline-none"
                >
                  <option value="HOT_HELD">Hot Held (&gt;63°C / &gt;140°F)</option>
                  <option value="REFRIGERATED">Chilled / Refrigerated (&lt;4°C / &lt;40°F)</option>
                  <option value="FROZEN">Frozen (&lt;-18°C / &lt;0°F)</option>
                  <option value="AMBIENT_DRY">Ambient Dry Room Temp</option>
                </select>
              </div>
            </div>

            {/* Preparation time & Pickup Window */}
            <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-3">
              <span className="text-xs uppercase font-bold text-teal-400 block tracking-wider">
                Timestamps &amp; Safe Consumption Window
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Prepared When:
                  </label>
                  <select
                    value={prepHoursAgo}
                    onChange={(e) => setPrepHoursAgo(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-navy-900 border border-slate-700 rounded-lg text-white text-xs"
                  >
                    <option value={0.5}>30 minutes ago</option>
                    <option value={1}>1 hour ago</option>
                    <option value={2}>2 hours ago</option>
                    <option value={4}>4 hours ago</option>
                    <option value={6}>6 hours ago (chilled)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Pickup Ready:
                  </label>
                  <select
                    value={pickupStartOffset}
                    onChange={(e) => setPickupStartOffset(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-navy-900 border border-slate-700 rounded-lg text-white text-xs"
                  >
                    <option value={0}>Immediately Available</option>
                    <option value={0.5}>In 30 minutes</option>
                    <option value={1}>In 1 hour</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Pickup Deadline (Critical Cutoff):
                  </label>
                  <select
                    value={pickupDeadlineHours}
                    onChange={(e) => setPickupDeadlineHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-navy-900 border border-slate-700 rounded-lg text-white text-xs"
                  >
                    <option value={2}>Within 2 hours (High Urgency)</option>
                    <option value={3}>Within 3 hours (Standard)</option>
                    <option value={6}>Within 6 hours</option>
                    <option value={12}>Within 12 hours</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Safe Handling Notes &amp; Allergen Disclosures *
                </label>
                <textarea
                  required
                  rows={2}
                  value={safeHandlingNotes}
                  onChange={(e) => setSafeHandlingNotes(e.target.value)}
                  placeholder="Specify packaging seals, holding temperatures, and major allergens (dairy, nuts, gluten, etc.)"
                  className="w-full px-3 py-2 bg-navy-900 border border-slate-700 rounded-lg text-white text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Smart Address Autocomplete & Coordinates */}
            <div className="space-y-3">
              <SmartAddressInput
                initialValue={address}
                onAddressSelect={(item) => {
                  setAddress(item.formattedAddress);
                  setLatitude(item.latitude);
                  setLongitude(item.longitude);
                }}
              />
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2 rounded-lg bg-navy-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Autocoded Latitude:</span>
                  <span className="text-teal-400 font-mono font-semibold">{latitude.toFixed(5)}</span>
                </div>
                <div className="p-2 rounded-lg bg-navy-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Autocoded Longitude:</span>
                  <span className="text-teal-400 font-mono font-semibold">{longitude.toFixed(5)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-3d-primary px-6 py-2 rounded-xl text-xs font-bold text-navy-950 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submitting ? 'Saving...' : editingDonation ? 'Update Listing' : 'Publish Listing'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MY DONATIONS TABLE / CARD GRID */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Your Food Listings</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-navy-850 text-slate-300 border border-slate-700">
              {donations.length} total
            </span>
          </h2>
          <button
            onClick={fetchMyDonations}
            className="p-1.5 rounded-lg bg-navy-850 hover:bg-navy-800 text-slate-400 hover:text-white border border-slate-700 text-xs flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {donations.length === 0 ? (
          <div className="card-3d rounded-2xl p-12 text-center text-slate-400 text-xs">
            No donations listed yet. Click "New Food Listing" above to publish your first surplus donation!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {donations.map((don) => (
              <div
                key={don.id}
                className="card-3d rounded-2xl p-5 flex flex-col justify-between border-slate-800 hover:border-slate-700"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <StatusBadge status={don.status} size="sm" />
                    <span className="text-[10px] font-mono text-slate-500">
                      ID: {don.id.substring(0, 8)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">{don.title}</h3>

                  <div className="mt-3 p-3 rounded-xl bg-navy-950/80 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Servings / Qty:</span>
                      <span className="font-semibold text-emerald-400">
                        {don.estimatedServings} servings ({don.quantity} {don.unit})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Storage Declared:</span>
                      <span className="font-medium text-teal-300">{don.storageConditions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pickup Deadline:</span>
                      <span className="font-mono text-amber-300">
                        {new Date(don.pickupDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Status specific details */}
                  {don.claimedByNgoName && (
                    <div className="mt-2.5 p-2 rounded-lg bg-teal-950/60 border border-teal-800/40 text-xs text-teal-300">
                      <strong>Reserved by:</strong> {don.claimedByNgoName}
                    </div>
                  )}

                  {don.assignedVolunteerName && (
                    <div className="mt-1 p-2 rounded-lg bg-amber-950/60 border border-amber-800/40 text-xs text-amber-300">
                      <strong>Courier Assigned:</strong> {don.assignedVolunteerName}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-slate-800 space-y-2">
                  {/* If RESERVED: Donor can generate Handover QR Code for Volunteer */}
                  {don.status === 'RESERVED' && (
                    <button
                      onClick={() => handleGenerateHandoverQR(don)}
                      className="w-full btn-3d-primary py-2 rounded-xl text-xs font-bold text-navy-950 flex items-center justify-center gap-1.5"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Issue Handover QR Token</span>
                    </button>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleInspectMatches(don.id)}
                      className="flex-1 py-1.5 rounded-xl bg-navy-850 hover:bg-navy-800 text-teal-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1"
                      title="Inspect deterministic NGO matching scores"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>NGO Matches</span>
                    </button>

                    {don.status === 'AVAILABLE' && (
                      <>
                        <button
                          onClick={() => handleEditClick(don)}
                          className="p-2 rounded-xl bg-navy-850 hover:bg-navy-800 text-slate-300 hover:text-white border border-slate-700"
                          title="Edit listing"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCancelClick(don.id)}
                          className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60"
                          title="Cancel listing"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MATCHES MODAL */}
      {activeMatches && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
          <div className="card-3d bg-navy-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Algorithmic NGO Fit Rankings</h3>
                <p className="text-xs text-slate-400">Deterministic scoring based on proximity, capacity &amp; time window</p>
              </div>
              <button onClick={() => setActiveMatches(null)} className="text-slate-400 hover:text-white p-1">
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {activeMatches.map((match, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-navy-950 border border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-teal-400">#{idx + 1}</span>
                      <h4 className="text-sm font-bold text-white">{match.organisation?.name}</h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Distance: <strong className="text-slate-200">{match.distanceKm} km</strong> &bull; Capacity: <strong className="text-slate-200">{match.organisation?.capacity} servings</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-emerald-400">{match.overallScore}</span>
                      <span className="text-[10px] text-slate-500 block">/ 100</span>
                    </div>
                    <button
                      onClick={() => setExplainerMatch(match)}
                      className="px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-semibold hover:bg-teal-500 hover:text-navy-950 transition-colors"
                    >
                      Formula Breakdown
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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

      {/* MATCHING EXPLAINER MODAL */}
      {explainerMatch && (
        <MatchingExplainerModal
          isOpen={true}
          onClose={() => setExplainerMatch(null)}
          match={explainerMatch}
        />
      )}
    </div>
  );
};
