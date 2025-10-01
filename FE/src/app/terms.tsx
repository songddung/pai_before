import { ScrollView, StyleSheet, Text } from "react-native";

export default function Terms() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>이용약관</Text>
      <Text style={styles.text}>
        여기에 서비스 이용약관 내용을 작성하세요. {"\n"}
        {"\n"}1. 제1조 (목적){"\n"}...
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  text: { fontSize: 14, color: "#333", lineHeight: 20 },
});
