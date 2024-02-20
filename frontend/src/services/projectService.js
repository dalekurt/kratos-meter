// src/services/projectService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

export const fetchProjects = async () => {
    return axios.get(`${API_BASE_URL}/projects`);
  };
  
export const createProject = async (projectData) => {
  return axios.post(`${API_BASE_URL}/projects`, projectData);
};

export const fetchProjectById = async (projectId) => {
  return axios.get(`${API_BASE_URL}/projects/${projectId}`);
};

export const fetchJobsByProjectId = async (projectId) => {
  return axios.get(`${API_BASE_URL}/projects/${projectId}/jobs`);
};

export const startJob = async (jobId) => {
  return axios.post(`${API_BASE_URL}/start/${jobId}`);
};
