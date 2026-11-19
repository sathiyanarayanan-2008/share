import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils, HeartHandshake, Truck, Shield, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { Role } from '../types';

export const LoginPage: React.FC = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const routeByRole = (role: Role) => {
    switch (role) {
      case 'DONOR':
        navigate('/donor');
        break;
      case 'NGO':
        navigate('/ngo');
        break;
      case 'VOLUNTEER':
        navigate('/volunteer');
        break;
      case 'ADMIN':
        navigate('/admin');
        break;
      default:
        navigate('/');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      routeByRole(user.role);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role: Role) => {
    setError(null);
    setLoading(true);
    try {
      const user = await demoLogin(role);
      routeByRole(user.role);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-0.5 shadow-glow-emerald mx-auto mb-3">
            <div className="w-full h-full bg-navy-950 rounded-[14px] flex items-center justify-center">
              <Utensils className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white">Sign In to ShareBite</h1>
          <p className="text-xs text-slate-400 mt-1">
            Access your food rescue dashboard and tracking tools
          </p>
        </div>

        {/* 1-Click Demo Logins for Hackathon Evaluators */}
        <div className="card-3d rounded-2xl p-4 bg-navy-900 border border-teal-500/30">
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300 mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hackathon Evaluator 1-Click Access</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleDemo('DONOR')}
              type="button"
              className="p-2.5 rounded-xl bg-navy-950 hover:bg-emerald-950/60 border border-slate-700/80 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-300 font-semibold flex items-center gap-2 transition-all"
            >
              <Utensils className="w-4 h-4 text-emerald-400" />
              <span>Donor</span>
            </button>
            <button
              onClick={() => handleDemo('NGO')}
              type="button"
              className="p-2.5 rounded-xl bg-navy-950 hover:bg-teal-950/60 border border-slate-700/80 hover:border-teal-500/50 text-slate-200 hover:text-teal-300 font-semibold flex items-center gap-2 transition-all"
            >
              <HeartHandshake className="w-4 h-4 text-teal-400" />
              <span>NGO Pantry</span>
            </button>
            <button
              onClick={() => handleDemo('VOLUNTEER')}
              type="button"
              className="p-2.5 rounded-xl bg-navy-950 hover:bg-amber-950/60 border border-slate-700/80 hover:border-amber-500/50 text-slate-200 hover:text-amber-300 font-semibold flex items-center gap-2 transition-all"
            >
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Volunteer</span>
            </button>
            <button
              onClick={() => handleDemo('ADMIN')}
              type="button"
              className="p-2.5 rounded-xl bg-navy-950 hover:bg-rose-950/60 border border-slate-700/80 hover:border-rose-500/50 text-slate-200 hover:text-rose-300 font-semibold flex items-center gap-2 transition-all"
            >
              <Shield className="w-4 h-4 text-rose-400" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Standard Email/Password Form */}
        <div className="card-3d rounded-2xl p-6 bg-navy-900 border border-slate-700/80">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. donor@sharebite.demo"
                  className="w-full pl-9 pr-3 py-2.5 bg-navy-950 border border-slate-700 rounded-xl text-white text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-navy-950 border border-slate-700 rounded-xl text-white text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-3d-primary py-2.5 rounded-xl text-xs font-bold text-navy-950 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal-400 hover:underline font-semibold">
              Register now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
