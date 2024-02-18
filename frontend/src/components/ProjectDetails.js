import { Box, Button, Card, CardContent, Container, Grid, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchJobsByProjectId, fetchProjectById } from '../services/projectService';

function ProjectDetails() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [loadingJobs, setLoadingJobs] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getProject = async () => {
      try {
        const response = await fetchProjectById(projectId);
        setProject(response.data);
      } catch (err) {
        console.error("Failed to fetch project details:", err);
        setError('Failed to fetch project details');
      }
    };
    getProject();
  }, [projectId]);

  useEffect(() => {
    const getJobs = async () => {
      setLoadingJobs(true);
      try {
        const response = await fetchJobsByProjectId(projectId);
        setJobs(response.data);
      } catch (err) {
        console.error("Failed to fetch jobs for project:", err);
        setError('Failed to fetch jobs for this project');
      } finally {
        setLoadingJobs(false);
      }
    };
    getJobs();
  }, [projectId]);

  const handleViewJobDetails = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleCreateJob = () => {
    navigate(`/projects/${projectId}/create-job`);
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
        <Typography variant="h4">{project.projectName}</Typography>
        <Button variant="contained" color="primary" onClick={handleCreateJob}>
          Create New Job
        </Button>
      </Box>
      <Typography variant="body2">{project.projectId}</Typography>
      <Typography variant="body1">{project.description}</Typography>
      <Typography variant="body1">{project.maxDurationPerTest}</Typography>
      <Typography variant="body1">{project.maxVUPerTest}</Typography>

      {loadingJobs ? (
        <Typography>Loading jobs...</Typography>
      ) : (
        <Grid container spacing={2}>
          {jobs.length ? jobs.map((job) => (
            <Grid item key={job.id} xs={12} md={6} lg={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5">{job.name}</Typography>
                  <Typography variant="body1">{job.description}</Typography>
                  <Button 
                    size="small" 
                    variant="contained" 
                    onClick={() => handleViewJobDetails(job.id)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )) : (
            <Typography>No jobs found for this project.</Typography>
          )}
        </Grid>
      )}
    </Container>
  );
}

export default ProjectDetails;
