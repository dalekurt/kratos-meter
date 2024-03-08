// src/theme.js
import { createTheme } from '@mui/material/styles';

// Light theme colors
const lightPalette = {
  primary: {
    main: '#6c35de',
    light: '#a364ff',
    dark: '#241b35',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#cb80ff',
    dark: '#373737',
    contrastText: '#e0e0e0',
  },
  background: {
    default: '#bg-100',
    paper: '#bg-200',
  },
  text: {
    primary: '#text-100',
    secondary: '#text-200',
  },
  // Add other color settings if needed
};

// Dark theme colors
const darkPalette = {
  primary: {
    main: '#333333',
    light: '#5c5c5c',
    dark: '#b9b9b9',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#666666',
    light: '#f7f7f7',
    dark: '#a3a3a3',
    contrastText: '#e0e0e0',
  },
  background: {
    default: '#1A1A1A',
    paper: '#292929',
  },
  text: {
    primary: '#ffffff',
    secondary: '#e0e0e0',
  },
  // Add other color settings if needed
};

export const lightTheme = createTheme({
  palette: lightPalette,
  // Add other customizations like typography, etc.
});

export const darkTheme = createTheme({
  palette: darkPalette,
  // Add other customizations like typography, etc.
});
