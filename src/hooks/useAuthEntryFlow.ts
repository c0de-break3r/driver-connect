import { useCallback, useEffect, useState } from "react";
import { useSignIn, useSSO } from "@clerk/expo";

export type AuthEntryFlowState = {
  step: "input" | "verify";
  identifier: string;
  setIdentifier: (value: string) => void;
  otp: string;
  setOtp: (value: string) => void;
  loading: boolean;
  loadingProvider: "email" | "google" | "apple" | null;
  error: string | null;
  success: boolean;
  canSubmit: boolean;
  canVerify: boolean;
  resendCooldown: number;
  recognizedUser: {
    firstName?: string;
  } | null;
  handleSendCode: () => Promise<void>;
  handleLogin: () => Promise<void>;
  handleVerifyCode: () => Promise<void>;
  handleGoogleSignIn: () => Promise<void>;
  handleAppleSignIn: () => Promise<void>;
  reset: () => void;
};

export function useAuthEntryFlow(): AuthEntryFlowState {
  const { signIn } = useSignIn();
  const { startSSOFlow } = useSSO();
  const [step, setStep] = useState<"input" | "verify">("input");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<"email" | "google" | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [recognizedUser, setRecognizedUser] = useState<{
    firstName?: string;
  } | null>(null);

  const looksLikeEmail = identifier.includes("@") && identifier.includes(".");
  const canSubmit = identifier.trim().length > 0 && resendCooldown === 0 && !recognizedUser;
  const canVerify = otp.trim().length >= 6;

  useEffect(() => {
    let timerId: ReturnType<typeof setInterval>;
    if (resendCooldown > 0) {
      timerId = setInterval(() => {
        setResendCooldown((current) => {
          if (current <= 1) {
            return 0;
          }
          return current - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [resendCooldown]);

  const handleSendCode = useCallback(async () => {
    if (!canSubmit || !signIn) return;
    setError(null);
    setLoading(true);
    setLoadingProvider("email");
    try {
      const trimmed = identifier.trim();
      if (looksLikeEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) {
          setError("Please enter a valid email address.");
          setLoading(false);
          setLoadingProvider(null);
          return;
        }
      } else {
        const phoneRegex = /^\+[1-9]\d{6,14}$/;
        if (!phoneRegex.test(trimmed)) {
          setError("Please enter a valid phone number with country code (e.g. +1234567890).");
          setLoading(false);
          setLoadingProvider(null);
          return;
        }
      }

      const createResult = await signIn.create({
        identifier: trimmed,
      });

      if (createResult.error) {
        setError(createResult.error.message || "Failed to start sign-in. Please try again.");
        setLoading(false);
        setLoadingProvider(null);
        return;
      }

      if (signIn.userData?.firstName) {
        setRecognizedUser({
          firstName: signIn.userData.firstName,
        });
        setLoading(false);
        setLoadingProvider(null);
        return;
      }

      if (looksLikeEmail) {
        await signIn.emailCode.sendCode({
          emailAddress: trimmed,
        });
      } else {
        await signIn.phoneCode.sendCode({
          phoneNumber: trimmed,
        });
      }
      setSuccess(true);
      setStep("verify");
      setResendCooldown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send confirmation code. Please try again.");
    } finally {
      setLoading(false);
      setLoadingProvider(null);
    }
  }, [identifier, canSubmit, looksLikeEmail, signIn]);

  const handleLogin = useCallback(async () => {
    if (!signIn || !recognizedUser) return;
    setError(null);
    setLoading(true);
    setLoadingProvider("email");
    try {
      if (looksLikeEmail) {
        await signIn.emailCode.sendCode({
          emailAddress: identifier.trim(),
        });
      } else {
        await signIn.phoneCode.sendCode({
          phoneNumber: identifier.trim(),
        });
      }
      setSuccess(true);
      setStep("verify");
      setResendCooldown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send confirmation code. Please try again.");
    } finally {
      setLoading(false);
      setLoadingProvider(null);
    }
  }, [signIn, recognizedUser, identifier, looksLikeEmail]);

  const handleVerifyCode = useCallback(async () => {
    if (!canVerify || !signIn) return;
    setError(null);
    setLoading(true);
    try {
      if (looksLikeEmail) {
        await signIn.emailCode.verifyCode({
          code: otp.trim(),
        });
      } else {
        await signIn.phoneCode.verifyCode({
          code: otp.trim(),
        });
      }
      await signIn.finalize();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify code. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [otp, canVerify, looksLikeEmail, signIn]);

  const handleGoogleSignIn = useCallback(async () => {
    if (!startSSOFlow) return;
    setError(null);
    setLoading(true);
    setLoadingProvider("google");
    try {
      const result = await startSSOFlow({
        strategy: "oauth_google",
      });
      if (result.createdSessionId && result.setActive) {
        await result.setActive({ session: result.createdSessionId });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
      setLoadingProvider(null);
    }
  }, [startSSOFlow]);

  const handleAppleSignIn = useCallback(async () => {
    if (!startSSOFlow) return;
    setError(null);
    setLoading(true);
    setLoadingProvider("apple");
    try {
      const result = await startSSOFlow({
        strategy: "oauth_apple",
      });
      if (result.createdSessionId && result.setActive) {
        await result.setActive({ session: result.createdSessionId });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in with Apple. Please try again.");
    } finally {
      setLoading(false);
      setLoadingProvider(null);
    }
  }, [startSSOFlow]);

  const reset = useCallback(() => {
    setStep("input");
    setIdentifier("");
    setOtp("");
    setError(null);
    setSuccess(false);
    setLoading(false);
    setLoadingProvider(null);
    setResendCooldown(0);
    setRecognizedUser(null);
  }, []);

  return {
    step,
    identifier,
    setIdentifier,
    otp,
    setOtp,
    loading,
    loadingProvider,
    error,
    success,
    canSubmit,
    canVerify,
    resendCooldown,
    recognizedUser,
    handleSendCode,
    handleLogin,
    handleVerifyCode,
    handleGoogleSignIn,
    handleAppleSignIn,
    reset,
  };
}
