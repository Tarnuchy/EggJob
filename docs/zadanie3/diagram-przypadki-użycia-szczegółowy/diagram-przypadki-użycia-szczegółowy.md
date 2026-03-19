flowchart LR
    %% Deklaracja aktora
    User((Użytkownik))

    %% Grupa: Zarządzanie kontem
    subgraph Konto [Zarządzanie kontem]
        direction TB
        UC01([UC-01: Zakładanie konta])
        UC02([UC-02: Logowanie użytkownika])
        UC03([UC-03: Edycja profilu])
        UC04([UC-04: Usunięcie konta])
    end

    %% Grupa: Zarządzanie znajomymi
    subgraph Znajomi [Zarządzanie znajomymi]
        direction TB
        UC05([UC-05: Oczekujące zaproszenia])
        UC06([UC-06: Wysyłanie zaproszenia])
        UC07([UC-07: Wycofanie zaproszenia])
        UC08([UC-08: Przyjęcie zaproszenia])
        UC09([UC-09: Odrzucenie zaproszenia])
        UC10([UC-10: Wyświetlanie profilu])
        UC11([UC-11: Usunięcie znajomego])
    end

    %% Grupa: Zarządzanie grupami tasków
    subgraph Grupy [Zarządzanie grupami tasków]
        direction TB
        UC12([UC-12: Tworzenie grupy])
        UC13([UC-13: Wyświetlanie grupy])
        UC14([UC-14: Edycja grupy])
        UC15([UC-15: Usunięcie grupy])
        UC16([UC-16: Oczekujące zap. do grup])
        UC17([UC-17: Przekazanie kodu])
        UC18([UC-18: Prośba z kodu])
        UC19([UC-19: Wycofanie prośby])
        UC20([UC-20: Zaakceptowanie prośby])
        UC21([UC-21: Odrzucenie prośby])
        UC22([UC-22: Zaproszenie do grupy])
        UC23([UC-23: Wycofanie zaproszenia])
        UC24([UC-24: Przyjęcie zaproszenia])
        UC25([UC-25: Odrzucenie zaproszenia])
        UC26([UC-26: Usunięcie użytkownika])
        UC27([UC-27: Opuszczenie grupy])
    end

    %% Grupa: Zarządzanie taskami
    subgraph Taski [Zarządzanie taskami]
        direction TB
        UC28([UC-28: Tworzenie taska])
        UC29([UC-29: Wyświetlanie taska])
        UC30([UC-30: Edycja taska])
        UC31([UC-31: Usunięcie taska])
        UC32([UC-32: Uzupełnianie postępu])
    end

    %% Powiązania aktorów
    User --> UC01 & UC02 & UC03 & UC04
    User --> UC05 & UC06 & UC07 & UC08 & UC09 & UC10 & UC11
    User --> UC12 & UC13 & UC14 & UC15 & UC16 & UC17 & UC18 & UC19 & UC20 & UC21 & UC22 & UC23 & UC24 & UC25 & UC26 & UC27
    User --> UC28 & UC29 & UC30 & UC31 & UC32
    
    %% Zależności (Includes / Requires / Extends) wyciągnięte ze scenariuszy
    UC02 -.->|wymaga| UC01
    UC03 -.->|wymaga| UC02
    UC04 -.->|wymaga| UC02
    UC04 -.->|rozszerza| UC03
    UC05 -.->|wymaga| UC02
    UC06 -.->|wymaga| UC01
    UC06 -.->|wymaga| UC02
    UC06 -.->|rozszerza| UC05
    UC07 -.->|wymaga| UC02
    UC07 -.->|wymaga| UC06
    UC07 -.->|rozszerza| UC05
    UC08 -.->|wymaga| UC02
    UC08 -.->|wymaga| UC06
    UC08 -.->|rozszerza| UC05
    UC09 -.->|wymaga| UC02
    UC09 -.->|wymaga| UC06
    UC09 -.->|rozszerza| UC05
    UC10 -.->|wymaga| UC02
    UC10 -.->|wymaga| UC06
    UC10 -.->|wymaga| UC08
    UC11 -.->|wymaga| UC02
    UC11 -.->|wymaga| UC06
    UC11 -.->|wymaga| UC08
    UC11 -.->|rozszerza| UC10
    UC12 -.->|wymaga| UC02
    UC13 -.->|wymaga| UC02
    UC13 -.->|wymaga| UC12
    UC13 -.->|alternatywa| UC17
    UC13 -.->|alternatywa| UC20
    UC13 -.->|alternatywa| UC22
    UC13 -.->|alternatywa| UC24
    UC14 -.->|wymaga| UC02
    UC14 -.->|wymaga| UC12
    UC14 -.->|rozszerza| UC13
    UC15 -.->|wymaga| UC02
    UC15 -.->|wymaga| UC12
    UC15 -.->|rozszerza| UC14
    UC16 -.->|wymaga| UC02
    UC17 -.->|wymaga| UC02
    UC17 -.->|wymaga| UC12
    UC17 -.->|rozszerza| UC14
    UC18 -.->|wymaga| UC02
    UC18 -.->|wymaga| UC12
    UC18 -.->|wymaga| UC17
    UC18 -.->|rozszerza| UC16
    UC19 -.->|wymaga| UC02
    UC19 -.->|wymaga| UC18
    UC19 -.->|rozszerza| UC16
    UC20 -.->|wymaga| UC02
    UC20 -.->|wymaga| UC18
    UC20 -.->|rozszerza| UC16
    UC21 -.->|wymaga| UC02
    UC21 -.->|wymaga| UC18
    UC21 -.->|rozszerza| UC16
    UC22 -.->|wymaga| UC02
    UC22 -.->|wymaga| UC12
    UC22 -.->|wymaga| UC06
    UC22 -.->|wymaga| UC08
    UC22 -.->|rozszerza| UC14
    UC23 -.->|wymaga| UC02
    UC23 -.->|wymaga| UC22
    UC23 -.->|rozszerza| UC16
    UC24 -.->|wymaga| UC02
    UC24 -.->|wymaga| UC22
    UC24 -.->|rozszerza| UC16
    UC25 -.->|wymaga| UC02
    UC25 -.->|wymaga| UC22
    UC25 -.->|rozszerza| UC16
    UC26 -.->|wymaga| UC02
    UC26 -.->|rozszerza| UC14
    UC26 -.->|wymaga| UC18
    UC26 -.->|wymaga| UC20
    UC26 -.->|wymaga| UC22
    UC26 -.->|wymaga| UC24
    UC27 -.->|wymaga| UC02
    UC27 -.->|rozszerza| UC14
    UC27 -.->|wymaga| UC18
    UC27 -.->|wymaga| UC20
    UC27 -.->|wymaga| UC22
    UC27 -.->|wymaga| UC24
    UC28 -.->|wymaga| UC02
    UC28 -.->|wymaga| UC12
    UC28 -.->|wymaga| UC18
    UC28 -.->|wymaga| UC20
    UC28 -.->|wymaga| UC22
    UC28 -.->|wymaga| UC24
    UC28 -.->|rozszerza| UC13
    UC29 -.->|wymaga| UC02
    UC29 -.->|wymaga| UC12
    UC29 -.->|rozszerza| UC13
    UC29 -.->|wymaga| UC28
    UC30 -.->|wymaga| UC02
    UC30 -.->|wymaga| UC12
    UC30 -.->|rozszerza| UC29
    UC30 -.->|wymaga| UC28
    UC31 -.->|wymaga| UC02
    UC31 -.->|wymaga| UC12
    UC31 -.->|rozszerza| UC30
    UC31 -.->|wymaga| UC28
    UC32 -.->|wymaga| UC02
    UC32 -.->|wymaga| UC12
    UC32 -.->|rozszerza| UC29
    UC32 -.->|wymaga| UC28
