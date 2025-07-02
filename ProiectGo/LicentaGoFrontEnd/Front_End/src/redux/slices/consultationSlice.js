import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchLastConsultation = createAsyncThunk(
  "consultation/fetchLast",
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost/consultation/api/${id}/get-last`,
        {
          withCredentials: true,
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const createConsultation = createAsyncThunk(
  "consultation/create",
  async ({ formData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost/consultation/api/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchAllConsultations = createAsyncThunk(
  "consultation/fetchAll",
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost/consultation/api/${patientId}/get-all`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const consultationSlice = createSlice({
  name: "consultation",
  initialState: {
    loading: false,
    consultationData: null, // To store last consultation data
    consultations: [], // To store all consultations data
    successMessage: "",
    errorMessage: "",
  },
  reducers: {
    resetState: (state) => {
      state.loading = false;
      state.successMessage = "";
      state.errorMessage = "";
      state.consultationData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle creating consultation
      .addCase(createConsultation.pending, (state) => {
        state.loading = true;
        state.successMessage = "";
        state.errorMessage = "";
      })
      .addCase(createConsultation.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Consultation created successfully!";
      })
      .addCase(createConsultation.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload || "Failed to create consultation.";
      })

      // Handle fetching last consultation
      .addCase(fetchLastConsultation.pending, (state) => {
        state.loading = true;
        state.errorMessage = "";
      })
      .addCase(fetchLastConsultation.fulfilled, (state, action) => {
        state.loading = false;
        state.consultationData = action.payload;
      })
      .addCase(fetchLastConsultation.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload || "Failed to fetch consultation.";
      })

      // Handle fetching all consultations
      .addCase(fetchAllConsultations.pending, (state) => {
        state.loading = true;
        state.errorMessage = "";
      })
      .addCase(fetchAllConsultations.fulfilled, (state, action) => {
        state.loading = false;
        state.consultations = action.payload;
      })
      .addCase(fetchAllConsultations.rejected, (state, action) => {
        state.loading = false;
        state.errorMessage = action.payload || "Failed to fetch consultations.";
      });
  },
});

export const { resetState } = consultationSlice.actions;
export default consultationSlice.reducer;
