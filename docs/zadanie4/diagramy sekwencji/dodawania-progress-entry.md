# Diagram sekwencji — dodawanie ProgressEntry do taska

```mermaid
sequenceDiagram
    actor U as Użytkownik
    participant UI as Aplikacja
    participant TP as TaskProgress
    participant PE as ProgressEntry

    U->>UI: Wybiera opcję "Dodaj postęp" w tasku
    UI->>UI: Wyświetla formularz dodawania postępu
    U->>UI: Wypełnia formularz (wartość, notatka, zdjęcie, itp.)
    UI->>PE: Tworzy ProgressEntry
    PE->>PE: validate()
    alt Niepoprawne dane
        PE-->>UI: false
        UI-->>U: Wyświetla komunikat o błędzie
    else Dane poprawne
        PE->>TP: updateProgress(wartość)
        PE-->>UI: true
        UI-->>U: Wyświetla komunikat o sukcesie, odświeża widok taska
    end
```
