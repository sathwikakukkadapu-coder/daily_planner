/**
 * Utility functions for generating Weekly & Monthly Progress Reports
 * matching the spreadsheet reference dashboard.
 */

/**
 * Calculates daily progress for today
 * @param {object} userData 
 * @param {string} todayDateKey 'YYYY-MM-DD'
 * @returns {{ completedToday: number, totalHabits: number, percentageStr: string, percentageNum: number }}
 */
export function calculateDailyProgress(userData, todayDateKey) {
  const habits = userData?.habits || [];
  const totalHabits = habits.length;
  if (totalHabits === 0) {
    return {
      completedToday: 0,
      totalHabits: 0,
      percentageStr: '0.00%',
      percentageNum: 0,
    };
  }

  const todayComps = userData?.completions?.[todayDateKey] || {};
  const completedToday = habits.filter((h) => todayComps[h.id]).length;
  const percentageNum = (completedToday / totalHabits) * 100;

  return {
    completedToday,
    totalHabits,
    percentageStr: `${percentageNum.toFixed(2)}%`,
    percentageNum,
  };
}

/**
 * Calculates weekly breakdown and donut ring percentages
 * @param {object} userData 
 * @param {Array} weeks Grouped weeks from groupDaysByWeeks
 * @returns {Array} Array of weekly stats
 */
export function calculateWeeklyStats(userData, weeks) {
  const habits = userData?.habits || [];
  const completions = userData?.completions || {};
  const totalHabits = habits.length;

  return weeks.map((week, index) => {
    let weekCompleted = 0;
    const daysData = week.days.map((day) => {
      const dayComps = completions[day.dateKey] || {};
      const doneCount = habits.filter((h) => dayComps[h.id]).length;
      const dayPct = totalHabits > 0 ? (doneCount / totalHabits) * 100 : 0;
      weekCompleted += doneCount;

      return {
        ...day,
        doneCount,
        dayPct,
        dayPctStr: `${Math.round(dayPct)}%`,
      };
    });

    const totalPossible = totalHabits * week.days.length;
    const weekPct = totalPossible > 0 ? (weekCompleted / totalPossible) * 100 : 0;

    return {
      weekNumber: index + 1,
      weekLabel: `week ${index + 1}`,
      days: daysData,
      totalCompleted: weekCompleted,
      totalPossible,
      weekPct,
      weekPctStr: `${weekPct.toFixed(1)}%`,
      dateRange: `${week.days[0]?.dayNumber || 1} - ${week.days[week.days.length - 1]?.dayNumber || 1}`,
    };
  });
}

/**
 * Calculates top habits ranked by completion percentage
 * @param {object} userData 
 * @param {Array} days Array of month days
 * @returns {{ rankedHabits: Array, count100: number, countOnTrack: number }}
 */
export function calculateTopHabits(userData, days) {
  const habits = userData?.habits || [];
  const completions = userData?.completions || {};
  const totalDays = days.length;

  if (totalDays === 0 || habits.length === 0) {
    const emptyRows = Array.from({ length: 10 }, (_, i) => ({
      rank: i + 1,
      habit: null,
      percentage: 0,
      percentageStr: '0.0%',
      completedDays: 0,
      totalDays: 0,
    }));
    return { rankedHabits: emptyRows, count100: 0, countOnTrack: 0 };
  }

  const scored = habits.map((h) => {
    let completedDays = 0;
    days.forEach((day) => {
      if (completions[day.dateKey]?.[h.id]) {
        completedDays++;
      }
    });
    const percentage = (completedDays / totalDays) * 100;
    return {
      habit: h,
      percentage,
      percentageStr: `${percentage.toFixed(1)}%`,
      completedDays,
      totalDays,
    };
  });

  // Sort descending by completion %
  scored.sort((a, b) => b.percentage - a.percentage);

  const count100 = scored.filter((s) => s.percentage >= 100).length;
  const countOnTrack = scored.filter((s) => s.percentage >= 80).length;

  // Pad to 10 rows
  const rankedHabits = Array.from({ length: 10 }, (_, i) => {
    if (i < scored.length) {
      return {
        rank: i + 1,
        ...scored[i],
      };
    }
    return {
      rank: i + 1,
      habit: null,
      percentage: 0,
      percentageStr: '—',
      completedDays: 0,
      totalDays,
    };
  });

  return { rankedHabits, count100, countOnTrack };
}
