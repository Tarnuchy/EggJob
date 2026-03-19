# Diagram przypadków użycia

```mermaid
flowchart LR
    U["Aktor: Zalogowany użytkownik"]

    ST(["Stworzenie taska"])
    STG(["Stworzenie grupy tasków"])
    WU(["Wypełnianie i uzupełnianie<br/>taska samodzielnie"])
    DZT(["Dodanie znajomych"])
    WSP(["Wykonywanie taska<br/>wspólnie"])
    KOM(["Wykonywanie taska<br/>kompetytywnie"])
    FOT(["Dodanie zdjęcia/opisu<br/>do aktualizacji<br/>postępu taska"])

    ZN(["Lista znajomych"])
    DPN(["Dodanie po nazwie"])
    US(["Usunięcie znajomego"])
    WPF(["Wyświetlenie profilu<br/>znajomego"])
    KR(["Komentowanie/reagowanie<br/>na postępy znajomego"])

    PRF(["Zarządzanie profilem"])
    EU(["Edycja profilu"])
    DEL(["Usunięcie konta"])

    U2["Aktor: Niealogowany użytkownik"]

    LOG(["Zalogowanie się"])
    CR(["Stworzenie konta"])

    U --> STG
    U --> ST
    U --> ZN
    U --> PRF

    STG --> ST
    STG -.-> DZT

    ST -.-> WU

    ST -.-> DZT
    DZT -.-> WSP
    DZT -.-> KOM

    WU -.-> FOT
    WSP -.-> FOT
    KOM -.-> FOT

    ZN -.-> DPN
    ZN -.-> WPF
    WPF -.-> US
    WPF -.-> KR

    PRF -.-> EU
    PRF -.-> DEL


    U2 --> CR
    U2 --> LOG
    CR --> LOG
    
```

Legenda:
- Linia ciągła `-->` oznacza relację include.
- Linia przerywana `-.->` oznacza relację extend.