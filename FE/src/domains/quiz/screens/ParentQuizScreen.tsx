import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { CheckCircle } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ParentQuizScreen() {
  const router = useRouter();
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([]);
  const [childQuizzes, setChildQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    completedCount: 0,
    accuracy: 0,
  });

  useEffect(() => {
    // 최근 생성한 퀴즈 API
    /*
    const fetchRecent = async () => {
      try {
        const res = await axios.get("https://j13c101.p.ssafy.io/api/quiz/available", {
          headers: { Authorization: `Bearer <부모 토큰>` }, // 👉 TODO: 로그인 시 받은 토큰으로 교체
        });
        setRecentQuizzes(res.data.data || []);
      } catch (err: any) {
        console.error("퀴즈 조회 실패:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
    */

    // Mock 데이터
    setRecentQuizzes([
      {
        id: "1",
        question: "엄마가 가장 좋아하는 색깔은?",
        answer: "파란색",
        reward: "사탕 하나",
        quizDate: "2025-09-26",
      },
      {
        id: "2",
        question: "아빠의 취미는 무엇일까요?",
        answer: "독서",
        reward: "아이스크림",
        quizDate: "2025-09-25",
      },
    ]);

    // 아이 퀴즈 현황 Mock
    setChildQuizzes([
      {
        id: "1",
        question: "엄마가 가장 좋아하는 색깔은?",
        category: "엄마 취향",
        myResult: null,
      },
      {
        id: "2",
        question: "아빠의 취미는 무엇일까요?",
        category: "아빠 취미",
        myResult: { isSolved: true, totalAttempts: 1, score: 85 },
      },
      {
        id: "3",
        question: "우리 가족이 가장 좋아하는 여행지는?",
        category: "가족 추억",
        myResult: { isSolved: false, totalAttempts: 1 },
      },
      {
        id: "4",
        question: "엄마가 어렸을 때 가장 좋아했던 음식은?",
        category: "엄마 어린시절",
        myResult: { isSolved: true, totalAttempts: 1, score: 95 },
      },
    ]);

    setLoading(false);
  }, []);

  //
  const mockChildren = [
    {
      id: "1",
      name: "민준",
      birth: "2018-05-12",
      gender: "male",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
    {
      id: "2",
      name: "유진",
      birth: "2020-09-07",
      gender: "female",
      avatar: "https://i.pravatar.cc/150?img=4",
    },
  ];

  useEffect(() => {
    // Mock 데이터 (API 연결 전용 예시)
    const mockChildQuizzes = [
      {
        id: "1",
        question: "엄마가 가장 좋아하는 색깔은?",
        category: "엄마 취향",
        myResult: null,
      },
      {
        id: "2",
        question: "아빠의 취미는 무엇일까요?",
        category: "아빠 취미",
        myResult: { isSolved: true, totalAttempts: 1, score: 85 },
      },
      {
        id: "3",
        question: "우리 가족이 가장 좋아하는 여행지는?",
        category: "가족 추억",
        myResult: { isSolved: false, totalAttempts: 1 },
      },
      {
        id: "4",
        question: "엄마가 어렸을 때 가장 좋아했던 음식은?",
        category: "엄마 어린시절",
        myResult: { isSolved: true, totalAttempts: 1, score: 95 },
      },
    ];

    setChildQuizzes(mockChildQuizzes);

    // 완료된 퀴즈만 추출
    const completed = mockChildQuizzes.filter((q) => q.myResult?.isSolved);

    // 정답률 = 완료 / 전체
    const accuracy =
      mockChildQuizzes.length > 0
        ? Math.round((completed.length / mockChildQuizzes.length) * 100)
        : 0;

    setSummary({
      completedCount: completed.length,
      accuracy,
    });

    setLoading(false);
  }, []);

  // 삭제
  const handleDelete = (id: string) => {
    Alert.alert("삭제", `퀴즈 ${id}를 삭제하시겠습니까?`, [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`https://j13c101.p.ssafy.io/api/quiz/${id}`, {
              headers: {
                Authorization: `Bearer <부모 토큰>`, // 👉 TODO: 로그인 시 받은 토큰으로 교체
              },
            });
            setRecentQuizzes((prev) => prev.filter((q) => q.id !== id));
            Alert.alert("완료", "퀴즈가 성공적으로 삭제되었습니다.");
          } catch (err: any) {
            console.error("퀴즈 삭제 실패:", err.response?.data || err.message);
            Alert.alert("실패", "퀴즈 삭제 중 오류가 발생했습니다.");
          }
        },
      },
    ]);
  };

  // 편집
  const handleEdit = (id: string) => {
    router.push({
      pathname: "/(parents)/quiz/edit/[id]",
      params: { id },
    });
  };

  const renderChildQuiz = (quiz: any) => {
    let icon = <Ionicons name="play-circle" size={20} color="#9ca3af" />;
    let status = "미시작";
    let statusColor = "#6b7280";

    if (quiz.myResult) {
      if (quiz.myResult.isSolved) {
        icon = <Ionicons name="checkmark-circle" size={20} color="#22c55e" />;
        status = `완료 (${quiz.myResult.score || 0}점)`;
        statusColor = "#22c55e";
      } else {
        icon = <Ionicons name="time" size={20} color="#facc15" />;
        status = `${quiz.myResult.totalAttempts}번 시도`;
        statusColor = "#f59e0b";
      }
    }

    return (
      <View key={quiz.id} style={styles.childQuizItem}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {icon}
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.quizQuestion}>{quiz.question}</Text>
            <Text style={styles.quizCategory}>{quiz.category}</Text>
          </View>
        </View>
        <Text style={[styles.quizStatus, { color: statusColor }]}>
          {status}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/profile-select")}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>부모님 퀴즈</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* 요약 카드 */}
        <View style={styles.summaryRow}>
          <SummaryCard
            icon={<CheckCircle size={20} color="green" />}
            title="완료된 퀴즈"
            value={`${summary.completedCount}개`}
            sub={`정답률 ${summary.accuracy}%`}
            subColor={{ color: "#16a34a" }}
            fullWidth // 👈 전체 폭 옵션 추가
          />
        </View>

        {/* 퀴즈 생성 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>퀴즈 생성</Text>
            <Text style={styles.badgeGray}>일일 한정</Text>
          </View>
          <View
            style={[
              styles.quizBox,
              { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" },
            ]}
          >
            <Text style={[styles.quizTitle, { color: "#2563eb" }]}>
              오늘의 퀴즈를 만들어보세요!
            </Text>
            <Text style={[styles.quizSub, { color: "#2563eb" }]}>
              하루에 한 번만 생성 가능합니다.
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push("/(parents)/quiz/create")}
            >
              <Text style={styles.createText}>퀴즈 생성하기</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 최근 생성한 퀴즈 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>최근 생성한 퀴즈</Text>
            <Text style={styles.badgeGray}>최근 7일</Text>
          </View>
          {loading ? (
            <Text style={{ textAlign: "center" }}>불러오는 중...</Text>
          ) : recentQuizzes.length > 0 ? (
            recentQuizzes.map((quiz) => (
              <View key={quiz.id} style={styles.recentQuizBox}>
                <View style={{ flexDirection: "row", marginBottom: 6 }}>
                  <Text style={styles.tagNew}>신규</Text>
                  <Text style={styles.tagCategory}>취향</Text>
                </View>
                <View style={styles.quizHeaderRow}>
                  <Text style={styles.quizQuestion}>{quiz.question}</Text>
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEdit(quiz.id)}
                    >
                      <Text style={styles.editText}>편집</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(quiz.id)}
                    >
                      <Text style={styles.deleteText}>삭제</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.quizAnswer}>정답: {quiz.answer}</Text>
                <View style={styles.quizFooter}>
                  <Text style={styles.quizDate}>
                    {quiz.quizDate === "2025-09-26"
                      ? "오늘 생성"
                      : quiz.quizDate}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ textAlign: "center", color: "#6b7280" }}>
              최근 생성된 퀴즈가 없습니다.
            </Text>
          )}
        </View>

        {/* 아이의 퀴즈 현황 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>아이의 퀴즈 현황</Text>
          {mockChildren.map((child) => (
            <TouchableOpacity
              key={child.id}
              style={styles.childCard}
              onPress={() =>
                router.push({
                  pathname: "/(parents)/quiz/children/[id]",
                  params: { id: child.id, name: child.name },
                })
              }
            >
              <Image
                source={{ uri: child.avatar }}
                style={styles.childAvatar}
              />
              <View>
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.childInfo}>
                  {child.birth} · {child.gender}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({ icon, title, value, sub, subColor, fullWidth }: any) {
  return (
    <View
      style={[
        styles.summaryCard,
        fullWidth && { width: "100%" },
      ]}
    >
      <View style={styles.summaryIconRow}>
        {icon}
        <Text style={styles.summaryTitle}>{title}</Text>
      </View>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={[styles.summarySub, subColor]}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", padding: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    flex: 1,
  },
  summaryRow: {
  flexDirection: "column",
  marginBottom: 12,
},
summaryCard: {
  backgroundColor: "#fff",
  borderRadius: 12,
  padding: 16,
  borderWidth: 1,
  borderColor: "#e5e7eb",
  elevation: 2,
},
  summaryIconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  summaryTitle: { fontSize: 12, color: "#374151", marginLeft: 4 },
  summaryValue: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  summarySub: { fontSize: 11, marginTop: 2 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  badgeGray: {
    fontSize: 10,
    color: "#6b7280",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },

  quizBox: { borderWidth: 1, borderRadius: 8, padding: 12, marginTop: 8 },
  quizTitle: { fontWeight: "bold", fontSize: 14 },
  quizSub: { fontSize: 12, marginTop: 4 },

  // 최근 생성한 퀴즈
  recentQuizBox: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  quizHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quizQuestion: { fontSize: 13, fontWeight: "500", color: "#111827" },
  quizAnswer: { fontSize: 12, color: "#374151", marginTop: 4 },
  quizCategory: { fontSize: 11, color: "#6b7280" },
  quizStatus: { fontSize: 12, fontWeight: "600" },

  actionRow: { flexDirection: "row" },
  editButton: {
    borderWidth: 1,
    borderColor: "#2563eb",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  editText: { fontSize: 12, color: "#2563eb" },
  deleteButton: { paddingHorizontal: 6, paddingVertical: 2 },
  deleteText: { fontSize: 12, color: "red" },

  quizFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  quizDate: { fontSize: 11, color: "#6b7280" },

  createButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  createText: { fontSize: 13, color: "white", fontWeight: "bold" },
  tagNew: {
    fontSize: 11,
    color: "white",
    backgroundColor: "#22c55e",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
  },
  tagCategory: {
    fontSize: 11,
    color: "white",
    backgroundColor: "#6366f1",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },

  childQuizItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  childCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  childAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  childName: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  childInfo: { fontSize: 13, color: "#6b7280" },
});