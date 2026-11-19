import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Clock, Copy, Check, ShieldCheck, X } from 'lucide-react';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  type: string; // DONOR_HANDOVER, NGO_DELIVERY
  expiresAt?: string;
  instructions?: string;
}

export const QrModal: React.FC<QrModalProps> = ({
  isOpen,
  onClose,
  token,
  type,
  expiresAt,
  instructions,
}) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('15:00');

  useEffect(() => {
    if (!expiresAt) return;
    const calculateTime = () => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft('Expired');
        return;
      }
      const minutes = Math.floor(difference / 1000 / 60);
      const seconds = Math.floor((difference / 1000) % 60);
      setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const title = type === 'DONOR_HANDOVER' ? 'Donor Pickup Handover Token' : 'NGO Delivery Receipt Token';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
      <div className="card-3d bg-navy-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mx-auto w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mb-3">
          <QrCode className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-xs text-slate-400 mt-1">
          {instructions || 'Show this QR code to the volunteer courier to complete the verified transfer.'}
        </p>

        {/* QR Code Container */}
        <div className="my-5 p-4 rounded-2xl bg-white mx-auto inline-block shadow-lg border-4 border-slate-700/30">
          <QRCodeSVG value={token} size={190} level="H" includeMargin={true} />
        </div>

        {/* Countdown Badge */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60">
            <Clock className="w-3.5 h-3.5" />
            <span>Expires in: {timeLeft}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-950/80 text-teal-300 border border-teal-800/60">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Single-Use SHA-256</span>
          </div>
        </div>

        {/* Token String & Copy Button */}
        <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 flex items-center justify-between gap-2 text-left">
          <div className="overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Manual Backup Code</span>
            <span className="font-mono text-xs font-semibold text-teal-300 truncate block">
              {token}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-1 flex-shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="mt-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
