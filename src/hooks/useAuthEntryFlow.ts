import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";
import * as WebBrowser from "expo-web-browser";

export type AuthEntryFlowState = {
  identifier: string;
  setIdentifier: (value: string) => void;
  loading: boolean;
  error: string | null;
  success: boolean;
  canSubmit: boolean;
  handleMagicLink: () => Promise<void>;
  handleGoogleSignIn: (onSuccess?: () => void) => Promise<void>;
  reset: () => void;
};

export function useAuthEntryFlow(): AuthEntryFlowState {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const looksLikeEmail = identifier.includes("@");
  const canSubmit = identifier.trim().length > 0;

  const handleMagicLink = useCallback(async () => {
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      if (looksLikeEmail) {
        const { error } = await supabase.auth.signInWithOtp({
          email: identifier.trim(),
          options: {
            shouldCreateUser: true,
          },
        });
        if (error) {
          setError(error.message);
        } else {
          setSuccess(true);
        }
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        phone: identifier.trim(),
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Failed to send confirmation code. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [identifier, canSubmit, looksLikeEmail]);

  const handleGoogleSignIn = useCallback(async (onSuccess?: () => void) => {
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "driverconnect://",
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data?.url) {
        await WebBrowser.openBrowserAsync(data.url);
      }

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          onSuccess?.();
        }
      } catch {
        // ignore session check failure
      }
    } catch {
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIdentifier("");
    setError(null);
    setSuccess(false);
    setLoading(false);
  }, []);

  return {
    identifier,
    setIdentifier,
    loading,
    error,
    success,
    canSubmit,
    handleMagicLink,
    handleGoogleSignIn,
    reset,
  };
}
