import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '../../../components/common/AppText';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useRelativeTime } from '../../../hooks/useRelativeTime';
import type { FeedItem } from '../../../services';

interface Props {
  item: FeedItem;
}

export const ActivityItem = ({ item }: Props) => {
  const { t } = useTranslation();
  const formatTime = useRelativeTime();
  const isComment = item.type === 'comment';
  const timeLabel = formatTime(item.createdAt);
  const typeLabel = isComment
    ? t('friends.profile.activity.comment')
    : t('friends.profile.activity.progressEntry');

  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Ionicons
          name={isComment ? 'chatbubble-outline' : 'trending-up-outline'}
          size={18}
          color={colors.primary}
        />
      </View>
      <View style={styles.content}>
        <AppText variant="caption" color="muted">
          {`${typeLabel} · ${timeLabel}`}
        </AppText>
        <AppText variant="body" color="textPrimary">
          {item.message}
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardSurfaceTranslucent,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
});
