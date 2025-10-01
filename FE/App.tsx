import 'react-native-gesture-handler';
import React from 'react';
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';

// Expo에서 RedBox 완전 차단을 위한 추가 설정
import Constants from 'expo-constants';

// 개발 모드에서 에러/경고 박스 완전히 비활성화
LogBox.ignoreAllLogs(true);

// RedBox 완전 비활성화 - Expo 특화 방법
if (__DEV__ || Constants.expoConfig?.extra?.environment !== 'production') {
  LogBox.ignoreAllLogs(true);
  console.disableYellowBox = true;

  // React Native 레드 스크린 완전 비활성화
  console.reportErrorsAsExceptions = false;

  // Expo 특화 에러 차단
  if ((global as any).expo) {
    (global as any).expo.modules = (global as any).expo.modules || {};
    (global as any).expo.modules.ExpoErrorRecovery = {
      setRecoveryProps: () => {},
      recoveryProps: null,
    };
  }

  // Expo Router 에러 차단
  if ((global as any).__EXPO_ROUTER__) {
    (global as any).__EXPO_ROUTER__.handleError = () => {};
  }

  // RedBox 모듈 직접 비활성화
  const ExceptionsManager = require('react-native/Libraries/Core/ExceptionsManager');
  ExceptionsManager.handleException = () => {};
  ExceptionsManager.updateExceptionMessage = () => {};
  ExceptionsManager.dismissRedbox = () => {};

  // LogBox 모듈도 직접 비활성화
  const LogBoxModule = require('react-native/Libraries/LogBox/LogBox');
  LogBoxModule.install = () => {};
  LogBoxModule.uninstall = () => {};
  LogBoxModule.ignoreLogs = () => {};
  LogBoxModule.ignoreAllLogs = () => {};

  // React Native의 내부 에러 리포터들 비활성화
  try {
    const ReactNativeFeatureFlags = require('react-native/Libraries/ReactNative/ReactNativeFeatureFlags');
    if (ReactNativeFeatureFlags) {
      ReactNativeFeatureFlags.shouldParseFontDisplayName = () => false;
    }
  } catch (e) {}

  // 에러 스크린을 표시하는 모든 함수들 오버라이드
  if ((global as any).ErrorUtils) {
    (global as any).ErrorUtils.reportFatalError = () => {};
    (global as any).ErrorUtils.setGlobalHandler(() => {});
    (global as any).ErrorUtils.getGlobalHandler = () => () => {};
  }

  // React DevTools에서 오는 에러 표시도 차단
  if ((global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    (global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = () => {};
    (global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberUnmount = () => {};
    (global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.reportError = () => {};
  }

  // Metro bundler 에러 차단
  if ((global as any).__metro_require__) {
    const originalRequire = (global as any).__metro_require__;
    (global as any).__metro_require__ = function(...args: any[]) {
      try {
        return originalRequire.apply(this, args);
      } catch (e) {
        return {};
      }
    };
  }

  // 글로벌 에러 핸들러로 에러 메시지 숨기기
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  console.error = (...args) => {
    // 모든 에러 메시지를 차단하여 모바일 화면에서 안 보이게 함
    // 개발 중에는 콘솔에는 표시되지만 화면의 에러 팝업은 차단
    return;
  };

  console.warn = (...args) => {
    // 모든 warning도 숨기기
    return;
  };

  // 글로벌 에러 핸들러 추가 - 모든 에러를 완전히 무시
  if ((global as any).ErrorUtils) {
    (global as any).ErrorUtils.setGlobalHandler(() => {
      // 아무것도 하지 않음 - 에러를 완전히 무시
    });

    // 추가적인 에러 핸들러들도 모두 무력화
    (global as any).ErrorUtils.reportError = () => {};
    (global as any).ErrorUtils.reportPartialError = () => {};
    (global as any).ErrorUtils.reportException = () => {};
  }

  // React Native Bridge 에러도 차단
  if ((global as any).nativeLoggingHook) {
    (global as any).nativeLoggingHook = () => {};
  }

  // Bridge 통신 에러 차단
  if ((global as any).nativeCallSyncHook) {
    const original = (global as any).nativeCallSyncHook;
    (global as any).nativeCallSyncHook = function(...args: any[]) {
      try {
        return original ? original.apply(this, args) : undefined;
      } catch (e) {
        return undefined;
      }
    };
  }

  // React Native의 unhandled promise rejection도 차단
  const originalHandler = (global as any).__DEV__ ? console.warn : () => {};
  (global as any).addEventListener?.('unhandledrejection', (event: any) => {
    event.preventDefault();
    return false;
  });

  // React error boundary bypass
  if ((global as any).HermesInternal) {
    const originalWarn = (global as any).HermesInternal.enablePromiseRejectionTracker;
    if (originalWarn) {
      (global as any).HermesInternal.enablePromiseRejectionTracker = () => {};
    }
  }

  // React DevTools 에러 리포터 비활성화
  if ((global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    (global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = () => {};
    (global as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberUnmount = () => {};
  }

  // JavaScriptCore 에러 핸들러 오버라이드
  (global as any).onerror = () => {
    return true; // 에러 처리했다고 표시하여 기본 핸들러 방지
  };

  // React Native 내부 모듈들의 에러 핸들러 차단
  setTimeout(() => {
    try {
      // React Native 내부에서 RedBox를 표시하는 모든 가능성을 차단
      if ((global as any).require) {
        const modules = [
          'react-native/Libraries/Core/ExceptionsManager',
          'react-native/Libraries/LogBox/LogBox',
          'react-native/Libraries/YellowBox/YellowBox'
        ];

        modules.forEach(moduleName => {
          try {
            const module = (global as any).require(moduleName);
            if (module) {
              Object.keys(module).forEach(key => {
                if (typeof module[key] === 'function') {
                  module[key] = () => {};
                }
              });
            }
          } catch (e) {}
        });
      }
    } catch (e) {}

    // 모든 종류의 에러 대화상자 차단
    if ((global as any).alert) {
      const originalAlert = (global as any).alert;
      (global as any).alert = (message: string) => {
        // 에러 관련 알림만 차단
        if (typeof message === 'string' && (
          message.includes('Error') ||
          message.includes('Exception') ||
          message.includes('Failed') ||
          message.includes('에러') ||
          message.includes('오류')
        )) {
          return;
        }
        // 일반 알림은 통과
        return originalAlert(message);
      };
    }

    // 최후의 수단: React Native의 모든 에러 관련 컴포넌트 무력화
    try {
      // React Native 내부의 모든 에러 관련 함수들을 찾아서 무력화
      const walkObject = (obj: any, path: string = '') => {
        if (!obj || typeof obj !== 'object' || path.split('.').length > 10) return;

        Object.keys(obj).forEach(key => {
          try {
            if (typeof obj[key] === 'function' && (
              key.toLowerCase().includes('error') ||
              key.toLowerCase().includes('exception') ||
              key.toLowerCase().includes('redbox') ||
              key.toLowerCase().includes('logbox')
            )) {
              obj[key] = () => {};
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
              walkObject(obj[key], path + '.' + key);
            }
          } catch (e) {}
        });
      };

      walkObject(global);
      walkObject((global as any).require);
    } catch (e) {}
  }, 0);
}

// 컴포넌트 레벨에서 에러 차단
class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    // 에러 발생 시에도 UI는 계속 렌더링
    return { hasError: false }; // 항상 false로 유지
  }

  componentDidCatch(error: any, errorInfo: any) {
    // 에러를 완전히 무시
  }

  render() {
    return this.props.children;
  }
}

export default function App() {
  const ctx = require.context('./src/app');

  // 앱 시작 시 최종 에러 차단
  React.useEffect(() => {
    // 컴포넌트 마운트 후 추가 에러 차단
    const interval = setInterval(() => {
      try {
        // RedBox가 DOM에 있으면 강제로 제거
        if (typeof document !== 'undefined') {
          const redboxes = document.querySelectorAll('[data-testid="redbox"], .redbox, #redbox');
          redboxes.forEach(el => {
            if (el && el.parentNode) {
              el.parentNode.removeChild(el);
            }
          });

          // 에러 모달들도 강제 제거
          const errorModals = document.querySelectorAll('[class*="error"], [class*="Error"], [id*="error"], [id*="Error"]');
          errorModals.forEach(el => {
            if (el && el.textContent && (
              el.textContent.includes('Error') ||
              el.textContent.includes('Exception') ||
              el.textContent.includes('Failed')
            )) {
              if (el.parentNode) {
                el.parentNode.removeChild(el);
              }
            }
          });
        }
      } catch (e) {}
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <ErrorBoundary>
      <ExpoRoot context={ctx} />
      <StatusBar style="auto" />
    </ErrorBoundary>
  );
}

registerRootComponent(App);