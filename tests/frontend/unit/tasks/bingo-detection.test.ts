import { describe, expect, it } from 'vitest';
import {
  buildBingoLines,
  hasBingoLine,
} from '../../../../src/frontend/components/tasks/bingoDetection';

describe('buildBingoLines', () => {
  it('returns 2*size + 2 lines (rows, cols, two diagonals)', () => {
    expect(buildBingoLines(3)).toHaveLength(8);
    expect(buildBingoLines(4)).toHaveLength(10);
    expect(buildBingoLines(5)).toHaveLength(12);
  });

  it('produces correct row, column and diagonal index sets for size 3', () => {
    const lines = buildBingoLines(3);
    expect(lines).toContainEqual([0, 1, 2]); // first row
    expect(lines).toContainEqual([0, 3, 6]); // first column
    expect(lines).toContainEqual([0, 4, 8]); // main diagonal
    expect(lines).toContainEqual([2, 4, 6]); // anti-diagonal
  });
});

describe('hasBingoLine', () => {
  it('is false for an empty board', () => {
    expect(hasBingoLine([], 3)).toBe(false);
  });

  it('is false when no full line exists', () => {
    // no row, column, or diagonal is fully done
    const done = [true, false, true, false, false, false, true, false, false];
    expect(hasBingoLine(done, 3)).toBe(false);
  });

  it('is true for a completed row', () => {
    const done = [true, true, true, false, false, false, false, false, false];
    expect(hasBingoLine(done, 3)).toBe(true);
  });

  it('is true for a completed main diagonal', () => {
    const done = [true, false, false, false, true, false, false, false, true];
    expect(hasBingoLine(done, 3)).toBe(true);
  });

  it('is true for a completed column', () => {
    const done = [true, false, false, true, false, false, true, false, false];
    expect(hasBingoLine(done, 3)).toBe(true);
  });

  it('is true for a completed anti-diagonal', () => {
    const done = [false, false, true, false, true, false, true, false, false];
    expect(hasBingoLine(done, 3)).toBe(true);
  });
});
