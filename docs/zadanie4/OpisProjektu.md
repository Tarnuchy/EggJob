# Spełnienie zasad SOLID

## Single Responsibility Principle
System ma małe, dedykowane klasy z jasno określoną odpowiedzialnością:
* Rozdzielenie funkcjonalności rejestracji/logowania (`Account`) od profilu użytkownika (`User`).
* Główna klasa aplikacji `Task` posiada wyłącznie podstawową definicję, dodatkowa logika została przeniesiona do `TaskParams` oraz `TaskProgress`.
* Funkcje społecznościowe zostały rozbite na małe klasy, typu: Powiadomienia (`Notification`), zaproszenia (`Invitation`) oraz komentarze (`Comment`).

## Open/Closed Principle
Posiadamy klasy abstrakcyjne (`Task`, `TaskProgress` i `TaskGroup`) pozwalające na dodanie nowych typów zadań bez konieczności zmiany istniejącego kodu. Przykładowo, jeżeli chcielibyśmy utworzyć nowy rodzaj taska, to wystarczy zdefiniować nowe klasy dziedziczące po `Task` oraz po `TaskProgress`, bez modyfikacji już istniejących.

## Liskov Substitution Principle
Klasy dziedziczące po klasach abstrakcyjnych (`EndlessTask`, `OneTimeTask`, `RepeatableTask` dla `Task` oraz ich odpowiedniki postępu) nie modyfikują i nie psują zachowania klasy bazowej. Każdy z konkretnych typów zadań może być traktowany przez system po prostu jako ogólny `Task`, co np. w obrębie `TaskGroup` pozwala obsługiwać je w spójny sposób.

## Interface Segregation Principle
Zachowania są porozdzielane w taki sposób, aby nie tworzyć niepotrzebnie rozbudowanych klas. Przykładowo, klasa `GroupMember` implementuje role i permissions zamiast pchać wszystkie akcje grupy do klasy `User`. Dzięki temu każda klasa implementuje tylko te funkcje, które są jej potrzebne i spełniona jest zasada ISP.

## Dependency Inversion Principle
Relacje między modułami opierają się na abstrakcjach. Klasa `Task` odnosi się do ogólnego pojęcia `TaskProgress` zamiast konkretnej implementacji (np. `RepeatableTaskProgress`). Dzięki temu łatwiej jest podmieniać implementację danych metod w klasach.

---

# Wzorce projektowe

## Strategy
* **Gdzie to pasuje:** W relacji między `Task` a `TaskProgress`.
* **Uzasadnienie:** Różne rodzaje zadań potrzebują zupełnie innej logiki kalkulującej postęp. Dzięki powiązaniu `Task` z `TaskProgress`, to właśnie `TaskProgress` staje się "strategią" naliczania postępów. Jeśli w przyszłości pojawią się nowe sposoby zaliczania nawyków (np. punkty za serię zadań), wystarczy wstrzyknąć inną "strategię" klasy postępu (inny subtyp `TaskProgress`), bez zmieniania samej klasy `Task`.

## Template Method
* **Gdzie to pasuje:** W abstrakcyjnych klasach `TaskGroup` lub w przepływie logiki metod `Task.edit()` czy `ProgressEntry.validate()`.
* **Uzasadnienie:** Można stworzyć w klasie bazowej (np. `TaskGroup`) główny szkielet przeprowadzania akcji (np. dołączania kogoś do grupy z powiadomieniem innych). Klasy potomne (`CooperativeTaskGroup` vs `CompetetiveTaskGroup`) mogą przesłaniać tylko konkretne fragmenty tego algorytmu – np. w kooperacji powiadamiany jest lider o nowym graczu, a w rywalizacji zmieniany jest sposób śledzenia postępu.

## Composite
* **Gdzie to pasuje:** Do zarządzania modelem struktury grup i zadań (`TaskGroup` i jej `Task`).
* **Uzasadnienie:** Wzorzec Kompozyt pozwoli na to, by grupę zadań traktować tak samo spójnie, jak jej poszczególne części, np. dodając nowe podgrupy do `TaskGroup`, będziesz mógł zbiorczo wywoływać różne metody.

## Builder
* **Gdzie to pasuje:** Głównie przy tworzeniu obiektów typu `Task` oraz budowaniu `TaskGroup`.
* **Uzasadnienie:** Stworzenie nowego zadania to na tym diagramie złożony proces: musisz utworzyć podklasę `Task`, skonfigurować dla niej odpowiedni podtyp `TaskProgress`, a także zainicjalizować `TaskParams` z parametrami powiadomień, kolorów, zdjęć. Wzorzec Builder pozwoli na przejrzyste i w pełni stabilne przygotowywanie gotowego, złożonego obiektu `Task` krok po kroku.

_Będzie pewnie więcej (Wyjdzie na implementacji)_
