import {
  Award,
  BookOpen,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Card 컴포넌트 단순화 버전
function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <View style={{ marginBottom: 6 }}>{children}</View>;
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.cardTitle}>{children}</Text>;
}

function CardDescription({ children }: { children: React.ReactNode }) {
  return <Text style={styles.cardDescription}>{children}</Text>;
}

function CardContent({ children }: { children: React.ReactNode }) {
  return <View>{children}</View>;
}

// Progress 컴포넌트
function Progress({ value }: { value: number }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressBar, { width: `${value}%` }]} />
    </View>
  );
}

export default function AnalyticsScreen() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    "week" | "month" | "all"
  >("week");

  const navigation = useNavigation();

  const comprehensiveAnalytics = {
    overview: {
      totalQuestions: 6,
      engagementScore: 87,
      learningProgress: 78,
      curiosityIndex: 92,
    },
    learningGoals: [
      {
        category: "과학 호기심",
        progress: 85,
        description: "자연 현상에 대한 질문",
      },
      { category: "언어 발달", progress: 70, description: "어휘력 및 표현력" },
      { category: "논리적 사고", progress: 60, description: "인과관계 이해" },
      { category: "창의적 상상", progress: 90, description: "상상력과 창의성" },
    ],
    improvements: [
      {
        area: "수학적 사고",
        current: 45,
        suggestion: "일상생활 속 숫자 관련 질문을 유도해보세요",
        action: "요리하며 계량하기, 물건 개수 세기",
      },
      {
        area: "사회성 발달",
        current: 55,
        suggestion: "다른 사람의 감정, 행동에 대한 질문 격려",
        action: "가족, 친구 관계 이야기 나누기",
      },
    ],
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("ProfileSelection" as never)}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>분석 리포트</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* 시간 범위 선택 */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          {(["week", "month", "all"] as const).map((range) => (
            <TouchableOpacity
              key={range}
              onPress={() => setSelectedTimeRange(range)}
              style={[
                styles.rangeButton,
                selectedTimeRange === range && styles.rangeButtonActive,
              ]}
            >
              <Text
                style={{
                  color: selectedTimeRange === range ? "#fff" : "#374151",
                  fontWeight: "600",
                }}
              >
                {range === "week"
                  ? "이번 주"
                  : range === "month"
                  ? "이번 달"
                  : "전체"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 핵심 지표 */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
          <View style={{ width: "48%" }}>
            <Card>
              <CardHeader>
                <CardTitle>총 질문 수</CardTitle>
              </CardHeader>
              <CardContent>
                <View style={styles.row}>
                  <Text style={styles.bigText}>6</Text>
                  <TrendingUp size={18} color="#16a34a" />
                </View>
              </CardContent>
            </Card>
          </View>

          <View style={{ width: "48%" }}>
            <Card>
              <CardHeader>
                <CardTitle>참여도</CardTitle>
              </CardHeader>
              <CardContent>
                <View style={styles.row}>
                  <Text style={styles.bigText}>87%</Text>
                  <Target size={18} color="#2563eb" />
                </View>
              </CardContent>
            </Card>
          </View>

          <View style={{ width: "48%" }}>
            <Card>
              <CardHeader>
                <CardTitle>학습 진도</CardTitle>
              </CardHeader>
              <CardContent>
                <View style={styles.row}>
                  <Text style={styles.bigText}>78%</Text>
                  <BookOpen size={18} color="#9333ea" />
                </View>
              </CardContent>
            </Card>
          </View>

          <View style={{ width: "48%" }}>
            <Card>
              <CardHeader>
                <CardTitle>호기심 지수</CardTitle>
              </CardHeader>
              <CardContent>
                <View style={styles.row}>
                  <Text style={styles.bigText}>92%</Text>
                  <Sparkles size={18} color="#eab308" />
                </View>
              </CardContent>
            </Card>
          </View>
        </View>

        {/* 학습 목표 */}
        <Card>
          <CardHeader>
            <CardTitle>학습 목표 달성도</CardTitle>
            <CardDescription>영역별 발달 현황</CardDescription>
          </CardHeader>
          <CardContent>
            {comprehensiveAnalytics.learningGoals.map((goal, idx) => (
              <View key={idx} style={{ marginBottom: 12 }}>
                <View style={styles.rowBetween}>
                  <Text>{goal.category}</Text>
                  <Text>{goal.progress}%</Text>
                </View>
                <Progress value={goal.progress} />
                <Text style={styles.smallText}>{goal.description}</Text>
              </View>
            ))}
          </CardContent>
        </Card>

        {/* 개선 제안 */}
        <Card>
          <CardHeader>
            <CardTitle>개선 제안</CardTitle>
            <CardDescription>더 나은 발달을 위한 맞춤 제안</CardDescription>
          </CardHeader>
          <CardContent>
            {comprehensiveAnalytics.improvements.map((item, idx) => (
              <View key={idx} style={styles.suggestionBox}>
                <View style={styles.rowBetween}>
                  <Text style={{ fontWeight: "600" }}>{item.area}</Text>
                  <Text style={styles.badge}>{item.current}%</Text>
                </View>
                <Text style={styles.smallText}>{item.suggestion}</Text>
                <View style={styles.row}>
                  <Award size={14} color="#2563eb" />
                  <Text style={[styles.smallText, { color: "#2563eb", marginLeft: 4 }]}>
                    {item.action}
                  </Text>
                </View>
              </View>
            ))}
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    flex: 1,
    margin: 6,
    elevation: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: "600", color: "#374151" },
  cardDescription: { fontSize: 12, color: "#6b7280" },
  progressTrack: {
    width: "100%",
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    marginTop: 4,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 4,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bigText: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  smallText: { fontSize: 12, color: "#6b7280" },
  suggestionBox: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: "#fef3c7",
    color: "#d97706",
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 4,
    backgroundColor: "#f3f4f6",
  },
  rangeButtonActive: {
    backgroundColor: "#2563eb",
  },
});