import { describe, expect, it } from 'vitest';
import { getGreetingKey } from '../../../../src/frontend/screens/home/logic/greeting';

describe('getGreetingKey', () => {
  it('maps hours to the right part of day', () => {
    expect(getGreetingKey(4)).toBe('night');
    expect(getGreetingKey(5)).toBe('morning');
    expect(getGreetingKey(11)).toBe('morning');
    expect(getGreetingKey(12)).toBe('afternoon');
    expect(getGreetingKey(17)).toBe('afternoon');
    expect(getGreetingKey(18)).toBe('evening');
    expect(getGreetingKey(22)).toBe('evening');
    expect(getGreetingKey(23)).toBe('night');
    expect(getGreetingKey(0)).toBe('night');
  });
});
