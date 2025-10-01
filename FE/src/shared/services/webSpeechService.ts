import { WebView } from 'react-native-webview';

export interface SpeechResult {
  text: string;
  confidence: number;
}

export class WebSpeechService {
  private webViewRef: any = null;
  private onResult: ((result: SpeechResult) => void) | null = null;
  private onError: ((error: string) => void) | null = null;

  setWebViewRef(ref: any) {
    this.webViewRef = ref;
  }

  // WebView에서 실행될 HTML/JavaScript 코드
  getWebViewHTML(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Speech Recognition</title>
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background: #f0f0f0;">
    <div style="text-align: center;">
        <h3>음성 인식</h3>
        <button id="startBtn" style="padding: 10px 20px; font-size: 16px; margin: 10px;">시작</button>
        <button id="stopBtn" style="padding: 10px 20px; font-size: 16px; margin: 10px;" disabled>중지</button>
        <div id="status" style="margin: 20px 0; font-size: 14px; color: #666;">대기 중...</div>
        <div id="result" style="margin: 20px 0; padding: 10px; background: white; border-radius: 5px; min-height: 50px;"></div>
    </div>

    <script>
        let recognition = null;
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const status = document.getElementById('status');
        const result = document.getElementById('result');

        // Speech Recognition 지원 확인
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'ko-KR';

            recognition.onstart = function() {
                status.textContent = '음성 인식 중...';
                startBtn.disabled = true;
                stopBtn.disabled = false;
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                    type: 'started'
                }));
            };

            recognition.onresult = function(event) {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    const confidence = event.results[i][0].confidence;

                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                        // React Native로 최종 결과 전송
                        window.ReactNativeWebView?.postMessage(JSON.stringify({
                            type: 'result',
                            text: transcript.trim(),
                            confidence: confidence || 0.9,
                            isFinal: true
                        }));
                    } else {
                        interimTranscript += transcript;
                    }
                }

                result.innerHTML = '<strong>최종:</strong> ' + finalTranscript + '<br><span style="color: #999;">임시:</span> ' + interimTranscript;
            };

            recognition.onerror = function(event) {
                status.textContent = '오류: ' + event.error;
                startBtn.disabled = false;
                stopBtn.disabled = true;
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                    type: 'error',
                    error: event.error
                }));
            };

            recognition.onend = function() {
                status.textContent = '음성 인식 완료';
                startBtn.disabled = false;
                stopBtn.disabled = true;
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                    type: 'ended'
                }));
            };

        } else {
            status.textContent = '이 브라우저는 음성 인식을 지원하지 않습니다.';
            startBtn.disabled = true;
            window.ReactNativeWebView?.postMessage(JSON.stringify({
                type: 'error',
                error: 'Speech recognition not supported'
            }));
        }

        startBtn.onclick = function() {
            if (recognition) {
                recognition.start();
            }
        };

        stopBtn.onclick = function() {
            if (recognition) {
                recognition.stop();
            }
        };

        // React Native에서 메시지 받기
        window.addEventListener('message', function(event) {
            const data = JSON.parse(event.data);

            if (data.type === 'start') {
                if (recognition) {
                    recognition.start();
                }
            } else if (data.type === 'stop') {
                if (recognition) {
                    recognition.stop();
                }
            }
        });
    </script>
</body>
</html>
    `;
  }

  startRecording(
    onResult: (result: SpeechResult) => void,
    onError: (error: string) => void
  ) {
    this.onResult = onResult;
    this.onError = onError;

    if (this.webViewRef) {
      this.webViewRef.postMessage(JSON.stringify({ type: 'start' }));
    } else {
      onError('WebView가 초기화되지 않았습니다.');
    }
  }

  stopRecording() {
    if (this.webViewRef) {
      this.webViewRef.postMessage(JSON.stringify({ type: 'stop' }));
    }
  }

  // WebView에서 오는 메시지 처리
  handleWebViewMessage(event: any) {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      switch (data.type) {
        case 'result':
          if (data.isFinal && this.onResult) {
            this.onResult({
              text: data.text,
              confidence: data.confidence
            });
          }
          break;

        case 'error':
          if (this.onError) {
            this.onError(data.error);
          }
          break;

        case 'started':
          console.log('음성 인식 시작됨');
          break;

        case 'ended':
          console.log('음성 인식 종료됨');
          break;
      }
    } catch (error) {
      console.error('WebView 메시지 파싱 오류:', error);
      if (this.onError) {
        this.onError('메시지 처리 오류');
      }
    }
  }
}

// 싱글톤 인스턴스
export const webSpeechService = new WebSpeechService();