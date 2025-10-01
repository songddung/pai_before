import CheckBox from 'expo-checkbox';
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import { useNavigation } from '@react-navigation/native';

export default function SignupScreen() {
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  // NIST 규약 비밀번호 검사
  const validatePassword = (pw: string) => {
    const minLength = pw.length >= 8;
    const maxLength = pw.length <= 64;
    const hasLower = /[a-z]/.test(pw);
    const hasUpper = /[A-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSymbol = /[^A-Za-z0-9]/.test(pw);

    return minLength && maxLength && hasLower && hasUpper && hasNumber && hasSymbol;
  };

  const handleSignup = () => {
    if (password !== confirm) {
      Alert.alert("오류", "비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!validatePassword(password)) {
      Alert.alert(
        "비밀번호 정책 오류",
        "비밀번호는 최소 8자 이상, 대소문자/숫자/특수문자를 모두 포함해야 합니다."
      );
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      Alert.alert("약관 동의 필요", "회원가입을 위해 약관에 모두 동의해야 합니다.");
      return;
    }

    console.log("회원가입 성공:", { name, email });
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    navigation.navigate('Login' as never);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>회원가입</Text>
      <Text style={styles.subHeader}>PAI와 함께 시작해요!</Text>

      {/* 입력폼 */}
      <TextInput style={styles.input} placeholder="이름" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="이메일" value={email} onChangeText={setEmail} />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호 확인"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
      />

      {/* 약관 동의 */}
      <View style={styles.checkboxRow}>
        {/* <CheckBox value={agreeTerms} onValueChange={setAgreeTerms} tintColors={{ true: "#6366f1", false: "#ccc" }} /> */}
        <CheckBox value={agreeTerms} onValueChange={setAgreeTerms} color="#6366f1" />
        <Text style={styles.link} onPress={() => navigation.navigate('Terms' as never)}>
          이용약관
        </Text>
        <Text>에 동의합니다</Text>
      </View>

      <View style={styles.checkboxRow}>
        {/* <CheckBox value={agreePrivacy} onValueChange={setAgreePrivacy} tintColors={{ true: "#6366f1", false: "#ccc" }} /> */}
        <CheckBox value={agreeTerms} onValueChange={setAgreeTerms} color="#6366f1" />
        <Text style={styles.link} onPress={() => navigation.navigate('Privacy' as never)}>
          개인정보처리방침
        </Text>
        <Text>에 동의합니다</Text>
      </View>

      {/* 가입 버튼 */}
      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>계정 만들기</Text>
      </TouchableOpacity>

      {/* 하단 링크 */}
      <Text style={styles.footer}>
        이미 계정이 있으신가요?{" "}
        <Text style={styles.link} onPress={() => navigation.navigate('Login' as never)}>
          로그인하기
        </Text>
      </Text>

      <Modal isVisible={isModalVisible} onBackdropPress={handleModalClose} animationIn="zoomIn" animationOut="zoomOut">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>회원가입 완료 🎉</Text>
          <Text style={styles.modalMessage}>이제 로그인하여 서비스를 이용할 수 있습니다.</Text>
          <TouchableOpacity style={styles.modalButton} onPress={handleModalClose}>
            <Text style={styles.modalButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 8, textAlign: "center" },
  subHeader: { fontSize: 16, color: "gray", marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  checkboxRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  link: { color: "#2563eb", fontWeight: "bold", marginHorizontal: 4 },
  button: {
    backgroundColor: "#6366f1",
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  footer: { marginTop: 20, textAlign: "center", color: "gray" },

  modalContent: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10, color: "#111" },
  modalMessage: { fontSize: 14, color: "#555", textAlign: "center", marginBottom: 20 },
  modalButton: {
    backgroundColor: "#6366f1",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  modalButtonText: { color: "#fff", fontWeight: "bold" },
});