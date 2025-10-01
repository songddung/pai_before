import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // TODO: 실제 로그인 API 연동
    console.log("로그인:", email, password);
    navigation.navigate('ProfileSelection' as never);
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
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호를 입력해주세요"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>로그인</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        계정이 없으신가요?{" "}
        <Text style={styles.link} onPress={() => navigation.navigate('Signup' as never)}>
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
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  footer: { marginTop: 20, textAlign: "center", color: "gray" },
  link: { color: "#2563eb", fontWeight: "bold" },
});