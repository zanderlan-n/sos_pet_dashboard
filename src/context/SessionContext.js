import React, { useMemo, useState, createContext } from 'react';

export const SessionContext = createContext({});
export const SessionProvider = ({
  initialSession = {
    user: null,
  },
  children,
}) => {
  const [state, setState] = useState(initialSession);

  const startSession = (user) => {
    setState({
      user,
    });
  };

  const removeSession = () => {
    setState({
      user: null,
    });
  };

  const contextValue = useMemo(
    () => ({
      ...state,
      startSession,
      removeSession,
    }),
    [state]
  );

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};
