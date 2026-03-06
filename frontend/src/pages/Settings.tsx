import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { User, Lock, Info, Pencil, Phone } from 'lucide-react';
import { getErrorMessage } from '../utils/getErrorMessage';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const Settings = () => {
  const { user, setUser, token } = useAuthStore();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePhone, setProfilePhone] = useState(user?.member?.phoneNumber || '');
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  useDocumentTitle('Settings');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileMessage('');
    setProfileSubmitting(true);
    try {
      const response = await api.put('/auth/profile', { email: profileEmail, phoneNumber: profilePhone || undefined });
      setProfileMessage('Profile updated successfully');
      setEditingProfile(false);
      if (response.data.user && user) {
        if (token) {
          const updatedUser = {
            ...user,
            email: response.data.user.email,
            member: response.data.user.member || user.member,
          };
          setUser(updatedUser, token);
        }
      }
    } catch (err: unknown) {
      setProfileError(getErrorMessage(err, 'Failed to update profile'));
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/auth/change-password', {
        oldPassword,
        newPassword,
      });
      setMessage('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to change password'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </h2>
            {!editingProfile && (
              <button
                onClick={() => {
                  setEditingProfile(true);
                  setProfileEmail(user?.email || '');
                  setProfilePhone(user?.member?.phoneNumber || '');
                  setProfileMessage('');
                  setProfileError('');
                }}
                className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>
          {profileMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-sm text-emerald-700 border border-emerald-200">
              {profileMessage}
            </div>
          )}
          {profileError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-sm text-red-700 border border-red-200">
              {profileError}
            </div>
          )}
          {editingProfile ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="+254..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-500">Role</label>
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 capitalize">
                  {user?.role || 'user'}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={profileSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {profileSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProfile(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-500">Email</label>
                <p className="text-sm font-medium text-slate-900">
                  {user?.email || '—'}
                </p>
              </div>
              <div>
                <label className="block text-sm text-slate-500">Phone Number</label>
                <p className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {user?.member?.phoneNumber || '—'}
                </p>
              </div>
              <div>
                <label className="block text-sm text-slate-500">Role</label>
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 capitalize">
                  {user?.role || 'user'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Change password */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Change Password
          </h2>
          {message && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-sm text-emerald-700 border border-emerald-200">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* App info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Info className="w-4 h-4" />
            About
          </h2>
          <div className="space-y-2 text-sm text-slate-600">
            <p>
              <span className="text-slate-500">Application:</span>{' '}
              <span className="font-medium text-slate-800">
                SMS-FinTrack Kenya
              </span>
            </p>
            <p>
              <span className="text-slate-500">Version:</span>{' '}
              <span className="font-medium text-slate-800">1.0.0</span>
            </p>
            <p>
              <span className="text-slate-500">Description:</span>{' '}
              Sacco Financial Management System powered by SMS transaction parsing.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
