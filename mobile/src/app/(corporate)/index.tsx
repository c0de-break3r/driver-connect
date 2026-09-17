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
import { Ionicons } from "@expo/vector-icons";
import RoleSwitchTransition from "@/components/RoleSwitchTransition";
import { useTabBounce } from "@/hooks/useTabBounce";
import { useDashboardShell } from "@/hooks/useDashboardShell";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthProvider";
import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import WelcomeAuthScreen from "@/components/WelcomeAuthScreen";
import CorporateMessagesScreen from "./messages";

const NAVY = "#2C3E5B";
const BORDER = "#E5E7EB";

const CORPORATE_TABS = [
  "fleet",
  "bookings",
  "drivers",
  "messages",
  "menu",
] as const;

export default function CorporateDashboard() {
  const router = useRouter();

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
    signedIn,
    handleSwitchToGuest,
    handleMenuLogout,
  } = useDashboardShell({
    tabs: CORPORATE_TABS,
    defaultTab: "fleet",
    backTargetTab: "menu",
  });

  const { userId } = useAuth();
  const convexUser = useQuery(
    api.users.getByUserId,
    userId ? { userId } : "skip"
  );

  const corporateVehicles = useQuery(
    api.jobs.getOwnerVehicles,
    convexUser?._id ? { ownerId: convexUser._id } : "skip"
  );

  const corporateBookings = useQuery(
    api.jobs.getOwnerBookings,
    convexUser?._id ? { ownerId: convexUser._id } : "skip"
  );

  const availableDrivers = useQuery(
    api.jobs.getAvailableDrivers,
    signedIn ? {} : "skip"
  );

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
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="chatbubble-ellipses-outline" size={40} color="#9CA3AF" />
                </View>
                <Text style={styles.emptyTitle}>No messages</Text>
                <Text style={styles.emptySubtitle}>
                  Log in to view and send messages.
                </Text>
                <TouchableOpacity style={styles.primaryButton} onPress={openAuth}>
                  <Text style={styles.primaryButtonText}>Log in</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <CorporateMessagesScreen />
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
                    <Ionicons name="notifications-outline" size={22} color={NAVY} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {}}
                    activeOpacity={0.85}
                    style={styles.headerAvatarButton}
                  >
                    <View style={styles.headerAvatarRing}>
                      {avatarUri ? (
                        <View style={styles.headerAvatarPlaceholder} />
                      ) : (
                        <View style={styles.headerAvatarPlaceholder}>
                          <Text style={styles.headerAvatarInitial}>C</Text>
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
            >
              {activeTab === "fleet" && (
                <View>
                  {!signedIn ? (
                    <View style={styles.emptyWrap}>
                      <View style={styles.emptyIconCircle}>
                        <Ionicons name="car" size={40} color="#9CA3AF" />
                      </View>
                      <Text style={styles.emptyTitle}>No vehicles in fleet</Text>
                      <Text style={styles.emptySubtitle}>
                        Log in to add and manage your corporate fleet vehicles.
                      </Text>
                      <TouchableOpacity style={styles.primaryButton} onPress={openAuth}>
                        <Text style={styles.primaryButtonText}>Log in</Text>
                      </TouchableOpacity>
                    </View>
                  ) : !corporateVehicles || corporateVehicles.length === 0 ? (
                    <View style={styles.emptyWrap}>
                      <View style={styles.emptyIconCircle}>
                        <Ionicons name="car-outline" size={40} color="#9CA3AF" />
                      </View>
                      <Text style={styles.emptyTitle}>No fleet vehicles</Text>
                      <Text style={styles.emptySubtitle}>
                        Add your first vehicle to start managing your corporate fleet.
                      </Text>
                      <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/create-listing" as any)}>
                        <Text style={styles.primaryButtonText}>Add vehicle</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View>
                      <View style={styles.sectionRow}>
                        <Text style={styles.sectionTitle}>Fleet Vehicles</Text>
                        <TouchableOpacity style={styles.addButton} onPress={() => router.push("/create-listing" as any)}>
                          <Ionicons name="add" size={18} color="#FFFFFF" />
                          <Text style={styles.addButtonText}>Add vehicle</Text>
                        </TouchableOpacity>
                      </View>
                      {corporateVehicles.map((vehicle) => (
                        <View key={vehicle._id} style={styles.card}>
                          <View style={styles.cardTop}>
                            <View style={styles.cardTitleWrap}>
                              <Text style={styles.cardTitle}>{vehicle.title}</Text>
                              <Text style={styles.cardSub}>{vehicle.licensePlate || "No plate"} • {vehicle.seats ?? 0} seats</Text>
                            </View>
                            <View style={[styles.statusBadge, vehicle.status === "active" ? styles.statusActive : styles.statusMaintenance]}>
                              <Text style={[styles.statusText, vehicle.status === "active" ? styles.statusTextActive : styles.statusTextMaintenance]}>
                                {vehicle.status === "active" ? "Active" : "Inactive"}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.cardDivider} />
                          <View style={styles.cardActionsRow}>
                            <View style={styles.cardMetaItem}>
                              <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                              <Text style={styles.cardMetaText}>GHS {vehicle.pricePerDay.toLocaleString()}/day</Text>
                            </View>
                            <View style={styles.cardMetaItem}>
                              <Ionicons name="location-outline" size={18} color="#6B7280" />
                              <Text style={styles.cardMetaText}>{vehicle.city}</Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {activeTab === "bookings" && (
                <View>
                  {!signedIn ? (
                    <View style={styles.emptyWrap}>
                      <View style={styles.emptyIconCircle}>
                        <Ionicons name="calendar-outline" size={40} color="#9CA3AF" />
                      </View>
                      <Text style={styles.emptyTitle}>No corporate bookings</Text>
                      <Text style={styles.emptySubtitle}>
                        Log in to view and manage your corporate bookings.
                      </Text>
                      <TouchableOpacity style={styles.primaryButton} onPress={openAuth}>
                        <Text style={styles.primaryButtonText}>Log in</Text>
                      </TouchableOpacity>
                    </View>
                  ) : !corporateBookings || corporateBookings.length === 0 ? (
                    <View style={styles.emptyWrap}>
                      <View style={styles.emptyIconCircle}>
                        <Ionicons name="calendar-outline" size={40} color="#9CA3AF" />
                      </View>
                      <Text style={styles.emptyTitle}>No bookings yet</Text>
                      <Text style={styles.emptySubtitle}>
                        Bookings for your fleet vehicles will appear here.
                      </Text>
                    </View>
                  ) : (
                    <View>
                      <Text style={styles.sectionTitle}>Bookings</Text>
                      {corporateBookings.map((booking) => {
                        const colors = booking.status === "confirmed" ? { bg: "#E8F5E9", text: "#1B5E20" } : booking.status === "pending" ? { bg: "#FFF3E0", text: "#E65100" } : { bg: "#E3F2FD", text: "#1565C0" };
                        return (
                          <View key={booking._id} style={styles.card}>
                            <View style={styles.cardTop}>
                              <View style={styles.cardTitleWrap}>
                                <Text style={styles.cardTitle}>BK-{booking._id.slice(-4)}</Text>
                                <Text style={styles.cardSub}>Vehicle {booking.vehicleId.slice(-4)}</Text>
                              </View>
                              <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                                <Text style={[styles.statusText, { color: colors.text }]}>
                                  {booking.status === "in_progress" ? "In progress" : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.cardDivider} />
                            <View style={styles.cardActionsRow}>
                              <View style={styles.cardMetaItem}>
                                <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                                <Text style={styles.cardMetaText}>
                                  {new Date(booking.startDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </Text>
                              </View>
                              <View style={styles.cardMetaItem}>
                                <Ionicons name="cash-outline" size={18} color="#6B7280" />
                                <Text style={styles.cardMetaText}>{booking.currency} {booking.totalAmount.toLocaleString()}</Text>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}

              {activeTab === "drivers" && (
                <View>
                  {!signedIn ? (
                    <View style={styles.emptyWrap}>
                      <View style={styles.emptyIconCircle}>
                        <Ionicons name="people-outline" size={40} color="#9CA3AF" />
                      </View>
                      <Text style={styles.emptyTitle}>No assigned drivers</Text>
                      <Text style={styles.emptySubtitle}>
                        Log in to view and manage drivers for your fleet.
                      </Text>
                      <TouchableOpacity style={styles.primaryButton} onPress={openAuth}>
                        <Text style={styles.primaryButtonText}>Log in</Text>
                      </TouchableOpacity>
                    </View>
                  ) : !availableDrivers || availableDrivers.length === 0 ? (
                    <View style={styles.emptyWrap}>
                      <View style={styles.emptyIconCircle}>
                        <Ionicons name="people-outline" size={40} color="#9CA3AF" />
                      </View>
                      <Text style={styles.emptyTitle}>No available drivers</Text>
                      <Text style={styles.emptySubtitle}>
                        Available drivers will appear here when they opt in for hire.
                      </Text>
                    </View>
                  ) : (
                    <View>
                      <Text style={styles.sectionTitle}>Available Drivers</Text>
                      {availableDrivers.map((driver) => (
                        <View key={driver._id} style={styles.card}>
                          <View style={styles.cardTop}>
                            <View style={styles.cardTitleWrap}>
                              <Text style={styles.cardTitle}>{driver.firstName || "Driver"}</Text>
                              <Text style={styles.cardSub}>Available for hire</Text>
                            </View>
                            <View style={[styles.statusBadge, styles.statusActive]}>
                              <Text style={[styles.statusText, styles.statusTextActive]}>Available</Text>
                            </View>
                          </View>
                          <View style={styles.cardDivider} />
                          <View style={styles.cardActionsRow}>
                            <TouchableOpacity style={styles.cardActionButton}>
                              <Ionicons name="call-outline" size={18} color={NAVY} />
                              <Text style={styles.cardActionText}>Contact</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cardActionButton}>
                              <Ionicons name="document-text-outline" size={18} color={NAVY} />
                              <Text style={styles.cardActionText}>Profile</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>
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
                    <View style={styles.emptyWrap}>
                      <View style={styles.emptyIconCircle}>
                        <Ionicons name="grid-outline" size={40} color="#9CA3AF" />
                      </View>
                      <Text style={styles.emptyTitle}>Corporate dashboard</Text>
                      <Text style={styles.emptySubtitle}>
                        Log in to access your corporate dashboard, manage fleet,
                        and view bookings.
                      </Text>
                      <TouchableOpacity style={styles.primaryButton} onPress={openAuth}>
                        <Text style={styles.primaryButtonText}>Log in</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      <View style={styles.onboardingCard}>
                        <View style={styles.cardImagesRow}>
                          <View style={styles.cardImagePlaceholder}>
                            <Ionicons name="car-outline" size={24} color="#9CA3AF" />
                          </View>
                          <View style={styles.cardImagePlaceholder}>
                            <Ionicons name="calendar-outline" size={24} color="#9CA3AF" />
                          </View>
                          <View style={styles.cardImagePlaceholder}>
                            <Ionicons name="people-outline" size={24} color="#9CA3AF" />
                          </View>
                        </View>
                        <Text style={styles.onboardingTitle}>New to corporate?</Text>
                        <Text style={styles.onboardingSubtitle}>
                          Discover tools and best practices for managing your fleet and
                          team bookings.
                        </Text>
                        <TouchableOpacity style={styles.onboardingButton}>
                          <Text style={styles.onboardingButtonText}>Get started</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.switchToGuestButton}
                          onPress={handleSwitchToGuest}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.switchToGuestText}>Switch to Guest</Text>
                          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.menuSection}>
                        <MenuRow icon="settings-outline" label="Fleet settings" />
                        <MenuRow icon="card-outline" label="Billing & invoices" />
                        <MenuRow icon="people-outline" label="Team management" />
                        <MenuRow icon="help-circle-outline" label="Get help" />
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
            icon="car"
            label="Fleet"
            active={activeTab === "fleet"}
            onPress={() => setActiveTab("fleet")}
          />
          <NavItem
            icon="calendar"
            label="Bookings"
            active={activeTab === "bookings"}
            onPress={() => setActiveTab("bookings")}
          />
          <NavItem
            icon="people"
            label="Drivers"
            active={activeTab === "drivers"}
            onPress={() => setActiveTab("drivers")}
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
        <RoleSwitchTransition role={switchingRole} fromRole="corporate" />
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

function MenuRow({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]}>
      <View style={styles.menuIconWrap}>
        <Ionicons name={icon} size={20} color={NAVY} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

function NavItem({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  const { animatedStyle, bounce } = useTabBounce();
  const color = active ? NAVY : "#9CA3AF";
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
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: NAVY,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTitleWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  cardSub: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 4,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusActive: {
    backgroundColor: "#E8F5E9",
  },
  statusMaintenance: {
    backgroundColor: "#FFF3E0",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusTextActive: {
    color: "#1B5E20",
  },
  statusTextMaintenance: {
    color: "#E65100",
  },
  cardDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 14,
  },
  cardActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cardMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardMetaText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  cardActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F9FAFB",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  cardActionText: {
    fontSize: 13,
    fontWeight: "600",
    color: NAVY,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
  },
  primaryButton: {
    backgroundColor: NAVY,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    minWidth: 180,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
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
