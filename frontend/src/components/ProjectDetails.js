// src/components/ProjectDetails.js
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Container, Grid, IconButton, Snackbar, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchJobsByProjectId, fetchProjectById, startJob } from '../services/projectService';
import JobCard from './JobCard';

function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const getProjectDetails = async () => {
      try {
        const response = await fetchProjectById(projectId);
        setProject(response.data);
      } catch (err) {
        setError('Failed to fetch project details');
      }
    };
    getProjectDetails();
  }, [projectId]);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoadingJobs(true);
      try {
        const response = await fetchJobsByProjectId(projectId);
        setJobs(response.data || []);
      } catch (err) {
        setError('Failed to fetch jobs for this project');
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, [projectId]);

  const handleViewDetails = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleCreateJob = () => {
    navigate(`/projects/${projectId}/create-job`);
  };

  const handleRunJob = async (jobId) => {
    try {
      await startJob(jobId);
      setSnackbarMessage('Job started successfully');
    } catch (error) {
      setSnackbarMessage('Failed to start job');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  if (error) {
    return <Container><Typography color="error">{error}</Typography></Container>;
  }

  if (!project) {
    return <Container><Typography>Loading project details...</Typography></Container>;
  }

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        {project && (
          <Typography variant="h4">{project.name}</Typography>
        )}
        <Button variant="contained" color="primary" onClick={handleCreateJob}>
          Create New Job
        </Button>
      </Box>
      <Typography variant="body1">{project.description}</Typography>
      
      {loadingJobs ? (
        <Typography>Loading jobs...</Typography>
      ) : (
        <Grid container spacing={2}>
          {jobs.length > 0 ? jobs.map((job) => (
            <Grid item key={job.id} xs={12} md={4} lg={4}>
              {/* Use the JobCard component here */}
              <JobCard 
                job={job} 
                onRunJob={() => handleRunJob(job.id)} // Pass the handleRunJob function
              />
            </Grid>
          )) : <Typography>No jobs found for this project.</Typography>}
        </Grid>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={handleSnackbarClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Container>
  );
}

export default ProjectDetails;
