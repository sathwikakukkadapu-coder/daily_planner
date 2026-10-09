import React from 'react';
import { Trophy, Flame, CheckCircle2, Award, Calendar, ArrowRight } from 'lucide-react';
import HabitChart from './HabitChart';

export default function ComparisonView({
  days,
  weeks,
  user1,
  user2,
  user1Stats,
  user2Stats,
  todayDateKey,
  onSelectUser,
}) {
  const isU1Leading = user1Stats.totalCompletedHabits > user2Stats.totalCompletedHabits;
  const isU2Leading = user2Stats.totalCompletedHabits > user1Stats.totalCompletedHabits;
  const diff = Math.abs(user1Stats.totalCompletedHabits - user2Stats.totalCompletedHabits);

  // Today's checklist items
  const u1TodayComps = user1.completions?.[todayDateKey] || {};
  const u2TodayComps = user2.completions?.[todayDateKey] || {};

  return (
    <div className="space-y-6">
      {/* Friendly Motivation Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white rounded-xl shadow-sm border border-indigo-100 text-indigo-600">
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">
              {isU1Leading
                ? `${user1.name} is leading by ${diff} habit${diff > 1 ? 's' : ''}! 🌟`
                : isU2Leading
                ? `${user2.name} is leading by ${diff} habit${diff > 1 ? 's' : ''}! 🔥`
                : "Both are neck and neck with equal habits completed! 🤝"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Keep holding each other accountable and building consistent daily streaks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectUser('user1')}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            Open {user1.name}
          </button>
          <button
            onClick={() => onSelectUser('user2')}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            Open {user2.name}
          </button>
        </div>
      </div>

      {/* Head-to-Head Comparison Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* User 1 Card */}
        <div className="bg-white rounded-xl border-2 border-emerald-500/30 p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{user1.avatar || '🌸'}</span>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{user1.name}</h4>
                <span className="text-[11px] text-emerald-600 font-semibold">User 1</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-emerald-600">{user1Stats.progressPct}%</div>
              <span className="text-[11px] text-slate-400">Monthly Avg</span>
            </div>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${user1Stats.progressPct}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Total Done</span>
              <span className="text-base font-bold text-slate-800">{user1Stats.totalCompletedHabits}</span>
            </div>
            <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Active Habits</span>
              <span className="text-base font-bold text-slate-800">{user1.habits.length}</span>
            </div>
          </div>
        </div>

        {/* User 2 Card */}
        <div className="bg-white rounded-xl border-2 border-purple-500/30 p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{user2.avatar || '⚡'}</span>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{user2.name}</h4>
                <span className="text-[11px] text-purple-600 font-semibold">User 2</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-purple-600">{user2Stats.progressPct}%</div>
              <span className="text-[11px] text-slate-400">Monthly Avg</span>
            </div>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4 overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${user2Stats.progressPct}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Total Done</span>
              <span className="text-base font-bold text-slate-800">{user2Stats.totalCompletedHabits}</span>
            </div>
            <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Active Habits</span>
              <span className="text-base font-bold text-slate-800">{user2.habits.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Consistency Curve Overlay */}
      <HabitChart
        days={days}
        user1Data={user1}
        user2Data={user2}
        isCompareMode={true}
      />

      {/* Side-by-Side Today's Checklist */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>Today's Live Checklists</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* User 1 Today */}
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-200">
              <span className="font-semibold text-xs text-slate-700 flex items-center gap-1.5">
                <span>{user1.avatar}</span> {user1.name}
              </span>
              <span className="text-[11px] font-bold text-emerald-600">
                {user1.habits.filter((h) => u1TodayComps[h.id]).length} / {user1.habits.length} Done
              </span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {user1.habits.map((habit) => {
                const isChecked = !!u1TodayComps[habit.id];
                return (
                  <div
                    key={habit.id}
                    className={`flex items-center justify-between text-xs p-1.5 rounded ${
                      isChecked ? 'bg-emerald-50 text-slate-800' : 'bg-white text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{habit.emoji}</span>
                      <span className={isChecked ? 'line-through text-slate-400' : ''}>
                        {habit.title}
                      </span>
                    </div>
                    {isChecked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded border border-slate-300 inline-block" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* User 2 Today */}
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-200">
              <span className="font-semibold text-xs text-slate-700 flex items-center gap-1.5">
                <span>{user2.avatar}</span> {user2.name}
              </span>
              <span className="text-[11px] font-bold text-purple-600">
                {user2.habits.filter((h) => u2TodayComps[h.id]).length} / {user2.habits.length} Done
              </span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {user2.habits.map((habit) => {
                const isChecked = !!u2TodayComps[habit.id];
                return (
                  <div
                    key={habit.id}
                    className={`flex items-center justify-between text-xs p-1.5 rounded ${
                      isChecked ? 'bg-purple-50 text-slate-800' : 'bg-white text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{habit.emoji}</span>
                      <span className={isChecked ? 'line-through text-slate-400' : ''}>
                        {habit.title}
                      </span>
                    </div>
                    {isChecked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded border border-slate-300 inline-block" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
