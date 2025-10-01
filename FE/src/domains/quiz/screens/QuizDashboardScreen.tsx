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

export default function QuizDashboardScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          {/* 뒤로가기 버튼 */}
          <TouchableOpacity onPress={() => navigation.navigate('ProfileSelection')}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>

          {/* 가운데 제목 */}
          <Text style={styles.headerTitle}>부모님 퀴즈</Text>

          {/* 오른쪽 자리 맞춤 */}
          <View style={{ width: 24 }} />
        </View>

        {/* 요약 카드 */}
        <View style={styles.summaryRow}>
          <SummaryCard
            icon={<CheckCircle size={20} color="green" />}
            title="완료된 퀴즈"
            value="2개"
            sub="정답률 85%"
            subColor={{ color: "#16a34a" }}
          />
          <SummaryCard
            icon={<Trophy size={20} color="blue" />}
            title="평균 점수"
            value="87점"
            sub="전주 대비 +5점"
            subColor={{ color: "#2563eb" }}
          />
          <SummaryCard
            icon={<Clock size={20} color="purple" />}
            title="평균 소요시간"
            value="3.2분"
            sub="적정 수준"
            subColor={{ color: "#9333ea" }}
          />
          <SummaryCard
            icon={<Star size={20} color="orange" />}
            title="참여도"
            value="92%"
            sub="매우 활발"
            subColor={{ color: "#f59e0b" }}
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
              { backgroundColor: "#ecfdf5", borderColor: "#bbf7d0" },
            ]}
          >
            <Text style={[styles.quizTitle, { color: "#16a34a" }]}>
              오늘의 퀴즈 생성 완료!
            </Text>
            <Text style={[styles.quizSub, { color: "#16a34a" }]}>
              다음 퀴즈는 13시간 37분 후에 생성 가능
            </Text>
            <TouchableOpacity style={styles.waitButton}>
              <Text style={styles.waitText}>대기 중</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 아이의 퀴즈 현황 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>아이의 퀴즈 현황</Text>
          <QuizItem
            question="엄마가 가장 좋아하는 색깔은?"
            category="엄마 취향"
            status="미시작"
          />
          <QuizItem
            question="아빠의 취미는 무엇일까요?"
            category="아빠 취미"
            status="완료 (85점)"
          />
          <QuizItem
            question="우리 가족이 가장 좋아하는 여행지는?"
            category="가족 추억"
            status="1번 시도"
          />
        </View>

        {/* 퀴즈 분석 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>퀴즈 분석</Text>
          <View style={styles.analysisItem}>
            <Text style={styles.analysisTitle}>
              🔵 아이가 가장 어려워하는 영역
            </Text>
            <Text style={styles.analysisText}>
              아빠 어린시절 관련 질문의 정답률이 낮습니다
            </Text>
            <Text style={styles.analysisTip}>
              💡 아빠의 어린 시절 이야기를 더 많이 들려주세요
            </Text>
          </View>
          <View style={styles.analysisItem}>
            <Text style={[styles.analysisTitle, { color: "green" }]}>
              🟢 아이가 가장 잘하는 영역
            </Text>
            <Text style={styles.analysisText}>
              엄마 취향 관련 질문에서 높은 정답률
            </Text>
            <Text style={[styles.analysisTip, { color: "green" }]}>
              👍 엄마에 대해 잘 알고 있어요
            </Text>
          </View>
          <View style={styles.analysisItem}>
            <Text style={[styles.analysisTitle, { color: "purple" }]}>
              🟣 추천 퀴즈 주제
            </Text>
            <Text style={styles.analysisText}>
              가족 여행, 함께 했던 추억에 대한 퀴즈
            </Text>
            <Text style={[styles.analysisTip, { color: "purple" }]}>
              📸 사진과 함께 추억을 회상해보세요
            </Text>
          </View>
        </View>

        {/* 최근 생성한 퀴즈 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>최근 생성한 퀴즈</Text>
            <Text style={styles.badgeGray}>최근 7일</Text>
          </View>
          <RecentQuiz
            question="엄마가 가장 좋아하는 색깔은?"
            answer="파란색"
            status="아이의 답변 대기 중"
          />
          <RecentQuiz
            question="아빠의 취미는 무엇일까요?"
            answer="독서"
            status="아이의 답변 대기 중"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({ icon, title, value, sub, subColor }: any) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryIconRow}>
        {icon}
        <Text style={styles.summaryTitle}>{title}</Text>
      </View>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={[styles.summarySub, subColor]}>{sub}</Text>
    </View>
  );
}

function QuizItem({ question, category, status }: any) {
  return (
    <View style={styles.quizItem}>
      <View>
        <Text style={styles.quizQuestion}>{question}</Text>
        <Text style={styles.quizCategory}>{category}</Text>
      </View>
      <Text style={styles.quizStatus}>{status}</Text>
    </View>
  );
}

function RecentQuiz({ question, answer, status }: any) {
  return (
    <View style={styles.recentQuizBox}>
      <Text style={styles.quizQuestion}>{question}</Text>
      <Text style={styles.quizAnswer}>정답: {answer}</Text>
      <Text style={styles.quizStatus}>{status}</Text>
      <View style={styles.quizFooter}>
        <Text style={styles.quizCategory}>오늘 생성</Text>
        <Text style={styles.quizCategory}>답변 대기</Text>
      </View>
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
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 8,
    color: "#111827",
  },
  subText: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 20,
    fontSize: 12,
  },

  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  summaryCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
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
  waitButton: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  waitText: { fontSize: 12, color: "#374151" },

  quizItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
  },
  quizQuestion: { fontSize: 13, fontWeight: "500", color: "#111827" },
  quizCategory: { fontSize: 11, color: "#6b7280" },
  quizStatus: { fontSize: 12, color: "#2563eb", marginTop: 2 },

  // 분석
  analysisItem: { marginBottom: 12 },
  analysisTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#374151",
  },
  analysisText: { fontSize: 12, color: "#374151" },
  analysisTip: { fontSize: 12, marginTop: 4, color: "#2563eb" },

  // 최근 생성한 퀴즈
  recentQuizBox: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  quizAnswer: { fontSize: 12, color: "#374151", marginTop: 4 },
  quizFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
});