// src/features/jobs/jobSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as jobService from '../../services/jobService';

// Async thunk for fetching jobs
export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async () => {
  const response = await jobService.fetchJobs();
  return response.data;
});

const jobSlice = createSlice({
  name: 'jobs',
  initialState: {
    items: [],
    status: 'idle', // 'idle', 'loading', 'succeeded', 'failed'
    error: null,
  },
  reducers: {
    // Define reducers if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default jobSlice.reducer;
