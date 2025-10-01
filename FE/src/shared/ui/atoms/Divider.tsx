import React from 'react';
import { View, StyleSheet } from 'react-native';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  color?: string;
  length?: number | string;
  style?: any;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  thickness = 1,
  color = '#E5E7EB',
  length = '100%',
  style,
}) => {
  const dividerStyle = orientation === 'horizontal'
    ? {
        width: length,
        height: thickness,
        backgroundColor: color,
      }
    : {
        width: thickness,
        height: length,
        backgroundColor: color,
      };

  return <View style={[dividerStyle, style]} />;
};

const styles = StyleSheet.create({});