import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RecommendScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>추천</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container}>
        <Text style={styles.title}>맞춤 추천</Text>
        <Text style={styles.subtitle}>아이의 관심사와 발달 단계에 맞는 활동을 추천해드려요</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 오늘의 추천 활동</Text>
          <View style={styles.recommendItem}>
            <Text style={styles.recommendTitle}>과학 실험: 물의 순환</Text>
            <Text style={styles.recommendDesc}>아이가 물에 대해 궁금해했어요</Text>
          </View>
          <View style={styles.recommendItem}>
            <Text style={styles.recommendTitle}>읽기 활동: 동물 도감</Text>
            <Text style={styles.recommendDesc}>동물에 대한 질문이 많았어요</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📚 추천 도서</Text>
          <View style={styles.bookItem}>
            <Text style={styles.bookTitle}>어린이 과학 백과</Text>
            <Text style={styles.bookDesc}>호기심 많은 아이에게 딱!</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#6b7280", marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  recommendItem: { marginBottom: 12 },
  recommendTitle: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  recommendDesc: { fontSize: 12, color: "#6b7280" },
  bookItem: { marginBottom: 8 },
  bookTitle: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  bookDesc: { fontSize: 12, color: "#6b7280" },
});