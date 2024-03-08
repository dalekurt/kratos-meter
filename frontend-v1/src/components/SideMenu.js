// src/components/SideMenu.js
import React, { useState } from 'react';

import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import { Collapse, Divider, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, SvgIcon } from '@mui/material';
// import React from 'react';
import { Link } from 'react-router-dom';

const drawerWidth = 300;

const TestingAndSyntheticsIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M441.118 53.8103L542.177 546.75H31.4615L196.718 183.554L290.242 254.396L307.934 267.797L319.661 248.955L441.118 53.8103Z" stroke="currentColor" strokeWidth="40.5" fill="none"/>
    <path d="M232.072 428.282L265.231 475.2H300.671L261.676 420.785L296.342 372.669L273.347 356.785L263.183 370.157L232.034 414.099V325.79L201 300.477V475.161H232.034V428.244L232.072 428.282Z" fill="currentColor"/>
    <path d="M410.7 404.129C407.994 397.946 403.936 392.419 398.796 387.975C390.178 379.318 378.545 374.332 366.333 373.985H365.405C363.821 373.985 362.197 374.178 360.69 374.642L390.719 330.004L366.796 313.309L355.473 330.004L326.526 374.216C321.541 381.559 317.406 388.013 314.816 392.496C312.15 397.25 309.831 402.197 307.937 407.298C305.773 412.709 304.652 418.506 304.652 424.342C304.575 431.259 305.966 438.139 308.749 444.515C311.493 450.892 315.589 456.573 320.691 461.288C330.7 471.027 344.149 476.477 358.101 476.477L359.222 476.399H360.458C374.526 476.361 388.091 470.95 398.217 461.172C403.434 456.457 407.569 450.699 410.352 444.245C413.134 437.791 414.564 430.834 414.448 423.839C414.68 417.076 413.405 410.351 410.7 404.129V404.129ZM375.569 440.303C371.241 444.593 365.405 446.989 359.299 447.027C353.231 447.066 347.434 444.67 343.144 440.38C338.855 436.09 336.459 430.293 336.459 424.226C336.459 418.158 338.855 412.361 343.144 408.071C347.434 403.781 353.231 401.385 359.299 401.385H359.492C362.507 401.385 365.482 402.004 368.226 403.163C371.009 404.361 373.482 406.062 375.569 408.264C377.772 410.274 379.511 412.709 380.671 415.453C381.869 418.197 382.449 421.134 382.449 424.11C382.371 430.216 379.898 436.013 375.569 440.303V440.303Z" fill="currentColor"/>
  </SvgIcon>  
);

const DockMenuButton = (props) => {
  return (
    <SvgIcon {...props}>
      <path d="M21,2H3A1,1,0,0,0,2,3V21a1,1,0,0,0,1,1H21a1,1,0,0,0,1-1V3A1,1,0,0,0,21,2ZM8,20H4V4H8Zm12,0H10V4H20Z" />
    </SvgIcon>
  );
};

const SideMenu = () => {
  const [openTesting, setOpenTesting] = useState(false);
  const [openPerformance, setOpenPerformance] = useState(false);

  // Toggle the Testing & Synthetics submenu
  const handleTestingClick = () => {
    setOpenTesting(!openTesting);
  };

  // Toggle the Performance submenu
  const handlePerformanceClick = () => {
    setOpenPerformance(!openPerformance);
  };

  const handleDockMenuClick = () => {
    console.log("Dock menu button clicked!"); 
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          marginTop: 8, 
          height: `calc(100% - ${64}px)`, 
        },
      }}
    >
      <Divider />
      <List>
        {/* Link to Home */}
        <ListItem button component={Link} to="/">
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
          {/* Make the custom icon clickable */}
          <IconButton onClick={handleDockMenuClick} size="small">
            <DockMenuButton sx={{ fontSize: '1.0em' }} /> {/* 40% smaller */}
          </IconButton>
        </ListItem>

        {/* Testing & Synthetics Menu Item */}
        <ListItem button onClick={handleTestingClick}>
          {openTesting ? <ExpandLess /> : <ExpandMore />}
          <ListItemIcon>
            <TestingAndSyntheticsIcon sx={{ fontSize: '1rem' }} />
          </ListItemIcon>
          <ListItemText primary="Testing & Synthetics" />
        </ListItem>
        <Collapse in={openTesting} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button onClick={handlePerformanceClick}>
              <ListItemIcon>
                {openPerformance ? <ExpandLess /> : <ExpandMore />}
              </ListItemIcon>
              <ListItemText primary="Performance" />
            </ListItem>
            <Collapse in={openPerformance} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem button component={Link} to="/projects">
                  <ListItemText inset primary="Projects" />
                </ListItem>
                {/* Add more submenu items under Performance here */}
              </List>
            </Collapse>
            {/* Add more submenu items under Testing & Synthetics here */}
            <ListItem button component={Link} to="/synthetics">
              <ListItemText inset primary="Synthetics" />
            </ListItem>
          </List>
        </Collapse>

        {/* ... other main menu items */}
      </List>
    </Drawer>
  );
};

export default SideMenu;
