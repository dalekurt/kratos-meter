// src/components/AppBar.js
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import { Breadcrumbs, IconButton, InputBase, Link, AppBar as MuiAppBar, Switch, Toolbar, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import React from 'react';

const AppBar = ({ handleDrawerToggle, toggleThemeMode, isDarkMode }) => {
  const theme = useTheme();

  return (
    <MuiAppBar position="fixed" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerToggle}
          sx={{ marginRight: 2 }}
        >
          <MenuIcon />
        </IconButton>
        {/* Breadcrumb placeholder */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ flexGrow: 1 }}>
          <Link color="inherit" href="/">
            Home
          </Link>
          {/* Add additional breadcrumbs here */}
          <Typography color="textPrimary">Current Page</Typography>
        </Breadcrumbs>
        <div>
          <SearchIcon />
          <InputBase placeholder="Search…" inputProps={{ 'aria-label': 'search' }} />
        </div>
        {/* Other action icons */}
        <Switch
          edge="end"
          onChange={toggleThemeMode}
          checked={isDarkMode}
          inputProps={{ 'aria-label': 'theme mode' }}
          sx={{
            '.MuiSwitch-switchBase.Mui-checked': {
              color: isDarkMode ? theme.palette.primary.light : theme.palette.primary.main,
            },
            '.MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: isDarkMode ? theme.palette.primary.main : theme.palette.primary.light,
            },
          }}
        />
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar;
