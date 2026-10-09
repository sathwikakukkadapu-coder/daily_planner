export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DAY_ABBRS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Returns days metadata for a given month and year
 * Each day: { dayNumber: 1..31, dayOfWeek: 'Sa', isWeekend: bool, dateKey: '2026-11-01', isToday: bool }
 */
export function getMonthDays(year, monthIndex) {
  const date = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === monthIndex;
  const currentDayNumber = today.getDate();

  const days = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const curDate = new Date(year, monthIndex, day);
    const dayOfWeekIndex = curDate.getDay();
    const dayAbbr = DAY_ABBRS[dayOfWeekIndex];
    const isWeekend = dayOfWeekIndex === 0 || dayOfWeekIndex === 6;
    
    // Format YYYY-MM-DD
    const mStr = String(monthIndex + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateKey = `${year}-${mStr}-${dStr}`;

    days.push({
      dayNumber: day,
      dayAbbr,
      isWeekend,
      dateKey,
      isToday: isCurrentMonth && day === currentDayNumber,
    });
  }

  return days;
}

/**
 * Groups days into Week 1, Week 2, Week 3, Week 4, Week 5
 * (e.g. 1-7, 8-14, 15-21, 22-28, 29-31) matching the reference spreadsheet layout!
 */
export function groupDaysByWeeks(days) {
  const weeks = [];
  const chunkSize = 7;
  
  for (let i = 0; i < days.length; i += chunkSize) {
    const chunk = days.slice(i, i + chunkSize);
    const weekNumber = Math.floor(i / chunkSize) + 1;
    weeks.push({
      weekLabel: `Week ${weekNumber}`,
      days: chunk
    });
  }

  return weeks;
}
