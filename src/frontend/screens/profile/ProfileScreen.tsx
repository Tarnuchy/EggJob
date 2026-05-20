import React from 'react';
import { useTranslation } from 'react-i18next';
import { PlaceholderScreen } from '../../components/layout/PlaceholderScreen';

export const ProfileScreen = () => {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('screens.profile')} text={t('placeholders.profile')} />;
};
