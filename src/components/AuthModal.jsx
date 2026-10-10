import React, { useState } from 'react';
import { Lock, UserCheck, ShieldCheck, KeyRound, Sparkles, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { saveAuthSession, verifyUserPin } from '../utils/auth';

export default function AuthModal({
  isOpen,
  users,
  onAuthenticate,
  onSetUserPin,
}) {
  const [selectedUserId, setSelectedUserId] = useState('user1');
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const selectedUser = users[selectedUserId] || users.user1;
  const hasPinConfigured = Boolean(selectedUser.pin && selectedUser.pin.trim());

  const handleSelectUser = (id) => {
    setSelectedUserId(id);
    setPin('');
    setNewPin('');
    setIsSettingPin(false);
    setError('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // If setting new PIN
    if (isSettingPin) {
      if (newPin.length > 0 && newPin.length < 4) {
        setError('PIN must be at least 4 digits');
        return;
      }
      onSetUserPin(selectedUserId, newPin);
      saveAuthSession(selectedUserId, selectedUser.name, selectedUser.avatar);
      onAuthenticate(selectedUserId);
      return;
    }

    // Normal PIN verification
    if (hasPinConfigured) {
      if (!pin) {
        setError('Please enter your 4-digit PIN');
        return;
      }
      if (!verifyUserPin(selectedUser, pin)) {
        setError('Incorrect PIN. Please try again.');
        return;
      }
    }

    // Success! Save session and authenticate
    saveAuthSession(selectedUserId, selectedUser.name, selectedUser.avatar);
    onAuthenticate(selectedUserId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden transition-all">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 p-6 text-white text-center relative">
          <div className="inline-flex p-3 rounded-2xl bg-white/20 backdrop-blur-sm mb-2 shadow-inner">
            <Sparkles className="w-6 h-6 text-amber-200" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Welcome to DuoHabit</h2>
          <p className="text-xs text-emerald-100 mt-1">
            Choose your profile to enter your shared daily planner
          </p>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleLogin} className="p-6 space-y-5">
          {/* Profile Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Who is signing in?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* User 1 */}
              <button
                type="button"
                onClick={() => handleSelectUser('user1')}
                className={`p-3.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition ${
                  selectedUserId === 'user1'
                    ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="text-3xl">{users.user1?.avatar || '🌸'}</span>
                <span className="font-bold text-xs text-slate-800 text-center truncate max-w-[120px]">
                  {users.user1?.name || 'Sathwika'}
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full font-medium">
                  {users.user1?.pin ? '🔒 PIN Protected' : 'Ready'}
                </span>
              </button>

              {/* User 2 */}
              <button
                type="button"
                onClick={() => handleSelectUser('user2')}
                className={`p-3.5 rounded-xl border text-left flex flex-col items-center justify-center gap-1.5 transition ${
                  selectedUserId === 'user2'
                    ? 'border-purple-500 bg-purple-50/70 ring-2 ring-purple-500/20 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="text-3xl">{users.user2?.avatar || '⚡'}</span>
                <span className="font-bold text-xs text-slate-800 text-center truncate max-w-[120px]">
                  {users.user2?.name || 'Alex'}
                </span>
                <span className="text-[10px] text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-full font-medium">
                  {users.user2?.pin ? '🔒 PIN Protected' : 'Ready'}
                </span>
              </button>
            </div>
          </div>

          {/* PIN Input or Option to Set PIN */}
          {hasPinConfigured ? (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Enter Passcode / PIN</span>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-normal"
                >
                  {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPin ? 'Hide' : 'Show'}</span>
                </button>
              </label>

              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  autoFocus
                  maxLength={6}
                  value={pin}
                  onChange={(e) => {
                    setError('');
                    setPin(e.target.value);
                  }}
                  placeholder="••••"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-center text-lg font-mono tracking-widest text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                />
              </div>
            </div>
          ) : isSettingPin ? (
            <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <label className="block text-xs font-semibold text-slate-700">
                Choose a 4-Digit Passcode
              </label>
              <input
                type={showPin ? 'text' : 'password'}
                autoFocus
                maxLength={6}
                value={newPin}
                onChange={(e) => {
                  setError('');
                  setNewPin(e.target.value);
                }}
                placeholder="Enter 4 digits (e.g. 1234)"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-center text-base font-mono tracking-wider text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
              <p className="text-[10px] text-slate-400">
                This passcode will protect your habits from unauthorized edits.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-xs text-slate-500">No passcode required for this profile.</span>
              <button
                type="button"
                onClick={() => setIsSettingPin(true)}
                className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Set PIN</span>
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium text-center animate-shake">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-sm"
          >
            <span>Enter as {selectedUser.name}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
