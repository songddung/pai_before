import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function QuizEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // URL에서 quiz id 받기

  // 임시 상태 (실제론 API 요청으로 불러오기)
  const [question, setQuestion] = useState("아빠가 가장 좋아하는 운동은?");
  const [answer, setAnswer] = useState("야구");
  const [hint, setHint] = useState("기아타이거즈");
  const [reward, setReward] = useState("용돈 500원");
  const [quizDate, setQuizDate] = useState("2025-11-27");

  const handleSave = async () => {
    try {
      // AsyncStorage에서 현재 퀴즈 목록 가져오기
      const storedQuizzes = await AsyncStorage.getItem('mockQuizzes');

      if (storedQuizzes) {
        const quizzes = JSON.parse(storedQuizzes);

        // 해당 ID의 퀴즈 찾아서 업데이트
        const updatedQuizzes = quizzes.map((quiz: any) => {
          if (quiz.id === id) {
            return {
              ...quiz,
              question,
              answer,
              hint,
              reward,
              quizDate,
            };
          }
          return quiz;
        });

        // AsyncStorage에 다시 저장
        await AsyncStorage.setItem('mockQuizzes', JSON.stringify(updatedQuizzes));

        Alert.alert("성공", "퀴즈가 성공적으로 수정되었습니다.", [
          {
            text: "확인",
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (err: any) {
      console.error("퀴즈 수정 실패:", err);
      Alert.alert("실패", "퀴즈 수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* 헤더 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.push("/(parents)/quiz")}>
              <Ionicons name="chevron-back" size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>퀴즈 편집</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* 입력 폼 */}
          <Text style={styles.label}>질문 *</Text>
          <TextInput
            style={styles.input}
            value={question}
            onChangeText={setQuestion}
            placeholder="질문을 입력하세요"
          />

          <Text style={styles.label}>정답 *</Text>
          <TextInput
            style={styles.input}
            value={answer}
            onChangeText={setAnswer}
            placeholder="정답을 입력하세요"
          />

          <Text style={styles.label}>힌트 (선택)</Text>
          <TextInput
            style={styles.input}
            value={hint}
            onChangeText={setHint}
            placeholder="힌트를 입력하세요"
          />

          <Text style={styles.label}>보상 (선택)</Text>
          <TextInput
            style={styles.input}
            value={reward}
            onChangeText={setReward}
            placeholder="보상을 입력하세요"
          />

          <Text style={styles.label}>출제일 *</Text>
          <TextInput
            style={styles.input}
            value={quizDate}
            onChangeText={setQuizDate}
            placeholder="예: 2025-01-15"
          />

          {/* 저장 버튼 */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>저장하기</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
