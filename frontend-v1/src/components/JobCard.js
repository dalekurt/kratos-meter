// src/components/JobCard.js
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Button, Card, CardActions, CardContent, Link, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, Cell, ResponsiveContainer } from 'recharts';

function JobCard({ job, onRunJob }) {
  const navigate = useNavigate();

  // Generate placeholder data with 20 items and random opacities
  const data = Array.from({ length: 20 }, (_, index) => ({
    value: Math.round(Math.random() * 100),
    opacity: Math.random() * 0.5 + 0.5, // Ensures opacity is between 0.5 and 1
  }));

  return (
    <Card sx={{ width: '100%', boxShadow: 'none', bgcolor: 'grey.200' }}>
      <CardContent>
        <Typography gutterBottom variant="h6" component="div">
          <Link onClick={() => navigate(`/jobs/${job.id}`)} color="inherit">
            {job.name}
          </Link>
        </Typography>
        <Typography variant="body1">{job.description}</Typography>
        <ResponsiveContainer width="100%" height={100} style={{ backgroundColor: '#e0e0e0' }}>
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Bar dataKey="value" fill="#8884d8">
              {
                // Map through each bar and apply a random opacity
                data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`rgba(92, 92, 92, ${entry.opacity})`} />
                ))
              }
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
      <CardActions>
        <Button size="small" variant="contained" onClick={onRunJob} startIcon={<PlayArrowIcon />}>
          Run Job
        </Button>
      </CardActions>
    </Card>
  );
}

export default JobCard;
