import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_V1_URL } from "../../../constant/API";

// Async thunk to fetch user profile
export const fetchUserProfile = createAsyncThunk(
  "user/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {

      const token = await SecureStore.getItemAsync("token");
      const parseToken = JSON.parse(token);
      if (!parseToken) throw new Error("Token not found");
      
      // console.log("i am authenticated", parseToken)
      // Make API request
      const response = await axios.get(`${API_V1_URL}/api/v1/my-profile`, {
        headers: {
          Authorization: `Bearer ${parseToken}`,
        },
      });
      // console.log("User fetched successfully:", response.data.user);
      return response.data.user;
    } catch (error) {
      console.error("Error fetching profile:", error.message);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch profile");
    }
  }
);

// Initial state
const initialState = {
  user: null,
  loading: false,
  error: null,
};

// Slice for user profile
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserData: (state) => {
      console.log("I am clearing user data")
      state.user = null;
      state.error = null; // Optionally clear the error as well
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export the action to clear user data
export const { clearUserData } = userSlice.actions;

export default userSlice.reducer;
