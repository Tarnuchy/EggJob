import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { TopBar } from '../../components/layout/TopBar';
import {
  SegmentedControl,
  type SegmentedControlOption,
} from '../../components/common/SegmentedControl';
import { colors } from '../../theme/colors';
import { spacing, SCREEN_PADDING_H } from '../../theme/spacing';
import { MyFriendsTab } from './friends/MyFriendsTab';
import { AddFriendTab } from './friends/AddFriendTab';
import { InvitationsTab } from './friends/InvitationsTab';
import type { FriendsTab } from './friends/types';

export const FriendsScreen = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<FriendsTab>('myFriends');

  const tabOptions = useMemo<ReadonlyArray<SegmentedControlOption<FriendsTab>>>(
    () => [
      { value: 'myFriends', label: t('friends.tabs.myFriends') },
      { value: 'addFriend', label: t('friends.tabs.addFriend') },
      { value: 'invitations', label: t('friends.tabs.invitations') },
    ],
    [t],
  );

  return (
    <View style={styles.root}>
      <TopBar />
      <SafeAreaView style={styles.body} edges={['left', 'right', 'bottom']}>
        <View style={styles.switcherWrap}>
          <SegmentedControl<FriendsTab>
            options={tabOptions}
            value={activeTab}
            onChange={setActiveTab}
          />
        </View>
        <View style={styles.tabContent}>
          {activeTab === 'myFriends' ? (
            <MyFriendsTab />
          ) : activeTab === 'addFriend' ? (
            <AddFriendTab />
          ) : (
            <InvitationsTab />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
  },
  switcherWrap: {
    paddingHorizontal: SCREEN_PADDING_H,
    paddingTop: spacing.md,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: SCREEN_PADDING_H,
  },
});
