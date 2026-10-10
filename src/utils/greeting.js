/**
 * Returns a personalized greeting based on current local time.
 * @param {string} userName - The name of the authenticated user
 * @param {Date} [date] - Optional Date object for testing
 * @returns {{ period: string, greeting: string, emoji: string, fullGreeting: string, subtext: string }}
 */
export function getTimeBasedGreeting(userName = 'Friend', date = new Date()) {
  const hours = date.getHours();
  const cleanName = (userName || '').replace(/^[^\w\s]+\s*/, '').trim() || 'Friend'; // strip leading avatar emoji if present

  let period = 'morning';
  let greeting = 'Good morning';
  let emoji = '🌅';
  let subtext = 'Ready to make today count and crush your daily habits?';

  if (hours >= 5 && hours < 12) {
    period = 'morning';
    greeting = 'Good morning';
    emoji = '🌅';
    subtext = 'Ready to make today count and crush your daily habits?';
  } else if (hours >= 12 && hours < 17) {
    period = 'afternoon';
    greeting = 'Good afternoon';
    emoji = '☀️';
    subtext = 'Keep the momentum going strong through the rest of the day!';
  } else if (hours >= 17 && hours < 21) {
    period = 'evening';
    greeting = 'Good evening';
    emoji = '🌇';
    subtext = "Let's review your progress and wrap up your daily goals.";
  } else {
    period = 'night';
    greeting = 'Good night';
    emoji = '🌙';
    subtext = 'Great job today! Rest well and recharge for tomorrow.';
  }

  return {
    period,
    greeting,
    emoji,
    fullGreeting: `${greeting}, ${cleanName}!`,
    subtext,
  };
}
