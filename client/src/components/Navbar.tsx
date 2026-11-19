import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { StatusBadge } from './StatusBadge';
import { Utensils, HeartHandshake, Truck, Shield, LogOut, UserCheck, ChevronDown, Layers } from 'lucide-react';
import { Role } from '../types';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleQuickRoleSwitch = async (role: Role) => {
    try {
      await demoLogin(role);
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
      }
    } catch (err) {
      console.error('Demo switch failed', err);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-navy-950/85 backdrop-blur-md border-b border-slate-800/80 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 p-0.5 shadow-glow-emerald">
                <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
                  Share<span className="text-emerald-400">Bite</span>
                </span>
                <span className="text-[10px] text-teal-400/80 font-mono tracking-widest block uppercase font-semibold">
                  Food Rescue Network
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-1">
                {user?.role === 'DONOR' && (
                  <Link
                    to="/donor"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      isActive('/donor')
                        ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-navy-850'
                    }`}
                  >
                    <Utensils className="w-4 h-4 text-emerald-400" />
                    Donor Workspace
                  </Link>
                )}

                {user?.role === 'NGO' && (
                  <Link
                    to="/ngo"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      isActive('/ngo')
                        ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-navy-850'
                    }`}
                  >
                    <HeartHandshake className="w-4 h-4 text-teal-400" />
                    NGO Rescue Hub
                  </Link>
                )}

                {user?.role === 'VOLUNTEER' && (
                  <Link
                    to="/volunteer"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      isActive('/volunteer')
                        ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-navy-850'
                    }`}
                  >
                    <Truck className="w-4 h-4 text-amber-400" />
                    Courier Missions
                  </Link>
                )}

                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      isActive('/admin')
                        ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-navy-850'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-rose-400" />
                    Admin Oversight
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right side controls: Role Quick-Switcher & Auth */}
          <div className="flex items-center gap-3">
            {/* 1-Click Role Switcher for Hackathon Judges */}
            <div className="relative group">
              <button
                className="px-2.5 py-1.5 rounded-lg bg-navy-850 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-teal-300 hover:border-teal-500/40 flex items-center gap-1.5 transition-colors"
                title="Switch role for demo testing"
              >
                <Layers className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden sm:inline">Role Switcher</span>
                <ChevronDown className="w-3 h-3 text-slate-500 group-hover:rotate-180 transition-transform" />
              </button>

              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-navy-900 border border-slate-700 shadow-xl py-1 z-50 hidden group-hover:block card-3d">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800">
                  Switch Active Role
                </div>
                <button
                  onClick={() => handleQuickRoleSwitch('DONOR')}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-300 hover:bg-navy-800 hover:text-white flex items-center gap-2"
                >
                  <Utensils className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Donor (GreenBite)</span>
                </button>
                <button
                  onClick={() => handleQuickRoleSwitch('NGO')}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-300 hover:bg-navy-800 hover:text-white flex items-center gap-2"
                >
                  <HeartHandshake className="w-3.5 h-3.5 text-teal-400" />
                  <span>NGO (Hope Pantry)</span>
                </button>
                <button
                  onClick={() => handleQuickRoleSwitch('VOLUNTEER')}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-300 hover:bg-navy-800 hover:text-white flex items-center gap-2"
                >
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Volunteer (Courier)</span>
                </button>
                <button
                  onClick={() => handleQuickRoleSwitch('ADMIN')}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-300 hover:bg-navy-800 hover:text-white flex items-center gap-2"
                >
                  <Shield className="w-3.5 h-3.5 text-rose-400" />
                  <span>System Administrator</span>
                </button>
              </div>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <NotificationDropdown />

                <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
                  <div className="text-right">
                    <p className="text-xs font-bold text-white truncate max-w-[120px]">{user?.name}</p>
                    <StatusBadge status={user?.role || ''} size="sm" />
                  </div>
                </div>

                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="p-2 rounded-lg bg-navy-850 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800/60 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-navy-850 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-3d-primary px-3.5 py-1.5 rounded-lg text-xs font-bold text-navy-950 flex items-center gap-1"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
