import RoleSwitchTransition from "@/components/RoleSwitchTransition";
import WelcomeAuthScreen from "@/components/WelcomeAuthScreen";
import { useTabBounce } from "@/hooks/useTabBounce";
import { useDashboardShell } from "@/hooks/useDashboardShell";
import { Ionicons } from "@expo/vector-icons";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useDoubleTap } from "@/hooks/useDoubleTap";
import DriverMessagesScreen from "./messages";
import { useAuth } from "@/contexts/AuthProvider";
import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import { createCardStyle, createBadgeStyle, PressableCard, SectionHeader, StatusBadge, Divider } from "@/components/DesignSystem";

const NAVY = "#2C3E5B";

const DRIVER_TABS = [
  "jobs",
  "schedule",
  "earnings",
  "messages",
  "menu",
] as const;

export default function DriverDashboard() {
  const router = useRouter();

  const handleNotificationsPress = useDoubleTap(() => {
    router.push("/notifications" as any);
  });

  const handleProfilePress = useDoubleTap(() => {
    router.push("/(driver)/profile" as any);
  });

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
    signedIn,
    handleSwitchToGuest,
    handleMenuLogout,
  } = useDashboardShell({
    tabs: DRIVER_TABS,
    defaultTab: "jobs",
    backTargetTab: "menu",
  });

  const { userId } = useAuth();
  const convexUser = useQuery(
    api.users.getByUserId,
    userId ? { userId } : "skip"
  );

  const driverBookings = useQuery(
    api.jobs.getDriverBookings,
    convexUser?._id ? { driverId: convexUser._id } : "skip"
  );

  const renderJobsContent = () => {
    if (!signedIn) {
      return (
        <View style={styles.emptyStateWrap}>
          <View style={styles.iconCircle}>
            <Ionicons name="briefcase-outline" size={48} color={NAVY} />
          </View>
          <Text style={styles.emptyTitle}>No jobs yet</Text>
          <Text style={styles.emptySubtitle}>
            Log in to view and manage your job requests and offers.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={openAuth}>
            <Text style={styles.primaryButtonText}>Log in</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const jobCount = driverBookings?.length ?? 0;

    return (
      <View>
        <SectionHeader
          title="Job Requests"
          subtitle={`${jobCount} new request${jobCount !== 1 && "s"} waiting for your response`}
        />
        <View style={styles.cardStack}>
          {!driverBookings ? (
            <Text style={styles.loadingText}>Loading jobs...</Text>
          ) : driverBookings.length === 0 ? (
            <View style={styles.emptyStateWrap}>
              <Text style={styles.emptyTitle}>No jobs yet</Text>
              <Text style={styles.emptySubtitle}>
                Job requests will appear here when clients book you.
              </Text>
            </View>
          ) : (
            driverBookings.map((booking) => {
              const vehicle = booking.vehicle;
              const statusTone = booking.status === "confirmed" ? "success" : booking.status === "pending" ? "warning" : booking.status === "in_progress" ? "info" : "neutral";
              return (
                <View key={booking._id} style={createCardStyle()}>
                  <View style={styles.jobCardHeader}>
                    <View style={createBadgeStyle()}>
                      <Ionicons name="car-outline" size={14} color={NAVY} />
                      <Text style={styles.jobTypeText}>{vehicle.category}</Text>
                    </View>
                    <StatusBadge label={booking.status.replace(/_/g, " ")} tone={statusTone as any} />
                  </View>

                  <View style={styles.jobDetailRow}>
                    <View style={styles.jobDetailIcon}>
                      <Ionicons name="person-outline" size={16} color="#6B7280" />
                    </View>
                    <Text style={styles.jobDetailText}>{vehicle.title}</Text>
                  </View>

                  <View style={styles.jobDetailRow}>
                    <View style={styles.jobDetailIcon}>
                      <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                    </View>
                    <Text style={styles.jobDetailText}>
                      {new Date(booking.startDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} — {new Date(booking.endDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </Text>
                  </View>

                  <View style={styles.jobDetailRow}>
                    <View style={styles.jobDetailIcon}>
                      <Ionicons name="location-outline" size={16} color="#6B7280" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.jobDetailText} numberOfLines={1}>
                        From: {booking.pickupLocation}
                      </Text>
                      <Text style={[styles.jobDetailText, { color: "#9CA3AF", fontSize: 13 }]} numberOfLines={1}>
                        To: {booking.dropoffLocation}
                      </Text>
                    </View>
                  </View>

                  <Divider />
                  <View style={styles.fareRow}>
                    <Text style={styles.fareLabel}>Total fare</Text>
                    <Text style={styles.fareValue}>{booking.currency} {booking.totalAmount.toLocaleString()}</Text>
                  </View>
                  <View style={styles.jobActionRow}>
                    {(booking.status === "pending" || booking.status === "confirmed") && (
                      <>
                        <PressableCard style={styles.declineButton}>
                          <Text style={styles.declineButtonText}>Decline</Text>
                        </PressableCard>
                        <PressableCard style={styles.acceptButton}>
                          <Text style={styles.acceptButtonText}>Accept</Text>
                        </PressableCard>
                      </>
                    )}
                    {booking.status === "in_progress" && (
                      <PressableCard style={styles.acceptButton}>
                        <Text style={styles.acceptButtonText}>Complete</Text>
                      </PressableCard>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>
    );
  };

  const renderScheduleContent = () => {
    if (!signedIn) {
      return (
        <View style={styles.emptyStateWrap}>
          <View style={styles.iconCircle}>
            <Ionicons name="calendar-outline" size={48} color={NAVY} />
          </View>
          <Text style={styles.emptyTitle}>Set your schedule</Text>
          <Text style={styles.emptySubtitle}>
            Log in to manage your availability and let clients book you.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={openAuth}>
            <Text style={styles.primaryButtonText}>Log in</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayStatuses = [true, true, true, true, true, false, false];
    const timeSlots = [
      { label: "6:00 AM", active: true },
      { label: "9:00 AM", active: true },
      { label: "12:00 PM", active: true },
      { label: "3:00 PM", active: false },
      { label: "6:00 PM", active: false },
      { label: "9:00 PM", active: false },
    ];

    return (
      <View>
        <SectionHeader
          title="Weekly Availability"
          subtitle="Toggle days on to let clients know when you're available."
        />

        <View style={createCardStyle()}>
          <View style={styles.daysRow}>
            {weekDays.map((day, i) => (
              <PressableCard
                key={day}
                style={[styles.dayChip, dayStatuses[i] && styles.dayChipActive]}
              >
                <Text
                  style={[styles.dayChipLabel, dayStatuses[i] && styles.dayChipLabelActive]}
                >
                  {day}
                </Text>
              </PressableCard>
            ))}
          </View>

          <Text style={styles.cardTitle}>Daily Time Slots</Text>
          <View style={styles.timeSlotsGrid}>
            {timeSlots.map((slot) => (
              <PressableCard
                key={slot.label}
                style={[styles.timeSlotChip, slot.active && styles.timeSlotChipActive]}
              >
                <Ionicons
                  name={slot.active ? "checkmark-circle" : "ellipse-outline"}
                  size={18}
                  color={slot.active ? NAVY : "#9CA3AF"}
                />
                <Text
                  style={[styles.timeSlotLabel, slot.active && styles.timeSlotLabelActive]}
                >
                  {slot.label}
              </Text>
            </PressableCard>
          ))}
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Save Schedule</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEarningsContent = () => {
    if (!signedIn) {
      return (
        <View style={styles.emptyStateWrap}>
          <View style={styles.iconCircle}>
            <Ionicons name="cash-outline" size={48} color={NAVY} />
          </View>
          <Text style={styles.emptyTitle}>Earnings overview</Text>
          <Text style={styles.emptySubtitle}>
            Log in to view your earnings, payouts, and financial insights.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={openAuth}>
            <Text style={styles.primaryButtonText}>Log in</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const payoutHistory = [
      { id: "1", date: "Aug 10, 2026", amount: "KES 12,400", trips: 8, status: "completed" },
      { id: "2", date: "Aug 3, 2026", amount: "KES 9,800", trips: 6, status: "completed" },
      { id: "3", date: "Jul 27, 2026", amount: "KES 15,200", trips: 11, status: "completed" },
    ];

    const statCards = [
      { label: "This Week", value: "KES 22,200", icon: "trending-up-outline", change: "+12%" },
      { label: "This Month", value: "KES 89,400", icon: "calendar-outline", change: "+8%" },
      { label: "Total Trips", value: "247", icon: "car-outline", change: "+5" },
    ];

    return (
      <View>
        <SectionHeader
          title="Earnings"
          subtitle="Your earnings summary and payout history."
        />

        <View style={styles.statCardsRow}>
          {statCards.map((stat) => (
            <View key={stat.label} style={createCardStyle()}>
              <View style={styles.statIconCircle}>
                <Ionicons name={stat.icon as any} size={20} color={NAVY} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statChange}>{stat.change}</Text>
            </View>
          ))}
        </View>

        <View style={createCardStyle()}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Earnings Trend</Text>
            <StatusBadge label="Weekly" tone="info" />
          </View>
          <View style={styles.chartPlaceholder}>
            <Ionicons name="bar-chart-outline" size={32} color="#D1D5DB" />
            <Text style={styles.chartPlaceholderText}>Earnings chart</Text>
            <Text style={styles.chartPlaceholderSub}>
              Connect analytics to view your weekly earnings trend.
            </Text>
          </View>
        </View>

        <SectionHeader
          title="Payout History"
          subtitle="Recent payouts to your account."
        />
        <View style={styles.cardStack}>
          {payoutHistory.map((payout) => (
            <View key={payout.id} style={createCardStyle()}>
              <View style={styles.payoutLeft}>
                <View style={styles.payoutIconCircle}>
                  <Ionicons name="cash-outline" size={20} color={NAVY} />
                </View>
                <View>
                  <Text style={styles.payoutAmount}>{payout.amount}</Text>
                  <Text style={styles.payoutDate}>{payout.date}</Text>
                  <Text style={styles.payoutTrips}>{payout.trips} trips</Text>
                </View>
              </View>
              <StatusBadge label="Paid" tone="success" />
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderMessagesContent = () => {
    if (!signedIn) {
      return (
        <View style={styles.emptyStateWrap}>
          <View style={styles.iconCircle}>
            <Ionicons name="chatbubble-ellipses-outline" size={48} color={NAVY} />
          </View>
          <Text style={styles.emptyTitle}>No messages</Text>
          <Text style={styles.emptySubtitle}>
            Log in to view and send messages to clients.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={openAuth}>
            <Text style={styles.primaryButtonText}>Log in</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return <DriverMessagesScreen />;
  };

  const renderMenuContent = () => {
    if (!signedIn) {
      return (
        <View
          style={{
            paddingTop: Platform.select({ ios: 60, android: 40 }),
            alignItems: "center",
            paddingHorizontal: 24,
            paddingVertical: 80,
          }}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="settings-outline" size={48} color={NAVY} />
          </View>
          <Text style={styles.emptyTitle}>Menu</Text>
          <Text style={styles.emptySubtitle}>
            Log in to access your driver dashboard and settings.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={openAuth}>
            <Text style={styles.primaryButtonText}>Log in</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        <View style={styles.menuHeaderRow}>
          <Text style={styles.menuHeaderTitle}>Menu</Text>
          <View style={styles.menuHeaderRight}>
            <TouchableOpacity
              hitSlop={8}
              style={styles.notificationButton}
              onPress={handleNotificationsPress}
            >
              <Ionicons name="notifications-outline" size={22} color={NAVY} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleProfilePress}
              activeOpacity={0.85}
              style={styles.headerAvatarButton}
            >
              <View style={styles.headerAvatarRing}>
                <View style={styles.headerAvatarPlaceholder}>
                  <Text style={styles.headerAvatarInitial}>D</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={createCardStyle()}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleProfilePress}
          >
            <View style={styles.menuIconWrap}>
              <Ionicons name="person-outline" size={20} color={NAVY} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuLabel}>Complete your profile</Text>
              <Text style={styles.menuSub}>License, vehicle, and verification</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setActiveTab("schedule")}
          >
            <View style={styles.menuIconWrap}>
              <Ionicons name="calendar-outline" size={20} color={NAVY} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuLabel}>Availability settings</Text>
              <Text style={styles.menuSub}>Days, hours, and preferred jobs</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setActiveTab("earnings")}
          >
            <View style={styles.menuIconWrap}>
              <Ionicons name="trending-up-outline" size={20} color={NAVY} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuLabel}>Earnings insights</Text>
              <Text style={styles.menuSub}>Payouts, trips, and weekly trends</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={createCardStyle({ marginTop: 16 })}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="help-circle-outline" size={20} color={NAVY} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuLabel}>Get help</Text>
              <Text style={styles.menuSub}>Support, safety, and account help</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleSwitchToGuest}
          >
            <View style={styles.menuIconWrap}>
              <Ionicons name="person-outline" size={20} color={NAVY} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuLabel}>Switch to Guest</Text>
              <Text style={styles.menuSub}>Browse vehicles and drivers</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
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
    );
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
            {renderMessagesContent()}
          </View>
        ) : (
          <>
            {activeTab === "menu" && !switchingRole && signedIn ? (
              renderMenuContent()
            ) : activeTab !== "menu" && !switchingRole ? (
              <View style={styles.menuHeaderSpacer} />
            ) : null}
            {activeTab === "menu" && !switchingRole && !signedIn ? null : (
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {activeTab === "jobs" && renderJobsContent()}

                {activeTab === "schedule" && renderScheduleContent()}

                {activeTab === "earnings" && renderEarningsContent()}

                {activeTab === "messages" && renderMessagesContent()}
              </ScrollView>
            )}
            {activeTab === "menu" && !switchingRole && !signedIn && renderMenuContent()}
          </>
        )}
      </Animated.View>

      {!switchingRole ? (
        <View style={styles.bottomNav}>
          <NavItem
            icon="briefcase"
            label="Jobs"
            active={activeTab === "jobs"}
            onPress={() => setActiveTab("jobs")}
          />
          <NavItem
            icon="calendar"
            label="Schedule"
            active={activeTab === "schedule"}
            onPress={() => setActiveTab("schedule")}
          />
          <NavItem
            icon="cash"
            label="Earnings"
            active={activeTab === "earnings"}
            onPress={() => setActiveTab("earnings")}
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
        <RoleSwitchTransition role={switchingRole} fromRole="driver" />
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
  emptyStateWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 80,
    gap: 16,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
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
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: NAVY,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    minWidth: 180,
    alignItems: "center",
    marginTop: 8,
  },
  loadingText: { fontSize: 15, fontWeight: "600", color: "#6B7280", textAlign: "center", marginTop: 60 },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cardStack: {
    gap: 12,
  },
  jobCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  jobTypeText: {
    fontSize: 12,
    fontWeight: "600",
    color: NAVY,
  },
  jobDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  jobDetailIcon: {
    width: 24,
    alignItems: "center",
  },
  jobDetailText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    flex: 1,
  },
  fareRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fareLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  fareValue: {
    fontSize: 16,
    fontWeight: "700",
    color: NAVY,
  },
  jobActionRow: {
    flexDirection: "row",
    gap: 10,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: NAVY,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  declineButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 8,
  },
  dayChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  dayChipActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  dayChipLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  dayChipLabelActive: {
    color: "#FFFFFF",
  },
  timeSlotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  timeSlotChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  timeSlotChipActive: {
    backgroundColor: "#F3F4F6",
    borderColor: NAVY,
  },
  timeSlotLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  timeSlotLabelActive: {
    color: NAVY,
  },
  statCardsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: NAVY,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
  },
  statChange: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
    textAlign: "center",
  },
  chartPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },
  chartPlaceholderText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  chartPlaceholderSub: {
    fontSize: 13,
    fontWeight: "500",
    color: "#9CA3AF",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  payoutLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  payoutIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  payoutAmount: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  payoutDate: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  payoutTrips: {
    fontSize: 12,
    fontWeight: "500",
    color: "#9CA3AF",
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
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: NAVY,
  },
});
