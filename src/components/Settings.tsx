import React, { useState } from 'react';
import {
  User, Mail, Lock, Shield, Trash2, LogOut, Save,
  Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, logout, updateProfile, changePassword, deleteAccount } = useAuth();
  const [activeSection, setActiveSection] = useState<'profile' | 'password' | 'danger'>('profile');

  // Profile state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    currency: user?.currency || 'USD'
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Delete state
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePw, setShowDeletePw] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    const result = await updateProfile(profileData);
    setProfileMsg({
      type: result.success ? 'success' : 'error',
      text: result.success ? 'Profile updated successfully!' : (result.message || 'Failed to update profile.')
    });
    setProfileLoading(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    setPasswordLoading(true);
    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
    setPasswordMsg({
      type: result.success ? 'success' : 'error',
      text: result.success ? 'Password changed successfully!' : (result.message || 'Failed to change password.')
    });
    if (result.success) {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
    setPasswordLoading(false);
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteMsg(null);
    setDeleteLoading(true);
    const result = await deleteAccount(deletePassword);
    if (!result.success) {
      setDeleteMsg({ type: 'error', text: result.message || 'Failed to delete account.' });
    }
    setDeleteLoading(false);
  };

  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'];

  const sections = [
    { id: 'profile' as const, label: 'Profile', icon: User, desc: 'Name & preferences' },
    { id: 'password' as const, label: 'Security', icon: Shield, desc: 'Password settings' },
    { id: 'danger' as const, label: 'Account', icon: Trash2, desc: 'Delete account' },
  ];

  const StatusMessage = ({ msg }: { msg: { type: 'success' | 'error'; text: string } | null }) => {
    if (!msg) return null;
    return (
      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300 ${
        msg.type === 'success'
          ? 'bg-green-50 text-green-700 border border-green-100'
          : 'bg-red-50 text-red-700 border border-red-100'
      }`}>
        {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
        {msg.text}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="px-1">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      {/* User Info Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg shadow-blue-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 flex items-center justify-center text-xl sm:text-2xl font-bold flex-shrink-0 backdrop-blur-sm border border-white/20">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-bold truncate">{user?.name}</h3>
            <p className="text-blue-100/70 text-sm truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="ml-auto p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer flex-shrink-0 group"
            title="Sign out"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section Nav */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 transition-colors cursor-pointer border-l-[3px] ${
                  activeSection === s.id
                    ? 'bg-blue-50/80 border-blue-600 text-blue-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50'
                }`}
              >
                <s.icon className={`w-5 h-5 flex-shrink-0 ${activeSection === s.id ? 'text-blue-600' : 'text-gray-400'}`} />
                <div className="text-left min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{s.label}</p>
                  <p className="text-[11px] text-gray-400 truncate hidden sm:block lg:block">{s.desc}</p>
                </div>
                <ChevronRight className={`w-4 h-4 flex-shrink-0 ${activeSection === s.id ? 'text-blue-400' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in duration-300">
              <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Profile Settings
              </h3>
              <p className="text-sm text-gray-400 mb-6">Update your personal information</p>

              <StatusMessage msg={profileMsg} />

              <form onSubmit={handleProfileSave} className="space-y-5 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="settings-name"
                      type="text"
                      required
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 text-sm sm:text-base cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Currency</label>
                  <select
                    id="settings-currency"
                    value={profileData.currency}
                    onChange={(e) => setProfileData({ ...profileData, currency: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base cursor-pointer appearance-none"
                  >
                    {currencies.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <button
                  id="settings-save-profile"
                  type="submit"
                  disabled={profileLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-8 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-100 active:scale-[0.98]"
                >
                  {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* Password Section */}
          {activeSection === 'password' && (
            <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in duration-300">
              <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Change Password
              </h3>
              <p className="text-sm text-gray-400 mb-6">Keep your account secure with a strong password</p>

              <StatusMessage msg={passwordMsg} />

              <form onSubmit={handlePasswordChange} className="space-y-5 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Password</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="settings-current-password"
                      type={showCurrentPw ? 'text' : 'password'}
                      required
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base"
                      placeholder="Enter current password"
                    />
                    <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer" tabIndex={-1}>
                      {showCurrentPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="settings-new-password"
                      type={showNewPw ? 'text' : 'password'}
                      required
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base"
                      placeholder="Enter new password (min 8 characters)"
                    />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer" tabIndex={-1}>
                      {showNewPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="settings-confirm-new-password"
                      type="password"
                      required
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <button
                  id="settings-change-password"
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-8 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-100 active:scale-[0.98]"
                >
                  {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Update Password
                </button>
              </form>
            </div>
          )}

          {/* Danger Zone */}
          {activeSection === 'danger' && (
            <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-red-100 animate-in fade-in duration-300">
              <h3 className="text-lg font-bold text-red-600 mb-1 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Delete Account
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Permanently delete your account and all associated data. This action <strong>cannot be undone</strong>.
              </p>

              <StatusMessage msg={deleteMsg} />

              {!confirmDelete ? (
                <button
                  id="settings-delete-start"
                  onClick={() => setConfirmDelete(true)}
                  className="mt-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-6 rounded-xl transition-all cursor-pointer flex items-center gap-2 border border-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                  I want to delete my account
                </button>
              ) : (
                <form onSubmit={handleDeleteAccount} className="space-y-5 mt-4 p-5 bg-red-50/50 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-start gap-3 text-sm text-red-600 bg-red-100/50 p-3 rounded-xl">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Warning: This will permanently delete:</p>
                      <ul className="list-disc list-inside mt-1 text-red-500 space-y-0.5">
                        <li>Your profile and account</li>
                        <li>All your transactions</li>
                        <li>All your budgets</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Enter your password to confirm</label>
                    <div className="relative">
                      <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        id="settings-delete-password"
                        type={showDeletePw ? 'text' : 'password'}
                        required
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm sm:text-base"
                        placeholder="Your password"
                      />
                      <button type="button" onClick={() => setShowDeletePw(!showDeletePw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer" tabIndex={-1}>
                        {showDeletePw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setConfirmDelete(false); setDeletePassword(''); setDeleteMsg(null); }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      id="settings-delete-confirm"
                      type="submit"
                      disabled={deleteLoading}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-3 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      Delete Forever
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
