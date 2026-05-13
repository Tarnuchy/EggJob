# EggJob Frontend - Runbook

Ten dokument opisuje jak uruchomic frontend, jak zweryfikowac jego poprawne dzialanie oraz na co uwazac przy dalszym rozwoju.

## 1) Wymagania

- Node.js 18 LTS lub 20 LTS
- npm 9+
- Expo SDK 54 (instalowane z package.json)
- Dla urzadzen mobilnych:
  - Android Studio (emulator Android)
  - Xcode (symulator iOS, tylko macOS)
- Opcjonalnie: aplikacja Expo Go na telefonie

## 2) Instalacja projektu

W katalogu repozytorium uruchom:

```bash
npm install
```

## 3) Uruchamianie aplikacji

```bash
npm run start
npm run android
npm run ios
```

## 4) Walidacja frontendu

```bash
npm run lint        # ESLint
npm run format:check
npm run typecheck   # tsc --noEmit
npm test            # vitest 42/42
```

Pre-commit (husky + lint-staged) automatycznie odpala `eslint --fix` i `prettier --write` na staged plikach.

## 5) Struktura frontendu

```
src/frontend/
  application/
    actions.ts            # discriminated union AppAction
    AppStateContext.tsx   # Provider, useMemo + dispatch zwraca ReducerResult
    reducer.ts
    state.ts              # eksportowane typy domain (Account, User, Task, ...)
    selectors.ts
    helpers/cascade.ts    # cascadeDeleteTask, cascadeDeleteGroup
    handlers/             # 7 handlerow per domena
  components/
    auth/                 # AuthBackground, AuthTabSwitcher
    common/               # AppButton, AppInput, AppText, Spacer, ErrorBoundary, LoadingIndicator
    layout/               # ScreenContainer, TopBar, PlaceholderScreen
  hooks/                  # useAppNavigation, useAuthFormAnimation, useButtonAnimation
  i18n/                   # strings.ts - keyed copy
  navigation/             # AppNavigator, MainTabs, types
  screens/
    auth/                 # AuthScreen (shell) + LoginForm + RegisterForm + hooks/
    profile/ social/ tasks/   # placeholder screens
    ErrorScreen.tsx
  services/
    ServiceContainer.ts   # HTTP vs Mock per env
    http/                 # HttpAuthService, AuthTokenStorage, mappers
    mock/                 # MockAuthService, MockTaskService, ...
    types/
  theme/                  # colors, typography, shadows, animations, spacing
  utils/                  # validation, authValidation, mapReducerError
```

## 6) Tooling

- **ESLint** 8 + `@typescript-eslint` + `react-hooks/exhaustive-deps`
- **Prettier** 3 (2 spaces, trailing comma, single quotes)
- **Husky** 9 + **lint-staged** dla pre-commit
- **EditorConfig**
- **TypeScript** strict + `noUnusedLocals` + `noUnusedParameters` + path alias `@/*`

## 7) State management

- `useAppState()` zwraca `{ state, dispatch }`. `dispatch(action)` zwraca `ReducerResult` (`{ ok: true, value }` lub `{ ok: false, error }`).
- Wszystkie akcje przez `AppAction` (discriminated union) - TypeScript narrowing eliminuje runtime cast'y.
- Cascade deletes uzywaja `helpers/cascade.ts`.
- Bledy reducer'a mapowane przez `utils/mapReducerError.ts` na komunikaty z `i18n/strings.ts`.

## 8) i18n

Wszystkie teksty UI w `src/frontend/i18n/strings.ts`. Helper `t()` zostanie wprowadzony w Sprint 4 (i18next).

## 9) Accessibility

Interaktywne komponenty (`AppButton`, `AppInput`, `TopBar` icons, `AuthTabSwitcher`) maja `accessibilityRole`, `accessibilityLabel` i `accessibilityState`.

## 10) Service container

`process.env.EXPO_PUBLIC_USE_HTTP_SERVICES === 'true'` przelacza `authService` na `HttpAuthService` (token w `expo-secure-store`). Reszta serwisow nadal idzie do Mock - HTTP impl powstanie w Sprint 3.

## 11) Minimalny workflow przed push

```bash
npm install
npm run lint
npm run typecheck
npm test
```

Husky pre-commit zrobi to automatycznie na staged plikach.
