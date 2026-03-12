# Wymagania

### Ograniczenia

- **O-01 (Prawne):** System musi być w pełni zgodny z przepisami RODO, szczególnie w zakresie bezpiecznego przechowywania adresów e-mail użytkowników.

- **O-02 (Infrastrukturalne):** Ze względu na gromadzenie historii zadań i korzystanie z darmowego serwera, miejsce w bazie danych na pojedynczego użytkownika jest ograniczone.

- **O-03 (Licencyjne):** Aplikacja musi zostać udostępniona jako projekt open source na jednej z wybranych licencji (np. MIT, GPL-3.0 lub Apache-2.0).

- **O-04 (Dystrybucyjne):** Finalna wersja oprogramowania musi spełniać wymogi techniczne pozwalające na umieszczenie jej w publicznym agregatorze aplikacji (np. Google Play, itch.io).



### Wymagania systemowe

- **S-01:** System musi być dostępny jako natywna aplikacja mobilna na platformy Android oraz iOS.

- **S-02:** Aplikacja musi pracować w modelu klient-serwer.

- **S-03:** Jako system zarządzania bazą danych należy wykorzystać PostgreSQL.

- **S-04:** Jedynym wymaganym danym osobowym od użytkownika jest adres e-mail.



### Wymagania funkcjonalne

#### MUST (Musi być)

- **FM-01:** Jako użytkownik aplikacji chcę tworzyć indywidualne zadania (taski), żeby **skutecznie planować swoje codzienne obowiązki**.

- **FM-02:** Jako użytkownik aplikacji chcę realizować zadania wspólnie z innymi, żeby **współpracować przy osiąganiu celów grupowych**.

- **FM-03:** Jako użytkownik aplikacji chcę konkurować z innymi w wykonywaniu zadań, żeby **podnieść swoją motywację poprzez rywalizację**.

- **FM-04:** Jako osoba nietechniczna chcę tworzyć zadania w maksymalnie paru kliknięciach, żeby **zachować wygodę i oszczędność czasu**.

- **FM-05:** Jako osoba techniczna chcę mieć możliwość tworzenia zaawansowanych zadań (np. cykliczne, podtaski), żeby **precyzyjnie dopasować aplikację do złożonych potrzeb**.

- **FM-06:** Jako Łukasz chcę mieć możliwość tworzenia bingo, żeby **rywalizować ze znajomymi w interaktywnej formie**.

- **FM-07:** Jako osoba towarzyska chcę mieć możliwość dodawania znajomych, żeby **dzielić się z nimi postępami w moich zadaniach i budować wzajemną motywację**.

- **FM-08:** Jako osoba nietowarzyska chcę tworzyć solo taski, żeby **korzystać z narzędzi bez konieczności interakcji społecznych**.



#### SHOULD (Powinien być)

- **FS-01:** Jako użytkownik chcę otrzymywać inteligentne powiadomienia, żeby **nie przeoczyć terminów realizacji moich zadań**.

- **FS-02:** Jako użytkownik chcę dołączać zdjęcia lub wideo do aktualizacji zadania, żeby **wizualnie udokumentować postęp prac**.

- **FS-03:** Jako użytkownik chcę korzystać z zaawansowanego filtrowania zadań, żeby **szybko odnaleźć najważniejsze informacje w gąszczu danych**.

- **FS-04:** Jako użytkownik chcę wysyłać zaproszenia do zadań w formie kodu, żeby **łatwo dołączać znajomych do wspólnych projektów**.



#### COULD (Może być)

- **FC-01:** Jako użytkownik chcę komentować zadania, żeby **wymieniać opinie i uwagi z innymi uczestnikami projektu**.

- **FC-02:** Jako użytkownik chcę obserwować (follow) innych, żeby **inspirować się ich publicznymi osiągnięciami**.

- **FC-03:** Jako użytkownik chcę wizualizować zadania w formie grafów, żeby **lepiej zrozumieć zależności między etapami**.

- **FC-04:** Jako użytkownik chcę wybierać gotowe paczki zadań (np. "paczka do biegania"), żeby **błyskawicznie planować standardowe aktywności**.

- **FC-05:** Jako użytkownik chcę definiować kamienie milowe (milestones), żeby **monitorować postępy w długoterminowych przedsięwzięciach**.



#### WON'T (Nie tym razem)

- **FW-01:** Jako deweloperzy nie chcemy implementować bazy MongoDB, **żeby zapewnić wysoką spójność danych dzięki sprawdzonemu modelowi relacyjnemu PostgreSQL**.

- **FW-02:** Jako deweloperzy nie chcemy tworzyć systemu o skomplikowaniu klasy Jira (np. brak ręcznego przypisywania osób do tasków), **żeby utrzymać lekkość i prostotę aplikacji**.



### Wymagania niefunkcjonalne

- **NF-01 (Integralność):** System musi gwarantować pełną spójność i trwałość danych zgodnie z zasadami ACID w bazie PostgreSQL.

- **NF-02 (Wydajność):** Każda operacja zapisu i odczytu danych przez interfejs aplikacji musi zostać wykonana w czasie poniżej 1 sekundy.

- **NF-03 (Trwałość):** Wszystkie dane wprowadzone przez użytkownika muszą być trwale synchronizowane i zapisywane w centralnej bazie danych.

- **NF-04 (Prywatność):** Mechanizmy przetrzymywania i przetwarzania danych wrażliwych muszą być w pełni zgodne z normami RODO.

- **NF-05 (Dostępność):** Interfejs aplikacji musi być w pełni responsywny i zoptymalizowany pod kątem urządzeń mobilnych o różnych przekątnych ekranu.
