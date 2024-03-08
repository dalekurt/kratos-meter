import FileCopyIcon from '@mui/icons-material/ContentCopy';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, Card, CardContent, IconButton, Tooltip, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

function ProjectCard({ project }) {
    const navigate = useNavigate();

    const handleProjectClick = () => {
        navigate(`/projects/${project.projectId}`);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(project.projectId)
            .then(() => {
                // Provide feedback to the user here, like a snackbar message
                console.log('Project ID copied to clipboard');
            })
            .catch(err => {
                console.error('Could not copy Project ID:', err);
            });
    };

    if (!project) {
        return <Typography>Loading project details...</Typography>;
    }

    return (
        <Card raised elevation={0} sx={{ width: '100%', bgcolor: 'grey.200', m: 2 }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between">
                    <Typography 
                        gutterBottom 
                        variant="h5" 
                        component="div" 
                        onClick={handleProjectClick} 
                        style={{ cursor: 'pointer' }}
                    >
                        {project.projectName}
                    </Typography>
                    <SettingsIcon color="action" />
                </Box>
                
                {/* Project ID with Copy to Clipboard Button */}
                <Box display="flex" alignItems="center" mt={1}>
                    <Typography variant="subtitle2" mr={1}>
                        Project ID: {project.projectId}
                    </Typography>
                    <Tooltip title="Copy to Clipboard">
                        <IconButton onClick={copyToClipboard} size="small">
                            <FileCopyIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
                
                {/* Display the most recent run (assuming it's a property of the project object) */}
                <Typography variant="body2" mt={2}>
                    Most Recent Run: {project.mostRecentRun || 'N/A'}
                </Typography>
            </CardContent>
        </Card>
    );
}

export default ProjectCard;
