import { useRef, useState, useEffect, useCallback } from "react";
import { Animated, BackHandler } from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "@/contexts/AuthProvider";
import { useAppStateStore, getEffectiveAvatarUri } from "@/store/useAppStateStore";
import { useRoleStore } from "@/store/useRoleStore";
import type { UserRole } from "@/store/useRoleStore";

export type DashboardTab = string;

interface UseDashboardShellOptions {
  tabs: readonly DashboardTab[];
  defaultTab?: DashboardTab;
  backTargetTab?: DashboardTab;
}

export function useDashboardShell(options: UseDashboardShellOptions) {
  const {
    tabs,
    defaultTab,
    backTargetTab = tabs[tabs.length - 1],
  } = options;

  const router = useRouter();
  const { signOut, signedIn, isLoaded } = useAuth();

  const [activeTab, setActiveTab] = useState<DashboardTab>(defaultTab || tabs[0]);
  const [switchingRole, setSwitchingRole] = useState<UserRole | null>(null);
  const [welcomeVisible, setWelcomeVisible] = useState(false);

  const avatarUri = getEffectiveAvatarUri();
  const setAvatarUri = useAppStateStore((state) => state.setAvatarUri);
  const setRole = useRoleStore((state) => state.setRole);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.97)).current;
  const isFirstRender = useRef(true);
  const prevTabRef = useRef(activeTab);
  const switchingRoleRef = useRef<UserRole | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (signedIn) {
      setWelcomeVisible(false);
    }
  }, [isLoaded, signedIn]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fadeAnim.setValue(1);
      slideY.setValue(0);
      scaleAnim.setValue(1);
      prevTabRef.current = activeTab;
      return;
    }

    const prevIndex = tabs.indexOf(prevTabRef.current);
    const nextIndex = tabs.indexOf(activeTab);
    const direction: "left" | "right" =
      nextIndex > prevIndex ? "right" : "left";

    fadeAnim.setValue(0);
    slideY.setValue(direction === "right" ? 18 : -18);
    scaleAnim.setValue(0.97);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        easing: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
        useNativeDriver: true,
      }),
      Animated.timing(slideY, {
        toValue: 0,
        duration: 280,
        easing: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 18,
        stiffness: 160,
        mass: 0.8,
        useNativeDriver: true,
      }),
    ]).start();

    prevTabRef.current = activeTab;
  }, [activeTab, tabs, fadeAnim, slideY, scaleAnim]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (switchingRoleRef.current) {
          return true;
        }
        if (activeTab !== backTargetTab) {
          setActiveTab(backTargetTab);
          return true;
        }
        BackHandler.exitApp();
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => subscription.remove();
    }, [activeTab, backTargetTab])
  );

  const openAuth = useCallback(() => {
    setWelcomeVisible(true);
  }, []);

  const handleSwitchToGuest = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRole("client");
    setSwitchingRole("client");
    switchingRoleRef.current = "client";
  }, [setRole]);

  const handleSwitchToOwner = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRole("owner");
    setSwitchingRole("owner");
    switchingRoleRef.current = "owner";
  }, [setRole]);

  const handleSwitchToDriver = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRole("driver");
    setSwitchingRole("driver");
    switchingRoleRef.current = "driver";
  }, [setRole]);

  const handleSwitchToCorporate = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRole("corporate");
    setSwitchingRole("corporate");
    switchingRoleRef.current = "corporate";
  }, [setRole]);

  const clearSwitchingRole = useCallback(() => {
    setSwitchingRole(null);
    switchingRoleRef.current = null;
  }, []);

  const handleMenuLogout = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await signOut();
    } catch {
      // silent
    }
  }, [signOut]);

  return {
    activeTab,
    setActiveTab,
    switchingRole,
    setSwitchingRole,
    clearSwitchingRole,
    welcomeVisible,
    setWelcomeVisible,
    openAuth,
    fadeAnim,
    slideY,
    scaleAnim,
    avatarUri,
    setAvatarUri,
    signedIn,
    isLoaded,
    handleSwitchToGuest,
    handleSwitchToOwner,
    handleSwitchToDriver,
    handleSwitchToCorporate,
    handleMenuLogout,
    router,
    tabs,
  };
}
