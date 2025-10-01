import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const testQuizzes = [
  {
    id: "1",
    difficulty: "쉬움",
    tags: ["엄마 취향"],
    question: "엄마가 가장 좋아하는 색깔은?",
    reward: "스티커 3개",
    status: "새로운",
  },
  {
    id: "2",
    difficulty: "보통",
    tags: ["아빠 취미"],
    question: "아빠의 취미는 무엇일까요?",
    reward: "용돈 1000원",
    tries: 3,
    status: "완료",
    progress: 85,
  },
  {
    id: "3",
    difficulty: "보통",
    tags: ["가족 추억"],
    question: "우리 가족이 가장 좋아하는 여행지는?",
    reward: "아이스크림",
    tries: 1,
    status: "진행중",
  },
];

export default function QuizListScreen() {
  const navigation = useNavigation();

  const renderItem = ({ item }: { item: (typeof testQuizzes)[0] }) => (
    <TouchableOpacity
      style={styles.quizCard}
      onPress={() =>
        (navigation as any).navigate("QuizDetail", { id: item.id })
      }
    >
      {/* 아이콘 + 난이도 */}
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <Ionicons name="play-circle" size={20} color="#fff" />
        </View>
        <View style={styles.tags}>
          <Text style={styles.tag}>{item.difficulty}</Text>
          {item.tags.map((t) => (
            <Text key={t} style={[styles.tag, styles.subTag]}>
              {t}
            </Text>
          ))}
        </View>
      </View>

      {/* 문제 */}
      <Text style={styles.question}>{item.question}</Text>

      {/* 하단 정보 */}
      <View style={styles.footer}>
        <Text style={styles.reward}>🎁 {item.reward}</Text>
        {item.tries && <Text style={styles.meta}>📝 {item.tries}번 시도</Text>}
        {item.progress && <Text style={styles.meta}>⭐ {item.progress}%</Text>}
        {item.status && <Text style={styles.status}>{item.status}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <View style={styles.container}>
        {/* 🔹 헤더 (뒤로가기 + 제목) */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate("ProfileSelection" as never)}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
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
            <Text style={styles.summaryNumber}>2</Text>
            <Text style={styles.summaryLabel}>완료</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>1</Text>
            <Text style={styles.summaryLabel}>진행중</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>2</Text>
            <Text style={styles.summaryLabel}>새로운</Text>
          </View>
        </View>

        {/* 퀴즈 목록 */}
        <FlatList
          data={testQuizzes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 20,
          }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 10 }} />}
        />
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