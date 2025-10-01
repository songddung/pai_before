import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../domains/user/hooks/useAuth";
import { quizApi } from "../../../domains/quiz/api/quizApi";

export default function QuizCreateScreen() {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAuth();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [reward, setReward] = useState("");

  const [loading, setLoading] = useState(false);

  const handleCreateQuiz = async () => {
    if (!question || !answer) {
      Alert.alert("알림", "질문과 정답은 필수입니다.");
      return;
    }

    if (!isAuthenticated || !accessToken) {
      Alert.alert("인증 오류", "다시 로그인해주세요.");
      router.replace('/login');
      return;
    }

    try {
      setLoading(true);

      console.log('퀴즈 생성 시작:', { question, answer, reward });
      console.log('현재 토큰 상태:', {
        isAuthenticated,
        hasToken: !!accessToken,
        tokenLength: accessToken?.length
      });

      // 백엔드가 기대하는 간단한 형식으로 API 호출
      const result = await quizApi.createQuiz({
        question: question,
        answer: answer,
        reward: reward || undefined
      });

      console.log('퀴즈 생성 성공:', result);

      Alert.alert("✅ 성공", "퀴즈가 성공적으로 생성되었습니다.", [
        {
          text: "확인",
          onPress: () => {
            console.log('퀴즈 생성 완료 - 부모 페이지로 이동');
            router.back();
          },
        },
      ]);
    } catch (err: any) {
      console.error('퀴즈 생성 실패:', err);
      console.error('에러 상세:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });

      if (err.response?.status === 409) {
        Alert.alert("⚠️ 제한", "오늘 이미 퀴즈를 생성하셨습니다.");
      } else if (err.response?.status === 401) {
        Alert.alert("인증 오류", "다시 로그인해주세요.", [
          { text: "확인", onPress: () => router.replace('/login') }
        ]);
      } else {
        const errorMessage = err.response?.data?.message || err.message || "퀴즈 생성 중 오류가 발생했습니다.";
        Alert.alert("❌ 실패", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>퀴즈 생성</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 입력 폼 */}
      <View style={styles.form}>
        <Text style={styles.label}>질문 *</Text>
        <TextInput
          style={styles.input}
          placeholder="예: 사과는 영어로 뭘까?"
          value={question}
          onChangeText={setQuestion}
        />

        <Text style={styles.label}>정답 *</Text>
        <TextInput
          style={styles.input}
          placeholder="예: apple"
          value={answer}
          onChangeText={setAnswer}
        />

        <Text style={styles.label}>보상 (선택)</Text>
        <TextInput
          style={styles.input}
          placeholder="예: 용돈 1000원"
          value={reward}
          onChangeText={setReward}
        />

        <TouchableOpacity
          style={[styles.submitButton, loading && { opacity: 0.6 }]}
          onPress={handleCreateQuiz}
          disabled={loading}
        >
          <Text style={styles.submitText}>
            {loading ? "생성 중..." : "퀴즈 생성하기"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", padding: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
    textAlign: "center",
  },
  form: { marginTop: 20 },
  label: { fontSize: 14, fontWeight: "bold", marginBottom: 6, color: "#374151" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  submitButton: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
