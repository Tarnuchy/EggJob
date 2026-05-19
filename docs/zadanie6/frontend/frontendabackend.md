# Analiza backendu EggJob z perspektywy frontendu

## Context

Aplikacja EggJob to React Native (Expo) klient + FastAPI/SQLAlchemy serwer z bazą zarządzaną przez Alembic. Frontend ma 4 główne ekrany w bottom-tabach: **Home**, **Tasks**, **Friends**, **Profile**. Obecnie tylko ekran **Friends** (oraz `Auth` i `UserProfile`) ma realną implementację UI — pozostałe to placeholdery (`HomeScreen.tsx`, `TasksScreen.tsx`, `ProfileScreen.tsx`). Wszystkie serwisy frontendowe poza `AuthService` chodzą na mockach in-memory; HTTP klient jest podpięty tylko do `/auth/*`.

Celem dokumentu jest:
1. Spisać, co backend już dostarcza (endpointy + model danych),
2. Wskazać luki, które trzeba dospisać na backendzie, żeby frontend mógł zrealizować swoje strony,
3. Pokazać, co każdy z 4 głównych ekranów może zbudować już dziś vs. dopiero po dolepieniu brakujących endpointów.

Pliki kluczowe: [src/backend/main.py](src/backend/main.py), [src/backend/basics.py](src/backend/basics.py), [src/backend/models.py](src/backend/models.py), [src/backend/request.py](src/backend/request.py), [src/backend/response.py](src/backend/response.py), [src/frontend/services/](src/frontend/services/), [src/frontend/screens/](src/frontend/screens/).

---

## 1. Co backend już udostępnia

### 1.1 Endpointy mutujące — [src/backend/main.py](src/backend/main.py)

| Metoda + ścieżka | Request | Response | Zastosowanie |
|---|---|---|---|
| `POST /auth/register` ([main.py:105](src/backend/main.py#L105)) | `RegisterRequest` | `AuthResponse` | Rejestracja konta + utworzenie profilu |
| `POST /auth/login` ([main.py:130](src/backend/main.py#L130)) | `LoginRequest` | `AuthResponse` | Logowanie (zwraca `account_id`, `user_id`, dane profilu) |
| `POST /auth/password` ([main.py:149](src/backend/main.py#L149)) | `ChangePasswordRequest` | `MessageResponse` | Zmiana hasła |
| `POST /accounts/{account_id}/delete` ([main.py:172](src/backend/main.py#L172)) | `DeleteAccountRequest` | `MessageResponse` | Usuń konto (wymaga hasła) |
| `PATCH /users/{user_id}/profile` ([main.py:188](src/backend/main.py#L188)) | `UserProfileUpdateRequest` | `MessageResponse` | Edytuj username/photo_url |
| `POST /users/{user_id}/friends/invitations` ([main.py:204](src/backend/main.py#L204)) | `InviteFriendRequest` | `MessageResponse` | Wyślij zaproszenie do znajomości |
| `DELETE /friendships/{user_one_id}/{user_two_id}` ([main.py:278](src/backend/main.py#L278)) | — | `MessageResponse` | Zerwij znajomość |
| `POST /invitations/{from}/{to}/accept` ([main.py:310](src/backend/main.py#L310)) | — | `MessageResponse` | Akceptuj zaproszenie |
| `POST /invitations/{from}/{to}/reject` ([main.py:326](src/backend/main.py#L326)) | — | `MessageResponse` | Odrzuć zaproszenie |
| `POST /invitations/{from}/{to}/cancel` ([main.py:342](src/backend/main.py#L342)) | — | `MessageResponse` | Anuluj własne zaproszenie |
| `POST /users/{user_id}/notifications` ([main.py:220](src/backend/main.py#L220)) | `NotifyRequest` | `MessageResponse` | Utwórz powiadomienie |
| `POST /notifications/{notification_id}/read` ([main.py:358](src/backend/main.py#L358)) | — | `MessageResponse` | Oznacz powiadomienie jako odczytane |
| `POST /users/{user_id}/taskgroups` ([main.py:236](src/backend/main.py#L236)) | `CreateGroupRequest` | `TaskGroupResponse` | Utwórz grupę zadań |
| `PATCH /users/{user_id}/taskgroups/{group_id}` ([main.py:374](src/backend/main.py#L374)) | `TaskGroupEditRequest` | `MessageResponse` | Edytuj nazwę/privacy grupy |
| `DELETE /users/{user_id}/taskgroups/{group_id}` ([main.py:392](src/backend/main.py#L392)) | — | `MessageResponse` | Usuń grupę |
| `POST /users/{user_id}/taskgroups/{group_id}/type` ([main.py:431](src/backend/main.py#L431)) | `TaskGroupChangeTypeRequest` | `MessageResponse` | Przełącz typ grupy (competitive/cooperative) |
| `POST /users/{user_id}/taskgroups/{group_id}/members` ([main.py:408](src/backend/main.py#L408)) | `TaskGroupAddFriendRequest` | `MessageResponse` | Dodaj znajomego do grupy z rolą |
| `POST /users/{user_id}/groupmembers/{member_id}/role` ([main.py:565](src/backend/main.py#L565)) | `GroupMemberChangeRoleRequest` | `MessageResponse` | Zmień rolę członka |
| `POST /users/{user_id}/groupmembers/{member_id}/remove` ([main.py:588](src/backend/main.py#L588)) | `GroupMemberRemoveRequest` | `MessageResponse` | Wyrzuć członka (opcjonalnie z przejęciem progresu) |
| `POST /users/{user_id}/taskgroups/{group_id}/tasks` ([main.py:454](src/backend/main.py#L454)) | `TaskCreateRequest` | `TaskResponse` | Utwórz task w grupie |
| `PATCH /users/{user_id}/tasks/{task_id}` ([main.py:509](src/backend/main.py#L509)) | `TaskEditRequest` | `MessageResponse` | Edytuj nazwę/opis/cel taska |
| `DELETE /users/{user_id}/tasks/{task_id}` ([main.py:531](src/backend/main.py#L531)) | — | `MessageResponse` | Usuń task |
| `POST /users/{user_id}/tasks/{task_id}/type` ([main.py:547](src/backend/main.py#L547)) | `TaskChangeTypeRequest` | `MessageResponse` | Zmień typ taska (endless / one_time / repeatable / challenge) |
| `PATCH /task-params/{task_id}` ([main.py:637](src/backend/main.py#L637)) | `TaskParamsEditRequest` | `MessageResponse` | Edytuj wymóg foto / kolor / powiadomienia |
| `POST /users/{user_id}/task-progress/{progress_id}/update` ([main.py:609](src/backend/main.py#L609)) | `TaskProgressUpdateRequest` | `MessageResponse` | Dorzuć delta-progresu z wpisem + foto |
| `GET /progress-entries/{entry_id}/validate` ([main.py:658](src/backend/main.py#L658)) | — | `ProgressValidationResponse` | Sprawdź czy wpis spełnia wymóg foto |
| `DELETE /progress-entries/{entry_id}` ([main.py:664](src/backend/main.py#L664)) | — | `MessageResponse` | Cofnij wpis progresu |
| `POST /users/{user_id}/progress-entries/{entry_id}/comments` ([main.py:680](src/backend/main.py#L680)) | `ProgressEntryCommentRequest` | `MessageResponse` | Dodaj komentarz do wpisu |
| `DELETE /comments/{comment_id}` ([main.py:701](src/backend/main.py#L701)) | — | `MessageResponse` | Usuń komentarz |

### 1.2 Endpointy odczytowe — [src/backend/basics.py](src/backend/basics.py)

| Metoda + ścieżka | Response | Zastosowanie |
|---|---|---|
| `GET /users/{user_id}/friends` ([basics.py:51](src/backend/basics.py#L51)) | `FriendsListResponse` | Lista znajomych (z username + photo) |
| `GET /users/{user_id}/taskgroups` ([basics.py:74](src/backend/basics.py#L74)) | `TaskGroupListResponse` | Grupy zadań usera + jego rola w każdej |
| `GET /users/{user_id}/notifications` ([basics.py:107](src/backend/basics.py#L107)) | `NotificationListResponse` | Powiadomienia (DESC po dacie) |
| `GET /users/{user_id}/invitations/sent` ([basics.py:132](src/backend/basics.py#L132)) | `InvitationListResponse` | Wysłane zaproszenia |
| `GET /users/{user_id}/invitations/received` ([basics.py:153](src/backend/basics.py#L153)) | `InvitationListResponse` | Otrzymane zaproszenia |
| `GET /taskgroups/{group_id}/members` ([basics.py:174](src/backend/basics.py#L174)) | `GroupMemberListResponse` | Członkowie grupy |
| `GET /taskgroups/{group_id}/tasks` ([basics.py:202](src/backend/basics.py#L202)) | `TaskListResponse` | Taski w grupie |
| `GET /users/{user_id}/tasks` ([basics.py:226](src/backend/basics.py#L226)) | `TaskListResponse` | Taski, których user jest ownerem |
| `GET /tasks/{task_id}/progress` ([basics.py:250](src/backend/basics.py#L250)) | `TaskProgressListResponse` | Postępy wszystkich członków w danym task'u |
| `GET /tasks/{task_id}/progress-entries` ([basics.py:272](src/backend/basics.py#L272)) | `ProgressEntryListResponse` | Wpisy historii progresu (DESC) |
| `GET /progress-entries/{entry_id}/comments` ([basics.py:300](src/backend/basics.py#L300)) | `CommentListResponse` | Komentarze do wpisu |

### 1.3 Model danych — [src/backend/models.py](src/backend/models.py)

14 tabel + 6 enumów, schemat już zmigrowany w [alembic/versions/](alembic/versions/).

- **Konta i profile:** `Account` (email, hash hasła, data rejestracji) 1:1 `User` (username, photoUrl).
- **Społeczność:** `Friendship` (composite PK `userOneID + userTwoID`, `acceptedAt`), `Invitation` (composite PK `fromUserID + toUserID`, `date`), `Notification` (message, active, date).
- **Grupy zadań (joined-table inheritance):** `TaskGroup` → `CompetetiveTaskGroup` / `CooperativeTaskGroup`. Pola: `ownerID`, `name`, `taskCount`, `isBingo`, `privacy` (PRIVATE/PUBLIC), `inviteCode`, `createdAt`.
- **Członkowie grupy:** `GroupMember` (userID+groupID, `role` MEMBER/ADMIN/OWNER, `active`, `joinedAt`).
- **Taski (inheritance):** `Task` → `EndlessTask`, `OneTimeTask(deadline)`, `RepeatableTask(frequency: DAILY/WEEKLY/MONTHLY)`, `ChallengeTask(deadline)`. Plus 1:1 `TaskParams` (photoRequired, color hex, notifications).
- **Progres (inheritance):** `TaskProgress` (status TODO/IN_PROGRESS/DONE, `value`) → `EndlessTaskProgress`, `OneTimeTaskProgress`, `ChallengeTaskProgress`, `RepeatableTaskProgress(counter, streak)`.
- **Historia i komentarze:** `ProgressEntry` (value, message, photoUrl, createdAt), `Comment` (message, date).

### 1.4 Ważne nie-funkcjonalne

- **Brak warstwy autoryzacji.** `main.py` nie ma żadnego middleware'u JWT/sesji — wszystkie endpointy działają jak publiczne. Frontend trzyma token z `MockAuthService` lokalnie w `expo-secure-store`, ale backend tego tokenu nie sprawdza. Każdy ruch wymagający tożsamości używa `user_id` z path-param.
- **CORS otwarty na `*`** ([main.py:24-30](src/backend/main.py#L24-L30)).
- **Brak paginacji** w żadnym `GET` listingu (tylko `count + items`).
- **Brak wyszukiwania / filtrowania** po stronie serwera.
- **Brak storage'u plików** — `photo_url` to wolny string przekazywany przez klienta.

---

## 2. Co warto dospisać na backendzie

Posortowane po priorytecie dla frontendu (od najpilniejszego):

### 2.1 Czytanie pojedynczych zasobów (najtańsze, najbardziej brakuje)

- `GET /users/{user_id}` → `UserSummaryResponse` (dziś frontendowy `MockProfileService.getProfile` zwraca username+photo; nie ma odpowiednika w backendzie). Krytyczne dla ekranu **Profile** i **UserProfile** w trybie HTTP.
- `GET /taskgroups/{group_id}` → `TaskGroupResponse` (szczegóły grupy: nazwa, privacy, type, bingo, invite_code).
- `GET /tasks/{task_id}` → `TaskResponse` + dołączone `TaskParams` (szczegół taska na ekranie **Tasks**).
- `GET /task-params/{task_id}` → osobno, jeśli woli się je oddzielić.

### 2.2 Wyszukiwanie i odkrywanie

- `GET /users/search?q=...&exclude_user_id=...` → `FriendsListResponse`-podobne. Dziś `MockSocialService.searchUsers` filtruje lokalnie 6 seed-userów; do działającego "Add Friend" potrzebny jest endpoint na bazie `username ILIKE`.
- `GET /taskgroups/search?q=...&privacy=public` — opcjonalnie dla publicznych grup.
- `POST /taskgroups/join/{invite_code}` — dołącz do grupy po kodzie (model ma `inviteCode`, brak endpointu).

### 2.3 Agregaty na potrzeby ekranu Home

- `GET /users/{user_id}/feed` — aktywność znajomych (ostatnie `ProgressEntry` w grupach, do których user należy, + ostatnie komentarze). Bez tego ekran **Home** nie ma sensownej zawartości.
- `GET /users/{user_id}/stats` — liczba aktywnych tasków, ukończonych, aktualne streak'i z `RepeatableTaskProgress`, łączna liczba znajomych. Bazuje na danych już w modelu.
- `GET /users/{user_id}/upcoming` — taski z `deadline` w najbliższych 7 dniach (`OneTimeTask`, `ChallengeTask`).

### 2.4 Filtry, sortowanie, paginacja

- Dorzucić `?limit`, `?offset`, `?status=TODO|IN_PROGRESS|DONE` do `GET /taskgroups/{group_id}/tasks` i `GET /users/{user_id}/tasks`.
- `?since=<iso-date>` do `GET .../progress-entries` i `.../notifications` — frontend będzie chciał paginować feed i powiadomienia.

### 2.5 Higiena platformy

- **Autoryzacja:** klasyczne `POST /auth/login` powinno zwracać JWT, a wszystkie endpointy mutujące powinny czytać `Authorization: Bearer ...` i wyciągać `user_id` z tokenu, zamiast brać go z URL-a. Bez tego sekcje "moje" są podatne na trywialne IDOR-y.
- **Upload plików:** `POST /uploads` zwracający public URL — dziś frontend musiałby skądś wziąć URL do `photo_url`.
- **`GET /users/{user_id}/friendships/{other_user_id}/status`** lub osadzenie pola `relationship: friends|invited|none` w `UserSummaryResponse` — frontend na ekranie wyszukiwania musi wiedzieć, którego buttona pokazać (Invite / Accept / Already friends).

---

## 3. Co każdy z 4 głównych ekranów może wyświetlić DZIŚ

### 3.1 Home — [src/frontend/screens/tasks/HomeScreen.tsx](src/frontend/screens/tasks/HomeScreen.tsx)

**Dzisiaj:** placeholder, zero danych.

**Można od razu (na bazie istniejących endpointów):**
- "Twoje grupy" — z `GET /users/{user_id}/taskgroups` (nazwa, rola, liczba tasków, typ).
- "Twoje taski" — z `GET /users/{user_id}/tasks` (lista posiadanych tasków + ich typ).
- "Najnowsze powiadomienia (top 3-5)" — z `GET /users/{user_id}/notifications` posortowanego DESC.
- "Oczekujące zaproszenia do znajomości" — counter z `GET /users/{user_id}/invitations/received`.
- Bingo-szybkie taski: dla każdej grupy o `is_bingo=true` można złączyć `GET /taskgroups/{id}/tasks` z `GET /tasks/{id}/progress`, żeby pokazać postęp planszy.

### 3.2 Tasks — [src/frontend/screens/tasks/TasksScreen.tsx](src/frontend/screens/tasks/TasksScreen.tsx)

**Dzisiaj:** placeholder.

**Można od razu:**
- Widok "Moje grupy zadań" (`GET /users/{user_id}/taskgroups`) → drill-down do listy tasków (`GET /taskgroups/{group_id}/tasks`).
- Tworzenie grupy (`POST /users/{user_id}/taskgroups`) + edycja (`PATCH ...`) + usuwanie (`DELETE ...`).
- Tworzenie taska w grupie (`POST .../tasks`) z wyborem typu (endless/one_time/repeatable/challenge), edycja parametrów (`PATCH /task-params/{task_id}`).
- Widok progresu zespołowego (`GET /tasks/{task_id}/progress`) + historia wpisów (`GET /tasks/{task_id}/progress-entries`).
- Dodawanie delta-progresu z foto i komentarzem (`POST .../task-progress/{progress_id}/update`).
- Wątek dyskusji pod wpisem progresu (`GET /progress-entries/{entry_id}/comments` + `POST .../comments`).
- Zarządzanie członkami grupy (`GET /taskgroups/{group_id}/members`, role, remove).

### 3.3 Friends — [src/frontend/screens/social/FriendsScreen.tsx](src/frontend/screens/social/FriendsScreen.tsx)

**Dzisiaj (mock):** taby "My Friends", "Add Friend", "Invitations" z lokalnym seedem (alice, bob, …).

**Można od razu zamienić na HTTP:**
- "My Friends" — `GET /users/{user_id}/friends`.
- "Invitations" → "Received" (`GET .../invitations/received`) + "Sent" (`GET .../invitations/sent`). Akcje: accept/reject/cancel — wszystkie 3 endpointy są gotowe.
- Wysłanie zaproszenia — `POST /users/{user_id}/friends/invitations`.
- Zerwanie znajomości — `DELETE /friendships/{a}/{b}`.

### 3.4 Profile — [src/frontend/screens/profile/ProfileScreen.tsx](src/frontend/screens/profile/ProfileScreen.tsx)

**Dzisiaj:** placeholder.

**Można od razu:**
- Pokazanie danych z payloadu logowania (`AuthResponse`: email, username, photoUrl) trzymanego po `MockAuthService.login`.
- Edycja profilu (`PATCH /users/{user_id}/profile`).
- Zmiana hasła (`POST /auth/password`).
- Usuń konto (`POST /accounts/{account_id}/delete`).
- "Moje grupy" + "Moje taski" — te same listy co na Home (jako sekcje tożsamości).

---

## 4. Co każda strona powinna jeszcze wyświetlać i co trzeba dodać

### 4.1 Home — proponowany docelowy layout

Sekcje:
1. **Hero** "Cześć, {username}" + avatar — DZIŚ z `AuthResponse`.
2. **Today's tasks** — taski z deadline'em dziś + powtarzalne dzienne. **Wymaga:** `GET /users/{user_id}/upcoming?within=1d` (do dospisania, sekcja 2.3).
3. **Streaks** — `RepeatableTaskProgress.streak` per task. **Wymaga:** osadzenia pól `counter` i `streak` w `TaskProgressSummaryResponse` (dziś `value` i `status` — brak `streak`).
4. **Feed znajomych** — kto co zrobił. **Wymaga:** `GET /users/{user_id}/feed` (sekcja 2.3) lub klient agreguje przez N requestów (nieefektywne).
5. **Liczniki** (znajomi / aktywne taski / ukończone) — **wymaga** `GET /users/{user_id}/stats` lub klient liczy z listingów.
6. **CTA "Nowa grupa / nowy task"** — DZIŚ.

### 4.2 Tasks — proponowany docelowy layout

1. **Lista grup** z filtrem prywatności i typu — DZIŚ.
2. **Wewnątrz grupy:** zakładki "Tasks" / "Members" / "Activity" — DZIŚ.
3. **Szczegół taska:**
   - Nazwa, typ, cel, jednostka, postęp własny vs zespołowy — DZIŚ.
   - Wykres historii — DZIŚ z `progress-entries` (klient sam buduje sparkline).
   - Następny deadline / streak — **wymaga** rozszerzenia odpowiedzi (sekcja 2.1: `GET /tasks/{task_id}` z `deadline`, `frequency`, `streak`).
4. **Bingo board** — dla `is_bingo=true` mapowanie tasków na siatkę N×N. DZIŚ z `GET /taskgroups/{group_id}/tasks` (klient liczy układ).
5. **Filtry/sortowanie** (status, deadline, kolor). **Wymaga** parametrów query (sekcja 2.4) albo filtrowania po stronie klienta na małych zbiorach.
6. **Dołączanie do grupy po kodzie** — **wymaga** `POST /taskgroups/join/{invite_code}` (sekcja 2.2).

### 4.3 Friends — proponowany docelowy layout

1. Tabsy My Friends / Add Friend / Invitations — DZIŚ (już zaimplementowane na mockach, do podpięcia do HTTP).
2. **Wyszukiwanie userów** — **wymaga** `GET /users/search?q=...` (sekcja 2.2). Dziś frontend ma `searchUsers` tylko in-memory.
3. **Status relacji** w wynikach wyszukiwania (Invite / Pending / Friends) — **wymaga** rozszerzenia `UserSummaryResponse` o pole `relationship` lub osobnego endpointu (sekcja 2.5).
4. **Profil innego usera** ([UserProfileScreen.tsx](src/frontend/screens/social/UserProfileScreen.tsx)): publiczne grupy + ostatnia aktywność. **Wymaga:** `GET /users/{user_id}` (sekcja 2.1) + `GET /users/{user_id}/taskgroups?privacy=public` (sekcja 2.4).
5. **Powiadomienia o zaproszeniach** — DZIŚ z `GET /users/{user_id}/notifications` (model już generuje notyfikacje przy inwitach).

### 4.4 Profile — proponowany docelowy layout

1. **Header:** avatar, username, email, data rejestracji — DZIŚ (data rejestracji wymaga osadzenia w `AuthResponse` lub `GET /users/{user_id}` — sekcja 2.1).
2. **Edycja profilu** (username, photo) — DZIŚ. **Upload foto wymaga** `POST /uploads` (sekcja 2.5).
3. **Statystyki** (liczba grup, tasków, średni streak, ukończone) — **wymaga** `GET /users/{user_id}/stats` (sekcja 2.3).
4. **Lista moich grup i tasków** — DZIŚ.
5. **Bezpieczeństwo:** zmiana hasła, usuń konto — DZIŚ.
6. **Powiadomienia inbox** — DZIŚ (`GET /users/{user_id}/notifications` + `POST /notifications/{id}/read`). Frontend dorzuca tylko UI.
7. **Settings (powiadomienia push, język)** — czysto frontendowe.

---

## 5. Co wdrożyć w jakiej kolejności (rekomendacja)

1. **Backend — minimum dla Friends w trybie HTTP:**
   - `GET /users/{user_id}` (sekcja 2.1)
   - `GET /users/search?q=...` (sekcja 2.2)
   - Pole `relationship` w wynikach wyszukiwania (sekcja 2.5)
2. **Frontend — HTTP implementacja `ProfileService` i `SocialService`** (dziś tylko mocki). Reużycie mapperów z [src/frontend/services/http/mappers/](src/frontend/services/http/mappers/).
3. **Backend — endpointy szczegółowe i agregaty:** `GET /taskgroups/{group_id}`, `GET /tasks/{task_id}`, `GET /users/{user_id}/stats`, `GET /users/{user_id}/feed`.
4. **Frontend — HTTP impl `TaskService`, `TaskGroupService`, `NotificationService`** + budowa ekranów **Home**, **Tasks**, **Profile**.
5. **Higiena:** JWT na endpointach, upload plików, paginacja.

---

## 6. Plik weryfikacji (jak potwierdzić tę analizę)

- `uvicorn src.backend.main:app --reload` → otwórz `http://localhost:8000/docs` i sprawdź, że wszystkie 21 + 11 endpointów się ładuje (FastAPI generuje OpenAPI z dekoratorów + routera `basics`).
- `python -c "from src.backend.models import *; print([t.__tablename__ for t in [Account, User, Friendship, Invitation, Notification, TaskGroup, GroupMember, Task, TaskParams, TaskProgress, ProgressEntry, Comment]])"` — sanity check, że modele się importują.
- `alembic upgrade head` → potwierdzenie, że schema z `models.py` jest faktycznie w bazie.
- Frontend: `EXPO_PUBLIC_USE_HTTP_SERVICES=true npx expo start` — `AuthService` powinien uderzyć w `/auth/*`; pozostałe ekrany dalej chodzą na mockach do czasu, aż dospiszemy ich HTTP-warianty.

---

**Krótko:** backend pokrywa ok. 70% potrzeb (auth, znajomi, grupy, taski, progres, komentarze, notyfikacje, listingi). Najpilniejsze braki to: pojedyncze `GET` zasobów, wyszukiwanie userów, agregaty pod Home (feed/stats/upcoming), upload plików i prawdziwa autoryzacja. Frontend dziś realnie korzysta tylko z `/auth/*` — żeby ekrany Home/Tasks/Profile zaczęły coś robić, trzeba podpiąć istniejące HTTP do mocków `ProfileService`, `SocialService`, `TaskService`, `TaskGroupService`, `NotificationService`.
