import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AppAction } from './actions';
import { reduceFrontendState } from './reducer';
import type { ReducerResult } from './reducer';
import type { FrontendState } from './state';
import { createInitialFrontendState } from './state';

type AppStateContextValue = {
  state: FrontendState;
  dispatch: (action: AppAction) => ReducerResult;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FrontendState>(createInitialFrontendState);

  const dispatch = useCallback((action: AppAction): ReducerResult => {
    let result!: ReducerResult;
    setState((current) => {
      result = reduceFrontendState(current, action);
      return result.ok ? result.value : current;
    });
    return result;
  }, []);

  const value = useMemo<AppStateContextValue>(() => ({ state, dispatch }), [state, dispatch]);

  useEffect(() => {
    // keep HTTP helpers aware of currently signed user (used by HTTP services)
    try {
      // lazy import to avoid cycles
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { CurrentUser } = require('../services/http/CurrentUser');
      CurrentUser.set(state.session.currentUserId);
    } catch {
      // ignore
    }
  }, [state.session.currentUserId]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return ctx;
}
