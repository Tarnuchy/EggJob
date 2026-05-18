import type { Ionicons } from '@expo/vector-icons';
import { strings } from '../i18n/strings';

type IoniconName = keyof typeof Ionicons.glyphMap;

export type SectionName = 'Home' | 'Tasks' | 'Friends' | 'Profile' | 'Settings' | 'Notifications';

export interface SectionConfig {
  label: string;
  iconFilled: IoniconName;
  iconOutline: IoniconName;
}

export const SECTION_CONFIG: Record<SectionName, SectionConfig> = {
  Home: {
    label: strings.screens.home,
    iconFilled: 'home',
    iconOutline: 'home-outline',
  },
  Tasks: {
    label: strings.screens.tasks,
    iconFilled: 'checkbox',
    iconOutline: 'checkbox-outline',
  },
  Friends: {
    label: strings.screens.friends,
    iconFilled: 'people',
    iconOutline: 'people-outline',
  },
  Profile: {
    label: strings.screens.profile,
    iconFilled: 'person',
    iconOutline: 'person-outline',
  },
  Settings: {
    label: strings.screens.settings,
    iconFilled: 'settings',
    iconOutline: 'settings-outline',
  },
  Notifications: {
    label: strings.screens.notifications,
    iconFilled: 'notifications',
    iconOutline: 'notifications-outline',
  },
};

export const isSectionName = (name: string): name is SectionName => name in SECTION_CONFIG;
