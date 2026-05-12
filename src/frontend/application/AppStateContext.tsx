import React, { createContext, useContext, useReducer } from 'react';
import type { AppAction } from './actions';
import { reduceFrontendState } from './reducer';
import type { FrontendState } from './state';
import { createInitialFrontendState } from './state';

type AppStateContextValue = {
  state: FrontendState;
  dispatch: (action: AppAction) => void;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatchRaw] = useReducer((currentState: FrontendState, action: AppAction) => {
    const result = reduceFrontendState(currentState, action);
    return result.ok ? result.value : currentState;
  }, createInitialFrontendState());

  return (
    <AppStateContext.Provider value={{ state, dispatch: dispatchRaw }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return ctx;
}
