
import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

const STORAGE_KEY = 'testpilot_active_analysis';

function loadSavedAnalysis() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return null;

    return JSON.parse(saved);
  } catch (error) {
    console.error('Failed to load saved analysis:', error);

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (storageError) {
      console.error('Storage cleanup failed:', storageError);
    }

    return null;
  }
}

export function AppProvider({ children }) {
  const [activeAnalysis, setActiveAnalysisState] =
    useState(loadSavedAnalysis);

  const setActiveAnalysis = (data) => {
    setActiveAnalysisState(data);

    try {
      if (data === null) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(data)
        );
      }
    } catch (error) {
      console.error('Failed to save analysis:', error);
    }
  };

  const clearAnalysis = () => {
    setActiveAnalysis(null);
  };

  return (
    <AppContext.Provider
      value={{
        activeAnalysis,
        setActiveAnalysis,
        clearAnalysis
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      'useAppContext must be used inside AppProvider'
    );
  }

  return context;
}
