/**
 * Czysta logika layoutu siatki bingo (bez importów React Native — testowalna w env `node`).
 *
 * Komórki są kwadratowe i układane w `flexWrap: 'row'` z odstępem `gap`. Gdyby `cellSize`
 * był ułamkowy, natywne zaokrąglenie do pikseli mogło sprawić, że
 * `size * cellSize + (size - 1) * gap` minimalnie przekraczało dostępną szerokość — wtedy
 * ostatnia komórka wiersza zawijała się (objaw: rozjazd siatki 3×3 na części urządzeń).
 *
 * Zwracamy największy CAŁKOWITY rozmiar komórki, który gwarantuje zmieszczenie całego wiersza.
 * Floor zostawia co najwyżej (size - 1) px niewykorzystanej szerokości po prawej — niezauważalne
 * wizualnie, a eliminuje zawijanie niezależnie od szerokości ekranu i wielkości siatki.
 */
export function computeBingoCellSize(
  windowWidth: number,
  size: number,
  paddingH: number,
  gap: number,
): number {
  const available = windowWidth - 2 * paddingH - (size - 1) * gap;
  return Math.floor(available / size);
}
