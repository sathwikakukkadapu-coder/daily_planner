import { describe, it, expect } from 'vitest';
import { calculateDailyProgress, calculateWeeklyStats, calculateTopHabits } from './reportUtils';
import { getMonthDays, groupDaysByWeeks } from './dateUtils';

describe('reportUtils', () => {
  const days = getMonthDays(2026, 0); // Jan 2026 (31 days)
  const weeks = groupDaysByWeeks(days);

  const mockHabits = [
    { id: 'h1', title: 'Morning Exercise' },
    { id: 'h2', title: 'Read Book' },
  ];

  it('calculates daily progress accurately', () => {
    const userData = {
      habits: mockHabits,
      completions: {
        '2026-01-05': { h1: true, h2: false },
      },
    };

    const stats = calculateDailyProgress(userData, '2026-01-05');
    expect(stats.completedToday).toBe(1);
    expect(stats.totalHabits).toBe(2);
    expect(stats.percentageStr).toBe('50.00%');
  });

  it('handles empty habits gracefully for daily progress', () => {
    const stats = calculateDailyProgress({ habits: [] }, '2026-01-05');
    expect(stats.completedToday).toBe(0);
    expect(stats.totalHabits).toBe(0);
    expect(stats.percentageStr).toBe('0.00%');
  });

  it('calculates weekly stats and donut ring numbers', () => {
    const userData = {
      habits: mockHabits,
      completions: {
        '2026-01-01': { h1: true, h2: true }, // 2
        '2026-01-02': { h1: true }, // 1
      },
    };

    const weeklyStats = calculateWeeklyStats(userData, weeks);
    expect(weeklyStats.length).toBe(weeks.length);
    // Week 1 has 7 days * 2 habits = 14 possible, 3 done = 3/14 = 21.4%
    expect(weeklyStats[0].totalCompleted).toBe(3);
    expect(weeklyStats[0].totalPossible).toBe(14);
    expect(weeklyStats[0].weekPctStr).toBe('21.4%');
  });

  it('calculates and ranks top 10 habits', () => {
    const userData = {
      habits: [
        { id: 'h1', title: 'Exercise' },
        { id: 'h2', title: 'Meditate' },
      ],
      completions: {
        '2026-01-01': { h1: true, h2: true },
        '2026-01-02': { h1: true },
      },
    };

    const { rankedHabits, count100, countOnTrack } = calculateTopHabits(userData, days);
    expect(rankedHabits.length).toBe(10);
    expect(rankedHabits[0].habit.title).toBe('Exercise'); // 2 days done > 1 day done
    expect(rankedHabits[1].habit.title).toBe('Meditate');
    expect(rankedHabits[2].habit).toBeNull(); // Empty slot padded to 10
    expect(count100).toBe(0);
  });
});
