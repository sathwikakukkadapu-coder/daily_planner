import { describe, it, expect } from 'vitest';
import { getTimeBasedGreeting } from './greeting';

describe('getTimeBasedGreeting', () => {
  it('returns Good morning between 5 AM and 11 AM with person name', () => {
    // 09:30 AM
    const morningDate = new Date('2026-10-10T09:30:00');
    const result = getTimeBasedGreeting('Sathwika', morningDate);

    expect(result.period).toBe('morning');
    expect(result.greeting).toBe('Good morning');
    expect(result.emoji).toBe('🌅');
    expect(result.fullGreeting).toBe('Good morning, Sathwika!');
  });

  it('returns Good afternoon between 12 PM and 4 PM with person name', () => {
    // 02:15 PM
    const afternoonDate = new Date('2026-10-10T14:15:00');
    const result = getTimeBasedGreeting('Alex', afternoonDate);

    expect(result.period).toBe('afternoon');
    expect(result.greeting).toBe('Good afternoon');
    expect(result.emoji).toBe('☀️');
    expect(result.fullGreeting).toBe('Good afternoon, Alex!');
  });

  it('returns Good evening between 5 PM and 8 PM with person name', () => {
    // 06:45 PM
    const eveningDate = new Date('2026-10-10T18:45:00');
    const result = getTimeBasedGreeting('Sathwika', eveningDate);

    expect(result.period).toBe('evening');
    expect(result.greeting).toBe('Good evening');
    expect(result.emoji).toBe('🌇');
    expect(result.fullGreeting).toBe('Good evening, Sathwika!');
  });

  it('returns Good night between 9 PM and 4 AM with person name', () => {
    // 11:30 PM
    const nightDate = new Date('2026-10-10T23:30:00');
    const result = getTimeBasedGreeting('Sathwika', nightDate);

    expect(result.period).toBe('night');
    expect(result.greeting).toBe('Good night');
    expect(result.emoji).toBe('🌙');
    expect(result.fullGreeting).toBe('Good night, Sathwika!');
  });

  it('handles names with avatar emojis cleanly', () => {
    const morningDate = new Date('2026-10-10T08:00:00');
    const result = getTimeBasedGreeting('🌸 Sathwika', morningDate);

    expect(result.fullGreeting).toBe('Good morning, Sathwika!');
  });
});
