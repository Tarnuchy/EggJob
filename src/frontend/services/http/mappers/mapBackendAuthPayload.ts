export type BackendAuthPayload = {
  account_id: string;
  user_id: string;
  email: string;
  username: string;
  photo_url: string | null;
  access_token?: string;
};

export type ParsedAuthPayload = {
  accountId: string;
  userId: string;
  email: string;
  username: string;
  photoUrl: string | null;
  accessToken?: string;
};

export function mapBackendAuthPayload(payload: BackendAuthPayload): ParsedAuthPayload {
  return {
    accountId: payload.account_id,
    userId: payload.user_id,
    email: payload.email,
    username: payload.username,
    photoUrl: payload.photo_url,
    accessToken: payload.access_token,
  };
}
