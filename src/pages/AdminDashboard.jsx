import { useState, useMemo } from 'react';
import { 
  Shield, Activity, Plus, X, Database, Search, 
  Ban, CheckCircle, Users, Key, Download, Trash2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useAppContext } from '../store/AppContext';

const AdminDashboard = () => {
  const { 
    currentUser, users, addUser, updateUser, deleteUser,
    allTrips, allExpenses, allVehicles 
  } = useAppContext();

  // View States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State (Creation Only)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'user', status: 'active'
  });

  // Security Check: Kick out non-admins
  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-gray-500">
        <Shield size={64} className="mb-4 text-red-400 opacity-50" />
        <h2 className="text-2xl font-bold text-gray-700">Access Denied</h2>
        <p>You do not have permission to view the System Administration panel.</p>
      </div>
    );
  }

  // 1. Platform-Wide Analytics
  const platformStats = useMemo(() => {
    const totalRevenue = allTrips.reduce((sum, t) => sum + t.revenue, 0);
    const totalExpenses = allExpenses.reduce((sum, e) => sum + e.totalExpense, 0);
    
    return {
      activeAgencies: users.filter(u => u.role === 'user' && u.status === 'active').length,
      disabledAgencies: users.filter(u => u.role === 'user' && u.status === 'disabled').length,
      totalTrips: allTrips.length,
      totalVehicles: allVehicles.length,
      totalProfit: totalRevenue - totalExpenses
    };
  }, [users, allTrips, allExpenses, allVehicles]);

  // 2. Per-User Metrics & Filtering
  const processedUsers = useMemo(() => {
    return users
      .filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' ? true : u.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .map(u => {
        const userTrips = allTrips.filter(t => t.userId === u.id);
        const userVehicles = allVehicles.filter(v => v.userId === u.id);
        const userRevenue = userTrips.reduce((sum, t) => sum + t.revenue, 0);
        return {
          ...u,
          vehicleCount: userVehicles.length,
          tripCount: userTrips.length,
          generatedRevenue: userRevenue
        };
      })
      .sort((a, b) => b.generatedRevenue - a.generatedRevenue);
  }, [users, allTrips, allVehicles, searchTerm, statusFilter]);

  // Chart Data: Top 5 Agencies by Revenue
  const topAgenciesData = useMemo(() => {
    return processedUsers
      .filter(u => u.role === 'user' && u.generatedRevenue > 0)
      .slice(0, 5)
      .map(u => ({
        name: u.name.split(' ')[0], // Use first word of agency name to fit chart
        Revenue: u.generatedRevenue
      }));
  }, [processedUsers]);

  // 3. Actions
  const handleToggleStatus = (user) => {
    if (user.id === currentUser.id) {
      alert("You cannot disable your own administrator account.");
      return;
    }
    const newStatus = user.status === 'active' ? 'disabled' : 'active';
    if (window.confirm(`Are you sure you want to ${newStatus === 'disabled' ? 'DISABLE' : 'ACTIVATE'} ${user.name}?`)) {
      updateUser({ ...user, status: newStatus });
    }
  };

  const handleResetPassword = (user) => {
    if (window.confirm(`Generate a new temporary password for ${user.name}?`)) {
      const newPassword = Math.random().toString(36).slice(-8); // Generate random 8 char password
      updateUser({ ...user, password: newPassword });
      alert(`Success! The new password for ${user.name} is: \n\n${newPassword}\n\nPlease copy and send this to the agency.`);
    }
  };

  const handleDeleteUser = (user) => {
    if (user.id === currentUser.id) {
      alert("You cannot delete your own admin account.");
      return;
    }
    if (window.confirm(`CRITICAL WARNING: Are you sure you want to permanently delete ${user.name}? This action cannot be undone.`)) {
      deleteUser(user.id);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Agency Name', 'Email', 'Role', 'Status', 'Vehicles Active', 'Trips Logged', 'Revenue Generated'];
    const csvData = processedUsers.map(u => [
      `"${u.name}"`, `"${u.email}"`, u.role, u.status, u.vehicleCount, u.tripCount, u.generatedRevenue
    ].join(','));
    
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SaaS_Agencies_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const openModal = () => {
    setFormData({ name: '', email: '', password: '', role: 'user', status: 'active' });
    setIsModalOpen(true);
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (users.find(u => u.email === formData.email)) {
      alert("A user with this email already exists!");
      return;
    }
    addUser(formData);
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 bg-gray-800 text-white rounded-lg shrink-0">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">System Administration</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors shadow-sm"
          >
            <Download size={18} /> Export Data
          </button>
          <button 
            onClick={openModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors shadow-sm"
          >
            <Plus size={18} /> Register Agency
          </button>
        </div>
      </div>

      {/* Platform Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-full hidden sm:block"><Users size={24} /></div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500 mb-1">Active Agencies</p>
            <div className="flex items-baseline gap-2">
              <p className="text-lg sm:text-xl font-bold text-gray-800">{platformStats.activeAgencies}</p>
              {platformStats.disabledAgencies > 0 && (
                <span className="text-xs text-red-500 font-medium">({platformStats.disabledAgencies} disabled)</span>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full hidden sm:block"><Database size={24} /></div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500 mb-1">Total Vehicles</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800">{platformStats.totalVehicles}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-full hidden sm:block"><Activity size={24} /></div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500 mb-1">Platform Trips</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800">{platformStats.totalTrips}</p>
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-900 flex items-center gap-4">
          <div>
            <p className="text-xs sm:text-sm text-gray-400 mb-1">Global SaaS Profit</p>
            <p className="text-lg sm:text-xl font-bold text-white">₹{platformStats.totalProfit.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Top Agencies Chart */}
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 h-80 lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Top Agencies by Revenue</h2>
          {topAgenciesData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topAgenciesData} margin={{ top: 0, right: 0, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`₹${value}`, 'Revenue']} />
                <Bar dataKey="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-gray-400">
              No revenue data available.
            </div>
          )}
        </div>

        {/* Full-Width Agency List Table */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Control Bar */}
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3 justify-between">
            <div className="flex items-center gap-2 w-full sm:w-80 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500">
              <Search size={18} className="text-gray-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Search agencies..." 
                className="w-full bg-transparent border-none focus:ring-0 outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500 font-medium whitespace-nowrap">Status:</label>
              <select 
                className="p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Accounts</option>
                <option value="active">Active Only</option>
                <option value="disabled">Disabled Only</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 font-semibold text-gray-600 text-sm">Agency Details</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Role</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Platform Usage</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Revenue</th>
                    <th className="p-4 font-semibold text-gray-600 text-center text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {processedUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <div className="font-bold text-gray-800 text-sm">{user.name}</div>
                        </div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-700 font-medium">{user.tripCount} Trips</div>
                        <div className="text-xs text-gray-500">{user.vehicleCount} Vehicles</div>
                      </td>
                      <td className="p-4 text-green-600 font-semibold text-sm">
                        ₹{user.generatedRevenue.toLocaleString()}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => handleResetPassword(user)}
                            className="text-yellow-600 hover:text-yellow-700 p-2 rounded-lg hover:bg-yellow-50 transition-colors"
                            title="Force Password Reset"
                          >
                            <Key size={18} />
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(user)}
                            className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                              user.id === currentUser.id 
                                ? 'text-gray-300 cursor-not-allowed' 
                                : user.status === 'active' 
                                  ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' 
                                  : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title={user.status === 'active' ? 'Disable Account Access' : 'Restore Account Access'}
                          >
                            {user.status === 'active' ? <Ban size={18} /> : <CheckCircle size={18} />}
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.id === currentUser.id 
                                ? 'text-gray-300 cursor-not-allowed' 
                                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                            }`}
                            title="Delete Permanently"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {processedUsers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-gray-500">
                        No agencies found matching your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* OVERLAY MODAL FOR REGISTRATION ONLY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">Register New Agency</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agency Name</label>
                <input 
                  type="text" 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address (Login ID)</label>
                <input 
                  type="email" 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Password</label>
                <input 
                  type="text" 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">System Role</label>
                  <select 
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="user">Agency (User)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Status</label>
                  <select 
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-gray-100 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;