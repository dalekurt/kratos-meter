// src/components/JobList.js
import { Button, Container, Link, List, ListItem, ListItemText, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { fetchJobsByProjectId } from '../services/jobService';

function JobList() {
  const { projectId } = useParams(); // Use useParams to access the projectId from the URL
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const getJobs = async () => {
      try {
        const response = await fetchJobsByProjectId(projectId); // Assume this is a new function to fetch jobs by projectId
        setJobs(response.data);
      } catch (error) {
        setError('Failed to fetch jobs');
      }
    };

    getJobs();
  }, [projectId]); // Add projectId as a dependency to refetch when it changes

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString(); // Formats date and time according to user's locale
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Job List for Project {projectId}
      </Typography>
      <Button
        component={RouterLink}
        to={`/projects/${projectId}/create-job`} // Update this link to navigate to the job creation form for the current project
        variant="contained"
        color="primary"
        sx={{ mb: 2 }}
      >
        Create New Test
      </Button>
      {error && <Typography color="error">{error}</Typography>}
      <List>
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <ListItem key={job.id} divider>
              <ListItemText
                primary={job.name}
                secondary={`Created on: ${formatDateTime(job.createdAt)}`}
              />
              <Link component={RouterLink} to={`/jobs/${job.id}`}>
                View Details
              </Link>
            </ListItem>
          ))
        ) : (
          !error && <Typography variant="subtitle1">No jobs found</Typography>
        )}
      </List>
    </Container>
  );
}

export default JobList;
