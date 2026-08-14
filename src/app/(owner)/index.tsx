import bookmark3dIcon from "@/assets/images/illustrator-icons/3dicons-bookmark.png";
import calendar3dNoFigure from "@/assets/images/illustrator-icons/calendar-3d-no-figure.png";
import messages3dIcon from "@/assets/images/illustrator-icons/3dicons-chat-text.png";
import benz from "@/assets/images/illustrator-icons/benz.png";
import setting3dIcon from "@/assets/images/illustrator-icons/3dicons-setting.png";
import RoleSwitchTransition from "@/components/RoleSwitchTransition";
import { useAuth } from "@/contexts/AuthProvider";
import { useTabBounce } from "@/hooks/useTabBounce";
import { api } from "@/lib/convexApi";
import { useAppStateStore, getEffectiveAvatarUri } from "@/store/useAppStateStore";
import type { UserRole } from "@/store/useRoleStore";
import { useRoleStore } from "@/store/useRoleStore";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import {
  Alert,
  Animated,
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useEffect, useRef, useState, useCallback } from "react";
import OwnerListingsContent from "./_components/OwnerListingsContent";
import OwnerMessagesScreen from "./messages";
import WelcomeAuthScreen from "@/components/WelcomeAuthScreen";
import EmptyState from "@/components/EmptyState";

const NAVY = "#2C3E5B";

type OwnerTab = "today" | "calendar" | "listings" | "messages" | "menu";
type TodaySubTab = "today" | "upcoming";

function getTodayDateString() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

function isTodayBooking(booking: {
  startDate: string;
  endDate: string;
}): boolean {
  const today = getTodayDateString();
  return booking.startDate <= today && booking.endDate >= today;
}

export default function OwnerDashboard() {
  const router = useRouter();
  const { userId, signOut, signedIn, isLoaded } = useAuth();

  const convexUser = useQuery(
    api.users.getByUserId,
    userId ? { userId } : "skip",
  );

  const ownerBookings = useQuery(
    api.jobs.getOwnerBookings,
    convexUser?._id ? { ownerId: convexUser._id } : "skip",
  );

  const [activeTab, setActiveTab] = useState<OwnerTab>("today");
  const [activeSubTab, setActiveSubTab] = useState<TodaySubTab>("today");

  const todayBookings = ownerBookings?.filter(isTodayBooking) ?? [];
  const upcomingBookings =
    ownerBookings?.filter((b) => b.startDate > getTodayDateString()) ?? [];

  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<TextInput>(null);

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;
  const [tabBarWidth, setTabBarWidth] = useState(0);

  useEffect(() => {
    Animated.spring(tabIndicatorAnim, {
      toValue: activeSubTab === "today" ? 0 : 1,
      useNativeDriver: true,
      damping: 18,
      stiffness: 160,
      mass: 0.8,
    }).start();
  }, [activeSubTab]);
  const directionRef = useRef<"left" | "right">("right");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.97)).current;
  const isFirstRender = useRef(true);
  const prevTabRef = useRef(activeTab);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fadeAnim.setValue(1);
      slideY.setValue(0);
      scaleAnim.setValue(1);
      prevTabRef.current = activeTab;
      return;
    }

    const tabOrder = [
      "today",
      "calendar",
      "listings",
      "messages",
      "menu",
    ] as const;
    const prevIndex = tabOrder.indexOf(
      prevTabRef.current as (typeof tabOrder)[number],
    );
    const nextIndex = tabOrder.indexOf(activeTab as (typeof tabOrder)[number]);
    const direction: "left" | "right" =
      nextIndex > prevIndex ? "right" : "left";
    directionRef.current = direction;

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
  }, [activeTab, fadeAnim, slideY, scaleAnim]);

  const avatarUri = getEffectiveAvatarUri();
  const setAvatarUri = useAppStateStore((state) => state.setAvatarUri);
  const setHasSeenWelcome = useAppStateStore(
    (state) => state.setHasSeenWelcome,
  );
  const setRole = useRoleStore((state) => state.setRole);
  const [switchingRole, setSwitchingRole] = useState<UserRole | null>(null);
  const [welcomeVisible, setWelcomeVisible] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (signedIn) {
      setWelcomeVisible(false);
    }
  }, [isLoaded, signedIn]);

  const openAuth = () => {
    setWelcomeVisible(true);
  };

  const handleMenuLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await signOut();
    } catch {
      Alert.alert("Error", "Unable to log out. Please try again.");
    }
  };

  const handleSwitchToGuest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRole("client");
    setSwitchingRole("client");
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (switchingRole) {
          return true;
        }
        if (activeTab !== "menu") {
          setActiveTab("menu");
          return true;
        }
        BackHandler.exitApp();
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => subscription.remove();
    }, [switchingRole, activeTab]),
  );

  const handlePickAvatar = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission needed",
          "Please allow access to your photos to update your profile picture.",
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        const persistentUri = await copyImageToPersistentStorage(
          result.assets[0].uri,
        );
        setAvatarUri(persistentUri);
      }
    } catch {
      Alert.alert("Error", "Unable to pick image. Please try again.");
    }
  };

  const copyImageToPersistentStorage = async (uri: string): Promise<string> => {
    const baseDir = FileSystem.documentDirectory || "";
    const destination = `${baseDir.replace(/\/?$/, "")}/avatar-${Date.now()}.jpg`;
    await FileSystem.copyAsync({ from: uri, to: destination });
    return destination;
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideY }, { scale: scaleAnim }],
        }}
      >
        {activeTab === "messages" ? (
          <View
            style={{
              paddingTop: Platform.select({ ios: 60, android: 40 }),
              flex: 1,
            }}
          >
            {!signedIn ? (
              <EmptyState
                image={messages3dIcon}
                title="No messages"
                subtitle="Log in to view and send messages to guests."
                ctaText="Log in"
                onCtaPress={openAuth}
              />
            ) : (
              <OwnerMessagesScreen />
            )}
          </View>
        ) : (
          <>
            {activeTab === "menu" && !switchingRole && signedIn ? (
              <View style={styles.menuHeaderRow}>
                <Text style={styles.menuHeaderTitle}>Menu</Text>
                <View style={styles.menuHeaderRight}>
                  <TouchableOpacity
                    hitSlop={8}
                    style={styles.notificationButton}
                  >
                    <Ionicons
                      name="notifications-outline"
                      size={22}
                      color={NAVY}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handlePickAvatar}
                    activeOpacity={0.85}
                    style={styles.headerAvatarButton}
                  >
                    <View style={styles.headerAvatarRing}>
                      {avatarUri ? (
                        <Image
                          source={{ uri: avatarUri, cacheKey: avatarUri }}
                          style={styles.headerAvatar}
                          contentFit="cover"
                          transition={200}
                          onError={(e) => {
                            console.log(
                              "Avatar load error:",
                              e.error,
                              avatarUri,
                            );
                            setAvatarUri(null);
                          }}
                        />
                      ) : (
                        <View style={styles.headerAvatarPlaceholder}>
                          <Text style={styles.headerAvatarInitial}>
                            {convexUser?.firstName?.[0]?.toUpperCase() ?? "O"}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            ) : activeTab !== "menu" && !switchingRole ? (
              <View style={styles.menuHeaderSpacer} />
            ) : null}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              scrollEnabled={activeTab !== "calendar"}
            >
            {activeTab === "today" && (
              <View>
                {signedIn ? (
                  <View
                    style={styles.tabBar}
                    onLayout={(e) => setTabBarWidth(e.nativeEvent.layout.width)}
                  >
                    <Animated.View
                      style={[
                        styles.tabIndicator,
                        {
                          transform: [
                            {
                              translateX: tabIndicatorAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, tabBarWidth ? (tabBarWidth - 8) / 2 : 0],
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                    <View style={styles.tabRow}>
                      <TouchableOpacity
                        style={styles.tab}
                        onPress={() => setActiveSubTab("today")}
                      >
                        <Text
                          style={[
                            styles.tabText,
                            activeSubTab === "today" && styles.tabTextActive,
                          ]}
                        >
                          Today
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.tab}
                        onPress={() => setActiveSubTab("upcoming")}
                      >
                        <Text
                          style={[
                            styles.tabText,
                            activeSubTab === "upcoming" && styles.tabTextActive,
                          ]}
                        >
                          Upcoming
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}

                {!signedIn ? (
                  <EmptyState
                    image={bookmark3dIcon}
                    title="No reservations"
                    subtitle="Log in to view your bookings and start accepting reservations."
                    ctaText="Log in"
                    onCtaPress={openAuth}
                  />
                ) : activeSubTab === "today" ? (
                  todayBookings.length === 0 ? (
                    <EmptyState
                      image={bookmark3dIcon}
                      title="You don't have any reservations"
                      subtitle="To get booked, you'll need to complete and publish your listing."
                      ctaText="Complete your listing"
                      onCtaPress={() => router.push("/create-listing" as any)}
                    />
                  ) : (
                    <View style={styles.bookingsList}>
                      {todayBookings.map((booking) => (
                        <BookingCard key={booking._id} booking={booking} />
                      ))}
                    </View>
                  )
                ) : upcomingBookings.length === 0 ? (
                  <EmptyState
                    image={bookmark3dIcon}
                    title="No upcoming reservations"
                    subtitle="Your future bookings will appear here once you have active listings."
                  />
                ) : (
                  <View style={styles.bookingsList}>
                    {upcomingBookings.map((booking) => (
                      <BookingCard key={booking._id} booking={booking} />
                    ))}
                  </View>
                )}
              </View>
            )}

            {activeTab === "calendar" && (
              <View>
                {!signedIn ? (
                  <EmptyState
                    image={calendar3dNoFigure}
                    title="No calendar events"
                    subtitle="Log in to view and manage your availability calendar."
                    ctaText="Log in"
                    onCtaPress={openAuth}
                  />
                ) : (
                  <>
                    <View style={styles.calendarSearchBar}>
                      <Ionicons name="search" size={20} color="#6B7280" />
                      <TextInput
                        ref={searchInputRef}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search calendars"
                        placeholderTextColor="#9CA3AF"
                        style={styles.calendarSearchInput}
                      />
                      {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={handleClearSearch} hitSlop={8}>
                          <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={styles.centerContent}>
                      <EmptyState
                        image={calendar3dNoFigure}
                        title="No calendar events"
                        subtitle="When you publish a listing you&apos;ll be able to see and edit your calendar here."
                      />
                    </View>
                  </>
                )}
              </View>
            )}

            {activeTab === "listings" && (
              <View style={{ marginTop: 10 }}>
                {!signedIn ? (
                  <EmptyState
                    image={benz}
                    title="No listings"
                    subtitle="Log in to create and manage your vehicles."
                    ctaText="Log in"
                    onCtaPress={openAuth}
                  />
                ) : (
                  <OwnerListingsContent />
                )}
              </View>
            )}

            {activeTab === "menu" && (
              <View
                style={
                  !signedIn
                    ? { paddingTop: Platform.select({ ios: 60, android: 40 }) }
                    : undefined
                }
              >
                {!signedIn ? (
                  <EmptyState
                    image={setting3dIcon}
                    title="No menu"
                    subtitle="Log in to access your owner dashboard, manage your vehicles, and view bookings."
                    ctaText="Log in"
                    onCtaPress={openAuth}
                  />
                ) : (
                  <>
                    <View style={styles.onboardingCard}>
                  <View style={styles.cardImagesRow}>
                    <View style={styles.cardImagePlaceholder}>
                      <Ionicons
                        name="image-outline"
                        size={28}
                        color="#9CA3AF"
                      />
                    </View>
                    <View style={styles.cardImagePlaceholder}>
                      <Ionicons
                        name="image-outline"
                        size={28}
                        color="#9CA3AF"
                      />
                    </View>
                    <View style={styles.cardImagePlaceholder}>
                      <Ionicons
                        name="image-outline"
                        size={28}
                        color="#9CA3AF"
                      />
                    </View>
                  </View>
                  <Text style={styles.onboardingTitle}>New to hosting?</Text>
                  <Text style={styles.onboardingSubtitle}>
                    Discover tips and best practices shared by top-rated hosts.
                  </Text>
                  <TouchableOpacity style={styles.onboardingButton}>
                    <Text style={styles.onboardingButtonText}>Get started</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.switchToGuestButton}
                    onPress={handleSwitchToGuest}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.switchToGuestText}>
                      Switch to Guest
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.menuSection}>
                  <TouchableOpacity
                    style={[styles.menuItem, styles.menuItemBorder]}
                    onPress={() => router.push("/(owner)/profile" as any)}
                  >
                    <View style={styles.menuIconWrap}>
                      <Ionicons
                        name="settings-outline"
                        size={20}
                        color={NAVY}
                      />
                    </View>
                    <Text style={styles.menuLabel}>Account settings</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.menuItem, styles.menuItemBorder]}
                  >
                    <View style={styles.menuIconWrap}>
                      <Ionicons name="book-outline" size={20} color={NAVY} />
                    </View>
                    <Text style={styles.menuLabel}>Hosting resources</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.menuItem, styles.menuItemBorder]}
                  >
                    <View style={styles.menuIconWrap}>
                      <Ionicons
                        name="help-circle-outline"
                        size={20}
                        color={NAVY}
                      />
                    </View>
                    <Text style={styles.menuLabel}>Get help</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.menuItem, styles.menuItemBorder]}
                  >
                    <View style={styles.menuIconWrap}>
                      <Ionicons name="people-outline" size={20} color={NAVY} />
                    </View>
                    <Text style={styles.menuLabel}>Find a co-host</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.menuItem, styles.menuItemBorder]}
                    onPress={() => router.push("/create-listing" as any)}
                  >
                    <View style={styles.menuIconWrap}>
                      <Ionicons
                        name="add-circle-outline"
                        size={20}
                        color={NAVY}
                      />
                    </View>
                    <Text style={styles.menuLabel}>Create a new listing</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.menuItem, styles.menuItemBorder]}
                  >
                    <View style={styles.menuIconWrap}>
                      <Ionicons name="people-outline" size={20} color={NAVY} />
                    </View>
                    <Text style={styles.menuLabel}>Refer a host</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuIconWrap}>
                      <Ionicons
                        name="document-text-outline"
                        size={20}
                        color={NAVY}
                      />
                    </View>
                    <Text style={styles.menuLabel}>Legal</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.logoutContainer}>
                  <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleMenuLogout}
                    activeOpacity={0.7}
                  >
                    <View style={styles.logoutIconWrap}>
                      <Ionicons name="power-outline" size={20} color="#E74C3C" />
                    </View>
                    <Text style={styles.logoutText}>Log Out</Text>
                  </TouchableOpacity>
                </View>
                  </>
                )}
              </View>
            )}
          </ScrollView>
          </>
        )}
      </Animated.View>

      {!switchingRole ? (
        <View style={styles.bottomNav}>
          <NavItem
            icon="bookmark"
            label="Today"
            active={activeTab === "today"}
            onPress={() => setActiveTab("today")}
          />
          <NavItem
            icon="calendar"
            label="Calendar"
            active={activeTab === "calendar"}
            onPress={() => setActiveTab("calendar")}
          />
          <NavItem
            icon="cube-outline"
            label="Listings"
            active={activeTab === "listings"}
            onPress={() => setActiveTab("listings")}
          />
          <NavItem
            icon="chatbubble-ellipses-outline"
            label="Messages"
            active={activeTab === "messages"}
            onPress={() => setActiveTab("messages")}
          />
          <NavItem
            icon="menu"
            label="Menu"
            active={activeTab === "menu"}
            onPress={() => setActiveTab("menu")}
          />
        </View>
      ) : null}

      {switchingRole ? (
        <RoleSwitchTransition role={switchingRole} fromRole="owner" />
      ) : null}

      {welcomeVisible && (
        <WelcomeAuthScreen
          onDismiss={() => {
            setWelcomeVisible(false);
            setHasSeenWelcome(true);
          }}
        />
      )}
    </View>
  );
}

function BookingCard({ booking }: { booking: any }) {
  const router = useRouter();
  const statusColor =
    booking.status === "confirmed"
      ? "#10B981"
      : booking.status === "pending"
        ? "#F59E0B"
        : "#6B7280";

  return (
    <TouchableOpacity
      style={styles.bookingCard}
      onPress={() => {
        const path = "/booking/" + booking._id;
        router.push(path as any);
      }}
    >
      <View style={styles.bookingHeader}>
        <View
          style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}
        >
          <Text style={[styles.statusText, { color: statusColor }]}>
            {booking.status}
          </Text>
        </View>
        <Text style={styles.bookingDates}>
          {booking.startDate} → {booking.endDate}
        </Text>
      </View>
      <Text style={styles.bookingLocation} numberOfLines={1}>
        {booking.pickupLocation} → {booking.dropoffLocation}
      </Text>
      <View style={styles.bookingFooter}>
        <Text style={styles.bookingAmount}>
          GHS {booking.totalAmount.toLocaleString()}
        </Text>
        <Text style={styles.bookingPayment}>{booking.paymentStatus}</Text>
      </View>
    </TouchableOpacity>
  );
}

function NavItem({
  icon,
  label,
  active,
  activeColor,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  activeColor?: string;
  onPress?: () => void;
}) {
  const { animatedStyle, bounce } = useTabBounce();
  const color = active ? activeColor || NAVY : "#9CA3AF";
  return (
    <Pressable
      style={styles.navItem}
      onPress={() => {
        bounce();
        onPress?.();
      }}
    >
      <Animated.View style={animatedStyle}>
        <Ionicons name={icon} size={22} color={color} />
      </Animated.View>
      <Text style={[styles.navLabel, active && { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingTop: 0,
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  menuHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.select({ ios: 60, android: 40 }),
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  menuHeaderSpacer: {
    paddingTop: Platform.select({ ios: 60, android: 40 }),
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  menuHeaderTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: NAVY,
  },
  menuHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notificationButton: {
    padding: 8,
  },
  headerAvatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
  },
  headerAvatarRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  headerAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarInitial: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  profileSection: {
    alignItems: "center",
    marginTop: 0,
    marginBottom: 24,
  },
  onboardingCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  cardImagesRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  cardImagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  onboardingTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  onboardingSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  onboardingButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    minWidth: 180,
    alignItems: "center",
  },
  onboardingButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  switchToGuestButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: NAVY,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    minWidth: 180,
    marginTop: 12,
  },
  switchToGuestText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  menuSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
    gap: 16,
  },
  menuItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  menuIconWrap: {
    width: 24,
    alignItems: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: NAVY,
  },
  logoutContainer: {
    marginBottom: 0,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    marginBottom: 0,
  },
  logoutIconWrap: {
    width: 24,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#E74C3C",
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#1E40AF",
    lineHeight: 18,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
    marginTop: 10,
    position: "relative",
    overflow: "hidden",
  },
  tabIndicator: {
    position: "absolute",
    top: 4,
    left: 4,
    width: "50%",
    height: "100%",
    backgroundColor: "#2C3E5B",
    borderRadius: 12,
  },
  tabRow: {
    flexDirection: "row",
    flex: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: "transparent",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  illustrationWrap: {
    marginBottom: 24,
  },
  emptyImage: {
    width: 180,
    height: 180,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: NAVY,
    textAlign: "center",
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  ctaButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  bookingsList: {
    gap: 12,
  },
  bookingCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  bookingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  bookingDates: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  bookingLocation: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    lineHeight: 20,
  },
  bookingFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  bookingAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: NAVY,
  },
  bookingPayment: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "capitalize",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchExpandWrap: {
    overflow: "hidden",
    height: 40,
    justifyContent: "center",
  },
  searchInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F8F8F8",
    borderRadius: 20,
    paddingLeft: 8,
    paddingRight: 14,
    paddingVertical: 10,
    height: 40,
    borderWidth: 2,
    borderColor: NAVY,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: NAVY,
    paddingVertical: 0,
    textAlign: "left",
  },
  calendarSearchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    height: 44,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    marginBottom: 24,
    marginTop: 10,
  },
  calendarSearchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: NAVY,
    paddingVertical: 0,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: NAVY,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: NAVY,
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 60,
    gap: 0,
  },
  message: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    textAlign: "center",
    lineHeight: 24,
  },
  infoText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
    paddingVertical: 10,
    paddingBottom: Platform.select({ ios: 20, android: 16 }),
    paddingHorizontal: 12,
  },
  navItem: {
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
  },
});
