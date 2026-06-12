import React from 'react';
import { useTranslation } from 'react-i18next';
import { PlaceholderScreen } from '../../components/layout/PlaceholderScreen';

export const HomeScreen = () => {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('screens.home')} text={t('placeholders.home')} />;
};
