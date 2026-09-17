import { useState, useCallback, useRef } from "react";

type ToastType = "success" | "error" | "info" | "warning";

type ToastState = {
  visible: boolean;
  message: string;
  type: ToastType;
};

type UseToastReturn = {
  toast: ToastState;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
};

const TOAST_COOLDOWN_MS = 2500;

export function useToast(duration = 2500): UseToastReturn {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: "",
    type: "success",
  });
  const lastMessageRef = useRef<string>("");
  const lastTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const now = Date.now();
      if (message === lastMessageRef.current && now - lastTimeRef.current < TOAST_COOLDOWN_MS) {
        return;
      }
      lastMessageRef.current = message;
      lastTimeRef.current = now;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setToast({ visible: true, message, type });
      timerRef.current = setTimeout(() => {
        hideToast();
        timerRef.current = null;
      }, duration);
    },
    [duration, hideToast]
  );

  return {
    toast,
    showToast,
    hideToast,
  };
}
