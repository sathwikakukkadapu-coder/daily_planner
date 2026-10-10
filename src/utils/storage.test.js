import { describe, it, expect, beforeEach } from 'vitest';
import { resolveStateConflict, getDefaultAppData } from './storage';

describe('storage & state conflict resolution', () => {
  beforeEach(() => {
    const storage = {};
    global.localStorage = {
      getItem: (key) => storage[key] || null,
      setItem: (key, val) => { storage[key] = String(val); },
      removeItem: (key) => { delete storage[key]; },
    };
  });

  it('prevents default template from overwriting real user state from server', () => {
    const defaultLocalTemplate = {
      isDefaultTemplate: true,
      updatedAt: 1728560000000,
      users: { user1: { habits: [{ id: 'h1', title: 'Default Template' }] } },
    };

    const serverUserState = {
      isDefaultTemplate: false,
      updatedAt: 1728500000000,
      users: { user1: { habits: [{ id: 'h1', title: 'Real Custom Habit' }] } },
    };

    const { resolvedState, shouldBroadcast } = resolveStateConflict(defaultLocalTemplate, serverUserState);

    expect(resolvedState.users.user1.habits[0].title).toBe('Real Custom Habit');
    expect(shouldBroadcast).toBe(false);
  });

  it('preserves local user state if local has real edits and server is unedited default template', () => {
    const localUserState = {
      isDefaultTemplate: false,
      updatedAt: 1728550000000,
      users: { user1: { habits: [{ id: 'h1', title: 'My Custom Plan' }] } },
    };

    const defaultServerState = {
      isDefaultTemplate: true,
      updatedAt: 1728500000000,
      users: { user1: { habits: [{ id: 'h1', title: 'Default Template' }] } },
    };

    const { resolvedState, shouldBroadcast } = resolveStateConflict(localUserState, defaultServerState);

    expect(resolvedState.users.user1.habits[0].title).toBe('My Custom Plan');
    expect(shouldBroadcast).toBe(true);
  });

  it('accepts incoming server state if server is newer and has real data', () => {
    const localState = {
      isDefaultTemplate: false,
      updatedAt: 1728500000000,
      users: { user1: { name: 'Sathwika' } },
    };

    const newerServerState = {
      isDefaultTemplate: false,
      updatedAt: 1728560000000,
      users: { user1: { name: 'Sathwika Updated From Another Phone' } },
    };

    const { resolvedState, shouldBroadcast } = resolveStateConflict(localState, newerServerState);

    expect(resolvedState.users.user1.name).toBe('Sathwika Updated From Another Phone');
    expect(shouldBroadcast).toBe(false);
  });

  it('initializes default app data with version and default flag', () => {
    const data = getDefaultAppData(2026, 10);
    expect(data.version).toBe(2);
    expect(data.isDefaultTemplate).toBe(true);
    expect(data.users.user1.habits.length).toBeGreaterThan(0);
    expect(data.users.user2.habits.length).toBeGreaterThan(0);
  });
});
