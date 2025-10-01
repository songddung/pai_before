import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Text, Button, Icon } from './';

interface VoiceRecorderProps {
  onRecordingComplete: (audioUri: string) => void;
  disabled?: boolean;
  style?: any;
}

const GUIDE_SCRIPTS = [
  "음성 복제 기술은 다양한 분야에서 활용될 수 있는 잠재력을 가지고 있습니다.",
  "정확한 발음으로 천천히, 그리고 꾸준한 톤으로 말씀해주세요.",
  "이 문장은 시스템이 당신의 목소리 특징을 학습하는 데 사용됩니다."
];

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  disabled = false,
  style,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currentScriptIndex, setCurrentScriptIndex] = useState(0);
  const [completedScripts, setCompletedScripts] = useState<boolean[]>(
    new Array(GUIDE_SCRIPTS.length).fill(false)
  );
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 권한 요청
  const requestPermissions = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '음성 녹음을 위해 마이크 접근 권한이 필요합니다.');
      return false;
    }
    return true;
  };

  // 녹음 시작
  const startRecording = async () => {
    if (disabled) return;

    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      // Audio 모드 설정
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();

      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);

      // 녹음 시간 카운트
      intervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('녹음 시작 실패:', error);
      Alert.alert('오류', '녹음을 시작할 수 없습니다.');
    }
  };

  // 녹음 중지
  const stopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      if (uri) {
        setAudioUri(uri);

        // 현재 스크립트를 완료로 표시
        const newCompletedScripts = [...completedScripts];
        newCompletedScripts[currentScriptIndex] = true;
        setCompletedScripts(newCompletedScripts);
      }

      recordingRef.current = null;
    } catch (error) {
      console.error('녹음 중지 실패:', error);
      Alert.alert('오류', '녹음을 중지할 수 없습니다.');
    }
  };

  // 녹음 재생
  const playRecording = async () => {
    if (!audioUri) return;

    try {
      if (isPlaying) {
        await soundRef.current?.stopAsync();
        setIsPlaying(false);
        return;
      }

      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });

      await sound.playAsync();
      setIsPlaying(true);
    } catch (error) {
      console.error('재생 실패:', error);
      Alert.alert('오류', '녹음을 재생할 수 없습니다.');
    }
  };

  // 다음 스크립트로 이동
  const nextScript = () => {
    if (currentScriptIndex < GUIDE_SCRIPTS.length - 1) {
      setCurrentScriptIndex(currentScriptIndex + 1);
      setAudioUri(null);
      setRecordingDuration(0);
    }
  };

  // 이전 스크립트로 이동
  const prevScript = () => {
    if (currentScriptIndex > 0) {
      setCurrentScriptIndex(currentScriptIndex - 1);
      setAudioUri(null);
      setRecordingDuration(0);
    }
  };

  // 녹음 완료 처리
  const handleComplete = () => {
    if (!audioUri) {
      Alert.alert('알림', '먼저 음성을 녹음해주세요.');
      return;
    }

    onRecordingComplete(audioUri);
  };

  // 모든 스크립트 완료 여부
  const allScriptsCompleted = completedScripts.every(completed => completed);

  // 시간 포맷팅
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, style]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text variant="h6" color="text">
          음성 녹음 ({currentScriptIndex + 1}/{GUIDE_SCRIPTS.length})
        </Text>
        <Text variant="body2" color="textSecondary">
          아래 문장을 천천히 또렷하게 읽어주세요
        </Text>
      </View>

      {/* 진행 상황 */}
      <View style={styles.progressContainer}>
        {GUIDE_SCRIPTS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentScriptIndex && styles.progressDotActive,
              completedScripts[index] && styles.progressDotCompleted,
            ]}
          />
        ))}
      </View>

      {/* 스크립트 텍스트 */}
      <View style={styles.scriptContainer}>
        <Text variant="h5" color="text" align="center" style={styles.scriptText}>
          "{GUIDE_SCRIPTS[currentScriptIndex]}"
        </Text>
      </View>

      {/* 녹음 컨트롤 */}
      <View style={styles.recordingContainer}>
        {/* 녹음 시간 */}
        {(isRecording || audioUri) && (
          <Text variant="h6" color="text" align="center">
            {formatTime(recordingDuration)}
          </Text>
        )}

        {/* 녹음 버튼 */}
        <View style={styles.controlButtons}>
          <Button
            title={isRecording ? "녹음 중지" : "녹음 시작"}
            variant={isRecording ? "danger" : "primary"}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={disabled}
            style={styles.recordButton}
            icon={isRecording ? "stop" : "mic"}
          />

          {/* 재생 버튼 */}
          {audioUri && (
            <Button
              title={isPlaying ? "재생 중지" : "재생"}
              variant="secondary"
              onPress={playRecording}
              disabled={disabled}
              style={styles.playButton}
              icon={isPlaying ? "pause" : "play"}
            />
          )}
        </View>

        {/* 녹음 상태 표시 */}
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text variant="body2" color="error">
              녹음 중...
            </Text>
          </View>
        )}
      </View>

      {/* 내비게이션 */}
      <View style={styles.navigationContainer}>
        <Button
          title="이전"
          variant="ghost"
          onPress={prevScript}
          disabled={currentScriptIndex === 0 || disabled}
          style={styles.navButton}
        />

        {currentScriptIndex === GUIDE_SCRIPTS.length - 1 ? (
          <Button
            title="완료"
            variant="primary"
            onPress={handleComplete}
            disabled={!audioUri || disabled}
            style={styles.navButton}
          />
        ) : (
          <Button
            title="다음"
            variant="ghost"
            onPress={nextScript}
            disabled={!audioUri || disabled}
            style={styles.navButton}
          />
        )}
      </View>

      {/* 완료 상태 메시지 */}
      {completedScripts[currentScriptIndex] && (
        <View style={styles.completedMessage}>
          <Icon name="checkmark-circle" size={16} color="#10B981" />
          <Text variant="body2" color="success">
            이 스크립트 녹음이 완료되었습니다
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    gap: 20,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
  },
  progressDotActive: {
    backgroundColor: '#3B82F6',
  },
  progressDotCompleted: {
    backgroundColor: '#10B981',
  },
  scriptContainer: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  scriptText: {
    lineHeight: 28,
  },
  recordingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  recordButton: {
    minWidth: 120,
  },
  playButton: {
    minWidth: 100,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    minWidth: 80,
  },
  completedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#DCFCE7',
    borderRadius: 8,
  },
});