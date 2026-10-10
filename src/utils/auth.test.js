import { describe, it, expect, beforeEach } from 'vitest';
import { verifyUserPin, saveAuthSession, getAuthSession, clearAuthSession } from './auth';

describe('auth utilities', () => {
  beforeEach(() => {
    // Mock localStorage in Node environment
    const storage = {};
    global.localStorage = {
      getItem: (key) => storage[key] || null,
      setItem: (key, val) => { storage[key] = String(val); },
      removeItem: (key) => { delete storage[key]; },
      clear: () => { Object.keys(storage).forEach(k => delete storage[k]); },
    };
  });

  it('allows access if user has no PIN configured', () => {
    const userWithoutPin = { id: 'user1', name: 'Sathwika', pin: '' };
    expect(verifyUserPin(userWithoutPin, '')).toBe(true);
    expect(verifyUserPin(userWithoutPin, '1234')).toBe(true);
  });

  it('validates correct PIN and rejects incorrect PIN', () => {
    const userWithPin = { id: 'user1', name: 'Sathwika', pin: '4567' };
    expect(verifyUserPin(userWithPin, '4567')).toBe(true);
    expect(verifyUserPin(userWithPin, '0000')).toBe(false);
    expect(verifyUserPin(userWithPin, '')).toBe(false);
  });

  it('saves, reads, and clears auth session correctly', () => {
    saveAuthSession('user1', 'Sathwika', '🌸');
    const session = getAuthSession();
    expect(session).not.toBeNull();
    expect(session.userId).toBe('user1');
    expect(session.userName).toBe('Sathwika');

    clearAuthSession();
    expect(getAuthSession()).toBeNull();
  });
});
