import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Share2, Plus, Wifi, WifiOff, Download, Sparkles, LogOut, Lock } from 'lucide-react';
import { MONTH_NAMES } from '../utils/dateUtils';
import { getTimeBasedGreeting } from '../utils/greeting';

export default function Header({
  year,
  monthIndex,
  onPrevMonth,
  onNextMonth,
  onSelectMonth,
  onSelectYear,
  onJumpToday,
  activeUserStats,
  activeUserData,
  isLiveConnected,
  onlineUserCount,
  onOpenShareModal,
  onAddHabitClick,
  onExportData,
  currentAuthUser,
  onLogout,
}) {
  const currentMonthName = MONTH_NAMES[monthIndex];
  const { totalHabits, totalCompletedHabits, progressPct } = activeUserStats;

  // Personalized time-based greeting
  const greeting = useMemo(() => {
    return getTimeBasedGreeting(currentAuthUser?.name || activeUserData?.name || 'Friend');
  }, [currentAuthUser?.name, activeUserData?.name]);

  return (
    <header className="flex flex-col gap-4 mb-5">
      {/* Personalized Time-Based Greeting Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-3xl p-2 bg-white rounded-xl shadow-sm border border-emerald-100/60 flex-shrink-0">
            {greeting.emoji}
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
              {greeting.fullGreeting}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{greeting.subtext}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs bg-white text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 font-semibold flex items-center gap-1.5 shadow-sm">
            <span>{currentAuthUser?.avatar || activeUserData?.avatar || '👤'}</span>
            <span>{currentAuthUser?.name || activeUserData?.name || 'User'}</span>
          </span>
          <button
            onClick={onLogout}
            className="text-xs bg-white hover:bg-slate-50 text-slate-600 px-2.5 py-1.5 rounded-xl border border-slate-200 font-medium transition shadow-sm flex items-center gap-1.5"
            title="Switch profile or lock session"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Switch User</span>
          </button>
        </div>
      </div>

      {/* Title, Month Navigation, and Action Buttons Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Month Title & Navigation matching Image 2 */}
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-2">
            <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-slate-800 font-sans">
              {currentMonthName}
            </h1>
            <span className="text-xl sm:text-2xl text-slate-400 font-light">
              {year}
            </span>
          </div>

          {/* Month Steppers */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm p-0.5 ml-2">
            <button
              onClick={onPrevMonth}
              className="p-1 hover:bg-slate-100 rounded text-slate-600 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onJumpToday}
              className="px-2 py-0.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition"
              title="Current Month"
            >
              Today
            </button>
            <button
              onClick={onNextMonth}
              className="p-1 hover:bg-slate-100 rounded text-slate-600 transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Actions (Live Share, Add Habit, Export) */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Live Sync Status & Share Button */}
          <button
            onClick={onOpenShareModal}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-sm transition ${
              isLiveConnected
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="relative flex h-2 w-2">
              {isLiveConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isLiveConnected ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
              ></span>
            </span>
            <Share2 className="w-3.5 h-3.5" />
            <span>
              {isLiveConnected ? `Live Sync (${onlineUserCount} online)` : 'Connect Live Sync'}
            </span>
          </button>

          {/* Add Habit Button */}
          <button
            onClick={onAddHabitClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Habit</span>
          </button>

          {/* Export JSON Backup */}
          <button
            onClick={onExportData}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
            title="Export / Backup Data"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Cards - Matching Image 2 top right layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* KPI 1: Number of habits */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Number of habits</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-slate-800">{totalHabits}</span>
            <span className="text-xs text-slate-400">tracked daily</span>
          </div>
        </div>

        {/* KPI 2: Completed habits */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Completed habits</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-slate-800">{totalCompletedHabits}</span>
            <span className="text-xs text-emerald-600 font-medium">this month</span>
          </div>
        </div>

        {/* KPI 3: Progress with green bar matching Image 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Progress</span>
            <span className="text-sm font-bold text-slate-800">{progressPct}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 mt-2 overflow-hidden border border-slate-200">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
