const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
const USERNAME_MIN = 3;
const USERNAME_MAX = 24;
const PASSWORD_MIN = 8;

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidUsername(username: string): boolean {
  const trimmed = username.trim();
  if (trimmed.length < USERNAME_MIN || trimmed.length > USERNAME_MAX) return false;
  return USERNAME_REGEX.test(trimmed);
}

export function isValidPassword(password: string): boolean {
  if (password.length < PASSWORD_MIN) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

export function isValidPhotoUrl(url: string): boolean {
  return /^https:\/\/\S+$/.test(url.trim());
}
