export const USERNAME_COOKIE = "username";

const cookieRegex = () => new RegExp(`(?:^|; )${USERNAME_COOKIE}=([^;]*)`);

export const readUsernameCookie = (): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(cookieRegex());
  return match ? decodeURIComponent(match[1]) : null;
};

export const writeUsernameCookie = (username: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${USERNAME_COOKIE}=${encodeURIComponent(username)}; path=/; max-age=31536000`;
};

export const clearUsernameCookie = () => {
  if (typeof document === "undefined") return;
  document.cookie = `${USERNAME_COOKIE}=; path=/; max-age=0`;
};

export const mockAuthenticate = async (username: string) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return { success: Boolean(username) };
};
