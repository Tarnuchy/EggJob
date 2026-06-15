import { describe, expect, it } from 'vitest';
import { computeBingoCellSize } from '../../../../src/frontend/components/tasks/bingoLayout';

// Regresja #4: dla niektórych szerokości ekranu siatka 3×3 zawijała wiersz, bo ułamkowy
// cellSize po natywnym zaokrągleniu sprawiał, że size*cellSize + (size-1)*gap przekraczało
// dostępną szerokość. Niezmiennik: cellSize jest całkowity i siatka mieści się bez przekroczenia.

const PADDING_H = 24; // SCREEN_PADDING_H (spacing.lg)
const GAP = 8; // GRID_GAP (spacing.sm)

// Szerokości typowych urządzeń (iPhone SE/12/15, Pixel, mały Android) — w tym te,
// które dawały ułamkowy cellSize dla 3×3 (np. 390, 393).
const WIDTHS = [320, 360, 375, 390, 393, 412, 414, 428];
const SIZES = [3, 4, 5] as const;

describe('computeBingoCellSize', () => {
  for (const width of WIDTHS) {
    for (const size of SIZES) {
      it(`zwraca całkowity rozmiar mieszczący ${size}×${size} przy szerokości ${width}`, () => {
        const cell = computeBingoCellSize(width, size, PADDING_H, GAP);

        expect(Number.isInteger(cell)).toBe(true);
        expect(cell).toBeGreaterThan(0);

        const available = width - 2 * PADDING_H;
        const usedByRow = size * cell + (size - 1) * GAP;
        // musi się zmieścić w jednym wierszu — bez przekroczenia kontenera
        expect(usedByRow).toBeLessThanOrEqual(available);
      });
    }
  }

  it('nigdy nie marnuje więcej niż (size-1) px po prawej (cellSize jest maksymalny całkowity)', () => {
    const width = 390;
    const size = 3;
    const cell = computeBingoCellSize(width, size, PADDING_H, GAP);
    const available = width - 2 * PADDING_H;
    const usedByRow = size * cell + (size - 1) * GAP;
    // dodanie 1 px do każdej komórki już by nie zmieściło wiersza → cell jest optymalny
    expect((size * (cell + 1) + (size - 1) * GAP) > available).toBe(true);
  });
});
