import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Answer = {
  id: string;
  text: string;
  similarity: number; // 0~100
  correct: boolean;
};

export default function QuizDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [completed, setCompleted] = useState(false);

  // 임시 퀴즈 데이터
  const quiz = {
    id,
    title: "엄마 취향 퀴즈",
    question: "엄마가 가장 좋아하는 색깔은?",
    reward: "스티커 3개",
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const similarity = Math.floor(Math.random() * 100);
    const isCorrect = input.includes("파란색");

    const newAnswer: Answer = {
      id: Date.now().toString(),
      text: input.trim(),
      similarity: isCorrect ? 100 : similarity,
      correct: isCorrect,
    };

    setAnswers((prev) => [...prev, newAnswer]);
    setInput("");

    if (isCorrect) setCompleted(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{quiz.title}</Text>
      </View>
      <Text style={styles.meta}>
        보상: {quiz.reward} | 시도: {answers.length}번
      </Text>

      {/* 문제 */}
      <View style={styles.questionBox}>
        <Text style={styles.questionLabel}>퀴즈 문제</Text>
        <Text style={styles.question}>{quiz.question}</Text>
      </View>

      {/* 답변 리스트 */}
      <FlatList
        data={answers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.answerRow,
              item.correct ? styles.answerRight : styles.answerLeft,
            ]}
          >
            <View
              style={[
                styles.answerBubble,
                item.correct ? styles.correctBubble : styles.wrongBubble,
              ]}
            >
              <Text style={styles.answerText}>{item.text}</Text>
            </View>
            <Text
              style={[
                styles.similarity,
                item.correct ? styles.simCorrect : styles.simWrong,
              ]}
            >
              {item.similarity}% 유사도{" "}
              {item.correct ? "정답입니다! 🎉" : "다시 생각해봐요!"}
            </Text>
          </View>
        )}
        ListFooterComponent={
          completed ? (
            <View style={styles.rewardCard}>
              <Text style={styles.rewardTitle}>🎉 축하해요!</Text>
              <Text>정답을 맞혔어요.</Text>
              <Text style={styles.rewardMeta}>보상: {quiz.reward}</Text>
            </View>
          ) : null
        }
        style={{ flex: 1 }}
      />

      {/* 입력창 */}
      {!completed && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="답을 입력해주세요..."
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Text style={{ color: "#fff" }}>전송</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  title: { fontSize: 18, fontWeight: "bold", marginLeft: 8 },
  meta: { fontSize: 12, color: "#666", marginTop: 4, paddingHorizontal: 16 },

  questionBox: {
    backgroundColor: "#f9f5ff",
    margin: 16,
    padding: 12,
    borderRadius: 8,
  },
  questionLabel: { fontWeight: "bold", marginBottom: 6 },
  question: { fontSize: 15 },

  answerRow: { marginHorizontal: 16, marginBottom: 14, maxWidth: "80%" },
  answerLeft: { alignSelf: "flex-start" },
  answerRight: { alignSelf: "flex-end" },
  answerBubble: { padding: 10, borderRadius: 12 },
  wrongBubble: { backgroundColor: "#ec4899" },
  correctBubble: { backgroundColor: "#10b981" },
  answerText: { color: "#fff" },

  similarity: { marginTop: 4, fontSize: 12 },
  simWrong: { color: "#dc2626" },
  simCorrect: { color: "#16a34a" },

  rewardCard: {
    backgroundColor: "#d1fae5",
    padding: 16,
    borderRadius: 8,
    margin: 16,
    alignItems: "center",
  },
  rewardTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 6 },
  rewardMeta: { fontSize: 14, marginTop: 4 },

  inputRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#eee",
    padding: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#ec4899",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
});