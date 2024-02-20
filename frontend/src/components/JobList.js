// JobList.js
import { Box, Container, Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { fetchJobs } from '../services/jobService'; // Update this path as necessary
import JobCard from './JobCard'; // Make sure to create this component

function JobList() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const getJobs = async () => {
      try {
        const response = await fetchJobs();
        setJobs(response.data);
      } catch (error) {
        setError('Failed to fetch jobs');
      }
    };
    getJobs();
  }, []);

  return (
    <Container>
      {/* Add header, search bar, etc. here */}
      <Grid container spacing={2}>
        {jobs.map((job) => (
          <Grid item key={job.id} xs={12} sm={4} lg={4}>
            <JobCard job={job} />
          </Grid>
        ))}
      </Grid>
      {error && <Box color="error.main">{error}</Box>}
    </Container>
  );
}

export default JobList;
