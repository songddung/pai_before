import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VoiceProfileListScreen() {
  const router = useRouter();
  const [voiceProfiles, setVoiceProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const accountId = "user123"; // TODO: 팀원 API 연동 시 교체

  // 프로필 조회
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await axios.get(
          `https://j13c101.p.ssafy.io/api/ai/tts/voice-profiles/${accountId}`,
          {
            headers: {
              Authorization: `Bearer `, // 👉 TODO: 로그인 시 받은 토큰으로 교체
            },
          }
        );
        setVoiceProfiles(res.data || []);
      } catch (err: any) {
        console.error("프로필 조회 실패:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

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
  <View style={{ width: 24 }} />
</View>

      {/* 프로필 리스트 */}
      <FlatList
        data={voiceProfiles}
        keyExtractor={(item) => item.profile_id}
        renderItem={({ item }) => (
          <View style={styles.profileItem}>
            <Ionicons name="person-circle" size={28} color="#2563eb" />
            <Text style={styles.profileText}>{item.profile_name}</Text>
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