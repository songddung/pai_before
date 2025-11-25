import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();

  // Mock 프로필 데이터 (포트폴리오용)
  const profileData = {
    name: "송현광",
    email: "songhg@example.com",
    phone: "010-1234-5678",
    birth_date: "1997-04-01",
    role: "아빠",
    avatar: require("../../../assets/images/piggy1.jpg"),
    children: [
      { id: 1, name: "정유진", age: 8, birth_date: "2017-03-15", avatar: require("../../../assets/images/piggy2.jpg") },
      { id: 2, name: "김민규", age: 6, birth_date: "2019-07-22", avatar: require("../../../assets/images/piggy3.jpg") },
    ],
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>프로필</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => router.replace("/profile-select")}
        >
          <Ionicons name="exit-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 프로필 카드 */}
        <View style={styles.profileCard}>
          <Image source={profileData.avatar} style={styles.avatar} />
          <Text style={styles.name}>{profileData.name}</Text>
          <Text style={styles.role}>{profileData.role}</Text>
        </View>

        {/* 정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기본 정보</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="mail-outline" size={20} color="#6b7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>이메일</Text>
              <Text style={styles.infoValue}>{profileData.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="call-outline" size={20} color="#6b7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>전화번호</Text>
              <Text style={styles.infoValue}>{profileData.phone}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar-outline" size={20} color="#6b7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>생년월일</Text>
              <Text style={styles.infoValue}>{profileData.birth_date}</Text>
            </View>
          </View>
        </View>

        {/* 자녀 목록 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>자녀 목록</Text>
          {profileData.children.map((child) => (
            <View key={child.id} style={styles.childCard}>
              <Image source={child.avatar} style={styles.childAvatar} />
              <View style={styles.childInfo}>
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.childAge}>{child.age}세</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 프로필 전환 버튼 */}
        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => router.replace("/profile-select")}
        >
          <Ionicons name="swap-horizontal" size={20} color="#fff" />
          <Text style={styles.switchButtonText}>프로필 전환</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  logoutButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: "#6b7280",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  childCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    marginBottom: 8,
  },
  childAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  childAge: {
    fontSize: 14,
    color: "#6b7280",
  },
  switchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  switchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
