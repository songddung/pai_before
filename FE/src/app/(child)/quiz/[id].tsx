import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../domains/user/hooks/useAuth";
import { quizApi } from "../../../domains/quiz/api/quizApi";

type Answer = {
  id: string;
  text: string;
  similarity: number; // 0~100
  correct: boolean;
};

export default function QuizDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAuth();

  const [input, setInput] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [completed, setCompleted] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizDetail = async () => {
      if (!isAuthenticated || !accessToken) {
        router.replace('/login');
        return;
      }

      if (!id) {
        Alert.alert('오류', '퀴즈 ID가 없습니다.');
        router.back();
        return;
      }

      setLoading(true);
      try {
        console.log('퀴즈 상세 조회 시작, ID:', id);

        // 오늘의 퀴즈 목록에서 해당 ID의 퀴즈 찾기
        const availableQuizzes = await quizApi.getAvailableQuizzes();
        console.log('오늘의 퀴즈 목록:', availableQuizzes);

        const targetQuiz = availableQuizzes.find((q: any) => q.id === id);

        if (targetQuiz) {
          setQuiz(targetQuiz);
          console.log('선택된 퀴즈:', targetQuiz);

          // 이미 해결된 퀴즈인지 확인
          if (targetQuiz.myResult?.isSolved) {
            setCompleted(true);
            console.log('이미 해결된 퀴즈입니다.');
          }
        } else {
          console.error('퀴즈를 찾을 수 없음, ID:', id);
          Alert.alert('오류', '퀴즈를 찾을 수 없습니다.', [
            { text: '확인', onPress: () => router.back() }
          ]);
        }
      } catch (error: any) {
        console.error('퀴즈 상세 조회 실패:', error);
        Alert.alert('오류', '퀴즈를 불러올 수 없습니다.', [
          { text: '확인', onPress: () => router.back() }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizDetail();
  }, [id, isAuthenticated, accessToken, router]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.center, { flex: 1 }]}>
          <Text>퀴즈를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!quiz) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.center, { flex: 1 }]}>
          <Text>퀴즈를 찾을 수 없습니다.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleSend = async () => {
    if (!input.trim()) return;

    const userAnswer = input.trim();
    console.log('사용자 답변 제출:', userAnswer);

    try {
      console.log('퀴즈 제출 API 호출');
      console.log('제출 데이터:', {
        quizId: quiz.id,
        userAnswer: userAnswer
      });

      // 백엔드 퀴즈 제출 API 호출 - 정답 검증은 백엔드에서 처리
      const result = await quizApi.submitQuiz(quiz.id, {
        answer: userAnswer // 백엔드 DTO에 맞게 단일 문자열로 전송
      });

      console.log('퀴즈 제출 결과 원본:', result);
      console.log('퀴즈 제출 결과 타입:', typeof result);
      console.log('퀴즈 제출 결과 키들:', Object.keys(result || {}));

      // 백엔드에서 검증된 결과 사용 (QuizSubmitResponse 구조에 맞게)
      const isCorrect = result.isSolved || false;
      const similarity = result.similarity || 0;
      const totalAttempts = result.totalAttempts || 1;
      const message = result.message || '';

      console.log('파싱된 결과:', {
        isCorrect,
        similarity,
        totalAttempts,
        message,
        rawResult: result
      });

      const newAnswer: Answer = {
        id: Date.now().toString(),
        text: userAnswer,
        similarity: similarity,
        correct: isCorrect,
      };

      setAnswers((prev) => [...prev, newAnswer]);
      setInput("");

      if (isCorrect) {
        setCompleted(true);
        Alert.alert('정답!', `축하합니다!\n유사도: ${similarity}%\n시도 횟수: ${totalAttempts}번\n보상: ${quiz.reward || '없음'}`, [
          { text: '확인' }
        ]);
      } else {
        Alert.alert('오답', `아쉬워요!\n유사도: ${similarity}%\n시도 횟수: ${totalAttempts}번\n${message || '다시 생각해보세요!'}`, [
          { text: '확인' }
        ]);
      }

    } catch (error: any) {
      console.error('퀴즈 제출 실패:', error);
      console.error('에러 상세:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      if (error.response?.status === 409 && error.response?.data?.message === 'QUIZ_ALREADY_SOLVED') {
        Alert.alert('알림', '이미 정답을 맞춘 퀴즈입니다!', [
          { text: '확인', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('오류', `답변 제출에 실패했습니다.\n${error.response?.data?.message || error.message}`);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* 헤더 */}
        <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>퀴즈 #{quiz.id}</Text>
      </View>
      <Text style={styles.meta}>
        보상: {quiz.reward || '없음'} | 시도: {answers.length}번 | 날짜: {quiz.quizDate}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
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
