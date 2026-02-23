import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { colors } from './colors';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const systemScheme = useColorScheme();
    const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', or 'system'
    const [isDark, setIsDark] = useState(systemScheme === 'dark');

    useEffect(() => {
        if (themeMode === 'system') {
            setIsDark(systemScheme === 'dark');
        } else {
            setIsDark(themeMode === 'dark');
        }
    }, [themeMode, systemScheme]);

    const toggleTheme = () => {
        setThemeMode(prev => (prev === 'dark' ? 'light' : 'dark'));
    };

    const value = {
        themeMode,
        setThemeMode,
        isDark,
        toggleTheme,
        colors: isDark ? colors.dark : colors.light,
        primary: colors.primary
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
