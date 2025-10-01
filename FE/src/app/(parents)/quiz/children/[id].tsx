import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../../domains/user/hooks/useAuth';
import { quizApi } from '../../../../domains/quiz/api/quizApi';

export default function ChildQuizDetailScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams(); // 부모 화면에서 넘긴 params 받기
  const { isAuthenticated, accessToken } = useAuth();

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildQuizzes = async () => {
      if (!isAuthenticated || !accessToken) {
        router.replace('/login');
        return;
      }

      setLoading(true);
      try {
        console.log(`${name}의 퀴즈 결과 조회 시작`);

        // 자녀 퀴즈 결과 조회 (실제 API)
        const childResults = await quizApi.getChildrenQuizResults();
        console.log('자녀 퀴즈 결과:', childResults);

        if (childResults && childResults.length > 0) {
          // 특정 자녀의 퀴즈만 필터링 (name 파라미터 기준)
          const childData = childResults.find(
            (child: any) => child.childName === name
          );

          if (childData && childData.completedQuizzes) {
            setQuizzes(childData.completedQuizzes);
          } else {
            setQuizzes([]);
          }
        } else {
          setQuizzes([]);
        }
      } catch (err: any) {
        console.error(`${name}의 퀴즈 조회 실패:`, err);

        if (err.response?.status === 401) {
          Alert.alert('인증 오류', '다시 로그인해주세요.', [
            { text: '확인', onPress: () => router.replace('/login') },
          ]);
        } else {
          console.error('자녀 퀴즈 조회 실패 - 서버 오류');
          setQuizzes([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChildQuizzes();
  }, [id, name, isAuthenticated, accessToken]);

  const handleCompleteReward = async (quiz: any) => {
    Alert.alert(
      '보상 지급 확인',
      `${quiz.question}\n\n보상: ${quiz.reward}\n\n정말로 보상을 지급하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '지급 완료',
          onPress: async () => {
            try {
              console.log('보상 완료 처리 시작:', {
                quizId: quiz.id,
                quizData: quiz,
                childResult: quiz.childResult,
                actualResultId: quiz.childResult?.resultId,
                url: `/api/quiz/${quiz.childResult?.resultId}/reward`
              });

              // 올바른 퀴즈 결과 ID 사용
              const resultId = quiz.childResult?.resultId;
              if (!resultId) {
                Alert.alert('오류', '퀴즈 결과 ID를 찾을 수 없습니다.');
                return;
              }

              await quizApi.giveReward(resultId);

              Alert.alert('완료', '보상이 성공적으로 지급되었습니다!');

              // 퀴즈 목록 새로고침
              // 실제로는 해당 퀴즈의 보상 상태를 업데이트해야 함

            } catch (error: any) {
              console.error('보상 완료 처리 실패:', error);
              Alert.alert('실패', `보상 지급 중 오류가 발생했습니다.\n${error.response?.data?.message || error.message}`);
            }
          }
        }
      ]
    );
  };

  const renderQuizItem = (quiz: any) => {
    let icon = <Ionicons name="play-circle" size={20} color="#9ca3af" />;
    let status = '미시작';
    let statusColor = '#6b7280';

    if (quiz.childResult?.isSolved) {
      icon = <Ionicons name="checkmark-circle" size={20} color="#22c55e" />;
      status = `완료 (시도 ${quiz.childResult.totalAttempts}번)`;
      statusColor = '#22c55e';
    }

    return (
      <View key={quiz.id} style={styles.quizItem}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {icon}
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.quizQuestion}>{quiz.question}</Text>
            <Text style={styles.quizCategory}>{quiz.quizDate}</Text>
            {quiz.reward && (
              <Text style={styles.rewardText}>🎁 {quiz.reward}</Text>
            )}
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.quizStatus, { color: statusColor }]}>
            {status}
          </Text>
          {quiz.childResult?.isSolved && (
            <TouchableOpacity
              style={styles.rewardButton}
              onPress={() => handleCompleteReward(quiz)}
            >
              <Text style={styles.rewardButtonText}>보상 지급</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name}의 퀴즈 현황</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 리스트 */}
      <ScrollView style={styles.container}>
        {loading ? (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>퀴즈를 불러오는 중...</Text>
        ) : quizzes.length > 0 ? (
          quizzes.map(renderQuizItem)
        ) : (
          <Text
            style={{ textAlign: 'center', marginTop: 20, color: '#6b7280' }}
          >
            아직 맞춘 퀴즈가 없습니다.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },

  quizItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  quizQuestion: { fontSize: 14, fontWeight: '500', color: '#111827' },
  quizCategory: { fontSize: 12, color: '#6b7280' },
  quizStatus: { fontSize: 13, fontWeight: '600' },

  rewardText: { fontSize: 12, color: '#059669', marginTop: 2 },
  rewardButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  rewardButtonText: { fontSize: 12, color: '#fff', fontWeight: '500' },
});
