import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from '@react-navigation/native';

export default function WelcomeScreen() {
  const navigation = useNavigation();
  return (
    <ImageBackground
      source={require("../../../../assets/background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* 마스코트 */}
        <Image source={require("../../../../assets/mascot.png")} style={styles.mascot} />

        {/* 로고 & 설명 */}
        <Text style={styles.logo}>PAI</Text>
        <Text style={styles.subtitle}>Personal AI Assistant</Text>
        <Text style={styles.description}>
          아이들의 호기심을 키우고{"\n"}부모님의 교육을 도와주는{"\n"}똑똑한 AI 친구
        </Text>

        {/* 버튼 */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Signup' as never)}
        >
          <Text style={styles.primaryButtonText}>시작하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Login' as never)}
        >
          <Text style={styles.secondaryButtonText}>로그인</Text>
        </TouchableOpacity>

        {/* 하단 링크 */}
        <Text style={styles.footer}>
          이미 계정이 있으신가요?{" "}
          <Text
            style={styles.footerLink}
            onPress={() => navigation.navigate('Login' as never)}
          >
            로그인하기
          </Text>
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  mascot: {
    width: 160,
    height: 160,
    marginBottom: 24,
  },
  logo: { fontSize: 36, fontWeight: "bold", color: "#fff", marginBottom: 8 },
  subtitle: { fontSize: 18, color: "#dbeafe", marginBottom: 8 },
  description: {
    fontSize: 14,
    color: "#e0e7ff",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 40,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#2563eb",
  },
  secondaryButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#fff",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  secondaryButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  footer: { marginTop: 20, color: "#cbd5e1", fontSize: 13 },
  footerLink: { color: "#fff", fontWeight: "bold", textDecorationLine: "underline" },
});