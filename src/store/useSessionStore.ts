import { create } from "zustand";

export type SessionState = {
  /** Current authenticated user ID, if any. */
  currentUserId: string | null;
  /** Whether onboarding data is tied to an active session. */
  isSessionActive: boolean;
  /** Set the current user for the session. */
  setCurrentUser: (userId: string | null) => void;
  /** Clear the current session and reset onboarding state. */
  clearSession: () => void;
};

const initialState = {
  currentUserId: null,
  isSessionActive: false,
};

export const useSessionStore = create<SessionState>()((set) => ({
  ...initialState,
  setCurrentUser: (userId) =>
    set({
      currentUserId: userId,
      isSessionActive: !!userId,
    }),
  clearSession: () =>
    set({
      currentUserId: null,
      isSessionActive: false,
    }),
}));
