import { useState, useEffect } from 'react';

interface FeatureStatus {
  [key: string]: {
    isEnabled: boolean;
    isUnderDevelopment: boolean;
    message?: string;
    estimatedCompletion?: string;
  };
}

// Konfigurasi status fitur - bisa dipindah ke file config terpisah
const FEATURE_CONFIG: FeatureStatus = {
  'video-upload': {
    isEnabled: true,
    isUnderDevelopment: false
  },
  'live-streaming': {
    isEnabled: false,
    isUnderDevelopment: true,
    message: 'Fitur live streaming sedang dalam pengembangan',
    estimatedCompletion: 'Q2 2024'
  },
  'ai-recommendations': {
    isEnabled: false,
    isUnderDevelopment: true,
    message: 'Sistem rekomendasi AI sedang dikembangkan',
    estimatedCompletion: 'Q3 2024'
  },
  'advanced-analytics': {
    isEnabled: false,
    isUnderDevelopment: true,
    message: 'Analytics lanjutan akan segera hadir'
  },
  'mobile-app': {
    isEnabled: false,
    isUnderDevelopment: true,
    message: 'Aplikasi mobile sedang dalam tahap pengembangan'
  }
};

export const useFeatureStatus = (featureName: string) => {
  const [status, setStatus] = useState(FEATURE_CONFIG[featureName] || {
    isEnabled: false,
    isUnderDevelopment: true,
    message: 'Fitur sedang dalam pengembangan'
  });

  useEffect(() => {
    // Di sini bisa ditambahkan logic untuk fetch status dari API
    // atau local storage untuk konfigurasi yang lebih dinamis
    const featureStatus = FEATURE_CONFIG[featureName];
    if (featureStatus) {
      setStatus(featureStatus);
    }
  }, [featureName]);

  return {
    isEnabled: status.isEnabled,
    isUnderDevelopment: status.isUnderDevelopment,
    message: status.message,
    estimatedCompletion: status.estimatedCompletion
  };
};

export const updateFeatureStatus = (featureName: string, newStatus: Partial<FeatureStatus[string]>) => {
  FEATURE_CONFIG[featureName] = { ...FEATURE_CONFIG[featureName], ...newStatus };
};

export const getAllFeatures = () => FEATURE_CONFIG;