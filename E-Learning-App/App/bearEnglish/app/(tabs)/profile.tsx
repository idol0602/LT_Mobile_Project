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

// Icon components (using simple SVG-like shapes)
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

const IconBook = () => (
  <Text style={styles.iconText}>📚</Text>
);

const IconClock = () => (
  <Text style={styles.iconText}>⏱️</Text>
);

const IconFire = () => (
  <Text style={styles.iconText}>🔥</Text>
);

const IconTrophy = () => (
  <Text style={styles.iconText}>🏆</Text>
);

const IconBell = () => (
  <Text style={styles.iconText}>🔔</Text>
);

const IconUser = () => (
  <Text style={styles.iconText}>👤</Text>
);

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState('progress');

  const userData = {
    name: 'John Wick',
    email: 'john.wick@example.com',
    avatar: 'https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/474190UWU/anh-avatar-one-piece-sieu-dep_082621920.jpg',
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

  const notifications = [
    { id: 1, title: 'Great job!', message: 'You completed 5 lessons today', time: '2h ago' },
    { id: 2, title: 'Streak alert', message: 'Your 15-day streak is going strong!', time: '1d ago' },
    { id: 3, title: 'New achievement', message: 'You unlocked "Week Warrior"', time: '3d ago' },
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
            {userData.isPro && <View style={styles.proBadge}><Text style={styles.proBadgeText}>Pro</Text></View>}
            <TouchableOpacity style={styles.settingsBtn}>
              <IconSettings />
            </TouchableOpacity>
          </View>

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <Image
              source={{ uri: userData.avatar }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editAvatarBtn}>
              <IconEdit />
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.userEmail}>{userData.email}</Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'progress' && styles.tabActive]}
            onPress={() => setActiveTab('progress')}
          >
            <Text style={[styles.tabText, activeTab === 'progress' && styles.tabTextActive]}>
              Progress
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'achievements' && styles.tabActive]}
            onPress={() => setActiveTab('achievements')}
          >
            <Text style={[styles.tabText, activeTab === 'achievements' && styles.tabTextActive]}>
              Achievements
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'progress' && (
          <View style={styles.tabContent}>
            {/* Activity Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Activity</Text>
                <Text style={styles.cardSubtitle}>Keep track of your efforts</Text>
              </View>

              {/* Time Period Selector */}
              <View style={styles.timePeriodContainer}>
                <TouchableOpacity style={styles.timePeriodBtn}>
                  <Text style={styles.timePeriodText}>Last 7 days</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.timePeriodBtn}>
                  <Text style={styles.timePeriodText}>Last 12 months</Text>
                </TouchableOpacity>
              </View>

              {/* Stats Cards */}
              <View style={styles.statsContainer}>
                <View style={[styles.statCard, styles.statCardBlue]}>
                  <IconBook />
                  <Text style={styles.statNumber}>{progressData.lessonsCompleted}</Text>
                  <Text style={styles.statLabel}>LESSONS COMPLETED</Text>
                </View>
                <View style={[styles.statCard, styles.statCardOrange]}>
                  <IconClock />
                  <Text style={styles.statNumber}>{progressData.minutesSpent}</Text>
                  <Text style={styles.statLabel}>MINUTES SPENT</Text>
                </View>
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
                  <Text style={styles.streakNumber}>{userData.streak}</Text> day streak
                </Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'achievements' && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Your Achievements</Text>
              <View style={styles.achievementsGrid}>
                {achievements.map((achievement) => (
                  <View
                    key={achievement.id}
                    style={[
                      styles.achievementItem,
                      achievement.locked && styles.achievementLocked,
                    ]}
                  >
                    <IconTrophy />
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  </View>
                ))}
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
    width: "100%",
    flex: 1,
    backgroundColor: '#0F1419',
    resizeMode: 'cover',
    borderRadius: 12,
    overflow: 'hidden',
    paddingBottom: 30,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  proBadge: {
    backgroundColor: '#FFA500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  proBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  settingsBtn: {
    padding: 8,
  },
  icon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#00D4FF',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: '#FFFFFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0F1419',
  },
  userInfo: {
    alignItems: 'center',
  },
  userEmail: {
    fontSize: 14,
    color: '#A0A0A0',
    marginBottom: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A0A0A0',
  },
  tabTextActive: {
    color: '#0F1419',
  },
  tabContent: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(38, 43, 61, 1)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  timePeriodContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  timePeriodBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    alignItems: 'center',
  },
  timePeriodText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCardBlue: {
    backgroundColor: '#0099FF',
  },
  statCardOrange: {
    backgroundColor: '#FFA500',
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
  chartContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 165, 0, 0.15)',
    borderRadius: 12,
    gap: 8,
  },
  streakText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  streakNumber: {
    fontWeight: '700',
    fontSize: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  achievementItem: {
    width: '48%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  achievementLocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.6,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  notificationTime: {
    fontSize: 11,
    color: '#707070',
  },
  bottomPadding: {
    height: 20,
  },
});