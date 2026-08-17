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
                  ) : (
                    <View>
                      <View style={styles.sectionRow}>
                        <Text style={styles.sectionTitle}>Fleet Vehicles</Text>
                        <TouchableOpacity style={styles.addButton}>
                          <Ionicons name="add" size={18} color="#FFFFFF" />
                          <Text style={styles.addButtonText}>Add vehicle</Text>
                        </TouchableOpacity>
                      </View>
                      <FleetVehicleCard
                        plate="KCD 4821X"
                        type="Toyota Hiace"
                        seats={14}
                        status="active"
                      />
                      <FleetVehicleCard
                        plate="KBZ 1103A"
                        type="Suzuki Ertiga"
                        seats={7}
                        status="maintenance"
                      />
                      <FleetVehicleCard
                        plate="KCJ 5599K"
                        type="Toyota Prado"
                        seats={5}
                        status="active"
                      />
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
                  ) : (
                    <View>
                      <Text style={styles.sectionTitle}>Bookings</Text>
                      <BookingCard
                        id="BK-1042"
                        route="Nairobi — Mombasa"
                        date="Mon, 18 Aug 2026"
                        amount="Ksh 64,000"
                        status="confirmed"
                      />
                      <BookingCard
                        id="BK-1043"
                        route="Nairobi — Naivasha"
                        date="Fri, 21 Aug 2026"
                        amount="Ksh 38,500"
                        status="pending"
                      />
                      <BookingCard
                        id="BK-1044"
                        route="Nairobi — Kisumu"
                        date="Thu, 27 Aug 2026"
                        amount="Ksh 78,200"
                        status="in_progress"
                      />
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
                  ) : (
                    <View>
                      <Text style={styles.sectionTitle}>Assigned Drivers</Text>
                      <DriverCard name="James Mwangi" rating={4.9} trips={312} available />
                      <DriverCard name="Susan Wanjiku" rating={4.8} trips={198} available={false} />
                      <DriverCard name="David Kipchoge" rating={4.7} trips={156} available />
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

function FleetVehicleCard({
  plate,
  type,
  seats,
  status,
}: {
  plate: string;
  type: string;
  seats: number;
  status: "active" | "maintenance";
}) {
  const isActive = status === "active";
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardTitleWrap}>
          <Text style={styles.cardTitle}>{type}</Text>
          <Text style={styles.cardSub}>{plate} • {seats} seats</Text>
        </View>
        <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusMaintenance]}>
          <Text style={[styles.statusText, isActive ? styles.statusTextActive : styles.statusTextMaintenance]}>
            {isActive ? "Active" : "Maintenance"}
          </Text>
        </View>
      </View>
      <View style={styles.cardDivider} />
      <View style={styles.cardActionsRow}>
        <TouchableOpacity style={styles.cardActionButton}>
          <Ionicons name="calendar-outline" size={18} color={NAVY} />
          <Text style={styles.cardActionText}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardActionButton}>
          <Ionicons name="create-outline" size={18} color={NAVY} />
          <Text style={styles.cardActionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardActionButton}>
          <Ionicons name="map-outline" size={18} color={NAVY} />
          <Text style={styles.cardActionText}>Track</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function BookingCard({
  id,
  route,
  date,
  amount,
  status,
}: {
  id: string;
  route: string;
  date: string;
  amount: string;
  status: "confirmed" | "pending" | "in_progress";
}) {
  const palette: Record<string, { bg: string; text: string }> = {
    confirmed: { bg: "#E8F5E9", text: "#1B5E20" },
    pending: { bg: "#FFF3E0", text: "#E65100" },
    in_progress: { bg: "#E3F2FD", text: "#1565C0" },
  };
  const colors = palette[status] ?? palette.pending;
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardTitleWrap}>
          <Text style={styles.cardTitle}>{id}</Text>
          <Text style={styles.cardSub}>{route}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
          <Text style={[styles.statusText, { color: colors.text }]}>
            {status === "in_progress" ? "In progress" : status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </View>
      </View>
      <View style={styles.cardDivider} />
      <View style={styles.cardActionsRow}>
        <View style={styles.cardMetaItem}>
          <Ionicons name="calendar-outline" size={18} color="#6B7280" />
          <Text style={styles.cardMetaText}>{date}</Text>
        </View>
        <View style={styles.cardMetaItem}>
          <Ionicons name="cash-outline" size={18} color="#6B7280" />
          <Text style={styles.cardMetaText}>{amount}</Text>
        </View>
      </View>
    </View>
  );
}

function DriverCard({
  name,
  rating,
  trips,
  available,
}: {
  name: string;
  rating: number;
  trips: number;
  available: boolean;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardTitleWrap}>
          <Text style={styles.cardTitle}>{name}</Text>
          <Text style={styles.cardSub}>{trips} trips</Text>
        </View>
        {available ? (
          <View style={[styles.statusBadge, styles.statusActive]}>
            <Text style={[styles.statusText, styles.statusTextActive]}>Available</Text>
          </View>
        ) : (
          <View style={[styles.statusBadge, styles.statusMaintenance]}>
            <Text style={[styles.statusText, styles.statusTextMaintenance]}>Busy</Text>
          </View>
        )}
      </View>
      <View style={styles.cardDivider} />
      <View style={styles.cardActionsRow}>
        <View style={styles.cardMetaItem}>
          <Ionicons name="star" size={18} color="#F59E0B" />
          <Text style={styles.cardMetaText}>{rating}</Text>
        </View>
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
