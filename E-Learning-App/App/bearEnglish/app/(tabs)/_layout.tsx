import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function TabLayout() {
  const THEME_COLORS = {
    ACTIVE_TINT: '#2196F3', 
    INACTIVE_TINT: '#A1A1A1', 
    BACKGROUND: '#1C1C1E', 
    SHADOW: '#000000',
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: THEME_COLORS.ACTIVE_TINT,
        tabBarInactiveTintColor: THEME_COLORS.INACTIVE_TINT,
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBarContainer,
          backgroundColor: THEME_COLORS.BACKGROUND,
          ...Platform.select({
            ios: styles.shadowIOS,
          }),
        },
        tabBarLabelStyle: styles.tabBarLabel,
      }}>
      
      {/* 1. Tab Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          // SỬ DỤNG FONT AWESOME: home
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="home" color={color} />,
        }}
      />
      
      {/* 2. Tab AI Teacher */}
      <Tabs.Screen
        name="aiTeacher"
        options={{
          title: 'AI Teacher',
          // SỬ DỤNG FONT AWESOME: robot (hoặc magic, star)
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="magic" color={color} />,
        }}
      />
      
      {/* 3. Tab Developer */}
      <Tabs.Screen
        name="developer"
        options={{
          title: 'Developer',
          // SỬ DỤNG FONT AWESOME: wrench
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="wrench" color={color} />, 
        }}
      />
      
      {/* 4. Tab Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          // SỬ DỤNG FONT AWESOME: user
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    borderTopWidth: 0,
    elevation: 0, 
    height: Platform.OS === 'ios' ? 90 : 65,
    paddingBottom: Platform.OS === 'ios' ? 30 : 5,
    paddingTop: 5,
    borderRadius: 15, 
    position: 'absolute',
    bottom: 0,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  shadowIOS: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  shadowAndroid: {
    elevation: 10,
  }
});