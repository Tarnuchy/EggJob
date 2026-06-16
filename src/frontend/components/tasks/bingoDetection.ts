/** All winning lines (rows, columns, both diagonals) of indices for an N×N bingo board. */
export function buildBingoLines(size: number): number[][] {
  const lines: number[][] = [];
  for (let i = 0; i < size; i++) {
    lines.push(Array.from({ length: size }, (_, j) => i * size + j));
    lines.push(Array.from({ length: size }, (_, j) => j * size + i));
  }
  lines.push(Array.from({ length: size }, (_, i) => i * size + i));
  lines.push(Array.from({ length: size }, (_, i) => i * size + (size - 1 - i)));
  return lines;
}

/** True when at least one full line of the board is done. */
export function hasBingoLine(done: boolean[], size: number): boolean {
  if (done.length === 0) return false;
  return buildBingoLines(size).some((line) => line.every((index) => done[index]));
}
