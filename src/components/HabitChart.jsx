import React, { useState, useRef } from 'react';

/**
 * Creates smooth SVG bezier path from points [(x0,y0), (x1,y1), ...]
 */
function getSmoothPath(points) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return path;
}

export default function HabitChart({
  days,
  user1Data,
  user2Data,
  activeUserId,
  isCompareMode = false,
}) {
  const containerRef = useRef(null);
  const [hoverIndex, setHoverIndex] = useState(null);

  // Compute daily completion rates for user 1 & user 2
  const calcRates = (userData) => {
    if (!userData || !userData.habits || userData.habits.length === 0) {
      return days.map(() => 0);
    }
    const totalHabits = userData.habits.length;
    return days.map((day) => {
      const dayCompletions = userData.completions?.[day.dateKey] || {};
      const doneCount = userData.habits.filter((h) => dayCompletions[h.id]).length;
      return totalHabits > 0 ? (doneCount / totalHabits) * 100 : 0;
    });
  };

  const rates1 = calcRates(user1Data);
  const rates2 = calcRates(user2Data);

  // Chart Dimensions
  const height = 160;
  const paddingLeft = 52;
  const paddingRight = 24;
  const paddingTop = 20;
  const paddingBottom = 30;
  const chartHeight = height - paddingTop - paddingBottom;

  // We map days horizontally
  const totalDays = days.length;
  const getX = (index) => {
    const usableWidth = 1000 - paddingLeft - paddingRight;
    return paddingLeft + (index / Math.max(1, totalDays - 1)) * usableWidth;
  };

  const getY = (percentage) => {
    // 100% -> paddingTop, 0% -> paddingTop + chartHeight
    const clamped = Math.max(0, Math.min(100, percentage));
    return paddingTop + chartHeight - (clamped / 100) * chartHeight;
  };

  const points1 = rates1.map((rate, i) => ({ x: getX(i), y: getY(rate), rate, day: days[i] }));
  const points2 = rates2.map((rate, i) => ({ x: getX(i), y: getY(rate), rate, day: days[i] }));

  const linePath1 = getSmoothPath(points1);
  const linePath2 = getSmoothPath(points2);

  // Area paths (close path along bottom)
  const baseY = paddingTop + chartHeight;
  const areaPath1 = points1.length > 0
    ? `${linePath1} L ${points1[points1.length - 1].x} ${baseY} L ${points1[0].x} ${baseY} Z`
    : '';
  const areaPath2 = points2.length > 0
    ? `${linePath2} L ${points2[points2.length - 1].x} ${baseY} L ${points2[0].x} ${baseY} Z`
    : '';

  // Determine which to show
  const showUser1 = isCompareMode || activeUserId === 'user1';
  const showUser2 = isCompareMode || activeUserId === 'user2';

  const user1Color = user1Data?.color || '#10b981'; // Green
  const user2Color = user2Data?.color || '#8b5cf6'; // Purple

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 mt-6 select-none relative overflow-hidden">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Monthly Consistency Curve
          </span>
          {isCompareMode && (
            <span className="text-xs bg-indigo-50 text-indigo-600 font-medium px-2 py-0.5 rounded-full border border-indigo-100">
              Side-by-Side Comparison
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          {showUser1 && (
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: user1Color }} />
              <span>{user1Data?.name || 'Me'}</span>
            </div>
          )}
          {showUser2 && (
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: user2Color }} />
              <span>{user2Data?.name || 'Friend'}</span>
            </div>
          )}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox="0 0 1000 160"
          className="w-full h-40 overflow-visible"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            {/* User 1 Green Gradient matching reference image */}
            <linearGradient id="gradientUser1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={user1Color} stopOpacity="0.38" />
              <stop offset="70%" stopColor={user1Color} stopOpacity="0.10" />
              <stop offset="100%" stopColor={user1Color} stopOpacity="0.0" />
            </linearGradient>

            {/* User 2 Purple Gradient */}
            <linearGradient id="gradientUser2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={user2Color} stopOpacity="0.32" />
              <stop offset="70%" stopColor={user2Color} stopOpacity="0.08" />
              <stop offset="100%" stopColor={user2Color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Labels matching image (100%, 75%, 50%, 25%, 0%) */}
          {[100, 75, 50, 25, 0].map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={1000 - paddingRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray={val === 0 ? 'none' : '3,3'}
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-slate-400 font-sans"
                  style={{ fontSize: '10px' }}
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Area Fills */}
          {showUser2 && <path d={areaPath2} fill="url(#gradientUser2)" />}
          {showUser1 && <path d={areaPath1} fill="url(#gradientUser1)" />}

          {/* Smooth Lines */}
          {showUser2 && (
            <path
              d={linePath2}
              fill="none"
              stroke={user2Color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {showUser1 && (
            <path
              d={linePath1}
              fill="none"
              stroke={user1Color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {showUser1 &&
            points1.map((p, idx) => (
              <circle
                key={`p1-${idx}`}
                cx={p.x}
                cy={p.y}
                r={hoverIndex === idx ? 5 : p.rate > 0 ? 3 : 2}
                fill={p.rate > 0 ? user1Color : '#94a3b8'}
                stroke="#ffffff"
                strokeWidth="1.5"
                className="transition-all duration-150"
              />
            ))}

          {showUser2 &&
            points2.map((p, idx) => (
              <circle
                key={`p2-${idx}`}
                cx={p.x}
                cy={p.y}
                r={hoverIndex === idx ? 5 : p.rate > 0 ? 3 : 2}
                fill={p.rate > 0 ? user2Color : '#94a3b8'}
                stroke="#ffffff"
                strokeWidth="1.5"
                className="transition-all duration-150"
              />
            ))}

          {/* Hover interactive columns */}
          {days.map((day, idx) => {
            const x = getX(idx);
            const w = (1000 - paddingLeft - paddingRight) / totalDays;
            return (
              <rect
                key={`hover-${idx}`}
                x={x - w / 2}
                y={paddingTop}
                width={w}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(idx)}
              />
            );
          })}

          {/* Active Hover Guideline */}
          {hoverIndex !== null && (
            <line
              x1={getX(hoverIndex)}
              y1={paddingTop}
              x2={getX(hoverIndex)}
              y2={baseY}
              stroke="#64748b"
              strokeDasharray="2,2"
              strokeWidth="1.5"
            />
          )}
        </svg>

        {/* Hover Tooltip Card */}
        {hoverIndex !== null && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -top-2 bg-slate-900/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg shadow-lg text-xs"
            style={{
              left: `${(getX(hoverIndex) / 1000) * 100}%`,
            }}
          >
            <div className="font-semibold text-slate-200 border-b border-slate-700/60 pb-1 mb-1">
              Day {days[hoverIndex].dayNumber} ({days[hoverIndex].dayAbbr})
            </div>
            {showUser1 && (
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                <span>{user1Data?.name}: <strong>{Math.round(rates1[hoverIndex])}%</strong></span>
              </div>
            )}
            {showUser2 && (
              <div className="flex items-center gap-2 text-purple-400">
                <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
                <span>{user2Data?.name}: <strong>{Math.round(rates2[hoverIndex])}%</strong></span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
