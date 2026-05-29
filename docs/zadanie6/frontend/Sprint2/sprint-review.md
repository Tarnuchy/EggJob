# EggJob — Sprint Review #1
### Sprint Demo + Sprint Retrospective

---

## Informacje ogólne

| | |
|---|---|
| **Projekt** | EggJob — mobilna aplikacja do śledzenia postępów i celów |
| **Data** | Maj 2026 |
| **Zakres** | Cały dotychczasowy development (Sprint 1 → Sprint 3) |
| **Repozytorium** | github.com/[org]/EggJob |

---

# CZĘŚĆ 1 — SPRINT DEMO

## Czym jest EggJob?

EggJob to mobilna aplikacja (iOS/Android) pozwalająca użytkownikom śledzić postępy w codziennych zadaniach i celach — indywidualnie lub razem z innymi. Użytkownicy mogą tworzyć grupy zadań w trybie **współpracy** (wspólny cel) lub **rywalizacji** (kto wykona więcej), a postępami dzielić się ze znajomymi w spersonalizowanym feedzie aktywności.

**Technologia:** React Native + Expo (frontend), FastAPI + PostgreSQL (backend), TypeScript strict mode, Python 3.12.

---

## Zaimplementowane funkcje

### 1. Rejestracja i logowanie

Użytkownik może zarejestrować konto (e-mail + hasło) lub zalogować się do istniejącego. System waliduje dane po stronie frontend (format e-maila, siła hasła) i zwraca czytelne komunikaty błędów. Token JWT jest przechowywany bezpiecznie w zaszyfrowanym magazynie urządzenia (SecureStore), nie w plaintextowym AsyncStorage.

**Wartość dla użytkownika:** Szybkie wejście do aplikacji z pewnością, że dane logowania są bezpieczne.

---

### 2. Nawigacja — Custom Tab Bar i panele nakładkowe

Aplikacja posiada autorski pasek nawigacji z czterema zakładkami (Dom, Zadania, Znajomi, Profil) oraz centralnym przyciskiem FAB (floating action button) do szybkiego dodawania zadań. Panel ustawień i panel powiadomień wysuwają się jako nakładki z animacją 280 ms — bez utraty stanu ekranu i bez niepożądanych przebłysków.

**Wartość dla użytkownika:** Płynne, natywnie wyglądające przejścia; użytkownik nie traci kontekstu przy otwieraniu ustawień lub powiadomień.

---

### 3. Sekcja znajomych

Dedykowany ekran z trzema zakładkami:

- **Moi znajomi** — lista obecnych znajomych z awatarami i statusem
- **Dodaj znajomego** — wyszukiwarka użytkowników po nazwie, przycisk wysłania zaproszenia
- **Zaproszenia** — lista oczekujących zaproszeń z możliwością akceptacji lub odrzucenia

**Wartość dla użytkownika:** Budowanie sieci znajomych wewnątrz aplikacji, co jest punktem wyjścia do trybu rywalizacji i współpracy w grupach zadań.

---

### 4. Profil użytkownika

Ekran profilu wyświetla awatar, nazwę użytkownika oraz statystyki:

- Liczba ukończonych zadań
- Liczba grup, do których należy użytkownik
- Liczba znajomych

Profil można edytować (zmiana nazwy użytkownika, URL awatara). Widok cudzego profilu pokazuje dodatkowo status relacji (znajomy / oczekujące zaproszenie / nieznajomy) i feed aktywności danego użytkownika.

**Wartość dla użytkownika:** Wgląd we własne postępy i możliwość oceny zaangażowania znajomych przed zaproszeniem ich do wspólnej grupy.

---

### 5. Powiadomienia

Panel powiadomień wyświetla listę zdarzeń (zaproszenia, aktywność znajomych, aktualizacje grup) z datą względną („przed chwilą", „2 godz. temu"). Użytkownik może oznaczyć pojedyncze powiadomienie jako przeczytane lub wyczyścić wszystkie jednym przyciskiem. Ikona w TopBar wyświetla badge z liczbą nieprzeczytanych.

**Wartość dla użytkownika:** Zawsze wiadomo, co nowego dzieje się wśród znajomych, bez konieczności ręcznego sprawdzania każdego ekranu.

---

### 6. Wielojęzyczność (EN / PL)

W ustawieniach użytkownik wybiera język aplikacji. Zmiana działa natychmiastowo — bez restartu. Cały interfejs (etykiety, komunikaty błędów, daty względne) przełącza się do wybranego języka. Wybór jest zapamiętywany między sesjami.

**Wartość dla użytkownika:** Dostępność w ojczystym języku zwiększa komfort i zmniejsza barierę wejścia.

---

## Zadania techniczne (nie widoczne w UI, ale istotne)

Poniższe prace nie dają się bezpośrednio zaprezentować, ale stanowią fundament wszystkich powyższych funkcji i każdej przyszłej iteracji.

| Obszar | Co zostało zrobione |
|---|---|
| **Model domenowy** | 18 klas (Task, TaskGroup, Progress, Friendship, Invitation, Notification…) z dziedziczeniem i wzorcami Strategy/Template Method |
| **Backend REST API** | 43 endpointy FastAPI (auth, profil, grupy zadań, zadania, postęp, komentarze, znajomi, zaproszenia) |
| **Baza danych** | PostgreSQL + SQLAlchemy 2.0 async, Alembic migrations, relacje 1:N i M:N |
| **State management** | Redux-like reducer z discriminated union actions — type-safe, testowalny, bez `any` |
| **Design system** | Tokeny semantyczne: kolory, typografia, spacing, animacje — spójny wygląd bez powtarzania wartości |
| **Testy jednostkowe (TDD)** | 42 testy (Vitest) — wszystkie zielone; napisane przed implementacją; pokrywają 32 przypadki użycia |
| **Audyt jakości kodu** | 54 znalezione i zaadresowane problemy (Sprint 2.5): type safety, re-rendery, error handling, accessibility, bezpieczeństwo JWT |
| **Tooling** | ESLint + Prettier + Husky + lint-staged — jakość wymuszana przy każdym commicie |
| **CI/CD** | GitHub Actions na każdym PR, deploy frontend na Vercel, backend na Railway |

---

# CZĘŚĆ 2 — SPRINT RETROSPECTIVE

## Co wyszło dobrze ✅

**Podejście TDD (Test-Driven Development)**
Napisanie 42 testów przed implementacją okazało się bardzo skuteczne — testy wielokrotnie wyłapywały błędy logiki biznesowej zanim trafiły do UI. Wszystkie 42 testy są zielone. Dało nam to pewność przy refaktoryzacjach w Sprint 2.5.

**Design system od pierwszego commita**
Zdefiniowanie tokenów kolorów, typografii i spacingu na początku projektu oszczędziło wiele czasu później. Każdy nowy ekran korzysta z tych samych wartości — spójność wizualna praktycznie za darmo.

**Audyt jakości kodu (Sprint 2.5)**
Zdecydowanie się na iterację dedykowaną wyłącznie jakości — bez nowych features — pozwoliło wyeliminować 54 problemy techniczne, zanim rozbudowaliśmy aplikację dalej. Gdybyśmy tego nie zrobili, każdy kolejny sprint budowałby na niestabilnym fundamencie.

**Service Container (DI pattern)**
Wzorzec Dependency Injection dla serwisów pozwolił na kompletny, działający frontend ze stuprocentowymi mock services, niezależnie od stanu backendu. Prace frontendowe i backendowe mogły biec równolegle bez blokowania.

**Discriminated union actions**
Przejście na typowane akcje reducera eliminuje całą klasę błędów (złe `type`, brak pola w `payload`) w czasie kompilacji — nie w runtime. Po migracji kod jest znacznie czytelniejszy.

---

## Co nie wyszło / co sprawiło problemy ✗

**Nawigacja — pięć nieudanych iteracji**
Próba osiągnięcia płynnych animacji dla panelu ustawień i powiadomień za pomocą natywnego stack navigatora zakończyła się niepowodzeniem po pięciu iteracjach. Ostatecznie konieczna była zmiana całej architektury nawigacji na overlay panels. Straciliśmy na tym czas, który można było zaoszczędzić, gdyby decyzja architektoniczna była podjęta wcześniej.

**Dług techniczny odkryty późno**
54 problemy jakościowe wykryte w Sprint 2.5 to dług, który narastał przez Sprint 1 i Sprint 2. Część z nich (np. `any` w typach, plaintext JWT) powinna być zablokowana wcześniej przez code review lub pre-commit hooki — które wtedy jeszcze nie istniały.

**Opóźnienie z mergem `frontend/profiles`**
Kompletna implementacja profili i powiadomień przez pewien czas czekała na code review zamiast trafić na `main`. Problem z przepustowością przeglądu kodu spowalniał dostępność funkcji dla reszty zespołu.

**Integracja frontend–backend**
Backend ma 43 endpointy, frontend ma ServiceContainer gotowy do podpięcia — ale HttpServices nie zostały jeszcze napisane. Przez cały Sprint 3 frontend pracuje wyłącznie na mock danych. Brak tej integracji to największe ryzyko dla milestone'u produkcyjnego.

**Koordynacja w zespole**
Kilka razy zdarzało się, że prace na różnych branchach tworzyły konflikty lub dublowały implementację tego samego komponentu. Niewystarczająca komunikacja o tym, kto nad czym aktualnie pracuje.

---

## Co poprawić w kolejnym sprincie 🔧

**1. Code review jako warunek konieczny przed mergem**
Żaden branch nie trafia na `main` bez zatwierdzonego review od co najmniej jednej osoby. Wprowadzamy branch protection rule — żeby sytuacja z opóźnionym przeglądem kodu się nie powtórzyła.

**2. Integracja HTTP jako priorytet #1**
Sprint 4 zaczyna się od podłączenia wszystkich istniejących MockServices do prawdziwego backend API. Bez tego nie można testować end-to-end ani wdrożyć działającej wersji aplikacji.

**3. Definicja DoD (Definition of Done)**
Przed startem każdego zadania ustalamy, co znaczy „skończone": testy przechodzą, lint 0 errorów, code review zatwierdzone, feature widoczny na `main`. Zadanie na branchu bez merge'a nie jest skończone.

**4. Daily check-in (async)**
Krótki dzienny status (Slack/komentarz w PR): co skończyłem, co robię, czy jest bloker. Eliminuje sytuacje, gdzie dwie osoby implementują ten sam komponent niezależnie.

**5. Architektoniczne decyzje na początku, nie w środku**
Przed implementacją nowego obszaru (np. nawigacja) — krótka sesja decyzyjna: jakie podejście, jakie trade-offy, co może pójść źle. Koszt 30 minut na początku vs. kilka dni pracy do wyrzucenia.

---

## Podsumowanie

| | |
|---|---|
| **Zaimplementowanych funkcji** | 6 (auth, nawigacja, znajomi, profil, powiadomienia, i18n) |
| **Endpointów backend** | 43 |
| **Testów jednostkowych** | 42 / 42 zielonych |
| **Problemów jakościowych zaadresowanych** | 54 / 54 |
| **Zmergowanych PR** | 8 |
| **Klas domenowych** | 18 (frontend) + 20+ (backend ORM) |

Projekt ma solidny fundament architektoniczny i kompletny backend API. Głównym wyzwaniem następnego sprintu jest zamknięcie pętli: podłączenie frontendu do backendu i dostarczenie pierwszej wersji aplikacji działającej end-to-end na prawdziwej bazie danych.
