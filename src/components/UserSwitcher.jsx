import React from 'react';
import { User, Users, Swords, Settings, ShieldCheck, Eye } from 'lucide-react';

export default function UserSwitcher({
  user1,
  user2,
  activeUserId,
  onSelectUser,
  isCompareMode,
  onToggleCompareMode,
  myIdentity,
  onOpenProfileSettings,
  user1Stats,
  user2Stats,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm mb-4">
      {/* Switcher Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-lg overflow-x-auto">
        {/* User 1 Tab */}
        <button
          onClick={() => {
            if (isCompareMode) onToggleCompareMode(false);
            onSelectUser('user1');
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
            !isCompareMode && activeUserId === 'user1'
              ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-950/5'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <span className="text-base leading-none">{user1.avatar || '🌸'}</span>
          <span>{user1.name}</span>
          {myIdentity === 'user1' && (
            <span className="text-[10px] font-medium bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
              You
            </span>
          )}
          <span className="text-[11px] text-slate-400 font-normal ml-0.5">
            {user1Stats.progressPct}%
          </span>
        </button>

        {/* User 2 Tab */}
        <button
          onClick={() => {
            if (isCompareMode) onToggleCompareMode(false);
            onSelectUser('user2');
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
            !isCompareMode && activeUserId === 'user2'
              ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-950/5'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <span className="text-base leading-none">{user2.avatar || '⚡'}</span>
          <span>{user2.name}</span>
          {myIdentity === 'user2' && (
            <span className="text-[10px] font-medium bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
              You
            </span>
          )}
          <span className="text-[11px] text-slate-400 font-normal ml-0.5">
            {user2Stats.progressPct}%
          </span>
        </button>

        {/* Compare Side-by-Side Tab */}
        <button
          onClick={() => onToggleCompareMode(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            isCompareMode
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          <span>Compare Both</span>
        </button>
      </div>

      {/* Right controls: Identity indicator & Settings */}
      <div className="flex items-center justify-between sm:justify-end gap-2 px-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Eye className="w-3.5 h-3.5 text-slate-400" />
          <span>Watching: </span>
          <span className="font-semibold text-slate-700">
            {isCompareMode ? 'Both' : activeUserId === 'user1' ? user1.name : user2.name}
          </span>
        </div>

        <button
          onClick={onOpenProfileSettings}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
          title="Edit Profile Names & Colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
