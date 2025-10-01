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
import { quizApi } from "../../domains/quiz/api/quizApi";
import { tokenStorage } from "../../shared/api/client";
import { tokenUtils } from "../../shared/utils/token";
import { profileApi } from "../../domains/user/api/userApi";


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
    console.log('퀴즈 페이지 초기화 - 인증 상태 확인:', {
      isAuthenticated,
      hasAccessToken: !!accessToken,
      accessTokenLength: accessToken?.length,
    });

    if (!isAuthenticated || !accessToken) {
      console.log('인증 실패 - 로그인 페이지로 이동');
      router.replace('/login');
      return;
    }

    setLoading(true);
    try {
      console.log('아이용 오늘의 퀴즈 조회 시작');

      // 현재 토큰에서 프로필 정보 확인
      const currentToken = await tokenStorage.getAccessToken();
      let currentChildId = null;
      let currentUserId = null;

      if (currentToken) {
        const tokenData = tokenUtils.decodeToken(currentToken);
        currentChildId = tokenData?.profile_id;
        currentUserId = tokenData?.sub; // JWT의 sub는 user_id

        console.log('퀴즈 조회 시 토큰 정보:', {
          hasToken: !!currentToken,
          tokenLength: currentToken.length,
          profile_id: tokenData?.profile_id,
          profile_name: tokenData?.profile_name,
          profile_type: tokenData?.profile_type,
          user_id: tokenData?.sub,
          exp: tokenData?.exp,
          현재시간: new Date().getTime() / 1000,
          만료여부: tokenData?.exp ? (tokenData.exp < (new Date().getTime() / 1000) ? '만료됨' : '유효함') : '확인불가',
        });
      } else {
        console.error('퀴즈 조회 시 토큰 없음');
      }

      // 실제 API 호출 - 백엔드에서 JWT 토큰 기반으로 가족 퀴즈만 필터링하여 반환
      const availableQuizzes = await quizApi.getAvailableQuizzes();
      console.log('오늘의 퀴즈 API 응답:', {
        data: availableQuizzes,
        dataType: typeof availableQuizzes,
        isArray: Array.isArray(availableQuizzes),
        length: availableQuizzes?.length,
      });

      // 백엔드에서 오늘 날짜의 모든 퀴즈를 받고, 프론트에서 user_id로 필터링
      console.log('=== 퀴즈 데이터 구조 분석 ===');
      console.log('현재 로그인 user_id:', currentUserId);
      console.log('받은 전체 퀴즈 개수:', availableQuizzes?.length || 0);

      // 첫 번째 퀴즈 데이터 구조 분석
      if (availableQuizzes && availableQuizzes.length > 0) {
        console.log('첫 번째 퀴즈 데이터 구조:');
        console.log('전체 필드:', Object.keys(availableQuizzes[0]));
        console.log('전체 데이터:', availableQuizzes[0]);
      }

      // 현재 user의 부모 프로필들 조회
      console.log('\n=== 부모 프로필 조회 ===');
      let parentProfileIds: string[] = [];
      try {
        const allProfiles = await profileApi.getAllProfiles();
        const familyParentProfiles = allProfiles.filter((profile: any) =>
          profile.user_id === currentUserId && profile.profile_type === 'PARENT'
        );
        parentProfileIds = familyParentProfiles.map((p: any) => p.profile_id.toString());

        console.log('현재 user의 부모 프로필 IDs:', parentProfileIds);
        console.log('부모 프로필 상세:', familyParentProfiles);
      } catch (error) {
        console.error('부모 프로필 조회 실패:', error);
      }

      // parentId 기반 필터링
      let filteredQuizzes = [];
      if (availableQuizzes && Array.isArray(availableQuizzes) && parentProfileIds.length > 0) {
        console.log('\n=== parentId 기반 필터링 시작 ===');

        filteredQuizzes = availableQuizzes.filter((quiz: any) => {
          // 퀴즈의 parentId가 현재 user의 부모 프로필 중 하나인지 확인
          const quizParentId = quiz.parentId || quiz.parent_id;
          const isMatch = quizParentId && parentProfileIds.includes(quizParentId.toString());

          console.log(`퀴즈 ${quiz.id}:`, {
            quizParentId,
            parentProfileIds,
            isMatch,
            question: quiz.question?.substring(0, 30) + '...'
          });

          return isMatch;
        });

        console.log(`필터링 결과: ${availableQuizzes.length} -> ${filteredQuizzes.length}`);
      } else {
        console.log('필터링 조건 미충족 - 빈 배열 반환');
        console.log('조건:', {
          hasQuizzes: !!availableQuizzes,
          isArray: Array.isArray(availableQuizzes),
          hasParentProfiles: parentProfileIds.length > 0
        });
        filteredQuizzes = [];
      }

      // 응답 데이터 상세 로깅
      if (filteredQuizzes && Array.isArray(filteredQuizzes)) {
        filteredQuizzes.forEach((quiz, index) => {
          console.log(`필터링된 퀴즈 ${index + 1}:`, {
            id: quiz.id,
            question: quiz.question,
            reward: quiz.reward,
            quizDate: quiz.quizDate,
            createdBy: quiz.createdBy || quiz.created_by || quiz.profile_id,
            myResult: quiz.myResult,
            hasMyResult: !!quiz.myResult,
            isSolved: quiz.myResult?.isSolved,
          });
        });
      }

      if (filteredQuizzes && filteredQuizzes.length > 0) {
        setQuizzes(filteredQuizzes);

        // 퀴즈 상태별 집계 (실제 API 데이터 구조 기준)
        const completed = filteredQuizzes.filter((q: any) => q.myResult?.isSolved).length;
        const inProgress = filteredQuizzes.filter((q: any) => q.myResult && !q.myResult.isSolved).length;
        const newQuizzes = filteredQuizzes.filter((q: any) => !q.myResult).length;

        setSummary({
          completed,
          inProgress,
          new: newQuizzes,
        });

        console.log('퀴즈 상태별 집계:', {
          total: filteredQuizzes.length,
          completed,
          inProgress,
          new: newQuizzes
        });
      } else {
        console.log('가족 부모의 퀴즈가 없음');
        setQuizzes([]);
        setSummary({ completed: 0, inProgress: 0, new: 0 });
      }
    } catch (err: any) {
      console.error('퀴즈 조회 실패:', {
        error: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        method: err.config?.method,
      });

      if (err.response?.status === 401) {
        console.log('인증 오류로 로그인 페이지로 이동');
        router.replace('/login');
      } else {
        console.error('퀴즈 API 호출 실패 - 서버 오류:', err.response?.data?.message || err.message);
        setQuizzes([]);
        setSummary({ completed: 0, inProgress: 0, new: 0 });
      }
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
      console.log('퀴즈 페이지 포커스 - 데이터 새로고침');
      fetchAvailableQuizzes();
    }, [fetchAvailableQuizzes])
  );

  const renderItem = ({ item }: { item: any }) => {
    // API 데이터에서 상태 계산
    let status = '새로운';
    let statusColor = '#16a34a';
    let icon = <Ionicons name="play-circle" size={20} color="#a855f7" />;

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
