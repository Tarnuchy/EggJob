# EggJob

**EggJob** is an Android app for tracking and sharing personal goals with friends. Whether you're working through a year-long bingo card or trying to eat 365 eggs in 2026, EggJob makes it easy to stay accountable and watch your friends do the same.

---

## About

The idea was born from a New Year's tradition: a hand-drawn **2026 Bingo Card** full of goals for the year — and one friend's ambitious challenge to eat **365 eggs in 2026**.

Keeping track of all those goals, and sharing the progress with friends, turned out to be surprisingly annoying. Group chats fill up with *"how many eggs have you eaten?"* and *"are you still doing the challenge?"* — and the progress gets lost in the scroll.

**EggJob** is the answer: one app to track your tasks, set personal goals, and share your journey with the people cheering you on.

---

## Features

### Tasks & Progress
- Organize your goals into **TaskGroups** — keep them to yourself or open them up to others
- Build out individual **Tasks**, private or shared
- Log how things are going by adding **progress entries** as you go
- See your overall progress summed up in one place

### Friends & Sharing
- Connect with **friends** inside the app
- Bring friends along by **inviting** them to your shared TaskGroups
- Let your progress **speak for itself** on your Tasks
- Follow how your friends are doing in the TaskGroups they make public

### Personalization & Goals
- Shape and **tweak** tasks so they actually fit you
- Set the **goals** you're aiming for
- Get **reminders and notifications** so nothing slips
- Spin up a dedicated **Bingo** TaskGroup for the full challenge experience

---

## Tech Stack

### Frontend

| | |
| --- | --- |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Framework | [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/) |
| Testing | [Vitest](https://vitest.dev/) |

### Backend

| | |
| --- | --- |
| Language | [Python](https://www.python.org/) |
| Framework | [FastAPI](https://fastapi.tiangolo.com/) |
| Database | [PostgreSQL](https://www.postgresql.org/) |
| Testing | [pytest](https://docs.pytest.org/) |

---

## Getting Started

> **EggJob is an Android app.** It's built with React Native, so there's no browser version — you'll need an Android device (or emulator) to run it.

### Option A — Just want to try it?
Download the latest build from **[itch.io](https://dariooo23.itch.io/eggjob)**, install the `.apk` on your Android device, and you're good to go.

### Option B — Run it from source

**Prerequisites:**
- [Node.js](https://nodejs.org/) (LTS recommended)
- The [Expo Go](https://expo.dev/go) app on your Android device, **or** an Android emulator

**Steps:**

```bash
# 1. Clone the repo
git clone https://github.com/Tarnuchy/EggJob.git
cd EggJob

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
```

Then scan the QR code with **Expo Go**, or launch directly on Android:

```bash
npm run android
```

**Other useful scripts:**

```bash
npm test          # run the test suite
npm run typecheck # type-check without emitting
```

---

## Creators

| Name | GitHub | Role |
| --- | --- | --- |
| Mikołaj Suchan | [@wuchan33](https://github.com/wuchan33) | Frontend |
| Karol Dziekan | [@Dariooo23](https://github.com/Dariooo23) | Frontend |
| Oliwier Polak | [@Kangurur](https://github.com/Kangurur) | Backend |
| Łukasz Rudnik | [@lukaszrudnik](https://github.com/lukaszrudnik) | Backend |

---

<p align="center"><em>EggJob — because every goal deserves a tally.</em></p>
