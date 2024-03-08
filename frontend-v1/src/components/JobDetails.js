// src/components/JobDetails.js

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fetchJobById, fetchJobLogs, startJob } from '../services/jobService';
import { fetchProjectById } from '../services/projectService';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Alert, Box, Button, CircularProgress, Container, IconButton, Paper, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material';

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [metricsData, setMetricsData] = useState([]);

  const getJobAndProject = async () => {
    setIsLoading(true);
    try {
      const jobResponse = await fetchJobById(id);
      setJob(jobResponse.data);
      const projectResponse = await fetchProjectById(jobResponse.data.projectId); // Assuming job data contains projectId
      setProject(projectResponse.data);
      const logsResponse = await fetchJobLogs(id);
      setLogs(logsResponse.data);
    } catch (err) {
      setError('Failed to fetch job details, project details, or logs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getMetricsData = async () => {
      // Ensure this is replaced with an actual call to your Prometheus instance
      // and that you handle the response correctly.
      // Dummy URL and response handling is used here for illustration purposes
      try {
        const response = await fetch(`http://localhost:9090/api/v1/query?query=rate(your_metric{testid="${job?.id}"}[5m])`);
        const data = await response.json();
        setMetricsData(data.data.result.map(d => ({
          timestamp: d.metric.time, // Replace with your actual timestamp field
          value: d.value // Replace with your actual value field
        })));
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
        // Handle error accordingly
        setError('Failed to fetch metrics data');
      }
    };

    if (job?.testid) {
      getMetricsData();
    }
  }, [job?.testid]);

    

  useEffect(() => {
    getJobAndProject();
  }, [id]);

  const handleRunJob = async () => {
    try {
      await startJob(id);
      setSnackbar({ open: true, message: 'Job started successfully' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to start job' });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setSnackbar({ open: true, message: 'Project ID copied to clipboard!' });
    });
  };

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        {!isLoading && project ? (
          <>
            <Box>
              <Typography variant="h5">Project: {project.name}</Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <Typography variant="body2" mr={1}>Project ID: {project.id}</Typography>
                <IconButton size="small" onClick={() => copyToClipboard(project.id)}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            <Button variant="contained" color="primary" onClick={handleRunJob} startIcon={<PlayArrowIcon />}>
              Run Job
            </Button>
            </>
        ) : (
          isLoading ? <CircularProgress /> : <Typography color="error">{error}</Typography>
        )}
      </Box>
      {isLoading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Box mb={3}>
            <Typography variant="h6">Job: {job?.name}</Typography>
            <Typography variant="body1"><strong>Description:</strong> {job?.description}</Typography>
            <Typography variant="body1"><strong>Filename:</strong> {job?.filename}</Typography>
            <Typography variant="body1"><strong>Git Repo:</strong> {job?.gitRepo}</Typography>
            <Typography variant="body1"><strong>Git Branch:</strong> {job?.gitBranch}</Typography>
          </Box>
          <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metricsData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
          <Typography variant="h6" gutterBottom>Job Logs</Typography>
          {/* Job Logs Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Message</TableCell>
                </TableRow>
              </TableHead>
              
              <TableBody>
                {logs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{log.status}</TableCell>
                    <TableCell>{log.timestamp}</TableCell>
                    <TableCell>{log.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={logs.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </>
      )}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={error ? "error" : "success"} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default JobDetails;
