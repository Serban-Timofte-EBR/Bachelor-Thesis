// redux/slices/doctorSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Thunk to fetch doctor profile from the API
export const fetchDoctorProfile = createAsyncThunk(
  "doctor/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("http://localhost/doctor/api/doctor", {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

export const updateDoctorProfile = createAsyncThunk(
  "doctor/updateProfile",
  async (updatedData, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        "http://localhost/doctor/api/doctor/update",
        updatedData, 
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

const doctorSlice = createSlice({
  name: "doctor",
  initialState: {
    profile: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchDoctorProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load doctor profile";
      })
      .addCase(updateDoctorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDoctorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateDoctorProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update doctor profile";
      });
  },
});

export default doctorSlice.reducer;
