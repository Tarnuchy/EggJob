# Diagram sekwencji — zaaproszenie do znajomych

```mermaid
sequenceDiagram
    actor UA as Użytkownik (Zapraszający)
    participant UI as Aplikacja
    participant UsrA as User (Inicjator)
    participant UsrB as User (Docelowy)
    participant Inv as Invitation
    participant Notif as Notification

    UA->>UI: Wpisuje nazwę użytkownika (username) i zgłasza chęć zaproszenia
    UI->>UsrA: inviteFriend()

    note right of UsrA: Logika wyszukiwania
    UsrA->>UsrB: Wyszukuje instancję User po polu username
    
    alt Użytkownik nie istnieje lub próba zaproszenia samego siebie
        UsrA-->>UI: Przerwanie (Void)
        UI-->>UA: Wyświetla komunikat: Nie znaleziono użytkownika
    else Użytkownik z podanym username istnieje
        UsrA->>UsrA: Sprawdza powiązania (istniejące Friendship lub Invitation)
        
        alt Już są znajomymi lub zaproszenie aktywne
            UsrA-->>UI: Przerwanie (Void)
            UI-->>UA: Komunikat: Relacja lub zaproszenie już istnieje
        else Brak wcześniejszych powiązań
            UsrA->>Inv: inviteFriend()
            Inv-->>UsrB: Dodaje zaproszenie

            Inv ->> Notif: notify()
            Notif -->> Inv: Instancja Notification
            Inv ->> UsrB: Dodaje powiadomienie

            Inv -->> UsrA: Zaproszenie wysłane poprwnie
            
            UsrA-->>UI: Zakończenie metody (Void)
            UI-->>UA: Komunikat o sukcesie: "Zaproszenie zostało wysłane"
        end
    end
```
