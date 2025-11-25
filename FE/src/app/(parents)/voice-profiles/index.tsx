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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VoiceProfilesScreen() {
  const router = useRouter();
  const [voiceProfiles, setVoiceProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 프로필 조회 함수 (포트폴리오용 Mock)
  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      console.log('음성 프로필 목록 조회 시작 (Mock 모드)');

      // AsyncStorage에서 캐시된 Mock 데이터 가져오기
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const cachedData = await AsyncStorage.getItem('mock_voice_profiles');

      let profiles = [];
      if (cachedData) {
        profiles = JSON.parse(cachedData);
        console.log('캐시된 음성 프로필 로드:', profiles);
      } else {
        console.log('캐시된 데이터 없음 - 빈 목록 표시');
      }

      setVoiceProfiles(profiles);
    } catch (err: any) {
      console.error("프로필 조회 실패:", err);
      setVoiceProfiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 캐시 초기화 함수 (모든 AsyncStorage 데이터 삭제)
  const clearCache = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;

      // 모든 AsyncStorage 데이터 삭제
      await AsyncStorage.clear();

      console.log('모든 캐시 초기화 완료 (음성 프로필, 퀴즈 등)');
      fetchProfiles(); // 새로고침
    } catch (err) {
      console.error('캐시 초기화 실패:', err);
    }
  };

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
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearCache}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchProfiles}
          >
            <Ionicons name="refresh" size={20} color="#6366f1" />
          </TouchableOpacity>
        </View>
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    padding: 4,
    marginRight: 8,
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
