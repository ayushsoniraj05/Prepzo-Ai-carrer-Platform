import React, { useState, useEffect } from 'react';
import { 
  getAuditLogs, 
  AuditLog, 
  Pagination 
} from '../../api/admin';
import { 
  Shield, 
  Search, 
  Filter, 
  Clock, 
  User as UserIcon, 
  Globe, 
  AlertCircle,
  CheckCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const AdminAuditTab: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [page, category, severity]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditLogs({
        page,
        limit: 20,
        search,
        category,
        severity
      });
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle size={14} className="text-emerald-400" />;
      case 'failure': return <AlertCircle size={14} className="text-red-400" />;
      case 'warning': return <AlertCircle size={14} className="text-yellow-400" />;
      default: return <Info size={14} className="text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="text-emerald-400" size={24} />
            System Audit Logs
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Track and monitor all administrative and security events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by email, IP, description..."
              className="bg-zinc-900/50 border border-zinc-800 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-emerald-500/50 w-64 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchLogs()}
            />
          </div>
          <button 
            onClick={fetchLogs}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Search
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/50">
        <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium mr-2">
          <Filter size={16} />
          Filters:
        </div>
        
        <select 
          className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-emerald-500/50"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
        >
          <option value="">All Categories</option>
          <option value="authentication">Authentication</option>
          <option value="security">Security</option>
          <option value="admin">Admin Actions</option>
          <option value="data">Data Access</option>
          <option value="system">System Events</option>
        </select>

        <select 
          className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-emerald-500/50"
          value={severity}
          onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
        >
          <option value="">All Severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Timestamp & Event</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8 h-16 bg-zinc-900/20"></td>
                  </tr>
                ))
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-emerald-400 font-medium text-sm flex items-center gap-1.5">
                          {log.action.replace(/_/g, ' ')}
                        </span>
                        <div className="flex items-center gap-2 text-zinc-500 text-[10px]">
                          <Clock size={10} />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                          <UserIcon size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white text-sm font-medium">{log.userId?.fullName || 'Anonymous'}</span>
                          <span className="text-zinc-500 text-[11px]">{log.userEmail || log.ipAddress}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(log.status)}
                        <span className={`text-xs capitalize ${
                          log.status === 'success' ? 'text-emerald-400' :
                          log.status === 'failure' ? 'text-red-400' :
                          log.status === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-zinc-300 text-xs max-w-[200px] truncate">{log.description}</span>
                        <div className="flex items-center gap-2 text-zinc-500 text-[10px]">
                          <Globe size={10} />
                          {log.ipAddress}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-zinc-500">
                    No audit logs found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-zinc-800/20 border-t border-zinc-800">
            <div className="text-zinc-500 text-xs">
              Showing <span className="text-white">{logs.length}</span> of <span className="text-white">{pagination.total}</span> events
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-zinc-400"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="text-zinc-400 text-xs px-2">
                Page <span className="text-white">{page}</span> of {pagination.pages}
              </div>
              <button
                disabled={page === pagination.pages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-zinc-400"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditTab;
