// src/services/jobService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

export const createJob = async (jobData) => {
  return axios.post(`${API_BASE_URL}/jobs`, jobData);
};

export const fetchJobs = async () => {
  return axios.get(`${API_BASE_URL}/jobs`);
};

export const fetchJobById = async (id) => {
  return axios.get(`${API_BASE_URL}/jobs/${id}`);
};

export const fetchJobsByProjectId = async (projectId) => {
  return axios.get(`${API_BASE_URL}/projects/${projectId}/jobs`);
};

export const startJob = async (jobId) => {
  return axios.post(`${API_BASE_URL}/start/${jobId}`);
};

export const fetchJobLogs = async (jobId) => {
  return axios.get(`${API_BASE_URL}/logs/${jobId}`);
};
