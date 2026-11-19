import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Pickup, Donation } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Check,
  AlertTriangle,
  RefreshCw,
  PackageCheck,
  KeyRound
} from 'lucide-react';

export const VolunteerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [myPickups, setMyPickups] = useState<Pickup[]>([]);
  const [allPickups, setAllPickups] = useState<Pickup[]>([]);
  const [donationsMap, setDonationsMap] = useState<Record<string, Donation>>({});
  const [loading, setLoading] = useState(true);

  // Verification modal / input
  const [verifyingPickup, setVerifyingPickup] = useState<Pickup | null>(null);
  const [verificationType, setVerificationType] = useState<'DONOR_HANDOVER' | 'NGO_DELIVERY'>('DONOR_HANDOVER');
  const [inputToken, setInputToken] = useState('');
  const [verifyNotes, setVerifyNotes] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [myRes, allRes, donRes] = await Promise.all([
        api.get('/pickups/my'),
        api.get('/pickups/all'),
        api.get('/donations/available'),
      ]);

      setMyPickups(myRes.data);
      setAllPickups(allRes.data);

      // Also fetch details for donations involved
      const allDons = await api.get('/admin/donations').catch(() => donRes);
      const map: Record<string, Donation> = {};
      allDons.data.forEach((d: Donation) => {
        map[d.id] = d;
      });
      setDonationsMap(map);
    } catch (err) {
      console.error('Error loading pickups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignToMe = async (claimId: string) => {
    try {
      await api.post(`/pickups/${claimId}/assign`, { notes: 'Accepted by volunteer courier' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not assign pickup');
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingPickup || !inputToken.trim()) return;

    setVerifying(true);
    setVerifyError(null);

    try {
      await api.post(`/pickups/${verifyingPickup.id}/verify`, {
        token: inputToken.trim(),
        confirmationType: verificationType,
        notes: verifyNotes || 'Single-use token validated on site',
      });
      setVerifyingPickup(null);
      setInputToken('');
      setVerifyNotes('');
      fetchData();
    } catch (err: any) {
      setVerifyError(err.response?.data?.message || 'Verification failed. Check token or expiration.');
    } finally {
      setVerifying(false);
    }
  };

  const completedCount = myPickups.filter((p) => p.status === 'CONFIRMED' || p.status === 'DELIVERED').length;
  const activePickups = myPickups.filter((p) => p.status !== 'CONFIRMED' && p.status !== 'DELIVERED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Truck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-white">Courier Rescue Missions</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Volunteer Courier: <strong className="text-white">{user?.name}</strong> &bull;
            Missions Completed: <strong className="text-emerald-400">{completedCount}</strong> &bull;
            Active Handover Tasks: <strong className="text-amber-400">{activePickups.length}</strong>
          </p>
        </div>

        <button
          onClick={fetchData}
          className="p-2 rounded-xl bg-navy-850 hover:bg-navy-800 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1.5 self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Missions</span>
        </button>
      </div>

      {/* ACTIVE MISSIONS IN PROGRESS */}
      <div>
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <span>Your Active Rescue Runs</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800">
            {activePickups.length} in progress
          </span>
        </h2>

        {activePickups.length === 0 ? (
          <div className="card-3d rounded-2xl p-8 text-center text-slate-400 text-xs">
            No active missions assigned right now. Browse available missions below to accept a rescue!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activePickups.map((pickup) => {
              const donation = donationsMap[pickup.donationId];
              const isCollected = pickup.status === 'COLLECTED';

              return (
                <div
                  key={pickup.id}
                  className="card-3d rounded-2xl p-5 bg-navy-900 border border-amber-500/30 shadow-glow-amber space-y-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <StatusBadge status={pickup.status} size="sm" />
                    <span className="text-[10px] font-mono text-slate-500">Run ID: {pickup.id}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">
                      {donation?.title || `Donation #${pickup.donationId.substring(0, 8)}`}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Volume: <strong className="text-teal-300">{donation?.estimatedServings || 'Batch'} servings</strong> &bull; Temperature: <strong className="text-emerald-400">{donation?.storageConditions || 'Declared'}</strong>
                    </p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                      <span>{donation?.location?.address || 'Pickup location declared'}</span>
                    </p>
                  </div>

                  {/* Progress tracker */}
                  <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        isCollected ? 'bg-emerald-500 text-navy-950' : 'bg-amber-500 text-navy-950 animate-pulse'
                      }`}>
                        1
                      </div>
                      <span className={isCollected ? 'text-slate-400' : 'font-bold text-white'}>
                        {isCollected ? 'Picked Up from Donor' : 'Collect from Donor'}
                      </span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-600" />

                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        isCollected ? 'bg-teal-500 text-navy-950 animate-pulse' : 'bg-slate-800 text-slate-400'
                      }`}>
                        2
                      </div>
                      <span className={isCollected ? 'font-bold text-teal-300' : 'text-slate-500'}>
                        Deliver to NGO
                      </span>
                    </div>
                  </div>

                  {/* Verification Actions */}
                  <div className="pt-2 flex gap-2">
                    {!isCollected ? (
                      <button
                        onClick={() => {
                          setVerifyingPickup(pickup);
                          setVerificationType('DONOR_HANDOVER');
                          setInputToken('');
                          setVerifyError(null);
                        }}
                        className="w-full btn-3d-primary py-2.5 rounded-xl text-xs font-bold text-navy-950 flex items-center justify-center gap-1.5"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Validate Donor Handover Token</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setVerifyingPickup(pickup);
                          setVerificationType('NGO_DELIVERY');
                          setInputToken('');
                          setVerifyError(null);
                        }}
                        className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-500 to-cyan-500 text-navy-950 flex items-center justify-center gap-1.5 shadow-glow-teal"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>Validate NGO Delivery Receipt Token</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RECENTLY COMPLETED MISSIONS */}
      <div>
        <h2 className="text-base font-bold text-white mb-4">Completed Mission Archive</h2>
        {completedCount === 0 ? (
          <p className="text-xs text-slate-500 italic">No historical missions completed yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {myPickups
              .filter((p) => p.status === 'CONFIRMED' || p.status === 'DELIVERED')
              .map((p) => (
                <div key={p.id} className="card-3d rounded-xl p-4 bg-navy-900 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={p.status} size="sm" />
                    <span className="text-[10px] text-slate-500">
                      {p.deliveryTime ? new Date(p.deliveryTime).toLocaleDateString() : 'Completed'}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm">
                    {donationsMap[p.donationId]?.title || `Donation #${p.donationId.substring(0, 8)}`}
                  </h4>
                  <p className="text-slate-400">
                    Handover verified via SHA-256 single-use tokens &bull; Zero waste achieved!
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* VERIFY TOKEN MODAL / DIALOG */}
      {verifyingPickup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
          <div className="card-3d bg-navy-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setVerifyingPickup(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-4">
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {verificationType === 'DONOR_HANDOVER' ? 'Confirm Collection from Donor' : 'Confirm Delivery to Shelter/NGO'}
                </h3>
                <p className="text-xs text-slate-400">Scan QR or enter 6-character single-use token</p>
              </div>
            </div>

            {verifyError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{verifyError}</span>
              </div>
            )}

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Handover Code / Token *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  placeholder="e.g. SB-DONOR_HANDOVER-..."
                  className="w-full px-3.5 py-2.5 bg-navy-950 border border-slate-700 rounded-xl text-teal-300 font-mono text-sm focus:border-teal-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Ask the {verificationType === 'DONOR_HANDOVER' ? 'donor' : 'NGO recipient'} to show their single-use QR screen or copy code.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Courier Inspection Notes (Optional)
                </label>
                <input
                  type="text"
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="e.g. Temperature measured at 65°C; packaging fully sealed"
                  className="w-full px-3 py-2 bg-navy-950 border border-slate-700 rounded-xl text-white text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVerifyingPickup(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifying || !inputToken.trim()}
                  className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-bold text-navy-950 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{verifying ? 'Validating Token...' : 'Verify & Consume Token'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
