import { Link, useRouter } from "expo-router";
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useEffect } from "react";
import { useAuth } from "../core/providers/AuthProvider";

export default function Welcome() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // 로딩이 완료되고 인증된 상태라면 프로필 선택 화면으로 이동
    if (!isLoading && isAuthenticated) {
      router.replace("/profile-select");
    }
  }, [isLoading, isAuthenticated]);

  // 로딩 중이라면 간단한 로딩 화면 표시
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  // 이미 인증된 상태라면 아무것도 렌더링하지 않음
  if (isAuthenticated) {
    return null;
  }

  return (
    <ImageBackground
      source={require("../../assets/background.png")}
      style={styles.background}
      resizeMode="cover" // contain, stretch 도 가능
    >
      <View style={styles.container}>
        {/* 마스코트 */}
        <Image source={require("../../assets/mascot.png")} style={styles.mascot} />

        {/* 로고 & 설명 */}
        <Text style={styles.logo}>PAI</Text>
        <Text style={styles.subtitle}>Personal AI Assistant</Text>
        <Text style={styles.description}>
          아이들의 호기심을 키우고{"\n"}부모님의 교육을 도와주는{"\n"}똑똑한 AI 친구
        </Text>

        {/* 버튼 */}
        <Link href="/signup" asChild>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>시작하기</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/login" asChild>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>로그인</Text>
          </TouchableOpacity>
        </Link>

        {/* 하단 링크 */}
        <Text style={styles.footer}>
          이미 계정이 있으신가요?{" "}
          <Link href="/login" asChild>
            <Text style={styles.footerLink}>로그인하기</Text>
          </Link>
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
    backgroundColor: "rgba(0,0,0,0.3)", // ✅ 배경 어둡게 (투명 오버레이)
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2563eb",
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
