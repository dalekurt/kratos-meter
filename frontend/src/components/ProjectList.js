import { Button, Card, CardContent, Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProjects } from '../services/projectService';

function ProjectList() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getProjects = async () => {
      try {
        const response = await fetchProjects();
        setProjects(response.data); // Assuming the response data is the array of projects
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        // You can set an error state here and display an error message if needed
      }
    };
    getProjects();
  }, []);

  return (
    <div>
      <Button variant="contained" color="primary" onClick={() => navigate('/create-project')} style={{ marginBottom: '20px' }}>
        Create New Project
      </Button>
      <Grid container spacing={2}>
      {projects.map((project) => (
        <Grid item key={project.id} xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              {/* Project details */}
              <Button size="small" onClick={() => navigate(`/projects/${project.projectId}`)}>View Details</Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
      </Grid>
    </div>
  );
}

export default ProjectList;
