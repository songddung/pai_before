import { useNavigation } from '@react-navigation/native';
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PinAuthScreen() {
  const navigation = useNavigation();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const correctPin = "1234"; // 기본 PIN

  const handlePress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);

      if (newPin.length === 4) {
        if (newPin === correctPin) {
          setError("");
          navigation.navigate('Parent' as never);
        } else {
          setError("잘못된 PIN입니다.");
          setPin("");
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  // 키패드 배열
  const keypadRows = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", "⌫"], // 맨 아래: 공백, 0, 삭제
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>부모 프로필 인증</Text>
      <Text style={styles.subtitle}>PIN 입력</Text>
      <Text style={styles.description}>
        부모 프로필에 접근하려면 PIN을 입력하세요
      </Text>

      {/* PIN 표시칸 */}
      <View style={styles.pinRow}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={styles.pinBox}>
            <Text style={styles.pinText}>{pin[i] ? "●" : ""}</Text>
          </View>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* 숫자 키패드 */}
      <View style={styles.keypad}>
        {keypadRows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((key) => {
              if (key === "") {
                return <View key="empty" style={styles.key} />;
              }
              if (key === "⌫") {
                return (
                  <TouchableOpacity
                    key="del"
                    style={styles.key}
                    onPress={handleDelete}
                  >
                    <Text style={styles.keyText}>⌫</Text>
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={key}
                  style={styles.key}
                  onPress={() => handlePress(key)}
                >
                  <Text style={styles.keyText}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <Text style={styles.footer}>
        {"\n"}
        {"\n"}
        PIN을 잊으셨나요? 기본 부모 프로필의 PIN은 1234입니다.{"\n"}
        보안을 위해 PIN을 변경하는 것을 권장합니다.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center", padding: 24 },
  title: { fontSize: 20, fontWeight: "bold", marginTop: 40 },
  subtitle: { fontSize: 18, marginTop: 20 },
  description: { fontSize: 14, color: "#555", marginTop: 10 },
  pinRow: { flexDirection: "row", marginVertical: 30 },
  pinBox: {
    width: 40, height: 40,
    marginHorizontal: 8,
    borderWidth: 1, borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },
  pinText: { fontSize: 20 },
  error: { color: "red", marginBottom: 10 },

  // 키패드
  keypad: { marginTop: 20 },
  row: { flexDirection: "row", justifyContent: "center" },
  key: {
    width: 70, height: 70,
    margin: 10,
    borderRadius: 35,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  keyText: { fontSize: 22, fontWeight: "bold" },
  footer: { fontSize: 12, color: "#666", textAlign: "center", marginTop: 20 },
});