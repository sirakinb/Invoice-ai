import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface SoundWaveIconProps {
  size?: number;
  color?: string;
}

export const SoundWaveIcon: React.FC<SoundWaveIconProps> = ({ 
  size = 20, 
  color = '#007AFF' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="2" y="8" width="2" height="8" fill={color} rx="1" />
      <Rect x="6" y="4" width="2" height="16" fill={color} rx="1" />
      <Rect x="10" y="6" width="2" height="12" fill={color} rx="1" />
      <Rect x="14" y="2" width="2" height="20" fill={color} rx="1" />
      <Rect x="18" y="7" width="2" height="10" fill={color} rx="1" />
    </Svg>
  );
};
