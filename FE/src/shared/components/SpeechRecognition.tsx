import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

interface SpeechRecognitionProps {
  visible: boolean;
  onClose: () => void;
  onResult: (text: string) => void;
  language?: string;
}

export const SpeechRecognition: React.FC<SpeechRecognitionProps> = ({
  visible,
  onClose,
  onResult,
  language = 'ko-KR'
}) => {
  const [isListening, setIsListening] = useState(false);

  const speechHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>음성 인식</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f8f9fa;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .container {
            text-align: center;
            max-width: 400px;
            width: 100%;
        }
        .mic-button {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            border: none;
            background: #007AFF;
            color: white;
            font-size: 40px;
            cursor: pointer;
            margin: 20px 0;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }
        .mic-button:hover {
            background: #0056CC;
        }
        .mic-button.listening {
            background: #FF3B30;
            animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        .status {
            font-size: 18px;
            margin: 20px 0;
            color: #333;
        }
        .result {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            min-height: 60px;
            border: 1px solid #e0e0e0;
            font-size: 16px;
            line-height: 1.5;
        }
        .error {
            color: #FF3B30;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>음성을 말해주세요</h2>

        <button id="micButton" class="mic-button">
            🎤
        </button>

        <div id="status" class="status">마이크 버튼을 눌러주세요</div>

        <div id="result" class="result">
            <em>여기에 인식된 텍스트가 표시됩니다</em>
        </div>
    </div>

    <script>
        let recognition = null;
        let isListening = false;

        const micButton = document.getElementById('micButton');
        const status = document.getElementById('status');
        const result = document.getElementById('result');

        // Speech Recognition 초기화
        function initSpeechRecognition() {
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

                recognition.continuous = false;
                recognition.interimResults = true;
                recognition.lang = '${language}';
                recognition.maxAlternatives = 1;

                recognition.onstart = function() {
                    isListening = true;
                    micButton.classList.add('listening');
                    status.textContent = '듣고 있습니다... 말씀해주세요';
                    window.ReactNativeWebView?.postMessage(JSON.stringify({
                        type: 'started'
                    }));
                };

                recognition.onresult = function(event) {
                    let finalTranscript = '';
                    let interimTranscript = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;

                        if (event.results[i].isFinal) {
                            finalTranscript += transcript;
                        } else {
                            interimTranscript += transcript;
                        }
                    }

                    if (finalTranscript) {
                        result.innerHTML = '<strong>' + finalTranscript + '</strong>';
                        window.ReactNativeWebView?.postMessage(JSON.stringify({
                            type: 'result',
                            text: finalTranscript.trim(),
                            confidence: event.results[0][0].confidence || 0.9
                        }));
                    } else if (interimTranscript) {
                        result.innerHTML = '<em style="color: #666;">' + interimTranscript + '</em>';
                    }
                };

                recognition.onerror = function(event) {
                    console.error('Speech recognition error:', event.error);
                    status.innerHTML = '<span class="error">오류: ' + event.error + '</span>';
                    stopListening();

                    window.ReactNativeWebView?.postMessage(JSON.stringify({
                        type: 'error',
                        error: event.error
                    }));
                };

                recognition.onend = function() {
                    stopListening();
                    window.ReactNativeWebView?.postMessage(JSON.stringify({
                        type: 'ended'
                    }));
                };

                return true;
            } else {
                status.innerHTML = '<span class="error">이 브라우저는 음성 인식을 지원하지 않습니다</span>';
                micButton.disabled = true;
                return false;
            }
        }

        function startListening() {
            if (recognition && !isListening) {
                result.innerHTML = '<em>음성 인식 시작 중...</em>';
                recognition.start();
            }
        }

        function stopListening() {
            isListening = false;
            micButton.classList.remove('listening');
            status.textContent = '음성 인식이 완료되었습니다';

            if (recognition) {
                recognition.stop();
            }
        }

        // 초기화
        if (initSpeechRecognition()) {
            micButton.addEventListener('click', function() {
                if (isListening) {
                    stopListening();
                } else {
                    startListening();
                }
            });
        }

        // React Native에서 메시지 받기
        window.addEventListener('message', function(event) {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'start') {
                    startListening();
                } else if (data.type === 'stop') {
                    stopListening();
                }
            } catch (error) {
                console.error('Message parsing error:', error);
            }
        });
    </script>
</body>
</html>
  `;

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      switch (data.type) {
        case 'started':
          setIsListening(true);
          break;

        case 'result':
          if (data.text && data.text.trim()) {
            onResult(data.text.trim());
            onClose();
          }
          break;

        case 'error':
          setIsListening(false);
          Alert.alert('음성 인식 오류', `오류가 발생했습니다: ${data.error}`);
          break;

        case 'ended':
          setIsListening(false);
          break;
      }
    } catch (error) {
      console.error('WebView message parsing error:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>음성 인식</Text>
          <View style={styles.placeholder} />
        </View>

        <WebView
          source={{ html: speechHTML }}
          onMessage={handleWebViewMessage}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
          mixedContentMode="compatibility"
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  webview: {
    flex: 1,
  },
});