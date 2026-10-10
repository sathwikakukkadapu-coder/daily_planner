const AUTH_SESSION_KEY = 'duo_habit_auth_session';

/**
 * Gets currently logged in user session.
 */
export function getAuthSession() {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading auth session:', e);
  }
  return null;
}

/**
 * Saves authenticated user session.
 */
export function saveAuthSession(userId, userName, avatar) {
  try {
    localStorage.setItem(
      AUTH_SESSION_KEY,
      JSON.stringify({
        userId,
        userName,
        avatar,
        loginTime: Date.now(),
      })
    );
  } catch (e) {
    console.error('Error saving auth session:', e);
  }
}

/**
 * Clears authentication session (Logout).
 */
export function clearAuthSession() {
  try {
    localStorage.removeItem(AUTH_SESSION_KEY);
  } catch (e) {
    console.error('Error clearing auth session:', e);
  }
}

/**
 * Validates PIN for a user profile.
 * If user has no PIN configured yet, authentication succeeds immediately.
 */
export function verifyUserPin(userObj, enteredPin) {
  if (!userObj) return false;
  // If user hasn't set a PIN yet, allow login
  if (!userObj.pin || userObj.pin.trim() === '') {
    return true;
  }
  return String(userObj.pin).trim() === String(enteredPin || '').trim();
}
