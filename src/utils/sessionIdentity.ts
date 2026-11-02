import axios from "axios";
import { getOrCreateGuest } from "../services/api";

const GUEST_TOKEN_STORAGE_KEY = "guest_token";
const GUEST_USER_ID = "guest_user";
const GUEST_DISPLAY_NAME_KEY = "guest_display_name";

export type GuestSession = {
  _id: string;
  token: string;
  display_name: string;
};

// sessionStorage persists the guest across reloads of this tab, but it can be unavailable or wiped
// mid-session (Mobile Safari, in-app browsers). The in-memory copy is the source of truth while the
// page is open, so React state and the headers sent by the API client cannot disagree.
let guestSession: GuestSession | null = null;

function readStorage(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Storage is blocked or full: the in-memory copy still works for this page load.
  }
}

function removeStorage(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Nothing to remove if storage is unavailable.
  }
}

export function getGuestSession(): GuestSession | null {
  if (guestSession) return guestSession;
  const token = readStorage(GUEST_TOKEN_STORAGE_KEY);
  const id = readStorage(GUEST_USER_ID);
  if (!token || !id) return null;
  guestSession = { _id: id, token, display_name: readStorage(GUEST_DISPLAY_NAME_KEY) ?? "" };
  return guestSession;
}

export function saveGuestSession(session: GuestSession): GuestSession {
  guestSession = session;
  writeStorage(GUEST_TOKEN_STORAGE_KEY, session.token);
  writeStorage(GUEST_USER_ID, session._id);
  writeStorage(GUEST_DISPLAY_NAME_KEY, session.display_name);
  return session;
}

export function clearGuestSession(): void {
  guestSession = null;
  removeStorage(GUEST_TOKEN_STORAGE_KEY);
  removeStorage(GUEST_USER_ID);
  removeStorage(GUEST_DISPLAY_NAME_KEY);
}

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
  return getGuestSession()?.token ?? null;
}

export async function getSessionIdentity(user: UserLike): Promise<SessionIdentity> {
  const authUserId = getAuthenticatedUserId(user);
  if (authUserId) {
    clearGuestSession();
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
  console.log("User is ", user, "calling create or get guest", data);
  const guestToken = await getOrCreateGuest(data);
  return {
    id: guestToken._id,
    type: "guest",
    isAuthenticated: false,
    isGuest: true,
  };
}

