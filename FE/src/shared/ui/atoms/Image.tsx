import React, { useState } from 'react';
import { Image as RNImage, ImageProps as RNImageProps, View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from './Text';
import { Icon } from './Icon';

export interface ImageProps extends RNImageProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  placeholder?: React.ReactNode;
  errorPlaceholder?: React.ReactNode;
  showLoadingIndicator?: boolean;
  aspectRatio?: number;
}

export const Image: React.FC<ImageProps> = ({
  width,
  height,
  borderRadius = 0,
  placeholder,
  errorPlaceholder,
  showLoadingIndicator = true,
  aspectRatio,
  style,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const containerStyle = [
    styles.container,
    {
      width,
      height: aspectRatio ? undefined : height,
      aspectRatio,
      borderRadius,
    },
    style,
  ];

  const imageStyle = {
    width: '100%',
    height: '100%',
    borderRadius,
  };

  const handleLoad = (event: any) => {
    setIsLoading(false);
    onLoad?.(event);
  };

  const handleError = (event: any) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(event);
  };

  const renderDefaultPlaceholder = () => (
    <View style={[styles.placeholder, { borderRadius }]}>
      {showLoadingIndicator && isLoading && (
        <ActivityIndicator color="#6B7280" size="small" />
      )}
    </View>
  );

  const renderDefaultError = () => (
    <View style={[styles.errorContainer, { borderRadius }]}>
      <Icon name="image-outline" size={24} color="#9CA3AF" />
      <Text variant="caption" color="textSecondary">
        이미지를 불러올 수 없습니다
      </Text>
    </View>
  );

  return (
    <View style={containerStyle}>
      {hasError ? (
        errorPlaceholder || renderDefaultError()
      ) : (
        <>
          <RNImage
            {...props}
            style={imageStyle}
            onLoad={handleLoad}
            onError={handleError}
          />
          {isLoading && (placeholder || renderDefaultPlaceholder())}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
});