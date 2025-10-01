import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../domains/user/hooks/useAuth";
import { profileApi } from "../../../domains/user/api/userApi";

export default function VoiceProfilesScreen() {
  const router = useRouter();
  const { user, accessToken, isAuthenticated } = useAuth();
  const [voiceProfiles, setVoiceProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const accountId = user?.userId || "user123";

  // 프로필 조회 함수
  const fetchProfiles = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      router.replace('/login');
      return;
    }

    setLoading(true);
    try {
      console.log('음성 프로필 목록 조회 시작, 인증 상태:', { isAuthenticated, accessToken: !!accessToken });

      // profileApi를 사용하여 프로필 조회
      const profiles = await profileApi.getAllProfiles();
      console.log('조회된 전체 프로필:', profiles);

      // 부모 프로필이면서 음성이 등록된 프로필만 필터링
      const parentProfilesWithVoice = profiles.filter((profile: any) =>
        profile.profile_type === 'PARENT' && profile.voice_media_id
      );

      console.log('음성이 등록된 부모 프로필:', parentProfilesWithVoice);
      setVoiceProfiles(parentProfilesWithVoice);
    } catch (err: any) {
      console.error("프로필 조회 실패:", err);
      console.error("오류 상세:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      if (err.response?.status === 401) {
        router.replace('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, accessToken, router]);

  // 초기 로드
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // 화면 포커스 시 새로고침
  useFocusEffect(
    useCallback(() => {
      console.log('음성 프로필 목록 화면 포커스 - 데이터 새로고침');
      fetchProfiles();
    }, [fetchProfiles])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: "center" }}>불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
  <TouchableOpacity
    style={styles.backButton}
    onPress={() => router.push("/profile-select")}
  >
    <Ionicons name="chevron-back" size={24} color="#111827" />
  </TouchableOpacity>
  <Text style={styles.headerTitle}>음성 프로필 목록</Text>
  <TouchableOpacity
    style={styles.refreshButton}
    onPress={fetchProfiles}
  >
    <Ionicons name="refresh" size={20} color="#6366f1" />
  </TouchableOpacity>
</View>

      {/* 프로필 리스트 */}
      <FlatList
        data={voiceProfiles}
        keyExtractor={(item) => `voice-profile-${item.profile_id}`}
        renderItem={({ item }) => (
          <View style={styles.profileItem}>
            <Ionicons name="person-circle" size={28} color="#2563eb" />
            <Text style={styles.profileText}>{item.name}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text
            style={{ textAlign: "center", marginTop: 20, color: "#6b7280" }}
          >
            등록된 음성 프로필이 없습니다.
          </Text>
        }
      />

      {/* + 버튼 */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/(parents)/voice-profiles/create")}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    flex: 1,
  },
  backButton: {
    paddingLeft: 12,
  },
  refreshButton: {
    paddingRight: 12,
    padding: 4,
  },
  profileItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  profileText: { marginLeft: 12, fontSize: 16, color: "#111827" },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#2563eb",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
});
