import Checkbox from 'expo-checkbox';
import { Link, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal';
import { CreateUserDto } from '@shared-types';
import { userApi } from '../domains/user/api/userApi';
import { useAuth } from '../domains/user/hooks/useAuth';

export default function Signup() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // 이미 로그인되어 있다면 profile-select로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/profile-select");
    }
  }, [isAuthenticated]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [address, setAddress] = useState('');
  const [addressQuery, setAddressQuery] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<{address: string; type: string}[]>([]);
  const [isAddressModalVisible, setAddressModalVisible] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 카카오 REST API 키 (환경변수에서 가져오기)
  const KAKAO_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;

  // NIST 규약 비밀번호 검사
  const validatePassword = (pw: string) => {
    const minLength = pw.length >= 8;
    const maxLength = pw.length <= 64;
    const hasLower = /[a-z]/.test(pw);
    const hasUpper = /[A-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSymbol = /[^A-Za-z0-9]/.test(pw);

    return (
      minLength && maxLength && hasLower && hasUpper && hasNumber && hasSymbol
    );
  };

  // 카카오 주소 검색 API 호출
  const searchKakaoAddress = async (query: string) => {
    if (!query.trim()) {
      setAddressSuggestions([]);
      return;
    }

    if (!KAKAO_API_KEY) {
      Alert.alert('설정 오류', '카카오 API 키가 설정되지 않았습니다.');
      return;
    }

    try {
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `KakaoAK ${KAKAO_API_KEY}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('API 호출 실패');
      }

      const data = await response.json();

      // 도로명 주소 우선으로 정렬
      const addresses = data.documents.map((item: any) => ({
        address: item.road_address
          ? item.road_address.address_name
          : item.address.address_name,
        type: item.road_address ? '도로명' : '지번',
      }));

      setAddressSuggestions(addresses);
    } catch (error) {
      console.error('주소 검색 오류:', error);
      Alert.alert('오류', '주소 검색 중 오류가 발생했습니다.');
    }
  };

  // 주소 선택 처리
  const handleAddressSelect = (selectedAddress: string) => {
    setAddress(selectedAddress);
    setAddressQuery('');
    setAddressSuggestions([]);
    setAddressModalVisible(false);
  };

  const handleSignup = async () => {
    // 유효성 검사
    if (password !== confirm) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!validatePassword(password)) {
      Alert.alert(
        '비밀번호 정책 오류',
        '비밀번호는 최소 8자 이상, 대소문자/숫자/특수문자를 모두 포함해야 합니다.',
      );
      return;
    }
    if (!address) {
      Alert.alert('주소 입력 필요', '주소를 입력해주세요.');
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      Alert.alert(
        '약관 동의 필요',
        '회원가입을 위해 약관에 모두 동의해야 합니다.',
      );
      return;
    }

    setIsLoading(true);

    try {
      // 회원가입 API 호출
      const userData: CreateUserDto = {
        email,
        password,
        address,
      };

      console.log('회원가입 요청 시작:', userData);

      const result = await userApi.register(userData);

      console.log('회원가입 성공:', result);
      setModalVisible(true);
    } catch (error: any) {
      console.error('회원가입 오류:', error);

      // API 클라이언트에서 처리된 오류 메시지 사용
      const errorMessage = error.message || '회원가입 중 오류가 발생했습니다.';
      Alert.alert('회원가입 실패', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>회원가입</Text>
      <Text style={styles.subHeader}>PAI와 함께 시작해요!</Text>

      {/* 입력폼 */}
      <TextInput
        style={styles.input}
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호 확인"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* 주소 입력 */}
      <TouchableOpacity
        style={styles.addressButton}
        onPress={() => setAddressModalVisible(true)}
      >
        <Text style={[styles.addressText, !address && styles.placeholder]}>
          {address || '주소를 검색해주세요'}
        </Text>
      </TouchableOpacity>

      {/* 약관 동의 */}
      <View style={styles.checkboxRow}>
        <Checkbox
          value={agreeTerms}
          onValueChange={setAgreeTerms}
          color={agreeTerms ? '#6366f1' : '#ccc'}
        />
        <Link href="/terms" asChild>
          <Text style={styles.link}>이용약관</Text>
        </Link>
        <Text>에 동의합니다</Text>
      </View>

      <View style={styles.checkboxRow}>
        <Checkbox
          value={agreePrivacy}
          onValueChange={setAgreePrivacy}
          color={agreePrivacy ? '#6366f1' : '#ccc'}
        />
        <Link href="/privacy" asChild>
          <Text style={styles.link}>개인정보처리방침</Text>
        </Link>
        <Text>에 동의합니다</Text>
      </View>

      {/* 가입 버튼 */}
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSignup}
        disabled={isLoading}
      >
        {isLoading ? (
          <View style={styles.buttonContent}>
            <ActivityIndicator
              size="small"
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.buttonText}>계정 생성 중...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>계정 만들기</Text>
        )}
      </TouchableOpacity>

      {/* 하단 링크 */}
      <Text style={styles.footer}>
        이미 계정이 있으신가요?{' '}
        <Text style={styles.link} onPress={() => router.push('/login')}>
          로그인하기
        </Text>
      </Text>

      {/* 주소 검색 모달 */}
      <Modal
        isVisible={isAddressModalVisible}
        onBackdropPress={() => setAddressModalVisible(false)}
      >
        <View style={styles.addressModalContent}>
          <Text style={styles.addressModalTitle}>주소 검색</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="도로명 또는 지번주소를 입력하세요"
            value={addressQuery}
            onChangeText={(text) => {
              setAddressQuery(text);
              searchKakaoAddress(text);
            }}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <FlatList
            data={addressSuggestions}
            keyExtractor={(item, index) => `${item.address}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.addressItem}
                onPress={() => handleAddressSelect(item.address)}
              >
                <Text style={styles.addressItemText}>{item.address}</Text>
                <Text style={styles.addressTypeText}>{item.type}</Text>
              </TouchableOpacity>
            )}
            style={styles.addressList}
            ListEmptyComponent={() =>
              addressQuery ? (
                <Text style={styles.noResultText}>검색 결과가 없습니다</Text>
              ) : (
                <Text style={styles.noResultText}>
                  주소를 입력해서 검색하세요
                </Text>
              )
            }
          />

          <TouchableOpacity
            style={styles.addressCloseButton}
            onPress={() => setAddressModalVisible(false)}
          >
            <Text style={styles.addressCloseText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* 회원가입 완료 모달 */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={handleModalClose}
        animationIn="zoomIn"
        animationOut="zoomOut"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>회원가입 완료 🎉</Text>
          <Text style={styles.modalMessage}>
            이제 로그인하여 서비스를 이용할 수 있습니다.
          </Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={handleModalClose}
          >
            <Text style={styles.modalButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  link: { color: '#2563eb', fontWeight: 'bold', marginHorizontal: 4 },
  addressButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    justifyContent: 'center',
  },
  addressText: {
    fontSize: 16,
    color: '#000',
  },
  placeholder: {
    color: '#999',
  },
  button: {
    backgroundColor: '#6366f1',
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  footer: { marginTop: 20, textAlign: 'center', color: 'gray' },

  // 주소 검색 모달
  addressModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    height: '80%',
  },
  addressModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  addressList: {
    flex: 1,
    marginBottom: 16,
  },
  addressItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressItemText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  addressTypeText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  noResultText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    fontSize: 14,
  },
  addressCloseButton: {
    backgroundColor: '#6366f1',
    padding: 12,
    borderRadius: 8,
  },
  addressCloseText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  // 회원가입 완료 모달
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#111',
  },
  modalMessage: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  modalButtonText: { color: '#fff', fontWeight: 'bold' },
});
