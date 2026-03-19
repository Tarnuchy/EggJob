# **UC-01: Zakładanie konta użytkownika**

### **Aktorzy:**
Użytkownik
<br>
### **Warunki początkowe:**
1. Urządzenie posiada zainstalowaną aplikację
2. Urządzenie posiada łącze z internetem
3. Użytkownik nie jest zalogowany
<br>
### **Scenariusz główny:**
1. Użytkownik otwiera aplikację
2. System wyświetla ekran logowania
3. Użytkownik wybiera opcję [ZAREJESTRUJ SIĘ]
4. System wyświetla formularz rejestracji
5. Użytkownik wprowadza wymagane dane i zatwierdza formularz
6. System sprawdza poprawność danych (np. format adresu email, unikalność nazwy użytkownika, siłę hasła)
7. System tworzy nowe konto użytkownika
8. System automatycznie loguje użytkownika i wyświetla ekran powitalny
<br>
### **Warunki końcowe:**
Nowe konto zostało utworzone, użytkownik został zalogowany i ma możliwość korzystania z aplikacji

### **Scenariusze alternatywne:**
**6a. Użytkownik podał niepoprawne dane:**
* System blokuje finalizację rejestracji
* System wyświetla odpowiedni komunikat
* Powrót do kroku 5

**6b. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-02: Logowanie użytkownika**

### **Aktorzy:**
Użytkownik

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik posiada założone konto **[UC-01]**
3. Użytkownik nie jest zalogowany

### **Scenariusz główny:**
1. Użytkownik otwiera aplikację
2. System wyświetla ekran logowania
3. Użytkownik wybiera opcję [ZALOGUJ SIĘ]
4. System wyświetla formularz logowania
5. Użytkownik wprowadza wymagane dane i zatwierdza formularz
6. System sprawdza poprawność danych (np. istnienie użytkownika o podanej nazwie, poprawność hasła)
7. System loguje użytkownika i wyświetla ekran powitalny

### **Warunki końcowe:**
Użytkownik został zalogowany i ma możliwość korzystania z aplikacji

### **Scenariusze alternatywne:**
**6a. Użytkownik podał niepoprawne dane:**
* System blokuje finalizację logowania
* System wyświetla odpowiedni komunikat
* Powrót do kroku 5

**6b. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-03: Edycja profilu użytkownika**

### **Aktorzy:**
Użytkownik

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik jest zalogowany **[UC-02]**

### **Scenariusz główny:**
1. Użytkownik przechodzi do sekcji [PROFIL]
2. System wyświetla aktualne dane użytkownika
3. Użytkownik wybiera opcję [EDYTUJ]
4. System wyświetla formularz edycji profilu
5. Użytkownik ma możliwość edycji wybranych elementów profilu, np. hasło do konta, zdjęcie profilowe
6. Użytkownik zatwierdza wprowadzenie zmian
7. System sprawdza poprawność danych (np. siła nowego hasła, poprawność dotychczasowego hasła, poprawność formatu zdjęcia)
8. System wprowadza zmiany
9. System wyświetla komunikat o pomyślnym wprowadzeniu zmian
10. System przenosi użytkownika do odświeżonego widoku profilu

### **Warunki końcowe:**
Dane profilowe użytkownika zostały zaktualizowane w systemie

### **Scenariusze alternatywne:**
**6a. Użytkownik rezygnuje z akcji:**
* Użytkownik wybiera opcję [ANULUJ]
* System zamyka tryb edycji bez wprowadzania zmian

**7a. Użytkownik podał niepoprawne dane:**
* System blokuje finalizację edycji profilu
* System wyświetla odpowiedni komunikat
* Powrót do kroku 5

**7b. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-04: Usunięcie konta użytkownika**

### **Aktorzy:**
Użytkownik

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik jest zalogowany **[UC-02]**

### **Scenariusz główny:**
1. Użytkownik otwiera formularz edycji profilu **[UC-03]**
2. Użytkownik wybiera opcję [USUŃ KONTO]
3. System wyświetla komunikat o nieodwracalności tego procesu oraz wymaga podania hasła przez użytkownika
4. Użytkownik wprowadza hasło i zatwierdza chęć usunięcia konta
5. System sprawdza poprawność hasła
6. System usuwa konto użytkownika
7. System wyświetla komunikat o pomyślnym usunięciu konta i wylogowuje użytkownika
8. System przenosi użytkownika do ekranu logowania

### **Warunki końcowe:**
Konto użytkownika zostało usunięte, nie ma możliwości zalogowania do niego

### **Scenariusze alternatywne:**
**4a. Użytkownik rezygnuje z akcji:**
* Użytkownik wybiera opcję [ANULUJ]
* System powraca do formularza edycji profilu bez wprowadzania zmian

**5a. Użytkownik podał niepoprawne dane:**
* System blokuje finalizację usunięcia konta
* System wyświetla odpowiedni komunikat
* Powrót do kroku 4

**6b. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-05: Wyświetlanie oczekujących zaproszeń do znajomych**

### **Aktorzy:**
Użytkownik

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik jest zalogowany **[UC-02]**

### **Scenariusz główny:**
1. Użytkownik przechodzi do sekcji [ZNAJOMI]
2. System wyświetla aktualną listę znajomych
3. Użytkownik wybiera zakładkę [ZAPROSZENIA]
4. System wyświetla listę oczekujących zaproszeń

### **Warunki końcowe:**
Lista oczekujących do znajomych zaproszeń została wyświetlona. Użytkownik ma teraz możliwość zarządzania zaproszeniami

### **Scenariusze alternatywne:**
**4a. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-06: Wysyłanie zaproszenia do znajomych**

### **Aktorzy:**
Użytkownik zapraszający
Użytkownik zapraszany

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Obaj użytkownicy posiadają założone konto **[UC-01]**
3. Użytkownik zapraszający jest zalogowany **[UC-02]**
4. Użytkownik zapraszający zna nazwę użytkownika zapraszanego

### **Scenariusz główny:**
1. Użytkownik wyświetla listę oczekujących zaproszeń do znajomych **[UC-05]**
2. Użytkownik wybiera opcję [DODAJ ZNAJOMEGO]
3. System wyświetla pole do wpisania nazwy użytkownika
4. Użytkownik wprowadza nazwę użytkownika zapraszanego i zatwierdza chęć wysłania zaproszenia
5. System sprawdza istnienie danego użytkownika
6. System wysyła zaproszenie do użytkownika zapraszanego
7. System wyświetla komunikat o pomyślnym wysłaniu zaproszenia
8. System dodaje zaproszenie do zakładki [ZAPROSZENIA]

### **Warunki końcowe:**
Zaproszenie do znajomych zostało wysłane i może zostać obsłużone przez zapraszającego oraz zapraszanego

### **Scenariusze alternatywne:**
**4a. Użytkownik rezygnuje z akcji:**
* Użytkownik wybiera opcję [ANULUJ]
* System powraca do widoku listy znajomych bez wprowadzania zmian

**5a. Użytkownik podał niepoprawne dane:**
* System blokuje finalizację wysłania zaproszenia
* System wyświetla odpowiedni komunikat
* Powrót do kroku 5

**5b. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-07: Wycofanie zaproszenia do znajomych**

### **Aktorzy:**
Użytkownik zapraszający

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik zapraszający jest zalogowany **[UC-02]**
3. Użytkownik zapraszający wysłał zaproszenie do znajomych **[UC-06]**
4. Wysłane zaproszenie nie zostało jeszcze obsłużone

### **Scenariusz główny:**
1. Użytkownik wyświetla listę oczekujących zaproszeń do znajomych **[UC-05]**
2. Użytkownik wybiera zaproszenie, które chce wycofać
3. Użytkownik wybiera opcję [WYCOFAJ ZAPROSZENIE]
4. System wyświetla komunikat wymagający potwierdzenie wycofania zaproszenia
5. Użytkownik wybiera opcję [ZATWIERDŹ]
6. System wycofuje zaproszenie
7. System wyświetla komunikat o pomyślnym wycofaniu zaproszenia
8. System odświeża widok oczekujących zaproszeń

### **Warunki końcowe:**
Zaproszenie do znajomych zostało wycofane i przestaje być widoczne oraz możliwe do obsłużenia

### **Scenariusze alternatywne:**
**5a. Użytkownik rezygnuje z akcji:**
* Użytkownik wybiera opcję [ANULUJ]
* System powraca do widoku oczekujących zaproszeń bez wprowadzania zmian

**6a. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-08: Przyjęcie zaproszenia do znajomych**

### **Aktorzy:**
Użytkownik zapraszany
Użytkownik zapraszający

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik zapraszany jest zalogowany **[UC-02]**
3. Użytkownik zapraszający wysłał zaproszenie do znajomych **[UC-06]**
4. Wysłane zaproszenie nie zostało jeszcze obsłużone

### **Scenariusz główny:**
1. Użytkownik wyświetla listę oczekujących zaproszeń do znajomych **[UC-05]**
2. Użytkownik widzi zaproszenie i wybiera opcję [PRZYJMIJ]
3. System przyjmuje zaproszenie
4. System wyświetla komunikat o pomyślnym przyjęciu zaproszenia
5. System odświeża widok listy oczekujących zaproszeń

### **Warunki końcowe:**
Zaproszenie do znajomych zostało przyjęte, użytkownicy widzą swoje profile na listach znajomych oraz mają dostęp do widoku swoich profili

### **Scenariusze alternatywne:**
**3a. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-09: Odrzucenie zaproszenia do znajomych**

### **Aktorzy:**
Użytkownik zapraszany
Użytkownik zapraszający

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik zapraszany jest zalogowany **[UC-02]**
3. Użytkownik zapraszający wysłał zaproszenie do znajomych **[UC-06]**
4. Wysłane zaproszenie nie zostało jeszcze obsłużone

### **Scenariusz główny:**
1. Użytkownik wyświetla listę oczekujących zaproszeń do znajomych **[UC-05]**
2. Użytkownik widzi zaproszenie i wybiera opcję [ODRZUĆ]
3. System wyświetla komunikat wymagający potwierdzenie odrzucenia zaproszenia
4. Użytkownik wybiera opcję [ZATWIERDŹ]
5. System odrzuca zaproszenie
6. System wyświetla komunikat o pomyślnym odrzuceniu zaproszenia
7. System odświeża widok listy oczekujących zaproszeń

### **Warunki końcowe:**
Zaproszenie do znajomych zostało odrzucone i przestaje być widoczne oraz możliwe do obsłużenia

### **Scenariusze alternatywne:**
**4a. Użytkownik rezygnuje z akcji:**
* Użytkownik wybiera opcję [ANULUJ]
* System powraca do widoku oczekujących zaproszeń bez wprowadzania zmian

**5a. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-10: Wyświetlanie profilu znajomego**

### **Aktorzy:**
Użytkownik oglądający
Użytkownik oglądany

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik oglądający jest zalogowany **[UC-02]**
3. Użytkownicy są znajomymi **[UC-06]**, **[UC-08]**

### **Scenariusz główny:**
1. Użytkownik przechodzi do sekcji [ZNAJOMI]
2. System wyświetla aktualną listę znajomych
3. Użytkownik wybiera profil znajomego, którego profil chce wyświetlić
4. System wyświetla widok profilu znajomego
5. Użytkownik widzi profil znajomego

### **Warunki końcowe:**
Użytkownik oglądający ma możliwość oglądania profilu swojego znajomego, w tym jego publicznych danych oraz publicznych grup tasków

### **Scenariusze alternatywne:**
**4a. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-11: Usunięcie znajomego**

### **Aktorzy:**
Użytkownik usuwający
Użytkownik usuwany

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik usuwający jest zalogowany **[UC-02]**
3. Użytkownicy są znajomymi **[UC-06]**, **[UC-08]**

### **Scenariusz główny:**
1. Użytkownik usuwający wyświetla profil znajomego, którego chce usunąć ze swojej listy **[UC-10]**
2. Użytkownik usuwający wybiera opcję [USUŃ ZNAJOMEGO]
3. System wyświetla komunikat wymagający potwierdzenie usunięcia znajomego
4. Użytkownik wybiera opcję [ZATWIERDŹ]
5. System usuwa znajomego
6. System wyświetla komunikat o pomyślnym usunięciu znajomego
7. System przenosi użytkownika do sekcji [ZNAJOMI]

### **Warunki końcowe:**
Znajomy został usunięty z listy usuwającego oraz usuwanego. Użytkownicy nie mają dostępu do wyświetlania swoich profili **[UC-10]**, do momentu ponownego zostania znajomymi **[UC-06]**, **[UC-08]**

### **Scenariusze alternatywne:**
**4a. Użytkownik rezygnuje z akcji:**
* Użytkownik wybiera opcję [ANULUJ]
* System powraca do widoku profilu znajomego bez wprowadzania zmian

**5a. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-12: Tworzenie grupy tasków**

### **Aktorzy:**
Użytkownik

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik jest zalogowany **[UC-02]**

### **Scenariusz główny:**
1. Użytkownik przechodzi do sekcji [TASKI]
2. System wyświetla listę grup tasków dostępnych dla użytkownika
3. Użytkownik wybiera opcję [DODAJ GRUPĘ TASKÓW]
4. System wyświetla formularz tworzenia i konfiguracji grupy
5. Użytkownik ma możliwość wybrania jednego z gotowych schematów grup lub własnej konfiguracji grupy wedle preferencji
6. Użytkownik wybiera m.in. nazwę, ustawienia prywatności, format wyświetlania itp.
7. Użytkownik zatwierdza utworzenie grupy tasków
8. System sprawdza poprawność danych (np. czy została podana nazwa)
9. System tworzy grupę tasków
10. System wyświetla informację o pomyślnym utworzeniu grupy
11. System przenosi użytkownika ponownie do sekcji [TASKI]

### **Warunki końcowe:**
Grupa tasków została utworzona, jest widoczna w liście grup tasków dostępnych dla użytkownika

### **Scenariusze alternatywne:**
**7a. Użytkownik rezygnuje z akcji:**
* Użytkownik wybiera opcję [ANULUJ]
* System powraca do widoku listy grup tasków bez wprowadzania zmian

**8a. Użytkownik podał niepoprawne dane:**
* System blokuje finalizację utworzenia grupy
* System wyświetla odpowiedni komunikat
* Powrót do kroku 6

**9a. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-13: Wyświetlanie grupy tasków**

### **Aktorzy:**
Użytkownik

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik jest zalogowany **[UC-02]**
3. Użytkownik posiada dostęp do grupy tasków **[UC-12]**, **[UC-17]**, **[UC-20]**, **[UC-22]**, **[UC-24]**

### **Scenariusz główny:**
1. Użytkownik przechodzi do sekcji [TASKI]
2. System wyświetla listę grup tasków dostępnych dla użytkownika
3. Użytkownik wybiera grupę tasków, którą chce wyświetlić
4. System przenosi użytkownika do widoku grupy tasków
5. Użytkownik widzi listę tasków znajdujących się w grupie tasków, wyświetlaną w odpowiednm formacie

### **Warunki końcowe:**
Grupa tasków została wyświetlona. Użytkownik ma teraz możliwość zarządzania grupą tasków oraz znajdujących się w niej taskami

### **Scenariusze alternatywne:**
**4a. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-14: Edycja grupy tasków**

### **Aktorzy:**
Użytkownik

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik jest zalogowany **[UC-02]**
3. Użytkownik posiada utworzoną grupę tasków **[UC-12]**

### **Scenariusz główny:**
1. Użytkownik wyświetla grupę tasków, którą chce edytować **[UC-13]**
2. Użytkownik wybiera opcję [EDYTUJ GRUPĘ TASKÓW]
3. System wyświetla formularz edycji grupy tasków
4. Użytkownik ma możliwość edycji wybranych parametrów grupy tasków, m.in. nazwa, prywatność, dostęp innych użytkowników, itp.
5. Użytkownik zatwierdza wprowadzenie zmian
6. System sprawdza poprawność danych (np. czy nie została podana pusta nazwa)
7. System wprowadza zmiany
8. System wyświetla informację o pomyślnym wprowadzeniu zmian
9. System odświeża widok grupy tasków

### **Warunki końcowe:**
Grupa tasków została zmodyfikowana

### **Scenariusze alternatywne:**
**5a. Użytkownik rezygnuje z akcji:**
* Użytkownik wybiera opcję [ANULUJ]
* System powraca do widoku grupy tasków bez wprowadzania zmian

**6a. Użytkownik podał niepoprawne dane:**
* System blokuje finalizację edycji grupy
* System wyświetla odpowiedni komunikat
* Powrót do kroku 4

**7a. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-15: Usunięcie grupy tasków**

### **Aktorzy:**
Użytkownik

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik jest zalogowany **[UC-02]**
3. Użytkownik posiada utworzoną grupę tasków **[UC-12]**

### **Scenariusz główny:**
1. Użytkownik otwiera formularz edycji wybranej grupy tasków **[UC-14]**
2. Użytkownik wybiera opcję [USUŃ GRUPĘ TASKÓW]
3. System wyświetla komunikat o nieodwracalności tej akcji oraz wymaga jej potwierdzenia
4. Użytkownik zatwierdza chęć usunięcia grupy
5. System usuwa grupę tasków wraz z zawartymi w niej taskami
6. System wyświetla informację o pomyślnym usunięciu grupy tasków
7. System przenosi użytkownika ponownie do sekcji [TASKI]

### **Warunki końcowe:**
Grupa tasków została usunięta. Nie ma możliwości jej wyświetlania lub modyfikowania

### **Scenariusze alternatywne:**
**4a. Użytkownik rezygnuje z usunięcia grupy:**
* Użytkownik wybiera opcję [ANULUJ]
* System powraca do formularza edycji grupy bez wprowadzania zmian

**5a. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-16: Wyświetlanie oczekujących zaproszeń do grup tasków**

### **Aktorzy:**
Użytkownik

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik jest zalogowany **[UC-02]**

### **Scenariusz główny:**
1. Użytkownik przechodzi do sekcji [TASKI]
2. System wyświetla listę grup tasków dostępnych dla użytkownika
3. Użytkownik wybiera zakładkę [ZAPROSZENIA]
4. System przenosi użytkownika do widoku oczekujących zaproszeń
5. Użytkownik widzi listę oczekujących zaproszeń oraz próśb o dołączenie do grup tasków

### **Warunki końcowe:**
Lista oczekujących zaproszeń została wyświetlona. Użytkownik ma teraz możliwość zarządzania zaproszeniami oraz prośbami o dołączenie

### **Scenariusze alternatywne:**
**4a. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-17: Przekazanie kodu zaproszenia do grupy tasków innemu użytkownikowi**

### **Aktorzy:**
Użytkownik zapraszający
Użytkownik zapraszany

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik zapraszający jest zalogowany **[UC-02]**
3. Użytkownik zapraszający posiada utworzoną grupę tasków **[UC-12]**
4. Użytkownicy mają możliwość komunikacji poza aplikacją

### **Scenariusz główny:**
1. Użytkownik zapraszający otwiera formularz edycji wybranej grupy tasków **[UC-14]**
2. Użytkownik wybiera sekcję [DOSTĘP UŻYTKOWNIKÓW]
3. System wyświetla informacje o dostępie użytkowników
4. Użytkownik widzi kod zaproszenia do grupy tasków
5. Użytkownik kopiuje kod i przekazuje go znajomemu poza aplikacją

### **Warunki końcowe:**
Użytkownik zapraszany posiada kod zaproszenia i może użyć go do wysłania prośby o dołączenie do grupy użytkowniku zapraszającemu

### **Scenariusze alternatywne:**
**3a. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-18: Wysłanie prośby o dołączenie do grupy poprzez kod zaproszenia**

### **Aktorzy:**
Użytkownik zapraszany
Użytkownik zapraszający

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik zapraszany jest zalogowany **[UC-02]**
3. Użytkownik zapraszający posiada utworzoną grupę tasków **[UC-12]**
4. Użytkownik zapraszany posiada kod grupy **[UC-17]**

### **Scenariusz główny:**
1. Użytkownik wyświetla listę oczekujących zaproszeń do grup tasków **[UC-16]**
2. Użytkownik wybiera opcję [DOŁĄCZ DO GRUPY TASKÓW]
3. System wyświetla pole do wpisania kodu zaproszenia
4. Użytkownik wpisuje kod zaproszenia
5. Użytkownik zatwierdza chęć wysłania prośby o dołączenie
6. System sprawdza poprawność kodu
7. System wysyła prośbę o dołączenie do użytkownika zapraszającego
8. System wyświetla informację o pomyślnym wysłaniu prośby
9. System odświeża widok oczekujących zaproszeń

### **Warunki końcowe:**
Użytkownik zapraszający otrzymał prośbę o dołączenie do grupy użytkownika zapraszanego. Obaj użytkownicy mogą zarządzać prośbą

### **Scenariusze alternatywne:**
**5a. Użytkownik rezygnuje z akcji:**
* Użytkownik wybiera opcję [ANULUJ]
* System powraca do widoku oczekujących zaproszeń bez wprowadzania zmian

**6a. Użytkownik podał niepoprawny kod:**
* System blokuje finalizację wysłania prośby
* System wyświetla odpowiedni komunikat
* Powrót do kroku 4

**7a. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-19: Wycofanie prośby o dołączenie do grupy tasków**

### **Aktorzy:**
Użytkownik zapraszany
Użytkownik zapraszający

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik zapraszany jest zalogowany **[UC-02]**
3. Użytkownik zapraszany wysłał prośbę o dołączenie do grupy tasków **[UC-18]**
4. Wysłana prośba nie została jeszcze obsłużona

### **Scenariusz główny:**
1. Użytkownik wyświetla listę oczekujących zaproszeń do grup tasków **[UC-16]**
2. Użytkownik wybiera prośbę, którą chce wycofać
3. Użytkownik wybiera opcję [WYCOFAJ PROŚBĘ]
4. System wyświetla komunikat wymagający potwierdzenie wycofania prośby
5. Użytkownik wybiera opcję [ZATWIERDŹ]
6. System wycofuje prośbę
7. System wyświetla komunikat o pomyślnym wycofaniu prośby
8. System odświeża widok oczekujących zaproszeń

### **Warunki końcowe:**
Prośba o dołączenie do grupy tasków została wycofana i przestaje być widoczna oraz możliwa do obsłużenia

### **Scenariusze alternatywne:**
**5a. Użytkownik rezygnuje z akcji:**
* Użytkownik wybiera opcję [ANULUJ]
* System powraca do widoku oczekujących zaproszeń bez wprowadzania zmian

**6a. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-20: Zaakceptowanie prośby o dołączenie do grupy tasków**

### **Aktorzy:**
Użytkownik zapraszający
Użytkownik zapraszany

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik zapraszający jest zalogowany **[UC-02]**
3. Użytkownik zapraszany wysłał prośbę o dołączenie do grupy tasków **[UC-18]**
4. Wysłana prośba nie została jeszcze obsłużona

### **Scenariusz główny:**
1. Użytkownik wyświetla listę oczekujących zaproszeń do grup tasków **[UC-16]**
2. Użytkownik wybiera prośbę, którą chce zaakceptować
3. Użytkownik wybiera opcję [ZAAKCEPTUJ PROŚBĘ]
4. System wyświetla okienko wyboru uprawnień użytkownika zapraszanego
5. Użytkownik wybiera uprawnienia, które chce nadać użytkownikowi zapraszanemu (wyświetlanie/uzupełnianie)
6. Użytkownik wybiera opcję [ZATWIERDŹ]
7. System akceptuje prośbę
8. System wyświetla komunikat o pomyślnym zaakceptowaniu prośby
9. System odświeża widok oczekujących zaproszeń

### **Warunki końcowe:**
Prośba o dołączenie do grupy tasków została zaakceptowana. Użytkownik zapraszany ma dostęp do grupy tasków, w zależności od nadanych mu uprawnień

### **Scenariusze alternatywne:**
**6a. Użytkownik rezygnuje z akcji:**
* Użytkownik wybiera opcję [ANULUJ]
* System powraca do widoku oczekujących zaproszeń bez wprowadzania zmian

**7a. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-21: Odrzucenie prośby o dołączenie do grupy tasków**

### **Aktorzy:**
Użytkownik zapraszający
Użytkownik zapraszany

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik zapraszający jest zalogowany **[UC-02]**
3. Użytkownik zapraszany wysłał prośbę o dołączenie do grupy tasków **[UC-18]**
4. Wysłana prośba nie została jeszcze obsłużona

### **Scenariusz główny:**
1. Użytkownik wyświetla listę oczekujących zaproszeń do grup tasków **[UC-16]**
2. Użytkownik wybiera prośbę, którą chce odrzucić
3. Użytkownik wybiera opcję [ODRZUĆ PROŚBĘ]
4. System wyświetla komunikat wymagający potwierdzenie odrzucenia prośby
5. Użytkownik wybiera opcję [ZATWIERDŹ]
6. System odrzuca prośbę
7. System wyświetla komunikat o pomyślnym odrzuceniu prośby
8. System odświeża widok oczekujących zaproszeń

### **Warunki końcowe:**
Prośba o dołączenie do grupy tasków została odrzucona i przestaje być widoczna oraz możliwa do obsłużenia

### **Scenariusze alternatywne:**
**5a. Użytkownik rezygnuje z akcji:**
* Użytkownik wybiera opcję [ANULUJ]
* System powraca do widoku oczekujących zaproszeń bez wprowadzania zmian

**6a. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-22: Wysłanie zaproszenia do grupy tasków znajomemu**

### **Aktorzy:**
Użytkownik zapraszający
Użytkownik zapraszany

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik zapraszający jest zalogowany **[UC-02]**
3. Użytkownik zapraszający posiada utworzoną grupę tasków **[UC-12]**
4. Użytkownicy są znajomymi **[UC-06]**, **[UC-08]**

### **Scenariusz główny:**
1. Użytkownik zapraszający wyświetla formularz edycji grupy tasków, do której chce zaprosić znajomego **[UC-14]**
2. Użytkownik w formularzu edycji wybiera sekcję [DOSTĘP UŻYTKOWNIKÓW]
3. System wyświetla listę użytkowników mających dostęp do grupy tasków, wraz z ich uprawnieniami
4. Użytkownik wybiera opcję [DODAJ ZNAJOMEGO]
5. System wyświetla listę znajomych
6. Użytkownik wybiera znajomego, którego chce zaprosić
7. System wyświetla okno wyboru uprawnień użytkownika zapraszanego
8. Użytkownik wybiera uprawnienia, które chce nadać użytkownikowi zapraszanemu (wyświetlanie/uzupełnianie)
9. Użytkownik wybiera opcję [ZATWIERDŹ]
10. System wysyła zaproszenie do grupy tasków znajomemu
11. System wyświetla komunikat o pomyślnym wysłaniu zaproszenia
12. System odświeża widok dostępu użytkowników

### **Warunki końcowe:**
Użytkownik zapraszany otrzymał zaproszenie do grupy tasków. Obaj użytkownicy mogą zarządzać zaproszeniem

### **Scenariusze alternatywne:**
**9a. Użytkownik rezygnuje z akcji:**
* Użytkownik wybiera opcję [anuluj]
* System powraca do widoku edycji grupy tasków bez wprowadzania zmian

**10a. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-23: Wycofanie zaproszenia do grupy tasków**

### **Aktorzy:**
Użytkownik zapraszający
Użytkownik zapraszany

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik zapraszający jest zalogowany **[UC-02]**
3. Użytkownik zapraszający wysłał zaproszenie do grupy tasków znajomemu **[UC-22]**
4. Wysłane zaproszenie nie zostało jeszcze obsłużone

### **Scenariusz główny:**
1. Użytkownik wyświetla listę oczekujących zaproszeń do grup tasków **[UC-16]**
2. Użytkownik wybiera zaproszenie, którą chce wycofać
3. Użytkownik wybiera opcję [WYCOFAJ ZAPROSZENIE]
4. System wyświetla komunikat wymagający potwierdzenie wycofania zaproszenia
5. Użytkownik wybiera opcję [ZATWIERDŹ]
6. System wycofuje zaproszenie
7. System wyświetla komunikat o pomyślnym wycofaniu zaproszenia
8. System odświeża widok oczekujących zaproszeń

### **Warunki końcowe:**
Zaproszenie do grupy tasków zostało wycofane i przestaje być widoczne oraz możliwe do obsłużenia

### **Scenariusze alternatywne:**
**5a. Użytkownik rezygnuje z akcji:**
* Użytkownik wybiera opcję [ANULUJ]
* System powraca do widoku oczekujących zaproszeń bez wprowadzania zmian

**6a. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-24: Przyjęcie zaproszenia do grupy tasków**

### **Aktorzy:**
Użytkownik zapraszany
Użytkownik zapraszający

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik zapraszany jest zalogowany **[UC-02]**
3. Użytkownik zapraszający wysłał zaproszenie do grupy tasków znajomemu **[UC-22]**
4. Wysłane zaproszenie nie zostało jeszcze obsłużone

### **Scenariusz główny:**
1. Użytkownik wyświetla listę oczekujących zaproszeń do grup tasków **[UC-16]**
2. Użytkownik wybiera zaproszenie, które chce przyjąć
3. Użytkownik wybiera opcję [PRZYJMIJ ZAPROSZENIE]
4. System przyjmuje zaproszenie
5. System wyświetla komunikat o pomyślnym przyjęciu zaproszenia
6. System odświeża widok oczekujących zaproszeń

### **Warunki końcowe:**
Zaproszenie do grupy tasków zostało przyjęte. Użytkownik zapraszany ma dostęp do grupy tasków, w zależności od nadanych mu uprawnień

### **Scenariusze alternatywne:**
**3a. Użytkownik rezygnuje z akcji:**
* Użytkownik wybiera opcję [ANULUJ]
* System powraca do widoku oczekujących zaproszeń bez wprowadzania zmian

**4a. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-25: Odrzucenie zaproszenia do grupy tasków**

### **Aktorzy:**
Użytkownik zapraszany
Użytkownik zapraszający

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik zapraszany jest zalogowany **[UC-02]**
3. Użytkownik zapraszający wysłał zaproszenie do grupy tasków znajomemu **[UC-22]**
4. Wysłane zaproszenie nie zostało jeszcze obsłużone

### **Scenariusz główny:**
1. Użytkownik wyświetla listę oczekujących zaproszeń do grup tasków **[UC-16]**
2. Użytkownik wybiera zaproszenie, które chce odrzucić
3. Użytkownik wybiera opcję [ODRZUĆ ZAPROSZENIE]
4. System wyświetla komunikat wymagający potwierdzenie odrzucenia zaproszenia
5. Użytkownik wybiera opcję [ZATWIERDŹ]
6. System odrzuca zaproszenie
7. System wyświetla komunikat o pomyślnym odrzuceniu zaproszenia
8. System odświeża widok oczekujących zaproszeń

### **Warunki końcowe:**
Zaproszenie do grupy tasków zostało odrzucone i przestaje być widoczne oraz możliwe do obsłużenia

### **Scenariusze alternatywne:**
**5a. Użytkownik rezygnuje z akcji:**
* Użytkownik wybiera opcję [ANULUJ]
* System powraca do widoku oczekujących zaproszeń bez wprowadzania zmian

**6a. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-26: Usunięcie użytkownika z grupy tasków**

### **Aktorzy:**
Użytkownik usuwający (właściciel grupy)
Użytkownik usuwany

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik usuwający jest zalogowany **[UC-02]**
3. Użytkownik usuwany został dodany do grupy tasków użytkownika usuwającego **[UC-18]**, **[UC-20]**, **[UC-22]**, **[UC-24]**

### **Scenariusz główny:**
1. Użytkownik usuwający otwiera formularz edycji wybranej grupy tasków **[UC-14]**
2. Użytkownik wybiera sekcję [DOSTĘP UŻYTKOWNIKÓW]
3. System wyświetla informacje o dostępie użytkowników
4. Użytkownik wybiera użytkownika, którego chce usunąć z grupy tasków
5. Użytkownik wybiera opcję [USUŃ UŻYTKOWNIKA]
6. System wyświetla komunikat wymagający potwierdzenie usunięcia użytkownika z grupy
7. Użytkownik wybiera opcję [ZATWIERDŹ]
8. System usuwa użytkownika z grupy tasków
9. System wyświetla komunikat o pomyślnym usunięciu użytkownika
10. System odświeża widok dostępu użytkowników

### **Warunki końcowe:**
Użytkownik został usunięty z grupy tasków i nie ma do niej dostępu do momentu ponownego dodania go **[UC-18]**, **[UC-20]**, **[UC-22]**, **[UC-24]**

### **Scenariusze alternatywne:**
**7a. Użytkownik rezygnuje z akcji:**
* Użytkownik wybiera opcję [ANULUJ]
* System powraca do widoku oczekujących zaproszeń bez wprowadzania zmian

**8a. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-27: Opuszczenie grupy tasków**

### **Aktorzy:**
Użytkownik opuszczający
Użytkownik opuszczany (właściciel grupy)

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik opuszczający jest zalogowany **[UC-02]**
3. Użytkownik opuszczający został dodany do grupy tasków użytkownika opuszczanego **[UC-18]**, **[UC-20]**, **[UC-22]**, **[UC-24]**

### **Scenariusz główny:**
1. Użytkownik opuszczający otwiera formularz edycji wybranej grupy tasków **[UC-14]**
2. Użytkownik wybiera opcję [OPUŚĆ GRUPĘ TASKÓW]
3. System wyświetla komunikat wymagający potwierdzenie opuszczenia grupy
4. Użytkownik wybiera opcję [ZATWIERDŹ]
5. System usuwa użytkownika z grupy tasków
6. System wyświetla komunikat o pomyślnym opuszczeniu grupy tasków
7. System przenosi użytkownika do sekcji [TASKI]

### **Warunki końcowe:**
Użytkownik opuścił grupę tasków i nie ma do niej dostępu do momentu ponownego dodania do niej **[UC-18]**, **[UC-20]**, **[UC-22]**, **[UC-24]**

### **Scenariusze alternatywne:**
**4a. Użytkownik rezygnuje z akcji:**
* Użytkownik wybiera opcję [ANULUJ]
* System powraca do widoku oczekujących zaproszeń bez wprowadzania zmian

**5a. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-28: Tworzenie taska**

### **Aktorzy:**
Użytkownik

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik jest zalogowany **[UC-02]**
3. Użytkownik posiada dostęp do grupy tasków **[UC-12]**, **[UC-18]**, **[UC-20]**, **[UC-22]**, **[UC-24]**

### **Scenariusz główny:**
1. Użytkownik wyświetla grupę tasków, w której chce utworzyć taska **[UC-13]**
2. Użytkownik wybiera opcję [DODAJ TASKA]
3. System wyświetla formularz tworzenia i konfiguracji taska
4. Użytkownik ma możliwość konfiguracji taska wedle preferencji
5. Użytkownik wybiera m.in. nazwę, powtarzalność, cel, kamienie milowe, konieczność dodawania zdjęcia przy uzupełnianiu postępu, inne wymagania
6. Użytkownik zatwierdza utworzenie taska
7. System sprawdza poprawność danych (np. czy została podana nazwa)
8. System tworzy taska
9. System wyświetla informację o pomyślnym utworzeniu taska
10. System odświeża widok grupy tasków

### **Warunki końcowe:**
Task został utworzony i jest dostępny w widoku grupy tasków, w której się znajduje

### **Scenariusze alternatywne:**
**6a. Użytkownik rezygnuje z akcji:**
* Użytkownik wybiera opcję [ANULUJ]
* System powraca do widoku grupy tasków bez wprowadzania zmian

**7a. Użytkownik podał niepoprawne dane:**
* System blokuje finalizację utworzenia grupy
* System wyświetla odpowiedni komunikat
* Powrót do kroku 5

**8a. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-29: Wyświetlanie taska**

### **Aktorzy:**
Użytkownik

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik jest zalogowany **[UC-02]**
3. Użytkownik posiada dostęp do grupy tasków **[UC-12]**, **[UC-18]**, **[UC-20]**, **[UC-22]**, **[UC-24]**
4. Użytkownik posiada dostęp do utworzonego taska **[UC-28]**, **[UC-18]**, **[UC-20]**, **[UC-22]**, **[UC-24]**

### **Scenariusz główny:**
1. Użytkownik wyświetla odpowiednią grupę tasków **[UC-13]**
2. Użytkownik wybiera taska, którego chce wyświetlić
3. System przenosi użytkownika do widoku taska
4. Użytkownik widzi szczegóły taska

### **Warunki końcowe:**
Task został wyświetlony. Użytkownik ma teraz możliwość zarządzania nim

### **Scenariusze alternatywne:**
**3a. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-30: Edycja taska**

### **Aktorzy:**
Użytkownik

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik jest zalogowany **[UC-02]**
3. Użytkownik posiada dostęp do grupy tasków **[UC-12]**, **[UC-18]**, **[UC-20]**, **[UC-22]**, **[UC-24]**
4. Użytkownik posiada dostęp do utworzonego taska **[UC-28]**, **[UC-18]**, **[UC-20]**, **[UC-22]**, **[UC-24]**

### **Scenariusz główny:**
1. Użytkownik wyświetla taska, którego chce edytować **[UC-29]**
2. Użytkownik wybiera opcję [EDYTUJ TASKA]
3. System wyświetla formularz edycji taska
4. Użytkownik ma możliwość edycji wybranych parametrów taska
5. Użytkownik zatwierdza wprowadzenie zmian
6. System sprawdza poprawność danych (np. czy nie została podana pusta nazwa)
7. System wprowadza zmiany
8. System wyświetla informację o pomyślnym wprowadzeniu zmian
9. System odświeża widok taska

### **Warunki końcowe:**
Task został zmodyfikowany

### **Scenariusze alternatywne:**
**5a. Użytkownik rezygnuje z akcji:**
* Użytkownik wybiera opcję [ANULUJ]
* System powraca do widoku taska bez wprowadzania zmian

**6a. Użytkownik podał niepoprawne dane:**
* System blokuje finalizację edycji taska
* System wyświetla odpowiedni komunikat
* Powrót do kroku 4

**7a. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-31: Usunięcie taska**

### **Aktorzy:**
Użytkownik

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik jest zalogowany **[UC-02]**
3. Użytkownik posiada dostęp do grupy tasków **[UC-12]**, **[UC-18]**, **[UC-20]**, **[UC-22]**, **[UC-24]**
4. Użytkownik posiada dostęp do utworzonego taska **[UC-28]**, **[UC-18]**, **[UC-20]**, **[UC-22]**, **[UC-24]**

### **Scenariusz główny:**
1. Użytkownik otwiera formularz edycji wybranego taska **[UC-30]**
2. Użytkownik wybiera opcję [USUŃ TUSKA]
3. System wyświetla komunikat o nieodwracalności tej akcji oraz wymaga jej potwierdzenia
4. Użytkownik zatwierdza chęć usunięcia taska
5. System usuwa taska
6. System aktualizuje dane w bazie danych
7. System wyświetla informację o pomyślnym usunięciu taska
8. System przenosi użytkownika z powrotem do widoku grupy tasków

### **Warunki końcowe:**
Task został usunięty. Nie ma możliwości jego wyświetlania oraz modyfikacji

### **Scenariusze alternatywne:**
**4a. Użytkownik rezygnuje z akcji:**
* Użytkownik wybiera opcję [ANULUJ]
* System powraca do widoku taska bez wprowadzania zmian

**5a. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany

<br>
<br>
<br>
<br>
<br>
<br>

# **UC-32: Uzupełnianie postępu w tasku**

### **Aktorzy:**
Użytkownik

### **Warunki początkowe:**
1. Urządzenie posiada łącze z internetem
2. Użytkownik jest zalogowany **[UC-02]**
3. Użytkownik posiada dostęp do grupy tasków **[UC-12]**, **[UC-18]**, **[UC-20]**, **[UC-22]**, **[UC-24]**
4. Użytkownik posiada dostęp do utworzonego taska **[UC-28]**, **[UC-18]**, **[UC-20]**, **[UC-22]**, **[UC-24]**

### **Scenariusz główny:**
1. Użytkownik wyświetla wybranego taska **[UC-29]**
2. Użytkownik wybiera opcję [UZUPEŁNIJ POSTĘP]
3. System wyświetla formularz uzupełniania postępu
4. Użytkownik uzupełnia formularz o parametry, w zależności od konfiguracji taska
5. Użytkownik zatwierdza wprowadzenie zmian
6. System sprawdza poprawność danych (np. czy zostały podane wszystkie wymagane dane)
7. System obsługuje uzupełnienie postępu w tasku
8. System dodaje do osi czasu taska wpis o uzupełnieniu postępu
9. System wyświetla informację o pomyślnym wprowadzeniu zmian
10. System odświeża widok taska

### **Warunki końcowe:**
Postęp w tasku został uzupełniony. Wpis o uzupełnieniu postępu jest widoczny na osi czasu taska.

### **Scenariusze alternatywne:**
**5a. Użytkownik rezygnuje z akcji:**
* Użytkownik wybiera opcję [ANULUJ]
* System powraca do widoku taska bez wprowadzania zmian

**6a. Użytkownik podał niepoprawne dane:**
* System blokuje finalizację uzupełnienia postępu
* System wyświetla odpowiedni komunikat
* Powrót do kroku 4

**7a. Kryterium ukończenia taska zostało spełnione:**
* System oznacza task jako ukończony
* System blokuje możliwość dalszego uzupełniania postępu w tasku, do momentu ewentualnej zmiany kryterium ukończenia poprzez edycję taska
* Przejście do kroku 8

**7b. Brak połączenia z serwerem:**
* System wyświetla komunikat o braku łączności
* Proces zostaje przerwany
