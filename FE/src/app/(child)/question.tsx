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
    console.log('Question 페이지 - 프로필 상태 변경:', {
      selectedProfile,
      profileId: selectedProfile?.profile_id,
      profileName: selectedProfile?.name,
      profileType: selectedProfile?.profile_type,
      hasVoiceMediaId: !!selectedProfile?.voice_media_id,
    });
  }, [selectedProfile]);

  // 토큰 정보 디버깅
  useEffect(() => {
    const checkTokenInfo = async () => {
      const currentToken = await tokenStorage.getAccessToken();
      if (currentToken) {
        const tokenData = tokenUtils.decodeToken(currentToken);
        console.log('Question 페이지 - 현재 토큰 정보:', {
          hasToken: !!currentToken,
          tokenLength: currentToken?.length,
          profile_id: tokenData?.profile_id,
          profile_name: tokenData?.profile_name,
          profile_type: tokenData?.profile_type,
        });
      } else {
        console.log('Question 페이지 - 토큰 없음');
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
      console.error('토큰 가져오기 실패:', error);
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
    console.log('자녀용 - 대화 상태 초기화 완료');
  };

  // 이미지 S3 업로드 (처음 한 번만)
  const uploadImageToS3IfNeeded = async () => {
    if (selectedImageS3Url || !selectedImage) {
      return selectedImageS3Url;
    }

    try {
      console.log('자녀용 - 이미지 S3 업로드 시작:', selectedImage);
      setIsLoading(true);

      const latestToken = await getLatestToken();
      const uploadResult = await mediaApi.uploadImageToS3(
        selectedImage,
        latestToken || undefined,
      );
      setSelectedImageS3Url(uploadResult.s3_url);
      console.log('자녀용 - 이미지 S3 업로드 완료:', uploadResult.s3_url);
      return uploadResult.s3_url;
    } catch (uploadError) {
      console.error('자녀용 - 이미지 S3 업로드 실패:', uploadError);
      Alert.alert('오류', '이미지 업로드에 실패했습니다.');
      return null;
    } finally {
      setIsLoading(false);
    }
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
            console.log('자녀 프로필 - 대화 저장 시작', {
              profileType: tokenData?.profile_type,
              profileId: tokenData?.profile_id,
              questionsCount: questions.length,
              questions: questions
            });

            // 1. 대화 시작
            const startResult = await conversationApi.startConversation({
              title: conversationTitle || (selectedImage ? '이미지 기반 대화' : '일반 대화'),
              initialImageS3Url: selectedImageS3Url || undefined,
              questions: questions,
            });

            console.log('자녀용 - 대화 시작 성공:', startResult);

            // 2. 대화 종료 (자동으로 DB 저장)
            const endResult = await conversationApi.endConversation(startResult.conversationId);

            console.log('자녀용 - 대화 종료 결과:', endResult);
            console.log('자녀용 - 대화 저장 완료');
            Alert.alert('완료', '대화가 저장되었어요! 새로운 대화를 시작할게요.', [
              {
                text: '확인',
                onPress: () => {
                  resetConversation();
                }
              },
            ]);
          } catch (error) {
            console.error('자녀용 - 대화 처리 실패:', error);
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
    console.log('자녀용 - 음성 인식 결과:', text);
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
      console.log('TTS 변환 시작:', { messageId, text });

      // AI 서비스 직접 TTS 호출

      // 최신 토큰에서 사용자 정보 추출
      const latestToken = await getLatestToken();
      const tokenData = tokenUtils.decodeToken(latestToken!);
      const accountId = tokenData?.sub || user?.userId || '1';

      // voice_media_id 가져오기
      console.log('현재 선택된 프로필 전체:', selectedProfile);
      console.log('현재 선택된 프로필 voice_media_id:', selectedProfile?.voice_media_id);
      console.log('현재 선택된 프로필 타입:', selectedProfile?.profile_type);

      let profileId = selectedProfile?.voice_media_id;

      // voice_media_id가 없는 경우 (아이 프로필이거나 부모 프로필인데 voice_media_id가 없는 경우), 부모 프로필에서 찾기
      if (!profileId) {
        console.log('현재 프로필에 voice_media_id가 없음. 부모 프로필 조회 시작');
        try {
          const allProfiles = await profileApi.getAllProfiles();
          console.log('조회된 모든 프로필:', allProfiles);
          console.log('조회된 프로필 개수:', allProfiles.length);

          // 각 프로필의 상세 정보 로그
          allProfiles.forEach((profile, index) => {
            console.log(`프로필 ${index + 1}:`, {
              profile_id: profile.profile_id,
              name: profile.name,
              profile_type: profile.profile_type,
              voice_media_id: profile.voice_media_id,
              hasVoiceMediaId: !!profile.voice_media_id
            });
          });

          // 부모 프로필 중 voice_media_id가 있는 것 찾기
          const parentProfiles = allProfiles.filter(profile => profile.profile_type === 'PARENT');
          console.log('부모 프로필들:', parentProfiles);

          const parentProfile = parentProfiles.find(profile => profile.voice_media_id);
          console.log('voice_media_id가 있는 부모 프로필:', parentProfile);

          if (parentProfile?.voice_media_id) {
            profileId = parentProfile.voice_media_id;
            console.log('부모 프로필에서 voice_media_id 찾음:', profileId);
          } else {
            console.log('부모 프로필에도 voice_media_id가 없음');
            console.log('전체 부모 프로필 voice_media_id 상태:',
              parentProfiles.map(p => ({ name: p.name, voice_media_id: p.voice_media_id }))
            );
            Alert.alert('알림', '음성 프로필이 등록되지 않았습니다. 부모 프로필에서 음성을 먼저 등록해주세요.');
            setPlayingAudio(null);
            return;
          }
        } catch (error) {
          console.error('부모 프로필 조회 실패:', error);
          Alert.alert('오류', '음성 프로필을 가져오는데 실패했습니다.');
          setPlayingAudio(null);
          return;
        }
      }

      if (!profileId) {
        console.log('음성 프로필이 없음');
        Alert.alert('알림', '음성 프로필이 등록되지 않았습니다. 부모 프로필에서 음성을 먼저 등록해주세요.');
        setPlayingAudio(null);
        return;
      }

      console.log('TTS 요청 정보:', {
        accountId,
        profileId,
        selectedProfile
      });

      // TTS API 호출
      const ttsResponse = await aiApi.textToSpeech({
        text: text,
        account_id: accountId,
        profile_id: profileId,
      });

      console.log('TTS 변환 완료:', ttsResponse);

      // 메시지에 audioUrl 추가
      setMessages(prev => prev.map(msg =>
        msg.id === messageId && 'text' in msg
          ? { ...msg, audioUrl: ttsResponse.audio_url }
          : msg
      ));

      // 오디오 재생
      if (ttsResponse.audio_url) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: ttsResponse.audio_url },
          { shouldPlay: true }
        );

        // 재생 완료 시 상태 초기화
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setPlayingAudio(null);
            sound.unloadAsync();
            // Data URI는 메모리 해제 불필요
          }
        });
      }

    } catch (error) {
      console.error('TTS 변환 실패:', error);
      Alert.alert('오류', 'TTS 변환에 실패했습니다.');
      setPlayingAudio(null);
    }
  };

  // VQA API를 사용한 질문 전송 (자녀용)
  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text) return;

    // 이미지가 필요한 경우 먼저 업로드
    const imageS3Url = await uploadImageToS3IfNeeded();
    if (selectedImage && !imageS3Url) {
      Alert.alert('오류', '이미지 업로드가 필요해요.');
      return;
    }

    // 사용자 메시지 추가
    const userMessage: TextMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // 최신 토큰에서 직접 이름 추출
      const latestToken = await getLatestToken();
      const tokenData = tokenUtils.decodeToken(latestToken!);
      const childName = tokenData?.profile_name || selectedProfile?.name || '아이';

      console.log('자녀용 - 전송할 프로필 정보:', {
        tokenData: tokenData,
        profileNameFromToken: tokenData?.profile_name,
        selectedProfile: selectedProfile,
        profileNameFromStore: selectedProfile?.name,
        finalChildName: childName
      });

      // VQA API 직접 호출
      const response = await aiApi.sendMessage({
        imageS3Url: imageS3Url || undefined,
        question: text,
        childName: childName,
      });

      // 첫 번째 질문이면 카테고리를 title로 설정
      if (questions.length === 0 && response.vqaDirectAnswer) {
        const category = response.vqaDirectAnswer;
        const categoryTitle = getCategoryTitle(category);
        setConversationTitle(categoryTitle);
        console.log('자녀용 - 대화 카테고리 설정:', categoryTitle);
      }

      // AI 응답 추가
      const aiMessage: TextMessage = {
        id: Date.now().toString() + "_pai",
        sender: "pai",
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
      console.log('자녀용 - 질문-답변 저장됨:', questionData);

    } catch (error) {
      console.error('자녀용 - VQA API 호출 실패:', error);
      // 오류 시 친근한 응답
      const errorMessage: TextMessage = {
        id: Date.now().toString() + "_pai",
        sender: "pai",
        text: "미안해, 지금 대답하기 어려워. 조금 후에 다시 물어봐줄래? 😅",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }

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
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 10 },
  center: { alignItems: "center", marginBottom: 20 },
  mascot: { width: 80, height: 80, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 6 },
  description: { fontSize: 14, color: "#666", textAlign: "center" },
  steps: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
  stepActive: { color: "#2563eb", fontWeight: "bold" },
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
    height: 200,
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
    backgroundColor: "#ef4444",
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
