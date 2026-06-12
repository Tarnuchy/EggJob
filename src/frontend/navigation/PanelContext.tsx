import { createContext, useContext } from 'react';

export type PanelKind = 'settings' | 'notifications' | null;

interface PanelContextValue {
  openPanel: PanelKind;
  setOpenPanel: (kind: PanelKind) => void;
}

export const PanelContext = createContext<PanelContextValue | null>(null);

export const usePanelContext = () => {
  const ctx = useContext(PanelContext);
  if (!ctx) throw new Error('usePanelContext must be used within PanelHost');
  return ctx;
};
