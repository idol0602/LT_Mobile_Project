import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../contexts/AuthContext";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import API from "../../api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAchievements } from "../../hooks/useAchievements";

// Icon components (emoji style)
const IconSettings = () => (
  <View style={styles.icon}>
    <Text style={styles.iconText}>⚙️</Text>
  </View>
);

// Removed IconEdit - not used

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
    const fetchProgressStats = async () => {
      try {
        const response = await API.getProgressStats(user!._id as any);
        if (response.success) {
          setProgressStats(response.data);
        }
      } catch (error) {
        console.error("Error fetching progress stats:", error);
        // Don't show error to user, just use default values
      }
    };

    if (isAuthenticated && user?._id) {
      fetchProgressStats();
    }
  }, [isAuthenticated, user]);

  // Refresh user data when screen comes into focus (after editing profile)
  useFocusEffect(
    React.useCallback(() => {
      // Refresh user from AsyncStorage to get latest updates
      const refreshUser = async () => {
        try {
          const storedUser = await AsyncStorage.getItem("user");
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            console.log(
              "Profile screen focused - refreshed user from AsyncStorage:",
              parsedUser
            );

            // Force update user context if avatar changed
            if (parsedUser.avatar !== user?.avatar) {
              console.log("Avatar changed detected, updating context...");
              await updateUser(parsedUser);
            }
          }
        } catch (error) {
          console.error("Error refreshing user:", error);
        }
      };

      refreshUser();
    }, [user?.avatar, updateUser])
  );

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
    router.push("/(auth)/editProfile");
  };

  const handleChangePassword = () => {
    setShowSettingsModal(false);
    router.push("/(auth)/changePassword");
  };

  const userData = {
    name: user?.fullName || user?.name || "Guest",
    email: user?.email || "Not logged in",
    avatar: user?.avatar || defaultAvatar,
    isPro: false,
    streak: progressStats?.streak || 0,
  };

  // Debug log to check avatar value
  console.log("Profile screen - user avatar:", user?.avatar);
  console.log("Profile screen - using avatar:", userData.avatar);

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
    <View style={styles.container}>
      {/* Modern Header */}
      <LinearGradient
        colors={["#0f0f23", "#16213e", "#1a1a2e"]}
        style={styles.modernHeader}
      >
        <View style={styles.headerWrapper}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Your Profile</Text>
            </View>
            <View style={styles.headerRight}>
              {isAuthenticated ? (
                <TouchableOpacity
                  style={styles.headerSettingsBtn}
                  onPress={() => setShowSettingsModal(true)}
                >
                  <LinearGradient
                    colors={["#00d4ff", "#0099ff"]}
                    style={styles.headerSettingsGradient}
                  >
                    <IconSettings />
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.headerLoginBtn}
                  onPress={() => router.push("/(auth)/signIn")}
                >
                  <LinearGradient
                    colors={["#00d4ff", "#0099ff"]}
                    style={styles.headerLoginGradient}
                  >
                    <Text style={styles.headerLoginText}>Login</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Quick Stats Bar */}
          <View style={styles.quickStatsBar}>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatIcon}>🔥</Text>
              <Text style={styles.quickStatValue}>{userData.streak}</Text>
              <Text style={styles.quickStatLabel}>Streak</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatIcon}>📚</Text>
              <Text style={styles.quickStatValue}>
                {progressData.lessonsCompleted}
              </Text>
              <Text style={styles.quickStatLabel}>Lessons</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatIcon}>🏆</Text>
              <Text style={styles.quickStatValue}>
                {achievementStats?.unlockedAchievements || 0}
              </Text>
              <Text style={styles.quickStatLabel}>Achievements</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ImageBackground
        source={require("../../assets/images/background-profile.jpg")}
        style={styles.backgroundContainer}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* User Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileCardHeader}>
              <Image
                source={{ uri: userData.avatar }}
                style={styles.profileAvatar}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userData.name}</Text>
                <Text style={styles.profileEmail}>{userData.email}</Text>
                {userData.isPro && (
                  <View style={styles.profileProBadge}>
                    <Text style={styles.profileProText}>✨ Pro Member</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Modern Tabs */}
          <View style={styles.modernTabContainer}>
            {[
              { key: "progress", label: "📊 Progress", icon: "📈" },
              { key: "achievements", label: "🏆 Achievements", icon: "🎖️" },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={styles.modernTabButton}
              >
                <LinearGradient
                  colors={
                    activeTab === tab.key
                      ? ["#00d4ff", "#0099ff"]
                      : ["#2c2c54", "#40407a"]
                  }
                  style={styles.modernTab}
                >
                  <View style={styles.modernTabContent}>
                    <Text style={styles.modernTabIcon}>{tab.icon}</Text>
                    <Text
                      style={[
                        styles.modernTabText,
                        activeTab === tab.key && styles.modernTabTextActive,
                      ]}
                    >
                      {tab.label.split(" ")[1]}
                    </Text>
                  </View>
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

                {/* Progress Overview */}
                <View style={styles.progressOverview}>
                  <Text style={styles.overviewTitle}>Learning Progress</Text>
                  <View style={styles.progressGrid}>
                    <View style={styles.progressItem}>
                      <LinearGradient
                        colors={["#00d4ff", "#0099ff"]}
                        style={styles.progressIcon}
                      >
                        <IconBook />
                      </LinearGradient>
                      <Text style={styles.progressValue}>
                        {progressData.lessonsCompleted}
                      </Text>
                      <Text style={styles.progressLabel}>
                        Lessons Completed
                      </Text>
                    </View>

                    <View style={styles.progressItem}>
                      <LinearGradient
                        colors={["#FFA500", "#FFD700"]}
                        style={styles.progressIcon}
                      >
                        <IconClock />
                      </LinearGradient>
                      <Text style={styles.progressValue}>
                        {progressData.minutesSpent}
                      </Text>
                      <Text style={styles.progressLabel}>Minutes Spent</Text>
                    </View>

                    <View style={styles.progressItem}>
                      <LinearGradient
                        colors={["#FF6B6B", "#FF5722"]}
                        style={styles.progressIcon}
                      >
                        <IconFire />
                      </LinearGradient>
                      <Text style={styles.progressValue}>
                        {userData.streak}
                      </Text>
                      <Text style={styles.progressLabel}>Day Streak</Text>
                    </View>

                    <View style={styles.progressItem}>
                      <LinearGradient
                        colors={["#4CAF50", "#66BB6A"]}
                        style={styles.progressIcon}
                      >
                        <IconTrophy />
                      </LinearGradient>
                      <Text style={styles.progressValue}>
                        {achievementStats?.unlockedAchievements || 0}
                      </Text>
                      <Text style={styles.progressLabel}>Achievements</Text>
                    </View>
                  </View>
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
                      {(achievementStats.percentageUnlocked || 0).toFixed(0)}%)
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
                        style={[
                          styles.achievementItem,
                          styles.achievementLocked,
                        ]}
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
      </ImageBackground>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  // Compact Header Styles
  modernHeader: {
    paddingTop: 40,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerWrapper: {
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: 12,
  },
  welcomeText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
  },
  headerSettingsBtn: {
    borderRadius: 20,
    overflow: "hidden",
  },
  headerSettingsGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerLoginBtn: {
    borderRadius: 16,
    overflow: "hidden",
  },
  headerLoginGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  headerLoginText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  backgroundContainer: {
    flex: 1,
  },
  scrollView: { flex: 1 },

  // User Info Card with Transparent Background
  // Compact Profile Card Styles
  profileCard: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 16,
    margin: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  profileCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#00d4ff",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 3,
  },
  profileEmail: {
    fontSize: 13,
    color: "#a4b0be",
    marginBottom: 6,
  },
  profileProBadge: {
    backgroundColor: "rgba(255, 165, 0, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#FFA500",
  },
  profileProText: {
    fontSize: 12,
    color: "#FFA500",
    fontWeight: "600",
  },
  // Compact Quick Stats Bar
  quickStatsBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 10,
    marginTop: 3,
  },
  quickStat: {
    alignItems: "center",
    flex: 1,
  },
  quickStatIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  quickStatValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 1,
  },
  quickStatLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
  },
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
  // Removed old avatar and user info styles

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
  progressStatLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },

  /** ⭐ PROGRESS OVERVIEW ⭐ **/
  progressOverview: {
    marginBottom: 20,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 16,
  },
  progressGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  progressItem: {
    width: "48%",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    minHeight: 100,
  },
  progressIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 2,
  },
  progressLabel: {
    fontSize: 11,
    color: "#a4b0be",
    textAlign: "center",
    lineHeight: 14,
  },

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

  // Modern Tabs Styles
  modernTabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  modernTabButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  modernTab: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modernTabContent: {
    alignItems: "center",
    gap: 4,
  },
  modernTabIcon: {
    fontSize: 20,
  },
  modernTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },
  modernTabTextActive: {
    color: "#FFFFFF",
  },
});
