# Diagram przypadków użycia

```mermaid
flowchart LR
    NU["Aktor:<br/>Niezalogowany Użytkownik"]
    ZU["Aktor:<br/>Zalogowany Użytkownik"]

    %% Rejestracja i logowanie
    REJ(["Rejestracja konta"])
    LOG(["Logowanie do systemu"])

    %% Zarządzanie Kontem
    ZAR_K(["Zarządzanie profilem i kontem<br/>(edycja, usuwanie)"])

    %% Zarządzanie Znajomymi
    ZAR_Z(["Zarządzanie znajomymi<br/>(lista, profile)"])
    ZAP_Z(["Obsługa zaproszeń<br/>do znajomych"])

    %% Zarządzanie Grupami
    ZAR_G(["Zarządzanie grupami tasków<br/>(tworzenie, edycja, usuwanie)"])
    CZL_G(["Zarządzanie członkostwem<br/>(kody, zaproszenia, opuszczanie)"])

    %% Zarządzanie Taskami
    ZAR_T(["Zarządzanie poszczególnymi taskami<br/>(tworzenie, edycja, usuwanie)"])
    POST(["Uzupełnianie postępu taska"])

    %% Powiązania z aktorami
    NU --> REJ
    NU --> LOG

    ZU --> ZAR_K
    ZU --> ZAR_Z
    ZU --> ZAR_G
    ZU --> ZAR_T

    %% Relacje wymaga (include)
    ZAR_K -.->|wymaga| LOG
    ZAR_Z -.->|wymaga| LOG
    ZAR_G -.->|wymaga| LOG
    ZAR_T -.->|wymaga| LOG

    %% Relacje rozszerza (extend) dla uszczegółowienia
    ZAR_Z -.->|rozszerza| ZAP_Z
    ZAR_G -.->|rozszerza| CZL_G
    ZAR_T -.->|rozszerza| POST
```

Legenda:
- Linia ciągła `-->` oznacza relację wykonania przypadku użycia przez aktora.
- Linia przerywana `-.->|wymaga|` oznacza relację include (konieczność działania, np. zalogowania).
- Linia przerywana `-.->|rozszerza|` oznacza relację extend (opcjonalny / uszczegóławiający proces powiązany z głównym punktem).