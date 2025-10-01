import { useNavigation } from '@react-navigation/native';
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";

export default function ProfileSelectionScreen() {
  const navigation = useNavigation();
  const [isModalVisible, setModalVisible] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileType, setProfileType] = useState<"아이" | "부모" | null>(null);

  const handleSelectProfile = (profile: string) => {
    if (profile === "아이") {
      navigation.navigate('Child' as never);
    } else {
      navigation.navigate('Pin' as never);
    }
  };

  const handleAddProfile = () => {
    if (!profileName || !profileType) return;
    console.log("새 프로필 생성:", profileName, profileType);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.logout}
        onPress={() => {
          navigation.navigate('Welcome' as never);
        }}
      >
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>

      <Text style={styles.title}>PAI를 누구와 함께 사용하시나요?</Text>

      <View style={styles.profileRow}>
        <TouchableOpacity
          style={[styles.profileCard, { backgroundColor: "#f472b6" }]}
          onPress={() => handleSelectProfile("아이")}
        >
          <Text style={styles.emoji}>👶</Text>
          <Text style={styles.name}>지민</Text>
          <Text style={styles.role}>아이</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.profileCard, { backgroundColor: "#3b82f6" }]}
          onPress={() => handleSelectProfile("부모")}
        >
          <Text style={styles.emoji}>👩</Text>
          <Text style={styles.name}>엄마</Text>
          <Text style={styles.role}>부모</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.profileCard, styles.addCard]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addText}>＋</Text>
          <Text style={styles.name}>프로필 추가</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        프로필을 선택하거나 새 프로필을 만들어주세요
      </Text>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>새 프로필 만들기</Text>
          <Text style={styles.modalSubtitle}>
            가족 구성원을 위한 새 프로필을 만들어보세요.
          </Text>

          <Text style={styles.inputLabel}>프로필 이름</Text>
          <TextInput
            style={styles.input}
            placeholder="이름을 입력하세요"
            value={profileName}
            onChangeText={setProfileName}
          />

          <Text style={styles.inputLabel}>프로필 유형</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[
                styles.typeCard,
                profileType === "아이" && styles.typeCardActive,
              ]}
              onPress={() => setProfileType("아이")}
            >
              <Text style={styles.emoji}>👶</Text>
              <Text style={styles.typeText}>아이</Text>
              <Text style={styles.typeDesc}>재미있게 배워요</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeCard,
                profileType === "부모" && styles.typeCardActive,
              ]}
              onPress={() => setProfileType("부모")}
            >
              <Text style={styles.emoji}>👩‍👩‍👧‍👦</Text>
              <Text style={styles.typeText}>부모</Text>
              <Text style={styles.typeDesc}>체계적인 관리</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                !(profileName && profileType) && { opacity: 0.5 },
              ]}
              disabled={!(profileName && profileType)}
              onPress={handleAddProfile}
            >
              <Text style={styles.confirmText}>프로필 만들기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 24,
    justifyContent: "center",
  },
  logout: { position: "absolute", top: 40, right: 20 },
  logoutText: { color: "#60a5fa", fontSize: 14 },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
  },
  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  profileCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 6,
    marginHorizontal: 6,
    alignItems: "center",
  },
  emoji: { fontSize: 40, marginBottom: 8 },
  name: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  role: { fontSize: 14, color: "#e5e7eb" },
  addCard: {
    borderWidth: 1,
    borderColor: "#444",
    backgroundColor: "transparent",
  },
  addText: { fontSize: 32, color: "#9ca3af", marginBottom: 8 },
  footer: { textAlign: "center", color: "#9ca3af", marginTop: 30 },

  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 16 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 6 },
  modalSubtitle: { fontSize: 14, color: "#555", marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: "bold", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  typeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  typeCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    alignItems: "center",
  },
  typeCardActive: { borderColor: "#6366f1", backgroundColor: "#eef2ff" },
  typeText: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  typeDesc: { fontSize: 12, color: "#555" },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  cancelButton: { padding: 12, marginRight: 8 },
  cancelText: { color: "#555", fontWeight: "bold" },
  confirmButton: {
    backgroundColor: "#6366f1",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  confirmText: { color: "#fff", fontWeight: "bold" },
});