import React from 'react';
import { ShieldCheck, Heart, Leaf, Utensils, FileText } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-navy-950/90 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand & Purpose */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
              SB
            </div>
            <span className="text-base font-extrabold text-white">ShareBite Platform</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md">
            Production-structured surplus food rescue infrastructure connecting commercial kitchens, food banks, shelters, and volunteer couriers to divert viable food from landfills.
          </p>
          <div className="p-3 rounded-xl bg-navy-900 border border-slate-800 text-[11px] leading-relaxed text-slate-300">
            <strong className="text-teal-300 block mb-0.5">Food Safety Notice &amp; Disclaimer:</strong>
            ShareBite facilitates logistical routing and matching. The platform does not certify food safety. Donors provide preparation records and handling disclosures. Recipient organisations maintain on-site inspection protocols prior to redistribution.
          </div>
        </div>

        {/* Roles Quick Access */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Demo Credentials</h4>
          <ul className="space-y-1.5 text-xs">
            <li><span className="text-emerald-400 font-semibold">Donor:</span> donor@sharebite.demo</li>
            <li><span className="text-teal-400 font-semibold">NGO:</span> ngo@sharebite.demo</li>
            <li><span className="text-amber-400 font-semibold">Volunteer:</span> volunteer@sharebite.demo</li>
            <li><span className="text-rose-400 font-semibold">Admin:</span> admin@sharebite.demo</li>
            <li className="text-[11px] text-slate-500 pt-1">Default Password: <code>Password123!</code></li>
          </ul>
        </div>

        {/* Stack & Architecture */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Architecture</h4>
          <ul className="space-y-1 text-xs text-slate-400">
            <li>• Java 21 / Spring Boot 3.3.4</li>
            <li>• MongoDB 7.0 + Atomic findAndModify</li>
            <li>• JWT &amp; BCrypt Password Hashing</li>
            <li>• Leaflet &amp; CartoDB Dark Matter</li>
            <li>• Deterministic Geospatial Scoring</li>
            <li>• Single-Use SHA-256 QR Handover</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-850 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© 2026 ShareBite Network. Round 2 Hackathon MVP Implementation.</p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-emerald-400/80">
            <Leaf className="w-3.5 h-3.5" /> Zero Landfill Mission
          </span>
          <span className="flex items-center gap-1 text-teal-400/80">
            <Heart className="w-3.5 h-3.5" /> Community First
          </span>
        </div>
      </div>
    </footer>
  );
};
