import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function PrivacyScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>개인정보처리방침</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>PAI 개인정보처리방침</Text>

        <Text style={styles.section}>1. 개인정보의 처리목적</Text>
        <Text style={styles.text}>
          PAI는 다음의 목적을 위하여 개인정보를 처리합니다:{"\n"}
          • 서비스 제공 및 계약의 이행{"\n"}
          • 회원 관리{"\n"}
          • 서비스 개선 및 새로운 서비스 개발
        </Text>

        <Text style={styles.section}>2. 처리하는 개인정보의 항목</Text>
        <Text style={styles.text}>
          필수항목: 이름, 이메일 주소{"\n"}
          선택항목: 프로필 사진, 학습 기록
        </Text>

        <Text style={styles.section}>3. 개인정보의 보유 및 이용기간</Text>
        <Text style={styles.text}>
          회원탈퇴 시까지 보유하며, 탈퇴 후 즉시 파기합니다.
        </Text>

        <Text style={styles.section}>4. 개인정보의 제3자 제공</Text>
        <Text style={styles.text}>
          PAI는 원칙적으로 개인정보를 제3자에게 제공하지 않습니다.
        </Text>

        <Text style={styles.section}>5. 개인정보 처리의 위탁</Text>
        <Text style={styles.text}>
          서비스 제공을 위해 필요한 경우에만 위탁하며, 위탁받는 자에게 개인정보 보호 의무를 부과합니다.
        </Text>

        <Text style={styles.section}>6. 개인정보보호 책임자</Text>
        <Text style={styles.text}>
          이름: 개인정보보호책임자{"\n"}
          연락처: privacy@pai.co.kr
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