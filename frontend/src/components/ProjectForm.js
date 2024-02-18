// src/components/ProjectForm.js

import { Alert, Button, Container, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { createProject } from '../services/projectService';

function ProjectForm() {
  const [project, setProject] = useState({
    name: '',
    description: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProject(project);
      setProject({ name: '', description: '' }); // Reset form
      // Redirect or show success message
    } catch (err) {
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
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Create
        </Button>
      </form>
    </Container>
  );
}

export default ProjectForm;
