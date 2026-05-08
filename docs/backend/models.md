# Models

Krotki opis modeli i relacji z [src/backend/models.py](../../src/backend/models.py).

## Helpers i enumy
- `utcnow()` helper do timestampow [src/backend/models.py](../../src/backend/models.py#L29).
- Enumy domenowe: `PrivacyLevel`, `GroupRole`, `TaskStatus`, `TimeInterval`, `TaskType`, `TaskGroupType` [src/backend/models.py](../../src/backend/models.py#L33).

## Konta i userzy
- `Account` rejestracja, logowanie, hasla, tworzenie usera [src/backend/models.py](../../src/backend/models.py#L69).
- `User` profil, relacje, membershipy, zaproszenia, notyfikacje [src/backend/models.py](../../src/backend/models.py#L188).

## Relacje spoleczne
- `Friendship` powiazanie user-user z data akceptacji [src/backend/models.py](../../src/backend/models.py#L358).
- `Invitation` zaproszenia do znajomych [src/backend/models.py](../../src/backend/models.py#L399).
- `Notification` powiadomienia usera [src/backend/models.py](../../src/backend/models.py#L463).

## Task groups i czlonkostwo
- `TaskGroup` konfiguracja grupy z prywatnoscia, typem i lista taskow [src/backend/models.py](../../src/backend/models.py#L495).
- `CompetetiveTaskGroup` logika dodawania znajomych i tworzenia taskow w trybie competitive [src/backend/models.py](../../src/backend/models.py#L598).
- `CooperativeTaskGroup` analogiczna logika dla cooperative [src/backend/models.py](../../src/backend/models.py#L715).
- `GroupMember` czlonkostwo, role i relacja user-group [src/backend/models.py](../../src/backend/models.py#L805).

## Taski
- `Task` dane wspolne: nazwa, opis, cel, opcjonalna `unit`, typ i relacje [src/backend/models.py](../../src/backend/models.py#L888).
- `EndlessTask`, `OneTimeTask`, `RepeatableTask`, `ChallengeTask` specjalizacje z dodatkowymi polami [src/backend/models.py](../../src/backend/models.py#L970).
- `TaskParams` parametry pomocnicze dla taska [src/backend/models.py](../../src/backend/models.py#L1199).

## Postep i komentarze
- `TaskProgress` stan per czlonek i task, logika updateProgress [src/backend/models.py](../../src/backend/models.py#L1032).
- `EndlessTaskProgress`, `OneTimeTaskProgress`, `RepeatableTaskProgress`, `ChallengeTaskProgress` specjalizacje progresu [src/backend/models.py](../../src/backend/models.py#L1141).
- `ProgressEntry` pojedyncze wpisy progresu z walidacja [src/backend/models.py](../../src/backend/models.py#L1240).
- `Comment` komentarze do progress entry [src/backend/models.py](../../src/backend/models.py#L1305).

## Exporty
- Publiczne eksporty w `__all__` [src/backend/models.py](../../src/backend/models.py#L1338).
