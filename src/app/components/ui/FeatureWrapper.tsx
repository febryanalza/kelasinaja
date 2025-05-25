"use client";

import React from 'react';
import { useFeatureStatus } from '@/app/hooks/useFeatureStatus';
import UnderDevelopment from './UnderDevelopment';

interface FeatureWrapperProps {
  featureName: string;
  children: React.ReactNode;
  fallbackVariant?: 'banner' | 'card' | 'overlay' | 'badge';
  showWhenDisabled?: boolean;
  className?: string;
}

const FeatureWrapper: React.FC<FeatureWrapperProps> = ({
  featureName,
  children,
  fallbackVariant = 'card',
  showWhenDisabled = true,
  className = ""
}) => {
  const { isEnabled, isUnderDevelopment, message } = useFeatureStatus(featureName);

  // Jika fitur aktif dan tidak dalam pengembangan, tampilkan children
  if (isEnabled && !isUnderDevelopment) {
    return <>{children}</>;
  }

  // Jika fitur dalam pengembangan atau disabled
  if (isUnderDevelopment || !isEnabled) {
    if (!showWhenDisabled) {
      return null;
    }

    return (
      <div className={className}>
        <UnderDevelopment 
          variant={fallbackVariant}
          message={message}
        />
      </div>
    );
  }

  return <>{children}</>;
};

export default FeatureWrapper;