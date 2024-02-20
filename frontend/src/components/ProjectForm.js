// src/components/ProjectForm.js
import { Alert, Button, Container, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../services/projectService';

function ProjectForm() {
  const navigate = useNavigate();
  const [project, setProject] = useState({
    name: '',
    description: '',
    maxVUPerTest: '',
    maxDurationPerTest: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Log the state to ensure it contains the data
    console.log('Submitting project:', project);

    // Prepare the data to send
    const dataToSend = {
      name: project.name,
      description: project.description,
      maxVUPerTest: parseInt(project.maxVUPerTest, 10),
      maxDurationPerTest: project.maxDurationPerTest
    };

    console.log('Sending data:', dataToSend);

    try {
      const response = await createProject(dataToSend);
      console.log('Project creation response:', response);

      const newProjectId = response.data.projectId;

      if (newProjectId) {
        navigate(`/projects/${newProjectId}`);
      } else {
        console.error('Project ID not found in response', response);
        setError('Failed to get new project ID. Please try again.');
      }
    } catch (err) {
      console.error('Failed to create project:', err);
      setError('Failed to create project. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>Create Project</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          name="name"
          value={project.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Description"
          name="description"
          value={project.description}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Max Virtual Users Per Test"
          name="maxVUPerTest"
          value={project.maxVUPerTest}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          type="number"
        />
        <TextField
          label="Max Duration Per Test"
          name="maxDurationPerTest"
          value={project.maxDurationPerTest}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          type="text"
        />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Create
        </Button>
      </form>
    </Container>
  );
}

export default ProjectForm;
