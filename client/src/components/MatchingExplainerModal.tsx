import React from 'react';
import { Calculator, MapPin, Users, Clock, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { MatchingResult } from '../types';

interface MatchingExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: MatchingResult;
}

export const MatchingExplainerModal: React.FC<MatchingExplainerModalProps> = ({
  isOpen,
  onClose,
  match,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
      <div className="card-3d bg-navy-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Deterministic Match Breakdown</h2>
            <p className="text-xs text-slate-400">Algorithmic scoring calculation &amp; transparency</p>
          </div>
        </div>

        {/* Big Overall Score Badge */}
        <div className="my-5 p-4 rounded-xl bg-gradient-to-r from-teal-950/70 to-emerald-950/70 border border-teal-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-teal-300 block">Overall Algorithmic Fit</span>
            <span className="text-xs text-slate-400 mt-0.5 block">Calculated for this donation &amp; NGO pair</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">
            {match.overallScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
          </div>
        </div>

        {/* 3 Component Breakdown Cards */}
        <div className="space-y-3">
          {/* Proximity Component */}
          <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Geographic Proximity (45% Weight)</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Haversine distance: <strong className="text-teal-300">{match.distanceKm} km</strong>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Decays linearly at 3.1 pts/km up to 30km, rapid decay thereafter.
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-sm font-bold text-white">{match.distanceScore}</span>
              <span className="text-[10px] text-slate-400 block">Sub-Score</span>
            </div>
          </div>

          {/* Capacity Fit Component */}
          <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Capacity Alignment (30% Weight)</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Listing needs <strong className="text-emerald-300">{match.donation?.estimatedServings || 0}</strong> servings vs NGO capacity <strong className="text-emerald-300">{match.organisation?.capacity || 0}</strong>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Optimal when capacity comfortably absorbs batch without extreme over-allocation.
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-sm font-bold text-white">{match.capacityScore}</span>
              <span className="text-[10px] text-slate-400 block">Sub-Score</span>
            </div>
          </div>

          {/* Urgency / Pickup Window Component */}
          <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Window Urgency (25% Weight)</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Time remaining: <strong className="text-amber-300">{match.windowHoursRemaining} hours</strong>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Prioritises food approaching safe pickup cutoff within feasible transit distance.
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-sm font-bold text-white">{match.urgencyScore}</span>
              <span className="text-[10px] text-slate-400 block">Sub-Score</span>
            </div>
          </div>
        </div>

        {/* Transparency Disclaimer */}
        <div className="mt-4 p-3 rounded-xl bg-navy-850 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Deterministic Policy:</strong> ShareBite computes matches strictly via deterministic geospatial and inventory rules. No non-deterministic neural networks or speculative predictive algorithms are employed.
          </span>
        </div>

        <div className="mt-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
