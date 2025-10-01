import { Stack } from "expo-router";
import { AuthProvider } from "../core/providers/AuthProvider";
import ErrorBoundary from "../core/components/ErrorBoundary";

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="profile-select" />
          <Stack.Screen name="pin" />
          <Stack.Screen name="voice-setup" />
          <Stack.Screen name="terms" />
          <Stack.Screen name="privacy" />
          <Stack.Screen name="(child)" />
          <Stack.Screen name="(parents)" />
        </Stack>
      </AuthProvider>
    </ErrorBoundary>
  );
}
