import React from 'react';
import { View, Text } from 'react-native';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // 에러 발생 시 state 업데이트
    console.log('ErrorBoundary caught error:', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 에러 로깅은 하되 사용자에게는 표시하지 않음
    console.log('ErrorBoundary error details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 에러 발생 시 빈 화면 또는 기본 화면 표시
      return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          {/* 필요시 기본 컨텐츠 표시, 아니면 빈 화면 */}
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;