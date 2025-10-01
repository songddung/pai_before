import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import { useAuth } from '../domains/user/hooks/useAuth';
import { mediaApi } from '../shared/api/mediaApi';
import { profileApi } from '@/domains/user/api/userApi';
import { tokenStorage } from '../shared/api/client';
import { tokenUtils } from '../shared/utils/token';
import { useAuthStore } from '../domains/user/models/user';

export default function ProfileSelect() {
  const router = useRouter();
  const { user, accessToken, isAuthenticated, logout, selectProfile: selectProfileFromAuth } = useAuth();
  const { setSelectedProfile: setZustandSelectedProfile } = useAuthStore();
  const [isModalVisible, setModalVisible] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileType, setProfileType] = useState<'아이' | '부모' | null>(null);
  const [pin, setPin] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [avatarMediaId, setAvatarMediaId] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // PIN 입력 모달 관련 상태
  const [isPinModalVisible, setPinModalVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // 프로필 선택 핸들러
  const handleSelectProfile = async (profile: any) => {
    if (profile.profile_type === 'CHILD') {
      try {
        console.log('아이 프로필 선택 시작:', {
          profile_id: profile.profile_id,
          name: profile.name,
          profile_type: profile.profile_type,
          현재인증상태: isAuthenticated,
          현재토큰있음: !!accessToken,
        });

        // 현재 토큰 상태 확인
        const currentAccessToken = await tokenStorage.getAccessToken();
        const currentRefreshToken = await tokenStorage.getRefreshToken();
        console.log('아이 프로필 선택 전 토큰 상태:', {
          hasAccessToken: !!currentAccessToken,
          hasRefreshToken: !!currentRefreshToken,
          accessTokenLength: currentAccessToken?.length,
          refreshTokenLength: currentRefreshToken?.length,
        });

        // AuthProvider의 selectProfile 사용 (토큰 상태 동기화를 위해)
        console.log('아이 프로필 선택 중:', profile.profile_id);
        const success = await selectProfileFromAuth(profile.profile_id, 'CHILD');

        console.log('아이 프로필 선택 결과:', { success });

        if (success) {
          console.log('아이 프로필 선택 성공');

          // 새로운 토큰 상태 확인
          const newAccessToken = await tokenStorage.getAccessToken();
          const newRefreshToken = await tokenStorage.getRefreshToken();
          console.log('아이 프로필 선택 후 새로운 토큰 상태:', {
            hasNewAccessToken: !!newAccessToken,
            hasNewRefreshToken: !!newRefreshToken,
            newAccessTokenLength: newAccessToken?.length,
            newRefreshTokenLength: newRefreshToken?.length,
          });

          console.log('질문 페이지로 이동:', {
            pathname: '/(child)/question',
            params: { id: profile.profile_id, name: profile.name },
          });

          router.replace({
            pathname: '/(child)/question',
            params: {
              id: profile.profile_id,
              name: profile.name,
            },
          });
        } else {
          console.error('아이 프로필 선택 실패 - AuthProvider에서 false 반환');
          throw new Error('프로필 선택 실패');
        }
      } catch (error: any) {
        console.error('아이 프로필 선택 실패:', {
          error: error?.message || String(error),
          status: error?.response?.status,
          data: error?.response?.data,
        });
        // 에러 알림 표시하지 않음 - 조용히 처리
      }
    } else {
      // 부모 프로필 선택 시 PIN 입력 모달 표시
      setSelectedProfile(profile);
      setPinModalVisible(true);
      setPinInput('');
      setPinError('');
    }
  };

  // PIN 검증 및 프로필 선택
  const handlePinVerify = async (pin: string) => {
    if (!selectedProfile) return;

    try {
      console.log('부모 프로필 선택 및 PIN 검증 시작:', {
        profileId: selectedProfile.profile_id,
        profileName: selectedProfile.name,
        pinLength: pin.length,
        현재인증상태: isAuthenticated,
        현재토큰있음: !!accessToken,
      });

      // 현재 토큰 상태 확인
      const currentAccessToken = await tokenStorage.getAccessToken();
      const currentRefreshToken = await tokenStorage.getRefreshToken();
      console.log('PIN 검증 전 토큰 상태:', {
        hasAccessToken: !!currentAccessToken,
        hasRefreshToken: !!currentRefreshToken,
        accessTokenLength: currentAccessToken?.length,
        refreshTokenLength: currentRefreshToken?.length,
      });

      // AuthProvider의 selectProfile 사용 (PIN 포함)
      const success = await selectProfileFromAuth(selectedProfile.profile_id, 'PARENT', pin);

      console.log('부모 프로필 선택 결과:', { success });

      if (success) {
        console.log('프로필 선택 및 PIN 검증 성공, 토큰 업데이트 완료');

        // 토큰 업데이트 후 상태 확인
        const newAccessToken = await tokenStorage.getAccessToken();
        const newRefreshToken = await tokenStorage.getRefreshToken();
        console.log('PIN 검증 후 새로운 토큰 상태:', {
          hasNewAccessToken: !!newAccessToken,
          hasNewRefreshToken: !!newRefreshToken,
          newAccessTokenLength: newAccessToken?.length,
          newRefreshTokenLength: newRefreshToken?.length,
        });

        setPinModalVisible(false);
        console.log('부모 프로필 전환 완료, 대화 페이지로 이동');
        router.replace('/(parents)/conversation');
      } else {
        console.error('프로필 선택 실패 - AuthProvider에서 false 반환');
        throw new Error('프로필 선택 실패');
      }
    } catch (error: any) {
      // 에러 로깅은 하되 알림은 표시하지 않음
      console.error('부모 프로필 선택 실패:', {
        error: error?.message || String(error),
        status: error?.response?.status,
        data: error?.response?.data,
      });
      setPinError('PIN이 일치하지 않습니다.');
      setPinInput('');
    }
  };

  // 생년월일 입력 처리 함수 (자동 하이픈 추가)
  const handleBirthDateChange = (text: string) => {
    // 숫자만 추출
    const numbersOnly = text.replace(/[^0-9]/g, '');

    let formattedDate = '';
    if (numbersOnly.length <= 4) {
      // 4자리까지는 그대로
      formattedDate = numbersOnly;
    } else if (numbersOnly.length <= 6) {
      // 5-6자리: YYYY-MM
      formattedDate = `${numbersOnly.slice(0, 4)}-${numbersOnly.slice(4)}`;
    } else {
      // 7-8자리: YYYY-MM-DD
      formattedDate = `${numbersOnly.slice(0, 4)}-${numbersOnly.slice(4, 6)}-${numbersOnly.slice(6, 8)}`;
    }

    setBirthDate(formattedDate);
  };

  // 모달 닫기 및 폼 상태 초기화 함수
  const closeModalAndReset = () => {
    setModalVisible(false);
    setProfileName('');
    setProfileType(null);
    setPin('');
    setGender(null);
    setAvatarUrl('');
    setAvatarMediaId('');
    setBirthDate('');
  };

  // PIN 키패드 핸들러
  const handlePinKeypad = (num: string) => {
    if (pinInput.length < 4) {
      const newPin = pinInput + num;
      setPinInput(newPin);

      if (newPin.length === 4) {
        setPinError('');
        handlePinVerify(newPin);
      }
    }
  };

  const handlePinDelete = () => {
    setPinInput(pinInput.slice(0, -1));
  };

  // 프로필 조회
  useEffect(() => {
    const fetchProfiles = async () => {
      console.log('프로필 조회 시작:', {
        isAuthenticated,
        hasAccessToken: !!accessToken,
        accessTokenLength: accessToken?.length
      });

      // 프로필 선택 페이지 진입 시 zustand store 초기화
      console.log('프로필 선택 페이지 - zustand store 초기화');
      setZustandSelectedProfile(null);

      // 현재 토큰 정보 확인
      const currentToken = await tokenStorage.getAccessToken();
      if (currentToken) {
        const tokenData = tokenUtils.decodeToken(currentToken);
        console.log('프로필 선택 페이지 - 현재 토큰 정보:', {
          hasToken: !!currentToken,
          tokenLength: currentToken.length,
          profile_id: tokenData?.profile_id,
          profile_name: tokenData?.profile_name,
          profile_type: tokenData?.profile_type,
          exp: tokenData?.exp,
          현재시간: new Date().getTime() / 1000,
          만료여부: tokenData?.exp ? (tokenData.exp < (new Date().getTime() / 1000) ? '만료됨' : '유효함') : '확인불가',
        });
      } else {
        console.log('프로필 선택 페이지 - 토큰 없음');
      }

      // 인증되지 않은 경우 로그인 화면으로 이동
      if (!isAuthenticated || !accessToken) {
        console.log('인증 상태 확인 실패, 로그인 화면으로 이동');
        router.replace('/login');
        return;
      }

      try {
        console.log('프로필 목록 API 요청 중...');
        const profiles = await profileApi.getAllProfiles();
        console.log('프로필 조회 성공:', profiles?.length, '개');

        // 각 프로필 상세 정보 로깅
        profiles?.forEach((profile, index) => {
          console.log(`프로필 ${index + 1}:`, {
            profile_id: profile.profile_id,
            name: profile.name,
            profile_type: profile.profile_type,
            created_at: profile.created_at,
          });
        });

        setProfiles(profiles || []);
      } catch (err: any) {
        console.error('프로필 조회 실패:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
          url: err.config?.url,
          method: err.config?.method,
        });

        // 토큰 에러 시 로그아웃 후 로그인 화면으로 이동
        if (err.response?.status === 401) {
          console.log('401 오류로 인한 자동 로그아웃');
          await logout();
          Alert.alert('인증 오류', '다시 로그인해주세요.', [
            { text: '확인', onPress: () => router.replace('/login') },
          ]);
        } else {
          // 프로필 조회 실패 시 조용히 처리
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [isAuthenticated, accessToken]);

  // 이미지 업로드 함수
  const uploadImage = async (imageUri: string) => {
    try {
      setIsUploadingImage(true);
      console.log('이미지 업로드 시작:', { imageUri, userId: user?.userId });

      const result = await mediaApi.uploadImage(
        imageUri,
        user?.userId,
        'PARENT',
      );
      console.log('이미지 업로드 성공:', result);

      setAvatarMediaId(result.media_id);
      return result.media_id;
    } catch (error: any) {
      console.error('이미지 업로드 실패:', error);
      console.error('오류 상세:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      Alert.alert(
        '업로드 실패',
        `이미지 업로드 중 오류가 발생했습니다: ${error.message}`,
      );
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  // 프로필 생성 관련 로직
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setAvatarUrl(imageUri);
      // 프로필 생성 시까지 이미지는 로컬에만 저장
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setAvatarUrl(imageUri);
      // 프로필 생성 시까지 이미지는 로컬에만 저장
    }
  };

  const handleAddProfile = async () => {
    console.log('프로필 생성 시작:', {
      profileName,
      profileType,
      gender,
      birthDate,
      pinLength: pin.length,
      hasAvatarUrl: !!avatarUrl,
    });

    if (!profileName || !profileType || !gender || !birthDate) {
      console.error('필수 정보 누락:', { profileName, profileType, gender, birthDate });
      Alert.alert('오류', '모든 필수 정보를 입력해주세요.');
      return;
    }
    if (profileType === '부모' && pin.length !== 4) {
      console.error('부모 프로필 PIN 길이 오류:', pin.length);
      Alert.alert('오류', 'PIN은 4자리 숫자여야 합니다.');
      return;
    }

    const userId = user?.userId;
    if (!userId) {
      console.error('사용자 ID 없음:', { user, userId });
      Alert.alert('오류', '사용자 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      // 1. 먼저 프로필 생성 (이미지 없이)
      const payload: any = {
        user_id: userId,
        profile_type: profileType === '부모' ? 'PARENT' : 'CHILD',
        name: profileName,
        birth_date: birthDate,
        gender: gender,
      };

      if (profileType === '부모') {
        payload.pin = pin;
      }

      console.log('프로필 생성 API 요청 페이로드:', payload);

      const createdProfile = await profileApi.createProfile(payload);
      console.log('프로필 생성 성공:', {
        profile_id: createdProfile.profile_id,
        name: createdProfile.name,
        profile_type: createdProfile.profile_type,
      });
      const profileId = createdProfile.profile_id;

      // 아바타 업로드 기능 비활성화

      Alert.alert('성공', '프로필이 생성되었습니다!');

      // 생성된 프로필 정보 저장 (모달 닫기 전에)
      const createdProfileName = profileName;
      const createdProfileId = createdProfile.profile_id;

      // 모달 닫기 및 폼 상태 초기화
      closeModalAndReset();

      // 프로필 목록 새로고침 (잠시 대기 후)
      setTimeout(async () => {
        try {
          console.log('프로필 목록 새로고침 시작');
          const refreshedProfiles = await profileApi.getAllProfiles();
          console.log('새로고침된 프로필 목록:', refreshedProfiles?.length, '개');

          if (refreshedProfiles) {
            setProfiles(refreshedProfiles);
            console.log('프로필 목록 업데이트 완료');

            // 새로 생성된 프로필 확인
            const newProfile = refreshedProfiles.find(p =>
              p.profile_id === createdProfileId || p.name === createdProfileName
            );
            if (newProfile) {
              console.log('새로 생성된 프로필 확인됨:', newProfile.profile_id, newProfile.name);
            } else {
              console.warn('새로 생성된 프로필을 목록에서 찾을 수 없음');
            }
          } else {
            console.warn('새로고침된 프로필 목록이 비어있음');
          }
        } catch (refreshError) {
          console.error('프로필 목록 새로고침 실패:', refreshError);
          // 새로고침 실패해도 프로필은 생성되었으므로 경고만 표시
          // 목록 갱신 실패 시 조용히 처리
        }
      }, 500); // 500ms 지연
    } catch (err: any) {
      console.error('프로필 생성 실패:', err.response?.data || err.message);
      // 프로필 생성 실패 시 조용히 처리
    }
  };

  return (
    <View style={styles.container}>
      {/* 로그아웃 */}
      <TouchableOpacity
        style={styles.logout}
        onPress={() => {
          logout();
          router.replace('/login');
        }}
      >
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>

      {/* 타이틀 */}
      <Text style={styles.title}>PAI를 누구와 함께 사용하시나요?</Text>

      {/* 프로필 리스트 */}
      <View style={styles.profileRow}>
        {profiles.map((profile, index) => (
          <TouchableOpacity
            key={`profile-${profile.profile_id}-${index}`}
            style={[
              styles.profileCard,
              profile.profile_type === 'CHILD'
                ? { backgroundColor: '#f472b6' }
                : { backgroundColor: '#3b82f6' },
              // 한 줄에 3개씩 배치
              { flexBasis: '30%', marginHorizontal: 5 },
            ]}
            onPress={() => handleSelectProfile(profile)}
          >
            <Image
              source={
                profile.avatar_url
                  ? { uri: profile.avatar_url }
                  : require('../../assets/default-avatar.png')
              }
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                marginBottom: 8,
              }}
            />
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.role}>
              {profile.profile_type === 'PARENT' ? '부모' : '아이'}
            </Text>
          </TouchableOpacity>
        ))}

        {/* 프로필 추가 버튼 */}
        <TouchableOpacity
          style={[
            styles.profileCard,
            styles.addCard,
            { flexBasis: '30%', marginHorizontal: 5 },
          ]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addText}>＋</Text>
          <Text style={styles.name}>프로필 추가</Text>
        </TouchableOpacity>
      </View>

      {/* 하단 설명 */}
      <Text style={styles.footer}>
        프로필을 선택하거나 새 프로필을 만들어주세요
      </Text>

      {/* 새 프로필 모달 */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={closeModalAndReset}
        style={styles.modal}
        avoidKeyboard={true}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.modalContent}>
            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
            <Text style={styles.modalTitle}>새 프로필 만들기</Text>
            <Text style={styles.modalSubtitle}>
              가족 구성원을 위한 새 프로필을 만들어보세요.
            </Text>

          {/* 아바타 선택 - 숨김 처리 */}
          {false && (
            <>
              <Text style={styles.inputLabel}>아바타</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                  source={
                    avatarUrl
                      ? { uri: avatarUrl }
                      : require('../../assets/default-avatar.png')
                  }
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    marginRight: 12,
                  }}
                />
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity style={styles.avatarButton} onPress={takePhoto}>
                    <Text style={styles.avatarButtonText}>카메라</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.avatarButton} onPress={pickImage}>
                    <Text style={styles.avatarButtonText}>갤러리</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          {/* 프로필 이름 */}
          <Text style={styles.inputLabel}>프로필 이름</Text>
          <TextInput
            style={styles.input}
            placeholder="이름을 입력하세요"
            value={profileName}
            onChangeText={setProfileName}
            autoCapitalize="words"
            autoCorrect={false}
          />

          {/* 성별 선택 */}
          <Text style={styles.inputLabel}>성별</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[
                styles.typeCard,
                gender === 'MALE' && styles.typeCardActive,
              ]}
              onPress={() => setGender('MALE')}
            >
              <Text style={styles.emoji}>👦</Text>
              <Text style={styles.typeText}>남자</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeCard,
                gender === 'FEMALE' && styles.typeCardActive,
              ]}
              onPress={() => setGender('FEMALE')}
            >
              <Text style={styles.emoji}>👧</Text>
              <Text style={styles.typeText}>여자</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>생년월일 (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 20180512 → 2018-05-12"
            value={birthDate}
            onChangeText={handleBirthDateChange}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="numeric"
            maxLength={10}
          />

          {/* 프로필 유형 */}
          <Text style={styles.inputLabel}>프로필 유형</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[
                styles.typeCard,
                profileType === '아이' && styles.typeCardActive,
              ]}
              onPress={() => setProfileType('아이')}
            >
              <Text style={styles.emoji}>👶</Text>
              <Text style={styles.typeText}>아이</Text>
              <Text style={styles.typeDesc}>재미있게 배워요</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeCard,
                profileType === '부모' && styles.typeCardActive,
              ]}
              onPress={() => setProfileType('부모')}
            >
              <Text style={styles.emoji}>👩‍👩‍👧‍👦</Text>
              <Text style={styles.typeText}>부모</Text>
              <Text style={styles.typeDesc}>체계적인 관리</Text>
            </TouchableOpacity>
          </View>

          {/* PIN 입력창: 부모 선택 시에만 노출 */}
          {profileType === '부모' && (
            <>
              <Text style={styles.inputLabel}>PIN 비밀번호 (4자리 숫자)</Text>
              <TextInput
                style={styles.input}
                placeholder="숫자 4자리 입력"
                value={pin}
                onChangeText={setPin}
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
              />
            </>
          )}

            {/* 버튼 영역 */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeModalAndReset}
              >
                <Text style={styles.cancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !(
                    profileName &&
                    profileType &&
                    gender &&
                    (profileType === '아이' ||
                      (profileType === '부모' && pin.length === 4))
                  ) && { opacity: 0.5 },
                ]}
                disabled={
                  !(
                    profileName &&
                    profileType &&
                    gender &&
                    (profileType === '아이' ||
                      (profileType === '부모' && pin.length === 4))
                  )
                }
                onPress={handleAddProfile}
              >
                <Text style={styles.confirmText}>프로필 만들기</Text>
              </TouchableOpacity>
            </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* PIN 입력 모달 */}
      <Modal
        isVisible={isPinModalVisible}
        onBackdropPress={() => setPinModalVisible(false)}
      >
        <View style={styles.pinModalContent}>
          <Text style={styles.pinModalTitle}>부모 프로필 인증</Text>
          <Text style={styles.pinModalSubtitle}>PIN 입력</Text>
          <Text style={styles.pinModalDesc}>
            {selectedProfile?.name} 프로필에 접근하려면 PIN을 입력하세요
          </Text>

          {/* PIN 표시칸 */}
          <View style={styles.pinRow}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={styles.pinBox}>
                <Text style={styles.pinText}>{pinInput[i] ? '●' : ''}</Text>
              </View>
            ))}
          </View>

          {pinError ? <Text style={styles.pinError}>{pinError}</Text> : null}

          {/* 숫자 키패드 */}
          <View style={styles.keypad}>
            {[
              ['1', '2', '3'],
              ['4', '5', '6'],
              ['7', '8', '9'],
              ['', '0', '⌫'],
            ].map((row, rowIndex) => (
              <View key={rowIndex} style={styles.keypadRow}>
                {row.map((key) => {
                  if (key === '') {
                    return <View key="empty" style={styles.keypadButton} />;
                  }
                  if (key === '⌫') {
                    return (
                      <TouchableOpacity
                        key="del"
                        style={styles.keypadButton}
                        onPress={handlePinDelete}
                      >
                        <Text style={styles.keypadText}>⌫</Text>
                      </TouchableOpacity>
                    );
                  }
                  return (
                    <TouchableOpacity
                      key={key}
                      style={styles.keypadButton}
                      onPress={() => handlePinKeypad(key)}
                    >
                      <Text style={styles.keypadText}>{key}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.pinCancelButton}
            onPress={() => setPinModalVisible(false)}
          >
            <Text style={styles.pinCancelText}>취소</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 24,
    justifyContent: 'center',
  },
  logout: { position: 'absolute', top: 40, right: 20 },
  logoutText: { color: '#60a5fa', fontSize: 14 },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  profileRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  profileCard: {
    borderRadius: 16,
    paddingVertical: 10,
    marginVertical: 6,
    alignItems: 'center',
  },
  emoji: { fontSize: 40, marginBottom: 8 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  role: { fontSize: 14, color: '#e5e7eb' },
  addCard: {
    borderWidth: 1,
    borderColor: '#444',
    backgroundColor: 'transparent',
  },
  addText: { fontSize: 32, color: '#9ca3af', marginBottom: 8 },
  footer: { textAlign: 'center', color: '#9ca3af', marginTop: 30 },

  // 모달
  modal: {
    margin: 16,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: '85%', // 모달 최대 높이 제한
  },
  modalScrollView: {
    flexGrow: 0, // ScrollView가 무한 확장되지 않도록
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 10, // 버튼 영역을 위한 여백 조정
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  modalSubtitle: { fontSize: 14, color: '#555', marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  typeCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  typeCardActive: { borderColor: '#6366f1', backgroundColor: '#eef2ff' },
  typeText: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  typeDesc: { fontSize: 12, color: '#555' },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    paddingTop: 10,
  },
  cancelButton: { padding: 12, marginRight: 8 },
  cancelText: { color: '#555', fontWeight: 'bold' },
  confirmButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  confirmText: { color: '#fff', fontWeight: 'bold' },
  avatarButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  avatarButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // PIN 모달 스타일
  pinModalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  pinModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pinModalSubtitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  pinModalDesc: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
  },
  pinRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
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
  pinText: {
    fontSize: 20,
  },
  pinError: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  keypad: {
    marginBottom: 20,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  keypadButton: {
    width: 60,
    height: 60,
    margin: 8,
    borderRadius: 30,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  pinCancelButton: {
    padding: 12,
  },
  pinCancelText: {
    color: '#555',
    fontWeight: 'bold',
  },
});
