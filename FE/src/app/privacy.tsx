import { ScrollView, StyleSheet, Text } from "react-native";

export default function Privacy() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>개인정보처리방침</Text>
      <Text style={styles.text}>
        여기에 개인정보처리방침 내용을 작성하세요. {"\n"}
        {"\n"}1. 수집하는 개인정보의 항목{"\n"}...
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  text: { fontSize: 14, color: "#333", lineHeight: 20 },
});
