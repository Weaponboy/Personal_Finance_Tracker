import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../lib/AuthContext';

// Prevent auto-hide as early as possible (global scope)
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const auth = useAuth(); // Get the full context object
  const loading = auth?.loading ?? true; // Use optional chaining and fallback to true if undefined

  // Hide splash screen when auth loading is complete
  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync().catch(console.error);
    }
  }, [loading]);

  // Optional fallback to hide splash if auth takes too long
  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(console.error);
    }, 5000); // 5 seconds max
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4F99B3',
          },
          headerTitleStyle: {
            fontSize: 25,
          },
        }}
      >
        <Stack.Screen name="index" options={{
          title: "Home",
          headerTitleAlign: "center",
        }} />
        <Stack.Screen name="addTransactions" options={{
          title: "Add Transactions",
          headerTitleAlign: "center",
        }} />
        <Stack.Screen name="viewFinances" options={{
          title: "View Finances",
          headerTitleAlign: "center",
        }} />
        <Stack.Screen name="settings" options={{
          title: "Settings",
          headerTitleAlign: "center",
        }} />
      </Stack>
    </AuthProvider>
  );
};

export default RootLayout;