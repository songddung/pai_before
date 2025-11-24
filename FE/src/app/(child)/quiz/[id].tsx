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
      // 퀴즈가 바뀔 때마다 답변 초기화
      setAnswers([]);
      setInput('');
      setCompleted(false);

      try {
        // 목데이터
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const mockQuizzes = [
          {
            id: '1',
            question: '아빠가 가장 좋아하는 음식은 무엇일까요?',
            answer: '김치찌개',
            reward: '용돈 1000원',
            quizDate: today.toISOString().split('T')[0],
            myResult: null,
            exampleAnswers: [
              { text: '돈까스', similarity: 20 },
              { text: '피자', similarity: 15 },
              { text: '찌개', similarity: 50 },
              { text: '김치', similarity: 50 },
              { text: '된장찌개', similarity: 40 },
              { text: '김치찌개', similarity: 100 },
            ],
          },
          {
            id: '2',
            question: '엄마의 취미는 무엇일까요?',
            answer: '독서',
            reward: '간식 쿠폰',
            quizDate: today.toISOString().split('T')[0],
            myResult: {
              isSolved: false,
              totalAttempts: 2,
            },
            exampleAnswers: [
              { text: '뜨개질', similarity: 25 },
              { text: '요리', similarity: 20 },
              { text: '운동', similarity: 15 },
              { text: '책', similarity: 50 },
              { text: '책 읽기', similarity: 80 },
              { text: '독서', similarity: 100 },
            ],
          },
          {
            id: '3',
            question: '아빠가 다니는 회사 이름은?',
            answer: '삼성',
            reward: '게임 시간 30분',
            quizDate: yesterday.toISOString().split('T')[0],
            myResult: {
              isSolved: true,
              totalAttempts: 1,
              score: 100,
            },
            exampleAnswers: [
              { text: '삼성전자', similarity: 80 },
              { text: '삼성', similarity: 100 },
            ],
          },
        ];

        const targetQuiz = mockQuizzes.find((q: any) => q.id === id);

        if (targetQuiz) {
          setQuiz(targetQuiz);

          if (targetQuiz.myResult?.isSolved) {
            setCompleted(true);
            // 완료된 퀴즈는 이전 제출 답변을 표시
            if (targetQuiz.id === '3') {
              setAnswers([
                {
                  id: '1',
                  text: '삼성전자',
                  similarity: 80,
                  correct: false,
                },
                {
                  id: '2',
                  text: '삼성',
                  similarity: 100,
                  correct: true,
                },
              ]);
            }
          }
        } else {
          Alert.alert('오류', '퀴즈를 찾을 수 없습니다.', [
            { text: '확인', onPress: () => router.back() }
          ]);
        }
      } catch (error: any) {
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

    try {
      // 목데이터 - 정답 검증
      const correctAnswer = quiz.answer || '';
      const currentAttempts = answers.length + 1;

      // 예시 답변 기반 유사도 계산
      let similarity = 0;
      let isCorrect = false;

      // 1. 예시 답변에서 정확히 일치하는 답변이 있는지 확인
      const exampleAnswers = quiz.exampleAnswers || [];
      const matchedExample = exampleAnswers.find((ex: any) =>
        ex.text.toLowerCase() === userAnswer.toLowerCase()
      );

      if (matchedExample) {
        // 예시 답변과 일치하면 미리 정의된 유사도 사용
        similarity = matchedExample.similarity;
        isCorrect = similarity === 100;
      } else {
        // 예시에 없는 답변은 기본 로직 사용
        isCorrect = userAnswer.toLowerCase().includes(correctAnswer.toLowerCase()) ||
                   correctAnswer.toLowerCase().includes(userAnswer.toLowerCase());

        if (isCorrect) {
          similarity = 100;
        } else {
          // 부분 일치도 계산
          const commonChars = userAnswer.split('').filter(char => correctAnswer.includes(char)).length;
          similarity = Math.floor((commonChars / correctAnswer.length) * 100);
        }
      }

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
        Alert.alert('정답!', `축하합니다!\n정답: ${correctAnswer}\n유사도: ${similarity}%\n시도 횟수: ${currentAttempts}번\n보상: ${quiz.reward || '없음'}`, [
          { text: '확인' }
        ]);
      } else {
        Alert.alert('오답', `아쉬워요!\n유사도: ${similarity}%\n시도 횟수: ${currentAttempts}번\n다시 생각해보세요!`, [
          { text: '확인' }
        ]);
      }

    } catch (error: any) {
      Alert.alert('오류', '답변 제출에 실패했습니다.');
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
        <TouchableOpacity onPress={() => router.push('/(child)/quiz')} style={{ padding: 5 }}>
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
        contentContainerStyle={{ paddingBottom: 20 }}
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
