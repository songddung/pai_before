import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../domains/user/hooks/useAuth";
import { profileApi } from "../../../domains/user/api/userApi";

export default function VoiceLearningScreen() {
  const router = useRouter();
  const { user, accessToken, isAuthenticated } = useAuth();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordedFile, setRecordedFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // JWT 토큰에서 현재 선택된 프로필 정보 확인
  useEffect(() => {
    const checkProfile = async () => {
      if (!isAuthenticated || !accessToken) {
        router.replace('/login');
        return;
      }

      try {
        const { tokenUtils } = await import('../../../shared/utils/token');
        const tokenData = tokenUtils.decodeToken(accessToken);

        console.log('음성 등록 화면 로드됨');
        console.log('사용자:', user?.userId);
        console.log('토큰 데이터:', tokenData);

        if (!tokenData || !tokenData.profile_id) {
          console.log('프로필 정보가 없음. profile-select로 이동');
          Alert.alert('알림', '프로필을 먼저 선택해주세요.', [
            { text: '확인', onPress: () => router.replace('/profile-select') }
          ]);
          return;
        }

        if (tokenData.profile_type !== 'PARENT') {
          console.log('부모 프로필이 아님:', tokenData.profile_type);
          Alert.alert('오류', '음성 등록은 부모 프로필만 가능합니다.', [
            { text: '확인', onPress: () => router.back() }
          ]);
          return;
        }

        setCurrentProfile(tokenData);
        console.log('현재 프로필 설정 완료:', {
          profileId: tokenData.profile_id,
          profileType: tokenData.profile_type,
          profileName: tokenData.profile_name
        });
      } catch (error) {
        console.error('프로필 확인 오류:', error);
        Alert.alert('오류', '프로필 정보를 확인할 수 없습니다.', [
          { text: '확인', onPress: () => router.back() }
        ]);
      }
    };

    checkProfile();
  }, [isAuthenticated, accessToken]);

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

  // 🔹 서버 업로드
  const uploadVoice = async () => {
    if (!recordedFile) {
      Alert.alert('오류', '녹음된 파일이 없습니다.');
      return;
    }

    if (!isAuthenticated || !accessToken) {
      Alert.alert('오류', '로그인이 필요합니다.');
      router.replace('/login');
      return;
    }

    setIsUploading(true);

    try {
      // JWT 토큰에서 현재 선택된 프로필 정보 추출
      console.log('현재 액세스 토큰:', accessToken ? '존재함' : '없음');

      const { tokenUtils } = await import('../../../shared/utils/token');
      const tokenData = tokenUtils.decodeToken(accessToken);

      console.log('디코딩된 토큰 데이터:', tokenData);

      if (!tokenData) {
        Alert.alert('오류', '토큰을 디코딩할 수 없습니다. 다시 로그인해주세요.');
        router.replace('/login');
        return;
      }

      // currentProfile이 설정되어 있으면 그것을 사용, 없으면 토큰에서 추출
      let profileId: string;

      if (currentProfile && currentProfile.profile_id) {
        profileId = currentProfile.profile_id.toString();
        console.log('현재 설정된 프로필 사용:', profileId);
      } else if (tokenData.profile_id) {
        profileId = tokenData.profile_id.toString();
        console.log('토큰에서 프로필 ID 추출:', profileId);
      } else {
        console.log('프로필 ID를 찾을 수 없음');
        Alert.alert('알림', '프로필을 먼저 선택해주세요.', [
          { text: '확인', onPress: () => router.replace('/profile-select') }
        ]);
        return;
      }

      console.log('음성 업로드 시작:', {
        profileId,
        profileType: tokenData.profile_type,
        profileName: tokenData.profile_name,
        recordedFile,
        userId: user?.userId,
        tokenSub: tokenData.sub
      });

      const result = await profileApi.registerVoice(profileId, recordedFile);
      console.log("음성 등록 성공:", result);

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
      const errorMessage = err.response?.data?.message || err.message || '음성 업로드 중 오류가 발생했습니다.';
      Alert.alert('실패', errorMessage);
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
