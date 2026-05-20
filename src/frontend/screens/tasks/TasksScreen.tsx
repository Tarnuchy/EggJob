import React from 'react';
import { useTranslation } from 'react-i18next';
import { PlaceholderScreen } from '../../components/layout/PlaceholderScreen';

export const TasksScreen = () => {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('screens.tasks')} text={t('placeholders.tasks')} />;
};
