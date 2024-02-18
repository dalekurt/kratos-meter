// src/theme.js
import { createTheme } from '@mui/material/styles';

// Light theme inspired by mui.com
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#007FFF', // Example primary color used on mui.com
    },
    background: {
      default: '#fff',
      paper: '#fff',
    },
    text: {
      primary: '#0a1929',
      secondary: '#5a6978',
    },
  },
  // Additional customization...
});

// Dark theme inspired by mui.com
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#007FFF', // You can adjust the primary color for the dark theme if needed
    },
    background: {
      default: '#121212', // Dark background color
      paper: '#1e1e1e', // Darker shade for paper backgrounds
    },
    text: {
      primary: '#fff',
      secondary: '#b0bec5',
    },
  },
  // Additional customization...
});
