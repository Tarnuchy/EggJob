import type { Translation } from './en';

const pl: Translation = {
  app: {
    name: 'EggJob',
  },
  common: {
    loading: 'Ładowanie...',
  },
  auth: {
    tabs: {
      login: 'Logowanie',
      register: 'Rejestracja',
    },
    fields: {
      email: 'E-mail',
      emailPlaceholder: 'Twój e-mail',
      password: 'Hasło',
      passwordPlaceholder: 'Twoje hasło',
      confirmPassword: 'Potwierdź hasło',
      confirmPasswordPlaceholder: 'Potwierdź hasło',
      username: 'Nazwa użytkownika',
      usernamePlaceholder: 'Twoja nazwa użytkownika',
    },
    cta: {
      login: 'Zaloguj się',
      register: 'Załóż konto',
    },
    errors: {
      emailRequired: 'E-mail jest wymagany.',
      passwordRequired: 'Hasło jest wymagane.',
      emailInvalid: 'Wprowadź poprawny adres e-mail.',
      usernameTooShort: 'Minimum 3 znaki.',
      usernameTooLong: 'Maksimum 24 znaki.',
      usernameInvalidChars: 'Dozwolone są tylko litery, cyfry i podkreślnik.',
      passwordTooShort: 'Minimum 8 znaków.',
      passwordNeedsUppercase: 'Co najmniej 1 wielka litera.',
      passwordNeedsDigit: 'Co najmniej 1 cyfra.',
      confirmRequired: 'Potwierdź swoje hasło.',
      passwordsDoNotMatch: 'Hasła nie są zgodne.',
      loginFailed: 'Nieprawidłowy e-mail lub hasło.',
      emailInUse: 'Ten e-mail jest już używany.',
      usernameTaken: 'Ta nazwa użytkownika jest już zajęta.',
      registrationFailed: 'Rejestracja nie powiodła się. Spróbuj ponownie.',
    },
  },
  placeholders: {
    home: 'Ekran główny — placeholder',
    tasks: 'Zadania — placeholder',
  },
  screens: {
    home: 'Główna',
    tasks: 'Zadania',
    friends: 'Znajomi',
    notifications: 'Powiadomienia',
    profile: 'Profil',
    settings: 'Ustawienia',
  },
  quickAction: {
    accessibilityLabel: 'Szybkie dodawanie zadania',
    regularTask: 'Zwykłe zadanie',
    bingoTask: 'Zadanie bingo',
  },
  topBar: {
    back: 'Wstecz',
    notifications: 'Otwórz powiadomienia',
    settings: 'Otwórz ustawienia',
  },
  friends: {
    tabs: {
      myFriends: 'Moi znajomi',
      addFriend: 'Dodaj znajomego',
      invitations: 'Zaproszenia',
    },
    searchPlaceholder: 'Szukaj użytkowników...',
    empty: {
      myFriendsTitle: 'Brak znajomych',
      myFriendsMessage: 'Zaproś kogoś i zacznijcie współpracę!',
      addFriendTitle: 'Znajdź nowych znajomych',
      addFriendMessage: 'Wpisz nazwę użytkownika, aby znaleźć osoby.',
      addFriendNoResults: 'Żaden użytkownik nie pasuje do wyszukiwania.',
      invitationsTitle: 'Brak zaproszeń',
      invitationsMessage: 'Nie masz teraz żadnych oczekujących zaproszeń.',
    },
    actions: {
      add: 'Dodaj',
      accept: 'Akceptuj',
      reject: 'Odrzuć',
      pending: 'Oczekuje',
    },
    profile: {
      title: 'Profil',
      unknownUser: 'Nieznany użytkownik',
      actions: {
        add: 'Dodaj do znajomych',
        remove: 'Usuń ze znajomych',
        cancel: 'Anuluj zaproszenie',
        accept: 'Akceptuj',
        reject: 'Odrzuć',
      },
      status: {
        friend: 'Jesteście znajomymi',
        inviteSent: 'Zaproszenie wysłane',
        inviteReceived: 'Chce dodać Cię do znajomych',
      },
      activity: {
        title: 'Ostatnia aktywność',
        empty: 'Brak ostatniej aktywności.',
        progressEntry: 'Aktualizacja postępu',
        comment: 'Komentarz',
      },
    },
  },
  settings: {
    sections: {
      preferences: 'Preferencje',
    },
    rows: {
      language: 'Język',
    },
    languagePicker: {
      title: 'Wybierz język',
      system: 'Użyj języka systemu',
      english: 'English',
      polish: 'Polski',
      close: 'Zamknij',
    },
  },
  relativeTime: {
    now: 'przed chwilą',
    minutes: '{{count}} min temu',
    hours: '{{count}} godz. temu',
    days: '{{count}} dni temu',
    weeks: '{{count}} tyg. temu',
  },
  notifications: {
    empty: {
      title: 'Brak powiadomień',
      message: 'Wszystko na bieżąco.',
    },
    markAllAsRead: 'Oznacz wszystkie jako przeczytane',
  },
  profile: {
    title: 'Profil',
    loadError: 'Nie udało się wczytać tego profilu.',
    stats: {
      activeTasks: 'Aktywne zadania',
      completedTasks: 'Ukończone',
      friends: 'Znajomi',
      bestStreak: 'Najlepsza seria: {{count}}',
    },
    actions: {
      edit: 'Edytuj profil',
      settings: 'Ustawienia',
    },
    edit: {
      title: 'Edytuj profil',
      usernameLabel: 'Nazwa użytkownika',
      usernamePlaceholder: 'Twoja nazwa użytkownika',
      photoLabel: 'Adres URL zdjęcia',
      photoPlaceholder: 'https://…',
      photoHint: 'Wklej link do obrazu. Zostaw puste, aby użyć domyślnego awatara.',
      save: 'Zapisz zmiany',
      saveError: 'Coś poszło nie tak. Spróbuj ponownie.',
      photoInvalid: 'Podaj poprawny link https do obrazu.',
    },
  },
  reducerErrors: {
    validationEmail: 'Nieprawidłowy adres e-mail.',
    validationUsername: 'Nieprawidłowa nazwa użytkownika.',
    validationName: 'Nazwa nie może być pusta.',
    validationInviteCode: 'Nieprawidłowy kod zaproszenia.',
    validationValue: 'Nieprawidłowa wartość.',
    validationGeneric: 'Walidacja nie powiodła się.',
    notFound: 'Nie znaleziono zasobu.',
    unknown: 'Coś poszło nie tak.',
    unknownAction: 'Nieznana akcja.',
  },
};

export default pl;
