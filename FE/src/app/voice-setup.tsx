import { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function VoiceSetupPage() {
  const router = useRouter();
  const [recorded, setRecorded] = useState(false);

  const handleRecord = () => {
    // TODO: Expo AV API 활용해서 음성 녹음 구현
    setRecorded(true);
  };

  const handleComplete = () => {
    console.log("음성 등록 완료");
    router.replace("/profile-select");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>음성 등록</Text>
      {!recorded ? (
        <Button title="녹음 시작" onPress={handleRecord} />
      ) : (
        <Button title="저장하고 완료하기" onPress={handleComplete} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
});
