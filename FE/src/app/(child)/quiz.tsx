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
      // 목데이터 - 3개의 퀴즈 샘플
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const mockQuizzes = [
        {
          id: '1',
          question: '아빠가 가장 좋아하는 음식은 무엇일까요?',
          reward: '용돈 1000원',
          quizDate: today.toISOString().split('T')[0],
          parentId: '1',
          myResult: null, // 새로운 퀴즈
        },
        {
          id: '2',
          question: '엄마의 취미는 무엇일까요?',
          reward: '간식 쿠폰',
          quizDate: today.toISOString().split('T')[0],
          parentId: '1',
          myResult: {
            isSolved: false,
            totalAttempts: 2,
          }, // 진행중
        },
        {
          id: '3',
          question: '아빠가 다니는 회사 이름은?',
          reward: '게임 시간 30분',
          quizDate: yesterday.toISOString().split('T')[0],
          parentId: '1',
          myResult: {
            isSolved: true,
            totalAttempts: 1,
            score: 100,
          }, // 완료
        },
      ];

      setQuizzes(mockQuizzes);

      const completed = mockQuizzes.filter((q: any) => q.myResult?.isSolved).length;
      const inProgress = mockQuizzes.filter((q: any) => q.myResult && !q.myResult.isSolved).length;
      const newQuizzes = mockQuizzes.filter((q: any) => !q.myResult).length;

      setSummary({
        completed,
        inProgress,
        new: newQuizzes,
      });
    } catch (err: any) {
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
    // API 데이터에서 상태 계산
    let status = '새로운';
    let statusColor = '#16a34a';
    let icon = <Ionicons name="play-circle" size={20} color="#fff" />;

    if (item.myResult) {
      if (item.myResult.isSolved) {
        status = '완료';
        statusColor = '#22c55e';
        icon = <Ionicons name="checkmark-circle" size={20} color="#22c55e" />;
      } else {
        status = '진행중';
        statusColor = '#f59e0b';
        icon = <Ionicons name="time" size={20} color="#f59e0b" />;
      }
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
          {item.myResult?.score ? (
            <Text style={styles.meta}>⭐ {item.myResult.score}점</Text>
          ) : null}
          <Text style={[styles.status, { color: statusColor }]}>{status}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <View style={styles.container}>
        {/* 🔹 헤더 (뒤로가기 + 제목) */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace("/profile-select")}>
            <ChevronLeft size={24} color="#111827" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>부모님 퀴즈</Text>
          </View>
          <View style={{ width: 24 }} /> {/* 오른쪽 자리 맞춤 */}
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
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{summary.new}</Text>
            <Text style={styles.summaryLabel}>새로운</Text>
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
