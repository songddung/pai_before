import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter, useFocusEffect } from "expo-router";
import { CheckCircle } from "lucide-react-native";
import React, { useEffect, useState, useCallback } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from "../../../domains/user/hooks/useAuth";
import { quizApi } from "../../../domains/quiz/api/quizApi";
import { profileApi } from "../../../domains/user/api/userApi";

export default function ParentQuizScreen() {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAuth();
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([]);
  const [childQuizzes, setChildQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    completedCount: 0,
    accuracy: 0,
  });
  const [children, setChildren] = useState<any[]>([]);

  const fetchQuizData = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      router.replace('/login');
      return;
    }

    setLoading(true);
    try {
      // AsyncStorage에서 퀴즈 데이터 가져오기
      const storedQuizzes = await AsyncStorage.getItem('mockQuizzes');

      let mockChildQuizzes;

      if (storedQuizzes) {
        // 저장된 데이터가 있으면 사용
        mockChildQuizzes = JSON.parse(storedQuizzes);
      } else {
        // 없으면 기본 목데이터 생성
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const threeDaysLater = new Date(today);
        threeDaysLater.setDate(threeDaysLater.getDate() + 3);

        mockChildQuizzes = [
          {
            id: '1',
            question: '아빠가 가장 좋아하는 음식은 무엇일까요?',
            answer: '김치찌개',
            hint: '한국 대표 음식이에요',
            reward: '용돈 1000원',
            category: '취향',
            quizDate: threeDaysLater.toISOString().split('T')[0],
            childResults: [],
          },
          {
            id: '2',
            question: '엄마의 취미는 무엇일까요?',
            answer: '독서',
            hint: '',
            reward: '간식 쿠폰',
            category: '취향',
            quizDate: today.toISOString().split('T')[0],
            childResults: [
              {
                childId: '1',
                childName: '김민규',
                isSolved: true,
                score: 100,
                totalAttempts: 1,
                lastAttemptDate: today.toISOString(),
              },
              {
                childId: '2',
                childName: '정유진',
                isSolved: false,
                score: 0,
                totalAttempts: 2,
                lastAttemptDate: today.toISOString(),
              },
            ],
          },
          {
            id: '3',
            question: '아빠가 다니는 회사 이름은?',
            answer: '삼성',
            hint: '갤럭시',
            reward: '게임 시간 30분',
            category: '일상',
            quizDate: yesterday.toISOString().split('T')[0],
            childResults: [
              {
                childId: '2',
                childName: '정유진',
                isSolved: true,
                score: 100,
                totalAttempts: 1,
                lastAttemptDate: yesterday.toISOString(),
              },
            ],
          },
        ];

        // 기본 데이터를 AsyncStorage에 저장
        await AsyncStorage.setItem('mockQuizzes', JSON.stringify(mockChildQuizzes));
      }

      setChildQuizzes(mockChildQuizzes);

      // 요약 정보 계산 - 날짜 기준
      const today = new Date().toISOString().split('T')[0];
      const completedQuizzes = mockChildQuizzes.filter((quiz: any) => quiz.quizDate < today);
      const inProgressQuizzes = mockChildQuizzes.filter((quiz: any) => quiz.quizDate === today);

      setSummary({
        completedCount: completedQuizzes.length,
        accuracy: inProgressQuizzes.length,
      });

      // 최근 생성한 퀴즈
      setRecentQuizzes(mockChildQuizzes);

      // 자녀 목록 조회 (실제 API 사용)
      try {
        const profiles = await profileApi.getAllProfiles();
        const childProfiles = profiles.filter(profile => profile.profile_type === 'CHILD');
        setChildren(childProfiles);
      } catch (profileError) {
        setChildren([]);
      }

    } catch (err: any) {
      console.error('퀴즈 데이터 조회 실패:', err);

      if (err.response?.status === 401) {
        Alert.alert('인증 오류', '다시 로그인해주세요.', [
          { text: '확인', onPress: () => router.replace('/login') },
        ]);
      } else {
        console.error('퀴즈 데이터 조회 실패 - 서버 오류');
        setRecentQuizzes([]);
        setChildQuizzes([]);
        setSummary({
          completedCount: 0,
          accuracy: 0,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, accessToken, router]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchQuizData();
  }, [fetchQuizData]);

  // 페이지 포커스 시 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      console.log('퀴즈 관리 페이지 포커스 - 데이터 새로고침');
      fetchQuizData();
    }, [fetchQuizData])
  );



  // 삭제
  const handleDelete = (id: string) => {
    Alert.alert("삭제", "퀴즈를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            // AsyncStorage에서 퀴즈 목록 가져오기
            const storedQuizzes = await AsyncStorage.getItem('mockQuizzes');

            if (storedQuizzes) {
              const quizzes = JSON.parse(storedQuizzes);
              // 해당 ID 제외하고 필터링
              const updatedQuizzes = quizzes.filter((q: any) => q.id !== id);

              // AsyncStorage에 다시 저장
              await AsyncStorage.setItem('mockQuizzes', JSON.stringify(updatedQuizzes));

              // 화면 업데이트
              setRecentQuizzes(updatedQuizzes);
              Alert.alert("완료", "퀴즈가 성공적으로 삭제되었습니다.");
            }
          } catch (err: any) {
            console.error("퀴즈 삭제 실패:", err);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 20 }}
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
            title="완료"
            value={`${summary.completedCount}개`}
            sub={`진행중 ${summary.accuracy}개`}
            subColor={{ color: "#f59e0b" }}
            fullWidth
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
            recentQuizzes.map((quiz) => {
              const today = new Date().toISOString().split('T')[0];
              const isFutureQuiz = quiz.quizDate > today;

              return (
                <View key={quiz.id} style={styles.recentQuizBox}>
                  {/* 헤더: 날짜 + 편집/삭제 버튼 */}
                  <View style={styles.quizHeader}>
                    <Text style={[
                      styles.quizDate,
                      quiz.quizDate === today && styles.quizDateToday
                    ]}>
                      {quiz.quizDate === today
                        ? "오늘 출제"
                        : `출제일: ${quiz.quizDate}`}
                    </Text>
                    {isFutureQuiz && (
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
                    )}
                  </View>

                {/* 퀴즈 내용 */}
                <View style={styles.quizContentArea}>
                  <Text style={styles.quizQuestion}>{quiz.question}</Text>
                  <Text style={styles.quizAnswer}>정답: {quiz.answer}</Text>
                  <Text style={styles.quizReward}>보상: {quiz.reward}</Text>
                </View>

                {/* 자녀 프로필 */}
                <View style={styles.childProfilesContainer}>
                  {children.map((child) => {
                    // avatar_media_id를 기반으로 piggy 이미지 매칭
                    const piggyImages: { [key: string]: any } = {
                      piggy1: require('../../../../assets/images/piggy1.jpg'),
                      piggy2: require('../../../../assets/images/piggy2.jpg'),
                      piggy3: require('../../../../assets/images/piggy3.jpg'),
                    };
                    const piggyImage = piggyImages[child.avatar_media_id] || require('../../../../assets/images/piggy1.jpg');

                    // 해당 자녀가 퀴즈를 맞췄는지 확인
                    const childResult = quiz.childResults?.find((r: any) => r.childName === child.name);
                    const isSolved = childResult?.isSolved || false;

                    return (
                      <View key={child.profile_id} style={styles.childProfileItem}>
                        <Image
                          source={piggyImage}
                          style={[
                            styles.childProfileAvatar,
                            isSolved && styles.childProfileAvatarSolved
                          ]}
                        />
                        <Text style={[
                          styles.childProfileName,
                          isSolved && styles.childProfileNameSolved
                        ]}>
                          {child.name}
                        </Text>
                        {isSolved && (
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color="#22c55e"
                            style={styles.childProfileCheck}
                          />
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
              );
            })
          ) : (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ textAlign: "center", color: "#6b7280", marginBottom: 10 }}>
                최근 생성된 퀴즈가 없습니다.
              </Text>
              <Text style={{ textAlign: "center", color: "#9ca3af", fontSize: 12 }}>
                퀴즈를 생성하면 여기에 표시됩니다.
              </Text>
            </View>
          )}
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
  quizHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  quizDate: {
    fontSize: 11,
    color: "#6b7280",
  },
  quizDateToday: {
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 12,
  },
  quizContentArea: {
    marginTop: 4,
  },
  quizQuestion: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  quizAnswer: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 4,
  },
  quizReward: {
    fontSize: 13,
    color: "#2563eb",
    fontWeight: "500",
  },
  quizCategory: { fontSize: 11, color: "#6b7280" },
  quizStatus: { fontSize: 12, fontWeight: "600" },

  actionRow: {
    flexDirection: "row",
  },
  editButton: {
    borderWidth: 1,
    borderColor: "#2563eb",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
  },
  editText: { fontSize: 11, color: "#2563eb" },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteText: { fontSize: 11, color: "red" },

  quizFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },

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
  childIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  childName: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  childInfo: { fontSize: 13, color: "#6b7280" },

  // 자녀 프로필 스타일
  childProfilesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 12,
  },
  childProfileItem: {
    alignItems: "center",
    width: 60,
  },
  childProfileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 4,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  childProfileAvatarSolved: {
    borderColor: "#22c55e",
    borderWidth: 3,
  },
  childProfileName: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  childProfileNameSolved: {
    color: "#22c55e",
    fontWeight: "600",
  },
  childProfileCheck: {
    position: "absolute",
    top: 0,
    right: 5,
  },
});
