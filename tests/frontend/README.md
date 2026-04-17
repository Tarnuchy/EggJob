# Frontend tests (TDD)

Ten branch działa w trybie RED → GREEN → REFACTOR.

Najpierw definiujemy oczekiwane zachowanie jako testy jednostkowe,
a dopiero potem dopisujemy implementację w `src/frontend`.

## Pokrycie use case'ów

### Auth i profil

- UC-01, UC-02: `unit/auth/register-login.test.ts`
- UC-03, UC-04: `unit/profile/profile-account.test.ts`

### Znajomi

- UC-05, UC-06, UC-07, UC-08, UC-09, UC-10, UC-11:
  `unit/social/friendships.test.ts`

### Grupy tasków

- UC-12, UC-13, UC-14, UC-15: `unit/task-groups/task-groups.test.ts`
- UC-16, UC-17, UC-18, UC-19, UC-20, UC-21, UC-22, UC-23, UC-24, UC-25, UC-26, UC-27:
  `unit/task-groups/group-access-invitations.test.ts`

### Taski i postęp

- UC-28, UC-32: `unit/tasks/task-progress.test.ts`
- UC-29, UC-30, UC-31: `unit/tasks/task-lifecycle-comments.test.ts`

### Metody z diagramu klas

- `Account.createUser`, `Invitation.cancel`, `Invitation.notify`, `Notification.read`,
  `TaskParams.edit`, `TaskGroup.changePermissions`, `Comment.deleteComment`,
  `ProgressEntry.validate`: `unit/domain-mapped/domain-methods.test.ts`

### Integralnosc stanu i kontrakty mock API

- integralnosc usuwania encji i edge-case invitation:
  `unit/social/friendships.test.ts`,
  `unit/task-groups/task-groups.test.ts`,
  `unit/tasks/task-lifecycle-comments.test.ts`
- kontrakt logowania mock auth (weryfikacja hasla):
  `unit/services/mock-auth-service.test.ts`

### Zakres klasy domenowej (zadanie 4)

Testy pokrywają metody/funkcjonalności odpowiadające diagramowi klas:

- `register/login/deleteAccount/createUser` → auth/profile tests
- `inviteFriend/deleteFriend/accept/reject/cancel` → social tests
- `TaskGroup.edit/delete/addFriend/removeMember/leaveGroup` → task-group tests
- `Task.edit/delete` + `TaskProgress.updateProgress` + `ProgressEntry.validate` + `Comment.addComment`
  → tasks tests

## Uruchomienie

1. `npm install`
2. `npm run test:frontend`

W aktualnym stanie (RED) testy mają prawo failować, jeśli implementacja nie istnieje.
