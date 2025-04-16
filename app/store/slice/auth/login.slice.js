import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import * as SecureStore from "expo-secure-store"; // Import Expo Secure Store
import { resetStore } from "../../store"; // Import the reset action
import { API_V1_URL } from "../../../constant/API";

// 192.168.1.15
const initialState = {
    loading: false,
    isLogin: false,
    message: '',
    user: null,
    error: null,
    token: null,
    expireTime: null,
};

// Helper functions for Secure Store
export const saveToSecureStore = async (key, value) => {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
};

export const getFromSecureStore = async (key) => {
    return await SecureStore.getItemAsync(key);
};

export const deleteFromSecureStore = async (key) => {
    await SecureStore.deleteItemAsync(key);
};

// AsyncThunk for login
export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async ({ mobile }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_V1_URL}/api/v1/user-login`, { mobile });
            const { token, otp, login } = response.data;
            await saveToSecureStore("token", token);
            await saveToSecureStore("otp", otp);
            await saveToSecureStore("isVerify", 'false');
            await saveToSecureStore("login", login);

            return response.data;
        } catch (error) {
            console.log("error response: ", error.response?.data?.message || "Login failed"); // Logs the error message
            return rejectWithValue(error.response?.data || "Login failed");
        }

    }
);


export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, { dispatch }) => {

    await deleteFromSecureStore("token");
    await deleteFromSecureStore("expireTime");
    await deleteFromSecureStore("isSkip");
    await deleteFromSecureStore("user");
    dispatch(resetStore());
});

// Slice for login/logout
const loginSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // This will reset the state when called
        resetStore: () => initialState,
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                console.log("response: x", action.payload)

                state.loading = false;
                state.isLogin = true;
                state.user = action.payload.login;
                state.token = action.payload.token;
                state.expireTime = action.payload.expiresIn;
            })
            .addCase(loginUser.rejected, (state, action) => {
                console.log("action", action.payload)
                state.loading = false;
                state.error = action.payload;
            });

        builder
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.isLogin = false;
                state.user = null;
                state.token = null;
                state.expireTime = null;
            });
    },
});


export const { resetStore: resetState } = loginSlice.actions;

export default loginSlice.reducer;
