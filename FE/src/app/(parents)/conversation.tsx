import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import {
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../domains/user/hooks/useAuth';
import { useSelectedProfile } from '../../domains/user/models/user';
import { tokenUtils } from '../../shared/utils/token';
import { profileApi } from '../../domains/user/api/userApi';
import { conversationApi } from '../../domains/conversation/api/conversationApi';
import { mediaApi } from '../../shared/api/mediaApi';
import { aiApi } from '../../shared/api/aiApi';
import { SpeechRecognition } from '../../shared/components/SpeechRecognition';

// 메시지 타입 정의
type TextMessage = {
  id: string;
  sender: 'user' | 'pai';
  text: string;
};

type ImageMessage = {
  id: string;
  sender: 'user' | 'pai';
  image: string;
};

type Message = TextMessage | ImageMessage;

// 대화 데이터 타입 (conversation-service 형식에 맞춤)
type ConversationQuestion = {
  questionText: string;
  answerText: string;
  vqaDirectAnswer?: string;
  questionOrder: number;
  createdAt: string;
  answer: {
    answerText: string;
    vqaDirectAnswer?: string;
    createdAt: string;
  };
};

export default function ParentConversationPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageS3Url, setSelectedImageS3Url] = useState<string | null>(
    null,
  );
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [input, setInput] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showSpeechModal, setShowSpeechModal] = useState(false);
  const [questions, setQuestions] = useState<ConversationQuestion[]>([]); // 대화 데이터 저장
  const [conversationTitle, setConversationTitle] = useState<string>(''); // AI가 분석한 카테고리 제목
  const router = useRouter();
  const { accessToken, user } = useAuth();
  const selectedProfile = useSelectedProfile();
  const [hasVoiceProfile, setHasVoiceProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // 카테고리를 한국어 제목으로 변환하는 함수
  const getCategoryTitle = (category: string): string => {
    const categoryMap: { [key: string]: string } = {
      scissors: '가위',
      donut: '도넛',
      fan: '선풍기',
      sandwich: '샌드위치',
      car: '자동차',
      dog: '강아지',
      cat: '고양이',
      book: '책',
      phone: '전화기',
      computer: '컴퓨터',
      flower: '꽃',
      tree: '나무',
      house: '집',
      ball: '공',
      toy: '장난감',
      food: '음식',
      animal: '동물',
      vehicle: '탈것',
      tool: '도구',
      furniture: '가구',
      clothing: '옷',
      electronics: '전자제품',
      nature: '자연',
      sport: '운동',
    };

    return categoryMap[category.toLowerCase()] || category;
  };

  // 키보드 이벤트 리스너
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
      },
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      },
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // 현재 사용자가 음성 프로필을 가지고 있는지 확인
  useEffect(() => {
    const checkVoiceProfile = async () => {
      if (accessToken) {
        const tokenData = tokenUtils.decodeToken(accessToken);
        if (tokenData && tokenData.profile_type === 'PARENT') {
          try {
            // 실제 프로필 API를 호출해서 voice_media_id가 있는지 확인
            const profiles = await profileApi.getAllProfiles();
            const currentProfile = profiles.find(
              (p) =>
                p.profile_id.toString() === tokenData.profile_id?.toString() &&
                p.profile_type === 'PARENT',
            );

            console.log('현재 프로필 음성 등록 상태:', {
              currentProfile: currentProfile,
              hasVoice: !!currentProfile?.voice_media_id,
            });

            setHasVoiceProfile(!!currentProfile?.voice_media_id);
          } catch (error) {
            console.error('프로필 조회 실패:', error);
            setHasVoiceProfile(false);
          }
        }
      }
    };

    checkVoiceProfile();
  }, [accessToken]);

  // 새로운 대화를 위한 상태 초기화
  const resetConversation = () => {
    setStep(1);
    setSelectedImage(null);
    setSelectedImageS3Url(null);
    setMode('text');
    setInput('');
    setRecording(null);
    setMessages([]);
    setQuestions([]);
    setConversationTitle('');
    setShowSpeechModal(false);
    setIsLoading(false);
    console.log('대화 상태 초기화 완료');
  };

  // 카메라
  const handleCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setStep(2);
    }
  };

  // 갤러리
  const handleGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setStep(2);
    }
  };

  // 음성 인식 시작 (네이티브 Speech Recognition 사용)
  const startRecording = async () => {
    if (!hasVoiceProfile) {
      Alert.alert(
        '음성 프로필 필요',
        '음성 기능을 사용하려면 먼저 음성 프로필을 등록해주세요.',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '음성 등록하러 가기',
            onPress: () => router.push('/(parents)/voice-profiles/create'),
          },
        ],
      );
      return;
    }

    // 네이티브 음성 인식 모달 열기
    setShowSpeechModal(true);
  };

  // 음성 인식 중지
  const stopRecording = async () => {
    setShowSpeechModal(false);
  };

  // 음성 인식 결과 처리
  const handleSpeechResult = (text: string) => {
    console.log('음성 인식 결과:', text);
    sendMessage(text);
    setStep(3);
  };

  // 이미지 S3 업로드 (처음 한 번만)
  const uploadImageToS3IfNeeded = async () => {
    if (selectedImageS3Url || !selectedImage) {
      console.log('이미지 업로드 스킵:', { selectedImageS3Url, selectedImage });
      return selectedImageS3Url;
    }

    try {
      console.log('=== 이미지 S3 업로드 시작 ===');
      console.log('선택된 이미지:', selectedImage);
      console.log('액세스 토큰 존재:', !!accessToken);
      setIsLoading(true);

      const uploadResult = await mediaApi.uploadImageToS3(
        selectedImage,
        accessToken || undefined,
      );

      console.log('=== 이미지 S3 업로드 완료 ===');
      console.log('업로드 결과:', uploadResult);

      setSelectedImageS3Url(uploadResult.s3_url);
      return uploadResult.s3_url;
    } catch (uploadError) {
      console.error('=== 이미지 S3 업로드 실패 ===');
      console.error('에러 상세:', uploadError);

      // 에러를 더 구체적으로 표시
      const errorMessage =
        uploadError instanceof Error
          ? uploadError.message
          : '알 수 없는 오류가 발생했습니다.';

      Alert.alert('오류', `이미지 업로드에 실패했습니다: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // 대화 종료 (프로필 타입에 따라 다르게 처리)
  const endConversation = async () => {
    if (questions.length === 0) {
      Alert.alert('알림', '진행 중인 대화가 없습니다.');
      return;
    }

    const tokenData = tokenUtils.decodeToken(accessToken!);
    if (!tokenData?.profile_id) {
      Alert.alert('오류', '프로필 정보를 찾을 수 없습니다.');
      return;
    }

    Alert.alert('대화 종료', '대화를 종료하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '종료',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsLoading(true);

            if (tokenData.profile_type === 'CHILD') {
              // 자녀 프로필: DB에 저장
              console.log('자녀 프로필 - 대화 저장 시작');

              // 1. 대화 시작
              const startResult = await conversationApi.startConversation({
                title:
                  conversationTitle ||
                  (selectedImage ? '이미지 기반 대화' : '일반 대화'),
                initialImageS3Url: selectedImageS3Url || undefined,
                questions: questions,
              });

              console.log('대화 시작 성공:', startResult);

              // 2. 대화 종료 (자동으로 DB 저장)
              await conversationApi.endConversation(startResult.conversationId);

              console.log('대화 저장 완료');
              Alert.alert('완료', '대화가 저장되었습니다.', [
                {
                  text: '새 대화 시작',
                  onPress: () => {
                    resetConversation();
                  },
                },
                {
                  text: '종료',
                  style: 'cancel',
                  onPress: () => router.push('/profile-select'),
                },
              ]);
            } else {
              // 부모 프로필: 자동으로 새 대화 시작
              console.log('부모 프로필 - 자동 새 대화 시작');
              resetConversation();
            }
          } catch (error) {
            console.error('대화 처리 실패:', error);
            Alert.alert('오류', '대화 처리에 실패했습니다.');
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  // VQA API를 사용한 질문 전송
  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text) return;

    // 이미지가 필요한 경우 먼저 업로드
    const imageS3Url = await uploadImageToS3IfNeeded();
    if (selectedImage && !imageS3Url) {
      Alert.alert('오류', '이미지 업로드가 필요합니다.');
      return;
    }

    // 사용자 메시지 추가
    const userMessage: TextMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // VQA API 직접 호출
      const response = await aiApi.sendMessage({
        imageS3Url: imageS3Url || undefined,
        question: text,
        childName: selectedProfile?.name || '아이',
      });

      // 첫 번째 질문이면 카테고리를 title로 설정
      if (questions.length === 0 && response.vqaDirectAnswer) {
        const category = response.vqaDirectAnswer;
        const categoryTitle = getCategoryTitle(category);
        setConversationTitle(categoryTitle);
        console.log('부모용 - 대화 카테고리 설정:', categoryTitle);
      }

      // AI 응답 추가
      const aiMessage: TextMessage = {
        id: Date.now().toString() + '_pai',
        sender: 'pai',
        text: response.text,
      };
      setMessages((prev) => [...prev, aiMessage]);

      // 대화 데이터에 질문-답변 추가
      const questionData: ConversationQuestion = {
        questionText: text,
        answerText: response.text,
        vqaDirectAnswer: response.vqaDirectAnswer,
        questionOrder: questions.length + 1,
        createdAt: new Date().toISOString(),
        answer: {
          answerText: response.text,
          vqaDirectAnswer: response.vqaDirectAnswer,
          createdAt: new Date().toISOString(),
        },
      };

      setQuestions((prev) => [...prev, questionData]);
      console.log('질문-답변 저장됨:', questionData);
    } catch (error) {
      console.error('VQA API 호출 실패:', error);
      // 오류 시 임시 응답
      const errorMessage: TextMessage = {
        id: Date.now().toString() + '_pai',
        sender: 'pai',
        text: '죄송해요, 지금 응답할 수 없어요. 잠시 후 다시 시도해주세요.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }

    setStep(3);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#fff' }}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push('/(parents)/conversation')}
          >
            <ChevronLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PAI와 대화하기</Text>

          {/* 질문이 있는 경우에만 종료 버튼 표시 */}
          {questions.length > 0 ? (
            <TouchableOpacity
              style={styles.endButton}
              onPress={endConversation}
              disabled={isLoading}
            >
              <Text
                style={[styles.endButtonText, isLoading && styles.disabledText]}
              >
                종료
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
      </SafeAreaView>

      {/* 상단 안내 (채팅 들어가면 숨김) */}
      {step !== 3 && (
        <View style={styles.center}>
          <Image
            source={require('../../../assets/mascot.png')}
            style={styles.mascot}
          />
          <Text style={styles.title}>PAI와 함께 알아보세요!</Text>
          <Text style={styles.description}>
            궁금한 것이 있는 사진을 올리고 질문해보세요!
          </Text>
        </View>
      )}

      {/* 단계 표시 */}
      <View style={styles.steps}>
        <Text style={step >= 1 ? styles.stepActive : styles.step}>
          ① 사진 올리기
        </Text>
        <Text style={{ marginHorizontal: 6 }}>──</Text>
        <Text style={step >= 2 ? styles.stepActive : styles.step}>
          ② 질문하기
        </Text>
      </View>

      {/* 단계별 컨텐츠 */}
      {step === 1 && (
        <View style={styles.uploadBox}>
          <Text style={styles.uploadText}>사진을 올려주세요!</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handleCamera}
            >
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.cameraText}>사진 찍기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.galleryButton}
              onPress={handleGallery}
            >
              <Ionicons name="image-outline" size={20} color="#333" />
              <Text style={styles.galleryText}>사진 선택</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 2 && (
        <>
          {selectedImage && (
            <View style={styles.chatBox}>
              <Image source={{ uri: selectedImage }} style={styles.thumbnail} />
              <View style={{ marginLeft: 8 }}>
                <Text style={{ fontWeight: 'bold' }}>
                  사진이 준비되었습니다!
                </Text>
                <Text style={{ color: '#666' }}>이제 질문을 해보세요</Text>
              </View>
            </View>
          )}

          {/* 질문 모드 선택 */}
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'text' && styles.modeActive]}
              onPress={() => setMode('text')}
            >
              <Ionicons name="chatbubble-outline" size={18} color="#fff" />
              <Text style={styles.modeText}>텍스트로 묻기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'voice' && styles.modeActive]}
              onPress={() => setMode('voice')}
            >
              <Ionicons name="mic-outline" size={18} color="#fff" />
              <Text style={styles.modeText}>음성으로 묻기</Text>
            </TouchableOpacity>
          </View>

          {mode === 'text' && (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="사진에 대해 궁금한 것을 물어보세요!"
                value={input}
                onChangeText={setInput}
                onSubmitEditing={() => sendMessage()}
                returnKeyType="send"
                blurOnSubmit={false}
              />
              <TouchableOpacity
                style={[styles.sendButton, isLoading && styles.disabledButton]}
                onPress={() => sendMessage()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Text style={styles.loadingText}>...</Text>
                ) : (
                  <Ionicons name="send" size={18} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          )}

          {mode === 'voice' && (
            <View style={styles.voiceRow}>
              {!recording ? (
                <TouchableOpacity
                  style={styles.recordButton}
                  onPress={startRecording}
                >
                  <Ionicons name="mic-outline" size={22} color="#fff" />
                  <Text style={styles.recordText}>녹음 시작</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.stopButton}
                  onPress={stopRecording}
                >
                  <Ionicons name="stop" size={22} color="#fff" />
                  <Text style={styles.recordText}>녹음 중지</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </>
      )}

      {step === 3 && (
        <View style={{ flex: 1 }}>
          <FlatList
            data={[
              ...(selectedImage
                ? [{ id: 'img', sender: 'user', image: selectedImage }]
                : []),
              ...messages,
            ]}
            keyExtractor={(item) => item.id}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingBottom: keyboardHeight > 0 ? keyboardHeight + 80 : 20,
            }}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.message,
                  item.sender === 'user' ? styles.userMsg : styles.paiMsg,
                ]}
              >
                {'text' in item && (
                  <>
                    {item.sender === 'pai' && (
                      <Image
                        source={require('../../../assets/mascot.png')}
                        style={styles.mascotSmall}
                      />
                    )}
                    <Text style={styles.messageText}>{item.text}</Text>
                  </>
                )}
                {'image' in item && (
                  <Image
                    source={{ uri: item.image }}
                    style={styles.chatImage}
                  />
                )}
              </View>
            )}
            style={{ flex: 1 }}
          />

          {/* 입력창 (추가 이미지 업로드 제거) */}
          <View
            style={[
              styles.chatInputRow,
              keyboardHeight > 0 && {
                position: 'absolute',
                bottom: keyboardHeight - 60,
                left: 16,
                right: 16,
                marginBottom: 0,
              },
            ]}
          >
            <TextInput
              style={styles.chatInput}
              placeholder="무엇이든 물어보세요"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => sendMessage()}
              returnKeyType="send"
              blurOnSubmit={false}
              multiline={false}
            />

            {!input.trim() ? (
              <TouchableOpacity
                style={styles.micButton}
                onPress={startRecording}
              >
                <Ionicons name="mic-outline" size={22} color="#555" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.sendButton, isLoading && styles.disabledButton]}
                onPress={() => sendMessage()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Text style={styles.loadingText}>...</Text>
                ) : (
                  <Ionicons name="send" size={18} color="#fff" />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* 음성 인식 컴포넌트 */}
      <SpeechRecognition
        visible={showSpeechModal}
        onClose={() => setShowSpeechModal(false)}
        onResult={handleSpeechResult}
        language="ko-KR"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  center: { alignItems: 'center', marginBottom: 20 },
  mascot: { width: 80, height: 80, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  description: { fontSize: 14, color: '#666', textAlign: 'center' },
  steps: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  stepActive: { color: '#2563eb', fontWeight: 'bold' },
  step: { color: '#aaa' },
  uploadBox: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  uploadText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginVertical: 12,
  },
  buttonRow: { flexDirection: 'row', marginTop: 10 },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  cameraText: { color: '#fff', marginLeft: 6, fontWeight: 'bold' },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 8,
  },
  galleryText: { color: '#333', marginLeft: 6, fontWeight: 'bold' },
  chatBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  thumbnail: { width: 50, height: 50, borderRadius: 8 },
  modeRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9ca3af',
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 6,
  },
  modeActive: { backgroundColor: '#2563eb' },
  modeText: { color: '#fff', marginLeft: 6, fontWeight: 'bold' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  textInput: { flex: 1, fontSize: 14, paddingHorizontal: 6 },
  sendButton: {
    backgroundColor: '#2563eb',
    padding: 10,
    borderRadius: 20,
    marginLeft: 6,
  },
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'center',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    padding: 10,
    borderRadius: 8,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    padding: 10,
    borderRadius: 8,
  },
  recordText: { color: '#fff', marginLeft: 6, fontWeight: 'bold' },
  message: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 12,
    marginVertical: 6,
  },
  userMsg: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563eb',
  },
  paiMsg: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  mascotSmall: { width: 24, height: 24, marginRight: 6 },
  messageText: { color: '#111' },
  chatImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 0,
    backgroundColor: '#fff',
    minHeight: 50,
  },
  chatInput: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 6,
  },
  micButton: {
    marginLeft: 6,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  endButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  endButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledText: {
    color: '#ccc',
  },
  // Speech Modal 스타일
  speechModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  speechModalCloseButton: {
    padding: 8,
  },
  speechModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});
