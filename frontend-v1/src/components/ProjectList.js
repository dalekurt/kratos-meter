import { Box, Button, Container, Grid, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProjects } from '../services/projectService';
import ProjectCard from './ProjectCard';

function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(''); // Define the error state
  const navigate = useNavigate();

  useEffect(() => {
    const getProjects = async () => {
      try {
        const response = await fetchProjects();
        setProjects(response.data); // Assuming the response data is the array of projects
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setError('Failed to fetch projects'); // Set error message in state
      }
    };
    getProjects();
  }, [setError]);

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Projects</Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/create-project')}>
          Create New Project
        </Button>
      </Box>
      {error && <Typography color="error">{error}</Typography>}
      <Grid container spacing={2} justifyContent="center">
        {projects.map((project) => (
          <Grid item key={project.id} xs={12} sm={6} lg={4}>

            <ProjectCard project={project} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default ProjectList;
