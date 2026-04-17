# 🥚 Ekosystem Testowy EggJob - Opis Środowiska (conftest.py)

## 1. Użytkownicy i Relacje Społeczne (Podstawa)
Mamy 4 zdefiniowanych użytkowników (`user_A`, `user_B`, `user_C`, `user_D`), z których każdy ma odpowiadające mu konto (`Account`) z zahashowanym hasłem.
*   **Znajomości (Friendships):**
    *   A przyjaźni się z B (`friendship_ab`).
    *   B przyjaźni się z C (`friendship_bc`).
*   **Interakcje oczekujące:**
    *   B wysłał zaproszenie do znajomych do C (istnieje obiekt `Invitation` oraz przypisane do niego powiadomienie `Notification` dla usera C).
*   **Co tu testujemy:** Logowanie, usuwanie kont, akceptację/odrzucanie zaproszeń, oznaczanie powiadomień jako przeczytane, relacje asymetryczne (brak przyjaźni A z C, chociaż oboje znają B).

---

## 2. Grupa 1: "Shopping List" (Lista Zakupów)
**Typ:** `CooperativeTaskGroup` (Jeden wspólny pasek progresu, prywatna).
**Skład:**
*   `user_A` – **OWNER**
*   `user_B` – **MEMBER**
*   `user_D` – **GHOST MEMBER** (Użytkownik opuścił grupę lub został z niej wyrzucony – `active=False`).

**Zadania w grupie (Wszystkie typu `OneTimeTask`):**

1.  **"eggs" (Status: `IN_PROGRESS`)**
    *   **Autor:** OWNER (`user_A`). Cel: 20, Progres: 10.
    *   **Ciekawostka:** Wpis progresu (+10) dodał... **GHOST** (`user_D`) z wiadomością *"bylo tylko 10 jaj"*. OWNER skomentował ten wpis agresywnie (*"aha to wypierdalaj"*).
    *   **Co tu testujemy:** Zabezpieczenia – czy GHOST powinien w ogóle móc dodawać `ProgressEntry`? Walidacja uprawnień i ewentualne ukrywanie usuniętych użytkowników. Moderacja wulgarnych komentarzy przez OWNERA.

2.  **"milk" (Status: `TODO`)**
    *   **Autor:** OWNER (`user_A`). Cel: 2, Progres: 0.
    *   **Ciekawostka:** Puste zadanie bez postępów i komentarzy.
    *   **Co tu testujemy:** Przypadki bazowe (happy path), początkowy stan tasków, przejście z `TODO` na `IN_PROGRESS`.

3.  **"bread" (Status: `DONE`)**
    *   **Autor:** MEMBER (`user_B`). Cel: 1, Progres: 1.
    *   **Ciekawostka:** Postęp nabił autor. Pojawiają się podziękowania od OWNERA (`user_A`) i pytanie o gluten od GHOSTA (`user_D`).
    *   **Co tu testujemy:** Standardowe wykonanie zadania. Dodatkowo – widoczność/zapis komentarzy dla osób o różnym statusie (`active`).

4.  **"cheese" (Status: `DONE` – Z overcompletion!)**
    *   **Autor:** GHOST (`user_D`!). Cel: 3, Obliczony Progres: 4.
    *   **Ciekawostka:** Mamy tu tzw. przepełnienie zadania (OVERCOMPLETION). Cel wynosi 3, ale OWNER dorzucił 2 sery Gouda, a MEMBER dorzucił 2 sery Cheddar. Do tego GHOST krytykuje Goudę w komentarzu, a MEMBER jej broni.
    *   **Co tu testujemy:** Bardzo ważny logiczny EDGE CASE. Co robi aplikacja, gdy ktoś dodaje `value`, które przekracza `goal`? Czy tnie do 3 na poziomie backendu, czy zostawia 4 w tabeli? Kto przejmuje paczkę w obliczeniach? Zadanie zostało pierwotnie utworzone przez osobę, która nie jest już aktywna.

---

## 3. Grupa 2: "EGG EATING CHALLENGE" (Zawody w jedzeniu)
**Typ:** `CompetetiveTaskGroup` (Każdy ma WŁASNY pasek progresu, publiczna `PrivacyLevel.PUBLIC`).
**Skład:**
*   `user_B` – **OWNER**
*   `user_C` – **ADMIN**

**Zadanie w grupie:**
1.  **"eating eggs" (Typ: `ChallengeTask` | Status: `IN_PROGRESS`)**
    *   **Wymagania (`TaskParams`):** `photoRequired=True`, włączone powiadomienia. Posiada twardy `deadline`.
    *   **Zapis progresu OWNERA (`user_B`):** Ma nabite 67 punktów. Dwa kosmiczne wpisy: ugotowane 12 jaj oraz 55 jaj naraz. Oba posiadają URL ze zdjęciem.
    *   **Zapis progresu ADMINA (`user_C`):** Nabite 13 punktów z dużo bardziej realistycznymi wpisami (po 2, 3, 4 ugotowane jaja), każdy udokumentowany mniejszym zdjęciem (photoUrl).
    *   **Komentarze:** Użytkownik `user_A` (który **NIE JEST** członkiem tej grupy) dodaje komentarz chwalący OWNERA. Admin (`user_C`) oskarża Ownera o oszukiwanie na czacie wpisu, a Owner się broni.
    *   **Co tu testujemy:**
        *   Odizolowanie postępów: Sprawdzenie, czy tabele `TaskProgress` i `ProgressEntry` na pewno powiązane są z odpowiednimi ID użytkowników (nie wchodzą sobie w paradę).
        *   **Prywatność PUBLIC:** Testowanie, czy z racji, że grupa jest publiczna, `user_A` (osoba spoza niej) miał pełne prawo przeglądać i komentować wpis `user_B`.
        *   Walidację obowiązkowego obrazka (`photoUrl` nie może być null w endpointach modyfikujących to zadanie).

---

## 4. Grupa 3: "BINGO 2026"
**Typ:** `CooperativeTaskGroup` (Prywatność: PUBLIC).
**Skład:**
*   `user_B` – **OWNER** (Jedyna osoba w grupie w tej chwili).

**Zadania w grupie (Bogaty wachlarz mechanik):**

1.  **"have over 1000 USD on my account" (Typ: `EndlessTask`)**
    *   **Progres:** Obecnie 700 / 1000.
    *   **Ciekawostka:** Są w nim trzy wpisy: +800 (wypłata), +400 (kieszonkowe) oraz **-500 (wydane na "rick owens")**. Spoza grupy wyśmiewa ten zakup `user_A` przypisując, że to fake.
    *   **Co tu testujemy:** Mechanizm odejmowania wartości! Niezwykle rzadko spotykany, a krytyczny w testach – baza bez problemu przyjmuje `-500` jako postęp. Czy pole `value` w ProgressEntry pozwala na liczby ujemne i czy kalkulacje progresu aktualizują się poprawnie (w górę i w dół statusów z `DONE` na `IN_PROGRESS`).

2.  **"3 days running streak" (Typ: `RepeatableTask` - DAILY)**
    *   **Progres:** Streak 2, ogólnie biegów 3.
    *   **Ciekawostka:** Ustawiono trzy wpisy z różnymi datami, aby sprawdzić, czy streak dzieli dni według oczekiwań. `user_C` (spoza grupy) komentuje krytycznie, że to "performative".
    *   **Co tu testujemy:** Logikę przeliczania częstotliwości dni (DAILY string) i algorytm zerujący poślizgi w streaku (np. czy dodanie biegu n-dni za późno zbije `streak` do 1, ale podbije `counter`?).

3.  **"workout 3 times" (Typ: `OneTimeTask` - zmodyfikowany pod cel makro)**
    *   **Progres:** Cel to 3, obecna zgłoszona wartość to 2.
    *   **Ciekawostka:** Normalne, rzetelne zadanie. Dwa proste wejścia +1 z różnymi datami.
    *   **Co tu testujemy:** Dobry wzorzec testowy do upewnienia się, że standardowe dodawanie mniejszych bloków postępu sumuje się właściwie do dużego goal'a. Brak komentarzy do sprawdzania logiki zapytań o pustą tablicę asocjacyjną.

4.  **"become president" (Typ: `OneTimeTask`)**
    *   **Progres:** 0 / 1. Brak wpisów postępu.
    *   **Ciekawostka:** Posiada specyficzne parametry: `photoRequired=True`, `color="gold"`, włączone notyfikacje.
    *   **Co tu testujemy:** Sytuację ekstremalną (boolowską w swej naturze), gdzie aby ukończyć misję, użytkownik musi przesłać po prostu jeden postęp równy celowi wespół z obowiązkowym zdjęciem (dowodem).

---

### Jak z tego korzystać przy pisaniu testów? (Krótkie wskazówki)
Zarządzanie tym systemem odbywa się znakomicie poprzez tzw. "Bundle" (Słowniki zbierające instancje). Dzięki `shoppingList_bundle`, `eggChallenge_bundle` i `bingo_bundle`:

*   Jeśli chcesz sprawdzić akcje zablokowane dla ex-członków grupy: wyciągasz `bundle["GM"]["ghost"]` z koszyka.
*   Jeśli chcesz przetestować wgrywanie zdjęć: wyciągasz `bundle["tasks"]["eating"]` albo `"president"`.
*   Jeśli testujesz przeliczanie matematyczne `Progress`: odpytujesz o `"money"` i dodajesz kolejny wpis `ProgressEntry` na `-200`.
