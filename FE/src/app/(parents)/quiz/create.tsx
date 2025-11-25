import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from "../../../domains/user/hooks/useAuth";
import { quizApi } from "../../../domains/quiz/api/quizApi";

export default function QuizCreateScreen() {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAuth();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [reward, setReward] = useState("");
  const [hint, setHint] = useState("");
  const [quizDate, setQuizDate] = useState("");

  const [loading, setLoading] = useState(false);

  const handleCreateQuiz = async () => {
    if (!question || !answer || !quizDate) {
      Alert.alert("알림", "질문, 정답, 출제일은 필수입니다.");
      return;
    }

    try {
      setLoading(true);

      // AsyncStorage에서 현재 퀴즈 목록 가져오기
      const storedQuizzes = await AsyncStorage.getItem('mockQuizzes');
      const quizzes = storedQuizzes ? JSON.parse(storedQuizzes) : [];

      // 새 퀴즈 ID 생성 (기존 최대 ID + 1)
      const maxId = quizzes.reduce((max: number, q: any) => {
        const id = parseInt(q.id);
        return id > max ? id : max;
      }, 0);
      const newId = (maxId + 1).toString();

      // 새 퀴즈 객체 생성
      const newQuiz = {
        id: newId,
        question,
        answer,
        hint: hint || '',
        reward: reward || '',
        category: '기타',
        quizDate,
        childResults: [],
      };

      // 퀴즈 목록에 추가
      const updatedQuizzes = [...quizzes, newQuiz];

      // 출제일 순서로 정렬 (최신순)
      updatedQuizzes.sort((a: any, b: any) => {
        return b.quizDate.localeCompare(a.quizDate);
      });

      // AsyncStorage에 저장
      await AsyncStorage.setItem('mockQuizzes', JSON.stringify(updatedQuizzes));

      Alert.alert("성공", "퀴즈가 성공적으로 생성되었습니다.", [
        {
          text: "확인",
          onPress: () => router.back(),
        },
      ]);
    } catch (err: any) {
      console.error('퀴즈 생성 실패:', err);
      Alert.alert("실패", "퀴즈 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>퀴즈 생성</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* 입력 폼 */}
        <ScrollView
          style={styles.form}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
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

          <Text style={styles.label}>힌트 (선택)</Text>
          <TextInput
            style={styles.input}
            placeholder="예: a로 시작하는 빨간 과일"
            value={hint}
            onChangeText={setHint}
          />

          <Text style={styles.label}>보상 (선택)</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 용돈 1000원"
            value={reward}
            onChangeText={setReward}
          />

          <Text style={styles.label}>출제일 *</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 2025-01-15"
            value={quizDate}
            onChangeText={setQuizDate}
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
        </ScrollView>
      </KeyboardAvoidingView>
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
