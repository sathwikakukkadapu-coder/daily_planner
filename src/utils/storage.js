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

export function getDefaultAppData(year = 2026, monthIndex = 9) {
  return {
    version: 2,
    isDefaultTemplate: true,
    updatedAt: 0, // 0 indicates initial template, never overwrites real user data
    currentYear: year,
    currentMonth: monthIndex,
    users: {
      user1: {
        id: 'user1',
        name: 'Me (Sathwika)',
        avatar: '🌸',
        color: '#10b981', // Emerald green
        pin: '',
        habits: DEFAULT_USER1_HABITS,
        completions: {},
      },
      user2: {
        id: 'user2',
        name: 'Friend (Alex)',
        avatar: '⚡',
        color: '#8b5cf6', // Violet
        pin: '',
        habits: DEFAULT_USER2_HABITS,
        completions: {},
      }
    }
  };
}

const LOCAL_STORAGE_KEY = 'duo_habit_tracker_state_v3';
const LEGACY_STORAGE_V2 = 'duo_habit_tracker_state_v2';
const LEGACY_STORAGE_V1 = 'duo_habit_tracker_state_v1';
const MY_IDENTITY_KEY = 'duo_habit_my_identity';
const ROOM_ID_KEY = 'duo_habit_room_id';

export function loadLocalState() {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_V2);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.users) {
        return parsed;
      }
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

/**
 * Resolves conflict between local state and incoming server state.
 * Prevents a default/empty template from overwriting real database data.
 * @param {object} localState 
 * @param {object} incomingState 
 * @returns {{ resolvedState: object, shouldBroadcast: boolean }}
 */
export function resolveStateConflict(localState, incomingState) {
  // If no incoming state from server, keep local
  if (!incomingState || !incomingState.users) {
    return { resolvedState: localState, shouldBroadcast: false };
  }

  // If local is just a default template, always accept incoming server state
  if (!localState || !localState.users || localState.isDefaultTemplate) {
    return { resolvedState: incomingState, shouldBroadcast: false };
  }

  // If server state is an unedited default template and local has user data, keep local and broadcast
  if (incomingState.isDefaultTemplate && !localState.isDefaultTemplate) {
    return { resolvedState: localState, shouldBroadcast: true };
  }

  const localTime = localState.updatedAt || 0;
  const incomingTime = incomingState.updatedAt || 0;

  // The state with the newer timestamp wins
  if (incomingTime >= localTime) {
    return {
      resolvedState: incomingState,
      shouldBroadcast: false,
    };
  }

  return {
    resolvedState: localState,
    shouldBroadcast: true,
  };
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
