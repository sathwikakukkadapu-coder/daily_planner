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

  it('preserves local state if local is newer than server (Render restart case)', () => {
    const localState = {
      updatedAt: 1728550000000,
      users: {
        user1: { name: 'Sathwika', habits: [{ id: 'h1', title: 'New Plan Made Today' }] },
        user2: { name: 'Alex', habits: [{ id: 'h2', title: 'Friend Custom Plan' }] },
      },
    };

    // Stale server state from old restarted container
    const staleServerState = {
      updatedAt: 1728500000000,
      users: {
        user1: { name: 'Sathwika', habits: [{ id: 'h1', title: 'Old Template' }] },
        user2: { name: 'Alex', habits: [{ id: 'h2', title: 'Old Template' }] },
      },
    };

    const { resolvedState, shouldBroadcast } = resolveStateConflict(localState, staleServerState);

    // Newer local state is preserved!
    expect(resolvedState.users.user2.habits[0].title).toBe('Friend Custom Plan');
    // Instructs client to broadcast and re-seed the server!
    expect(shouldBroadcast).toBe(true);
  });

  it('accepts incoming server state if server is newer', () => {
    const localState = {
      updatedAt: 1728500000000,
      users: {
        user1: { name: 'Sathwika' },
      },
    };

    const newerServerState = {
      updatedAt: 1728560000000,
      users: {
        user1: { name: 'Sathwika Updated From Another Phone' },
      },
    };

    const { resolvedState, shouldBroadcast } = resolveStateConflict(localState, newerServerState);

    expect(resolvedState.users.user1.name).toBe('Sathwika Updated From Another Phone');
    expect(shouldBroadcast).toBe(false);
  });

  it('initializes default app data with version and timestamp', () => {
    const data = getDefaultAppData(2026, 10);
    expect(data.version).toBe(2);
    expect(data.updatedAt).toBeGreaterThan(0);
    expect(data.users.user1.habits.length).toBeGreaterThan(0);
    expect(data.users.user2.habits.length).toBeGreaterThan(0);
  });
});
