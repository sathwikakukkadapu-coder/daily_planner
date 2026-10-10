import React, { useState, useMemo } from 'react';
import { MONTH_NAMES } from '../utils/dateUtils';
import { calculateDailyProgress, calculateWeeklyStats, calculateTopHabits } from '../utils/reportUtils';
import { Sparkles, Edit3, Check, Trophy, TrendingUp, Calendar, ArrowUpRight, Flame } from 'lucide-react';

/**
 * Circular Donut Progress Ring SVG Component
 */
function DonutRing({ percentage, color, trackColor, size = 96, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percentage));
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor || '#f1f5f9'}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Center Percentage text matching reference image */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-serif italic text-sm sm:text-base font-bold text-slate-800 tracking-tight">
          {percentage.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

/**
 * Spline Consistency Curve for top-center of report
 */
function ReportTrendCurve({ days, userData }) {
  const habits = userData?.habits || [];
  const completions = userData?.completions || {};
  const totalHabits = habits.length;

  const points = days.map((day, idx) => {
    const dayComps = completions[day.dateKey] || {};
    const done = habits.filter((h) => dayComps[h.id]).length;
    const rate = totalHabits > 0 ? (done / totalHabits) * 100 : 0;
    return { dayNumber: day.dayNumber, rate, idx };
  });

  const width = 800;
  const height = 120;
  const padL = 30;
  const padR = 20;
  const padT = 15;
  const padB = 25;
  const chartH = height - padT - padB;
  const chartW = width - padL - padR;

  const getX = (i) => padL + (i / Math.max(1, days.length - 1)) * chartW;
  const getY = (rate) => padT + chartH - (rate / 100) * chartH;

  const svgPoints = points.map((p) => ({ x: getX(p.idx), y: getY(p.rate), ...p }));

  let pathD = '';
  if (svgPoints.length > 0) {
    pathD = `M ${svgPoints[0].x} ${svgPoints[0].y}`;
    for (let i = 0; i < svgPoints.length - 1; i++) {
      const p0 = svgPoints[i === 0 ? 0 : i - 1];
      const p1 = svgPoints[i];
      const p2 = svgPoints[i + 1];
      const p3 = svgPoints[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      pathD += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
  }

  const baseY = padT + chartH;
  const areaD = svgPoints.length > 0
    ? `${pathD} L ${svgPoints[svgPoints.length - 1].x} ${baseY} L ${svgPoints[0].x} ${baseY} Z`
    : '';

  return (
    <div className="w-full bg-white rounded-lg border border-slate-200/80 p-2 overflow-hidden shadow-xs">
      <div className="flex items-center justify-between px-2 mb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Monthly Consistency Trend
        </span>
        <span className="text-[10px] text-slate-500 font-medium">
          {days.length} Days Tracked
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id="reportCurveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Baseline & grid */}
        {[100, 50, 0].map((val) => {
          const y = getY(val);
          return (
            <line
              key={val}
              x1={padL}
              y1={y}
              x2={width - padR}
              y2={y}
              stroke="#f1f5f9"
              strokeDasharray={val === 0 ? 'none' : '2,2'}
            />
          );
        })}

        {/* Area & line */}
        {areaD && <path d={areaD} fill="url(#reportCurveGrad)" />}
        {pathD && <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />}

        {/* Dots */}
        {svgPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.rate > 0 ? 2.5 : 1.5}
            fill={p.rate > 0 ? '#3b82f6' : '#cbd5e1'}
          />
        ))}
      </svg>
    </div>
  );
}

export default function ProgressReport({
  year,
  monthIndex,
  days,
  weeks,
  userData,
  otherUserData,
  todayDateKey,
  onUpdateAffirmation,
  onBackToGrid,
}) {
  const currentMonthName = MONTH_NAMES[monthIndex];

  // Visual Affirmation state
  const [isEditingAffirmation, setIsEditingAffirmation] = useState(false);
  const [affirmationText, setAffirmationText] = useState(
    userData?.affirmation || 'Focused, intentional, and ready for the month ahead.'
  );

  // Sync if prop updates
  React.useEffect(() => {
    if (userData?.affirmation) {
      setAffirmationText(userData.affirmation);
    }
  }, [userData?.affirmation]);

  const handleSaveAffirmation = () => {
    setIsEditingAffirmation(false);
    if (onUpdateAffirmation) {
      onUpdateAffirmation(affirmationText);
    }
  };

  // Calculations
  const dailyProgress = useMemo(() => {
    return calculateDailyProgress(userData, todayDateKey);
  }, [userData, todayDateKey]);

  const weeklyStats = useMemo(() => {
    return calculateWeeklyStats(userData, weeks);
  }, [userData, weeks]);

  const { rankedHabits, count100, countOnTrack } = useMemo(() => {
    return calculateTopHabits(userData, days);
  }, [userData, days]);

  // Donut Ring Palette matching image
  const ringColors = [
    { stroke: '#60a5fa', track: '#eff6ff', name: 'Week 1' }, // Soft Sky Blue
    { stroke: '#f472b6', track: '#fdf2f8', name: 'Week 2' }, // Soft Rose Pink
    { stroke: '#2dd4bf', track: '#f0fdfa', name: 'Week 3' }, // Soft Mint Cyan
    { stroke: '#fbbf24', track: '#fffbeb', name: 'Week 4' }, // Soft Amber/Peach
    { stroke: '#a78bfa', track: '#faf5ff', name: 'Week 5' }, // Soft Lavender
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-7 space-y-6 transition-all animate-fade-in font-sans">
      {/* Back to Tracker Bar */}
      {onBackToGrid && (
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <button
            onClick={onBackToGrid}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-slate-200 transition"
          >
            <span>← Back to Daily Habit Tracker Grid</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Viewing:</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <span>{userData?.avatar || '👤'}</span>
              <span>{userData?.name || 'User'}</span>
            </span>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TOP ROW: Month Title & Badge, Trend Curve, Daily KPI     */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Top-Left: Month Title & Year/Month Badge Table */}
        <div className="lg:col-span-3 space-y-3">
          <div>
            <h2 className="font-serif italic text-4xl sm:text-5xl text-slate-800 tracking-tight">
              {currentMonthName}
            </h2>
            <div className="font-sans text-[11px] font-bold tracking-[0.28em] text-slate-500 uppercase mt-1">
              HABIT TRACKER
            </div>
          </div>

          {/* Month / Year Badge Table matching reference */}
          <div className="inline-block border border-slate-300 rounded overflow-hidden shadow-2xs">
            <div className="flex border-b border-slate-300 text-xs">
              <span className="w-20 bg-[#fed7aa] text-[#7c2d12] font-semibold px-3 py-1 uppercase tracking-wider text-[11px]">
                MONTH
              </span>
              <span className="min-w-[80px] bg-white text-slate-800 font-medium px-3 py-1">
                {currentMonthName}
              </span>
            </div>
            <div className="flex text-xs">
              <span className="w-20 bg-[#fed7aa] text-[#7c2d12] font-semibold px-3 py-1 uppercase tracking-wider text-[11px]">
                YEAR
              </span>
              <span className="min-w-[80px] bg-white text-slate-800 font-medium px-3 py-1">
                {year}
              </span>
            </div>
          </div>
        </div>

        {/* Top-Center: Monthly Trend Curve */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          <ReportTrendCurve days={days} userData={userData} />
        </div>

        {/* Top-Right: Pink KPI Box (Daily Progress & Habits) */}
        <div className="lg:col-span-3">
          <div className="bg-[#fce7f3]/60 border border-pink-200/80 rounded-xl p-4 flex items-center justify-between gap-3 shadow-2xs">
            <div className="space-y-1">
              <div className="text-[10px] font-bold tracking-wider text-slate-600 uppercase">
                DAILY PROGRESS
              </div>
              <div className="font-serif italic text-3xl sm:text-4xl text-slate-800 font-bold tracking-tight">
                {dailyProgress.percentageStr}
              </div>
            </div>

            {/* Square box for Habits count matching image */}
            <div className="bg-white border border-pink-200 rounded-lg p-2.5 text-center min-w-[85px] shadow-2xs">
              <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                HABITS
              </div>
              <div className="font-serif italic text-lg sm:text-xl text-slate-800 font-bold mt-0.5">
                {dailyProgress.completedToday} / {dailyProgress.totalHabits}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MAIN BODY: Visual Affirmation, Weekly Rings, Top 10      */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* ------------------------------------------------------ */}
        {/* LEFT COLUMN: Visual Affirmation Card                   */}
        {/* ------------------------------------------------------ */}
        <div className="lg:col-span-3">
          <div className="bg-[#fffbeb]/50 border border-amber-200/80 rounded-xl p-4 flex flex-col justify-between h-full min-h-[320px] shadow-2xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-amber-900/80 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Visual Affirmation
                </span>
                <button
                  onClick={() => setIsEditingAffirmation(!isEditingAffirmation)}
                  className="text-amber-700 hover:text-amber-900 p-1 hover:bg-amber-100/60 rounded transition"
                  title="Edit Affirmation"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                A daily quote and visual anchor that reminds you of your <em>"why"</em> and keeps you energized toward your goals.
              </p>

              {/* Decorative Affirmation Graphic / Icon */}
              <div className="py-2 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-amber-100/80 border border-amber-200/90 flex items-center justify-center text-2xl shadow-inner">
                  {userData?.avatar || '🌸'}
                </div>
              </div>
            </div>

            {/* Bottom Quote section */}
            <div className="border-t border-amber-200/60 pt-3 mt-3">
              {isEditingAffirmation ? (
                <div className="space-y-2">
                  <textarea
                    value={affirmationText}
                    onChange={(e) => setAffirmationText(e.target.value)}
                    rows={3}
                    className="w-full text-xs p-2 border border-amber-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    placeholder="Enter your personal affirmation..."
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => setIsEditingAffirmation(false)}
                      className="px-2 py-1 text-[11px] text-slate-500 hover:bg-amber-100 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveAffirmation}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-amber-600 text-white rounded hover:bg-amber-700 transition flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="font-serif italic text-xs text-amber-900/70">I am...</div>
                  <div className="font-serif italic text-slate-800 text-sm sm:text-base leading-snug">
                    "{affirmationText}"
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------ */}
        {/* CENTER COLUMN: Weekly Breakdown & 5 Donut Rings        */}
        {/* ------------------------------------------------------ */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          {/* Week Labels & Daily Percentages Matrix */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs overflow-x-auto">
            <div className="grid grid-cols-5 gap-2 min-w-[480px]">
              {weeklyStats.map((week, wIdx) => (
                <div key={week.weekNumber} className="space-y-2">
                  {/* Week title matching image italic serif */}
                  <div className="font-serif italic text-slate-700 text-xs sm:text-sm font-semibold text-center border-b border-slate-100 pb-1">
                    {week.weekLabel}
                  </div>

                  {/* Daily breakdown indicators */}
                  <div className="flex justify-around items-end gap-0.5 px-1 py-1">
                    {week.days.map((day) => (
                      <div
                        key={day.dateKey}
                        className="flex flex-col items-center group relative cursor-pointer"
                        title={`Day ${day.dayNumber}: ${day.doneCount}/${userData?.habits?.length || 0} (${day.dayPctStr})`}
                      >
                        {/* Day completion % */}
                        <span className="text-[9px] text-slate-400 group-hover:text-slate-800">
                          {Math.round(day.dayPct)}%
                        </span>
                        {/* Day done count */}
                        <span className="text-[9px] font-semibold text-slate-600">
                          {day.doneCount}
                        </span>
                        {/* Visual mini bar */}
                        <div className="w-1.5 h-6 bg-slate-100 rounded-full overflow-hidden mt-1 flex flex-col justify-end">
                          <div
                            className="w-full bg-slate-700 rounded-full transition-all duration-300"
                            style={{ height: `${day.dayPct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5 Circular Donut Progress Cards matching reference image */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {weeklyStats.map((week, idx) => {
              const pal = ringColors[idx % ringColors.length];
              return (
                <div
                  key={week.weekNumber}
                  className="bg-white border border-slate-200/90 rounded-xl p-3 flex flex-col items-center justify-between shadow-2xs hover:border-slate-300 transition-all text-center"
                >
                  {/* SVG Donut Ring */}
                  <div className="my-1">
                    <DonutRing
                      percentage={week.weekPct}
                      color={pal.stroke}
                      trackColor={pal.track}
                      size={76}
                      strokeWidth={7}
                    />
                  </div>

                  {/* Week Info */}
                  <div className="mt-2 space-y-0.5">
                    <div className="font-serif italic text-xs font-semibold text-slate-700">
                      {week.weekLabel}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Days {week.dateRange}
                    </div>
                    <div className="text-[10px] font-medium text-slate-500">
                      {week.totalCompleted}/{week.totalPossible} habits
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ------------------------------------------------------ */}
        {/* RIGHT COLUMN: TOP 10 HABITS Table                      */}
        {/* ------------------------------------------------------ */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200/90 rounded-xl p-3 flex flex-col justify-between h-full shadow-2xs">
            <div>
              {/* Header Title */}
              <div className="text-center font-sans font-bold text-xs tracking-[0.2em] text-slate-700 uppercase mb-2">
                TOP 10 HABITS
              </div>

              {/* Table Header Bar with blue background matching reference */}
              <div className="bg-[#bfdbfe]/80 border border-blue-200/90 rounded-t-lg px-3 py-1.5 flex items-center justify-between text-xs font-serif italic text-slate-800">
                <span>daily habit</span>
                <span>progress</span>
              </div>

              {/* 10 Rows Table */}
              <div className="border-x border-b border-slate-200/80 rounded-b-lg divide-y divide-slate-100 bg-white">
                {rankedHabits.map((item) => (
                  <div
                    key={item.rank}
                    className="flex items-center justify-between px-3 py-1.5 text-xs hover:bg-slate-50/80 transition"
                  >
                    {/* Rank & Habit Title */}
                    <div className="flex items-center gap-2 overflow-hidden pr-2">
                      <span className="text-[11px] font-semibold text-slate-400 w-4 text-right flex-shrink-0">
                        {item.rank}
                      </span>
                      <span
                        className={`truncate ${
                          item.habit ? 'text-slate-700 font-medium' : 'text-slate-300 italic'
                        }`}
                        title={item.habit?.title || ''}
                      >
                        {item.habit?.title || '—'}
                      </span>
                    </div>

                    {/* Progress % and mini indicator */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span
                        className={`text-[11px] font-serif italic ${
                          item.percentage >= 80
                            ? 'text-emerald-600 font-bold'
                            : item.percentage > 0
                            ? 'text-slate-700 font-semibold'
                            : 'text-slate-300'
                        }`}
                      >
                        {item.percentageStr}
                      </span>
                      {item.habit && (
                        <div className="w-8 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className={`h-full rounded-full ${
                              item.percentage >= 80 ? 'bg-emerald-500' : 'bg-blue-400'
                            }`}
                            style={{ width: `${Math.min(100, item.percentage)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Motivational Quote matching reference image */}
            <div className="text-center font-serif italic text-xs text-slate-600 pt-3 border-t border-slate-100 mt-2">
              {count100 > 0 ? (
                <span>Over 100% on <strong>{count100} habits</strong> — keep going!</span>
              ) : countOnTrack > 0 ? (
                <span><strong>{countOnTrack} habits</strong> on track (≥80%) — keep going!</span>
              ) : (
                <span>Over 100% on 0 habits — keep going!</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
