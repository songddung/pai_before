import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import {
  FlatList,
  Image,
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
        contentContainerStyle={{ padding: 16 }}
        data={voiceProfiles}
        keyExtractor={(item) => `voice-profile-${item.profile_id}`}
        renderItem={({ item, index }) => {
          // avatar_media_id를 기반으로 piggy 이미지 매칭
          const piggyImages: { [key: string]: any } = {
            piggy1: require('../../../../assets/images/piggy1.jpg'),
            piggy2: require('../../../../assets/images/piggy2.jpg'),
            piggy3: require('../../../../assets/images/piggy3.jpg'),
          };
          const piggyImage = piggyImages[item.avatar_media_id] || require('../../../../assets/images/piggy1.jpg');

          // 부모 프로필이면 기본값 제공
          const birthDate = item.birth_date || '1997-04-01';
          const role = '아빠';

          return (
            <View style={styles.card}>
              <Image
                source={piggyImage}
                style={styles.avatar}
              />
              <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.subText}>
                  {birthDate} · {role}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
            <Text style={{ color: '#6b7280', textAlign: 'center' }}>
              등록된 음성 프로필이 없습니다.
            </Text>
          </View>
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
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    flex: 1,
  },
  backButton: {
    padding: 4,
  },
  refreshButton: {
    padding: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827'
  },
  subText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4
  },
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
