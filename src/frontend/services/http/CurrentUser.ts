let currentUserId: string | null = null;

export const CurrentUser = {
  set(id: string | null) {
    currentUserId = id;
  },
  get(): string | null {
    return currentUserId;
  },
};

export default CurrentUser;
