import React from 'react';
import { useTranslation } from 'react-i18next';
import { PlaceholderScreen } from '../../components/layout/PlaceholderScreen';

export const NotificationScreen = () => {
  const { t } = useTranslation();
  return (
    <PlaceholderScreen
      title={t('screens.notifications')}
      text={t('placeholders.notifications')}
      showTopBar={false}
    />
  );
};
