import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function TermsScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>이용약관</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>PAI 서비스 이용약관</Text>

        <Text style={styles.section}>제1조 (목적)</Text>
        <Text style={styles.text}>
          본 약관은 PAI 서비스의 이용조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.
        </Text>

        <Text style={styles.section}>제2조 (정의)</Text>
        <Text style={styles.text}>
          1. "서비스"란 PAI가 제공하는 AI 교육 서비스를 의미합니다.{"\n"}
          2. "회원"이란 본 약관에 동의하고 서비스를 이용하는 자를 의미합니다.
        </Text>

        <Text style={styles.section}>제3조 (서비스의 내용)</Text>
        <Text style={styles.text}>
          PAI는 다음과 같은 서비스를 제공합니다:{"\n"}
          • 아이들을 위한 AI 질문답변 서비스{"\n"}
          • 교육용 퀴즈 및 학습 콘텐츠{"\n"}
          • 학습 진도 분석 서비스
        </Text>

        <Text style={styles.section}>제4조 (개인정보 보호)</Text>
        <Text style={styles.text}>
          회사는 관련 법령에 따라 회원의 개인정보를 보호하며, 개인정보처리방침에 따라 처리합니다.
        </Text>

        <Text style={styles.section}>제5조 (서비스 이용)</Text>
        <Text style={styles.text}>
          회원은 본 약관 및 관련 법령을 준수하여 서비스를 이용해야 합니다.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  content: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  section: { fontSize: 16, fontWeight: "bold", marginTop: 16, marginBottom: 8 },
  text: { fontSize: 14, lineHeight: 20, color: "#374151", marginBottom: 12 },
});