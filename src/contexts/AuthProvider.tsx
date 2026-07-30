import { createContext, useContext } from "react";
import { AuthContext } from "./AuthContext";

type AuthValue = ReturnType<typeof AuthContext>;

const AuthContextWrapper = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = AuthContext();

  return (
    <AuthContextWrapper.Provider value={auth}>
      {children}
    </AuthContextWrapper.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContextWrapper);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
