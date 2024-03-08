// src/components/JobForm.js
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Alert, Button, Container, FormControlLabel, IconButton, Switch, TextField, Typography } from '@mui/material';
import React, { useRef, useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import { useNavigate, useParams } from 'react-router-dom';
import { createJob } from '../services/jobService';

function JobForm() {
  const { projectId } = useParams();
  const { projectName } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState({
    projectId: projectId,
    projectName: projectName,
    name: '',
    description: '',
    filename: '',
    gitRepo: '',
    gitBranch: '',
    script: '',
  });
  const [error, setError] = useState('');
  const [isCode, setIsCode] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJob({ ...job, [name]: value });
  };

  const handleEditorChange = (newValue) => {
    setJob({ ...job, script: newValue });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Trigger any feedback to user here
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Adjust job data format if necessary before sending
      const response = await createJob(job);
      navigate(`/jobs/${response.data.jobId}`);
    } catch (err) {
      setError('Failed to create job. Please try again.');
    }
  };

  const handleModeChange = (event) => {
    setIsCode(event.target.checked);
  };

  // Reference to store the Monaco Editor instance
  const editorRef = useRef(null);

  const editorContainerStyle = {
    position: 'relative', // Make sure the container is positioned relatively
    zIndex: 0, // Monaco Editor should have a lower z-index
    padding: '30px', // Add padding to ensure content does not touch the edges
    // Any other styles you want to apply to the container
  };

  // Function to handle the copy action
  const handleCopyCode = () => {
    const editor = editorRef.current.editor;
    navigator.clipboard.writeText(editor.getValue());
    // You can also display a message to the user indicating that the code was copied
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4">New Job</Typography>
      <Typography variant="subtitle2" gutterBottom>
        Project Name: {projectName}
      </Typography>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <Typography variant="subtitle2">
          Project ID: {projectId}
        </Typography>
        <IconButton size="small" onClick={() => copyToClipboard(projectId)}>
          <ContentCopyIcon fontSize="small" />
        </IconButton>
      </div>
      {error && <Alert severity="error">{error}</Alert>}
      <FormControlLabel
        control={<Switch checked={isCode} onChange={handleModeChange} />}
        label="Code Mode"
      />
      <form onSubmit={handleSubmit}>
        <TextField label="Name" name="name" value={job.name} onChange={handleChange} fullWidth margin="normal" required />
        <TextField label="Description" name="description" value={job.description} onChange={handleChange} fullWidth margin="normal" required />
        
        {isCode ? (
          <div style={{ position: 'relative', marginTop: '20px' }}>
          <MonacoEditor
            width="100%"
            height="400"
            language="javascript"
            theme="vs-dark"
            value={job.script}
            onChange={handleEditorChange}
            options={{ roundedSelection: false, scrollBeyondLastLine: false, readOnly: false }}
          />
        </div>
        ) : (
          <>
            <TextField label="Filename" name="filename" value={job.filename} onChange={handleChange} fullWidth margin="normal" />
            <TextField label="Git Repo" name="gitRepo" value={job.gitRepo} onChange={handleChange} fullWidth margin="normal" />
            <TextField label="Git Branch" name="gitBranch" value={job.gitBranch} onChange={handleChange} fullWidth margin="normal" />
          </>
        )}
        <Button type="submit" variant="contained" color="primary" style={{ marginTop: '20px' }}>
          Submit
        </Button>
      </form>
    </Container>
  );
}

export default JobForm;
