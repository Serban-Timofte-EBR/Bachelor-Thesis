import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const registerUser = createAsyncThunk(
  "register/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost/auth/register",
        userData
      );
      return response.data;
    } catch (err) {
      // Return custom error message from backend if present
      if (err.response && err.response.data && err.response.data.error) {
        return rejectWithValue(err.response.data.error);
      } else {
        return rejectWithValue("An error occurred during registration.");
      }
    }
  }
);

const registerSlice = createSlice({
  name: "register",
  initialState: {
    loading: false,
    success: false,
    error: null,
  },
  reducers: {
    resetRegisterState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Registration failed.";
      });
  },
});

export const { resetRegisterState } = registerSlice.actions;
export default registerSlice.reducer;
