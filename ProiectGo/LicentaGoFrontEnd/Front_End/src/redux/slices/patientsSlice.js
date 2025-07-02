import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch patients by doctor
export const fetchPatientsOfDoctor = createAsyncThunk(
    "patients/fetchPatientsOfDoctor",
    async (_, { rejectWithValue }) => {
      try {
        const response = await axios.get(
            "http://localhost/patient/api/patients",
            {
              withCredentials: true,
            }
        );
        return response.data;
      } catch (error) {
        if (!error.response) {
          throw error;
        }
        return rejectWithValue(error.response.data);
      }
    }
);

// Create a new patient
export const createPatient = createAsyncThunk(
    "patients/createPatient",
    async (patientData, { rejectWithValue }) => {
      try {
        const response = await axios.post(
            "http://localhost/patient/api/patient/create",
            patientData,
            { withCredentials: true }
        );
        return response.data;
      } catch (error) {
        // Handle the case where error.response contains backend error message
        if (error.response && error.response.data && error.response.data.error) {
          return rejectWithValue(error.response.data.error); // Pass only the error message
        } else {
          return rejectWithValue('Unknown error occurred while creating patient');
        }
      }
    }
);

// Get a patient by ID
export const getPatient = createAsyncThunk(
    "patients/getPatient",
    async (id, { rejectWithValue }) => {
      try {
        const response = await axios.get(`http://localhost/patient/api/patient/${id}`, {
          withCredentials: true,
        });
        return response.data.patient;
      } catch (error) {
        if (!error.response) {
          throw error;
        }
        return rejectWithValue(error.response.data);
      }
    }
);

// Delete patient by ID
export const deletePatient = createAsyncThunk(
    "patients/deletePatient",
    async (id, { rejectWithValue }) => {
      try {
        const response = await axios.delete(
            `http://localhost/patient/api/patient/delete/${id}`,
            {
              withCredentials: true,
            }
        );
        return response.data;
      } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
          return rejectWithValue(error.response.data.error);
        } else {
          return rejectWithValue('Unknown error occurred while deleting patient');
        }
      }
    }
);

// Update a patient by ID
export const updatePatient = createAsyncThunk(
    "patients/updatePatient",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axios.put(
                `http://localhost/patient/api/patient/update/${id}`,
                data,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data || "Failed to update patient");
        }
    }
);

const patientsSlice = createSlice({
  name: "patients",
  initialState: {
    patients: [],
    patient: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
        .addCase(fetchPatientsOfDoctor.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchPatientsOfDoctor.fulfilled, (state, action) => {
          state.patients = action.payload; // Set patients to the array received
          state.loading = false;
        })
        .addCase(fetchPatientsOfDoctor.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || "Failed to fetch patients.";
        })
        .addCase(createPatient.pending, (state) => {
          state.loading = true;
        })
        .addCase(createPatient.fulfilled, (state) => {
          state.loading = false;
        })
        .addCase(createPatient.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || "Failed to create patient.";
        })
        .addCase(getPatient.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(getPatient.fulfilled, (state, action) => {
          state.patient = action.payload; // Set patient data to the state
          state.loading = false;
        })
        .addCase(getPatient.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || "Failed to fetch patient.";
        })
        .addCase(deletePatient.pending, (state) => {
          state.loading = true;
        })
        .addCase(deletePatient.fulfilled, (state, action) => {
          state.loading = false;
          state.patients = state.patients.filter((patientWrapper) => patientWrapper.patient.id_patient !== action.meta.arg); // Remove the deleted patient from the list
        })
        .addCase(deletePatient.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || "Failed to delete patient.";
        })
        .addCase(updatePatient.pending, (state) => {
            state.loading = true;
        })
        .addCase(updatePatient.fulfilled, (state) => {
            state.loading = false;
        })
        .addCase(updatePatient.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to update patient";
        });
  },
});

export default patientsSlice.reducer;