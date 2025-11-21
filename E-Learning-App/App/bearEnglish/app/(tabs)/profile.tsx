import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../contexts/AuthContext";
import { router } from "expo-router";
import API from "../../api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAchievements } from "../../hooks/useAchievements";

// Icon components (emoji style)
const IconSettings = () => (
  <View style={styles.icon}>
    <Text style={styles.iconText}>⚙️</Text>
  </View>
);

const IconEdit = () => (
  <View style={styles.icon}>
    <Text style={styles.iconText}>✏️</Text>
  </View>
);

const IconBook = () => <Text style={styles.iconText}>📚</Text>;
const IconClock = () => <Text style={styles.iconText}>⏱️</Text>;
const IconFire = () => <Text style={styles.iconText}>🔥</Text>;
const IconTrophy = () => <Text style={styles.iconText}>🏆</Text>;
const IconLogout = () => <Text style={styles.iconText}>🚪</Text>;
const IconUser = () => <Text style={styles.iconText}>👤</Text>;
const IconLock = () => <Text style={styles.iconText}>🔒</Text>;

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState("progress");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const [progressStats, setProgressStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Achievement hook
  const {
    achievements,
    stats: achievementStats,
    loading: achievementsLoading,
    getUnlockedAchievements,
    getLockedAchievements,
  } = useAchievements(user?._id);

  // Debug function to check and fix AsyncStorage
  const checkAsyncStorage = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const storedToken = await AsyncStorage.getItem("token");

      console.log("=== AsyncStorage Debug ===");
      console.log("Stored user:", storedUser);
      console.log("Stored token:", storedToken);
      console.log("Current user in context:", user);
      console.log("========================");

      if (!storedUser && user) {
        // User is in context but not in AsyncStorage - fix it
        await AsyncStorage.setItem("user", JSON.stringify(user));
        console.log("Fixed: Saved user to AsyncStorage");
        Alert.alert("Debug", "User saved to AsyncStorage!");
      } else if (storedUser && !user) {
        // User is in AsyncStorage but not in context - reload it
        await updateUser(JSON.parse(storedUser));
        console.log("Fixed: Loaded user to context");
        Alert.alert("Debug", "User loaded from AsyncStorage!");
      } else if (storedUser && user) {
        Alert.alert("Debug", "User data is synced!");
      } else {
        Alert.alert("Debug", "No user data found. Please log in.");
      }
    } catch (error) {
      console.error("AsyncStorage check error:", error);
      Alert.alert("Error", "Failed to check AsyncStorage");
    }
  };

  // Fetch progress stats when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      fetchProgressStats();
    }
  }, [isAuthenticated, user?._id]);

  const fetchProgressStats = async () => {
    try {
      setLoading(true);
      const response = await API.getProgressStats(user!._id as any);
      if (response.success) {
        setProgressStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching progress stats:", error);
      // Don't show error to user, just use default values
    } finally {
      setLoading(false);
    }
  };

  // Default avatar nếu chưa đăng nhập
  const defaultAvatar =
    "https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/474190UWU/anh-avatar-one-piece-sieu-dep_082621920.jpg";

  const handleLogout = () => {
    setShowSettingsModal(false);
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/(auth)/signIn");
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    setShowSettingsModal(false);
    // TODO: Navigate to edit profile screen
    Alert.alert("Thông báo", "Chức năng đang phát triển");
  };

  const handleChangePassword = () => {
    setShowSettingsModal(false);
    // TODO: Navigate to change password screen
    Alert.alert("Thông báo", "Chức năng đang phát triển");
  };

  const userData = {
    name: user?.fullName || user?.name || "Guest",
    email: user?.email || "Not logged in",
    avatar: defaultAvatar,
    isPro: false,
    streak: progressStats?.streak || 0,
  };

  const progressData = {
    lessonsCompleted: progressStats?.totalCompleted || 0,
    minutesSpent: 350,
    weeklyData: [12, 19, 8, 15, 10, 18, 22],
    days: ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"],
  };

  // Get unlocked and locked achievements from the hook
  const unlockedAchievements = getUnlockedAchievements();
  const lockedAchievements = getLockedAchievements();

  return (
    <ImageBackground
      source={require("../../assets/images/background-profile.jpg")}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>{userData.name}</Text>
            {userData.isPro && (
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>Pro</Text>
              </View>
            )}
            {isAuthenticated ? (
              <View style={{ flexDirection: "row", gap: 8 }}>
                {/* <TouchableOpacity
                  style={[styles.settingsBtn, { backgroundColor: "#FF6B6B" }]}
                  onPress={checkAsyncStorage}
                >
                  <Text style={{ fontSize: 16 }}>🔍</Text>
                </TouchableOpacity> */}
                <TouchableOpacity
                  style={styles.settingsBtn}
                  onPress={() => setShowSettingsModal(true)}
                >
                  <IconSettings />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={() => router.push("/(auth)/signIn")}
              >
                <Text style={styles.loginBtnText}>Đăng nhập</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <Image source={{ uri: userData.avatar }} style={styles.avatar} />
            {/* <TouchableOpacity style={styles.editAvatarWrapper}>
              <LinearGradient
                colors={['#00D4FF', '#0099FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.editAvatarBtn}
              >
                <IconEdit />
              </LinearGradient>
            </TouchableOpacity> */}
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userEmail}>{userData.email}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {["progress", "achievements"].map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
              <LinearGradient
                colors={
                  activeTab === tab
                    ? ["#00D4FF", "#0099FF"]
                    : ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.05)"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.tab]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.tabTextActive,
                  ]}
                >
                  {tab === "progress" ? "Progress" : "Achievements"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Progress Tab */}
        {activeTab === "progress" && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Activity</Text>
                <Text style={styles.cardSubtitle}>
                  Keep track of your efforts
                </Text>
              </View>

              {/* Buttons */}
              <View style={styles.timePeriodContainer}>
                {["Last 7 days", "Last 12 months"].map((label) => (
                  <TouchableOpacity key={label}>
                    <LinearGradient
                      colors={["#00D4FF", "#00FFAA"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.timePeriodBtn}
                    >
                      <Text style={styles.timePeriodText}>{label}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Stats */}
              <View style={styles.statsContainer}>
                <LinearGradient
                  colors={["#0099FF", "#00D4FF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statCard}
                >
                  <IconBook />
                  <Text style={styles.statNumber}>
                    {progressData.lessonsCompleted}
                  </Text>
                  <Text style={styles.statLabel}>LESSONS COMPLETED</Text>
                </LinearGradient>

                <LinearGradient
                  colors={["#FFA500", "#FFD700"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statCard}
                >
                  <IconClock />
                  <Text style={styles.statNumber}>
                    {progressData.minutesSpent}
                  </Text>
                  <Text style={styles.statLabel}>MINUTES SPENT</Text>
                </LinearGradient>
              </View>

              {/* Chart */}
              <View style={styles.chartContainer}>
                <LineChart
                  data={{
                    labels: progressData.days,
                    datasets: [
                      {
                        data: progressData.weeklyData,
                        color: () => "#00D4FF",
                        strokeWidth: 3,
                      },
                    ],
                  }}
                  width={Dimensions.get("window").width - 40}
                  height={220}
                  chartConfig={{
                    backgroundColor: "transparent",
                    backgroundGradientFrom: "transparent",
                    backgroundGradientTo: "transparent",
                    color: () => "rgba(255, 255, 255, 0.3)",
                    labelColor: () => "#A0A0A0",
                    style: { borderRadius: 16 },
                    propsForDots: {
                      r: "5",
                      strokeWidth: "2",
                      stroke: "#00D4FF",
                    },
                  }}
                  bezier
                  style={styles.chart}
                />
              </View>

              {/* Streak */}
              <View style={styles.streakContainer}>
                <IconFire />
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.streakText}>
                    <Text style={styles.streakNumber}>{userData.streak}</Text>{" "}
                    day streak
                    {userData.streak > 0 && " 🎉"}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Achievements Tab */}
        {activeTab === "achievements" && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Your Achievements</Text>
                {achievementStats && (
                  <Text style={styles.cardSubtitle}>
                    {achievementStats.unlockedAchievements} /{" "}
                    {achievementStats.totalAchievements} unlocked (
                    {achievementStats.percentageUnlocked.toFixed(0)}%)
                  </Text>
                )}
              </View>

              {achievementsLoading ? (
                <View style={{ paddingVertical: 40, alignItems: "center" }}>
                  <ActivityIndicator size="large" color="#00D4FF" />
                </View>
              ) : achievements.length === 0 ? (
                <View style={{ paddingVertical: 40, alignItems: "center" }}>
                  <Text style={{ color: "#A0A0A0", fontSize: 14 }}>
                    No achievements yet. Keep learning!
                  </Text>
                </View>
              ) : (
                <View style={styles.achievementsGrid}>
                  {/* Unlocked Achievements */}
                  {unlockedAchievements.map((userAchievement) => (
                    <LinearGradient
                      key={userAchievement.achievement._id}
                      colors={["#00D4FF", "#00FFAA"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.achievementItem}
                    >
                      <Text style={{ fontSize: 32 }}>
                        {userAchievement.achievement.icon}
                      </Text>
                      <Text style={styles.achievementTitle}>
                        {userAchievement.achievement.name}
                      </Text>
                      <Text style={styles.achievementDescription}>
                        {userAchievement.achievement.description}
                      </Text>
                    </LinearGradient>
                  ))}

                  {/* Locked Achievements */}
                  {lockedAchievements.map((userAchievement) => (
                    <View
                      key={userAchievement.achievement._id}
                      style={[styles.achievementItem, styles.achievementLocked]}
                    >
                      <Text style={{ fontSize: 32, opacity: 0.3 }}>
                        {userAchievement.achievement.icon}
                      </Text>
                      <Text style={styles.achievementTitle}>
                        {userAchievement.achievement.name}
                      </Text>
                      <Text style={styles.achievementDescription}>
                        {userAchievement.achievement.description}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSettingsModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cài đặt</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleEditProfile}
            >
              <IconUser />
              <Text style={styles.menuText}>Thay đổi thông tin</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleChangePassword}
            >
              <IconLock />
              <Text style={styles.menuText}>Đổi mật khẩu</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemDanger]}
              onPress={handleLogout}
            >
              <IconLogout />
              <Text style={[styles.menuText, styles.menuTextDanger]}>
                Đăng xuất
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowSettingsModal(false)}
            >
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F1419",
  },
  scrollView: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30 },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 28, fontWeight: "700", color: "#FFFFFF" },
  proBadge: {
    backgroundColor: "#FFA500",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  proBadgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  settingsBtn: { padding: 8 },
  logoutBtn: {
    padding: 8,
    backgroundColor: "rgba(255, 68, 68, 0.2)",
    borderRadius: 8,
  },
  loginBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#007bff",
    borderRadius: 8,
  },
  loginBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  icon: { justifyContent: "center", alignItems: "center" },
  iconText: { fontSize: 20 },
  avatarSection: { alignItems: "center", marginBottom: 20 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#00D4FF",
  },
  editAvatarWrapper: {
    position: "absolute",
    bottom: 0,
    right: "35%",
  },
  editAvatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: { alignItems: "center" },
  userEmail: { fontSize: 14, color: "#A0A0A0" },

  /** ⭐ TAB BUTTONS ⭐ **/
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center", // ✅ căn giữa hàng tab
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center", // ✅ căn giữa nội dung
  },
  tabText: { fontSize: 14, fontWeight: "600", color: "#A0A0A0" },
  tabTextActive: { color: "#FFFFFF" },

  /** ⭐ TAB CONTENT ⭐ **/
  tabContent: {
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: "center", // ✅ căn giữa toàn bộ phần nội dung tab
  },
  card: {
    backgroundColor: "rgba(38,43,61,1)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    width: "100%",
  },
  cardHeader: { marginBottom: 20 },
  cardTitle: { fontSize: 20, fontWeight: "700", color: "#FFFFFF" },
  cardSubtitle: { fontSize: 14, color: "#A0A0A0" },

  /** ⭐ TIME PERIOD BUTTONS ⭐ **/
  timePeriodContainer: {
    flexDirection: "row",
    justifyContent: "center", // ✅ căn giữa 2 nút
    gap: 12,
    marginBottom: 20,
  },
  timePeriodBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center", // ✅ căn giữa chữ
  },
  timePeriodText: { fontSize: 12, color: "#FFFFFF", fontWeight: "500" },

  /** ⭐ STATS ⭐ **/
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center", // ✅ căn giữa card thống kê
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },

  /** ⭐ CHART ⭐ **/
  chartContainer: { marginVertical: 20, alignItems: "center" },
  chart: { borderRadius: 16 },

  /** ⭐ STREAK ⭐ **/
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "rgba(255,165,0,0.15)",
    borderRadius: 12,
    gap: 8,
  },
  streakText: { fontSize: 14, color: "#FFFFFF" },
  streakNumber: { fontWeight: "700", fontSize: 16 },

  /** ⭐ ACHIEVEMENTS ⭐ **/
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center", // ✅ căn giữa lưới huy hiệu
    gap: 12,
    marginTop: 16,
  },
  achievementItem: {
    width: "45%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center", // ✅ căn giữa nội dung
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  achievementLocked: {
    backgroundColor: "rgba(255,255,255,0.05)",
    opacity: 0.6,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 8,
    textAlign: "center",
  },
  achievementDescription: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 4,
    textAlign: "center",
  },

  bottomPadding: { height: 50 },

  /** ⭐ SETTINGS MODAL ⭐ **/
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "rgba(38, 43, 61, 1)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 24,
    textAlign: "center",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  menuItemDanger: {
    backgroundColor: "rgba(255, 68, 68, 0.1)",
  },
  menuText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  menuTextDanger: {
    color: "#FF6B6B",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 8,
  },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#A0A0A0",
  },
});
