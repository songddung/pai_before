import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useState, useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from "../../domains/user/hooks/useAuth";


export default function QuizPage() {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAuth();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    completed: 0,
    inProgress: 0,
    new: 0,
  });

  const fetchAvailableQuizzes = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      router.replace('/login');
      return;
    }

    setLoading(true);
    try {
      // AsyncStorage에서 부모가 생성한 퀴즈 불러오기
      const storedQuizzes = await AsyncStorage.getItem('mockQuizzes');

      let mockQuizzes: any[] = [];

      if (storedQuizzes) {
        const parentQuizzes = JSON.parse(storedQuizzes);
        const today = new Date().toISOString().split('T')[0];

        // 오늘 또는 오늘 이전 날짜의 퀴즈만 표시
        mockQuizzes = parentQuizzes
          .filter((quiz: any) => quiz.quizDate <= today)
          .map((quiz: any) => ({
            id: quiz.id,
            question: quiz.question,
            answer: quiz.answer,
            hint: quiz.hint,
            reward: quiz.reward,
            quizDate: quiz.quizDate,
            parentId: '1',
            // childResults에서 현재 아이의 결과 찾기 (여기서는 임시로 첫 번째 결과 사용)
            myResult: quiz.childResults && quiz.childResults.length > 0
              ? {
                  isSolved: quiz.childResults[0].isSolved,
                  totalAttempts: quiz.childResults[0].totalAttempts,
                  score: quiz.childResults[0].score,
                }
              : null,
          }));
      } else {
        // 유진이 전용 목데이터
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        mockQuizzes = [
          {
            id: '1',
            question: '아빠가 가장 좋아하는 음식은 무엇일까요?',
            answer: '김치찌개',
            hint: '매워요',
            reward: '용돈 1000원',
            quizDate: today.toISOString().split('T')[0],
            parentId: '1',
            myResult: null, // 안 풀었음 (오늘 퀴즈)
          },
          {
            id: '2',
            question: '엄마의 취미는 무엇일까요?',
            answer: '독서',
            hint: '',
            reward: '간식 쿠폰',
            quizDate: today.toISOString().split('T')[0],
            parentId: '1',
            myResult: {
              isSolved: false, // 못 맞췄음
              totalAttempts: 1,
              score: 0,
            }, // 오늘 퀴즈
          },
          {
            id: '3',
            question: '아빠가 다니는 회사 이름은?',
            answer: '삼성',
            hint: '갤럭시',
            reward: '게임 시간 30분',
            quizDate: yesterday.toISOString().split('T')[0],
            parentId: '1',
            myResult: {
              isSolved: true, // 맞췄음
              totalAttempts: 3,
              score: 100,
            }, // 어제 퀴즈
          },
        ];
      }

      setQuizzes(mockQuizzes);

      const today = new Date().toISOString().split('T')[0];
      const completed = mockQuizzes.filter((q: any) => q.quizDate < today).length;
      const inProgress = mockQuizzes.filter((q: any) => q.quizDate === today).length;

      setSummary({
        completed,
        inProgress,
        new: 0,
      });
    } catch (err: any) {
      console.error('퀴즈 불러오기 실패:', err);
      setQuizzes([]);
      setSummary({ completed: 0, inProgress: 0, new: 0 });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, accessToken, router]);

  // 초기 로드
  useEffect(() => {
    fetchAvailableQuizzes();
  }, [fetchAvailableQuizzes]);

  // 페이지 포커스 시 새로고침
  useFocusEffect(
    useCallback(() => {
      fetchAvailableQuizzes();
    }, [fetchAvailableQuizzes])
  );

  const renderItem = ({ item }: { item: any }) => {
    // 날짜 기준으로 상태 계산
    const today = new Date().toISOString().split('T')[0];
    let status = '새로운';
    let statusColor = '#16a34a';
    let icon = <Ionicons name="play-circle" size={20} color="#fff" />;

    if (item.quizDate < today) {
      // 어제 이전 퀴즈 = 완료
      status = '완료';
      statusColor = '#22c55e';
      icon = <Ionicons name="checkmark-circle" size={20} color="#22c55e" />;
    } else if (item.quizDate === today) {
      // 오늘 퀴즈 = 진행중
      status = '진행중';
      statusColor = '#f59e0b';
      icon = <Ionicons name="time" size={20} color="#f59e0b" />;
    }

    return (
      <TouchableOpacity
        style={styles.quizCard}
        onPress={() =>
          router.push({
            pathname: "/(child)/quiz/[id]",
            params: { id: item.id ? item.id.toString() : '' },
          })
        }
      >
        {/* 아이콘 + 상태 */}
        <View style={styles.row}>
          <View style={styles.iconBox}>
            {icon}
          </View>
          <View style={styles.tags}>
            <Text style={[styles.tag, { color: statusColor }]}>{status}</Text>
            <Text style={[styles.tag, styles.subTag]}>
              {item.quizDate || '오늘'}
            </Text>
          </View>
        </View>

        {/* 문제 */}
        <Text style={styles.question}>{item.question || '퀴즈 문제'}</Text>

        {/* 하단 정보 */}
        <View style={styles.footer}>
          <Text style={styles.reward}>🎁 {item.reward || '보상 없음'}</Text>
          {item.myResult?.totalAttempts ? (
            <Text style={styles.meta}>📝 {item.myResult.totalAttempts}번 시도</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }} edges={['top']}>
      <View style={styles.container}>
        {/* 🔹 헤더 (뒤로가기 + 제목) */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace("/profile-select")}>
            <ChevronLeft size={24} color="#111827" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>부모님 퀴즈</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.headerDesc}>
          부모님에 대해 얼마나 알고 있을까요?{"\n"}
          퀴즈를 풀고 재미있는 보상을 받아보세요!
        </Text>

        {/* 요약 카드 */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{summary.completed}</Text>
            <Text style={styles.summaryLabel}>완료</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{summary.inProgress}</Text>
            <Text style={styles.summaryLabel}>진행중</Text>
          </View>
        </View>

        {/* 퀴즈 목록 */}
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ textAlign: 'center', marginTop: 20 }}>퀴즈를 불러오는 중...</Text>
          </View>
        ) : quizzes.length > 0 ? (
          <FlatList
            data={quizzes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 20,
            }}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={<View style={{ height: 10 }} />}
          />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ textAlign: 'center', color: '#6b7280', fontSize: 16 }}>
              오늘 출제된 퀴즈가 없습니다.{'\n'}
              부모님이 퀴즈를 만들어주세요!
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  headerDesc: {
    fontSize: 14,
    textAlign: "center",
    color: "#555",
    marginBottom: 16,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  summaryNumber: { fontSize: 18, fontWeight: "bold", color: "#ec4899" },
  summaryLabel: { fontSize: 12, color: "#666" },

  quizCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#a855f7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  tags: { flexDirection: "row", alignItems: "center" },
  tag: {
    backgroundColor: "#e0e7ff",
    color: "#111",
    fontSize: 11,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
  },
  subTag: { backgroundColor: "#fce7f3" },

  question: { fontSize: 15, fontWeight: "500", marginBottom: 6 },
  footer: { flexDirection: "row", flexWrap: "wrap", alignItems: "center" },
  reward: { fontSize: 12, marginRight: 10, color: "#333" },
  meta: { fontSize: 12, marginRight: 10, color: "#666" },
  status: { fontSize: 12, color: "#16a34a", fontWeight: "bold" },
});
