import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import axios from 'axios';
import { useAuth } from '../domains/user/hooks/useAuth';
import { profileApi } from '../domains/user/api/userApi';

export default function PinScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const {
    accessToken,
    isAuthenticated,
  } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const profileId = params.id as string;
  const profileName = params.name as string;

  const verifyPin = async (inputPin: string) => {
    if (!isAuthenticated || !accessToken) {
      Alert.alert('오류', '로그인이 필요합니다.');
      router.replace('/login');
      return;
    }

    console.log('PIN 검증 시작:', { profileId, pin: inputPin });

    setIsVerifying(true);
    try {
      // PIN 검증만 수행 (프로필은 이미 선택됨)
      console.log('PIN 검증 중...');
      const verifyResult = await profileApi.verifyPin(profileId, inputPin);
      console.log('PIN 검증 응답:', verifyResult);
      console.log('PIN 검증 결과 타입:', typeof verifyResult);
      console.log('PIN 검증 valid 값:', verifyResult?.valid);
      console.log('PIN 검증 valid 타입:', typeof verifyResult?.valid);

      if (verifyResult && verifyResult.valid === true) {
        console.log('PIN 검증 성공! 다음 화면으로 이동...');
        // PIN 검증 성공 - 바로 다음 화면으로 이동 (프로필은 이미 선택됨)
        router.replace('/(parents)/voice-profiles');
      } else {
        console.log('PIN 검증 실패:', verifyResult);
        setError('잘못된 PIN입니다.');
        setPin('');
      }
    } catch (err: any) {
      console.error('PIN 검증 실패:', err);
      console.error('오류 상세:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        headers: err.config?.headers,
      });

      if (err.response?.status === 401) {
        setError('인증이 만료되었습니다. 다시 로그인해주세요.');
        router.replace('/login');
      } else if (err.response?.data?.message?.includes('PIN')) {
        setError('잘못된 PIN입니다.');
      } else {
        setError('PIN 검증 중 오류가 발생했습니다.');
      }
      setPin('');
    } finally {
      setIsVerifying(false);
    }
  };


  const handlePress = (num: string) => {
    if (pin.length < 4 && !isVerifying) {
      const newPin = pin + num;
      setPin(newPin);

      if (newPin.length === 4) {
        setError('');
        verifyPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  // 키패드 배열
  const keypadRows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', '⌫'], // 맨 아래: 공백, 0, 삭제
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>부모 프로필 인증</Text>
      <Text style={styles.subtitle}>PIN 입력</Text>
      <Text style={styles.description}>
        {profileName} 프로필에 접근하려면 PIN을 입력하세요
      </Text>
      {isVerifying && (
        <Text style={styles.verifying}>PIN을 확인하는 중...</Text>
      )}

      {/* PIN 표시칸 */}
      <View style={styles.pinRow}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={styles.pinBox}>
            <Text style={styles.pinText}>{pin[i] ? '●' : ''}</Text>
          </View>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* 숫자 키패드 */}
      <View style={styles.keypad}>
        {keypadRows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((key) => {
              if (key === '') {
                return <View key="empty" style={styles.key} />;
              }
              if (key === '⌫') {
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

      {/* <Text style={styles.footer}>
        {"\n"}
        {"\n"}
        PIN을 잊으셨나요? 기본 부모 프로필의 PIN은 1234입니다.{"\n"}
        보안을 위해 PIN을 변경하는 것을 권장합니다.
      </Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 24,
  },
  title: { fontSize: 20, fontWeight: 'bold', marginTop: 40 },
  subtitle: { fontSize: 18, marginTop: 20 },
  description: { fontSize: 14, color: '#555', marginTop: 10 },
  pinRow: { flexDirection: 'row', marginVertical: 30 },
  pinBox: {
    width: 40,
    height: 40,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinText: { fontSize: 20 },
  error: { color: 'red', marginBottom: 10 },
  verifying: { color: '#3b82f6', marginTop: 10, fontSize: 14 },

  // 키패드
  keypad: { marginTop: 20 },
  row: { flexDirection: 'row', justifyContent: 'center' },
  key: {
    width: 70,
    height: 70,
    margin: 10,
    borderRadius: 35,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: { fontSize: 22, fontWeight: 'bold' },
  footer: { fontSize: 12, color: '#666', textAlign: 'center', marginTop: 20 },
});
