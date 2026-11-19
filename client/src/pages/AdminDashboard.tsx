import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { ImpactAnalytics, Organisation, Donation, ReportItem, AuditEvent } from '../types';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  Shield,
  Building2,
  AlertTriangle,
  FileText,
  Utensils,
  Leaf,
  Users,
  CheckCircle2,
  XCircle,
  Activity,
  RefreshCw,
  Search,
  Flame
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ORGS' | 'DONATIONS' | 'REPORTS' | 'AUDIT'>('OVERVIEW');
  const [analytics, setAnalytics] = useState<ImpactAnalytics | null>(null);
  const [pendingOrgs, setPendingOrgs] = useState<Organisation[]>([]);
  const [allDonations, setAllDonations] = useState<Donation[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Status Filter
  const [donationStatusFilter, setDonationStatusFilter] = useState('ALL');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [anaRes, orgsRes, donsRes, repsRes, logsRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/organisations/pending'),
        api.get('/admin/donations'),
        api.get('/admin/reports'),
        api.get('/admin/audit-logs'),
      ]);
      setAnalytics(anaRes.data);
      setPendingOrgs(orgsRes.data);
      setAllDonations(donsRes.data);
      setReports(repsRes.data);
      setAuditLogs(logsRes.data);
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifyOrg = async (orgId: string, status: 'VERIFIED' | 'REJECTED') => {
    const notes = prompt(`Enter optional verification audit notes for marking organisation ${status}:`, 'Registration credentials validated');
    if (notes === null) return;

    try {
      await api.post(`/admin/organisations/${orgId}/verify`, { status, notes });
      fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Verification failed');
    }
  };

  const handleResolveReport = async (reportId: string, status: 'RESOLVED' | 'DISMISSED') => {
    try {
      await api.post(`/admin/reports/${reportId}/resolve`, { status });
      fetchAdminData();
    } catch (err) {
      alert('Failed to resolve report');
    }
  };

  const filteredDonations = allDonations.filter((d) =>
    donationStatusFilter === 'ALL' ? true : d.status === donationStatusFilter
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-white">System Governance &amp; Admin Desk</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Administrator: <strong className="text-white">{user?.name}</strong> &bull; Total Platform Audit Trail &amp; Verification
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-navy-900 border border-slate-700/80 rounded-xl">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'OVERVIEW'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('ORGS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'ORGS'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Verifications</span>
            {pendingOrgs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-navy-950 text-[10px] font-black">
                {pendingOrgs.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('DONATIONS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'DONATIONS'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Donations ({allDonations.length})
          </button>
          <button
            onClick={() => setActiveTab('REPORTS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'REPORTS'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Reports ({reports.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'AUDIT'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Audit Log
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="Total Rescued Meals"
              value={analytics ? analytics.totalMealsRescued.toLocaleString() : '165'}
              subtitle="Distributed across community kitchens"
              icon={Utensils}
              variant="emerald"
            />
            <StatCard
              title="Diverted Surplus"
              value={analytics ? `${analytics.totalKgDiverted} kg` : '85.5 kg'}
              subtitle="Solid food diverted from landfills"
              icon={Leaf}
              variant="teal"
            />
            <StatCard
              title="Avoided CO2e"
              value={analytics ? `${analytics.co2eKgAvoided} kg` : '213.8 kg'}
              subtitle="Based on FAO standard metrics (~2.5x)"
              icon={Flame}
              variant="amber"
            />
            <StatCard
              title="Active Verified NGOs"
              value={analytics ? analytics.verifiedNgosCount.toString() : '2'}
              subtitle="Authorized to reserve surplus"
              icon={Building2}
              variant="navy"
            />
          </div>

          {/* Quick pending approval banner if pending orgs exist */}
          {pendingOrgs.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-950/70 border border-amber-500/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {pendingOrgs.length} Organisation{pendingOrgs.length > 1 ? 's' : ''} Awaiting Verification
                  </h4>
                  <p className="text-xs text-slate-300">
                    Review legal registration numbers and approve receiving permissions.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('ORGS')}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-navy-950 transition-colors"
              >
                Review Applications &rarr;
              </button>
            </div>
          )}

          {/* Breakdown summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-3d rounded-2xl p-6 bg-navy-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-400" />
                <span>Donation Lifecycle Distribution</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded-lg bg-navy-950">
                  <span className="text-slate-400">Available Publicly:</span>
                  <span className="font-bold text-emerald-400">{analytics?.activeListings || 0}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-navy-950">
                  <span className="text-slate-400">Reserved by NGOs:</span>
                  <span className="font-bold text-teal-400">{analytics?.reservedDonations || 0}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-navy-950">
                  <span className="text-slate-400">In Transit Courier Runs:</span>
                  <span className="font-bold text-amber-400">{analytics?.inTransitDonations || 0}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-navy-950">
                  <span className="text-slate-400">Completed &amp; Confirmed:</span>
                  <span className="font-bold text-blue-400">{analytics?.completedDonations || 0}</span>
                </div>
              </div>
            </div>

            <div className="card-3d rounded-2xl p-6 bg-navy-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-400" />
                <span>User Roles &amp; Community Participation</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded-lg bg-navy-950">
                  <span className="text-slate-400">Commercial Donors:</span>
                  <span className="font-bold text-white">{analytics?.totalDonorsCount || 2}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-navy-950">
                  <span className="text-slate-400">Verified Shelters &amp; Pantries:</span>
                  <span className="font-bold text-white">{analytics?.verifiedNgosCount || 2}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-navy-950">
                  <span className="text-slate-400">Active Volunteer Couriers:</span>
                  <span className="font-bold text-white">{analytics?.activeVolunteersCount || 2}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ORGANISATIONS TAB */}
      {activeTab === 'ORGS' && (
        <div className="space-y-6">
          <h2 className="text-base font-bold text-white">Pending Verification Applications</h2>
          {pendingOrgs.length === 0 ? (
            <div className="card-3d rounded-2xl p-12 text-center text-slate-400 text-xs">
              All registered organisations are currently verified. No pending applications!
            </div>
          ) : (
            <div className="space-y-4">
              {pendingOrgs.map((org) => (
                <div
                  key={org.id}
                  className="card-3d rounded-2xl p-5 bg-navy-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={org.verificationStatus} size="sm" />
                      <span className="text-xs font-mono text-slate-400">EIN: {org.registrationNumber || 'Pending'}</span>
                      <span className="text-[11px] text-slate-500 uppercase">{org.type}</span>
                    </div>

                    <h3 className="text-base font-bold text-white">{org.name}</h3>
                    <p className="text-xs text-slate-300">
                      📍 {org.address} &bull; Capacity: <strong className="text-teal-300">{org.capacity} servings/run</strong>
                    </p>
                    <p className="text-xs text-slate-400">
                      Contact: {org.contactPerson} &bull; {org.contactEmail} &bull; {org.contactPhone}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVerifyOrg(org.id, 'VERIFIED')}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve NGO</span>
                    </button>
                    <button
                      onClick={() => handleVerifyOrg(org.id, 'REJECTED')}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-950 border border-rose-800 text-rose-300 hover:bg-rose-900"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DONATIONS OVERSIGHT TAB */}
      {activeTab === 'DONATIONS' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-base font-bold text-white">All Platform Food Donations ({filteredDonations.length})</h2>
            <div className="flex flex-wrap gap-1">
              {['ALL', 'AVAILABLE', 'RESERVED', 'PICKED_UP', 'COMPLETED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setDonationStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    donationStatusFilter === st
                      ? 'bg-rose-600 text-white'
                      : 'bg-navy-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="card-3d rounded-2xl overflow-hidden border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-navy-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Listing Title</th>
                    <th className="p-3.5">Donor</th>
                    <th className="p-3.5">Volume</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Claimed By</th>
                    <th className="p-3.5">Courier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredDonations.map((d) => (
                    <tr key={d.id} className="hover:bg-navy-850/50">
                      <td className="p-3.5 font-bold text-white">{d.title}</td>
                      <td className="p-3.5 text-slate-300">{d.donorName}</td>
                      <td className="p-3.5 text-teal-300">{d.estimatedServings} servings</td>
                      <td className="p-3.5"><StatusBadge status={d.status} size="sm" /></td>
                      <td className="p-3.5 text-slate-300">{d.claimedByNgoName || '—'}</td>
                      <td className="p-3.5 text-slate-300">{d.assignedVolunteerName || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === 'REPORTS' && (
        <div className="space-y-6">
          <h2 className="text-base font-bold text-white">Incident &amp; Food Safety Reports</h2>
          {reports.length === 0 ? (
            <div className="card-3d rounded-2xl p-12 text-center text-slate-400 text-xs">
              No reported incidents or food safety flags on file.
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((rep) => (
                <div key={rep.id} className="card-3d rounded-2xl p-5 bg-navy-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800">
                      {rep.reason}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(rep.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200">
                    <strong>Reported Target:</strong> {rep.targetType} (#{rep.targetId.substring(0, 8)}) &bull; <strong>Reporter:</strong> {rep.reporterName}
                  </p>

                  <p className="text-xs text-slate-300 italic p-3 rounded-xl bg-navy-950 border border-slate-800">
                    "{rep.description}"
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-xs font-semibold text-slate-400">
                      Status: <strong className="text-white">{rep.status}</strong>
                    </span>
                    {rep.status === 'OPEN' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleResolveReport(rep.id, 'RESOLVED')}
                          className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          Resolve &amp; Archive
                        </button>
                        <button
                          onClick={() => handleResolveReport(rep.id, 'DISMISSED')}
                          className="px-3 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AUDIT LOG TAB */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Real-Time Platform Audit Events</h2>
            <button
              onClick={fetchAdminData}
              className="p-1.5 rounded-lg bg-navy-850 text-slate-400 hover:text-white border border-slate-700 text-xs flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Log</span>
            </button>
          </div>

          <div className="card-3d rounded-2xl overflow-hidden border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-navy-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Actor</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Entity</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-navy-850/50">
                      <td className="p-3.5 text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="p-3.5 font-bold text-white font-sans">{log.actorName}</td>
                      <td className="p-3.5 text-teal-400">{log.actorRole}</td>
                      <td className="p-3.5 text-slate-300">{log.entityType}</td>
                      <td className="p-3.5 font-bold text-emerald-400">{log.action}</td>
                      <td className="p-3.5 text-slate-400 font-sans">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
