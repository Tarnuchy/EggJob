import { InteractionManager } from 'react-native';

/**
 * Resolves after the current interactions/animations settle. Used before launching a native
 * screen (image picker / camera) right after closing a Modal, so the picker isn't presented
 * on top of a view controller that is still mid-dismiss — an iOS "present while a presentation
 * is in progress" hazard.
 */
export function afterInteractions(): Promise<void> {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(() => resolve());
  });
}
