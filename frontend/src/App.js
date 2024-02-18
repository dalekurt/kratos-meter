// src/App.js
import { Box, CssBaseline, ThemeProvider, Toolbar } from '@mui/material';
import React, { useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AppBar from './components/AppBar';
import Drawer from './components/Drawer';
import JobDetails from './components/JobDetails';
import JobForm from './components/JobForm';
import ProjectDetails from './components/ProjectDetails';
import ProjectList from './components/ProjectList';
import { darkTheme, lightTheme } from './theme';

function App() {
  const [themeMode, setThemeMode] = useState('light');
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const theme = themeMode === 'light' ? lightTheme : darkTheme;

  const toggleThemeMode = () => setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar toggleThemeMode={toggleThemeMode} isDrawerOpen={isDrawerOpen} handleDrawerOpen={handleDrawerOpen} />
        <Drawer isDrawerOpen={isDrawerOpen} handleDrawerClose={handleDrawerClose} />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar /> {/* This adds necessary spacing at the top */}
          <Routes>
            <Route path="/" element={<ProjectList />} />
            <Route path="/projects/:projectId" element={<ProjectDetails />} />
            <Route path="/projects/:projectId/create-job" element={<JobForm />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
\        </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
