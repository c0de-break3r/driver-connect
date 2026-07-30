import { useCallback, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";

export type SignInFlowState = {
  email: string;
  password: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  loading: boolean;
  error: string | null;
  canSubmit: boolean;
  handleSubmit: () => Promise<void>;
};

export function useSignInFlow(): SignInFlowState {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        setError(error.message);
      }
    } catch {
      setError("Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [signIn, email, password, canSubmit]);

  return {
    email,
    password,
    setEmail,
    setPassword,
    loading,
    error,
    canSubmit,
    handleSubmit,
  };
}
