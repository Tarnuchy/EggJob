import type { Ionicons } from '@expo/vector-icons';
import type { TFunction } from 'i18next';

type IoniconName = keyof typeof Ionicons.glyphMap;

export type SectionName = 'Home' | 'Tasks' | 'Friends' | 'Profile' | 'Settings' | 'Notifications';

export interface SectionConfig {
  label: string;
  iconFilled: IoniconName;
  iconOutline: IoniconName;
}

const SECTION_ICONS: Record<SectionName, Pick<SectionConfig, 'iconFilled' | 'iconOutline'>> = {
  Home: { iconFilled: 'home', iconOutline: 'home-outline' },
  Tasks: { iconFilled: 'checkbox', iconOutline: 'checkbox-outline' },
  Friends: { iconFilled: 'people', iconOutline: 'people-outline' },
  Profile: { iconFilled: 'person', iconOutline: 'person-outline' },
  Settings: { iconFilled: 'settings', iconOutline: 'settings-outline' },
  Notifications: { iconFilled: 'notifications', iconOutline: 'notifications-outline' },
};

const SECTION_LABEL_KEYS = {
  Home: 'screens.home',
  Tasks: 'screens.tasks',
  Friends: 'screens.friends',
  Profile: 'screens.profile',
  Settings: 'screens.settings',
  Notifications: 'screens.notifications',
} as const satisfies Record<SectionName, string>;

export function createSectionConfig(t: TFunction): Record<SectionName, SectionConfig> {
  return {
    Home: { label: t(SECTION_LABEL_KEYS.Home), ...SECTION_ICONS.Home },
    Tasks: { label: t(SECTION_LABEL_KEYS.Tasks), ...SECTION_ICONS.Tasks },
    Friends: { label: t(SECTION_LABEL_KEYS.Friends), ...SECTION_ICONS.Friends },
    Profile: { label: t(SECTION_LABEL_KEYS.Profile), ...SECTION_ICONS.Profile },
    Settings: { label: t(SECTION_LABEL_KEYS.Settings), ...SECTION_ICONS.Settings },
    Notifications: { label: t(SECTION_LABEL_KEYS.Notifications), ...SECTION_ICONS.Notifications },
  };
}

export const isSectionName = (name: string): name is SectionName => name in SECTION_ICONS;

export function getSectionIcons(name: SectionName): Pick<SectionConfig, 'iconFilled' | 'iconOutline'> {
  return SECTION_ICONS[name];
}
