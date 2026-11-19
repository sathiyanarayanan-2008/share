import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils, HeartHandshake, Truck, Building2, MapPin, AlertCircle, ArrowRight } from 'lucide-react';
import { Role } from '../types';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>('NGO');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Organisation fields
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('FOOD_BANK');
  const [address, setAddress] = useState('120 Delancey St, New York, NY 10002');
  const [capacity, setCapacity] = useState(100);
  const [regNumber, setRegNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: any = {
        name,
        email,
        password,
        role,
        phone,
      };

      if (role === 'NGO' || (role === 'DONOR' && orgName)) {
        payload.organisationName = orgName || name;
        payload.organisationType = orgType;
        payload.address = address;
        payload.capacity = capacity;
        payload.latitude = 40.7180;
        payload.longitude = -73.9950;
        payload.registrationNumber = regNumber || 'REG-' + Math.floor(100000 + Math.random() * 900000);
      }

      const user = await register(payload);
      if (user.role === 'DONOR') navigate('/donor');
      else if (user.role === 'NGO') navigate('/ngo');
      else if (user.role === 'VOLUNTEER') navigate('/volunteer');
      else navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-black text-white">Join the ShareBite Network</h1>
          <p className="text-xs text-slate-400 mt-1">
            Register your organisation or sign up as an independent volunteer courier
          </p>
        </div>

        <div className="card-3d rounded-2xl p-6 bg-navy-900 border border-slate-700/80">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Selection Tabs */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-300 mb-2">Select Your Role</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('DONOR')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  role === 'DONOR'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-glow-emerald'
                    : 'bg-navy-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Utensils className="w-4 h-4" />
                <span>Food Donor</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('NGO')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  role === 'NGO'
                    ? 'bg-teal-950/80 border-teal-500 text-teal-300 shadow-glow-teal'
                    : 'bg-navy-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <HeartHandshake className="w-4 h-4" />
                <span>NGO Pantry</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('VOLUNTEER')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  role === 'VOLUNTEER'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-md'
                    : 'bg-navy-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Volunteer</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name / Lead</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full px-3 py-2 bg-navy-950 border border-slate-700 rounded-xl text-white text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="elena@pantry.org"
                  className="w-full px-3 py-2 bg-navy-950 border border-slate-700 rounded-xl text-white text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 bg-navy-950 border border-slate-700 rounded-xl text-white text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1-212-555-0199"
                  className="w-full px-3 py-2 bg-navy-950 border border-slate-700 rounded-xl text-white text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Organisation details for NGO or Commercial Donor */}
            {role === 'NGO' && (
              <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-400">
                  <Building2 className="w-4 h-4" />
                  <span>Organisation Credentials (Verified by Admin)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Organisation Name</label>
                    <input
                      type="text"
                      required
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="Hope Food Hub"
                      className="w-full px-3 py-2 bg-navy-900 border border-slate-700 rounded-lg text-white text-xs focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Organisation Type</label>
                    <select
                      value={orgType}
                      onChange={(e) => setOrgType(e.target.value)}
                      className="w-full px-3 py-2 bg-navy-900 border border-slate-700 rounded-lg text-white text-xs focus:border-teal-500 focus:outline-none"
                    >
                      <option value="FOOD_BANK">Food Bank / Pantry</option>
                      <option value="SHELTER">Homeless Shelter</option>
                      <option value="COMMUNITY_KITCHEN">Community Soup Kitchen</option>
                      <option value="CHARITY">Charity Outreach</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="120 Delancey St, New York"
                      className="w-full px-3 py-2 bg-navy-900 border border-slate-700 rounded-lg text-white text-xs focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Pickup Capacity (Servings)</label>
                    <input
                      type="number"
                      required
                      min={10}
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-navy-900 border border-slate-700 rounded-lg text-white text-xs focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Registration / Tax EIN Number</label>
                  <input
                    type="text"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    placeholder="e.g. EIN-84-9923841"
                    className="w-full px-3 py-2 bg-navy-900 border border-slate-700 rounded-lg text-white text-xs focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-3d-primary py-2.5 rounded-xl text-xs font-bold text-navy-950 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="text-teal-400 hover:underline font-semibold">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
