// src/App.js
import { Box, CssBaseline, ThemeProvider, Toolbar } from '@mui/material'; // Import Box and Toolbar here
import React, { useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AppBar from './components/AppBar'; // Make sure this is your custom AppBar
import JobDetails from './components/JobDetails';
import JobForm from './components/JobForm';
import JobList from './components/JobList';
import ProjectDetails from './components/ProjectDetails';
import ProjectForm from './components/ProjectForm';
import ProjectList from './components/ProjectList';
import SideMenu from './components/SideMenu';
import { darkTheme, lightTheme } from './theme';

// Define the width of the drawer
const drawerWidth = 240;

function App() {
  const [themeMode, setThemeMode] = useState('light');

  // Function to toggle the theme mode
  const toggleThemeMode = () => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };
  // Apply the selected theme
  const theme = themeMode === 'light' ? lightTheme : darkTheme;

  const handleDrawerToggle = () => {
    // Logic to handle the drawer toggle for responsive behavior
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
      
        <Box sx={{ display: 'flex', height: '100vh' }}>
        <AppBar handleDrawerToggle={handleDrawerToggle} toggleThemeMode={toggleThemeMode} isDarkMode={themeMode === 'dark'}  />
          <Box
            component="nav"
            sx={{
              width: { sm: drawerWidth },
              flexShrink: { sm: 0 },
              [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
            }}
          >
            <SideMenu />
          </Box>
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Toolbar /> {/* This adds top padding equivalent to the AppBar's height */}
            <Routes>
              <Route path="/" element={<ProjectList />} />
              <Route path="/projects" element={<ProjectList />} />
              <Route path="/create-project" element={<ProjectForm />} />
              <Route path="/projects/:projectId" element={<ProjectDetails />} />
              <Route path="/projects/:projectId/jobs" element={<JobList />} />
              <Route path="/projects/:projectId/create-job" element={<JobForm />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              {/* ... other routes */}
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
