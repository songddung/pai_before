import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TrendingUp } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

type TabKey = 'overview' | 'weekly' | 'interest';

/* ---------- 작은 Progress 컴포넌트 ---------- */
function Progress({
  value,
  color = '#3b82f6',
}: {
  value: number;
  color?: string;
}) {
  return (
    <View style={styles.progressTrack}>
      <View
        style={[
          styles.progressBar,
          { width: `${value}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
}

export default function ChildAnalyticsScreen() {
  const { childId, name } = useLocalSearchParams();
  const router = useRouter();

  const [active, setActive] = useState<TabKey>('overview');
  const [loading, setLoading] = useState(false);

  const [overview, setOverview] = useState({
    totalQuestions: 0,
    activeDays: 0,
    topTopic: '',
  });
  const [weeklyActivity, setWeeklyActivity] = useState<any[]>([]);
  const [interestTopics, setInterestTopics] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);

      // 포트폴리오용 Mock 데이터 (통일성 있게 설계)
      const mockInterestTopics = [
        { topic: '동물', count: 8 },
        { topic: '우주', count: 6 },
        { topic: '공룡', count: 5 },
        { topic: '자연', count: 4 },
        { topic: '과학', count: 3 },
      ];

      // 주간 활동 데이터 (관심사 주제에 맞게 질문 수 분배)
      const mockWeeklyActivity = [
        { day: '월', questions: 4, engagement: 92 },
        { day: '화', questions: 3, engagement: 88 },
        { day: '수', questions: 5, engagement: 95 },
        { day: '목', questions: 2, engagement: 80 },
        { day: '금', questions: 4, engagement: 90 },
        { day: '토', questions: 6, engagement: 96 },
        { day: '일', questions: 2, engagement: 85 },
      ];

      // 총 질문 수 = 관심사 count 합계 (26개)
      const totalQuestions = mockInterestTopics.reduce((sum, t) => sum + t.count, 0);

      // 참여 일수 = 주간 활동에서 질문이 1개 이상인 날 (7일)
      const activeDays = mockWeeklyActivity.filter(d => d.questions > 0).length;

      setOverview({
        totalQuestions: totalQuestions,
        activeDays: activeDays,
        topTopic: mockInterestTopics[0].topic,
      });

      setWeeklyActivity(mockWeeklyActivity);
      setInterestTopics(mockInterestTopics);

      console.log('Mock 분석 데이터 로드 완료 (포트폴리오용)');
      setLoading(false);
    };

    fetchAnalysis();
  }, [childId]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name ?? '아이'} 분석 리포트</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Segmented Tabs */}
      <View style={styles.segmentWrap}>
        <View style={styles.segmentBackground}>
          <TouchableOpacity
            style={[
              styles.segmentItem,
              active === 'overview' && styles.segmentActive,
            ]}
            onPress={() => setActive('overview')}
          >
            <Text
              style={[
                styles.segmentText,
                active === 'overview' && styles.segmentTextActive,
              ]}
            >
              핵심 지표
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentItem,
              active === 'weekly' && styles.segmentActive,
            ]}
            onPress={() => setActive('weekly')}
          >
            <Text
              style={[
                styles.segmentText,
                active === 'weekly' && styles.segmentTextActive,
              ]}
            >
              주간 활동
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentItem,
              active === 'interest' && styles.segmentActive,
            ]}
            onPress={() => setActive('interest')}
          >
            <Text
              style={[
                styles.segmentText,
                active === 'interest' && styles.segmentTextActive,
              ]}
            >
              관심사 분석
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {loading && <Text>로딩 중...</Text>}
        {active === 'overview' && <OverviewContent overview={overview} />}
        {active === 'weekly' && (
          <WeeklyContent weeklyActivity={weeklyActivity} />
        )}
        {active === 'interest' && (
          <InterestContent interestTopics={interestTopics} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Overview (핵심 지표) ---------- */
function OverviewContent({ overview }: { overview: { totalQuestions: number; activeDays: number; topTopic: string } }) {
  return (
    <View>
      {/* 총 질문 수 */}
      <View style={styles.fullCard}>
        <Text style={styles.cardTitle}>총 질문 수</Text>
        <View style={styles.cardRow}>
          <Text style={styles.bigValue}>{overview.totalQuestions}</Text>
          <TrendingUp size={18} color="#16a34a" />
        </View>
      </View>

      {/* 참여 일수 */}
      <View style={styles.fullCard}>
        <Text style={styles.cardTitle}>참여 일수</Text>
        <View style={styles.cardRow}>
          <Text style={styles.bigValue}>{overview.activeDays}</Text>
          <Ionicons name="calendar-outline" size={18} color="#3b82f6" />
        </View>
        <Text style={styles.cardSub}>이번 주 7일 중</Text>
      </View>

      {/* 관심 주제 TOP1 */}
      <View style={styles.fullCard}>
        <Text style={styles.cardTitle}>관심 주제 TOP1</Text>
        <View style={styles.cardRow}>
          <Text style={styles.topicBig}>{overview.topTopic}</Text>
          <Ionicons name="pricetag-outline" size={18} color="#f59e0b" />
        </View>
        <Text style={styles.cardSub}>가장 많이 질문한 주제</Text>
      </View>
    </View>
  );
}

/* ---------- Weekly (주간 활동) ---------- */
function WeeklyContent({ weeklyActivity }: any) {
  // 최대 질문 수 계산 (바가 벗어나지 않도록)
  const maxQuestions = Math.max(...weeklyActivity.map((item: any) => item.questions));

  return (
    <View>
      <View style={styles.fullCard}>
        <Text style={styles.cardTitle}>📊 주간 활동 패턴</Text>
        <Text style={styles.cardSubSmall}>요일별 질문 수</Text>
        {weeklyActivity.map((item: any, idx: number) => (
          <View key={idx} style={styles.weekRow}>
            <Text style={{ width: 24 }}>{item.day}</Text>
            <View style={{ flex: 1, marginHorizontal: 8 }}>
              <Progress value={(item.questions / maxQuestions) * 100} color="#3b82f6" />
            </View>
            <Text style={{ width: 36, textAlign: 'right' }}>
              {item.questions}개
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ---------- Interest (관심사 분석) - 버블차트 ---------- */
function InterestContent({ interestTopics }: any) {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 64; // 좌우 패딩 고려
  const chartHeight = 350;

  // 버블 크기 계산 (최소 20, 최대 60)
  const maxCount = Math.max(...interestTopics.map((t: any) => t.count), 1);

  // 두 원이 겹치는지 확인하는 함수
  const isOverlapping = (x1: number, y1: number, r1: number, x2: number, y2: number, r2: number) => {
    const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    return distance < (r1 + r2 + 10); // 10px 여백 추가
  };

  // 안전한 위치 찾기 함수
  const findSafePosition = (radius: number, existingBubbles: any[], centerX: number, centerY: number) => {
    const maxAttempts = 100;
    const margin = radius + 10;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // 여러 전략으로 위치 시도
      let x, y;

      if (attempt < 20) {
        // 첫 20번 시도: 원형 배치
        const angle = (attempt * 2 * Math.PI) / 20;
        const distance = 60 + (attempt * 5);
        x = centerX + Math.cos(angle) * distance;
        y = centerY + Math.sin(angle) * distance;
      } else if (attempt < 50) {
        // 다음 30번 시도: 격자 패턴
        const gridSize = 40;
        const row = Math.floor((attempt - 20) / 6);
        const col = (attempt - 20) % 6;
        x = centerX - 100 + col * gridSize;
        y = centerY - 60 + row * gridSize;
      } else {
        // 나머지: 랜덤 배치
        x = margin + Math.random() * (chartWidth - 2 * margin);
        y = margin + Math.random() * (chartHeight - 2 * margin);
      }

      // 경계 체크
      if (x - radius < 0 || x + radius > chartWidth ||
        y - radius < 0 || y + radius > chartHeight) {
        continue;
      }

      // 다른 버블과 겹치는지 확인
      let overlapping = false;
      for (const bubble of existingBubbles) {
        if (isOverlapping(x, y, radius, bubble.x, bubble.y, bubble.radius)) {
          overlapping = true;
          break;
        }
      }

      if (!overlapping) {
        return { x, y };
      }
    }

    // 안전한 위치를 찾지 못한 경우 강제로 배치
    const fallbackAngle = existingBubbles.length * 0.8;
    const fallbackDistance = 80 + existingBubbles.length * 20;
    return {
      x: centerX + Math.cos(fallbackAngle) * fallbackDistance,
      y: centerY + Math.sin(fallbackAngle) * fallbackDistance,
    };
  };

  // 버블 위치 계산 (겹치지 않도록 배치)
  const getBubbleData = () => {
    const bubbles: any[] = [];
    const centerX = chartWidth / 2;
    const centerY = chartHeight / 2;

    // 카운트 순으로 정렬 (큰 버블부터 배치)
    const sortedTopics = [...interestTopics].sort((a, b) => b.count - a.count);

    sortedTopics.forEach((topic: any, index: number) => {
      const radius = Math.max(25, Math.min(55, (topic.count / maxCount) * 40 + 25));

      // 색상 선택 (원래 순서 유지를 위해 원본 인덱스 사용)
      const originalIndex = interestTopics.indexOf(topic);
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];
      const color = colors[originalIndex % colors.length];

      // 안전한 위치 찾기
      const position = findSafePosition(radius, bubbles, centerX, centerY);

      bubbles.push({
        ...topic,
        x: position.x,
        y: position.y,
        radius,
        color,
      });
    });

    return bubbles;
  };

  const bubbleData = getBubbleData();

  return (
    <View>
      <View style={styles.fullCard}>
        <Text style={styles.cardTitle}>🎯 주제별 관심사 분석</Text>
        <Text style={styles.cardSubSmall}>아이가 가장 궁금해하는 분야 (버블 크기 = 질문 횟수)</Text>

        <View style={styles.bubbleChartContainer}>
          <Svg width={chartWidth} height={chartHeight}>
            {bubbleData.map((bubble, index) => (
              <React.Fragment key={index}>
                {/* 버블 */}
                <Circle
                  cx={bubble.x}
                  cy={bubble.y}
                  r={bubble.radius}
                  fill={bubble.color}
                  opacity={0.7}
                  stroke={bubble.color}
                  strokeWidth={2}
                />
                {/* 토픽 텍스트 */}
                <SvgText
                  x={bubble.x}
                  y={bubble.y - 5}
                  fontSize="12"
                  fontWeight="bold"
                  fill="white"
                  textAnchor="middle"
                >
                  {bubble.topic}
                </SvgText>
                {/* 카운트 텍스트 */}
                <SvgText
                  x={bubble.x}
                  y={bubble.y + 8}
                  fontSize="10"
                  fill="white"
                  textAnchor="middle"
                >
                  {bubble.count}회
                </SvgText>
              </React.Fragment>
            ))}
          </Svg>
        </View>

        {/* 범례 */}
        <View style={styles.legendContainer}>
          <View style={styles.legendGrid}>
            {bubbleData.map((bubble, index) => (
              <View key={index} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendColor,
                    { backgroundColor: bubble.color }
                  ]}
                />
                <Text style={styles.legendText}>
                  {bubble.topic} ({bubble.count}회)
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

/* ---------- 스타일 ---------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eef2f5',
  },
  iconBtn: { width: 36, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },

  /* segmented */
  segmentWrap: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
  },
  segmentBackground: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    padding: 4,
    borderWidth: 1,
    borderColor: '#eef2f5',
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 3,
  },
  segmentText: { color: '#6b7280', fontWeight: '600' },
  segmentTextActive: { color: '#111827' },

  /* cards */
  fullCard: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eef2f5',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  bigValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginRight: 8,
  },
  topicBig: { fontSize: 20, fontWeight: '800', color: '#111827' },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  cardSub: { fontSize: 12, color: '#6b7280', marginTop: 8 },
  cardSubSmall: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 8,
  },

  /* weekly */
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#eef2f6',
    borderRadius: 6,
  },
  progressBar: { height: '100%', borderRadius: 6 },
  weekRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },

  /* bubble chart */
  bubbleChartContainer: {
    alignItems: 'center',
    marginVertical: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  legendContainer: {
    marginTop: 16,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    width: '48%',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
  },
});
