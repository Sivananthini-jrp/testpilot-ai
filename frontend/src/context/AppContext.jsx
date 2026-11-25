import { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [activeAnalysis, setActiveAnalysisState] = useState(() => {
    const saved = localStorage.getItem('testpilot_active_analysis');
    return saved ? JSON.parse(saved) : null;
  });

  const setActiveAnalysis = (data) => {
    setActiveAnalysisState(data);
    if (data) {
      localStorage.setItem('testpilot_active_analysis', JSON.stringify(data));
    } else {
      localStorage.removeItem('testpilot_active_analysis');
    }
  };

  const clearAnalysis = () => {
    setActiveAnalysis(null);
  };

  return (
    <AppContext.Provider value={{ activeAnalysis, setActiveAnalysis, clearAnalysis }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}