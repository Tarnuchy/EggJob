import React, { createContext, useContext, useReducer } from 'react';
import { reduceFrontendState } from './reducer';
import { createInitialFrontendState, FrontendState } from './state';

type Action = { type: string; [key: string]: unknown };

type AppStateContextValue = {
  state: FrontendState;
  dispatch: (action: Action) => void;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatchRaw] = useReducer(
    (currentState: FrontendState, action: Action) => {
      const result = reduceFrontendState(currentState, action);
      return result.ok ? result.value : currentState;
    },
    createInitialFrontendState()
  );

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
