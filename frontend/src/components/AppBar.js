// src/components/AppBar.js
import Brightness4Icon from '@mui/icons-material/Brightness4'; // For dark mode toggle
import Brightness7Icon from '@mui/icons-material/Brightness7'; // For light mode toggle
import MenuIcon from '@mui/icons-material/Menu';
import { IconButton, AppBar as MuiAppBar, Toolbar, Typography, useTheme } from '@mui/material';
import React from 'react';

const AppBar = ({ toggleThemeMode, isDrawerOpen, handleDrawerOpen }) => {
  const theme = useTheme();
  return (
    <MuiAppBar position="fixed">
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          edge="start"
          sx={{ marginRight: 5, ...(isDrawerOpen && { display: 'none' }) }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          My Application
        </Typography>
        <IconButton color="inherit" onClick={toggleThemeMode}>
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar;
