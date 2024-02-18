// src/components/JobForm.js
import { Alert, Button, Container, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createJob } from '../services/jobService';

function JobForm() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState({
    projectId: projectId,
    name: '',
    description: '',
    filename: '',
    gitRepo: '',
    gitBranch: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJob(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('Submitting job:', job);
    try {
      const response = await createJob(job);
      console.log('Job creation response:', response);
      
      // The response structure includes a nested job object
      // Adjust the code to match the response structure
      const newJobId = response.data.jobID; // Use the correct key from the response

      if (newJobId) {
        navigate(`/jobs/${newJobId}`);
      } else {
        console.error('Job ID not found in response', response);
        setError('Failed to get new job ID. Please try again.');
      }
    } catch (err) {
      console.error('Failed to create job:', err);
      setError('Failed to create job. Please try again.');
    }
  };


  return (
    <Container maxWidth="sm">
      <Typography variant="h4">Create New Job for Project {projectId}</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          name="name"
          value={job.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="Description"
          name="description"
          value={job.description}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="Filename"
          name="filename"
          value={job.filename}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="Git Repo"
          name="gitRepo"
          value={job.gitRepo}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="Git Branch"
          name="gitBranch"
          value={job.gitBranch}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <Button type="submit" variant="contained" color="primary" style={{ marginTop: '20px' }}>
          Submit
        </Button>
      </form>
    </Container>
  );
}

export default JobForm;
