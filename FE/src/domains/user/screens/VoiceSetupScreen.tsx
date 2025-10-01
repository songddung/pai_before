import { Ionicons } from "@expo/vector-icons"; // 아이콘 (마이크, 뒤로가기 등)
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VoiceSetupScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          {/* 또는 navigation.navigate("ProfileSelection") 로 특정 화면 이동 */}
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>음성 학습</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 안내 타이틀 */}
      <Text style={styles.title}>음성 학습</Text>
      <Text style={styles.subText}>
        아래 문장들을 자연스럽게 읽어주세요.{"\n"}더 나은 TTS 음성을 만들 수 있습니다.
      </Text>

      {/* 진행률 */}
      <View style={styles.progressBox}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>전체 진행률</Text>
          <Text style={styles.progressCount}>
            {currentStep - 1}/{totalSteps}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentStep - 1) / totalSteps) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* 문장 카드 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>문장 {currentStep} / {totalSteps}</Text>
        <Text style={styles.cardDescription}>
          아래 문장을 또렷하고 자연스럽게 읽어주세요
        </Text>
        <View style={styles.sentenceBox}>
          <Text style={styles.sentence}>안녕하세요, 저는 여러분의 AI 도우미입니다.</Text>
        </View>

        {/* 녹음 버튼 */}
        <TouchableOpacity style={styles.recordButton}>
          <Ionicons name="mic" size={20} color="white" />
          <Text style={styles.recordText}>녹음 시작</Text>
        </TouchableOpacity>
      </View>

      {/* 네비게이션 버튼 */}
      <View style={styles.navRow}>
        <TouchableOpacity style={[styles.navButton, { backgroundColor: "#e5e7eb" }]}>
          <Text style={[styles.navText, { color: "#6b7280" }]}>이전</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navText}>다음</Text>
        </TouchableOpacity>
      </View>

      {/* 녹음 진행 상황 */}
      <View style={styles.stepBox}>
        <Text style={styles.stepTitle}>녹음 진행 상황</Text>
        <View style={styles.stepRow}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.stepCircle,
                currentStep === i + 1 && styles.stepActive,
              ]}
            >
              <Text style={styles.stepText}>{i + 1}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  headerTitle: { fontSize: 16, fontWeight: "bold" },
  title: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginTop: 16 },
  subText: { textAlign: "center", color: "#6b7280", marginBottom: 20 },
  progressBox: { backgroundColor: "#f9fafb", padding: 12, borderRadius: 8, marginBottom: 16 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontSize: 12, color: "#374151" },
  progressCount: { fontSize: 12, color: "#6b7280" },
  progressBar: { backgroundColor: "#e5e7eb", height: 6, borderRadius: 6, marginTop: 6 },
  progressFill: { backgroundColor: "#3b82f6", height: 6, borderRadius: 6 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, elevation: 2, marginBottom: 20 },
  cardTitle: { fontWeight: "bold", marginBottom: 4 },
  cardDescription: { fontSize: 12, color: "#6b7280", marginBottom: 12 },
  sentenceBox: { backgroundColor: "#eff6ff", padding: 12, borderRadius: 8, marginBottom: 16 },
  sentence: { color: "#111827", textAlign: "center" },
  recordButton: { flexDirection: "row", backgroundColor: "#3b82f6", padding: 12, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  recordText: { color: "white", fontWeight: "bold", marginLeft: 6 },
  navRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  navButton: { flex: 1, marginHorizontal: 4, padding: 12, borderRadius: 8, backgroundColor: "#3b82f6" },
  navText: { color: "white", textAlign: "center", fontWeight: "bold" },
  stepBox: { backgroundColor: "#fff", padding: 16, borderRadius: 12 },
  stepTitle: { fontSize: 14, fontWeight: "bold", marginBottom: 8 },
  stepRow: { flexDirection: "row", justifyContent: "space-between" },
  stepCircle: { width: 40, height: 40, borderRadius: 8, borderWidth: 2, borderColor: "#d1d5db", justifyContent: "center", alignItems: "center" },
  stepActive: { borderColor: "#2563eb", backgroundColor: "#eff6ff" },
  stepText: { fontWeight: "bold" },
  tabBar: { flexDirection: "row", justifyContent: "space-around", padding: 12, borderTopWidth: 1, borderColor: "#e5e7eb", marginTop: "auto" },
  tab: { color: "#6b7280", fontSize: 12 },
  tabActive: { color: "#2563eb", fontWeight: "bold", fontSize: 12 },
});
