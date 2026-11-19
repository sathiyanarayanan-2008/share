import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, XCircle, Info, Thermometer } from 'lucide-react';
import { Donation } from '../types';

interface FoodSafetyModalProps {
  donation: Donation;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (allocatedServings: number) => void;
  onReject?: () => void;
}

export const FoodSafetyModal: React.FC<FoodSafetyModalProps> = ({
  donation,
  isOpen,
  onClose,
  onConfirm,
  onReject,
}) => {
  const [servings, setServings] = useState<number>(donation.estimatedServings || 10);
  const [chkPackaging, setChkPackaging] = useState(false);
  const [chkTemp, setChkTemp] = useState(false);
  const [chkDisclaimer, setChkDisclaimer] = useState(false);

  if (!isOpen) return null;

  const canConfirm = chkPackaging && chkTemp && chkDisclaimer && servings > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
      <div className="card-3d bg-navy-900 border border-slate-700/80 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Food Safety Inspection &amp; Acknowledgment</h2>
              <p className="text-xs text-slate-400">Mandatory verification prior to confirming claim</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            ✕
          </button>
        </div>

        {/* Regulatory & Safety Notice */}
        <div className="mt-4 p-3.5 rounded-xl bg-navy-850 border border-teal-500/30 text-xs leading-relaxed space-y-2">
          <div className="flex items-center gap-2 text-teal-300 font-semibold">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>Platform Food Safety Notice</span>
          </div>
          <p className="text-slate-300">
            <strong>ShareBite facilitates logistics and does not certify or warrant food safety.</strong>
            &nbsp;Donors provide preparation records and storage declarations. Recipient organisations must inspect condition, packaging integrity, and temperature upon handover.
          </p>
        </div>

        {/* Donor Disclosures */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
          <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Donor Safety Disclosures</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">Preparation Time:</span>
              <span className="font-medium text-slate-200">
                {new Date(donation.preparationTime).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Declared Storage:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-teal-400">
                <Thermometer className="w-3.5 h-3.5" />
                {donation.storageConditions}
              </span>
            </div>
          </div>

          <div className="text-xs pt-1 border-t border-slate-800/80">
            <span className="text-slate-400 block mb-1">Safe Handling Notes &amp; Allergens:</span>
            <p className="p-2.5 rounded-lg bg-navy-900 border border-slate-800 text-slate-200 italic">
              "{donation.safeHandlingNotes || 'No specific allergen disclosures provided.'}"
            </p>
          </div>
        </div>

        {/* Servings to Reserve */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Allocated Servings to Reserve (Max: {donation.estimatedServings}):
          </label>
          <input
            type="number"
            min={1}
            max={donation.estimatedServings}
            value={servings}
            onChange={(e) => setServings(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 bg-navy-950 border border-slate-700 rounded-xl text-white text-sm focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* Recipient Verification Checklist */}
        <div className="mt-4 space-y-2.5">
          <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Recipient Inspection Checklist</h4>
          
          <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer p-2.5 rounded-lg hover:bg-slate-800/30">
            <input
              type="checkbox"
              checked={chkPackaging}
              onChange={(e) => setChkPackaging(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 text-teal-500 focus:ring-teal-500"
            />
            <span>I verify that our staff or volunteer courier will inspect package seals and hygiene on site.</span>
          </label>

          <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer p-2.5 rounded-lg hover:bg-slate-800/30">
            <input
              type="checkbox"
              checked={chkTemp}
              onChange={(e) => setChkTemp(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 text-teal-500 focus:ring-teal-500"
            />
            <span>I confirm our facility has proper equipment to maintain declared storage temperature ({donation.storageConditions}).</span>
          </label>

          <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer p-2.5 rounded-lg hover:bg-slate-800/30">
            <input
              type="checkbox"
              checked={chkDisclaimer}
              onChange={(e) => setChkDisclaimer(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 text-teal-500 focus:ring-teal-500"
            />
            <span className="font-semibold text-amber-300/90">
              I accept the Food Safety Disclaimer: ShareBite does not guarantee freshness, and recipient assumes responsibility upon physical handover.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          {onReject && (
            <button
              onClick={onReject}
              type="button"
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-900/60 flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              Report Issue / Reject
            </button>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end ml-auto">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 text-xs font-medium rounded-xl text-slate-300 hover:text-white hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={() => canConfirm && onConfirm(servings)}
              disabled={!canConfirm}
              type="button"
              className="btn-3d-primary px-5 py-2.5 text-xs font-bold rounded-xl text-navy-950 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm &amp; Reserve Food
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
