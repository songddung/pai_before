import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VoiceLearningScreen() {
  const router = useRouter();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordedFile, setRecordedFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // JWT 토큰에서 현재 선택된 프로필 정보 확인 (포트폴리오용 Mock)
  useEffect(() => {
    const checkProfile = async () => {
      // Mock 프로필 데이터로 우회 (포트폴리오 데모용)
      const mockProfile = {
        profile_id: 'demo-parent-1',
        profile_type: 'PARENT',
        profile_name: '부모님',
        sub: 'demo-user-123'
      };

      console.log('음성 등록 화면 로드됨 (Mock 모드)');
      console.log('Mock 프로필 데이터:', mockProfile);

      setCurrentProfile(mockProfile);
      console.log('현재 프로필 설정 완료:', {
        profileId: mockProfile.profile_id,
        profileType: mockProfile.profile_type,
        profileName: mockProfile.profile_name
      });
    };

    checkProfile();
  }, []);

  // 녹음 시간 추적
  useEffect(() => {
    let interval: number;
    if (recording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [recording]);

  // 컴포넌트 언마운트 시 사운드 정리
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

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

  // 🔹 녹음 재생
  const playRecording = async () => {
    if (!recordedFile) return;

    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      const { sound: newSound } = await Audio.Sound.createAsync({ uri: recordedFile });
      setSound(newSound);
      setIsPlaying(true);

      await newSound.playAsync();

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('재생 실패:', error);
      setIsPlaying(false);
    }
  };

  // 🔹 재생 중지
  const stopPlayback = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  // 시간 포맷 함수
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 🔹 서버 업로드 (포트폴리오용 Mock)
  const uploadVoice = async () => {
    if (!recordedFile) {
      Alert.alert('오류', '녹음된 파일이 없습니다.');
      return;
    }

    setIsUploading(true);

    try {
      // Mock 데이터로 시뮬레이션 (포트폴리오 데모용)
      console.log('음성 업로드 시작 (Mock 모드):', {
        profileId: currentProfile?.profile_id,
        profileType: currentProfile?.profile_type,
        profileName: currentProfile?.profile_name,
        recordedFile
      });

      // 업로드 시뮬레이션 (1.5초 대기)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock 음성 프로필 데이터 생성
      const mockVoiceProfile = {
        profile_id: currentProfile?.profile_id || 'demo-parent-1',
        name: '송현광',
        birth_date: '1997-04-01',
        profile_type: 'PARENT',
        avatar_media_id: 'piggy1',
        voice_media_id: 'voice-' + Date.now(),
        created_at: new Date().toISOString()
      };

      // AsyncStorage를 사용하여 캐시 저장
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;

      // 기존 음성 프로필 목록 가져오기
      const existingData = await AsyncStorage.getItem('mock_voice_profiles');
      let voiceProfiles = existingData ? JSON.parse(existingData) : [];

      // 새 프로필 추가
      voiceProfiles.push(mockVoiceProfile);

      // 저장
      await AsyncStorage.setItem('mock_voice_profiles', JSON.stringify(voiceProfiles));

      console.log("음성 등록 성공 (Mock):", mockVoiceProfile);
      console.log("저장된 전체 프로필:", voiceProfiles);

      Alert.alert('성공', '음성 학습이 완료되었습니다!', [
        {
          text: '확인',
          onPress: () => {
            console.log('음성 등록 완료 - 음성 프로필 목록으로 이동');
            router.replace('/(parents)/voice-profiles');
          }
        }
      ]);
    } catch (err: any) {
      console.error("음성 업로드 실패:", err);
      Alert.alert('실패', '음성 업로드 중 오류가 발생했습니다.');
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
            어느 날, 달에서 내려온별이 토끼에게 다가와 “용기 있는 마음이 이미 네
            소원”이라 말했죠.{"\n"}
            그날 이후 토끼는 더 이상 달을 바라보지 않고, 자신 안의 빛을 믿게
            되었답니다.{"\n"}
          </Text>
        </View>

        {/* 녹음 상태 표시 */}
        {recording && (
          <View style={styles.recordingStatus}>
            <View style={styles.recordingIndicator} />
            <Text style={styles.recordingTime}>
              녹음 중 {formatTime(recordingTime)}
            </Text>
          </View>
        )}

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

        {/* 재생 및 업로드 버튼 */}
        {recordedFile && !recording && (
          <View style={styles.actionContainer}>
            {/* 재생 버튼 */}
            <TouchableOpacity
              style={[styles.playButton, isPlaying && { backgroundColor: "#ef4444" }]}
              onPress={isPlaying ? stopPlayback : playRecording}
            >
              <Ionicons
                name={isPlaying ? "stop" : "play"}
                size={16}
                color="white"
              />
              <Text style={styles.playText}>
                {isPlaying ? "재생 중지" : "재생"}
              </Text>
            </TouchableOpacity>

            {/* 업로드 버튼 */}
            <TouchableOpacity
              style={[styles.uploadButton, isUploading && { opacity: 0.5 }]}
              onPress={uploadVoice}
              disabled={isUploading}
            >
              <Text style={styles.uploadText}>
                {isUploading ? "업로드 중..." : "음성 등록"}
              </Text>
            </TouchableOpacity>
          </View>
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

  // 녹음 상태 표시
  recordingStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  recordingIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ef4444",
    marginRight: 8,
  },
  recordingTime: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ef4444",
  },

  // 액션 버튼 컨테이너
  actionContainer: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "space-between",
  },
  playButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  playText: { color: "white", fontWeight: "bold", marginLeft: 4 },

  uploadButton: {
    flex: 1,
    backgroundColor: "#22c55e",
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
  uploadText: { color: "white", fontWeight: "bold" },
});
