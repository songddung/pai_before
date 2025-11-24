import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useState, useEffect } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from '../../domains/user/hooks/useAuth';
import { useSelectedProfile } from '../../domains/user/models/user';
import { tokenUtils } from '../../shared/utils/token';
import { conversationApi } from '../../domains/conversation/api/conversationApi';
import { mediaApi } from '../../shared/api/mediaApi';
import { aiApi } from '../../shared/api/aiApi';
import { tokenStorage } from '../../shared/api/client';
import { SpeechRecognition } from '../../shared/components/SpeechRecognition';
import { profileApi } from '../../domains/user/api/userApi';

// 메시지 타입 정의
type TextMessage = {
  id: string;
  sender: "user" | "pai";
  text: string;
  audioUrl?: string;
};

type ImageMessage = {
  id: string;
  sender: "user" | "pai";
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

export default function QuestionPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageS3Url, setSelectedImageS3Url] = useState<string | null>(null);
  const [mode, setMode] = useState<"text" | "voice">("text");
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showSpeechModal, setShowSpeechModal] = useState(false);
  const [questions, setQuestions] = useState<ConversationQuestion[]>([]); // 대화 데이터 저장
  const [conversationTitle, setConversationTitle] = useState<string>(''); // AI가 분석한 카테고리 제목
  const [isLoading, setIsLoading] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null); // 현재 재생 중인 메시지 ID
  const router = useRouter();
  const { accessToken, user } = useAuth();
  const selectedProfile = useSelectedProfile();

  // 프로필 정보 디버깅
  useEffect(() => {

  }, [selectedProfile]);

  // 토큰 정보 디버깅
  useEffect(() => {
    const checkTokenInfo = async () => {
      const currentToken = await tokenStorage.getAccessToken();
      if (currentToken) {
        const tokenData = tokenUtils.decodeToken(currentToken);

      } else {
      }
    };
    checkTokenInfo();
  }, [accessToken]);

  // 카테고리를 한국어 제목으로 변환하는 함수
  const getCategoryTitle = (category: string): string => {
    const categoryMap: { [key: string]: string } = {
      'scissors': '가위',
      'donut': '도넛',
      'fan': '선풍기',
      'sandwich': '샌드위치',
      'car': '자동차',
      'dog': '강아지',
      'cat': '고양이',
      'book': '책',
      'phone': '전화기',
      'computer': '컴퓨터',
      'flower': '꽃',
      'tree': '나무',
      'house': '집',
      'ball': '공',
      'toy': '장난감',
      'food': '음식',
      'animal': '동물',
      'vehicle': '탈것',
      'tool': '도구',
      'furniture': '가구',
      'clothing': '옷',
      'electronics': '전자제품',
      'nature': '자연',
      'sport': '운동',
      // 필요에 따라 더 추가 가능
    };

    return categoryMap[category.toLowerCase()] || category;
  };

  // 최신 토큰 가져오기 함수
  const getLatestToken = async (): Promise<string | null> => {
    try {
      return await tokenStorage.getAccessToken();
    } catch (error) {
      return accessToken;
    }
  };

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
    setIsLoading(false);
  };

  // 이미지 S3 업로드 제거 - 목데이터 사용
  const uploadImageToS3IfNeeded = async () => {
    // 이미지 업로드 없이 로컬 이미지 URL만 반환
    return selectedImage;
  };

  // 대화 종료 및 저장 (자녀는 항상 DB에 저장)
  const endConversation = async () => {
    if (questions.length === 0) {
      Alert.alert('알림', '진행 중인 대화가 없습니다.');
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
            const latestToken = await getLatestToken();
            const tokenData = tokenUtils.decodeToken(latestToken!);
     

            // 1. 대화 시작
            const startResult = await conversationApi.startConversation({
              title: conversationTitle || (selectedImage ? '이미지 기반 대화' : '일반 대화'),
              initialImageS3Url: selectedImageS3Url || undefined,
              questions: questions,
            });


            // 2. 대화 종료 (자동으로 DB 저장)
            const endResult = await conversationApi.endConversation(startResult.conversationId);

            Alert.alert('완료', '대화가 저장되었어요! 새로운 대화를 시작할게요.', [
              {
                text: '확인',
                onPress: () => {
                  resetConversation();
                }
              },
            ]);
          } catch (error) {
            Alert.alert('오류', '대화 저장에 실패했어요.');
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
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

  // 음성 인식 시작
  const startRecording = async () => {
    setShowSpeechModal(true);
  };

  // 음성 인식 중지
  const stopRecording = async () => {
    setShowSpeechModal(false);
  };

  // 음성 인식 결과 처리
  const handleSpeechResult = (text: string) => {
    sendMessage(text);
    setStep(3);
  };

  // TTS 버튼 클릭 핸들러
  const handleTTSClick = async (messageId: string, text: string) => {
    if (playingAudio === messageId) {
      // 이미 재생 중이면 중지
      setPlayingAudio(null);
      return;
    }

    try {
      setPlayingAudio(messageId);

      const loginResponse = await fetch('http://darami.life:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'yjstar2@naver.com',
          password: 'yujin0703'
        }),
      });

      const loginText = await loginResponse.text();
      const loginData = JSON.parse(loginText);
      const loginToken = loginData.data.accessToken;

      const profileResponse = await fetch('http://darami.life:3001/api/profiles/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginToken}`,
        },
        body: JSON.stringify({
          profileId: '2',
        }),
      });

      const profileText = await profileResponse.text();
      const profileData = JSON.parse(profileText);
      const profileToken = profileData.data.accessToken;

      const response = await fetch('http://darami.life:3001/api/profiles/4/voice/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${profileToken}`,
        },
        body: JSON.stringify({
          text: text,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TTS API 오류: ${response.status} - ${errorText}`);
      }

      const audioBlob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);

      reader.onloadend = async () => {
        const base64Audio = reader.result as string;

        setMessages(prev => prev.map(msg =>
          msg.id === messageId && 'text' in msg
            ? { ...msg, audioUrl: base64Audio }
            : msg
        ));

        try {
          const { sound } = await Audio.Sound.createAsync(
            { uri: base64Audio },
            { shouldPlay: true }
          );

          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              setPlayingAudio(null);
              sound.unloadAsync();
            }
          });
        } catch (playError: any) {
          setPlayingAudio(null);
        }
      };

    } catch (error: any) {
      setPlayingAudio(null);
    }
  };

  // 목데이터를 사용한 질문 전송 (자녀용)
  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text) return;

    // 사용자 메시지 추가
    const userMessage: TextMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // 목데이터 응답 생성
    setTimeout(() => {
      let mockResponse = '';

      // "이게 뭐야" 질문에 대한 목데이터 답변
      if (text.includes('이게 뭐야') || text.includes('뭐야') || text.includes('무엇') || text.includes('뭔가')) {
        mockResponse = '이건 귀여운 돼지예요! 지금 트램펄린이라는 재미있는 놀이기구 위에서 신나게 점프를 하고 있어요. 트램펄린은 탄력이 있는 천으로 만들어져서 폴짝폴짝 높이 뛸 수 있답니다. 돼지가 정말 즐거워 보이죠?';
      } else {
        // 기타 질문에 대한 일반 답변
        mockResponse = '좋은 질문이에요! 사진을 보니 정말 재미있는 것 같아요. 더 궁금한 게 있으면 물어봐 주세요!';
      }

      // AI 응답 추가
      const aiMessage: TextMessage = {
        id: Date.now().toString() + "_pai",
        sender: "pai",
        text: mockResponse,
      };
      setMessages((prev) => [...prev, aiMessage]);

      // 대화 데이터에 질문-답변 추가
      const questionData: ConversationQuestion = {
        questionText: text,
        answerText: mockResponse,
        vqaDirectAnswer: undefined,
        questionOrder: questions.length + 1,
        createdAt: new Date().toISOString(),
        answer: {
          answerText: mockResponse,
          vqaDirectAnswer: undefined,
          createdAt: new Date().toISOString(),
        },
      };

      setQuestions((prev) => [...prev, questionData]);
      setIsLoading(false);
    }, 1000); // 1초 지연으로 실제 API 호출처럼 보이게

    setStep(3);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={styles.container}>
        <SafeAreaView edges={["top"]} style={{ backgroundColor: "#fff" }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.replace("/profile-select")}>
              <ChevronLeft size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>질문하기</Text>

          {/* 질문이 있는 경우에만 종료 버튼 표시 - 오른쪽 배치 */}
          {questions.length > 0 && (
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
          )}
        </View>
      </SafeAreaView>

      {/* 상단 안내 (채팅 들어가면 숨김) */}
      {step !== 3 && (
        <View style={styles.center}>
          <Image
            source={require("../../../assets/mascot.png")}
            style={styles.mascot}
          />
          <Text style={styles.title}>PAI와 함께 알아보자!</Text>
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
                <Text style={{ fontWeight: "bold" }}>사진이 준비되었어요!</Text>
                <Text style={{ color: "#666" }}>이제 질문을 해보세요</Text>
              </View>
            </View>
          )}

          {/* 질문 모드 선택 */}
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeButton, mode === "text" && styles.modeActive]}
              onPress={() => setMode("text")}
            >
              <Ionicons name="chatbubble-outline" size={18} color="#fff" />
              <Text style={styles.modeText}>글자로 묻기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, mode === "voice" && styles.modeActive]}
              onPress={() => setMode("voice")}
            >
              <Ionicons name="mic-outline" size={18} color="#fff" />
              <Text style={styles.modeText}>말로 묻기</Text>
            </TouchableOpacity>
          </View>

          {mode === "text" && (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="사진에 대해 궁금한 것을 물어보세요!"
                value={input}
                onChangeText={setInput}
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

          {mode === "voice" && (
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
                ? [{ id: "img", sender: "user", image: selectedImage }]
                : []),
              ...messages,
            ]}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.message,
                  item.sender === "user" ? styles.userMsg : styles.paiMsg,
                ]}
              >
                {"text" in item && (
                  <>
                    {item.sender === "pai" ? (
                      <>
                        <Image
                          source={require("../../../assets/mascot.png")}
                          style={styles.mascotSmall}
                        />
                        <View style={styles.messageContent}>
                          <Text style={styles.messageText}>
                            {item.text}
                          </Text>
                          <TouchableOpacity
                            style={styles.ttsButton}
                            onPress={() => handleTTSClick(item.id, item.text)}
                            disabled={playingAudio !== null && playingAudio !== item.id}
                          >
                            <Ionicons
                              name={playingAudio === item.id ? "stop" : "volume-high"}
                              size={16}
                              color={playingAudio === item.id ? "#ef4444" : "#6366f1"}
                            />
                          </TouchableOpacity>
                        </View>
                      </>
                    ) : (
                      <Text style={[styles.messageText, { color: "#fff", flexShrink: 1 }]}>
                        {item.text}
                      </Text>
                    )}
                  </>
                )}
                {"image" in item && (
                  <Image
                    source={{ uri: item.image }}
                    style={styles.chatImage}
                  />
                )}
              </View>
            )}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            removeClippedSubviews={false}
            keyboardShouldPersistTaps="handled"
          />

          {/* 입력창 (추가 이미지 업로드 제거) */}
          <View style={styles.chatInputRow}>
            <TextInput
              style={styles.chatInput}
              placeholder="무엇이든 물어보세요"
              value={input}
              onChangeText={setInput}
            />

            {!input.trim() ? (
              <TouchableOpacity style={styles.micButton} onPress={startRecording}>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 10, flex: 1 },
  center: { alignItems: "center", marginBottom: 20 },
  mascot: { width: 80, height: 80, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 6 },
  description: { fontSize: 14, color: "#666", textAlign: "center" },
  steps: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
  stepActive: { color: "#ec4899", fontWeight: "bold" },
  step: { color: "#aaa" },
  uploadBox: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  uploadText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    marginVertical: 12,
  },
  buttonRow: { flexDirection: "row", marginTop: 10 },
  cameraButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ec4899",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  cameraText: { color: "#fff", marginLeft: 6, fontWeight: "bold" },
  galleryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    padding: 10,
    borderRadius: 8,
  },
  galleryText: { color: "#333", marginLeft: 6, fontWeight: "bold" },
  chatBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  thumbnail: { width: 50, height: 50, borderRadius: 8 },
  modeRow: { flexDirection: "row", justifyContent: "center", marginBottom: 12 },
  modeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#9ca3af",
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 6,
  },
  modeActive: { backgroundColor: "#ec4899" },
  modeText: { color: "#fff", marginLeft: 6, fontWeight: "bold" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  textInput: { flex: 1, fontSize: 14, paddingHorizontal: 6 },
  sendButton: {
    backgroundColor: "#ec4899",
    padding: 10,
    borderRadius: 20,
    marginLeft: 6,
  },
  voiceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "center",
  },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    padding: 10,
    borderRadius: 8,
  },
  stopButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    padding: 10,
    borderRadius: 8,
  },
  recordText: { color: "#fff", marginLeft: 6, fontWeight: "bold" },
  message: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 12,
    marginVertical: 6,
  },
  userMsg: {
    alignSelf: "flex-end",
    backgroundColor: "#ec4899",
  },
  paiMsg: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f5f9",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  mascotSmall: { width: 24, height: 24, marginRight: 6, marginTop: 2 },
  messageContent: {
    flex: 1,
  },
  messageText: {
    color: "#111",
    lineHeight: 20,
    fontSize: 14,
    flexWrap: 'wrap',
  },
  ttsButton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 16,
    padding: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  chatImage: {
    width: 200,
    height: 300,
    borderRadius: 12,
  },
  chatInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
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
    backgroundColor: "#9ca3af",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  endButton: {
    backgroundColor: "#ec4899",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  endButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  disabledText: {
    color: "#ccc",
  },
});
