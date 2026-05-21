const en = {
  app: {
    name: 'EggJob',
  },
  common: {
    loading: 'Loading...',
  },
  auth: {
    tabs: {
      login: 'Login',
      register: 'Register',
    },
    fields: {
      email: 'Email',
      emailPlaceholder: 'Your Email',
      password: 'Password',
      passwordPlaceholder: 'Your Password',
      confirmPassword: 'Confirm Password',
      confirmPasswordPlaceholder: 'Confirm Password',
      username: 'Username',
      usernamePlaceholder: 'Your Username',
    },
    cta: {
      login: 'Log In',
      register: 'Create Account',
    },
    errors: {
      emailRequired: 'Email is required.',
      passwordRequired: 'Password is required.',
      emailInvalid: 'Please enter a valid email address.',
      usernameTooShort: 'At least 3 characters.',
      usernameTooLong: 'Maximum 24 characters.',
      usernameInvalidChars: 'Only letters, digits and underscore allowed.',
      passwordTooShort: 'At least 8 characters.',
      passwordNeedsUppercase: 'At least 1 uppercase letter.',
      passwordNeedsDigit: 'At least 1 digit.',
      confirmRequired: 'Please confirm your password.',
      passwordsDoNotMatch: 'Passwords do not match.',
      loginFailed: 'Invalid email or password.',
      emailInUse: 'This email is already in use.',
      usernameTaken: 'This username is already taken.',
      registrationFailed: 'Registration failed. Please try again.',
    },
  },
  placeholders: {
    home: 'Home Placeholder',
    tasks: 'Tasks Placeholder',
    friends: 'Friends Placeholder',
    notifications: 'Notifications Placeholder',
    profile: 'Profile Placeholder',
    settings: 'Settings Placeholder',
  },
  screens: {
    home: 'Home',
    tasks: 'Tasks',
    friends: 'Friends',
    notifications: 'Notifications',
    profile: 'Profile',
    settings: 'Settings',
  },
  quickAction: {
    accessibilityLabel: 'Quick add task',
    regularTask: 'Regular task',
    bingoTask: 'Bingo task',
  },
  topBar: {
    back: 'Back',
    notifications: 'Open notifications',
    settings: 'Open settings',
  },
  friends: {
    tabs: {
      myFriends: 'My Friends',
      addFriend: 'Add Friend',
      invitations: 'Invitations',
    },
    searchPlaceholder: 'Search users...',
    empty: {
      myFriendsTitle: 'No friends yet',
      myFriendsMessage: 'Invite someone and start collaborating!',
      addFriendTitle: 'Find new friends',
      addFriendMessage: 'Start typing a username to discover people.',
      addFriendNoResults: 'No users match your search.',
      invitationsTitle: 'No invitations',
      invitationsMessage: "You don't have any pending invitations right now.",
    },
    actions: {
      add: 'Add',
      accept: 'Accept',
      reject: 'Reject',
      pending: 'Pending',
    },
    profile: {
      title: 'Profile',
      placeholder: 'Profile coming soon.',
      unknownUser: 'Unknown user',
    },
  },
  tasks: {
    tabs: {
      tasks: 'Tasks',
      groups: 'Groups',
    },
    groups: {
      actionsSection: 'Quick actions',
      joinAction: 'Join group',
      joinSubtitle: 'Enter invite code',
      joinPlaceholder: 'Invite code',
      joinCta: 'Join',
      joinEmptyTitle: 'Missing code',
      joinEmptyMessage: 'Please enter an invite code to continue.',
      joinNoUserTitle: 'Sign in required',
      joinNoUserMessage: 'Log in to join a group.',
      joinErrorTitle: 'Could not join group',
      joinNotFound: 'Invite code not found.',
      joinConflict: 'You are already a member of this group.',
      joinInvalid: 'Invite code is invalid.',
      joinUnauthorized: 'Your session expired. Please log in again.',
      joinGeneric: 'Something went wrong. Try again.',
      joinSuccessTitle: 'Joined!',
      joinSuccessMessage: 'You have joined the group.',
      createAction: 'Create group',
      createSubtitle: 'Start a new challenge',
      myGroupsSection: 'My groups',
      taskCount: '{{count}} tasks',
      memberCount: '{{count}} members',
    },
  },
  settings: {
    sections: {
      preferences: 'Preferences',
    },
    rows: {
      language: 'Language',
    },
    languagePicker: {
      title: 'Choose language',
      system: 'Use system language',
      english: 'English',
      polish: 'Polski',
      close: 'Close',
    },
  },
  reducerErrors: {
    validationEmail: 'Invalid email address.',
    validationUsername: 'Invalid username.',
    validationName: 'Name cannot be empty.',
    validationInviteCode: 'Invalid invite code.',
    validationValue: 'Invalid value.',
    validationGeneric: 'Validation failed.',
    notFound: 'Resource not found.',
    unknown: 'Something went wrong.',
    unknownAction: 'Unknown action.',
  },
} as const;

export default en;

type Stringify<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Stringify<U>[]
    : T extends object
      ? { [K in keyof T]: Stringify<T[K]> }
      : T;

export type Translation = Stringify<typeof en>;
