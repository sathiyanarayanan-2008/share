import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Donation, Organisation, ImpactAnalytics, Role } from '../types';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { MapView } from '../components/MapView';
import { FoodSafetyModal } from '../components/FoodSafetyModal';
import { MatchingExplainerModal } from '../components/MatchingExplainerModal';
import {
  Utensils,
  HeartHandshake,
  Truck,
  Shield,
  ArrowRight,
  Leaf,
  Clock,
  MapPin,
  CheckCircle2,
  Sparkles,
  QrCode,
  Flame,
  AlertTriangle,
  Info
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { demoLogin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [analytics, setAnalytics] = useState<ImpactAnalytics | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [safetyModalDonation, setSafetyModalDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const donRes = await api.get('/donations/available').catch((err) => {
          console.warn('Could not load available donations', err);
          return { data: [] };
        });
        const orgRes = await api.get('/organisations?verifiedOnly=true').catch((err) => {
          console.warn('Could not load organisations', err);
          return { data: [] };
        });
        const anaRes = await api.get('/admin/analytics').catch(() => ({
          data: {
            totalDonations: 6,
            activeListings: 3,
            totalMealsRescued: 165,
            totalKgDiverted: 85.5,
            co2eKgAvoided: 213.8,
            verifiedNgosCount: 2,
            activeVolunteersCount: 2,
          },
        }));
        setDonations(donRes.data || []);
        setOrganisations(orgRes.data || []);
        setAnalytics(anaRes.data);
      } catch (err) {
        console.error('Failed to load initial data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDemoLaunch = async (role: Role, targetPath: string) => {
    try {
      await demoLogin(role);
      navigate(targetPath);
    } catch (err) {
      console.error('Demo login error', err);
    }
  };

  const filteredDonations = donations.filter((d) =>
    selectedCategory === 'ALL' ? true : d.foodCategory === selectedCategory
  );

  return (
    <div className="space-y-16 pb-12">
      {/* HERO SECTION */}
      <section className="relative pt-12 lg:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Subtle decorative background glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-12 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-950/70 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-6 shadow-glow-teal animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Round 2 Shortlisted Innovation &bull; Production-Ready MVP</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Bridging Food Surplus with <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-300">Community Need</span>
          </h1>

          <p className="mt-6 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            ShareBite provides high-assurance surplus food redistribution. Featuring atomic reservation locking, deterministic geospatial matching, single-use QR handover tokens, and verified food safety protocols.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="btn-3d-primary px-6 py-3 rounded-xl text-sm font-bold text-navy-950 flex items-center gap-2"
            >
              <span>Join Food Rescue Network</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#demo-launchpad"
              className="btn-3d-secondary px-6 py-3 rounded-xl text-sm font-bold text-slate-200 hover:text-white flex items-center gap-2"
            >
              <span>Explore Demo Roles</span>
              <Sparkles className="w-4 h-4 text-teal-400" />
            </a>
          </div>
        </div>

        {/* IMPACT METRICS 3D CARDS */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Meals Rescued"
            value={analytics ? analytics.totalMealsRescued.toLocaleString() : '165'}
            subtitle="Direct meals provided to shelters"
            icon={Utensils}
            variant="emerald"
          />
          <StatCard
            title="Diverted Surplus"
            value={analytics ? `${analytics.totalKgDiverted} kg` : '85.5 kg'}
            subtitle="Solid edible waste saved from landfill"
            icon={Leaf}
            variant="teal"
          />
          <StatCard
            title="Avoided Emissions"
            value={analytics ? `${analytics.co2eKgAvoided} kg` : '213.8 kg'}
            subtitle="Estimated CO2e greenhouse footprint avoided"
            icon={Flame}
            variant="amber"
          />
          <StatCard
            title="Active Listings"
            value={donations.length.toString()}
            subtitle="Available live for immediate claim"
            icon={Clock}
            variant="navy"
          />
        </div>
      </section>

      {/* 4-ROLE 1-CLICK DEMO LAUNCHPAD */}
      <section id="demo-launchpad" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Role-Based Workspaces &amp; Live Demo Access
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            Test the entire end-to-end flow right now. Click any role below to instantly log in as a pre-configured verified persona.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* DONOR CARD */}
          <div className="card-3d rounded-2xl p-5 flex flex-col justify-between border-slate-700/60 hover:border-emerald-500/40">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Utensils className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Role: DONOR
                </span>
              </div>
              <h3 className="text-base font-bold text-white">Food Donors</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Commercial kitchens, bakeries &amp; caterers. Create listings with storage temperatures, safe handling notes &amp; QR handover.
              </p>
              <div className="mt-3 p-2 rounded-lg bg-navy-950 text-[11px] text-slate-400 font-mono">
                <code>donor@sharebite.demo</code>
              </div>
            </div>
            <button
              onClick={() => handleDemoLaunch('DONOR', '/donor')}
              className="mt-5 w-full btn-3d-primary py-2.5 rounded-xl text-xs font-bold text-navy-950 flex items-center justify-center gap-1.5"
            >
              <span>Launch Donor Space</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* NGO CARD */}
          <div className="card-3d rounded-2xl p-5 flex flex-col justify-between border-slate-700/60 hover:border-teal-500/40">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                  Role: NGO
                </span>
              </div>
              <h3 className="text-base font-bold text-white">Verified NGOs</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Food pantries, community kitchens &amp; shelters. Browse deterministic match scores, reserve atomically, inspect food safety.
              </p>
              <div className="mt-3 p-2 rounded-lg bg-navy-950 text-[11px] text-slate-400 font-mono">
                <code>ngo@sharebite.demo</code>
              </div>
            </div>
            <button
              onClick={() => handleDemoLaunch('NGO', '/ngo')}
              className="mt-5 w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-500 to-cyan-500 text-navy-950 hover:brightness-110 shadow-glow-teal flex items-center justify-center gap-1.5"
            >
              <span>Launch NGO Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* VOLUNTEER CARD */}
          <div className="card-3d rounded-2xl p-5 flex flex-col justify-between border-slate-700/60 hover:border-amber-500/40">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Truck className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  Role: VOLUNTEER
                </span>
              </div>
              <h3 className="text-base font-bold text-white">Volunteer Fleet</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Community couriers. Accept rescue missions, validate donor single-use tokens, deliver to shelter, confirm receipt.
              </p>
              <div className="mt-3 p-2 rounded-lg bg-navy-950 text-[11px] text-slate-400 font-mono">
                <code>volunteer@sharebite.demo</code>
              </div>
            </div>
            <button
              onClick={() => handleDemoLaunch('VOLUNTEER', '/volunteer')}
              className="mt-5 w-full py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-navy-950 flex items-center justify-center gap-1.5 transition-colors shadow-md"
            >
              <span>Launch Courier View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ADMIN CARD */}
          <div className="card-3d rounded-2xl p-5 flex flex-col justify-between border-slate-700/60 hover:border-rose-500/40">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  Role: ADMIN
                </span>
              </div>
              <h3 className="text-base font-bold text-white">Administrator</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Platform oversight. Verify organisation registration numbers, review flagged food safety reports, inspect audit trail.
              </p>
              <div className="mt-3 p-2 rounded-lg bg-navy-950 text-[11px] text-slate-400 font-mono">
                <code>admin@sharebite.demo</code>
              </div>
            </div>
            <button
              onClick={() => handleDemoLaunch('ADMIN', '/admin')}
              className="mt-5 w-full py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-1.5 transition-colors shadow-md"
            >
              <span>Launch Admin Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* LIVE INTERACTIVE RESCUE MAP & AVAILABLE LISTINGS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Live Food Surplus Radar
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Real-time map and directory of available surplus food listings in Lower Manhattan &amp; Brooklyn.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {['ALL', 'COOKED_MEALS', 'BAKERY', 'PRODUCE', 'DAIRY'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-teal-500 text-navy-950'
                    : 'bg-navy-850 text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                {cat.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Map & Listings Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Map Column */}
          <div className="lg:col-span-7">
            <MapView
              donations={donations}
              organisations={organisations}
              selectedDonation={selectedDonation}
              onSelectDonation={(d) => setSelectedDonation(d)}
              height="480px"
            />
          </div>

          {/* Listings List Column */}
          <div className="lg:col-span-5 space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
            {filteredDonations.length === 0 ? (
              <div className="card-3d rounded-xl p-8 text-center text-slate-400 text-xs">
                No active surplus listings in this category.
              </div>
            ) : (
              filteredDonations.map((don) => (
                <div
                  key={don.id}
                  onClick={() => setSelectedDonation(don)}
                  className={`card-3d rounded-xl p-4 cursor-pointer transition-all ${
                    selectedDonation?.id === don.id
                      ? 'border-teal-400 ring-1 ring-teal-400/50 bg-navy-850'
                      : 'hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-white leading-snug">{don.title}</h4>
                    <StatusBadge status={don.status} size="sm" />
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Donor</span>
                      <span className="font-medium text-emerald-300 truncate block">{don.donorName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Servings</span>
                      <span className="font-semibold text-white">{don.estimatedServings} ({don.quantity} {don.unit})</span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-1 text-slate-400 truncate max-w-[200px]">
                      <MapPin className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                      <span className="truncate">{don.location?.address}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isAuthenticated) {
                          handleDemoLaunch('NGO', '/ngo');
                        } else {
                          setSafetyModalDonation(don);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-500/20 text-teal-300 hover:bg-teal-500 hover:text-navy-950 transition-colors border border-teal-500/40"
                    >
                      Reserve / Claim &rarr;
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ARCHITECTURE & DETERMINISTIC MATCHING EXPLANATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-3d rounded-3xl p-8 sm:p-12 relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-850 to-navy-950 border border-slate-700/80">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-4">
                <Info className="w-3.5 h-3.5" />
                <span>Deterministic Geospatial Logistics</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                No Black-Box Speculation. Auditable Matching.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                Unlike platforms making unverifiable AI claims, ShareBite employs a deterministic mathematical model to route food rescue opportunities based on physics and operational thresholds:
              </p>

              <div className="mt-6 space-y-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-teal-300">
                  <code>Score = 0.45 * Proximity + 0.30 * CapacityFit + 0.25 * WindowUrgency</code>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-400 font-sans">
                  <li>&bull; <strong className="text-white">Proximity (45%):</strong> Haversine great-circle distance decay calculation.</li>
                  <li>&bull; <strong className="text-white">Capacity Fit (30%):</strong> NGO receiving capacity vs. donation portions.</li>
                  <li>&bull; <strong className="text-white">Window Urgency (25%):</strong> Remaining safe pickup time before expiry.</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-navy-950/80 border border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Atomic MongoDB Concurrency Guard</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Prevents race conditions using document-level <code>findAndModify</code> conditional queries. Two organisations can never double-claim the same food listing.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-navy-950/80 border border-slate-800">
                <div className="flex items-center gap-2 text-teal-400 font-bold text-sm mb-1">
                  <QrCode className="w-4 h-4" />
                  <span>Single-Use SHA-256 Handover Tokens</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cryptographically hashed, short-lived QR tokens (15-min TTL) validated and consumed server-side upon physical collection and delivery.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-navy-950/80 border border-slate-800">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Transparent Food Safety Governance</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Mandatory safe handling notes, allergen disclosures, storage temperature tracking, and recipient acceptance inspection checklists.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Modal if opened from listing */}
      {safetyModalDonation && (
        <FoodSafetyModal
          donation={safetyModalDonation}
          isOpen={true}
          onClose={() => setSafetyModalDonation(null)}
          onConfirm={async (servings) => {
            try {
              await api.post(`/claims/${safetyModalDonation.id}`, {
                allocatedServings: servings,
                safetyAcknowledgementAccepted: true,
              });
              setSafetyModalDonation(null);
              navigate('/ngo');
            } catch (err: any) {
              alert(err.response?.data?.message || 'Failed to reserve donation');
            }
          }}
        />
      )}
    </div>
  );
};
