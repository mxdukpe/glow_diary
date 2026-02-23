import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { View, StyleSheet } from 'react-native';
import { supabase } from './src/lib/supabase';

// Import de tes écrans
import HomeScreen from './src/screens/HomeScreen';
import Scanner from './src/screens/Scanner';
import ProductList from './src/screens/ProductList';
import ProfileScreen from './src/screens/ProfileScreen';
import ProductDetails from './src/screens/ProductDetails';
import Auth from './src/screens/Auth';
import RoutineScreen from './src/screens/RoutineScreen';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { StatusBar } from 'expo-status-bar';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainHome" component={HomeScreen} />
      <Stack.Screen name="RoutineDetail" component={RoutineScreen} />
    </Stack.Navigator>
  );
}

function ListStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MesProduits" component={ProductList} />
      <Stack.Screen name="Details" component={ProductDetails} />
    </Stack.Navigator>
  );
}

function AppContent() {
  const [session, setSession] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <NavigationContainer theme={{
        dark: theme.isDark,
        colors: {
          background: theme.colors.background,
          card: theme.colors.card,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.primary,
          primary: theme.primary,
        }
      }}>
        {session && session.user ? (
          <Tab.Navigator
            screenOptions={{
              tabBarShowLabel: false,
              tabBarActiveTintColor: '#000',
              tabBarInactiveTintColor: theme.isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
              headerShown: false,
              tabBarStyle: {
                position: 'absolute',
                bottom: 30,
                left: 20,
                right: 20,
                elevation: 0,
                backgroundColor: theme.isDark ? 'rgba(30,30,30,0.8)' : 'rgba(255,255,255,0.8)',
                borderRadius: 40,
                height: 75,
                borderTopWidth: 0,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              },
              tabBarItemStyle: {
                height: 75,
                justifyContent: 'center',
                alignItems: 'center',
              },
              tabBarBackground: () => (
                <BlurView intensity={theme.isDark ? 60 : 80} style={StyleSheet.absoluteFill} tint={theme.isDark ? "dark" : "light"} />
              ),
            }}
          >
            <Tab.Screen
              name="Home"
              component={HomeStack}
              options={{
                tabBarIcon: ({ focused }) => (
                  <View style={[styles.tabIconContainer, focused && styles.tabIconActive]}>
                    <Ionicons name="home" size={26} color={focused ? "#000" : (theme.isDark ? "#aaa" : "#666")} />
                  </View>
                )
              }}
            />
            <Tab.Screen
              name="Ma Liste"
              component={ListStack}
              options={{
                tabBarIcon: ({ focused }) => (
                  <View style={[styles.tabIconContainer, focused && styles.tabIconActive]}>
                    <Ionicons name="bag-handle" size={26} color={focused ? "#000" : (theme.isDark ? "#aaa" : "#666")} />
                  </View>
                )
              }}
            />
            <Tab.Screen
              name="Recherche"
              component={Scanner}
              options={{
                tabBarIcon: ({ focused }) => (
                  <View style={[styles.tabIconContainer, focused && styles.tabIconActive]}>
                    <Ionicons name="scan" size={26} color={focused ? "#000" : (theme.isDark ? "#aaa" : "#666")} />
                  </View>
                )
              }}
            />
            <Tab.Screen
              name="Routine"
              component={RoutineScreen}
              options={{
                tabBarIcon: ({ focused }) => (
                  <View style={[styles.tabIconContainer, focused && styles.tabIconActive]}>
                    <Ionicons name="calendar" size={26} color={focused ? "#000" : (theme.isDark ? "#aaa" : "#666")} />
                  </View>
                )
              }}
            />
            <Tab.Screen
              name="Profil"
              component={ProfileScreen}
              options={{
                tabBarIcon: ({ focused }) => (
                  <View style={[styles.tabIconContainer, focused && styles.tabIconActive]}>
                    <Ionicons name="person" size={26} color={focused ? "#000" : (theme.isDark ? "#aaa" : "#666")} />
                  </View>
                )
              }}
            />
          </Tab.Navigator>
        ) : (
          <Auth />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 34,
  },
  tabIconActive: {
    backgroundColor: '#FFDE59',
  }
});