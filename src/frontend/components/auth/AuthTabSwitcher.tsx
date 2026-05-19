import React, { useMemo } from 'react';
import { strings } from '../../i18n/strings';
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
  const options = useMemo<ReadonlyArray<SegmentedControlOption<AuthTab>>>(
    () => [
      { value: 'login', label: strings.auth.tabs.login },
      { value: 'register', label: strings.auth.tabs.register },
    ],
    [],
  );

  return (
    <SegmentedControl<AuthTab>
      options={options}
      value={activeTab}
      onChange={onTabChange}
    />
  );
};
