import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SegmentedControl,
  type SegmentedControlOption,
} from '../common/SegmentedControl';

export type AuthTab = 'login' | 'register';

interface Props {
  activeTab: AuthTab;
  onTabChange: (tab: AuthTab) => void;
}

export const AuthTabSwitcher = ({ activeTab, onTabChange }: Props) => {
  const { t } = useTranslation();
  const options = useMemo<ReadonlyArray<SegmentedControlOption<AuthTab>>>(
    () => [
      { value: 'login', label: t('auth.tabs.login') },
      { value: 'register', label: t('auth.tabs.register') },
    ],
    [t],
  );

  return (
    <SegmentedControl<AuthTab>
      options={options}
      value={activeTab}
      onChange={onTabChange}
    />
  );
};
