// src/components/Drawer.js
import AddBoxIcon from '@mui/icons-material/AddBox'; // Icon for "Create New Job"
import HomeIcon from '@mui/icons-material/Home';
import { Divider, List, ListItem, ListItemIcon, ListItemText, Drawer as MuiDrawer } from '@mui/material';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

const drawerWidth = 240;

const Drawer = ({ isDrawerOpen, handleDrawerClose }) => {
  return (
    <MuiDrawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="persistent"
      anchor="left"
      open={isDrawerOpen}
    >
      <Divider />
      <List>
        <ListItem button component={RouterLink} to="/" onClick={handleDrawerClose}>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button component={RouterLink} to="/create-project" onClick={handleDrawerClose}>
          <ListItemIcon>
            <AddBoxIcon />
          </ListItemIcon>
          <ListItemText primary="Create New Project" />
        </ListItem>
      </List>
    </MuiDrawer>

  );
};

export default Drawer;
