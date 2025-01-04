import { createGlobalStyle } from 'styled-components';

export const theme = {
  colors: {
    primary: '#39FF14', // Neon green
    primaryGlow: 'rgba(57, 255, 20, 0.15)',
    secondary: '#006400', // Dark green
    danger: '#ff0000',
    light: '#ffffff',
    dark: '#000000',
    gray: '#1a1a1a',
    overlay: 'rgba(57, 255, 20, 0.05)',
  },
};

export const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', sans-serif;
    background: linear-gradient(to bottom right, ${theme.colors.dark}, #001400);
    color: ${theme.colors.light};
    min-height: 100vh;
  }
`;
