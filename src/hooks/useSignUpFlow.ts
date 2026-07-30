import { useCallback, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { supabase } from "@/lib/supabase";

export type SignUpFlowState = {
  email: string;
  password: string;
  fullName: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setFullName: (name: string) => void;
  loading: boolean;
  error: string | null;
  pendingVerification: boolean;
  code: string;
  setCode: (code: string) => void;
  canSubmit: boolean;
  canVerify: boolean;
  handleSubmit: () => Promise<void>;
  handleVerify: () => Promise<void>;
  handleResendCode: () => Promise<void>;
  setPendingVerification: (pending: boolean) => void;
};

export function useSignUpFlow(): SignUpFlowState {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length >= 6 && fullName.trim().length > 0;
  const canVerify = code.trim().length >= 6;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      const [firstName, ...lastNameParts] = fullName.trim().split(" ");
      const lastName = lastNameParts.join(" ") || "";
      const { error } = await signUp(email.trim(), password, {
        first_name: firstName,
        last_name: lastName,
        full_name: fullName.trim(),
      });
      if (error) {
        setError(error.message);
      } else {
<<<<<<< HEAD
        const signUpResource = signUp as any;
        const reloadedSignUp = await signUpResource.reload?.();
        const currentSignUp = reloadedSignUp ?? signUpResource;

        const { error: sendError } =
          await currentSignUp.verifications.sendEmailCode();
        if (sendError) {
          setError(sendError.longMessage ?? sendError.message);
        } else {
          setPendingVerification(true);
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
        }
=======
        setPendingVerification(true);
>>>>>>> 33eb3cd (updates)
      }
    } catch {
      setError("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [signUp, email, password, fullName, canSubmit]);

  const handleVerify = useCallback(async () => {
    if (!canVerify) return;
    setError(null);
    setLoading(true);
    try {
<<<<<<< HEAD
      const signUpResource = signUp as any;
      const reloadedSignUp = await signUpResource.reload?.();
      const activeSignUp = reloadedSignUp ?? signUpResource;

      const { error } =
        await activeSignUp.verifications.verifyEmailCode({ code: code.trim() });
      if (error) {
        setError(error.longMessage ?? error.message);
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error
        );
        return;
      }

      try {
        const reloaded = await activeSignUp.reload?.();
        const finalSignUp = reloaded ?? activeSignUp;

        if (finalSignUp.status === "complete") {
          const { error: finalizeError } = await finalSignUp.finalize();
          if (finalizeError) {
            setError(finalizeError.longMessage ?? finalizeError.message);
            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Error
            );
            return;
          }
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
          navigatePostAuth();
        } else {
          setError("Verification incomplete. Please try again.");
        }
      } catch (reloadError) {
        console.warn("Failed to reload sign-up after verify:", reloadError);
=======
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: "email",
      });
      if (error) {
        setError(error.message);
      } else if (data.session) {
        setPendingVerification(false);
      } else {
>>>>>>> 33eb3cd (updates)
        setError("Verification incomplete. Please try again.");
      }
    } catch {
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [email, code, canVerify]);

  const handleResendCode = useCallback(async () => {
    try {
<<<<<<< HEAD
      const signUpResource = signUp as any;
      const reloadedSignUp = await signUpResource.reload?.();
      const activeSignUp = reloadedSignUp ?? signUpResource;
      await activeSignUp.verifications.sendEmailCode();
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
=======
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
      });
      if (error) {
        setError(error.message);
      }
>>>>>>> 33eb3cd (updates)
    } catch {
      setError("Failed to resend code.");
    }
  }, [email]);

  return {
    email,
    password,
    fullName,
    setEmail,
    setPassword,
    setFullName,
    loading,
    error,
    pendingVerification,
    code,
    setCode,
    canSubmit,
    canVerify,
    handleSubmit,
    handleVerify,
    handleResendCode,
    setPendingVerification,
  };
}
