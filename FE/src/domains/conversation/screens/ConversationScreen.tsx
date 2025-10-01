import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";
import {
  FlatList,
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { speechService } from '../../../shared/services/speechService';

// 메시지 타입 정의
type TextMessage = {
  id: string;
  sender: "user" | "pai";
  text: string;
};

type ImageMessage = {
  id: string;
  sender: "user" | "pai";
  image: string;
};

type Message = TextMessage | ImageMessage;

export default function QuestionPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mode, setMode] = useState<"text" | "voice">("text");
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const navigation = useNavigation();

  // 키보드 이벤트 리스너
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // 카메라
  const handleCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setStep(2);
    }
  };

  // 갤러리
  const handleGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setStep(2);
    }
  };

  // 녹음 시작
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
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

  // 녹음 종료 | Whisper 전사
  const stopRecording = async () => {
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);

    if (!uri) return;

    try {
      const formData = new FormData();
      formData.append("file", {
        uri,
        type: "audio/m4a",
        name: "recording.m4a",
      } as any);
      formData.append("model", "whisper-1");

      const response = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      const transcript = data.text as string;

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), sender: "user", text: transcript },
        {
          id: Date.now().toString() + "_pai",
          sender: "pai",
          text: "네 질문을 잘 들었어! 내가 설명해줄게 🙌",
        },
      ]);
      setStep(3);
    } catch (err) {
      console.error("전사 실패:", err);
    }
  };

  // 텍스트 질문 전송
  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: "user", text: input.trim() },
    ]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "_pai",
          sender: "pai",
          text: "좋은 질문이야! 내가 설명해줄게 🙌",
        },
      ]);
    }, 500);

    setStep(3);
  };

  return (
    <View style={styles.container}>
        <SafeAreaView edges={["top"]} style={{ backgroundColor: "#fff" }}>
          <View style={styles.header}>
            <TouchableOpacity
              style={{ padding: 3 }}
              onPress={() => navigation.navigate("ProfileSelection" as never)}
            >
              <Ionicons name="chevron-back" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>질문하기</Text>
          </View>
        </SafeAreaView>

      {/* 상단 안내 (채팅 들어가면 숨김) */}
      {step !== 3 && (
        <View style={styles.center}>
          <Image
            source={require("../../../../assets/mascot.png")}
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
                onSubmitEditing={sendMessage}
                returnKeyType="send"
                blurOnSubmit={false}
              />
              <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                <Ionicons name="send" size={18} color="#fff" />
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
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingBottom: keyboardHeight > 0 ? keyboardHeight + 80 : 20
            }}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.message,
                  item.sender === "user" ? styles.userMsg : styles.paiMsg,
                ]}
              >
                {"text" in item && (
                  <>
                    {item.sender === "pai" && (
                      <Image
                        source={require("../../../../assets/mascot.png")}
                        style={styles.mascotSmall}
                      />
                    )}
                    <Text style={styles.messageText}>{item.text}</Text>
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
          />

          {/* 입력창 */}
          <View style={[
            styles.chatInputRow,
            keyboardHeight > 0 && {
              position: 'absolute',
              bottom: keyboardHeight - 60,
              left: 16,
              right: 16,
              marginBottom: 0
            }
          ]}>
            <TouchableOpacity style={styles.plusButton}>
              <Ionicons name="add" size={22} color="#555" />
            </TouchableOpacity>

            <TextInput
              style={styles.chatInput}
              placeholder="무엇이든 물어보세요"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              blurOnSubmit={false}
              multiline={false}
            />

            {!input.trim() ? (
              <TouchableOpacity style={styles.micButton}>
                <Ionicons name="mic-outline" size={22} color="#555" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                <Ionicons name="send" size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
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
    backgroundColor: "#3b82f6",
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
  modeActive: { backgroundColor: "#3b82f6" },
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
    backgroundColor: "#3b82f6",
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
    backgroundColor: "#3b82f6",
  },
  paiMsg: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f5f9",
    flexDirection: "row",
    alignItems: "center",
  },
  mascotSmall: { width: 24, height: 24, marginRight: 6 },
  messageText: { color: "#111" },
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
    marginBottom: 0,
    backgroundColor: "#fff",
    minHeight: 50,
  },
  plusButton: {
    marginRight: 6,
  },
  chatInput: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 6,
  },
  micButton: {
    marginLeft: 6,
  },
});