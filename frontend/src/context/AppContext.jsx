import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Initialize from localStorage if it exists
  const [activeAnalysis, setActiveAnalysisState] = useState(() => {
    const saved = localStorage.getItem('testpilot_active_analysis');
    return saved ? JSON.parse(saved) : null;
  });

  // Wrap the setter to also save to localStorage
  const setActiveAnalysis = (data) => {
    setActiveAnalysisState(data);
    if (data) {
      localStorage.setItem('testpilot_active_analysis', JSON.stringify(data));
    } else {
      localStorage.removeItem('testpilot_active_analysis');
    }
  };

  // Clear function
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