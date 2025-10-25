import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';

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

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState('progress');

  const userData = {
    name: 'John Wick',
    email: 'john.wick@example.com',
    avatar:
      'https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/474190UWU/anh-avatar-one-piece-sieu-dep_082621920.jpg',
    isPro: true,
    streak: 15,
  };

  const progressData = {
    lessonsCompleted: 115,
    minutesSpent: 350,
    weeklyData: [12, 19, 8, 15, 10, 18, 22],
    days: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'],
  };

  const achievements = [
    { id: 1, title: 'First Step', locked: false },
    { id: 2, title: 'Week Warrior', locked: false },
    { id: 3, title: 'Month Master', locked: true },
    { id: 4, title: 'Year Champion', locked: true },
    { id: 5, title: 'Perfect Streak', locked: false },
    { id: 6, title: 'Speed Demon', locked: true },
  ];

  return (
    <ImageBackground
      source={require('../../assets/images/background-profile.jpg')}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>{userData.name}</Text>
            {userData.isPro && (
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>Pro</Text>
              </View>
            )}
            <TouchableOpacity style={styles.settingsBtn}>
              <IconSettings />
            </TouchableOpacity>
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
          {['progress', 'achievements'].map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
              <LinearGradient
                colors={
                  activeTab === tab
                    ? ['#00D4FF', '#0099FF']
                    : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.05)']
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
                  {tab === 'progress' ? 'Progress' : 'Achievements'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Progress Tab */}
        {activeTab === 'progress' && (
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
                {['Last 7 days', 'Last 12 months'].map((label) => (
                  <TouchableOpacity key={label}>
                    <LinearGradient
                      colors={['#00D4FF', '#00FFAA']}
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
                  colors={['#0099FF', '#00D4FF']}
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
                  colors={['#FFA500', '#FFD700']}
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
                        color: () => '#00D4FF',
                        strokeWidth: 3,
                      },
                    ],
                  }}
                  width={Dimensions.get('window').width - 40}
                  height={220}
                  chartConfig={{
                    backgroundColor: 'transparent',
                    backgroundGradientFrom: 'transparent',
                    backgroundGradientTo: 'transparent',
                    color: () => 'rgba(255, 255, 255, 0.3)',
                    labelColor: () => '#A0A0A0',
                    style: { borderRadius: 16 },
                    propsForDots: {
                      r: '5',
                      strokeWidth: '2',
                      stroke: '#00D4FF',
                    },
                  }}
                  bezier
                  style={styles.chart}
                />
              </View>

              {/* Streak */}
              <View style={styles.streakContainer}>
                <IconFire />
                <Text style={styles.streakText}>
                  <Text style={styles.streakNumber}>{userData.streak}</Text> day
                  streak
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Your Achievements</Text>
              <View style={styles.achievementsGrid}>
                {achievements.map((achievement) =>
                  achievement.locked ? (
                    <View
                      key={achievement.id}
                      style={[styles.achievementItem, styles.achievementLocked]}
                    >
                      <IconTrophy />
                      <Text style={styles.achievementTitle}>
                        {achievement.title}
                      </Text>
                    </View>
                  ) : (
                    <LinearGradient
                      key={achievement.id}
                      colors={['#00D4FF', '#00FFAA']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.achievementItem}
                    >
                      <IconTrophy />
                      <Text style={styles.achievementTitle}>
                        {achievement.title}
                      </Text>
                    </LinearGradient>
                  )
                )}
              </View>
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
  },
  scrollView: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30 },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  proBadge: {
    backgroundColor: '#FFA500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  proBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  settingsBtn: { padding: 8 },
  icon: { justifyContent: 'center', alignItems: 'center' },
  iconText: { fontSize: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#00D4FF',
  },
  editAvatarWrapper: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
  },
  editAvatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: { alignItems: 'center' },
  userEmail: { fontSize: 14, color: '#A0A0A0' },

  /** ⭐ TAB BUTTONS ⭐ **/
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // ✅ căn giữa hàng tab
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center', // ✅ căn giữa nội dung
  },
  tabText: { fontSize: 14, fontWeight: '600', color: '#A0A0A0' },
  tabTextActive: { color: '#FFFFFF' },

  /** ⭐ TAB CONTENT ⭐ **/
  tabContent: {
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center', // ✅ căn giữa toàn bộ phần nội dung tab
  },
  card: {
    backgroundColor: 'rgba(38,43,61,1)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    width: '100%',
  },
  cardHeader: { marginBottom: 20 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  cardSubtitle: { fontSize: 14, color: '#A0A0A0' },

  /** ⭐ TIME PERIOD BUTTONS ⭐ **/
  timePeriodContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // ✅ căn giữa 2 nút
    gap: 12,
    marginBottom: 20,
  },
  timePeriodBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center', // ✅ căn giữa chữ
  },
  timePeriodText: { fontSize: 12, color: '#FFFFFF', fontWeight: '500' },

  /** ⭐ STATS ⭐ **/
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // ✅ căn giữa card thống kê
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  /** ⭐ CHART ⭐ **/
  chartContainer: { marginVertical: 20, alignItems: 'center' },
  chart: { borderRadius: 16 },

  /** ⭐ STREAK ⭐ **/
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(255,165,0,0.15)',
    borderRadius: 12,
    gap: 8,
  },
  streakText: { fontSize: 14, color: '#FFFFFF' },
  streakNumber: { fontWeight: '700', fontSize: 16 },

  /** ⭐ ACHIEVEMENTS ⭐ **/
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center', // ✅ căn giữa lưới huy hiệu
    gap: 12,
    marginTop: 16,
  },
  achievementItem: {
    width: '45%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center', // ✅ căn giữa nội dung
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  achievementLocked: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    opacity: 0.6,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },

  bottomPadding: { height: 50 },
});

