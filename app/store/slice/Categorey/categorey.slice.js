import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_V1_URL } from "../../../constant/API";


// Fetch all categories
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_V1_URL}/api/v1/get-Category`); 
      return response.data.data;
    } catch (error) {
      console.log(error);
      if (error.response) {
        return rejectWithValue(error?.response?.data || "No response from server");
      } else if (error.request) {
        return rejectWithValue("No response from server");
      } else {
        return rejectWithValue(error?.message || "No response from server");
      }
    }
  }
);


export const fetchCategoriesById = createAsyncThunk(
  "categories/fetchCategoriesById",
  async (requestId, { rejectWithValue }) => {
    console.log("comm id: " + requestId);
    try {
      const response = await axios.get(`${API_V1_URL}/api/v1/get-Category?categoryId=${requestId}`);
      return response?.data?.data[0]; 
    } catch (error) {
      console.log(error);
      if (error.response) {
        return rejectWithValue(error.response.data);
      } else if (error.request) {
        return rejectWithValue("No response from server");
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

const initialState = {
  categories: [],
  categoriesById:{},
  loading: false,
  error: null,
};

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch categories by ID
      .addCase(fetchCategoriesById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoriesById.fulfilled, (state, action) => {
        state.loading = false;
        state.categoriesById = action.payload;
      })
      .addCase(fetchCategoriesById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default categoriesSlice.reducer;
