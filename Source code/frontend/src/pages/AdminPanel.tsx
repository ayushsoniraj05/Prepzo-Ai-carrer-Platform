import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, GlassButton } from '@/components/ui/GlassCard';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import ThinkingLoader from '@/components/ui/loading';
import * as adminApi from '@/api/admin';
import type { User, DashboardStats, Violation, UserDetails } from '@/api/admin';
import {
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  Building2,
  Shield,
  Bell,
  Eye,
  UserX,
  Plus,
  Search,
  Download,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Crown,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  ShieldAlert,
  Briefcase,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { GridBeam } from '@/components/ui/background-grid-beam';
import { companiesApi, Company } from '@/api/companies';
import { jobsApi, Job } from '@/api/jobs';
import AdminAuditTab from '@/components/admin/AdminAuditTab';

interface AdminPanelProps {
  onNavigate: (page: string) => void;
}

const sidebarItems = [
  { icon: BarChart3, label: 'Dashboard', id: 'dashboard' },
  { icon: Users, label: 'Users', id: 'users' },
  { icon: FileText, label: 'Tests', id: 'tests' },
  { icon: Building2, label: 'Companies', id: 'companies' },
  { icon: Briefcase, label: 'Jobs', id: 'jobs' },
  { icon: Shield, label: 'Proctor Logs', id: 'proctoring' },
  { icon: Bell, label: 'Announcements', id: 'announcements' },
  { icon: ShieldAlert, label: 'Security Logs', id: 'audit' },
  { icon: Settings, label: 'Settings', id: 'settings' },
];

export const AdminPanel = ({ onNavigate }: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, isAuthenticated, user: authUser } = useAuthStore();
  
  // Auth check state
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // Data states
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  
  // Selected users for bulk actions
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  // Modal states
  const [editingUser, setEditingUser] = useState<UserDetails | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  
  // Check auth on mount
  useEffect(() => {
    if (!isAuthenticated) {
      setAuthError('Please log in to access the admin panel');
      setLoading(false);
      return;
    }
    
    if (authUser?.role !== 'admin' && authUser?.role !== 'superadmin') {
      setAuthError('You do not have permission to access the admin panel');
      setLoading(false);
      return;
    }
    
    setIsAuthorized(true);
  }, [isAuthenticated, authUser]);
  
  // Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await adminApi.getDashboardStats();
      setStats(data);
      setAuthError(null);
    } catch (error: unknown) {
      if ((error as { response?: { status?: number } })?.response?.status === 401) {
        setAuthError('Session expired. Please log in again.');
        return;
      }
      const errMsg = error instanceof Error ? error.message : 'Failed to fetch stats';
      toast.error(errMsg);
    }
  }, []);
  
  // Fetch users
  const fetchUsers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const data = await adminApi.getAllUsers({
        page,
        limit: pagination.limit,
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        role: roleFilter || undefined,
      });
      setUsers(data.users);
      setPagination(data.pagination);
      setAuthError(null);
    } catch (error: unknown) {
      if ((error as { response?: { status?: number } })?.response?.status === 401) {
        setAuthError('Session expired. Please log in again.');
        return;
      }
      const errMsg = error instanceof Error ? error.message : 'Failed to fetch users';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, roleFilter, pagination.limit]);
  
  // Fetch proctoring logs
  const fetchViolations = useCallback(async () => {
    try {
      const data = await adminApi.getProctoringLogs({
        severity: severityFilter as 'warning' | 'critical' | undefined,
      });
      setViolations(data.violations);
    } catch (error: unknown) {
      if ((error as { response?: { status?: number } })?.response?.status === 401) {
        return; // Auth error already shown
      }
      const errMsg = error instanceof Error ? error.message : 'Failed to fetch violations';
      toast.error(errMsg);
    }
  }, [severityFilter]);
  
  // Load data on mount (only if authorized)
  useEffect(() => {
    if (isAuthorized) {
      fetchStats();
      fetchUsers();
      fetchViolations();
    }
  }, [isAuthorized, fetchStats, fetchUsers, fetchViolations]);
  
  // Search debounce
  useEffect(() => {
    if (!isAuthorized) return;
    const timeout = setTimeout(() => {
      if (activeTab === 'users') {
        fetchUsers(1);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchQuery, statusFilter, roleFilter, fetchUsers, activeTab, isAuthorized]);
  
  // User actions
  const handleBlockUser = async (userId: string) => {
    try {
      await adminApi.toggleUserStatus(userId, 'suspended');
      toast.success('User blocked successfully');
      fetchUsers(pagination.page);
      fetchStats();
    } catch {
      toast.error('Failed to block user');
    }
  };
  
  const handleUnblockUser = async (userId: string) => {
    try {
      await adminApi.toggleUserStatus(userId, 'active');
      toast.success('User unblocked successfully');
      fetchUsers(pagination.page);
      fetchStats();
    } catch {
      toast.error('Failed to unblock user');
    }
  };
  
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await adminApi.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers(pagination.page);
      fetchStats();
    } catch {
      toast.error('Failed to delete user');
    }
  };
  
  const handleMakeAdmin = async (userId: string) => {
    try {
      await adminApi.changeUserRole(userId, 'admin');
      toast.success('User promoted to admin');
      fetchUsers(pagination.page);
      fetchStats();
    } catch {
      toast.error('Failed to change role');
    }
  };
  
  const handleRemoveAdmin = async (userId: string) => {
    try {
      await adminApi.changeUserRole(userId, 'student');
      toast.success('Admin demoted to student');
      fetchUsers(pagination.page);
      fetchStats();
    } catch {
      toast.error('Failed to change role');
    }
  };
  
  const handleBulkAction = async (action: 'block' | 'unblock' | 'delete') => {
    if (selectedUsers.length === 0) {
      toast.error('No users selected');
      return;
    }
    if (action === 'delete' && !confirm(`Delete ${selectedUsers.length} users?`)) return;
    
    try {
      await adminApi.bulkUserAction(selectedUsers, action);
      toast.success(`Bulk ${action} completed`);
      setSelectedUsers([]);
      fetchUsers(pagination.page);
      fetchStats();
    } catch {
      toast.error(`Bulk ${action} failed`);
    }
  };
  
  const handleExport = async () => {
    try {
      const data = await adminApi.exportUsers('csv');
      const blob = new Blob([data as string], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch {
      toast.error('Export failed');
    }
  };
  
  const handleViewUser = async (userId: string) => {
    try {
      const data = await adminApi.getUserDetails(userId);
      setEditingUser(data.user);
      setShowUserModal(true);
    } catch {
      toast.error('Failed to load user details');
    }
  };
  
  const toggleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };
  
  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    onNavigate('landing');
  };

  // Show auth error screen
  if (authError) {
    return (
      <div className="min-h-screen bg-[#0a0c10] text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full mx-4"
        >
          <GlassCard className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-400 mb-6">{authError}</p>
            <div className="flex gap-3 justify-center">
              <GlassButton variant="primary" onClick={() => onNavigate('login')}>
                Login
              </GlassButton>
              <GlassButton variant="secondary" onClick={() => onNavigate('landing')}>
                Go Home
              </GlassButton>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  // Show loading while checking auth
  if (!isAuthorized && loading) {
    return (
      <div className="min-h-screen bg-[#0a0c10] text-white flex flex-col items-center justify-center">
        <ThinkingLoader loadingText="Accessing Command Center" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full bg-[#0a0c10] z-0 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
      <GridBeam className="absolute inset-0" />

      {/* FloatingElements removed for cleaner admin UI */}

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white/10 backdrop-blur-xl"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth >= 1024 ? 0 : -280) }}
        className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900/80 backdrop-blur-xl border-r border-white/5 z-40 lg:translate-x-0"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold">Admin</span>
              <p className="text-xs text-gray-400">Prepzo Panel</p>
            </div>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-white border border-red-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <main className="lg:ml-64 p-6 lg:p-8 relative z-10 pointer-events-none">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 pointer-events-auto"
        >
          <div className="flex items-center justify-between pointer-events-auto">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-400 mt-2">Manage users, tests, and platform settings</p>
            </div>
            <GlassButton 
              variant="secondary" 
              onClick={async () => {
                const toastId = toast.loading('Seeding system data...');
                try {
                  const res = await adminApi.seedSystemData();
                  if (res.success) {
                    toast.success(res.message, { id: toastId });
                    fetchStats();
                  }
                } catch (err: any) {
                  toast.error(err.response?.data?.message || 'Seeding failed', { id: toastId });
                }
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Seed System Data
            </GlassButton>
          </div>
        </motion.div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6 pointer-events-auto">
            {/* Stats cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { label: 'Total Users', value: stats?.users.total || 0, sub: `${stats?.users.todayRegistrations || 0} today`, icon: Users, color: 'purple' },
                { label: 'Active (24h)', value: stats?.users.active24h || 0, sub: 'students', icon: UserCheck, color: 'indigo' },
                { label: 'Tests Done', value: stats?.tests.completed || 0, sub: `${stats?.tests.active || 0} active`, icon: FileText, color: 'blue' },
                { label: 'Avg. Score', value: `${stats?.performance.avgPlacementScore || 0}%`, sub: `${stats?.users.assessmentCompleted || 0} assessed`, icon: BarChart3, color: 'green' },
                { label: 'Violations', value: stats?.performance.totalViolations || 0, sub: `${stats?.users.blocked || 0} blocked`, icon: AlertTriangle, color: 'red' },
              ].map((stat, index) => (
                <GlassCard key={index} delay={index * 0.1}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <p className="text-sm mt-1 text-gray-500">{stat.sub}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      stat.color === 'purple' ? 'bg-purple-500/20' :
                      stat.color === 'blue' ? 'bg-blue-500/20' :
                      stat.color === 'green' ? 'bg-green-500/20' : 
                      stat.color === 'indigo' ? 'bg-indigo-500/20' : 'bg-red-500/20'
                    }`}>
                      <stat.icon className={`w-6 h-6 ${
                        stat.color === 'purple' ? 'text-purple-400' :
                        stat.color === 'blue' ? 'text-blue-400' :
                        stat.color === 'green' ? 'text-green-400' : 
                        stat.color === 'indigo' ? 'text-indigo-400' : 'text-red-400'
                      }`} />
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
            
            {/* Role breakdown */}
            <div className="grid md:grid-cols-3 gap-6">
              <GlassCard delay={0.2}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.users.active || 0}</p>
                    <p className="text-gray-400 text-sm">Active Users</p>
                  </div>
                </div>
              </GlassCard>
              <GlassCard delay={0.3}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.users.admins || 0}</p>
                    <p className="text-gray-400 text-sm">Admins</p>
                  </div>
                </div>
              </GlassCard>
              <GlassCard delay={0.4}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.users.pending || 0}</p>
                    <p className="text-gray-400 text-sm">Pending Verification</p>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Recent activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <GlassCard delay={0.4}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Recent Users</h3>
                  <GlassButton variant="ghost" size="sm" onClick={() => setActiveTab('users')}>View All</GlassButton>
                </div>
                <div className="space-y-3">
                  {users.slice(0, 4).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold">
                          {user.fullName?.[0] || '?'}
                        </div>
                        <div>
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.role === 'admin' && (
                          <Crown className="w-4 h-4 text-purple-400" />
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          user.status === 'pending_verification' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No users found</p>
                  )}
                </div>
              </GlassCard>

              <GlassCard delay={0.5}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Proctoring Alerts</h3>
                  <GlassButton variant="ghost" size="sm" onClick={() => setActiveTab('proctoring')}>View All</GlassButton>
                </div>
                <div className="space-y-3">
                  {violations.slice(0, 4).map((v) => (
                    <div key={v.id} className={`p-3 rounded-xl ${
                      v.severity === 'critical' ? 'bg-red-500/10 border border-red-500/20' :
                      'bg-yellow-500/10 border border-yellow-500/20'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{v.type.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-gray-400">{v.user?.name || 'Unknown'} • {v.testField}</p>
                        </div>
                        <span className="text-xs text-gray-500">{new Date(v.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  {violations.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No violations recorded</p>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="pointer-events-auto">
            <GlassCard>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <h3 className="text-lg font-semibold">User Management</h3>
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Blocked</option>
                  <option value="pending_verification">Pending</option>
                </select>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
                >
                  <option value="">All Roles</option>
                  <option value="student">Students</option>
                  <option value="admin">Admins</option>
                </select>
                <GlassButton variant="secondary" size="sm" onClick={() => fetchUsers(pagination.page)}>
                  <RefreshCw className="w-4 h-4" />
                </GlassButton>
                <GlassButton variant="primary" size="sm" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </GlassButton>
              </div>
            </div>
            
            {/* Bulk actions */}
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-4 mb-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <span className="text-sm">{selectedUsers.length} selected</span>
                <GlassButton variant="ghost" size="sm" onClick={() => handleBulkAction('block')}>
                  <Lock className="w-4 h-4 mr-1" /> Block
                </GlassButton>
                <GlassButton variant="ghost" size="sm" onClick={() => handleBulkAction('unblock')}>
                  <Unlock className="w-4 h-4 mr-1" /> Unblock
                </GlassButton>
                <GlassButton variant="ghost" size="sm" onClick={() => handleBulkAction('delete')} className="text-red-400">
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </GlassButton>
                <GlassButton variant="ghost" size="sm" onClick={() => setSelectedUsers([])}>
                  Clear
                </GlassButton>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4">
                          <input 
                            type="checkbox" 
                            checked={selectedUsers.length === users.length && users.length > 0}
                            onChange={toggleSelectAll}
                            className="rounded"
                          />
                        </th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Role</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Score</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Joined</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-4">
                            <input 
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => toggleSelectUser(user.id)}
                              className="rounded"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold">
                                {user.fullName?.[0] || '?'}
                              </div>
                              <div>
                                <p className="font-medium">{user.fullName}</p>
                                <p className="text-xs text-gray-400">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${
                              user.role === 'admin' || user.role === 'superadmin'
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {user.role === 'admin' && <Crown className="w-3 h-3" />}
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs ${
                              user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                              user.status === 'pending_verification' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">{user.placementReadinessScore}%</td>
                          <td className="py-3 px-4 text-gray-400 text-sm">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => handleViewUser(user.id)}
                                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {user.status === 'suspended' ? (
                                <button 
                                  onClick={() => handleUnblockUser(user.id)}
                                  className="p-2 rounded-lg hover:bg-green-500/10 text-gray-400 hover:text-green-400"
                                  title="Unblock"
                                >
                                  <Unlock className="w-4 h-4" />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleBlockUser(user.id)}
                                  className="p-2 rounded-lg hover:bg-yellow-500/10 text-gray-400 hover:text-yellow-400"
                                  title="Block"
                                >
                                  <Lock className="w-4 h-4" />
                                </button>
                              )}
                              {user.role === 'student' ? (
                                <button 
                                  onClick={() => handleMakeAdmin(user.id)}
                                  className="p-2 rounded-lg hover:bg-purple-500/10 text-gray-400 hover:text-purple-400"
                                  title="Make Admin"
                                >
                                  <Crown className="w-4 h-4" />
                                </button>
                              ) : user.role === 'admin' && (
                                <button 
                                  onClick={() => handleRemoveAdmin(user.id)}
                                  className="p-2 rounded-lg hover:bg-gray-500/10 text-gray-400 hover:text-gray-300"
                                  title="Remove Admin"
                                >
                                  <UserX className="w-4 h-4" />
                                </button>
                              )}
                              <button 
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {users.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No users found</p>
                )}
                
                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-400">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                    </p>
                    <div className="flex items-center gap-2">
                      <GlassButton 
                        variant="ghost" 
                        size="sm"
                        disabled={pagination.page === 1}
                        onClick={() => fetchUsers(pagination.page - 1)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </GlassButton>
                      <span className="px-3 py-1 bg-white/10 rounded-lg text-sm">
                        {pagination.page} / {pagination.pages}
                      </span>
                      <GlassButton 
                        variant="ghost" 
                        size="sm"
                        disabled={pagination.page === pagination.pages}
                        onClick={() => fetchUsers(pagination.page + 1)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </GlassButton>
                    </div>
                  </div>
                )}
              </>
            )}
          </GlassCard>
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="space-y-6 pointer-events-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Test Management</h3>
              <GlassButton variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Test
              </GlassButton>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['DSA Assessment', 'SQL Fundamentals', 'System Design', 'OOPS Concepts', 'Web Development', 'Aptitude Test'].map((test, index) => (
                <GlassCard key={index} delay={index * 0.1}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">{test}</h4>
                    <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">Active</span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>Questions: 30</p>
                    <p>Duration: 45 mins</p>
                    <p>Attempts: 1,245</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <GlassButton variant="ghost" size="sm" className="flex-1">Edit</GlassButton>
                    <GlassButton variant="secondary" size="sm" className="flex-1">View</GlassButton>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'companies' && (
          <AdminCompaniesTab />
        )}

        {activeTab === 'jobs' && (
          <AdminJobsTab />
        )}

        {activeTab === 'proctoring' && (
          <div className="pointer-events-auto">
            <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Proctoring Logs</h3>
                <div className="flex items-center gap-4">
                  <select 
                    value={severityFilter}
                    onChange={(e) => {
                      setSeverityFilter(e.target.value);
                      fetchViolations();
                    }}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
                  >
                    <option value="">All Severity</option>
                    <option value="critical">Critical</option>
                    <option value="warning">Warning</option>
                  </select>
                  <GlassButton variant="secondary" size="sm" onClick={fetchViolations}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </GlassButton>
                </div>
              </div>

              <div className="space-y-3">
                {violations.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No violations recorded</p>
                ) : (
                  violations.map((v) => (
                    <div key={v.id} className={`p-4 rounded-xl ${
                      v.severity === 'critical' ? 'bg-red-500/10 border border-red-500/20' :
                      'bg-yellow-500/10 border border-yellow-500/20'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            v.severity === 'critical' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                          }`}>
                            <AlertTriangle className={`w-5 h-5 ${
                              v.severity === 'critical' ? 'text-red-400' : 'text-yellow-400'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium">{v.type.replace(/_/g, ' ').toUpperCase()}</p>
                            <p className="text-sm text-gray-400">
                              {v.user?.name || 'Unknown User'} • {v.testField}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{v.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-300 font-medium">{new Date(v.timestamp).toLocaleString()}</p>
                          <GlassButton variant="ghost" size="sm" className="mt-2" onClick={() => handleViewUser(v.user?.id || '')}>
                            View User
                          </GlassButton>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="pointer-events-auto">
            <AdminAnnouncementsTab />
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="pointer-events-auto">
            <AdminAuditTab />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="pointer-events-auto">
            <GlassCard>
              <h3 className="text-lg font-semibold mb-6">Platform Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="font-medium">Proctoring Enabled</p>
                    <p className="text-sm text-gray-400">Enable anti-cheating measures for tests</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded bg-white/10 border-white/20 text-purple-500" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="font-medium">Auto-terminate on violations</p>
                    <p className="text-sm text-gray-400">End test after 3 violations</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded bg-white/10 border-white/20 text-purple-500" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="font-medium">Maintenance Mode</p>
                    <p className="text-sm text-gray-400">Temporarily disable platform access</p>
                  </div>
                  <input type="checkbox" className="rounded bg-white/10 border-white/20 text-purple-500" />
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </main>
      
      {/* User Detail Modal */}
      <AnimatePresence>
        {showUserModal && editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 pointer-events-auto"
            onClick={() => setShowUserModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">User Details</h3>
                <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl font-bold">
                    {editingUser.fullName?.[0] || '?'}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold">{editingUser.fullName}</h4>
                    <p className="text-gray-400">{editingUser.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        editingUser.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {editingUser.role}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        editingUser.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {editingUser.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Personal Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                    <p>{editingUser.phone || '-'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-xs text-gray-500 mb-1">Date of Birth</p>
                    <p>{editingUser.dateOfBirth || '-'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-xs text-gray-500 mb-1">Gender</p>
                    <p>{editingUser.gender || '-'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-xs text-gray-500 mb-1">Joined</p>
                    <p>{editingUser.createdAt ? new Date(editingUser.createdAt).toLocaleDateString() : '-'}</p>
                  </div>
                </div>
                
                {/* Education */}
                <div>
                  <h5 className="font-semibold mb-3">Education</h5>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-white/5">
                      <p className="text-xs text-gray-500 mb-1">College</p>
                      <p>{editingUser.collegeName || '-'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5">
                      <p className="text-xs text-gray-500 mb-1">Degree</p>
                      <p>{editingUser.degree || '-'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5">
                      <p className="text-xs text-gray-500 mb-1">Field of Study</p>
                      <p>{editingUser.fieldOfStudy || '-'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5">
                      <p className="text-xs text-gray-500 mb-1">CGPA</p>
                      <p>{editingUser.cgpa || '-'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Career */}
                <div>
                  <h5 className="font-semibold mb-3">Career</h5>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-white/5">
                      <p className="text-xs text-gray-500 mb-1">Target Role</p>
                      <p>{editingUser.targetRole || '-'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5">
                      <p className="text-xs text-gray-500 mb-1">Expected CTC</p>
                      <p>{editingUser.expectedCtc || '-'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5">
                      <p className="text-xs text-gray-500 mb-1">Placement Score</p>
                      <p className="text-xl font-bold text-purple-400">{editingUser.placementReadinessScore}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5">
                      <p className="text-xs text-gray-500 mb-1">ATS Score</p>
                      <p className="text-xl font-bold text-blue-400">{editingUser.atsScore || 0}%</p>
                    </div>
                  </div>
                </div>
                
                {/* Skills */}
                {editingUser.knownTechnologies && editingUser.knownTechnologies.length > 0 && (
                  <div>
                    <h5 className="font-semibold mb-3">Technologies</h5>
                    <div className="flex flex-wrap gap-2">
                      {editingUser.knownTechnologies.map((tech, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  {editingUser.status === 'suspended' ? (
                    <GlassButton variant="primary" onClick={() => { handleUnblockUser(editingUser.id); setShowUserModal(false); }}>
                      <Unlock className="w-4 h-4 mr-2" /> Unblock User
                    </GlassButton>
                  ) : (
                    <GlassButton variant="secondary" onClick={() => { handleBlockUser(editingUser.id); setShowUserModal(false); }}>
                      <Lock className="w-4 h-4 mr-2" /> Block User
                    </GlassButton>
                  )}
                  {editingUser.role === 'student' ? (
                    <GlassButton variant="secondary" onClick={() => { handleMakeAdmin(editingUser.id); setShowUserModal(false); }}>
                      <Crown className="w-4 h-4 mr-2" /> Make Admin
                    </GlassButton>
                  ) : editingUser.role === 'admin' && (
                    <GlassButton variant="ghost" onClick={() => { handleRemoveAdmin(editingUser.id); setShowUserModal(false); }}>
                      <UserX className="w-4 h-4 mr-2" /> Remove Admin
                    </GlassButton>
                  )}
                  <GlassButton 
                    variant="ghost" 
                    className="text-red-400 ml-auto"
                    onClick={() => { handleDeleteUser(editingUser.id); setShowUserModal(false); }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </GlassButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============ Admin Announcements Tab Component ============
function AdminAnnouncementsTab() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [targetRole, setTargetRole] = useState<'all' | 'student' | 'admin'>('all');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Please fill in both title and message');
      return;
    }

    setSending(true);
    try {
      const res = await adminApi.sendAnnouncement({
        title,
        message,
        priority,
        targetRole
      });
      if (res.success) {
        toast.success(res.message);
        setTitle('');
        setMessage('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send announcement');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 pointer-events-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Broadcase Announcement</h3>
        <GlassButton variant="ghost" size="sm" onClick={() => { setTitle(''); setMessage(''); }}>
          <RefreshCw className="w-4 h-4 mr-2" /> Reset
        </GlassButton>
      </div>

      <GlassCard>
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Target Audience</label>
              <select 
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
              >
                <option value="all">All Users</option>
                <option value="student">Students Only</option>
                <option value="admin">Admins Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Priority Level</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Announcement Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Scheduled Maintenance"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Message Body</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Detailed message for the users..."
              rows={5}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <GlassButton 
              variant="primary" 
              className="flex-1"
              onClick={handleSend}
              disabled={sending}
            >
              <Bell className="w-4 h-4 mr-2" />
              {sending ? 'Sending...' : 'Broadcast Now'}
            </GlassButton>
            <GlassButton variant="secondary" className="px-8">
              Schedule for Later
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      <div className="mt-8">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Recent Broadcasts
        </h4>
        <GlassCard className="text-center py-8">
          <p className="text-gray-500 text-sm italic">History feature coming soon. Announcements are currently sent as system notifications.</p>
        </GlassCard>
      </div>
    </div>
  );
}

// ============ Admin Jobs Tab Component ============
function AdminJobsTab() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<{ status?: string, isApproved?: boolean }>({ isApproved: false });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await jobsApi.getAllJobsAdmin(page, 12, filter.status, filter.isApproved);
      if (res.success) {
        setJobs(res.data.jobs);
        setTotalPages(res.data.pagination.pages);
      }
    } catch {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleApprove = async (id: string, isApproved: boolean) => {
    try {
      await jobsApi.approveJob(id, isApproved);
      toast.success(isApproved ? 'Job approved!' : 'Job rejected');
      fetchJobs();
    } catch {
      toast.error('Action failed');
    }
  };

  return (
    <div className="space-y-6 pointer-events-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Job Moderation</h3>
        <div className="flex gap-4">
          <select 
            value={filter.isApproved === undefined ? 'all' : filter.isApproved.toString()}
            onChange={(e) => setFilter({ ...filter, isApproved: e.target.value === 'all' ? undefined : e.target.value === 'true' })}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
          >
            <option value="false">Pending Approval</option>
            <option value="true">Approved</option>
            <option value="all">All Jobs</option>
          </select>
          <GlassButton variant="secondary" size="sm" onClick={fetchJobs}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </GlassButton>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      ) : jobs.length === 0 ? (
        <GlassCard className="text-center py-12">
          <Briefcase className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">No jobs matching filters</p>
        </GlassCard>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <GlassCard key={job._id}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  {job.company?.logo ? (
                    <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold truncate">{job.title}</h4>
                  <p className="text-sm text-gray-400 truncate">{job.company?.name}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-400 mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-4 h-4 ${job.isApproved ? 'text-green-400' : 'text-yellow-400'}`} />
                  <span>Status: {job.isApproved ? 'Approved' : 'Pending'}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {!job.isApproved ? (
                  <GlassButton 
                    variant="primary" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleApprove(job._id, true)}
                  >
                    Approve
                  </GlassButton>
                ) : (
                  <GlassButton 
                    variant="secondary" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleApprove(job._id, false)}
                  >
                    Revoke
                  </GlassButton>
                )}
                <GlassButton variant="ghost" size="sm" onClick={() => window.open(`/jobs/${job._id}`, '_blank')}>
                  <ExternalLink className="w-4 h-4" />
                </GlassButton>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
      
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <GlassButton 
            variant="ghost" 
            size="sm" 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </GlassButton>
          <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
          <GlassButton 
            variant="ghost" 
            size="sm" 
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </GlassButton>
        </div>
      )}
    </div>
  );
}

// ============ Admin Companies Tab Component ============
const INDUSTRY_OPTIONS = [
  'Information Technology', 'Software Development', 'E-commerce',
  'Finance & Banking', 'Consulting', 'Healthcare', 'Education',
  'Manufacturing', 'Telecommunications', 'Media & Entertainment',
  'Automotive', 'Aerospace', 'Energy', 'Retail', 'Hospitality', 'Real Estate', 'Other',
];

const COMPANY_TYPE_OPTIONS = ['Product', 'Service', 'Startup', 'MNC', 'Government', 'PSU', 'Other'];
const COMPANY_SIZE_OPTIONS = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'];
const HIRING_STATUS_OPTIONS = [
  { value: 'actively_hiring', label: 'Actively Hiring', color: 'green' },
  { value: 'occasionally_hiring', label: 'Occasionally Hiring', color: 'yellow' },
  { value: 'not_hiring', label: 'Not Hiring', color: 'gray' },
];

const emptyCompanyForm = {
  name: '',
  description: '',
  industry: 'Information Technology',
  companyType: 'Other',
  companySize: '51-200',
  hiringStatus: 'actively_hiring' as 'actively_hiring' | 'occasionally_hiring' | 'not_hiring',
  website: '',
  headquarters: { city: '', state: '', country: 'India' } as { city: string; state?: string; country: string },
  techStack: [] as string[],
};

function AdminCompaniesTab() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyCompanyForm);
  const [techInput, setTechInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await companiesApi.getCompanies({
        search: search || undefined,
        page,
        limit: 12,
      });
      if (res.success) {
        setCompanies(res.data.companies);
        setTotalPages(res.data.pagination.pages);
        setTotal(res.data.pagination.total);
      }
    } catch {
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchCompanies();
    }, 400);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAddModal = () => {
    setForm(emptyCompanyForm);
    setEditingId(null);
    setTechInput('');
    setShowModal(true);
  };

  const openEditModal = (c: Company) => {
    setForm({
      name: c.name || '',
      description: c.description || '',
      industry: c.industry || 'Information Technology',
      companyType: c.companyType || 'Other',
      companySize: c.companySize || '51-200',
      hiringStatus: (c.hiringStatus || 'actively_hiring') as 'actively_hiring' | 'occasionally_hiring' | 'not_hiring',
      website: c.website || '',
      headquarters: (c.headquarters || { city: '', state: '', country: 'India' }) as { city: string; state?: string; country: string },
      techStack: c.techStack || [],
    });
    setEditingId(c._id);
    setTechInput('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Company name is required');
      return;
    }
    if (!form.industry) {
      toast.error('Industry is required');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await companiesApi.updateCompany(editingId, form as unknown as Partial<Company>);
        toast.success('Company updated!');
      } else {
        await companiesApi.createCompany(form as unknown as Partial<Company>);
        toast.success('Company added!');
      }
      setShowModal(false);
      fetchCompanies();
    } catch {
      toast.error(editingId ? 'Failed to update company' : 'Failed to add company');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This will also delete all related jobs.`)) return;
    try {
      await companiesApi.deleteCompany(id);
      toast.success('Company deleted');
      fetchCompanies();
    } catch {
      toast.error('Failed to delete company');
    }
  };

  const addTech = () => {
    const t = techInput.trim();
    if (t && !form.techStack.includes(t)) {
      setForm({ ...form, techStack: [...form.techStack, t] });
    }
    setTechInput('');
  };

  const removeTech = (tech: string) => {
    setForm({ ...form, techStack: form.techStack.filter((t) => t !== tech) });
  };

  const hiringBadge = (status: string) => {
    const opt = HIRING_STATUS_OPTIONS.find((o) => o.value === status);
    if (!opt) return null;
    const cls =
      opt.color === 'green' ? 'bg-green-500/20 text-green-400' :
      opt.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
      'bg-gray-500/20 text-gray-400';
    return <span className={`px-2 py-1 rounded-full text-xs ${cls}`}>{opt.label}</span>;
  };

  return (
    <div className="space-y-6 pointer-events-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Company Management</h3>
          <p className="text-sm text-gray-400">{total} companies total</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-56 pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
          <GlassButton variant="secondary" size="sm" onClick={fetchCompanies}>
            <RefreshCw className="w-4 h-4" />
          </GlassButton>
          <GlassButton variant="primary" onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Company
          </GlassButton>
        </div>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      ) : companies.length === 0 ? (
        <GlassCard>
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">No companies found</p>
            <GlassButton variant="primary" className="mt-4" onClick={openAddModal}>
              <Plus className="w-4 h-4 mr-2" /> Add First Company
            </GlassButton>
          </div>
        </GlassCard>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((c, idx) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <GlassCard className="relative group">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-xl font-bold flex-shrink-0">
                    {c.logo ? (
                      <img src={c.logo} alt={c.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      c.name?.[0] || '?'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white truncate">{c.name}</h4>
                    <p className="text-xs text-gray-400">{c.industry} • {c.companySize || 'N/A'}</p>
                  </div>
                  {hiringBadge(c.hiringStatus)}
                </div>

                {c.description && (
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">{c.description}</p>
                )}

                {c.website && (
                  <a
                    href={c.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-400 hover:text-purple-300 truncate block mb-3"
                  >
                    {c.website}
                  </a>
                )}

                {c.techStack && c.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {c.techStack.slice(0, 4).map((t, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white/5 text-gray-400 text-xs rounded">{t}</span>
                    ))}
                    {c.techStack.length > 4 && (
                      <span className="text-xs text-gray-500">+{c.techStack.length - 4}</span>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-white/5">
                  <GlassButton variant="ghost" size="sm" className="flex-1" onClick={() => openEditModal(c)}>
                    Edit
                  </GlassButton>
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:bg-red-500/10"
                    onClick={() => handleDelete(c._id, c.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </GlassButton>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <GlassButton variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </GlassButton>
          <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
          <GlassButton variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="w-4 h-4" />
          </GlassButton>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">{editingId ? 'Edit Company' : 'Add New Company'}</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Company Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Google, TCS, Flipkart"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Brief description about the company..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                  />
                </div>

                {/* Website / Apply Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Website / Apply Link</label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    placeholder="https://careers.google.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                {/* Row: Industry + Company Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Industry *</label>
                    <select
                      value={form.industry}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                    >
                      {INDUSTRY_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Company Type</label>
                    <select
                      value={form.companyType}
                      onChange={(e) => setForm({ ...form, companyType: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                    >
                      {COMPANY_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row: Hiring Status + Company Size */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Hiring Status</label>
                    <select
                      value={form.hiringStatus}
                      onChange={(e) => setForm({ ...form, hiringStatus: e.target.value as 'actively_hiring' | 'occasionally_hiring' | 'not_hiring' })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                    >
                      {HIRING_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Company Size</label>
                    <select
                      value={form.companySize}
                      onChange={(e) => setForm({ ...form, companySize: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                    >
                      {COMPANY_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Headquarters City */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Headquarters City</label>
                  <input
                    type="text"
                    value={form.headquarters.city}
                    onChange={(e) => setForm({ ...form, headquarters: { ...form.headquarters, city: e.target.value } })}
                    placeholder="e.g. Bangalore, Mumbai, Hyderabad"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                {/* Tech Stack */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Tech Stack</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }}
                      placeholder="Type and press Enter"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                    <GlassButton variant="secondary" size="sm" onClick={addTech}>Add</GlassButton>
                  </div>
                  {form.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.techStack.map((t) => (
                        <span key={t} className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full flex items-center gap-1">
                          {t}
                          <button onClick={() => removeTech(t)} className="hover:text-red-400">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <GlassButton variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
                    Cancel
                  </GlassButton>
                  <GlassButton variant="primary" className="flex-1" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : editingId ? 'Update Company' : 'Add Company'}
                  </GlassButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
