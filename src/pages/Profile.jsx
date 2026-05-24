import { useState } from 'react';
import { User, Mail, Shield, Key, Save, CheckCircle, AlertCircle, IndianRupee } from 'lucide-react';
import { useAppContext } from '../store/AppContext';

const Profile = () => {
  const { currentUser, updateUser } = useAppContext();

  // Form States - Added driverAllowance (defaults to 300 if not set yet)
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    driverAllowance: currentUser?.driverAllowance || 300,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Feedback States
  const [profileMessage, setProfileMessage] = useState(null);
  const [passwordMessage, setPasswordMessage] = useState(null);

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    
    // Create an updated user object with the new driver allowance
    const updatedUser = { 
      ...currentUser, 
      name: profileData.name, 
      email: profileData.email,
      driverAllowance: Number(profileData.driverAllowance)
    };
    
    // Update it in the global context
    updateUser(updatedUser);
    
    setProfileMessage({ type: 'success', text: 'Agency settings updated successfully!' });
    setTimeout(() => setProfileMessage(null), 3000);
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (passwordData.currentPassword !== currentUser.password) {
      setPasswordMessage({ type: 'error', text: 'Current password is incorrect.' });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (passwordData.newPassword.length < 4) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 4 characters.' });
      return;
    }

    // Update password in global context
    const updatedUser = { ...currentUser, password: passwordData.newPassword };
    updateUser(updatedUser);
    
    // Clear form and show success
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
    setTimeout(() => setPasswordMessage(null), 3000);
  };

  if (!currentUser) return null; 

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 sm:p-3 bg-gray-200 text-gray-700 rounded-lg shrink-0">
          <User className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Account Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Left Column: User ID Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-24"></div>
          <div className="px-6 pb-6 relative">
            {/* Avatar Circle */}
            <div className="w-20 h-20 bg-white rounded-full border-4 border-white shadow-md flex items-center justify-center absolute -top-10 left-6 text-3xl font-bold text-blue-600">
              {currentUser.name.charAt(0)}
            </div>
            
            <div className="pt-14 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{currentUser.name}</h2>
                <p className="text-sm text-gray-500">{currentUser.role === 'admin' ? 'System Administrator' : 'Agency Account'}</p>
              </div>
              
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail size={16} className="text-gray-400" />
                  {currentUser.email}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <IndianRupee size={16} className="text-gray-400" />
                  Driver Allowance: ₹{profileData.driverAllowance}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield size={16} className="text-gray-400" />
                  Status: <span className="text-green-600 font-medium capitalize">{currentUser.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          
          {/* Profile & Settings Form */}
          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-3">Agency Information & Settings</h3>
            
            {profileMessage && (
              <div className={`p-3 rounded-lg flex items-center gap-2 text-sm mb-4 ${profileMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {profileMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {profileMessage.text}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Agency / Name</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 sm:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full p-2.5 sm:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="sm:col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Default Driver Allowance (₹/day)</label>
                  <input 
                    type="number" 
                    className="w-full p-2.5 sm:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={profileData.driverAllowance}
                    onChange={(e) => setProfileData({...profileData, driverAllowance: e.target.value})}
                    required
                    min="0"
                  />
                  <p className="text-xs text-gray-400 mt-1">This applies automatically when logging expenses.</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors text-sm">
                  <Save size={16} /> Save Settings
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-3">Security & Password</h3>
            
            {passwordMessage && (
              <div className={`p-3 rounded-lg flex items-center gap-2 text-sm mb-4 ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {passwordMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {passwordMessage.text}
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Current Password</label>
                <input 
                  type="password" 
                  className="w-full p-2.5 sm:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">New Password</label>
                  <input 
                    type="password" 
                    className="w-full p-2.5 sm:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    className="w-full p-2.5 sm:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors text-sm">
                  <Key size={16} /> Update Password
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;