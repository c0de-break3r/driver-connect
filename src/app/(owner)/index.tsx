import RoleSwitchTransition from "@/components/RoleSwitchTransition";
import WelcomeAuthScreen from "@/components/WelcomeAuthScreen";
import { useAuth } from "@/contexts/AuthProvider";
import { useTabBounce } from "@/hooks/useTabBounce";
import { useDashboardShell } from "@/hooks/useDashboardShell";
import { api } from "@/lib/convexApi";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import OwnerListingsContent from "./_components/OwnerListingsContent";
import OwnerMessagesScreen from "./messages";
import { createCardStyle, PressableCard, StatusBadge, Divider } from "@/components/DesignSystem";

const NAVY = "#2C3E5B";

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

const OWNER_TABS = [
  "today",
  "calendar",
  "listings",
  "messages",
  "menu",
] as const;

function IconEmptyState({
  icon,
  title,
  subtitle,
  ctaText,
  onCtaPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  ctaText?: string;
  onCtaPress?: () => void;
}) {
  return (
    <View style={styles.iconEmptyState}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={32} color="#9CA3AF" />
      </View>
      <Text style={styles.iconEmptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.iconEmptySubtitle}>{subtitle}</Text>}
      {ctaText && onCtaPress && (
        <TouchableOpacity style={styles.iconCtaButton} onPress={onCtaPress}>
          <Text style={styles.iconCtaButtonText}>{ctaText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function OwnerDashboard() {
  const router = useRouter();
  const { userId } = useAuth();

  const convexUser = useQuery(
    api.users.getByUserId,
    userId ? { userId } : "skip",
  );

  const ownerBookings = useQuery(
    api.jobs.getOwnerBookings,
    convexUser?._id ? { ownerId: convexUser._id } : "skip",
  );

  const {
    activeTab,
    setActiveTab,
    switchingRole,
    welcomeVisible,
    setWelcomeVisible,
    openAuth,
    fadeAnim,
    slideY,
    scaleAnim,
    avatarUri,
    setAvatarUri,
    signedIn,
    handleMenuLogout,
  } = useDashboardShell({
    tabs: OWNER_TABS,
    defaultTab: "today",
    backTargetTab: "menu",
  });

  const [activeSubTab, setActiveSubTab] = useState<TodaySubTab>("today");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTab]);

  const todayBookings = ownerBookings?.filter(isTodayBooking) ?? [];
  const upcomingBookings =
    ownerBookings?.filter((b) => b.startDate > getTodayDateString()) ?? [];

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
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
              <IconEmptyState
                icon="chatbubble-ellipses-outline"
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
                    onPress={() => router.push("/notifications" as any)}
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
                      onLayout={(e) =>
                        setTabBarWidth(e.nativeEvent.layout.width)
                      }
                    >
                      <Animated.View
                        style={[
                          styles.tabIndicator,
                          {
                            transform: [
                              {
                                translateX: tabIndicatorAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [
                                    0,
                                    tabBarWidth ? (tabBarWidth - 8) / 2 : 0,
                                  ],
                                }),
                              },
                            ],
                          },
                        ]}
                      />
                      <View style={styles.tabRow}>
                        <Pressable
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
                        </Pressable>
                        <Pressable
                          style={styles.tab}
                          onPress={() => setActiveSubTab("upcoming")}
                        >
                          <Text
                            style={[
                              styles.tabText,
                              activeSubTab === "upcoming" &&
                                styles.tabTextActive,
                            ]}
                          >
                            Upcoming
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : null}

                  {!signedIn ? (
                    <IconEmptyState
                      icon="calendar-outline"
                      title="No reservations"
                      subtitle="Log in to view your bookings and start accepting reservations."
                      ctaText="Log in"
                      onCtaPress={openAuth}
                    />
                  ) : activeSubTab === "today" ? (
                    todayBookings.length === 0 ? (
                      <IconEmptyState
                        icon="calendar-outline"
                        title="No reservations today"
                        subtitle="To get booked, you'll need to complete and publish your listing."
                        ctaText="Complete your listing"
                        onCtaPress={() =>
                          router.push("/create-listing" as any)
                        }
                      />
                    ) : (
                      <View style={styles.bookingsList}>
                        {todayBookings.map((booking) => (
                          <BookingCard
                            key={booking._id}
                            booking={booking}
                            formatDate={formatDate}
                          />
                        ))}
                      </View>
                    )
                  ) : upcomingBookings.length === 0 ? (
                    <IconEmptyState
                      icon="calendar-outline"
                      title="No upcoming reservations"
                      subtitle="Your future bookings will appear here once you have active listings."
                    />
                  ) : (
                    <View style={styles.bookingsList}>
                      {upcomingBookings.map((booking) => (
                        <BookingCard
                          key={booking._id}
                          booking={booking}
                          formatDate={formatDate}
                        />
                      ))}
                    </View>
                  )}
                </View>
              )}

              {activeTab === "calendar" && (
                <View>
                  {!signedIn ? (
                    <IconEmptyState
                      icon="calendar-outline"
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
                          <TouchableOpacity
                            onPress={handleClearSearch}
                            hitSlop={8}
                          >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      <TouchableOpacity
                        style={styles.viewFullCalendarButton}
                        onPress={() => router.push("/(owner)/calendar-dashboard" as any)}
                      >
                        <Ionicons name="calendar" size={18} color="#FFFFFF" />
                        <Text style={styles.viewFullCalendarButtonText}>
                          View Full Calendar
                        </Text>
                      </TouchableOpacity>
                      <IconEmptyState
                        icon="calendar-outline"
                        title="No calendar events"
                        subtitle="When you publish a listing you'll be able to see and edit your calendar here."
                      />
                    </>
                  )}
                </View>
              )}

              {activeTab === "listings" && (
                <View style={{ marginTop: 10 }}>
                  {!signedIn ? (
                    <IconEmptyState
                      icon="car-outline"
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
                    <IconEmptyState
                      icon="settings-outline"
                      title="No menu"
                      subtitle="Log in to access your owner dashboard, manage your vehicles, and view bookings."
                      ctaText="Log in"
                      onCtaPress={openAuth}
                    />
                  ) : (
                    <>
                      <View style={createCardStyle()}>
                        <TouchableOpacity
                          style={styles.menuItem}
                          onPress={() =>
                            router.push("/(owner)/profile" as any)
                          }
                        >
                          <View style={styles.menuIconWrap}>
                            <Ionicons
                              name="settings-outline"
                              size={20}
                              color={NAVY}
                            />
                          </View>
                          <View style={styles.menuTextWrap}>
                            <Text style={styles.menuLabel}>Account settings</Text>
                            <Text style={styles.menuSub}>Profile, notifications, and preferences</Text>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={18}
                            color="#9CA3AF"
                          />
                        </TouchableOpacity>
                        <Divider />
                        <TouchableOpacity
                          style={styles.menuItem}
                        >
                          <View style={styles.menuIconWrap}>
                            <Ionicons
                              name="book-outline"
                              size={20}
                              color={NAVY}
                            />
                          </View>
                          <View style={styles.menuTextWrap}>
                            <Text style={styles.menuLabel}>Hosting resources</Text>
                            <Text style={styles.menuSub}>Tips, guides, and best practices</Text>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={18}
                            color="#9CA3AF"
                          />
                        </TouchableOpacity>
                        <Divider />
                        <TouchableOpacity
                          style={styles.menuItem}
                        >
                          <View style={styles.menuIconWrap}>
                            <Ionicons
                              name="help-circle-outline"
                              size={20}
                              color={NAVY}
                            />
                          </View>
                          <View style={styles.menuTextWrap}>
                            <Text style={styles.menuLabel}>Get help</Text>
                            <Text style={styles.menuSub}>Support, safety, and account help</Text>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={18}
                            color="#9CA3AF"
                          />
                        </TouchableOpacity>
                        <Divider />
                        <TouchableOpacity
                          style={styles.menuItem}
                        >
                          <View style={styles.menuIconWrap}>
                            <Ionicons
                              name="people-outline"
                              size={20}
                              color={NAVY}
                            />
                          </View>
                          <View style={styles.menuTextWrap}>
                            <Text style={styles.menuLabel}>Find a co-host</Text>
                            <Text style={styles.menuSub}>Add trusted helpers to your listings</Text>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={18}
                            color="#9CA3AF"
                          />
                        </TouchableOpacity>
                        <Divider />
                        <TouchableOpacity
                          style={styles.menuItem}
                          onPress={() =>
                            router.push("/create-listing" as any)
                          }
                        >
                          <View style={styles.menuIconWrap}>
                            <Ionicons
                              name="add-circle-outline"
                              size={20}
                              color={NAVY}
                            />
                          </View>
                          <View style={styles.menuTextWrap}>
                            <Text style={styles.menuLabel}>
                              Create a new listing
                            </Text>
                            <Text style={styles.menuSub}>List a vehicle for guests</Text>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={18}
                            color="#9CA3AF"
                          />
                        </TouchableOpacity>
                        <Divider />
                        <TouchableOpacity
                          style={styles.menuItem}
                        >
                          <View style={styles.menuIconWrap}>
                            <Ionicons
                              name="people-outline"
                              size={20}
                              color={NAVY}
                            />
                          </View>
                          <View style={styles.menuTextWrap}>
                            <Text style={styles.menuLabel}>Refer a host</Text>
                            <Text style={styles.menuSub}>Earn rewards when hosts join</Text>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={18}
                            color="#9CA3AF"
                          />
                        </TouchableOpacity>
                        <Divider />
                        <TouchableOpacity style={styles.menuItem}>
                          <View style={styles.menuIconWrap}>
                            <Ionicons
                              name="document-text-outline"
                              size={20}
                              color={NAVY}
                            />
                          </View>
                          <View style={styles.menuTextWrap}>
                            <Text style={styles.menuLabel}>Legal</Text>
                            <Text style={styles.menuSub}>Terms, insurance, and compliance</Text>
                          </View>
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
                            <Ionicons
                              name="power-outline"
                              size={20}
                              color="#E74C3C"
                            />
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
            icon="calendar-outline"
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
          }}
        />
      )}
    </View>
  );
}

function BookingCard({
  booking,
  formatDate,
}: {
  booking: any;
  formatDate: (dateStr: string) => string;
}) {
  const router = useRouter();
  const statusTone =
    booking.status === "confirmed"
      ? "success"
      : booking.status === "pending"
        ? "warning"
        : booking.status === "in_progress"
          ? "info"
          : "neutral";

  return (
    <PressableCard
      style={createCardStyle()}
      onPress={() => {
        const path = "/booking/" + booking._id;
        router.push(path as any);
      }}
    >
      <View style={styles.bookingHeader}>
        <StatusBadge label={booking.status.replace("_", " ")} tone={statusTone} />
        <Text style={styles.bookingDates}>
          {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
        </Text>
      </View>
      <Text style={styles.bookingLocation} numberOfLines={1}>
        {booking.pickupLocation} → {booking.dropoffLocation}
      </Text>
      <Divider />
      <View style={styles.bookingFooter}>
        <View>
          <Text style={styles.bookingAmount}>
            GHS {booking.totalAmount.toLocaleString()}
          </Text>
          <Text style={styles.bookingPayment}>{booking.paymentStatus}</Text>
        </View>
        <Pressable
          style={styles.requestChangeSmallButton}
          onPress={(e) => {
            e.stopPropagation();
            router.push({
              pathname: "/trip-change-request",
              params: { bookingId: booking._id },
            } as any);
          }}
        >
          <Ionicons name="create-outline" size={14} color="#FFFFFF" />
          <Text style={styles.requestChangeSmallButtonText}>Request Change</Text>
        </Pressable>
      </View>
    </PressableCard>
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
  iconEmptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  iconEmptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: NAVY,
    textAlign: "center",
    marginBottom: 12,
  },
  iconEmptySubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 32,
    marginBottom: 28,
  },
  iconCtaButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  iconCtaButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
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
    backgroundColor: NAVY,
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
  tabText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  bookingsList: {
    gap: 12,
  },
  bookingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
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
  requestChangeSmallButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: NAVY,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  requestChangeSmallButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
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
  viewFullCalendarButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: NAVY,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  viewFullCalendarButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
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
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
    gap: 16,
  },
  menuIconWrap: {
    width: 24,
    alignItems: "center",
  },
  menuTextWrap: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: NAVY,
  },
  menuSub: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  menuItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
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
});
