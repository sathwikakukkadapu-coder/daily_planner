import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

export default function ProfileModal({
  isOpen,
  onClose,
  user1,
  user2,
  onSaveProfiles,
}) {
  const [u1Name, setU1Name] = useState(user1.name);
  const [u1Avatar, setU1Avatar] = useState(user1.avatar || '🌸');
  const [u1Color, setU1Color] = useState(user1.color || '#10b981');

  const [u2Name, setU2Name] = useState(user2.name);
  const [u2Avatar, setU2Avatar] = useState(user2.avatar || '⚡');
  const [u2Color, setU2Color] = useState(user2.color || '#8b5cf6');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveProfiles({
      user1: { ...user1, name: u1Name.trim() || 'Me', avatar: u1Avatar, color: u1Color },
      user2: { ...user2, name: u2Name.trim() || 'Friend', avatar: u2Avatar, color: u2Color },
    });
    onClose();
  };

  const AVATAR_OPTIONS = ['🌸', '⚡', '🌟', '🚀', '🔥', '👑', '🥑', '🎯', '🦁', '🍀', '🦋', '🦊'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <h3 className="font-bold text-slate-800 text-sm">Edit User Profiles</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 text-xs">
          {/* User 1 Profile */}
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
            <span className="font-bold text-emerald-800 block text-xs">Profile 1 (You)</span>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={u1Name}
                onChange={(e) => setU1Name(e.target.value)}
                placeholder="Your name"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                required
              />
              <div className="flex items-center gap-1">
                <input
                  type="color"
                  value={u1Color}
                  onChange={(e) => setU1Color(e.target.value)}
                  className="w-9 h-9 p-0.5 rounded-lg border border-slate-200 cursor-pointer"
                  title="Choose chart line color"
                />
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 block mb-1">Pick Avatar:</span>
              <div className="flex gap-1.5 flex-wrap">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={`u1-${av}`}
                    type="button"
                    onClick={() => setU1Avatar(av)}
                    className={`text-base p-1.5 rounded-lg transition ${
                      u1Avatar === av ? 'bg-emerald-200 ring-2 ring-emerald-500' : 'hover:bg-white'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* User 2 Profile */}
          <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/40 space-y-3">
            <span className="font-bold text-purple-800 block text-xs">Profile 2 (Friend)</span>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={u2Name}
                onChange={(e) => setU2Name(e.target.value)}
                placeholder="Friend's name"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                required
              />
              <div className="flex items-center gap-1">
                <input
                  type="color"
                  value={u2Color}
                  onChange={(e) => setU2Color(e.target.value)}
                  className="w-9 h-9 p-0.5 rounded-lg border border-slate-200 cursor-pointer"
                  title="Choose chart line color"
                />
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 block mb-1">Pick Avatar:</span>
              <div className="flex gap-1.5 flex-wrap">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={`u2-${av}`}
                    type="button"
                    onClick={() => setU2Avatar(av)}
                    className={`text-base p-1.5 rounded-lg transition ${
                      u2Avatar === av ? 'bg-purple-200 ring-2 ring-purple-500' : 'hover:bg-white'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-semibold hover:bg-slate-900 transition"
            >
              Save Profiles
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
