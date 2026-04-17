# EggJob Frontend - Runbook

Ten dokument opisuje jak uruchomic frontend, jak zweryfikowac jego poprawne dzialanie oraz na co uwazac przy dalszym rozwoju.

## 1) Wymagania

- Node.js 18 LTS lub 20 LTS
- npm 9+
- Expo SDK 52 (instalowane z package.json)
- Dla urzadzen mobilnych:
  - Android Studio (emulator Android)
  - Xcode (symulator iOS, tylko macOS)
- Opcjonalnie: aplikacja Expo Go na telefonie

## 2) Instalacja projektu

W katalogu repozytorium uruchom:

```bash
npm install
```

To polecenie instaluje zaleznosci frontendowe, w tym React Navigation oraz biblioteki wymagane przez Expo.

## 3) Uruchamianie aplikacji

### Tryb developerski (Expo)

```bash
npm run start
```

Nastepnie w konsoli Expo wybierz jedna z opcji:
- `a` - uruchom Android
- `i` - uruchom iOS (macOS)
- skan QR - uruchom na telefonie przez Expo Go

### Szybkie skroty z package.json

```bash
npm run android
npm run ios
```

## 4) Walidacja frontendu

### Testy jednostkowe frontendu

```bash
npm run test:frontend
```

Aktualny stan docelowy: 9 plikow testowych, 42 testy przechodza.

### Typecheck (kompilacja TS bez emitowania)

```bash
npx tsc --project tsconfig.json --noEmit
npx tsc --project tsconfig.test.json --noEmit
```

Oba polecenia powinny konczyc sie bez bledow.

## 5) Struktura frontendu (najwazniejsze katalogi)

- `src/frontend/application` - logika domenowa stanu (reducer + handlery)
- `src/frontend/services/types` - kontrakty API
- `src/frontend/services/mock` - mockowane serwisy in-memory
- `src/frontend/navigation` - nawigacja stack + tabs
- `src/frontend/screens` - ekrany podzielone na `auth`, `profile`, `social`, `tasks`
- `src/frontend/components/common` - komponenty wspolne
- `tests/frontend/unit` - testy jednostkowe warstwy frontendowej

## 6) Co jest zaimplementowane

- Pelna warstwa reducer + handlery dla use case'ow frontendowych
- Mock API services zgodne z interfejsami
- Pokrycie testowe kluczowych scenariuszy i edge case'ow
- Integracja nawigacji ekranow frontend/navigation do frontend/main

## 7) Istotne uwagi

- W testach moze pojawic sie ostrzezenie:
  - `The CJS build of Vite's Node API is deprecated`
  To ostrzezenie nie blokuje testow i nie powoduje faila.

- Po merge zaleznosci musza byc zawsze dociagniete lokalnie (`npm install`),
  w przeciwnym razie TypeScript zglosi brak modulow React Navigation.

- `npm audit` aktualnie raportuje podatnosci (moderate/high) po stronie zaleznosci transitive.
  Przed wydaniem produkcyjnym warto wykonac osobny sprint aktualizacji zaleznosci.

## 8) Najczestsze problemy i szybkie rozwiazania

1. Blad `Cannot find module '@react-navigation/...`:
   - uruchom `npm install`

2. Testy nie uruchamiaja sie:
   - sprawdz, czy jestes w katalogu repozytorium
   - uruchom ponownie `npm install`
   - uruchom `npm run test:frontend`

3. Aplikacja nie startuje w Expo:
   - usun cache Expo i uruchom ponownie:

```bash
npx expo start -c
```

## 9) Minimalny workflow przed push

```bash
npm install
npx tsc --project tsconfig.json --noEmit
npx tsc --project tsconfig.test.json --noEmit
npm run test:frontend
```

Dopiero po zielonych wynikach rob commit/push.
