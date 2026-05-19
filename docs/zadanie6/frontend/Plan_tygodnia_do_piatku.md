# Sprint 2 - Frontend Plan (do piatku)

## Kontekst (stan na start)

- Warstwa logiki jest gotowa: reducer + handlery + mock services.
- Testy frontendowe logiki przechodza: 42/42.
- Warstwa ekranow jest glownie placeholderowa i wymaga podpiecia pod serwisy oraz reducer.
- Styl UI byl niespojny kolorystycznie (hardcode), zgodnie z konceptem ma byc oparty o brazowa palete.

## Cel tego tygodnia (wt-piat)

Dowiezc klikalny MVP frontendu dla glownego flow:
- auth,
- znajomi,
- grupy,
- taski + progress,
- profil,
z zachowaniem spojnej kolorystyki i minimalnymi testami regresji.

## Priorytety i taski

Legenda priorytetu:
- P0: krytyczne, blokuje pozostale
- P1: wysokie
- P2: mile widziane, ale nieblokujace

### T2-FE-01 (P0) - Design tokens + brazowa paleta
- Zakres:
  - dodanie centralnej palety kolorow,
  - usuniecie hardcode kolorow w komponentach wspolnych i nawigacji.
- Pliki:
  - src/frontend/theme/colors.ts
  - src/frontend/components/common/*
  - src/frontend/navigation/*
  - src/frontend/screens/*
- Status: DONE
- DoD:
  - brak niebieskich/pink hardcodow,
  - paleta zgodna z ColorPalette.jpg,
  - testy frontend: green.

### T2-FE-02 (P0) - App state bridge (UI <-> reducer)
- Owner: Ty
- Estymacja: 4-6h
- Zakres:
  - utworzenie prostego provider/hooka do trzymania FrontendState,
  - helper dispatchAction z obsluga ReducerResult,
  - mapowanie bledow domenowych na komunikaty dla UI.
- Proponowane pliki:
  - src/frontend/application/state-context.tsx
  - src/frontend/application/useFrontendState.ts
- DoD:
  - kazdy ekran ma dostep do currentUserId/currentAccountId,
  - ekran moze wykonac akcje reducera i odczytac blad.

### T2-FE-03 (P0) - Auth screen end-to-end na mock service
- Owner: Kolega
- Estymacja: 4-5h
- Zakres:
  - LoginScreen/RegisterScreen: walidacja, loading, error,
  - podpiecie authService.register/login + sync do reducera,
  - poprawna nawigacja po sukcesie i po logout.
- Pliki:
  - src/frontend/screens/auth/LoginScreen.tsx
  - src/frontend/screens/auth/RegisterScreen.tsx
  - src/frontend/screens/profile/SettingsScreen.tsx (logout)
- DoD:
  - poprawne scenariusze UC-01/UC-02,
  - walidacyjne komunikaty bledow,
  - brak crashy przy blednych danych.

### T2-FE-04 (P1) - Friends flow
- Owner: Ty
- Estymacja: 5-7h
- Zakres:
  - FriendsScreen: lista znajomych,
  - zakladka/panel zaproszen,
  - akcje invite/accept/reject/remove przez socialService + reducer.
- Pliki:
  - src/frontend/screens/social/FriendsScreen.tsx
  - src/frontend/components/common/* (np. itemy listy)
- DoD:
  - pokryte UC-05..UC-11 na poziomie UI flow,
  - aktualizacja list bez restartu aplikacji.

### T2-FE-05 (P1) - Task list + create/edit + progress
- Owner: Kolega
- Estymacja: 6-8h
- Zakres:
  - TasksScreen: lista taskow,
  - formularz create/edit,
  - dodawanie progress entry.
- Pliki:
  - src/frontend/screens/tasks/TasksScreen.tsx
  - src/frontend/screens/tasks/HomeScreen.tsx
- DoD:
  - pokryte flow UC-28, UC-29, UC-30, UC-32,
  - walidacje (goal, value >= 0) i czytelne bledy.

### T2-FE-06 (P1) - Group entrypoint
- Owner: Ty + Kolega (pair)
- Estymacja: 3-4h
- Zakres:
  - HomeScreen: karta grupy + utworzenie grupy,
  - dolaczenie/uzycie inviteCode (minimum UI + walidacja).
- DoD:
  - mozna utworzyc grupe i zobaczyc jej podstawowe dane,
  - flow nie blokuje pracy nad taskami.

### T2-FE-07 (P2) - Profile edit + delete account guard
- Owner: Kolega
- Estymacja: 3-4h
- Zakres:
  - ProfileScreen: edycja username/photoUrl,
  - SettingsScreen: guardowany flow delete account (confirm).
- DoD:
  - dziala UC-03/UC-04 w wersji MVP,
  - po delete user wraca do auth flow.

### T2-FE-08 (P2) - Regression tests for UI state adapters
- Owner: Ty
- Estymacja: 2-3h
- Zakres:
  - testy adapterow i helperow akcji,
  - testy mapowania bledow domenowych na komunikaty UI.
- Pliki:
  - tests/frontend/unit/services/
  - tests/frontend/unit/auth/
  - tests/frontend/unit/social/
- DoD:
  - nowe testy przechodza,
  - brak regresji na obecnych 42 testach.

## Plan dzienny (wt-piat)

## Wtorek
- DONE: T2-FE-01
- Start: T2-FE-02 (state bridge)
- Start: T2-FE-03 (auth integration)

## Sroda
- Finish: T2-FE-02, T2-FE-03
- Start: T2-FE-04 (friends)
- Start: T2-FE-05 (tasks)

## Czwartek
- Finish: T2-FE-04, T2-FE-05
- Start: T2-FE-06 (groups entrypoint)
- Start: T2-FE-07 (profile/settings)

## Piatek
- Finish: T2-FE-06, T2-FE-07
- Execute: T2-FE-08 (regression tests)
- Stabilizacja + bugfixing + przygotowanie PR

## Kryteria konca tygodnia

- Dzialajace flow: auth, friends, tasks, profile (MVP).
- Spolna paleta kolorow z konceptem frontendowym.
- Testy frontend green.
- Brak krytycznych bugow blokujacych demo sprintowe.
