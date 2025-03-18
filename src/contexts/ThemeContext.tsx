
import React, { createContext, useContext, useState, useEffect } from 'react';

type AccentColor = 'green' | 'blue' | 'brown';

interface ThemeContextType {
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [accentColor, setAccentColor] = useState<AccentColor>(() => {
    // Tenta recuperar a cor do localStorage
    const savedColor = localStorage.getItem('accentColor');
    return (savedColor as AccentColor) || 'green';
  });

  // Atualiza a classe do documento quando a cor muda
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-green', 'theme-blue', 'theme-brown');
    root.classList.add(`theme-${accentColor}`);
    
    // Salva a preferência no localStorage
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  return (
    <ThemeContext.Provider value={{ accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
}
