import axios from "axios";
import { getOrCreateGuest } from "../services/api";

export const GUEST_TOKEN_STORAGE_KEY = "guest_token";
export const GUEST_USER_ID = "guest_user";

const USER_DATA_STORAGE_KEY = "userData";

type UserLike = {
  _id?: string;
} | null | undefined;

export type SessionIdentity = {
  id: string;
  type: "auth" | "guest";
  isAuthenticated: boolean;
  isGuest: boolean;
};

export function getAuthenticatedUserId(user: UserLike): string | null {
  if (user?._id) return user._id;
  return null;
}


export function getGuestToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(GUEST_TOKEN_STORAGE_KEY);
}

export async function getSessionIdentity(user: UserLike): Promise<SessionIdentity> {
  const authUserId = getAuthenticatedUserId(user);
  if (authUserId) {
    sessionStorage.removeItem(GUEST_TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(GUEST_USER_ID);
    return {
      id: authUserId,
      type: "auth",
      isAuthenticated: true,
      isGuest: false,
    };
  }
  const data = {
    client: {
      language: navigator.language,
      languages: navigator.languages,
      cookieEnabled: navigator.cookieEnabled,
      online: navigator.onLine,
      cpuCores: navigator.hardwareConcurrency,
      touchPoints: navigator.maxTouchPoints,
    },
    time: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
    }
  }
  const guestToken = await getOrCreateGuest(data);
  return {
    id: guestToken._id,
    type: "guest",
    isAuthenticated: false,
    isGuest: true,
  };
}

