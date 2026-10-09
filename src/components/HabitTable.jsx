import React from 'react';
import { Plus, Trash2, Edit2, Check, ArrowRightLeft, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function HabitTable({
  days,
  weeks,
  userData,
  onToggleHabit,
  onAddHabitClick,
  onEditHabitClick,
  onDeleteHabit,
  onCopyHabitToOtherUser,
  otherUserName,
  isViewOnly = false,
  activeUserId,
  currentViewerIdentity,
}) {
  const habits = userData.habits || [];
  const completions = userData.completions || {};
  const totalHabits = habits.length;

  // Compute daily stats for bottom summary rows (matching Image 2)
  const dailyStats = days.map((day) => {
    const dayComps = completions[day.dateKey] || {};
    const doneCount = habits.filter((h) => dayComps[h.id]).length;
    const notDoneCount = totalHabits - doneCount;
    const progressPct = totalHabits > 0 ? Math.round((doneCount / totalHabits) * 100) : 0;
    return {
      dateKey: day.dateKey,
      dayNumber: day.dayNumber,
      doneCount,
      notDoneCount,
      progressPct,
    };
  });

  const handleCellClick = (habitId, dateKey, dayNumber) => {
    if (isViewOnly) return;

    const currentDayComps = completions[dateKey] || {};
    const willBeChecked = !currentDayComps[habitId];

    onToggleHabit(habitId, dateKey);

    // If this click completes 100% of all habits for this day, burst celebratory confetti!
    if (willBeChecked) {
      const willBeDoneCount = habits.filter((h) => (h.id === habitId ? true : currentDayComps[h.id])).length;
      if (willBeDoneCount === totalHabits && totalHabits > 0) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
        });
      }
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden select-none transition-all">
      {/* Table Container with custom scrollbar */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-center border-collapse">
          <thead>
            {/* Row 1: Week groupings (Week 1, Week 2, Week 3, Week 4, Week 5) */}
            <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="sticky left-0 z-20 bg-slate-100/95 backdrop-blur px-2.5 sm:px-4 py-2.5 text-left border-r border-slate-200 w-44 min-w-[150px] sm:w-64 sm:min-w-[240px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-bold text-xs sm:text-sm">My Habits</span>
                  <button
                    onClick={onAddHabitClick}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded transition border border-emerald-200"
                    title="Add new habit"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </th>

              {weeks.map((week, wIdx) => (
                <th
                  key={week.weekLabel}
                  colSpan={week.days.length}
                  className={`py-2 px-2 border-r border-slate-200 font-medium ${
                    wIdx % 2 === 1 ? 'bg-slate-100/80' : 'bg-slate-50/80'
                  }`}
                >
                  <span className="text-slate-600 font-semibold">{week.weekLabel}</span>
                </th>
              ))}
            </tr>

            {/* Row 2: Day of Week (Sa, Su, Mo, Tu, We, Th, Fr) */}
            <tr className="border-b border-slate-200 text-xs text-slate-500">
              <th className="sticky left-0 z-20 bg-slate-100/95 backdrop-blur px-4 py-1.5 text-left border-r border-slate-200 text-[11px] font-medium text-slate-400">
                Category & Icon
              </th>

              {weeks.map((week, wIdx) =>
                week.days.map((day) => (
                  <th
                    key={`dow-${day.dateKey}`}
                    className={`py-1.5 px-1 font-semibold text-[11px] border-r border-slate-200 w-9 min-w-[36px] max-w-[36px] ${
                      day.isToday ? 'bg-emerald-100 text-emerald-800 font-bold' : ''
                    } ${!day.isToday && wIdx % 2 === 1 ? 'bg-slate-100/60' : ''}`}
                  >
                    {day.dayAbbr}
                  </th>
                ))
              )}
            </tr>

            {/* Row 3: Day Numbers (1, 2, 3, 4, 5, 6, 7...) */}
            <tr className="border-b-2 border-slate-300 bg-white text-xs font-semibold text-slate-700">
              <th className="sticky left-0 z-20 bg-slate-100/95 backdrop-blur px-4 py-2 text-left border-r border-slate-200 text-slate-400 font-normal text-[11px]">
                {totalHabits} {totalHabits === 1 ? 'habit' : 'habits'} active
              </th>

              {weeks.map((week, wIdx) =>
                week.days.map((day) => (
                  <th
                    key={`num-${day.dateKey}`}
                    className={`py-2 px-1 text-xs border-r border-slate-200 ${
                      day.isToday
                        ? 'bg-emerald-600 text-white font-bold rounded-t-sm shadow-sm'
                        : wIdx % 2 === 1
                        ? 'bg-slate-100/60 text-slate-700'
                        : 'text-slate-700'
                    }`}
                  >
                    {day.dayNumber}
                  </th>
                ))
              )}
            </tr>
          </thead>

          {/* Habit Rows */}
          <tbody className="divide-y divide-slate-200 text-sm">
            {habits.length === 0 ? (
              <tr>
                <td colSpan={days.length + 1} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Sparkles className="w-8 h-8 text-slate-300" />
                    <p className="font-medium text-slate-500">No habits added yet</p>
                    <button
                      onClick={onAddHabitClick}
                      className="mt-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition"
                    >
                      + Add Your First Habit
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              habits.map((habit, index) => (
                <tr key={habit.id} className="hover:bg-slate-50/60 transition group">
                  {/* Habit title column */}
                  <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/95 backdrop-blur px-2.5 sm:px-4 py-2 text-left border-r border-slate-200 w-44 min-w-[150px] sm:w-64 sm:min-w-[240px]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 pr-1 sm:pr-2">
                        <span className="text-base flex-shrink-0">{habit.emoji || '✨'}</span>
                        <span className="font-medium text-slate-800 text-xs truncate" title={habit.title}>
                          {habit.title}
                        </span>
                      </div>

                      {/* Action buttons (visible on mobile touch, hover on desktop) */}
                      <div className="flex items-center gap-0.5 sm:gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={() => onEditHabitClick(habit)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition"
                          title="Edit habit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onCopyHabitToOtherUser(habit)}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                          title={`Share challenge with ${otherUserName}`}
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteHabit(habit.id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete habit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Day Checkboxes */}
                  {weeks.map((week, wIdx) =>
                    week.days.map((day) => {
                      const isChecked = completions[day.dateKey]?.[habit.id] || false;
                      return (
                        <td
                          key={`${habit.id}-${day.dateKey}`}
                          onClick={() => handleCellClick(habit.id, day.dateKey, day.dayNumber)}
                          className={`p-1 border-r border-slate-200 text-center cursor-pointer transition ${
                            day.isToday ? 'bg-emerald-50/40' : wIdx % 2 === 1 ? 'bg-slate-50/50' : ''
                          } hover:bg-emerald-50/80 active:bg-emerald-100`}
                        >
                          <div className="flex items-center justify-center p-0.5">
                            <div
                              className={`w-6 h-6 sm:w-5 sm:h-5 rounded flex items-center justify-center transition-all ${
                                isChecked
                                  ? 'bg-slate-800 text-white shadow-sm scale-100'
                                  : 'border border-slate-300 bg-white hover:border-slate-500 scale-95'
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                        </td>
                      );
                    })
                  )}
                </tr>
              ))
            )}
          </tbody>

          {/* Bottom Summary Rows (Progress %, Done, Not Done) matching Image 2! */}
          <tfoot className="divide-y divide-slate-200 border-t-2 border-slate-300 bg-slate-50/90 font-medium text-xs">
            {/* Row 1: Progress % */}
            <tr className="bg-slate-100/70">
              <td className="sticky left-0 z-20 bg-slate-100/95 backdrop-blur px-4 py-2 text-left font-semibold text-slate-700 border-r border-slate-200">
                Progress
              </td>
              {weeks.map((week, wIdx) =>
                week.days.map((day) => {
                  const stat = dailyStats.find((s) => s.dateKey === day.dateKey);
                  const pct = stat ? stat.progressPct : 0;
                  return (
                    <td
                      key={`pct-${day.dateKey}`}
                      className={`py-2 px-0.5 border-r border-slate-200 text-[11px] font-bold ${
                        day.isToday ? 'bg-emerald-100 text-emerald-900' : ''
                      } ${pct === 100 ? 'text-emerald-700 bg-emerald-50' : pct > 0 ? 'text-slate-700' : 'text-slate-400'} ${
                        !day.isToday && wIdx % 2 === 1 ? 'bg-slate-200/50' : ''
                      }`}
                    >
                      {pct}%
                    </td>
                  );
                })
              )}
            </tr>

            {/* Row 2: Done count */}
            <tr className="bg-white">
              <td className="sticky left-0 z-20 bg-white backdrop-blur px-4 py-1.5 text-left font-medium text-slate-600 border-r border-slate-200">
                Done
              </td>
              {weeks.map((week, wIdx) =>
                week.days.map((day) => {
                  const stat = dailyStats.find((s) => s.dateKey === day.dateKey);
                  const done = stat ? stat.doneCount : 0;
                  return (
                    <td
                      key={`done-${day.dateKey}`}
                      className={`py-1.5 px-0.5 border-r border-slate-200 text-[11px] font-semibold ${
                        day.isToday ? 'bg-emerald-50/80 text-emerald-900' : ''
                      } ${done > 0 ? 'text-slate-800' : 'text-slate-400'} ${
                        !day.isToday && wIdx % 2 === 1 ? 'bg-slate-100/40' : ''
                      }`}
                    >
                      {done}
                    </td>
                  );
                })
              )}
            </tr>

            {/* Row 3: Not Done count */}
            <tr className="bg-slate-50/40">
              <td className="sticky left-0 z-20 bg-slate-50/95 backdrop-blur px-4 py-1.5 text-left font-medium text-slate-500 border-r border-slate-200">
                Not Done
              </td>
              {weeks.map((week, wIdx) =>
                week.days.map((day) => {
                  const stat = dailyStats.find((s) => s.dateKey === day.dateKey);
                  const notDone = stat ? stat.notDoneCount : 0;
                  return (
                    <td
                      key={`notdone-${day.dateKey}`}
                      className={`py-1.5 px-0.5 border-r border-slate-200 text-[11px] text-slate-500 ${
                        day.isToday ? 'bg-emerald-50/60' : ''
                      } ${!day.isToday && wIdx % 2 === 1 ? 'bg-slate-100/40' : ''}`}
                    >
                      {notDone}
                    </td>
                  );
                })
              )}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
