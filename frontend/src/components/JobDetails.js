// src/components/JobDetails.js
import { Alert, Box, CircularProgress, Container, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchJobById } from '../services/jobService';

function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const getJob = async () => {
      setError(''); // Reset previous errors
      setIsLoading(true); // Start loading
      try {
        const response = await fetchJobById(id);
        setJob(response.data);
      } catch (err) {
        setError('Failed to fetch job details. Please try again.');
      } finally {
        setIsLoading(false); // End loading
      }
    };

    getJob();
  }, [id]);

  return (
    <Container>
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : job ? (
        <>
          <Typography variant="h4" gutterBottom>
            Job Details
          </Typography>
          <Typography variant="body1"><strong>Name:</strong> {job.name}</Typography>
          <Typography variant="body1"><strong>Description:</strong> {job.description}</Typography>
          <Typography variant="body1"><strong>Filename:</strong> {job.filename}</Typography>
          <Typography variant="body1"><strong>Git Repo:</strong> {job.gitRepo}</Typography>
          <Typography variant="body1"><strong>Git Branch:</strong> {job.gitBranch}</Typography>
          {/* Display more job details if available */}
        </>
      ) : (
        <Typography variant="h6">Job not found or does not exist.</Typography>
      )}
    </Container>
  );
}

export default JobDetails;
