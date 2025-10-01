import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import { useAuth } from "../domains/user/hooks/useAuth";
import { UserService } from "../domains/user/service/userService";

export default function Login() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 이미 로그인되어 있다면 profile-select로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/profile-select");
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    // 유효성 검사
    if (!UserService.validateEmail(email)) {
      Alert.alert("오류", "올바른 이메일 주소를 입력해주세요.");
      return;
    }

    const passwordValidation = UserService.validatePassword(password);
    if (!passwordValidation.isValid) {
      Alert.alert("오류", passwordValidation.message!);
      return;
    }

    // 로그인 시도
    const success = await login({ email, password });

    if (success) {
      router.replace("/profile-select");
    } else {
      Alert.alert("로그인 실패", "이메일 또는 비밀번호를 확인해주세요.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>로그인</Text>
      <Text style={styles.subHeader}>다시 만나서 반가워요!</Text>

      <TextInput
        style={styles.input}
        placeholder="이메일을 입력해주세요"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호를 입력해주세요"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "로그인 중..." : "로그인"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        계정이 없으신가요?{" "}
        <Text style={styles.link} onPress={() => router.push("/signup")}>
          회원가입하기
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  subHeader: { fontSize: 16, color: "gray", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#94a3b8",
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  footer: { marginTop: 20, textAlign: "center", color: "gray" },
  link: { color: "#2563eb", fontWeight: "bold" },
});
