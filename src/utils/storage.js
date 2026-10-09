export const DEFAULT_USER1_HABITS = [
  { id: 'h1', title: 'Wake up at 05:00', emoji: '⏰', category: 'Morning' },
  { id: 'h2', title: 'Gym', emoji: '💪', category: 'Health' },
  { id: 'h3', title: 'Reading / Learning', emoji: '📖', category: 'Mindset' },
  { id: 'h4', title: 'Day Planning', emoji: '📝', category: 'Productivity' },
  { id: 'h5', title: 'Budget Tracking', emoji: '💰', category: 'Finance' },
  { id: 'h6', title: 'Project Work', emoji: '🎯', category: 'Productivity' },
  { id: 'h7', title: 'No Alcohol', emoji: '🍷', category: 'Health' },
  { id: 'h8', title: 'Social Media Detox', emoji: '🌿', category: 'Mindset' },
  { id: 'h9', title: 'Goal Journaling', emoji: '📒', category: 'Mindset' },
  { id: 'h10', title: 'Cold Shower', emoji: '🚿', category: 'Health' },
];

export const DEFAULT_USER2_HABITS = [
  { id: 'h201', title: 'Wake up at 06:00', emoji: '⏰', category: 'Morning' },
  { id: 'h202', title: 'Morning Jog / Cardio', emoji: '🏃‍♂️', category: 'Health' },
  { id: 'h203', title: 'Read 20 Pages', emoji: '📚', category: 'Mindset' },
  { id: 'h204', title: 'Deep Work Session', emoji: '💻', category: 'Productivity' },
  { id: 'h205', title: 'Drink 2.5L Water', emoji: '💧', category: 'Health' },
  { id: 'h206', title: 'Meditation & Breathwork', emoji: '🧘', category: 'Mindset' },
  { id: 'h207', title: 'Healthy Meals / No Junk', emoji: '🥗', category: 'Health' },
  { id: 'h208', title: 'Screen Time < 2 Hours', emoji: '📵', category: 'Focus' },
  { id: 'h209', title: 'Daily Gratitude', emoji: '✍️', category: 'Mindset' },
  { id: 'h210', title: 'Sleep by 11:00 PM', emoji: '🌙', category: 'Sleep' },
];

/**
 * Creates initial demo checkmarks matching Image 2 reference:
 * Days 1 to 7 have realistic completions
 */
export function generateInitialCompletions(habits, year, monthIndex) {
  const completions = {};
  const mStr = String(monthIndex + 1).padStart(2, '0');
  
  // Sample pattern for days 1 to 7 like in reference image
  // Day 1: 100%, Day 2: 70%, Day 3: 70%, Day 4: 50%, Day 5: 90%, Day 6: 50%, Day 7: 50%
  const sampleRates = [1.0, 0.7, 0.7, 0.5, 0.9, 0.5, 0.5];

  sampleRates.forEach((rate, dayIdx) => {
    const day = dayIdx + 1;
    const dStr = String(day).padStart(2, '0');
    const dateKey = `${year}-${mStr}-${dStr}`;
    completions[dateKey] = {};

    const habitsToCompleteCount = Math.round(habits.length * rate);
    habits.forEach((habit, hIdx) => {
      if (hIdx < habitsToCompleteCount) {
        completions[dateKey][habit.id] = true;
      }
    });
  });

  return completions;
}

export function getDefaultAppData(year = 2026, monthIndex = 10) { // default to November (10 in 0-indexed) or current month
  return {
    version: 1,
    currentYear: year,
    currentMonth: monthIndex,
    users: {
      user1: {
        id: 'user1',
        name: 'Me (Sathwika)',
        avatar: '🌸',
        color: '#10b981', // Emerald green from Image 2
        habits: DEFAULT_USER1_HABITS,
        completions: generateInitialCompletions(DEFAULT_USER1_HABITS, year, monthIndex),
      },
      user2: {
        id: 'user2',
        name: 'Friend (Alex)',
        avatar: '⚡',
        color: '#8b5cf6', // Violet
        habits: DEFAULT_USER2_HABITS,
        completions: generateInitialCompletions(DEFAULT_USER2_HABITS, year, monthIndex),
      }
    }
  };
}

const LOCAL_STORAGE_KEY = 'duo_habit_tracker_state_v1';
const MY_IDENTITY_KEY = 'duo_habit_my_identity';
const ROOM_ID_KEY = 'duo_habit_room_id';

export function loadLocalState() {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading state from localStorage:', e);
  }
  const now = new Date();
  return getDefaultAppData(now.getFullYear(), now.getMonth());
}

export function saveLocalState(state) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving state to localStorage:', e);
  }
}

export function getSavedIdentity() {
  return localStorage.getItem(MY_IDENTITY_KEY) || 'user1';
}

export function setSavedIdentity(id) {
  localStorage.setItem(MY_IDENTITY_KEY, id);
}

export function getSavedRoomId() {
  return localStorage.getItem(ROOM_ID_KEY) || '';
}

export function setSavedRoomId(roomId) {
  localStorage.setItem(ROOM_ID_KEY, roomId);
}
