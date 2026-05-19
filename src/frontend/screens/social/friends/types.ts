export type FriendsTab = 'myFriends' | 'addFriend' | 'invitations';

export interface ResolvedUser {
  userId: string;
  username: string;
  photoUrl?: string;
}

export interface ResolvedFriend extends ResolvedUser {
  friendshipId: string;
}

export interface ResolvedInvitation extends ResolvedUser {
  invitationId: string;
}
