import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VoiceRecordScreen() {
  const router = useRouter();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordedFile, setRecordedFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 🔹 녹음 시작
  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        alert("마이크 권한이 필요합니다.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
    } catch (err) {
      console.error("녹음 시작 오류:", err);
    }
  };

  // 🔹 녹음 정지
  const stopRecording = async () => {
    try {
      if (!recording) return;
      await recording.stopAndUnloadAsync();

      const uri = recording.getURI();
      if (uri) setRecordedFile(uri);

      setRecording(null);
    } catch (err) {
      console.error("녹음 중지 오류:", err);
    }
  };

  // 🔹 서버 업로드
  const uploadVoice = async () => {
    if (!recordedFile) return;
    setIsUploading(true);

    try {
      const profile_id = 3;

      const formData = new FormData();
      formData.append("profile_id", String(profile_id));
      formData.append("audio_file", {
        uri: recordedFile,
        name: "voice_sample.wav",
        type: "audio/wav",
      } as any);

      const res = await axios.post(
        `https://j13c101.p.ssafy.io/api/profiles/${profile_id}/voice`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer <JWT 토큰>`, // 👉 TODO: 로그인 시 받은 토큰으로 교체
          },
        }
      );

      console.log("업로드 성공:", res.data);
      alert("업로드 성공! voice_id: " + res.data.data.voice_id);
    } catch (err: any) {
      console.error("업로드 실패:", err.response?.data || err.message);
      alert("업로드 실패");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>음성 학습</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 안내 */}
      <Text style={styles.title}>긴 문장을 또렷하게 읽어주세요</Text>
      <Text style={styles.subText}>
        음성 파일은 최대 10MB까지 업로드할 수 있습니다.
      </Text>

      {/* 문장 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>학습 문장</Text>
        <View style={styles.sentenceBox}>
          <Text style={styles.sentence}>
            작은 토끼는 매일 달을 보며 소원을 빌었어요.{"\n"}
            어느 날, 달에서 내려온별이 토끼에게 다가와 "용기 있는 마음이 이미 네
            소원"이라 말했죠.{"\n"}
            그날 이후 토끼는 더 이상 달을 바라보지 않고, 자신 안의 빛을 믿게
            되었답니다.{"\n"}
          </Text>
        </View>

        {/* 녹음 버튼 */}
        <TouchableOpacity
          style={[
            styles.recordButton,
            recording ? { backgroundColor: "#ef4444" } : {},
          ]}
          onPress={recording ? stopRecording : startRecording}
        >
          <Ionicons name={recording ? "stop" : "mic"} size={20} color="white" />
          <Text style={styles.recordText}>
            {recording ? "녹음 중지" : "녹음 시작"}
          </Text>
        </TouchableOpacity>

        {/* 업로드 버튼 */}
        {recordedFile && !recording && (
          <TouchableOpacity
            style={[styles.uploadButton, isUploading && { opacity: 0.5 }]}
            onPress={uploadVoice}
            disabled={isUploading}
          >
            <Text style={styles.uploadText}>
              {isUploading ? "업로드 중..." : "녹음 업로드"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  headerTitle: { fontSize: 16, fontWeight: "bold" },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 16,
  },
  subText: { textAlign: "center", color: "#6b7280", marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    marginBottom: 20,
  },
  cardTitle: { fontWeight: "bold", marginBottom: 12, fontSize: 16 },
  sentenceBox: {
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  sentence: { color: "#111827", textAlign: "center", lineHeight: 20 },
  recordButton: {
    flexDirection: "row",
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  recordText: { color: "white", fontWeight: "bold", marginLeft: 6 },
  uploadButton: {
    marginTop: 12,
    backgroundColor: "#22c55e",
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadText: { color: "white", fontWeight: "bold" },
});