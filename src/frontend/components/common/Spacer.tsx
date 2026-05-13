import React, { useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';

interface Props {
  height?: number;
  width?: number;
}

export const Spacer = ({ height, width }: Props) => {
  const style = useMemo<ViewStyle>(() => StyleSheet.flatten({ height, width }), [height, width]);
  return <View style={style} />;
};
