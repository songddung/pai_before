import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function QuizEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // URL에서 quiz id 받기

  // 임시 상태 (실제론 API 요청으로 불러오기)
  const [question, setQuestion] = useState("엄마가 가장 좋아하는 색깔은?");
  const [answer, setAnswer] = useState("파란색");
  const [reward, setReward] = useState("용돈 1000원");

  const handleSave = async () => {
    try {
      const res = await axios.patch(
        `https://j13c101.p.ssafy.io/api/quiz/${id}`,
        {
          question,
          answer,
          reward,
        },
        {
          headers: {
            Authorization: `Bearer <부모용 토큰>`, // 👉 TODO: 로그인 시 받은 토큰으로 교체
          },
        }
      );

      if (res.data.success) {
        alert("퀴즈가 성공적으로 수정되었습니다.");
        router.back(); // 수정 완료 후 원래 화면으로 이동
      } else {
        alert(res.data.message || "수정 실패");
      }
    } catch (err: any) {
      console.error("퀴즈 수정 실패:", err.response?.data || err.message);
      alert(err.response?.data?.message || "퀴즈 수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/(parents)/quiz")}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>퀴즈 편집</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* 입력 폼 */}
        <Text style={styles.label}>질문</Text>
        <TextInput
          style={styles.input}
          value={question}
          onChangeText={setQuestion}
          placeholder="질문을 입력하세요"
        />

        <Text style={styles.label}>정답</Text>
        <TextInput
          style={styles.input}
          value={answer}
          onChangeText={setAnswer}
          placeholder="정답을 입력하세요"
        />

        <Text style={styles.label}>보상</Text>
        <TextInput
          style={styles.input}
          value={reward}
          onChangeText={setReward}
          placeholder="보상을 입력하세요 (선택)"
        />

        {/* 저장 버튼 */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>저장하기</Text>
        </TouchableOpacity>
      </ScrollView>
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
    marginBottom: 20,
    marginTop: 8,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    color: "#374151",
    paddingHorizontal: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    backgroundColor: "white",
    marginHorizontal: 16,
  },

  saveButton: {
    marginTop: 20,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 16,
  },
  saveText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
